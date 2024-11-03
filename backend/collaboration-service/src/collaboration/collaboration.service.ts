import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as amqp from 'amqplib/callback_api.js';
import { ValidateRoomDto } from 'src/dto/ValidateRoom.dto';
import { EndCollabDto } from 'src/dto/EndCollab.dto';
import { CollabRoomDto } from 'src/dto/CollabRoom.dto';


@Injectable()
export class CollaborationService implements OnModuleInit, OnModuleDestroy {
	private readonly collabRooms: Record<string, any[]> = {};
	private readonly userRooms: Record<string, string> = {};
	private readonly rabbitmqUrl = 'amqp://guest:guest@rabbitmq:5672'; // For usage in docker container
	// private readonly rabbitmqUrl = 'amqp://guest:guest@localhost:5672'; // For local usage
	private connection: amqp.Connection;
	private channel: amqp.Channel;

	private readonly matchingExchange = 'matching';

	private readonly matchFoundQueue = 'match_found';
	private readonly matchFoundRoutingKey = this.matchFoundQueue;

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
						channel.assertQueue(this.matchFoundQueue, { durable: false }, (queueErr) => {
							if (queueErr) {
								console.error('Failed to assert queue:', queueErr);
								return;
							}

							channel.bindQueue(this.matchFoundQueue, this.matchingExchange, this.matchFoundRoutingKey, {}, (bindErr) => {
								if (bindErr) {
									console.error('Failed to bind queue to exchange:', bindErr);
									return;
								}

								console.log(`Queue ${this.matchFoundQueue} is bound to exchange ${this.matchingExchange} with routing key ${this.matchFoundRoutingKey}`);
								resolve();
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

	consumeQueue() {
		if (this.channel) {
			console.log('Waiting for users in queue...');
			this.channel.consume(this.matchFoundQueue, (msg) => {
				console.log('parsed to', JSON.parse(msg.content.toString()));
				if (msg !== null) {
					const { userEmail, matchEmail } = JSON.parse(msg.content.toString());
					this.channel.ack(msg);
					this.generateCollabRoom(userEmail, matchEmail)
				} else {
					console.log('Received a null user, skipping.');
				}
			});
		} else {
			console.error('Cannot consume messages, channel not initialized');
		}
	}


	handleEndCollab(endCollabDto: EndCollabDto) {
		const { email, roomId } = endCollabDto;
		if (this.userRooms[email]) {
			delete this.userRooms[email];
		}

		if (this.collabRooms[roomId]) {
			const users = this.collabRooms[roomId];
			const userA = users[0];
			const userB = users[1];
			if (!this.userRooms[userA] && !this.userRooms[userB]) {
				delete this.collabRooms[roomId];
				console.log("Room deleted");
				return true;
			}
		}
	}

	handleValidateRoom(validateRoomDto: ValidateRoomDto): boolean {
		const { email, roomId } = validateRoomDto;
		if (!this.userRooms[email]) {
			return false
		} else {
			return this.userRooms[email] === roomId;
		}
	}

	getCollabRoom(collabRoomDto: CollabRoomDto): string {
		const { userEmail, matchEmail } = collabRoomDto;
		const roomID_user = this.userRooms[userEmail];
		const roomID_match = this.userRooms[matchEmail];
		if (roomID_user === roomID_match) {
			return roomID_user;
		}
	}

	generateCollabRoom(userEmail: string, matchEmail: string) {
		const existingRoomId = this.userRooms[userEmail];
		const matchUserRoomId = this.userRooms[matchEmail];

		if (!existingRoomId && !matchUserRoomId) {
			const roomID = uuidv4();
			this.collabRooms[roomID] = [userEmail, matchEmail];
			this.userRooms[userEmail] = roomID;
			this.userRooms[matchEmail] = roomID;
		}
	}
}
