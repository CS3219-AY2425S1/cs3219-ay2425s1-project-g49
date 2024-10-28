import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class DeleteRoomDto {
  @IsNotEmpty()
  @IsString()
  emailA: string;

  @IsNotEmpty()
  @IsString()
  emailB: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
