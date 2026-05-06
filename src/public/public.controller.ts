import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity';

@Controller('public')
export class PublicController {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
    @InjectRepository(Campaign) private campaignsRepo: Repository<Campaign>,
  ) {}

  private cache: { data: any; ts: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  @Get('stats')
  async getStats() {
    const now = Date.now();
    if (this.cache && now - this.cache.ts < this.CACHE_TTL) {
      return this.cache.data;
    }

    const [creators, tasksTotal, campaignsActive, channelsConnected, tasksSumResult] = await Promise.all([
      this.usersRepo.count(),
      this.tasksRepo.count(),
      this.campaignsRepo.count({ where: { status: CampaignStatus.ACTIVE } }),
      this.usersRepo.count({ where: { youtubeChannelId: Not(IsNull()) } }),
      // tasksCompleted = SUM(users.tasksCompleted) — Task entity has no status field
      this.usersRepo
        .createQueryBuilder('u')
        .select('COALESCE(SUM(u.tasksCompleted), 0)', 'total')
        .getRawOne(),
    ]);

    const tasksCompleted = Number(tasksSumResult?.total ?? 0);

    const data = {
      creators,
      tasksTotal,
      tasksCompleted,
      campaignsActive,
      channelsConnected,
      updatedAt: new Date().toISOString(),
    };

    this.cache = { data, ts: now };
    return data;
  }
}
