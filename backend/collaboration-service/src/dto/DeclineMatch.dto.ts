import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class DeclineMatchDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
