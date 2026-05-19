import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(req: any, unread?: string, types?: string, limit?: string, offset?: string): Promise<{
        items: import("./notification.entity").Notification[];
        total: number;
    }>;
    unreadCount(req: any): Promise<{
        count: number;
    }>;
    markAllAsRead(req: any): Promise<void>;
    markAsRead(id: string, req: any): Promise<void>;
    deleteAll(req: any): Promise<void>;
    delete(id: string, req: any): Promise<void>;
}
