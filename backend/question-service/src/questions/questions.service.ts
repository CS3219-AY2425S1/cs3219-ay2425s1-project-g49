import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from '../dto/CreateQuestion.dto';
import { Question } from '../schemas/Question.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateQuestionDto } from '../dto/UpdateQuestion.dto';
import { CollabQuestionDto } from 'src/dto/CollabQuestion.dto';
import { DeleteCollabQnDto } from 'src/dto/DeleteCollabQn.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) { }

  private readonly collabQuestions: Record<string, any> = {};
  private roomLocks: Set<string> = new Set();

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


  async getCollabQuestion(collabQuestionDto: CollabQuestionDto) {
    const { categories, complexity, roomId, solvedQuestionIds } = collabQuestionDto;

    if (this.collabQuestions[roomId]) {
      return this.collabQuestions[roomId];
    }

    if (this.roomLocks.has(roomId)) {
      while (this.roomLocks.has(roomId)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.collabQuestions[roomId];
    }

    this.roomLocks.add(roomId);

    try {
      console.log(categories, complexity, solvedQuestionIds);

      const availableQuestions = await this.questionModel.find({
        categories: { $regex: new RegExp(categories, 'i') },
        complexity: complexity,
        id: { $nin: solvedQuestionIds }
      });

      const selectedQuestion = availableQuestions.length > 0 ? availableQuestions[0] : null;

      if (selectedQuestion) {
        this.collabQuestions[roomId] = selectedQuestion;
      }
      console.log(this.collabQuestions);

      return selectedQuestion;
    } finally {
      this.roomLocks.delete(roomId);
    }
  }

  handleDeleteCollabQn(deleteCollabQnDto: DeleteCollabQnDto) {
    try {
      const { roomId } = deleteCollabQnDto;
      delete this.collabQuestions[roomId];
      return true
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
