import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createCheckout(body: {
        packageId: string;
    }, req: any): Promise<{
        url: any;
        sessionId: any;
    }>;
    webhook(body: any): Promise<{
        received: boolean;
    }>;
}
