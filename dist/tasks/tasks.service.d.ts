import { Repository } from 'typeorm';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { TaskCompletion } from './task-completion.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TasksService {
    private campaignRepo;
    private completionRepo;
    private usersService;
    private transactionsService;
    private notificationsService;
    constructor(campaignRepo: Repository<Campaign>, completionRepo: Repository<TaskCompletion>, usersService: UsersService, transactionsService: TransactionsService, notificationsService: NotificationsService);
    findAll(userId: string, _platform?: string, type?: string): Promise<any[]>;
    complete(campaignId: string, userId: string): Promise<{
        points: number;
        balanceAfter: number;
    }>;
    seed(): Promise<void>;
}
