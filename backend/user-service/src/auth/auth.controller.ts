import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('/google/callback')
	async handleRedirect(@Req() req: Request, @Res() res: Response) {
		const {token} = req.body
		const tokens = await this.authService.handleUserLogin(token)
		res.json(tokens);
	}
}
