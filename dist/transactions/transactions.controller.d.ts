import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyTransactions(req: any): Promise<import("./transaction.entity").Transaction[]>;
}
