import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthProvider } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updatePoints(userId: string, points: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.pointBalance += points;
    if (points > 0) user.totalPointsEarned += points;
    else user.totalPointsSpent += Math.abs(points);
    return this.userRepo.save(user);
  }

  async linkSocial(userId: string, platform: 'tiktok' | 'youtube', url: string, handle: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (platform === 'tiktok') {
      user.tiktokUrl = url;
      user.tiktokHandle = handle;
    } else {
      user.youtubeUrl = url;
      user.youtubeHandle = handle;
    }
    return this.userRepo.save(user);
  }

  async getStats(userId: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      pointBalance: user.pointBalance,
      tasksCompleted: user.tasksCompleted,
      campaignsCreated: user.campaignsCreated,
      totalPointsEarned: user.totalPointsEarned,
      totalPointsSpent: user.totalPointsSpent,
      successRate: user.tasksCompleted > 0 ? 0.87 : 0,
    };
  }
}