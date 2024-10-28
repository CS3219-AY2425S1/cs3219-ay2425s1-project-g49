import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class ValidateRoomDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
