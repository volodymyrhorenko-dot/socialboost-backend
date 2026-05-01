import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
export declare class CampaignsService {
    private campaignRepo;
    constructor(campaignRepo: Repository<Campaign>);
    findByUser(userId: string): Promise<Campaign[]>;
    create(userId: string, data: Partial<Campaign>): Promise<Campaign>;
    pause(id: string, userId: string): Promise<Campaign>;
    delete(id: string, userId: string): Promise<void>;
}
