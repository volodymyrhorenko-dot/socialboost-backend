import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body() body: { email: string; displayName?: string; avatarUrl?: string }) {
    return this.authService.googleAuth(body);
  }

  @Post('apple')
  async appleAuth(@Body() body: { email: string; displayName?: string }) {
    return this.authService.appleAuth(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return req.user;
  }
}
