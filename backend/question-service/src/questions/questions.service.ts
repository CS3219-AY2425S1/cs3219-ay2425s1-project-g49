import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from '../dto/CreateQuestion.dto';
import { Question } from '../schemas/Question.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateQuestionDto } from '../dto/UpdateQuestion.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async createQuestion(createQuestionDto: CreateQuestionDto) {
    const newQuestion = new this.questionModel(createQuestionDto);
    return newQuestion.save();
  }

  getQuestions() {
    return this.questionModel.find();
  }

  getQuestionsById(id: string) {
    return this.questionModel.findById(id);
  }

  updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto) {
    return this.questionModel
      .findOneAndUpdate({ id: id }, updateQuestionDto, {
        new: true,
      })
      .exec();
  }

  deleteQuestion(id: string) {
    return this.questionModel.deleteOne({ id: id }).exec();
  }
}
