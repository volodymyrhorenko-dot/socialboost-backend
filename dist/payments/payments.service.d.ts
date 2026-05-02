import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class PaymentsService {
    private configService;
    private usersService;
    private stripe;
    constructor(configService: ConfigService, usersService: UsersService);
    createCheckoutSession(userId: string, packageId: string): Promise<{
        url: any;
        sessionId: any;
    }>;
    handleWebhook(payload: any): Promise<{
        received: boolean;
    }>;
}
