import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    updatePoints(userId: string, points: number): Promise<User>;
    incrementTasksCompleted(userId: string): Promise<void>;
    incrementCampaignsCreated(userId: string): Promise<void>;
    linkSocial(userId: string, platform: 'tiktok' | 'youtube', url: string, handle: string): Promise<User>;
    saveYouTubeTokens(userId: string, data: {
        accessToken: string;
        refreshToken: string;
        expiry: Date;
        handle: string;
        url: string;
    }): Promise<User>;
    getStats(userId: string): Promise<{
        pointBalance: number;
        tasksCompleted: number;
        campaignsCreated: number;
        totalPointsEarned: number;
        totalPointsSpent: number;
        successRate: number;
    }>;
}
