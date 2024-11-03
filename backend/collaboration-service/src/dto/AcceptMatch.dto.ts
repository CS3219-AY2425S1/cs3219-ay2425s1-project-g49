import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class AcceptMatchDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
