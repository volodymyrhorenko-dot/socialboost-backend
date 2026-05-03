import { Controller, Get, Post, Query, Body, UseGuards, Request, Res } from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('youtube')
export class YouTubeController {
  constructor(private youtubeService: YouTubeService) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  getAuthUrl(@Request() req) {
    return { url: this.youtubeService.getAuthUrl(req.user.id) };
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      await this.youtubeService.handleCallback(code, state);
      return res.send(`
        <html>
          <head><meta charset="utf-8"><title>YouTube підключено</title></head>
          <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
            <div>
              <div style="font-size:64px">✅</div>
              <h1 style="color:#10B981">YouTube підключено!</h1>
              <p style="color:#9B99BB">Поверніться до додатку SocialBoost</p>
            </div>
          </body>
        </html>
      `);
    } catch (e: any) {
      return res.send(`
        <html>
          <head><meta charset="utf-8"><title>Помилка</title></head>
          <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
            <div>
              <div style="font-size:64px">❌</div>
              <h1 style="color:#F43F5E">Помилка підключення</h1>
              <p style="color:#9B99BB">${e.message}</p>
            </div>
          </body>
        </html>
      `);
    }
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Body() body: { channelUrl: string }, @Request() req) {
    return this.youtubeService.subscribe(req.user.id, body.channelUrl);
  }

  @Post('like')
  @UseGuards(JwtAuthGuard)
  async like(@Body() body: { videoUrl: string }, @Request() req) {
    return this.youtubeService.like(req.user.id, body.videoUrl);
  }

  @Post('comment')
  @UseGuards(JwtAuthGuard)
  async comment(@Body() body: { videoUrl: string; commentText: string }, @Request() req) {
    return this.youtubeService.comment(req.user.id, body.videoUrl, body.commentText);
  }
}