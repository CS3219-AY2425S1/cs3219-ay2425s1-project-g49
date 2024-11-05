import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as amqp from 'amqplib/callback_api.js';
import { ValidateRoomDto } from 'src/dto/ValidateRoom.dto';
import { EndCollabDto } from 'src/dto/EndCollab.dto';
import { CollabRoomDto } from 'src/dto/CollabRoom.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from 'src/schemas/Question.schema';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.Schema';
import { SolutionDto } from 'src/dto/UpdateUser.dto';




@Injectable()
export class CollaborationService implements OnModuleInit, OnModuleDestroy {
	constructor(@InjectModel(Question.name) private questionModel: Model<Question>, @InjectModel(User.name) private userModel: Model<User>) { }
	private readonly collabRooms: Record<string, any[]> = {};
	private readonly userRooms: Record<string, string> = {};
	private readonly rabbitmqUrl = 'amqp://guest:guest@rabbitmq:5672'; // For usage in docker container
	// private readonly rabbitmqUrl = 'amqp://guest:guest@localhost:5672'; // For local usage
	private connection: amqp.Connection;
	private channel: amqp.Channel;

	private readonly matchingExchange = 'matching';

	private readonly matchFoundQueue = 'match_found';
	private readonly matchFoundRoutingKey = this.matchFoundQueue;

	private readonly matchDeclinedQueue = 'match_declined';
	private readonly matchDeclinedRoutingKey = this.matchDeclinedQueue;

	private readonly collabQuestions: Record<string, any> = {};
	private roomLocks: Set<string> = new Set();


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

							channel.assertQueue(this.matchDeclinedQueue, { durable: false }, (queueErr) => {
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
					const { userEmail, matchEmail, categories, complexity, userSolvedQns, matchSolvedQns } = JSON.parse(msg.content.toString());
					this.channel.ack(msg);
					this.generateCollabRoom(userEmail, matchEmail, categories, complexity, userSolvedQns, matchSolvedQns);

				} else {
					console.log('Received a null user, skipping.');
				}
			});
			this.channel.consume(this.matchDeclinedQueue, (msg) => {
				console.log('parsed to', JSON.parse(msg.content.toString()));
				if (msg !== null) {
					const { email } = JSON.parse(msg.content.toString());
					this.channel.ack(msg);
					this.cleanupCollabRoom(email);

				} else {
					console.log('Received a null user, skipping.');
				}
			});
		} else {
			console.error('Cannot consume messages, channel not initialized');
		}
	}


	cleanupCollabRoom(email: string) {
		if (this.userRooms[email]) {
			const roomId = this.userRooms[email];
			const [userEmail, matchEmail] = this.collabRooms[roomId];
			if (this.userRooms[userEmail]) {
				delete this.userRooms[userEmail]
			}
			if (this.userRooms[matchEmail]) {
				delete this.userRooms[matchEmail]
			}
			if (this.collabQuestions[roomId]) {
				delete this.collabQuestions[roomId]
			}
			if (this.collabRooms[roomId]) {
				delete this.collabRooms[roomId]
			}

			console.log("cleanup collab room successful")
			console.log(this.userRooms)
			console.log(this.collabRooms)
			console.log(this.collabQuestions)
		}
	}

	async handleEndCollab(endCollabDto: EndCollabDto) {
		const { email, roomId, solution } = endCollabDto;
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
				if (this.collabQuestions[roomId]) {
					delete this.collabQuestions[roomId]
				}
			}
		}
		await this.updateUserSolution(email, solution);
		return true;
	}

	async updateUserSolution(email: string, solutionDto: SolutionDto) {
		console.log("Updating user now")
		console.log(email)
		const user = await this.userModel.findOne({ email }).exec();
		console.log(user);
		console.log(solutionDto);
		const newUser = await this.userModel.findOneAndUpdate(
			{ email },
			{
				$addToSet: { questions: solutionDto },
			},
			{ new: true }
		).exec();
		console.log(newUser, "UPdated")
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

	async generateCollabRoom(userEmail: string, matchEmail: string, categories: string, complexity: string, userSolvedQns: number[], matchSolvedQns: number[]) {

		const existingRoomId = this.userRooms[userEmail];
		const matchUserRoomId = this.userRooms[matchEmail];

		if (!existingRoomId && !matchUserRoomId) {
			const roomId = uuidv4();
			this.collabRooms[roomId] = [userEmail, matchEmail];
			this.userRooms[userEmail] = roomId;
			this.userRooms[matchEmail] = roomId;

			const availableQuestions = await this.questionModel.find({
				categories: { $regex: new RegExp(categories, 'i') },
				complexity: complexity,
				id: { $nin: userSolvedQns }
			});
			const selectedQuestion = availableQuestions.length > 0 ? availableQuestions[0] : null;
			// console.log(categories)
			// console.log(complexity)
			// console.log(availableQuestions);
			this.collabQuestions[roomId] = selectedQuestion;
			console.log(this.collabQuestions[roomId]);
		}
	}


	getCollabQuestion(roomId: string) {
		if (this.collabQuestions[roomId]) {
			console.log("success")
			return this.collabQuestions[roomId];
		} else {
			console.log("fail")
			if (this.collabRooms[roomId]) {
				const [userEmail, matchEmail] = this.collabRooms[roomId];
				if (this.userRooms[userEmail]) {
					delete this.userRooms[userEmail]
				}
				if (this.userRooms[matchEmail]) {
					delete this.userRooms[matchEmail]
				}

				delete this.collabRooms[roomId];
				delete this.collabQuestions[roomId];

				console.log("cleanup collab room successful after failure to find a question")
				console.log(this.userRooms)
				console.log(this.collabRooms)
				console.log(this.collabQuestions)
			}
			return null;
		}
	}
}
