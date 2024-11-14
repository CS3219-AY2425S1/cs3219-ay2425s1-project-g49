import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum Category {
  Algorithm = 'Algorithms',
  Strings = 'Strings',
  DataStructures = 'DataStructures',
  BitManipulation = 'BitManipulation',
  Databases = 'Databases',
  Recursion = 'Recursion',
  Arrays = 'Arrays',
  Brainteaser = 'Brainteaser',
}

enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(Category, {
    message:
      'Category must be Algorithm, DynamicProgramming, Array, SQL, Heap, Recursion, Graph, Sorting',
  })

  categories: Category;
  // categories: Category[];


  @IsNotEmpty()
  @IsEnum(Difficulty, {
    message: 'Difficulty must be easy, medium, hard',
  })
  complexity: Difficulty;

  @IsNotEmpty()
  @IsString()
  link: string;
}
