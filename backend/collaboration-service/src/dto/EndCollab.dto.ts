import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { SolutionDto } from './UpdateUser.dto';


export class EndCollabDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  solution: SolutionDto;
}
