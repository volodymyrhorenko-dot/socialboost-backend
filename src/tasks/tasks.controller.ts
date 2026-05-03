import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(@Request() req, @Query('platform') platform?: string, @Query('type') type?: string) {
    return this.tasksService.findAll(req.user.id, platform, type);
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string, @Request() req) {
    return this.tasksService.complete(id, req.user.id);
  }
}