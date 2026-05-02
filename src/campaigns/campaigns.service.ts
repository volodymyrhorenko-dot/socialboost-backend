import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    private usersService: UsersService,
  ) {}

  async findByUser(userId: string): Promise<Campaign[]> {
    return this.campaignRepo.createQueryBuilder('campaign')
      .where('campaign.owner = :userId', { userId })
      .orderBy('campaign.createdAt', 'DESC')
      .getMany();
  }

  async create(userId: string, data: Partial<Campaign> & { totalCost: number }): Promise<Campaign> {
    // Перевіряємо баланс
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.pointBalance < data.totalCost) {
      throw new BadRequestException(`Недостатньо балів. Потрібно: ${data.totalCost}, є: ${user.pointBalance}`);
    }
    // Списуємо бали
    await this.usersService.updatePoints(userId, -data.totalCost);
    await this.usersService.incrementCampaignsCreated(userId);
    // Створюємо кампанію
    const campaign = this.campaignRepo.create({ ...data, owner: { id: userId } as any });
    return this.campaignRepo.save(campaign);
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