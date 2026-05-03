import { Repository } from 'typeorm';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { TaskCompletion } from './task-completion.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class TasksService {
    private campaignRepo;
    private completionRepo;
    private usersService;
    private transactionsService;
    constructor(campaignRepo: Repository<Campaign>, completionRepo: Repository<TaskCompletion>, usersService: UsersService, transactionsService: TransactionsService);
    findAll(userId: string, _platform?: string, type?: string): Promise<any[]>;
    complete(campaignId: string, userId: string): Promise<{
        points: number;
        balanceAfter: number;
    }>;
    seed(): Promise<void>;
}
