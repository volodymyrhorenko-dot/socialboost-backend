import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import { TikTokService } from './tiktok.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('tiktok')
export class TikTokController {
  constructor(private tiktokService: TikTokService) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  getAuthUrl(@Request() req) {
    return { url: this.tiktokService.getAuthUrl(req.user.id) };
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      await this.tiktokService.handleCallback(code, state);
      return res.send(`
        <html>
          <head><meta charset="utf-8"><title>TikTok підключено</title></head>
          <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
            <div>
              <div style="font-size:64px">✅</div>
              <h1 style="color:#10B981">TikTok підключено!</h1>
              <p style="color:#9B99BB">Поверніться до додатку SurgeUp</p>
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
}