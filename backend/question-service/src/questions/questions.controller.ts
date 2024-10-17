import mongoose from 'mongoose';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from '../dto/CreateQuestion.dto';
import { UpdateQuestionDto } from '../dto/UpdateQuestion.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  createQuestion(@Body() CreateQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(CreateQuestionDto);
  }

  @Get()
  getQuestions() {
    return this.questionsService.getQuestions();
  }

  @Get(':id')
  async getQuestionsById(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Question not found', 404);
    const findQuestion = await this.questionsService.getQuestionsById(id);
    if (!findQuestion) throw new HttpException('Question not found', 404);
    return findQuestion;
  }

  @Patch(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() UpdateQuestionDto: UpdateQuestionDto,
  ) {
    // NEED TO CHANGE THIS, PREVIOUSLY ID IS THE AUTOMATICALLY GENERATED ID BY MONGODB, NOW IT IS SPECIFIED BY USER
    //
    // const isValid = mongoose.Types.ObjectId.isValid(id);
    // if (!isValid) throw new HttpException('Invalid ID', 400);
    const updateQuestion = await this.questionsService.updateQuestion(
      id,
      UpdateQuestionDto,
    );
    if (!updateQuestion) throw new HttpException('Question Not Found', 404);
    return updateQuestion;
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    // NEED TO CHANGE THIS, PREVIOUSLY ID IS THE AUTOMATICALLY GENERATED ID BY MONGODB, NOW IT IS SPECIFIED BY USER
    //
    // const isValid = mongoose.Types.ObjectId.isValid(id);
    // if (!isValid) throw new HttpException('Invalid ID', 400);

    const deletedUser = await this.questionsService.deleteQuestion(id);
    if (!deletedUser) throw new HttpException('Question not Found', 404);
    return;
  }
}
