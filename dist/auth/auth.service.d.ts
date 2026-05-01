import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    googleAuth(googleData: {
        email: string;
        displayName?: string;
        avatarUrl?: string;
    }): Promise<{
        user: import("../users/entities/user.entity").User;
        token: string;
    }>;
    appleAuth(appleData: {
        email: string;
        displayName?: string;
    }): Promise<{
        user: import("../users/entities/user.entity").User;
        token: string;
    }>;
    validateUser(userId: string): Promise<import("../users/entities/user.entity").User | null>;
}
