import { Response } from 'express';
export declare class AppController {
    private serveStaticHtml;
    landing(res: Response): void;
    privacy(res: Response): void;
    terms(res: Response): void;
    tiktokVerification(res: Response): void;
    appIndex(res: Response): void;
    appStatic(filePath: string, res: Response): void;
}
