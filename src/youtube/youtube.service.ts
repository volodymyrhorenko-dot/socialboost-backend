import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class YouTubeService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.clientId = this.configService.get('YOUTUBE_CLIENT_ID');
    this.clientSecret = this.configService.get('YOUTUBE_CLIENT_SECRET');
    this.redirectUri = this.configService.get('YOUTUBE_REDIRECT_URI');
  }

  getAuthUrl(userId: string): string {
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

  async handleCallback(code: string, userId: string): Promise<void> {
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
      throw new BadRequestException(`Token exchange failed: ${error}`);
    }

    const tokens: any = await tokenResponse.json();
    const expiry = new Date(Date.now() + (tokens.expires_in * 1000));

    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    const channelData: any = await channelResponse.json();
    const channel = channelData.items?.[0];

    await this.usersService.saveYouTubeTokens(userId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiry,
      handle: channel?.snippet?.customUrl || channel?.snippet?.title || '',
      url: channel ? `https://youtube.com/channel/${channel.id}` : '',
    });
  }

  private async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.youtubeAccessToken) {
      throw new BadRequestException('YouTube не підключено');
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
      throw new BadRequestException('Не вдалось оновити токен YouTube');
    }

    const tokens: any = await refreshResponse.json();
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

  async subscribe(userId: string, channelUrl: string): Promise<{ success: boolean }> {
    const accessToken = await this.getValidAccessToken(userId);
    const channelId = await this.extractChannelId(channelUrl, accessToken);
    if (!channelId) throw new BadRequestException('Не вдалось знайти канал');

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
      const error: any = await response.json();
      if (error.error?.errors?.[0]?.reason === 'subscriptionDuplicate') {
        return { success: true };
      }
      throw new BadRequestException(`Subscribe failed: ${error.error?.message || 'unknown'}`);
    }

    return { success: true };
  }

  async like(userId: string, videoUrl: string): Promise<{ success: boolean }> {
    const accessToken = await this.getValidAccessToken(userId);
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) throw new BadRequestException('Невірне посилання на відео');

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=like`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new BadRequestException(`Like failed: ${error}`);
    }

    return { success: true };
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private async extractChannelId(url: string, accessToken: string): Promise<string | null> {
    const channelIdMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
    if (channelIdMatch) return channelIdMatch[1];

    const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/);
    if (handleMatch) {
      const handle = handleMatch[1];
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const data: any = await response.json();
      return data.items?.[0]?.id || null;
    }

    return null;
  }
}