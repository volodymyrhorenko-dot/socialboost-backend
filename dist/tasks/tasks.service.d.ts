import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
export declare class TasksService {
    private taskRepo;
    constructor(taskRepo: Repository<Task>);
    findAll(platform?: string, type?: string): Promise<Task[]>;
    complete(taskId: string, userId: string): Promise<{
        points: number;
    }>;
    seed(): Promise<void>;
}
