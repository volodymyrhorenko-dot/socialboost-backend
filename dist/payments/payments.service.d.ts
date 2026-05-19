import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class PaymentsService {
    private configService;
    private usersService;
    private transactionsService;
    private stripe;
    constructor(configService: ConfigService, usersService: UsersService, transactionsService: TransactionsService);
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
