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
	handleDeleteRoom(@Body() endCollabDto: EndCollabDto) {
		console.log("Delete room endpoint reached");
		const status = this.collaborationService.handleEndCollab(endCollabDto);
		return { status: status };
	}
}
