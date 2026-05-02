import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(@Query('platform') platform?: string, @Query('type') type?: string) {
    await this.tasksService.seed();
    return this.tasksService.findAll(platform, type);
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string, @Request() req) {
    return this.tasksService.complete(id, req.user.id);
  }
}