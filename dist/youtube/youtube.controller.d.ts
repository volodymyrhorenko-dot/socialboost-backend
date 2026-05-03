import { YouTubeService } from './youtube.service';
import { Response } from 'express';
export declare class YouTubeController {
    private youtubeService;
    constructor(youtubeService: YouTubeService);
    getAuthUrl(req: any): {
        url: string;
    };
    callback(code: string, state: string, res: Response): Promise<Response<any, Record<string, any>>>;
    subscribe(body: {
        channelUrl: string;
    }, req: any): Promise<{
        success: boolean;
    }>;
    like(body: {
        videoUrl: string;
    }, req: any): Promise<{
        success: boolean;
    }>;
}
