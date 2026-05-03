import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class TikTokService {
    private configService;
    private usersService;
    private clientKey;
    private clientSecret;
    private redirectUri;
    constructor(configService: ConfigService, usersService: UsersService);
    getAuthUrl(userId: string): string;
    handleCallback(code: string, userId: string): Promise<void>;
}
