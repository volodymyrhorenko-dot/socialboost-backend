import { Controller, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyBonus } from './daily-bonus.entity';

@Controller('points')
export class PointsController {
  constructor(
    private usersService: UsersService,
    private transactionsService: TransactionsService,
    @InjectRepository(DailyBonus)
    private dailyBonusRepo: Repository<DailyBonus>,
  ) {}

  @Post('claim-daily')
  @UseGuards(JwtAuthGuard)
  async claimDaily(@Request() req) {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.dailyBonusRepo.findOne({ where: { userId, date: today } });
    if (existing) throw new BadRequestException('Щоденний бонус вже отримано сьогодні');

    await this.dailyBonusRepo.save(this.dailyBonusRepo.create({ userId, date: today, type: 'daily' }));

    const points = 100;
    const user = await this.usersService.updatePoints(userId, points);
    await this.transactionsService.create({
      userId,
      type: TransactionType.BONUS,
      amount: points,
      description: 'Щоденний бонус',
      balanceAfter: user.pointBalance,
    });

    return { success: true, points, balanceAfter: user.pointBalance };
  }

  @Post('watch-ad')
  @UseGuards(JwtAuthGuard)
  async watchAd(@Request() req) {
    const userId = req.user.id;
    const now = new Date();
    const key = `ad_${userId}`;

    const existing = await this.dailyBonusRepo.findOne({
      where: { userId, type: 'ad' },
      order: { createdAt: 'DESC' },
    });

    if (existing) {
      const lastWatched = new Date(existing.createdAt);
      const diffMinutes = (now.getTime() - lastWatched.getTime()) / 1000 / 60;
      if (diffMinutes < 30) {
        throw new BadRequestException(`Реклама доступна через ${Math.ceil(30 - diffMinutes)} хв`);
      }
    }

    await this.dailyBonusRepo.save(this.dailyBonusRepo.create({ userId, date: now.toISOString().split('T')[0], type: 'ad' }));

    const points = 50;
    const user = await this.usersService.updatePoints(userId, points);
    await this.transactionsService.create({
      userId,
      type: TransactionType.BONUS,
      amount: points,
      description: 'Перегляд реклами',
      balanceAfter: user.pointBalance,
    });

    return { success: true, points, balanceAfter: user.pointBalance };
  }
}