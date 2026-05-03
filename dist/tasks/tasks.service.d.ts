import { Repository } from 'typeorm';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class TasksService {
    private campaignRepo;
    private usersService;
    private transactionsService;
    constructor(campaignRepo: Repository<Campaign>, usersService: UsersService, transactionsService: TransactionsService);
    findAll(userId: string, platform?: string, type?: string): Promise<any[]>;
    complete(campaignId: string, userId: string): Promise<{
        points: number;
        balanceAfter: number;
    }>;
    seed(): Promise<void>;
}
