import { Response } from 'express';
import { UsersService } from './users/users.service';
export declare class AppController {
    private usersService;
    constructor(usersService: UsersService);
    makeAdmin(secret: string, body: {
        email: string;
    }): Promise<{
        error: string;
        success?: undefined;
        userId?: undefined;
    } | {
        success: boolean;
        userId: string;
        error?: undefined;
    }>;
    private serveStaticHtml;
    landing(res: Response): void;
    privacy(res: Response): void;
    terms(res: Response): void;
    tiktokVerification(res: Response): void;
    appIndex(res: Response): void;
    appStatic(filePath: string, res: Response): void;
}
