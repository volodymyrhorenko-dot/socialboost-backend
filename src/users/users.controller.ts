import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req) {
    const user = req.user;
    console.log('getMe response:', JSON.stringify({
      isVip: user.isVip,
      vipExpiresAt: user.vipExpiresAt,
      vipStartedAt: user.vipStartedAt,
    }));
    return user;
  }

  @Get('me/stats')
  getStats(@Request() req) {
    return this.usersService.getStats(req.user.id);
  }

  @Patch('me/social')
  linkSocial(
    @Request() req,
    @Body() body: { platform: 'tiktok' | 'youtube'; url: string; handle: string },
  ) {
    return this.usersService.linkSocial(req.user.id, body.platform, body.url, body.handle);
  }
}