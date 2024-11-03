import { IsArray, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, isString, IsString } from 'class-validator';


export class QuestionDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  solution: string;

  @IsNotEmpty()
  @IsString()
  time: string;

}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  questions?: QuestionDto[];
}
