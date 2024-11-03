import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private oAuth2Client: OAuth2Client;
  private clientID: string;
  private clientSecret: string;

  constructor(private configService: ConfigService, private jwtService: JwtService, private readonly usersService: UsersService,) {
    this.clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    this.clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    this.oAuth2Client = new OAuth2Client(this.clientID, this.clientSecret, 'http://localhost:3000');

  }

  async verifyJWTToken(jwtToken: string) {
    const loginTicket = await this.oAuth2Client.verifyIdToken({
      idToken: jwtToken,
      audience: this.clientID
    })
    const payload = loginTicket.getPayload();
    return payload

  }

  async handleUserLogin(jwtToken: string) {
    console.log("Handling user login");
    const payload = await this.verifyJWTToken(jwtToken);
    const userData = {
      username: payload['name'],
      email: payload['email'],
      avatarUrl: payload['picture']
    }
    let user = await this.usersService.getUserByEmail(payload['email']);
    if (user) {
      console.log("Existing user");

      const tokenData = { email: user['email'], name: user['username'], avatarUrl: user['avatarUrl'], questions: user['questions'] }
      console.log(tokenData);
      const accessToken = await this.jwtService.signAsync(tokenData, { expiresIn: "2h" });
      return { jwtToken: accessToken };
    } else {
      const user = await this.usersService.createUser(userData);
      const tokenData = { email: payload['email'], name: payload['name'], avatarUrl: payload['picture'] }
      const accessToken = await this.jwtService.signAsync(tokenData, { expiresIn: "2h" });
      console.log("User created")
      return { jwtToken: accessToken };
    }
  };

  async updateToken(email: string) {
    let user = await this.usersService.getUserByEmail(email);
    if (user) {
      console.log("Existing user");
      const tokenData = { email: user['email'], name: user['username'], avatarUrl: user['avatarUrl'], questions: user['questions'] }
      console.log(tokenData);
      const accessToken = await this.jwtService.signAsync(tokenData, { expiresIn: "2h" });
      return { jwtToken: accessToken };
    }
  }

}
