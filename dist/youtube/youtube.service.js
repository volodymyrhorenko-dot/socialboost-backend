"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
let YouTubeService = class YouTubeService {
    configService;
    usersService;
    clientId;
    clientSecret;
    redirectUri;
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
        this.clientId = this.configService.get('YOUTUBE_CLIENT_ID');
        this.clientSecret = this.configService.get('YOUTUBE_CLIENT_SECRET');
        this.redirectUri = this.configService.get('YOUTUBE_REDIRECT_URI');
    }
    getAuthUrl(userId) {
        const scope = 'https://www.googleapis.com/auth/youtube';
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope,
            access_type: 'offline',
            prompt: 'consent',
            state: userId,
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    async handleCallback(code, userId) {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
            }).toString(),
        });
        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            throw new common_1.BadRequestException(`Token exchange failed: ${error}`);
        }
        const tokens = await tokenResponse.json();
        const expiry = new Date(Date.now() + (tokens.expires_in * 1000));
        const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` },
        });
        const channelData = await channelResponse.json();
        const channel = channelData.items?.[0];
        if (!channel) {
            throw new common_1.BadRequestException('Не вдалося отримати дані вашого YouTube каналу');
        }
        const existingUser = await this.usersService.findByYouTubeChannelId(channel.id);
        if (existingUser && existingUser.id !== userId) {
            throw new common_1.ConflictException('Цей YouTube канал вже підключено до іншого акаунту SurgeUp. Спочатку відв\'яжіть його там.');
        }
        await this.usersService.saveYouTubeTokens(userId, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry,
            handle: channel?.snippet?.customUrl || channel?.snippet?.title || '',
            url: `https://youtube.com/channel/${channel.id}`,
            channelId: channel.id,
        });
    }
    async disconnect(userId) {
        await this.usersService.disconnectYouTube(userId);
        return { success: true };
    }
    async getValidAccessToken(userId) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.youtubeAccessToken) {
            throw new common_1.BadRequestException('YouTube не підключено');
        }
        if (user.youtubeTokenExpiry && new Date(user.youtubeTokenExpiry) > new Date()) {
            return user.youtubeAccessToken;
        }
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: user.youtubeRefreshToken,
                grant_type: 'refresh_token',
            }).toString(),
        });
        if (!refreshResponse.ok) {
            throw new common_1.BadRequestException('Не вдалося оновити токен YouTube');
        }
        const tokens = await refreshResponse.json();
        const expiry = new Date(Date.now() + (tokens.expires_in * 1000));
        await this.usersService.saveYouTubeTokens(userId, {
            accessToken: tokens.access_token,
            refreshToken: user.youtubeRefreshToken,
            expiry,
            handle: user.youtubeHandle,
            url: user.youtubeUrl,
        });
        return tokens.access_token;
    }
    async subscribe(userId, channelUrl) {
        const accessToken = await this.getValidAccessToken(userId);
        const channelId = await this.extractChannelId(channelUrl, accessToken);
        if (!channelId)
            throw new common_1.BadRequestException('Не вдалося знайти канал');
        const response = await fetch('https://www.googleapis.com/youtube/v3/subscriptions?part=snippet', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                snippet: {
                    resourceId: { kind: 'youtube#channel', channelId },
                },
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            if (error.error?.errors?.[0]?.reason === 'subscriptionDuplicate') {
                return { success: true };
            }
            throw new common_1.BadRequestException(`Subscribe failed: ${error.error?.message || 'unknown'}`);
        }
        return { success: true };
    }
    async comment(userId, videoUrl, commentText) {
        const accessToken = await this.getValidAccessToken(userId);
        const videoId = this.extractVideoId(videoUrl);
        if (!videoId)
            throw new common_1.BadRequestException('Невірне посилання на відео');
        if (!commentText || commentText.trim().length < 5)
            throw new common_1.BadRequestException('Коментар занадто короткий');
        const response = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                snippet: {
                    videoId,
                    topLevelComment: {
                        snippet: { textOriginal: commentText.trim() },
                    },
                },
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new common_1.BadRequestException(`Comment failed: ${error.error?.message || 'unknown'}`);
        }
        return { success: true };
    }
    async like(userId, videoUrl) {
        const accessToken = await this.getValidAccessToken(userId);
        const videoId = this.extractVideoId(videoUrl);
        if (!videoId)
            throw new common_1.BadRequestException('Невірне посилання на відео');
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) {
            const error = await response.text();
            throw new common_1.BadRequestException(`Like failed: ${error}`);
        }
        return { success: true };
    }
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match)
                return match[1];
        }
        return null;
    }
    async extractChannelId(url, accessToken) {
        const channelIdMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
        if (channelIdMatch)
            return channelIdMatch[1];
        const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/);
        if (handleMatch) {
            const handle = handleMatch[1];
            const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            const data = await response.json();
            return data.items?.[0]?.id || null;
        }
        return null;
    }
};
exports.YouTubeService = YouTubeService;
exports.YouTubeService = YouTubeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], YouTubeService);
//# sourceMappingURL=youtube.service.js.map