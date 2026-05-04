import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { DailyBonus } from './daily-bonus.entity';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyBonus]),
    UsersModule,
    TransactionsModule,
  ],
  controllers: [PointsController],
})
export class PointsModule {}