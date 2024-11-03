import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.Schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService,) { }

  async createUser(createUserDto: CreateUserDto) {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  getUsers() {
    return this.userModel.find();
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUsers(email: string, updateUserDto: UpdateUserDto) {
    const newUser = await this.userModel.findOneAndUpdate(
      { email },
      {
        $addToSet: { questions: { $each: updateUserDto.questions } },
      },
      { new: true }
    ).exec();
    const tokenData = { email: newUser['email'], name: newUser['username'], avatarUrl: newUser['avatarUrl'], questions: newUser['questions'] }
    console.log(tokenData);
    const accessToken = await this.jwtService.signAsync(tokenData, { expiresIn: "2h" });
    return { jwtToken: accessToken };
  }

  async deleteUser(email: string) {
    return this.userModel.findOneAndDelete({ email }).exec();
  }
}
