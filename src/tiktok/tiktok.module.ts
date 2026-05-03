import { Module } from '@nestjs/common';
import { TikTokService } from './tiktok.service';
import { TikTokController } from './tiktok.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TikTokController],
  providers: [TikTokService],
  exports: [TikTokService],
})
export class TikTokModule {}