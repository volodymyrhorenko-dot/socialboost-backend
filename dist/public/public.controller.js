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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const campaign_entity_1 = require("../campaigns/entities/campaign.entity");
let PublicController = class PublicController {
    usersRepo;
    tasksRepo;
    campaignsRepo;
    constructor(usersRepo, tasksRepo, campaignsRepo) {
        this.usersRepo = usersRepo;
        this.tasksRepo = tasksRepo;
        this.campaignsRepo = campaignsRepo;
    }
    cache = null;
    CACHE_TTL = 5 * 60 * 1000;
    async getStats() {
        const now = Date.now();
        if (this.cache && now - this.cache.ts < this.CACHE_TTL) {
            return this.cache.data;
        }
        const [creators, tasksTotal, campaignsActive, channelsConnected, tasksSumResult] = await Promise.all([
            this.usersRepo.count(),
            this.tasksRepo.count(),
            this.campaignsRepo.count({ where: { status: campaign_entity_1.CampaignStatus.ACTIVE } }),
            this.usersRepo.count({ where: { youtubeChannelId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) } }),
            this.usersRepo
                .createQueryBuilder('u')
                .select('COALESCE(SUM(u.tasksCompleted), 0)', 'total')
                .getRawOne(),
        ]);
        const tasksCompleted = Number(tasksSumResult?.total ?? 0);
        const data = {
            creators,
            tasksTotal,
            tasksCompleted,
            campaignsActive,
            channelsConnected,
            updatedAt: new Date().toISOString(),
        };
        this.cache = { data, ts: now };
        return data;
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getStats", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('api/v1/public'),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PublicController);
//# sourceMappingURL=public.controller.js.map