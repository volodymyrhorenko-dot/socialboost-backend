import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { UsersService } from '../users/users.service';
export declare class CampaignsService {
    private campaignRepo;
    private usersService;
    constructor(campaignRepo: Repository<Campaign>, usersService: UsersService);
    findByUser(userId: string): Promise<Campaign[]>;
    create(userId: string, data: Partial<Campaign> & {
        totalCost: number;
    }): Promise<Campaign>;
    pause(id: string, userId: string): Promise<Campaign>;
    delete(id: string, userId: string): Promise<void>;
}
