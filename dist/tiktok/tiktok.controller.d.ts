import { TikTokService } from './tiktok.service';
import type { Response } from 'express';
export declare class TikTokController {
    private tiktokService;
    constructor(tiktokService: TikTokService);
    getAuthUrl(req: any): {
        url: string;
    };
    callback(code: string, state: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
