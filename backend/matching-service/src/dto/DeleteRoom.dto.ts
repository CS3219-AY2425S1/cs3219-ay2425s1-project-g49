import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class DeleteRoomDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
