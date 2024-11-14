// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { Profile, Strategy } from "passport-google-oauth20";
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy) {
// 	constructor(private configService: ConfigService) {
// 		super({
// 			clientID: configService.get<String>('GOOGLE_CLIENT_ID'),
// 			clientSecret: configService.get<String>('GOOGLE_CLIENT_SECRET'),
// 			callbackURL: 'http://localhost:3001/auth/google/callback',
// 			scope: ['profile', 'email']
// 		});
// 	}
	
// 	async validate(access_token: string, refresh_token: string, profile: Profile) {
// 		console.log(access_token);
// 		console.log(refresh_token);
// 		console.log(profile);
// 	}

// }