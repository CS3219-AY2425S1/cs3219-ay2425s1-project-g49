import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  avatarUrl: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  questions?: string;
}
