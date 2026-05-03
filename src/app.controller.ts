import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  @Get()
  landing(@Res() res: Response) {
    const landingPath = path.join(process.cwd(), 'public', 'landing.html');
    if (fs.existsSync(landingPath)) {
      res.type('text/html').send(fs.readFileSync(landingPath, 'utf-8'));
    } else {
      res.type('text/html').send('<h1>SocialBoost</h1><p>Landing not found</p>');
    }
  }

  @Get('tiktokq4zO2CARHHYwqXYe65LyytYI4HjhO5I7.txt')
  tiktokVerification(@Res() res: Response) {
    res.type('text/plain').send('tiktok-developers-site-verification=q4zO2CARHHYwqXYe65LyytYI4HjhO5I7');
  }

  @Get('terms')
  terms(@Res() res: Response) {
    res.type('text/html').send(`
      <html><head><meta charset="utf-8"><title>Terms of Service</title></head>
      <body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333">
        <h1>Terms of Service</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <h2>1. Acceptance</h2>
        <p>By using SocialBoost, you agree to these terms.</p>
        <h2>2. Service Description</h2>
        <p>SocialBoost is a mutual growth platform where users earn points by completing tasks (subscribing, liking) on TikTok and YouTube, and spend points to promote their own content.</p>
        <h2>3. User Responsibilities</h2>
        <p>You must comply with TikTok and YouTube Terms of Service. You are responsible for content you promote.</p>
        <h2>4. Points System</h2>
        <p>Points have no monetary value and cannot be exchanged for cash.</p>
        <h2>5. Account Termination</h2>
        <p>We reserve the right to terminate accounts that violate these terms.</p>
        <h2>6. Contact</h2>
        <p>For questions: support@socialboost.app</p>
      </body></html>
    `);
  }

  @Get('privacy')
  privacy(@Res() res: Response) {
    res.type('text/html').send(`
      <html><head><meta charset="utf-8"><title>Privacy Policy</title></head>
      <body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333">
        <h1>Privacy Policy</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <h2>1. Information We Collect</h2>
        <p>We collect: email address, display name, YouTube/TikTok account info (when you connect them via OAuth).</p>
        <h2>2. How We Use Information</h2>
        <p>To provide our service: authenticate you, perform actions on your behalf (subscribing, liking with your explicit consent), track your points balance.</p>
        <h2>3. Data Sharing</h2>
        <p>We do not sell your data. We share data only with TikTok/YouTube APIs to perform actions you authorize.</p>
        <h2>4. Data Storage</h2>
        <p>Data is stored securely on Railway PostgreSQL servers. Passwords are hashed with bcrypt.</p>
        <h2>5. Your Rights</h2>
        <p>You can delete your account anytime. You can revoke YouTube/TikTok access via their account settings.</p>
        <h2>6. Contact</h2>
        <p>For privacy concerns: privacy@socialboost.app</p>
      </body></html>
    `);
  }
}