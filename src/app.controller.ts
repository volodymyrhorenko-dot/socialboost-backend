import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
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

  @Get('app/*')
  appStatic(@Param('0') filePath: string, @Res() res: Response) {
    const fullPath = path.join(process.cwd(), 'public', 'app', filePath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      res.sendFile(fullPath);
    } else {
      this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
    }
  }
}