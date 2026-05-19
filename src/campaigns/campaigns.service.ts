import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';
import { YouTubeService } from '../youtube/youtube.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
    private youtubeService: YouTubeService,
  ) {}

  async findByUser(userId: string): Promise<Campaign[]> {
    return this.campaignRepo.createQueryBuilder('campaign')
      .leftJoin('campaign.owner', 'owner')
      .where('owner.id = :userId', { userId })
      .orderBy('campaign.createdAt', 'DESC')
      .getMany();
  }

  async create(userId: string, data: Partial<Campaign>): Promise<Campaign> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.pointBalance < (data.totalCost || 0)) {
      throw new BadRequestException('Недостатньо балів для створення кампанії');
    }

    // Підтягуємо метадані каналу/відео з YouTube (некритично — у разі помилки кампанія створиться без них)
    let metadata: Partial<Campaign> = {};
    if (data.platform === 'youtube' && data.targetUrl) {
      try {
        if (data.type === 'subscribe') {
          const meta = await this.youtubeService.getChannelMeta(userId, data.targetUrl);
          if (meta) {
            metadata = {
              channelId: meta.channelId,
              channelTitle: meta.channelTitle,
              channelThumbnail: meta.channelThumbnail,
              channelSubscribers: meta.channelSubscribers,
            };
          }
        } else {
          // like, watch, comment — всі video-based
          const meta = await this.youtubeService.getVideoMeta(userId, data.targetUrl);
          if (meta) {
            metadata = {
              videoId: meta.videoId,
              videoTitle: meta.videoTitle,
              videoThumbnail: meta.videoThumbnail,
              videoDuration: meta.videoDuration,
              channelId: meta.channelId,
              channelTitle: meta.channelTitle,
              channelThumbnail: meta.channelThumbnail,
            };
          }
        }
      } catch (e) {
        console.error('Failed to fetch YouTube metadata for campaign:', e);
        // Не блокуємо — кампанія створиться без метаданих, оновити можна буде потім
      }
    }

    const campaign = this.campaignRepo.create({ ...data, ...metadata, owner: { id: userId } as any });
    const saved = await this.campaignRepo.save(campaign);

    const updated = await this.usersService.updatePoints(userId, -(data.totalCost || 0));
    await this.usersService.incrementCampaignsCreated(userId);

    const platformLabel = data.platform === 'tiktok' ? 'TikTok' : 'YouTube';
    const typeLabel = data.type === 'subscribe' ? 'підписки' : data.type === 'like' ? 'лайки' : 'перегляди';
    await this.transactionsService.create({
      userId,
      type: TransactionType.SPEND,
      amount: data.totalCost || 0,
      description: `Кампанія ${platformLabel} ${typeLabel}`,
      balanceAfter: updated.pointBalance,
    });

    return saved;
  }

  async pause(id: string, userId: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.status = campaign.status === CampaignStatus.ACTIVE ? CampaignStatus.PAUSED : CampaignStatus.ACTIVE;
    return this.campaignRepo.save(campaign);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.campaignRepo.delete({ id });
  }
}