import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { PublicController } from './public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Campaign])],
  controllers: [PublicController],
})
export class PublicModule {}
