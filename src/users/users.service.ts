import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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

  async findByYouTubeChannelId(channelId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { youtubeChannelId: channelId } });
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

  async incrementTasksCompleted(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.tasksCompleted += 1;
    await this.userRepo.save(user);
  }

  async incrementCampaignsCreated(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.campaignsCreated += 1;
    await this.userRepo.save(user);
  }

  async linkSocial(userId: string, platform: 'tiktok' | 'youtube', url: string, handle: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (platform === 'tiktok') { user.tiktokUrl = url; user.tiktokHandle = handle; }
    else { user.youtubeUrl = url; user.youtubeHandle = handle; }
    return this.userRepo.save(user);
  }

  async saveYouTubeTokens(userId: string, data: { accessToken: string; refreshToken: string; expiry: Date; handle: string; url: string; channelId?: string }): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check uniqueness only when channelId is provided (initial connection)
    if (data.channelId) {
      const existingUser = await this.findByYouTubeChannelId(data.channelId);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Цей YouTube канал вже підключено до іншого акаунту SurgeUp');
      }
      user.youtubeChannelId = data.channelId;
    }

    user.youtubeAccessToken = data.accessToken;
    user.youtubeRefreshToken = data.refreshToken;
    user.youtubeTokenExpiry = data.expiry;
    if (data.handle) user.youtubeHandle = data.handle;
    if (data.url) user.youtubeUrl = data.url;
    return this.userRepo.save(user);
  }

  async disconnectYouTube(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.youtubeAccessToken = null;
    user.youtubeRefreshToken = null;
    user.youtubeTokenExpiry = null;
    user.youtubeChannelId = null;
    user.youtubeHandle = null;
    user.youtubeUrl = null;
    return this.userRepo.save(user);
  }

  async saveTikTokTokens(userId: string, data: { accessToken: string; refreshToken: string; expiry: Date; openId: string; handle: string; url: string }): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.tiktokAccessToken = data.accessToken;
    user.tiktokRefreshToken = data.refreshToken;
    user.tiktokTokenExpiry = data.expiry;
    user.tiktokOpenId = data.openId;
    if (data.handle) user.tiktokHandle = data.handle;
    if (data.url) user.tiktokUrl = data.url;
    return this.userRepo.save(user);
  }

  async activateVip(userId: string, months?: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (months) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      user.vipExpiresAt = expiry;
      user.vipStartedAt = new Date();
    } else {
      user.isLifetimeVip = true;
      user.vipStartedAt = new Date();
    }
    user.isVip = true;
    return this.userRepo.save(user);
  }

  async checkAndUpdateVipStatus(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.isAdmin || user.isLifetimeVip) {
      user.isVip = true;
      return this.userRepo.save(user);
    }
    if (user.vipExpiresAt && new Date() > new Date(user.vipExpiresAt)) {
      user.isVip = false;
      user.vipExpiresAt = null;
      return this.userRepo.save(user);
    }
    return user;
  }

  async makeAdmin(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.isAdmin = true;
    user.isVip = true;
    user.isLifetimeVip = true;
    user.vipExpiresAt = null;
    user.vipStartedAt = new Date();
    user.pointBalance = 999999;
    await this.userRepo.save(user);
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