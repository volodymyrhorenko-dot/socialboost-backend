"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
let TasksService = class TasksService {
    taskRepo;
    constructor(taskRepo) {
        this.taskRepo = taskRepo;
    }
    async findAll(platform, type) {
        const query = this.taskRepo.createQueryBuilder('task')
            .where('task.isActive = :isActive', { isActive: true });
        if (platform)
            query.andWhere('task.platform = :platform', { platform });
        if (type)
            query.andWhere('task.type = :type', { type });
        return query.orderBy('task.createdAt', 'DESC').getMany();
    }
    async complete(taskId, userId) {
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task)
            throw new Error('Task not found');
        return { points: task.pointsReward };
    }
    async seed() {
        const count = await this.taskRepo.count();
        if (count > 0)
            return;
        const tasks = [
            { platform: task_entity_1.TaskPlatform.TIKTOK, type: task_entity_1.TaskType.SUBSCRIBE, targetUrl: 'https://tiktok.com/@dance_ua', targetChannel: '@dance_ua', pointsReward: 15, timeRequiredSeconds: 0 },
            { platform: task_entity_1.TaskPlatform.YOUTUBE, type: task_entity_1.TaskType.LIKE, targetUrl: 'https://youtube.com/@techreview', targetChannel: 'TechReview UA', pointsReward: 10, timeRequiredSeconds: 0 },
            { platform: task_entity_1.TaskPlatform.TIKTOK, type: task_entity_1.TaskType.WATCH, targetUrl: 'https://tiktok.com/@comedy_club', targetChannel: '@comedy_club', pointsReward: 8, timeRequiredSeconds: 30 },
            { platform: task_entity_1.TaskPlatform.YOUTUBE, type: task_entity_1.TaskType.SUBSCRIBE, targetUrl: 'https://youtube.com/@gaming_ua', targetChannel: 'Gaming UA', pointsReward: 15, timeRequiredSeconds: 0 },
            { platform: task_entity_1.TaskPlatform.TIKTOK, type: task_entity_1.TaskType.LIKE, targetUrl: 'https://tiktok.com/@fitness_life', targetChannel: '@fitness_life', pointsReward: 10, timeRequiredSeconds: 0 },
            { platform: task_entity_1.TaskPlatform.YOUTUBE, type: task_entity_1.TaskType.WATCH, targetUrl: 'https://youtube.com/@cooking', targetChannel: 'Cooking Master', pointsReward: 8, timeRequiredSeconds: 30 },
        ];
        for (const task of tasks) {
            await this.taskRepo.save(this.taskRepo.create(task));
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map