import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  Patch,
  Delete,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/CreateUser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from '../dto/UpdateUser.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    } else {
      console.log("CREATED USER", createUserDto)
      return this.usersService.createUser(createUserDto);
    }
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':email')
  async getUsersByEmail(@Param('email') email: string) {
    const findUser = await this.usersService.getUserByEmail(email);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Patch(':email')
  async updateUser(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updateUser = await this.usersService.updateUsers(email, updateUserDto);
    if (!updateUser) throw new HttpException('User Not Found', 404);
    return updateUser;
  }

  @Delete(':email')
  async deleteUser(@Param('email') email: string) {
    const deletedUser = await this.usersService.deleteUser(email);
    if (!deletedUser) throw new HttpException('User not Found', 404);
    return;
  }
}
