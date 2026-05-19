import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { Campaign } from './entities/campaign.entity';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign]), UsersModule, TransactionsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}