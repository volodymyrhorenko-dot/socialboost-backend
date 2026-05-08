import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepo.create({
      ...dto,
      expiresAt: dto.expiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    return this.notificationRepo.save(notification);
  }

  async findAllForUser(
    userId: string,
    query: {
      onlyUnread?: boolean;
      types?: NotificationType[];
      limit?: number;
      offset?: number;
    },
  ): Promise<{ items: Notification[]; total: number }> {
    const { onlyUnread, types, limit = 20, offset = 0 } = query;

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('(n.expiresAt IS NULL OR n.expiresAt > NOW())')
      .orderBy('n.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (onlyUnread) {
      qb.andWhere('n.isRead = false');
    }
    if (types && types.length > 0) {
      qb.andWhere('n.type IN (:...types)', { types });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: [
        { userId, isRead: false, expiresAt: IsNull() },
        { userId, isRead: false, expiresAt: MoreThan(new Date()) },
      ],
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepo.update(
      { id: notificationId, userId },
      { isRead: true },
    );
    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepo.delete({ id: notificationId, userId });
    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationRepo.delete({ userId });
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.notificationRepo
      .createQueryBuilder()
      .delete()
      .where('expiresAt IS NOT NULL AND expiresAt < :now', { now: new Date() })
      .execute();
    return result.affected ?? 0;
  }
}
