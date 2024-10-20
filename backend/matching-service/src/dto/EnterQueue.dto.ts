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
  Algorithm = 'Algorithm',
  DynamicProgramming = 'DynamicProgramming',
  Array = 'Array',
  SQL = 'SQL',
  Heap = 'Heap',
  Recursion = 'Recursion',
  Graph = 'Graph',
  Sorting = 'Sorting',
}

enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

enum Language {
  C = 'C',
  CSharp = 'C#',
  CPlusPlus = 'C++',
  Go = 'Go',
  Java = 'Java',
  JavaScript = 'JavaScript',
  Kotlin = 'Kotlin',
  Python = 'Python',
  Rust = 'Rust',
  TypeScript = 'TypeScript',
}

export class EnterQueueDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsEnum(Category, {
    message:
      'Category must be Algorithm, DynamicProgramming, Array, SQL, Heap, Recursion, Graph, Sorting',
  })
  categories: Category;

  @IsNotEmpty()
  @IsEnum(Difficulty, {
    message: 'Difficulty must be Easy, Medium, Hard',
  })
  complexity: Difficulty;

  @IsNotEmpty()
  @IsEnum(Language, {
    message:
      'Language must C, C#, C++, Go, Java, JavaScript, Kotlin, Python, Rust, TypeScript.',
  })
  language: Language;
}
