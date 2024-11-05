import { Controller, Post, Get, Body, Sse, Param, MessageEvent } from '@nestjs/common';
import { CollabRoomDto } from 'src/dto/CollabRoom.dto';
import { ValidateRoomDto } from 'src/dto/ValidateRoom.dto';
import { CollaborationService } from './collaboration.service';
import { EndCollabDto } from 'src/dto/EndCollab.dto';

@Controller('collab')
export class CollaborationController {
	constructor(private readonly collaborationService: CollaborationService) { }


	@Post('roomId')
	handleGetRoomId(@Body() collabRoomDto: CollabRoomDto) {
		console.log("Get collab room endpoint reached")
		return { room_id: this.collaborationService.getCollabRoom(collabRoomDto) };
	}

	@Post('validate_room')
	handleValidateRoom(@Body() validateRoomDto: ValidateRoomDto) {
		console.log("Validate room endpoint reached");
		const status = this.collaborationService.handleValidateRoom(validateRoomDto);
		return { room_status: status }
	}

	@Post('end_collab')
	async handleEndCollab(@Body() endCollabDto: EndCollabDto) {
		console.log("End collaboration endpoint reached");
		const status = await this.collaborationService.handleEndCollab(endCollabDto);
		return { status: status };
	}

	@Get('collab_qn/:room_id')
	handleGetCollabQn(@Param('room_id') room_id: string) {
		console.log("Get collab qn endpoint reached", room_id);

		const questionData = this.collaborationService.getCollabQuestion(room_id);
		if (questionData != null) {
			console.log(questionData)
			return {
				status: true,
				id: questionData.id,
				title: questionData.title,
				question: questionData.description,
				categories: questionData.categories,
				complexity: questionData.complexity,
			};
		} else {
			return { status: false };
		}
	}
}
