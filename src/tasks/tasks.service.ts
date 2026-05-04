import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from '../campaigns/entities/campaign.entity';
import { TaskCompletion } from './task-completion.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    @InjectRepository(TaskCompletion)
    private completionRepo: Repository<TaskCompletion>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  async findAll(userId: string, _platform?: string, type?: string): Promise<any[]> {
    const completedIds = await this.completionRepo
      .find({ where: { userId }, select: ['campaignId'] })
      .then(rows => rows.map(r => r.campaignId));

    const query = this.campaignRepo.createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.owner', 'owner')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('campaign.completedCount < campaign.targetCount')
      .andWhere('owner.id != :userId', { userId });

    query.andWhere('campaign.platform = :p', { p: 'youtube' });
    if (type) query.andWhere('campaign.type = :type', { type });
    if (completedIds.length > 0) {
      query.andWhere('campaign.id NOT IN (:...ids)', { ids: completedIds });
    }

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

    const existing = await this.completionRepo.findOne({ where: { userId, campaignId } });
    if (existing) throw new BadRequestException('Завдання вже виконано');

    campaign.completedCount += 1;
    if (campaign.completedCount >= campaign.targetCount) {
      campaign.status = CampaignStatus.COMPLETED;
    }
    await this.campaignRepo.save(campaign);

    await this.completionRepo.save(this.completionRepo.create({ userId, campaignId }));

    const completingUser = await this.usersService.findById(userId);
    const pointsToAdd = completingUser?.isVip
      ? Math.round(campaign.pointsPerAction * 1.25)
      : campaign.pointsPerAction;

    const user = await this.usersService.updatePoints(userId, pointsToAdd);
    await this.usersService.incrementTasksCompleted(userId);

    const typeLabel =
      campaign.type === CampaignType.SUBSCRIBE ? 'Підписка' :
      campaign.type === CampaignType.LIKE ? 'Лайк' :
      campaign.type === CampaignType.COMMENT ? 'Коментар' :
      'Перегляд';

    await this.transactionsService.create({
      userId,
      type: TransactionType.EARN,
      amount: pointsToAdd,
      description: `YouTube • ${typeLabel} +${pointsToAdd} балів${completingUser?.isVip ? ' 👑' : ''}`,
      balanceAfter: user.pointBalance,
    });

    return { points: pointsToAdd, balanceAfter: user.pointBalance };
  }

  async seed(): Promise<void> {
    return;
  }
}