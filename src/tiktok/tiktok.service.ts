import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class TikTokService {
  private clientKey: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.clientKey = this.configService.get('TIKTOK_CLIENT_KEY');
    this.clientSecret = this.configService.get('TIKTOK_CLIENT_SECRET');
    this.redirectUri = this.configService.get('TIKTOK_REDIRECT_URI');
  }

  getAuthUrl(userId: string): string {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      response_type: 'code',
      scope: 'user.info.basic',
      redirect_uri: this.redirectUri,
      state: userId,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
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
      throw new BadRequestException(`TikTok token exchange failed: ${error}`);
    }

    const tokens: any = await tokenResponse.json();
    if (tokens.error) {
      throw new BadRequestException(`TikTok error: ${tokens.error_description || tokens.error}`);
    }

    const expiry = new Date(Date.now() + (tokens.expires_in * 1000));

    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    const userData: any = await userResponse.json();
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
}