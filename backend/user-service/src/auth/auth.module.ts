import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'
import { jwtSecretKey } from './constants';
import { UsersModule } from 'src/users/users.module';

// import { GoogleStrategy } from './utils/google.strategy';

@Module({
  imports: [ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        global: true
      }),
      inject: [ConfigService]
    }),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
