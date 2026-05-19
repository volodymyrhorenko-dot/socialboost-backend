import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PaymentsService {
    private configService;
    private usersService;
    private transactionsService;
    private notificationsService;
    private stripe;
    constructor(configService: ConfigService, usersService: UsersService, transactionsService: TransactionsService, notificationsService: NotificationsService);
    createCheckoutSession(userId: string, packageId: string): Promise<{
        url: any;
        sessionId: any;
    }>;
    handleWebhook(payload: any): Promise<{
        received: boolean;
    }>;
    handleSuccess(sessionId: string): Promise<void>;
    private creditPurchase;
}
