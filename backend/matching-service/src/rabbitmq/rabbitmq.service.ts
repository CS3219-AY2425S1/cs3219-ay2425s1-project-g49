import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib/callback_api.js';
import { EnterQueueDto } from 'src/dto/EnterQueue.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { DeclineMatchDto } from 'src/dto/DeclineMatch.dto';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly eventEmitter: EventEmitter2) { }
  private readonly matchBuffer: Record<string, any[]> = {};
  private readonly declineBuffer: Record<string, any[]> = {};
  private readonly connectedUsers: Set<string> = new Set();
  private readonly queueName = 'matching_queue';
  private readonly rabbitmqUrl = 'amqp://guest:guest@rabbitmq:5672';
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
        this.connection = connection;
        connection.createChannel((channelErr, channel) => {
          if (channelErr) {
            console.error('Failed to create a channel:', channelErr);
            throw channelErr;
          }
          this.channel = channel;
          channel.assertQueue(
            this.queueName,
            { durable: false },
            (error2, _ok) => {
              if (error2) {
                console.error('Failed to assert queue:', error2);
                return;
              }
              console.log(`Queue ${this.queueName} is ready`);
              resolve();
            },
          );
        });
      });
      console.log('Connected to RabbitMQ');
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

    this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(enterQueueDto)),
    );
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
    // timeoutId
    // this.unmatchedRequests[`${enterQueueDto.categories}-${enterQueueDto.complexity}-${enterQueueDto.language}`] = {
    //   ...enterQueueDto,
    //   timeoutId,
    // };
  }

  consumeQueue() {
    if (this.channel) {
      console.log('Waiting for users in queue...');
      console.log('unmatched request is', this.unmatchedRequests);
      this.channel.consume(this.queueName, (msg) => {
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
  //DEBUG HERE
  private matchUser(userRequest: EnterQueueDto): void {
    // console.log("unmatched request is", this.unmatchedRequests);
    const { email, categories, complexity, language } = userRequest;
    const matchingKey = `${categories}-${complexity}-${language}`;
    if (this.unmatchedRequests[matchingKey]) {
      const matchedUser = this.unmatchedRequests[matchingKey];
      console.log(`Match found between ${email} and ${matchedUser.email}`);
      delete this.unmatchedRequests[matchingKey];
      this.notifyMatchFound(email, matchedUser.email, "Perfect");
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
      this.notifyMatchFound(email, matchedUser.email, "Partial");
    } else {
      this.unmatchedRequests[matchingKey] = userRequest;
      console.log(`No match found for user ${email}, waiting for a match...`);
    }
  }

  notifyMatchFound(userEmail: string, matchEmail: string, matchStatus: string) {
    console.log('connected users are', this.connectedUsers);
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
    const declineData = {
      event: "Decline",
      userEmail: email,
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

      this.eventEmitter.on('match.found', handleMatchFound);
      this.eventEmitter.on('match.declined', handleMatchDeclined);

      return () => {
        this.eventEmitter.off('match.found', handleMatchFound);
        this.eventEmitter.off('match.declined', handleMatchDeclined);
        this.connectedUsers.delete(userEmail);
        // console.log('after cleanup ', this.connectedUsers);
      };
    });
  }
}
