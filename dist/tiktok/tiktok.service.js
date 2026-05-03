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
exports.TikTokService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
let TikTokService = class TikTokService {
    configService;
    usersService;
    clientKey;
    clientSecret;
    redirectUri;
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
        this.clientKey = this.configService.get('TIKTOK_CLIENT_KEY');
        this.clientSecret = this.configService.get('TIKTOK_CLIENT_SECRET');
        this.redirectUri = this.configService.get('TIKTOK_REDIRECT_URI');
    }
    getAuthUrl(userId) {
        const params = new URLSearchParams({
            client_key: this.clientKey,
            response_type: 'code',
            scope: 'user.info.basic',
            redirect_uri: this.redirectUri,
            state: userId,
        });
        return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    }
    async handleCallback(code, userId) {
        const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_key: this.clientKey,
                client_secret: this.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
            }).toString(),
        });
        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            throw new common_1.BadRequestException(`TikTok token exchange failed: ${error}`);
        }
        const tokens = await tokenResponse.json();
        if (tokens.error) {
            throw new common_1.BadRequestException(`TikTok error: ${tokens.error_description || tokens.error}`);
        }
        const expiry = new Date(Date.now() + (tokens.expires_in * 1000));
        const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` },
        });
        const userData = await userResponse.json();
        const userInfo = userData.data?.user;
        await this.usersService.saveTikTokTokens(userId, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry,
            openId: userInfo?.open_id || tokens.open_id,
            handle: userInfo?.display_name || '',
            url: userInfo?.display_name ? `https://tiktok.com/@${userInfo.display_name}` : '',
        });
    }
};
exports.TikTokService = TikTokService;
exports.TikTokService = TikTokService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], TikTokService);
//# sourceMappingURL=tiktok.service.js.map