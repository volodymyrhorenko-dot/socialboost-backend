import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from '../campaigns/entities/campaign.entity';
import { TaskCompletion } from './task-completion.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    @InjectRepository(TaskCompletion)
    private completionRepo: Repository<TaskCompletion>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
    private notificationsService: NotificationsService,
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

    const campaigns = await query
      .orderBy('owner.isVip', 'DESC')
      .addOrderBy('campaign.createdAt', 'DESC')
      .getMany();

    return campaigns.map(c => ({
      id: c.id,
      platform: c.platform,
      type: c.type,
      targetUrl: c.targetUrl,
      // Спочатку — реальна назва YouTube каналу, потім fallback на displayName creator'а
      targetChannel: c.channelTitle || c.owner?.displayName || c.targetUrl.split('/').pop() || 'Channel',
      pointsReward: c.pointsPerAction,
      timeRequiredSeconds: c.type === 'watch' ? 30 : 0,
      remaining: c.targetCount - c.completedCount,
      // YouTube metadata (null для старих кампаній без enrichment)
      channelId: c.channelId ?? null,
      channelTitle: c.channelTitle ?? null,
      channelThumbnail: c.channelThumbnail ?? null,
      channelSubscribers: c.channelSubscribers ?? null,
      videoId: c.videoId ?? null,
      videoTitle: c.videoTitle ?? null,
      videoThumbnail: c.videoThumbnail ?? null,
      videoDuration: c.videoDuration ?? null,
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

    const channelName = campaign.channelTitle || campaign.owner?.displayName || campaign.targetUrl.split('/').pop() || 'Channel';

    try {
      await this.notificationsService.create({
        userId,
        type: NotificationType.REWARD_EARNED,
        title: `+${pointsToAdd} балів за виконання завдання`,
        body: `Ти виконав завдання "${typeLabel}" на каналі "${channelName}"`,
        icon: '💰',
        metadata: { taskId: campaign.id, amount: pointsToAdd },
        actionLabel: 'Баланс',
        actionLink: '/profile/balance',
      });
    } catch (e) {
      console.error('Failed to create notification', e);
    }

    try {
      await this.notificationsService.create({
        userId: campaign.owner.id,
        type: NotificationType.TASK_COMPLETED,
        title: 'Виконання твоєї кампанії!',
        body: `Хтось виконав завдання "${typeLabel}" (${campaign.completedCount}/${campaign.targetCount})`,
        icon: '✅',
        metadata: { campaignId: campaign.id },
        actionLabel: 'Кампанія',
        actionLink: `/campaign/${campaign.id}`,
      });
    } catch (e) {
      console.error('Failed to create notification', e);
    }

    if (campaign.status === CampaignStatus.COMPLETED) {
      try {
        await this.notificationsService.create({
          userId: campaign.owner.id,
          type: NotificationType.CAMPAIGN_FINISHED,
          priority: NotificationPriority.HIGH,
          title: 'Кампанія успішно завершена! 🎯',
          body: `Усі ${campaign.targetCount} виконань отримано. Створюй нову, щоб продовжити зростання.`,
          icon: '🏁',
          metadata: { campaignId: campaign.id },
        });
      } catch (e) {
        console.error('Failed to create notification', e);
      }
    }

    return { points: pointsToAdd, balanceAfter: user.pointBalance };
  }

  async seed(): Promise<void> {
    return;
  }
}