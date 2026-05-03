import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    findAll(req: any, platform?: string, type?: string): Promise<any[]>;
    complete(id: string, req: any): Promise<{
        points: number;
        balanceAfter: number;
    }>;
}
