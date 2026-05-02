import { Controller, Post, Get, Body, Query, UseGuards, Request, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Body() body: { packageId: string }, @Request() req) {
    return this.paymentsService.createCheckoutSession(req.user.id, body.packageId);
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }

  @Get('success')
  async success(@Query('session_id') sessionId: string, @Res() res: Response) {
    await this.paymentsService.handleSuccess(sessionId);
    return res.send(`
      <html>
        <head><meta charset="utf-8"><title>Оплата успішна</title></head>
        <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
          <div>
            <div style="font-size:64px">🎉</div>
            <h1 style="color:#10B981">Оплата успішна!</h1>
            <p style="color:#9B99BB">Бали зараховано на ваш рахунок</p>
            <p style="color:#5B5980;font-size:13px">Поверніться до додатку SocialBoost</p>
          </div>
        </body>
      </html>
    `);
  }

  @Get('cancel')
  async cancel(@Res() res: Response) {
    return res.send(`
      <html>
        <head><meta charset="utf-8"><title>Оплата скасована</title></head>
        <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
          <div>
            <div style="font-size:64px">❌</div>
            <h1 style="color:#F43F5E">Оплату скасовано</h1>
            <p style="color:#9B99BB">Повертайтесь до додатку</p>
          </div>
        </body>
      </html>
    `);
  }
}