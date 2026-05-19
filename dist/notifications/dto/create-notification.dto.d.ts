import { NotificationType } from '../enums/notification-type.enum';
import { NotificationPriority } from '../enums/notification-priority.enum';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    priority?: NotificationPriority;
    icon?: string;
    actionLabel?: string;
    actionLink?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
}
