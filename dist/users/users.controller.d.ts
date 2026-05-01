import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(req: any): any;
    getStats(req: any): Promise<{
        pointBalance: number;
        tasksCompleted: number;
        campaignsCreated: number;
        totalPointsEarned: number;
        totalPointsSpent: number;
        successRate: number;
    }>;
    linkSocial(req: any, body: {
        platform: 'tiktok' | 'youtube';
        url: string;
        handle: string;
    }): Promise<import("./entities/user.entity").User>;
}
