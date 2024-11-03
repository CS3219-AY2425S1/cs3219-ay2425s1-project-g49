import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class DeleteCollabQnDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;
}
