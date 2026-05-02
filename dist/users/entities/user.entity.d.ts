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
    isVip: boolean;
    tasksCompleted: number;
    campaignsCreated: number;
    totalPointsEarned: number;
    totalPointsSpent: number;
    createdAt: Date;
    updatedAt: Date;
}
