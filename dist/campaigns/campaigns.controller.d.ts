import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(req: any): Promise<import("./entities/campaign.entity").Campaign[]>;
    create(req: any, body: any): Promise<import("./entities/campaign.entity").Campaign>;
    pause(id: string, req: any): Promise<import("./entities/campaign.entity").Campaign>;
    delete(id: string, req: any): Promise<void>;
}
