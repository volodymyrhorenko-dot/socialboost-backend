import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @Request() req,
    @Query('unread') unread?: string,
    @Query('types') types?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationsService.findAllForUser(req.user.id, {
      onlyUnread: unread === 'true',
      types: types ? (types.split(',') as NotificationType[]) : undefined,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('unread-count')
  async unreadCount(@Request() req) {
    const count = await this.notificationsService.countUnread(req.user.id);
    return { count };
  }

  @Put('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Delete('all')
  deleteAll(@Request() req) {
    return this.notificationsService.deleteAll(req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.notificationsService.delete(id, req.user.id);
  }
}
