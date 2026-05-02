import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { UsersService } from '../users/users.service';
export declare class TasksService {
    private taskRepo;
    private usersService;
    constructor(taskRepo: Repository<Task>, usersService: UsersService);
    findAll(platform?: string, type?: string): Promise<Task[]>;
    complete(taskId: string, userId: string): Promise<{
        points: number;
    }>;
    seed(): Promise<void>;
}
