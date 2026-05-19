import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { YouTubeService } from '../youtube/youtube.service';
export declare class CampaignsService {
    private campaignRepo;
    private usersService;
    private transactionsService;
    private youtubeService;
    constructor(campaignRepo: Repository<Campaign>, usersService: UsersService, transactionsService: TransactionsService, youtubeService: YouTubeService);
    findByUser(userId: string): Promise<Campaign[]>;
    create(userId: string, data: Partial<Campaign>): Promise<Campaign>;
    pause(id: string, userId: string): Promise<Campaign>;
    delete(id: string, userId: string): Promise<void>;
}
