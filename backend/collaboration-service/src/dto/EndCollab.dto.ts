import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class EndCollabDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
