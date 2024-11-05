import {
  IsNotEmpty,
  IsEnum,
  isNotEmpty,
  IsNumber,
  IsArray,
  isString,
  IsString,
} from 'class-validator';

enum Category {
  Algorithm = 'Algoritm',
  DynamicProgramming = 'DynamicProgramming',
  Array = 'Array',
  SQL = 'SQL',
  Heap = 'Heap',
  Recursion = 'Recursion',
  Graph = 'Graph',
  Sorting = 'Sorting',
}

enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export class CollabQuestionDto {
  @IsNotEmpty()
  @IsEnum(Category, {
    message:
      'Category must be Algorithm, DynamicProgramming, Array, SQL, Heap, Recursion, Graph, Sorting',
  })
  categories: Category;

  @IsNotEmpty()
  @IsEnum(Difficulty, {
    message: 'Difficulty must be easy, medium, hard',
  })
  complexity: Difficulty;

  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  solvedQuestionIds: number[];
}
