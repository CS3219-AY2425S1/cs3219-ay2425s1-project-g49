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
      console.log("DUPLICATE USER IGNORED");
      // if (user == userData) {
      //   console.log("DUPLICATE USER IGNORED");
      // } else {
      //   const newUser = await this.usersService.updateUsers(userData.email, userData);
      // }
    } else {
      const user = await this.usersService.createUser(userData);
      console.log("User created")
    }

    const tokenData = { sub: payload['sub'], email: payload['email'], name: payload['name'], avatarUrl: payload['picture'] }
    const accessToken = await this.jwtService.signAsync(tokenData, { expiresIn: "2h" });
    // console.log("THIS IS THE TOKEN ", accessToken);
    return {jwtToken: accessToken};
  };

}
