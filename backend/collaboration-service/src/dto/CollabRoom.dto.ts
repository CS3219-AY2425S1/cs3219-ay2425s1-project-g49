import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class CollabRoomDto {
  @IsNotEmpty()
  @IsString()
  userEmail: string;

  @IsNotEmpty()
  @IsString()
  matchEmail: string;
}
