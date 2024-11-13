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
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/CreateUser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from '../dto/UpdateUser.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

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

  @Get('/update_token/:email')
  async updateToken(@Param('email') email: string) {
    console.log("update token endpoint reached")
    const newToken = await this.usersService.updateToken(email);
    return newToken;
  }

  @Patch(':email')
  async updateUser(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const adminSecretKey = req.headers['admin-secret-key']
    console.log("user update endpoint reached", updateUserDto)
    const updatedUser = await this.usersService.updateUsers(email, updateUserDto, adminSecretKey);
    if (!updatedUser) throw new HttpException('User not Found', 404);
    return updatedUser;
  }

  @Delete(':email')
  async deleteUser(@Param('email') email: string) {
    const deletedUser = await this.usersService.deleteUser(email);
    if (!deletedUser) throw new HttpException('User not Found', 404);
    return;
  }
}
