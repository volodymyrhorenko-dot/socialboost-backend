import { User } from '../../users/entities/user.entity';
export declare enum CampaignPlatform {
    TIKTOK = "tiktok",
    YOUTUBE = "youtube"
}
export declare enum CampaignType {
    SUBSCRIBE = "subscribe",
    LIKE = "like",
    WATCH = "watch",
    COMMENT = "comment"
}
export declare enum CampaignStatus {
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed"
}
export declare class Campaign {
    id: string;
    owner: User;
    platform: CampaignPlatform;
    type: CampaignType;
    targetUrl: string;
    targetCount: number;
    completedCount: number;
    pointsPerAction: number;
    totalCost: number;
    status: CampaignStatus;
    createdAt: Date;
    updatedAt: Date;
}
