import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class YouTubeService {
    private configService;
    private usersService;
    private notificationsService;
    private clientId;
    private clientSecret;
    private redirectUri;
    constructor(configService: ConfigService, usersService: UsersService, notificationsService: NotificationsService);
    getAuthUrl(userId: string): string;
    handleCallback(code: string, userId: string): Promise<void>;
    disconnect(userId: string): Promise<{
        success: boolean;
    }>;
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
    getChannelMeta(userId: string, channelUrl: string): Promise<{
        channelId: string;
        channelTitle: string;
        channelThumbnail: string;
        channelSubscribers: number;
    } | null>;
    getVideoMeta(userId: string, videoUrl: string): Promise<{
        videoId: string;
        videoTitle: string;
        videoThumbnail: string;
        videoDuration: number;
        channelId: string;
        channelTitle: string;
        channelThumbnail: string;
    } | null>;
    private parseDuration;
}
