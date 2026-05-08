import { Module } from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import { YouTubeController } from './youtube.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [YouTubeController],
  providers: [YouTubeService],
  exports: [YouTubeService],
})
export class YouTubeModule {}