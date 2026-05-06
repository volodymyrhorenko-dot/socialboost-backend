import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
export declare class PublicController {
    private usersRepo;
    private tasksRepo;
    private campaignsRepo;
    constructor(usersRepo: Repository<User>, tasksRepo: Repository<Task>, campaignsRepo: Repository<Campaign>);
    private cache;
    private readonly CACHE_TTL;
    getStats(): Promise<any>;
}
