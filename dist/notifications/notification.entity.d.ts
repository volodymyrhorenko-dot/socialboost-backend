import { User } from '../users/entities/user.entity';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationPriority } from './enums/notification-priority.enum';
export declare class Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    body: string | null;
    icon: string | null;
    actionLabel: string | null;
    actionLink: string | null;
    metadata: Record<string, any> | null;
    isRead: boolean;
    expiresAt: Date | null;
    user: User;
    userId: string;
    createdAt: Date;
}
