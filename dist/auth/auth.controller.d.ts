import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    googleAuth(body: {
        email: string;
        displayName?: string;
        avatarUrl?: string;
    }): Promise<{
        user: import("../users/entities/user.entity").User;
        token: string;
    }>;
    appleAuth(body: {
        email: string;
        displayName?: string;
    }): Promise<{
        user: import("../users/entities/user.entity").User;
        token: string;
    }>;
    getMe(req: any): Promise<any>;
}
