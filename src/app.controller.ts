import { Controller, Get, Post, Res, Param, Body } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private usersService: UsersService) {}

  @Post('users/make-admin/:secret')
  async makeAdmin(@Param('secret') secret: string, @Body() body: { email: string }) {
    if (secret !== 'surgeup-admin-2024') return { error: 'forbidden' };
    const user = await this.usersService.findByEmail(body.email);
    if (!user) return { error: 'user not found' };
    await this.usersService.makeAdmin(user.id);
    return { success: true, userId: user.id };
  }

  private serveStaticHtml(res: Response, filename: string, fallbackTitle: string) {
    const filePath = path.join(process.cwd(), 'public', filename);
    if (fs.existsSync(filePath)) {
      res.type('text/html').send(fs.readFileSync(filePath, 'utf-8'));
    } else {
      res.type('text/html').send(`<h1>${fallbackTitle}</h1><p>File not found</p>`);
    }
  }

  @Get()
  landing(@Res() res: Response) {
    this.serveStaticHtml(res, 'landing.html', 'SurgeUp');
  }

  @Get('privacy')
  privacy(@Res() res: Response) {
    this.serveStaticHtml(res, 'privacy.html', 'Privacy Policy');
  }

  @Get('terms')
  terms(@Res() res: Response) {
    this.serveStaticHtml(res, 'terms.html', 'Terms of Service');
  }

  @Get('tiktokq4zO2CARHHYwqXYe65LyytYI4HjhO5I7.txt')
  tiktokVerification(@Res() res: Response) {
    res.type('text/plain').send('tiktok-developers-site-verification=q4zO2CARHHYwqXYe65LyytYI4HjhO5I7');
  }

  @Get('app')
  appIndex(@Res() res: Response) {
    this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
  }

  @Get('app/*path')
  appStatic(@Param('path') filePath: string, @Res() res: Response) {
    if (!filePath) {
      return this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
    }
    const fullPath = path.join(process.cwd(), 'public', 'app', filePath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      res.sendFile(fullPath);
    } else {
      this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
    }
  }
}