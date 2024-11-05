import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib/callback_api.js';
import { EnterQueueDto } from 'src/dto/EnterQueue.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { DeclineMatchDto } from 'src/dto/DeclineMatch.dto';
import { AcceptMatchDto } from 'src/dto/AcceptMatch.dto';
import { v4 as uuidv4 } from 'uuid';
import { CollabRoomDto } from 'src/dto/CollabRoom.dto';
import { DeleteRoomDto } from 'src/dto/DeleteRoom.dto';
import { ValidateRoomDto } from 'src/dto/ValidateRoom.dto';


@Injectable()
export class MatchingService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly eventEmitter: EventEmitter2) { }
  private readonly matchBuffer: Record<string, any[]> = {};
  private readonly declineBuffer: Record<string, any[]> = {};
  private readonly acceptBuffer: Record<string, any[]> = {};

  private readonly connectedUsers: Set<string> = new Set();

  private readonly matchingQueue = 'matching_queue';
  private readonly matchingExchange = 'matching';
  private readonly matchingRoutingKey = this.matchingQueue;

  private readonly matchFoundQueue = 'match_found';
  private readonly matchFoundRoutingKey = this.matchFoundQueue;

  private readonly matchDeclinedQueue = 'match_declined';
  private readonly matchDeclinedRoutingKey = this.matchDeclinedQueue;

  private readonly rabbitmqUrl = 'amqp://guest:guest@rabbitmq:5672'; // For usage in docker container
  // private readonly rabbitmqUrl = 'amqp://guest:guest@localhost:5672'; // For local usage
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private unmatchedRequests: Record<string, any> = {};
  private timeouts: { [email: string]: NodeJS.Timeout } = {};

  async onModuleInit() {
    await this.connect();
    this.consumeQueue();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      amqp.connect(this.rabbitmqUrl, (err, connection) => {
        if (err) {
          console.error('Failed to connect to RabbitMQ:', err);
          throw err;
        }
        console.log('Connected to RabbitMQ');
        this.connection = connection;

        connection.createChannel((channelErr, channel) => {
          if (channelErr) {
            console.error('Failed to create a channel:', channelErr);
            throw channelErr;
          }
          this.channel = channel;

          channel.assertExchange(this.matchingExchange, 'direct', { durable: false }, (exchangeErr) => {
            if (exchangeErr) {
              console.error('Failed to assert exchange:', exchangeErr);
              return;
            }
            channel.assertQueue(this.matchingQueue, { durable: false }, (queueErr) => {
              if (queueErr) {
                console.error('Failed to assert queue:', queueErr);
                return;
              }

              channel.assertQueue(this.matchFoundQueue, { durable: false }, (queueErr) => {
                if (queueErr) {
                  console.error('Failed to assert queue:', queueErr);
                  return;
                }

                channel.assertQueue(this.matchDeclinedQueue, { durable: false }, (queueErr) => {
                  if (queueErr) {
                    console.error('Failed to assert queue:', queueErr);
                    return;
                  }

                  channel.bindQueue(this.matchingQueue, this.matchingExchange, this.matchingRoutingKey, {}, (bindErr) => {
                    if (bindErr) {
                      console.error('Failed to bind queue to exchange:', bindErr);
                      return;
                    }

                    console.log(`Queue ${this.matchingQueue} is bound to exchange ${this.matchingExchange} with routing key ${this.matchingRoutingKey}`);

                    channel.bindQueue(this.matchFoundQueue, this.matchingExchange, this.matchFoundRoutingKey, {}, (bindErr) => {
                      if (bindErr) {
                        console.error('Failed to bind queue to exchange:', bindErr);
                        return;
                      }
                      console.log(`Queue ${this.matchFoundQueue} is bound to exchange ${this.matchingExchange} with routing key ${this.matchFoundRoutingKey}`);

                      channel.bindQueue(this.matchDeclinedQueue, this.matchingExchange, this.matchDeclinedRoutingKey, {}, (bindErr) => {
                        if (bindErr) {
                          console.error('Failed to bind queue to exchange:', bindErr);
                          return;
                        }
                        console.log(`Queue ${this.matchDeclinedQueue} is bound to exchange ${this.matchingExchange} with routing key ${this.matchDeclinedRoutingKey}`);
                        resolve();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  private async closeConnection() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('RabbitMQ connection closed.');
    } catch (error) {
      console.error('Error in closing RabbitMQ connection:', error);
    }
  }

  enterQueue(enterQueueDto: EnterQueueDto): void {
    const { email } = enterQueueDto;

    this.channel.publish(this.matchingExchange, this.matchingRoutingKey, Buffer.from(JSON.stringify(enterQueueDto)));

    console.log('User sent to queue:', enterQueueDto);

    if (this.timeouts[email]) {
      clearTimeout(this.timeouts[email]);
      console.log(`Old timeout cleared for user ${email}.`);
    }

    const timeoutId = setTimeout(() => {
      const keyToRemove = Object.keys(this.unmatchedRequests).find(
        (key) => this.unmatchedRequests[key].email === email,
      );

      if (keyToRemove) {
        console.log('key to remove is', keyToRemove);
        delete this.unmatchedRequests[keyToRemove];
        console.log(
          `User ${email} removed from queue after 30 seconds of no match.`,
        );

        delete this.timeouts[email]; // Also remove the timeout
        console.log(
          `User ${email} timeout had been cleard after 30 seconds of no match.`,
        );
      }
    }, 30000);

    this.timeouts[email] = timeoutId;
  }


  consumeQueue() {
    if (this.channel) {
      console.log('Waiting for users in queue...');
      console.log('unmatched request is', this.unmatchedRequests);
      this.channel.consume(this.matchingQueue, (msg) => {
        console.log('parsed to', JSON.parse(msg.content.toString()));
        if (msg !== null) {
          const userRequest = JSON.parse(msg.content.toString());
          console.log(`Received match request for user ${userRequest.email}`);
          this.matchUser(userRequest);
          this.channel.ack(msg);
        } else {
          console.log('Received a null user, skipping.');
        }
      });
    } else {
      console.error('Cannot consume messages, channel not initialized');
    }
  }

  private matchUser(userRequest: EnterQueueDto): void {
    const { email, categories, complexity, language, solvedQuestionIds } = userRequest;
    const matchingKey = `${categories}-${complexity}-${language}`;
    if (this.unmatchedRequests[matchingKey]) {
      const matchedUser = this.unmatchedRequests[matchingKey];
      console.log(`Match found between ${email} and ${matchedUser.email}`);
      delete this.unmatchedRequests[matchingKey];
      this.notifyMatchFound(email, matchedUser.email, categories, complexity, solvedQuestionIds, matchedUser.solvedQuestionIds, "Perfect");
    } else if (
      Object.values(this.unmatchedRequests).find(
        (req) => req.categories === categories,
      )
    ) {
      const matchedUser = Object.values(this.unmatchedRequests).find(
        (req) => req.categories === categories,
      );
      console.log(
        `Partial match found between ${email} and ${matchedUser.email} based on categories.`,
      );
      const partialMatchingKey = `${matchedUser.categories}-${matchedUser.complexity}-${matchedUser.language}`;
      delete this.unmatchedRequests[partialMatchingKey];
      this.notifyMatchFound(email, matchedUser.email, categories, complexity, solvedQuestionIds, matchedUser.solvedQuestionIds, "Partial");
    } else {
      this.unmatchedRequests[matchingKey] = userRequest;
      console.log(`No match found for user ${email}, waiting for a match...`);
    }
  }


  async removeUserFromQueue(userEmail: string): Promise<boolean> {
    const matchingKey = Object.keys(this.unmatchedRequests).find((key) => {
      const req = this.unmatchedRequests[key];
      return req.email === userEmail;
    });
    if (matchingKey) {
      console.log(`Removing unmatched request for user: ${userEmail}`);
      delete this.unmatchedRequests[matchingKey];
      if (this.timeouts[userEmail]) {
        clearTimeout(this.timeouts[userEmail]);
        delete this.timeouts[userEmail];
        console.log(`Cleared timeout for user: ${userEmail}`);
      }
      return true;
    }
    console.log(`No unmatched request found for user: ${userEmail}`);
    return false;
  }

  notifyMatchFound(userEmail: string, matchEmail: string, categories: string, complexity: string, userSolvedQns: number[], matchSolvedQns: number[], matchStatus: string,) {
    console.log('connected users are', this.connectedUsers);
    this.channel.publish(this.matchingExchange, this.matchFoundRoutingKey, Buffer.from(JSON.stringify({
      userEmail: userEmail,
      matchEmail: matchEmail,
      categories: categories,
      complexity: complexity,
      userSolvedQns: userSolvedQns,
      matchSolvedQns: matchSolvedQns
    })));

    const time = new Date().toISOString();
    const userData = {
      event: "Match",
      userEmail: userEmail,
      matchEmail: matchEmail,
      timestamp: time,
      matchStatus: matchStatus,
    };

    const matchData = {
      event: "Match",
      userEmail: matchEmail,
      matchEmail: userEmail,
      timestamp: time,
      matchStatus: matchStatus,
    };

    if (this.connectedUsers.has(userData.userEmail)) {
      this.eventEmitter.emit('match.found', userData);
    } else {
      if (!this.matchBuffer[userData.userEmail]) {
        this.matchBuffer[userData.userEmail] = []; // Create an array if it doesn't exist
      }
      this.matchBuffer[userData.userEmail].push(userData);
    }

    if (this.connectedUsers.has(matchData.userEmail)) {
      this.eventEmitter.emit('match.found', matchData);
    } else {
      if (!this.matchBuffer[matchData.userEmail]) {
        this.matchBuffer[matchData.userEmail] = []; // Create an array if it doesn't exist
      }
      this.matchBuffer[matchData.userEmail].push(matchData);
    }
  }

  handleMatchDecline(declineMatchDto: DeclineMatchDto) {
    const { email } = declineMatchDto;
    this.channel.publish(this.matchingExchange, this.matchDeclinedRoutingKey, Buffer.from(JSON.stringify({
      email: email,
    })));
    const declineData = {
      event: "Decline",
      userEmail: email,   // Email address to send decline event to
    }
    if (this.connectedUsers.has(email)) {
      console.log(email, " for match declined")
      this.eventEmitter.emit('match.declined', declineData);
    } else {
      if (!this.declineBuffer[email]) {
        this.declineBuffer[email] = []; // Create an array if it doesn't exist
      }
      this.declineBuffer[email].push(declineData);
    }
  }

  handleMatchAccept(acceptMatchDto: AcceptMatchDto) {
    const { email } = acceptMatchDto;
    const acceptData = {
      event: "Accept",
      userEmail: email,   // Email address to send decline event to
    }
    if (this.connectedUsers.has(email)) {
      console.log(email, " for match accepted")
      this.eventEmitter.emit('match.accepted', acceptData);
    } else {
      if (!this.acceptBuffer[email]) {
        this.acceptBuffer[email] = []; // Create an array if it doesn't exist
      }
      this.acceptBuffer[email].push(acceptData);
    }
  }

  createSSEStream(userEmail: string): Observable<any> {
    return new Observable((subscriber) => {
      this.connectedUsers.add(userEmail);
      // console.log(this.connectedUsers);

      if (this.declineBuffer[userEmail]) {
        console.log(
          'Notifying buffered declined match for ',
          userEmail,
          ':',
          this.declineBuffer[userEmail],
        );
        this.declineBuffer[userEmail].forEach((data) => {
          subscriber.next(JSON.stringify(data)); // Notify each buffered event
        });
        delete this.declineBuffer[userEmail];
      }

      if (this.acceptBuffer[userEmail]) {
        console.log(
          'Notifying buffered accepted match for ',
          userEmail,
          ':',
          this.acceptBuffer[userEmail],
        );
        this.acceptBuffer[userEmail].forEach((data) => {
          subscriber.next(JSON.stringify(data)); // Notify each buffered event
        });
        delete this.acceptBuffer[userEmail];
      }

      if (this.matchBuffer[userEmail]) {
        console.log(
          'Notifying buffered events for ',
          userEmail,
          ':',
          this.matchBuffer[userEmail],
        );
        this.matchBuffer[userEmail].forEach((data) => {
          subscriber.next(JSON.stringify(data)); // Notify each buffered event
        });
        delete this.matchBuffer[userEmail];
      }

      const handleMatchFound = (data) => {
        subscriber.next(JSON.stringify(data));
        console.log('Notifying match found', data);
      };

      const handleMatchDeclined = (data) => {
        if (userEmail === data.userEmail) {
          subscriber.next(JSON.stringify(data));
          console.log('Notifying match declined to ', userEmail, data);
        }
      };

      const handleMatchAccepted = (data) => {
        if (userEmail === data.userEmail) {
          subscriber.next(JSON.stringify(data));
          console.log('Notifying match accepted to ', userEmail, data);
        }
      };

      this.eventEmitter.on('match.found', handleMatchFound);
      this.eventEmitter.on('match.declined', handleMatchDeclined);
      this.eventEmitter.on('match.accepted', handleMatchAccepted);

      return () => {
        this.eventEmitter.off('match.found', handleMatchFound);
        this.eventEmitter.off('match.declined', handleMatchDeclined);
        this.eventEmitter.off('match.accepted', handleMatchAccepted);
        this.connectedUsers.delete(userEmail);
        // console.log('after cleanup ', this.connectedUsers);
      };
    });
  }
}
