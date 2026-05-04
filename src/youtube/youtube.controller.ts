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
        <!DOCTYPE html>
        <html lang="uk">
        <head>
          <meta charset="utf-8">
          <title>YouTube підключено — SurgeUp</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #06060B; color: #F1F0FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
            .card { max-width: 460px; padding: 48px 32px; background: linear-gradient(135deg, rgba(20, 20, 31, 0.9), rgba(11, 11, 18, 0.7)); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 24px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(16, 185, 129, 0.2); }
            .emoji { font-size: 80px; margin-bottom: 16px; animation: bounce 1s ease; }
            @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
            h1 { color: #10B981; font-size: 28px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
            p { color: #9B99BB; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
            .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="emoji">✅</div>
            <h1>YouTube підключено!</h1>
            <p>Поверніться до додатку SurgeUp щоб почати виконувати завдання та просувати свій канал.</p>
            <a href="/" class="btn">На головну SurgeUp</a>
          </div>
        </body>
        </html>
      `);
    } catch (e: any) {
      const errorMsg = e.message || 'Невідома помилка';
      const isConflict = e.status === 409 || errorMsg.includes('вже підключено');
      return res.send(`
        <!DOCTYPE html>
        <html lang="uk">
        <head>
          <meta charset="utf-8">
          <title>Помилка підключення — SurgeUp</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #06060B; color: #F1F0FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
            .card { max-width: 460px; padding: 48px 32px; background: linear-gradient(135deg, rgba(20, 20, 31, 0.9), rgba(11, 11, 18, 0.7)); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 24px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(244, 63, 94, 0.2); }
            .emoji { font-size: 80px; margin-bottom: 16px; }
            h1 { color: #F43F5E; font-size: 26px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
            p { color: #9B99BB; font-size: 15px; line-height: 1.6; margin-bottom: 24px; word-break: break-word; }
            .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="emoji">${isConflict ? '🔒' : '❌'}</div>
            <h1>${isConflict ? 'Канал вже зайнятий' : 'Помилка підключення'}</h1>
            <p>${errorMsg}</p>
            <a href="/" class="btn">На головну SurgeUp</a>
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

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect(@Request() req) {
    return this.youtubeService.disconnect(req.user.id);
  }
}