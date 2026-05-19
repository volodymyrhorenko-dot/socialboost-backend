import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private readonly notificationRepo;
    constructor(notificationRepo: Repository<Notification>);
    create(dto: CreateNotificationDto): Promise<Notification>;
    findAllForUser(userId: string, query: {
        onlyUnread?: boolean;
        types?: NotificationType[];
        limit?: number;
        offset?: number;
    }): Promise<{
        items: Notification[];
        total: number;
    }>;
    countUnread(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string, userId: string): Promise<void>;
    deleteAll(userId: string): Promise<void>;
    cleanupExpired(): Promise<number>;
}
