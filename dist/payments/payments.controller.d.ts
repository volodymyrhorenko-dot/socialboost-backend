import { PaymentsService } from './payments.service';
import { Response } from 'express';
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
    success(sessionId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    cancel(res: Response): Promise<Response<any, Record<string, any>>>;
}
