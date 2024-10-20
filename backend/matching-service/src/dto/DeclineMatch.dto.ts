import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';


export class DeclineMatchDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
