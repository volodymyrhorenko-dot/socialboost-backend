export declare enum AuthProvider {
    GOOGLE = "google",
    APPLE = "apple",
    EMAIL = "email"
}
export declare class User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string;
    passwordHash: string;
    pointBalance: number;
    authProvider: AuthProvider;
    tiktokUrl: string;
    youtubeUrl: string;
    tiktokHandle: string;
    youtubeHandle: string;
    youtubeChannelId: string;
    youtubeAccessToken: string;
    youtubeRefreshToken: string;
    youtubeTokenExpiry: Date;
    tiktokAccessToken: string;
    tiktokRefreshToken: string;
    tiktokTokenExpiry: Date;
    tiktokOpenId: string;
    isVip: boolean;
    vipExpiresAt: Date | null;
    isLifetimeVip: boolean;
    tasksCompleted: number;
    campaignsCreated: number;
    totalPointsEarned: number;
    totalPointsSpent: number;
    createdAt: Date;
    updatedAt: Date;
}
