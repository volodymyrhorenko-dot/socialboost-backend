import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    private usersService: UsersService,
  ) {}

  async findAll(userId: string, platform?: string, type?: string): Promise<any[]> {
    const query = this.campaignRepo.createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.owner', 'owner')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('campaign.completedCount < campaign.targetCount')
      .andWhere('owner.id != :userId', { userId });

    if (platform) query.andWhere('campaign.platform = :platform', { platform });
    if (type) query.andWhere('campaign.type = :type', { type });

    const campaigns = await query.orderBy('campaign.createdAt', 'DESC').getMany();

    return campaigns.map(c => ({
      id: c.id,
      platform: c.platform,
      type: c.type,
      targetUrl: c.targetUrl,
      targetChannel: c.owner?.displayName || c.targetUrl.split('/').pop() || 'Channel',
      pointsReward: c.pointsPerAction,
      timeRequiredSeconds: c.type === 'watch' ? 30 : 0,
      remaining: c.targetCount - c.completedCount,
    }));
  }

  async complete(campaignId: string, userId: string): Promise<{ points: number; balanceAfter: number }> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId }, relations: ['owner'] });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.owner.id === userId) throw new BadRequestException('Cannot complete your own campaign');
    if (campaign.completedCount >= campaign.targetCount) throw new BadRequestException('Campaign already completed');
    if (campaign.status !== CampaignStatus.ACTIVE) throw new BadRequestException('Campaign not active');

    campaign.completedCount += 1;
    if (campaign.completedCount >= campaign.targetCount) {
      campaign.status = CampaignStatus.COMPLETED;
    }
    await this.campaignRepo.save(campaign);

    const user = await this.usersService.updatePoints(userId, campaign.pointsPerAction);
    await this.usersService.incrementTasksCompleted(userId);

    return { points: campaign.pointsPerAction, balanceAfter: user.pointBalance };
  }

  async seed(): Promise<void> {
    return;
  }
}