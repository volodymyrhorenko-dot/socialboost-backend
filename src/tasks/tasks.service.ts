import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPlatform, TaskType } from './entities/task.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private usersService: UsersService,
  ) {}

  async findAll(platform?: string, type?: string): Promise<Task[]> {
    const query = this.taskRepo.createQueryBuilder('task')
      .where('task.isActive = :isActive', { isActive: true });
    if (platform) query.andWhere('task.platform = :platform', { platform });
    if (type) query.andWhere('task.type = :type', { type });
    return query.orderBy('task.createdAt', 'DESC').getMany();
  }

  async complete(taskId: string, userId: string): Promise<{ points: number }> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    // Нараховуємо бали користувачу
    await this.usersService.updatePoints(userId, task.pointsReward);
    // Оновлюємо статистику
    await this.usersService.incrementTasksCompleted(userId);
    return { points: task.pointsReward };
  }

  async seed(): Promise<void> {
    const count = await this.taskRepo.count();
    if (count > 0) return;
    const tasks = [
      { platform: TaskPlatform.TIKTOK, type: TaskType.SUBSCRIBE, targetUrl: 'https://tiktok.com/@dance_ua', targetChannel: '@dance_ua', pointsReward: 15, timeRequiredSeconds: 0 },
      { platform: TaskPlatform.YOUTUBE, type: TaskType.LIKE, targetUrl: 'https://youtube.com/@techreview', targetChannel: 'TechReview UA', pointsReward: 10, timeRequiredSeconds: 0 },
      { platform: TaskPlatform.TIKTOK, type: TaskType.WATCH, targetUrl: 'https://tiktok.com/@comedy_club', targetChannel: '@comedy_club', pointsReward: 8, timeRequiredSeconds: 30 },
      { platform: TaskPlatform.YOUTUBE, type: TaskType.SUBSCRIBE, targetUrl: 'https://youtube.com/@gaming_ua', targetChannel: 'Gaming UA', pointsReward: 15, timeRequiredSeconds: 0 },
      { platform: TaskPlatform.TIKTOK, type: TaskType.LIKE, targetUrl: 'https://tiktok.com/@fitness_life', targetChannel: '@fitness_life', pointsReward: 10, timeRequiredSeconds: 0 },
      { platform: TaskPlatform.YOUTUBE, type: TaskType.WATCH, targetUrl: 'https://youtube.com/@cooking', targetChannel: 'Cooking Master', pointsReward: 8, timeRequiredSeconds: 30 },
    ];
    for (const task of tasks) {
      await this.taskRepo.save(this.taskRepo.create(task));
    }
  }
}