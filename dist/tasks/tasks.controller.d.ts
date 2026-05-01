import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    findAll(platform?: string, type?: string): Promise<import("./entities/task.entity").Task[]>;
    complete(id: string, req: any): Promise<{
        points: number;
    }>;
}
