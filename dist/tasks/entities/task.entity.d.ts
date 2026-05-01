import { User } from '../../users/entities/user.entity';
export declare enum TaskPlatform {
    TIKTOK = "tiktok",
    YOUTUBE = "youtube"
}
export declare enum TaskType {
    SUBSCRIBE = "subscribe",
    LIKE = "like",
    WATCH = "watch"
}
export declare enum TaskStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class Task {
    id: string;
    platform: TaskPlatform;
    type: TaskType;
    targetUrl: string;
    targetChannel: string;
    pointsReward: number;
    timeRequiredSeconds: number;
    isActive: boolean;
    creator: User;
    createdAt: Date;
}
