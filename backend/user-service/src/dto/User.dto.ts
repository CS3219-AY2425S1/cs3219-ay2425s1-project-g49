import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

export class UserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  avatarUrl: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsArray()
  questions?: QuestionDto[];
}
