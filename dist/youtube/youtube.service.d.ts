import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class YouTubeService {
    private configService;
    private usersService;
    private clientId;
    private clientSecret;
    private redirectUri;
    constructor(configService: ConfigService, usersService: UsersService);
    getAuthUrl(userId: string): string;
    handleCallback(code: string, userId: string): Promise<void>;
    private getValidAccessToken;
    subscribe(userId: string, channelUrl: string): Promise<{
        success: boolean;
    }>;
    comment(userId: string, videoUrl: string, commentText: string): Promise<{
        success: boolean;
    }>;
    like(userId: string, videoUrl: string): Promise<{
        success: boolean;
    }>;
    private extractVideoId;
    private extractChannelId;
}
