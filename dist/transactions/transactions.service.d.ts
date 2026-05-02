import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
export declare class TransactionsService {
    private transactionRepo;
    constructor(transactionRepo: Repository<Transaction>);
    create(data: {
        userId: string;
        type: TransactionType;
        amount: number;
        description: string;
        balanceAfter: number;
    }): Promise<Transaction>;
    findByUser(userId: string): Promise<Transaction[]>;
}
