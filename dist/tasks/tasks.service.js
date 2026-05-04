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
const campaign_entity_1 = require("../campaigns/entities/campaign.entity");
const task_completion_entity_1 = require("./task-completion.entity");
const users_service_1 = require("../users/users.service");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/transaction.entity");
let TasksService = class TasksService {
    campaignRepo;
    completionRepo;
    usersService;
    transactionsService;
    constructor(campaignRepo, completionRepo, usersService, transactionsService) {
        this.campaignRepo = campaignRepo;
        this.completionRepo = completionRepo;
        this.usersService = usersService;
        this.transactionsService = transactionsService;
    }
    async findAll(userId, _platform, type) {
        const completedIds = await this.completionRepo
            .find({ where: { userId }, select: ['campaignId'] })
            .then(rows => rows.map(r => r.campaignId));
        const query = this.campaignRepo.createQueryBuilder('campaign')
            .leftJoinAndSelect('campaign.owner', 'owner')
            .where('campaign.status = :status', { status: campaign_entity_1.CampaignStatus.ACTIVE })
            .andWhere('campaign.completedCount < campaign.targetCount')
            .andWhere('owner.id != :userId', { userId });
        query.andWhere('campaign.platform = :p', { p: 'youtube' });
        if (type)
            query.andWhere('campaign.type = :type', { type });
        if (completedIds.length > 0) {
            query.andWhere('campaign.id NOT IN (:...ids)', { ids: completedIds });
        }
        const campaigns = await query.orderBy('campaign.createdAt', 'DESC').getMany();
        return campaigns.map(c => ({
            id: c.id,
            platform: c.platform,
            type: c.type,
            targetUrl: c.targetUrl,
            targetChannel: c.owner?.displayName || c.targetUrl.split('/').pop() || 'Channel',
            pointsReward: c.pointsPerAction,
            timeRequiredSeconds: c.type === 'watch' ? 30 : 0,
            remaining: c.targetCount - c.completedCount,
        }));
    }
    async complete(campaignId, userId) {
        const campaign = await this.campaignRepo.findOne({ where: { id: campaignId }, relations: ['owner'] });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.owner.id === userId)
            throw new common_1.BadRequestException('Cannot complete your own campaign');
        if (campaign.completedCount >= campaign.targetCount)
            throw new common_1.BadRequestException('Campaign already completed');
        if (campaign.status !== campaign_entity_1.CampaignStatus.ACTIVE)
            throw new common_1.BadRequestException('Campaign not active');
        const existing = await this.completionRepo.findOne({ where: { userId, campaignId } });
        if (existing)
            throw new common_1.BadRequestException('Завдання вже виконано');
        campaign.completedCount += 1;
        if (campaign.completedCount >= campaign.targetCount) {
            campaign.status = campaign_entity_1.CampaignStatus.COMPLETED;
        }
        await this.campaignRepo.save(campaign);
        await this.completionRepo.save(this.completionRepo.create({ userId, campaignId }));
        const completingUser = await this.usersService.findById(userId);
        const pointsToAdd = completingUser?.isVip
            ? Math.round(campaign.pointsPerAction * 1.5)
            : campaign.pointsPerAction;
        const user = await this.usersService.updatePoints(userId, pointsToAdd);
        await this.usersService.incrementTasksCompleted(userId);
        const typeLabel = campaign.type === campaign_entity_1.CampaignType.SUBSCRIBE ? 'Підписка' :
            campaign.type === campaign_entity_1.CampaignType.LIKE ? 'Лайк' :
                campaign.type === campaign_entity_1.CampaignType.COMMENT ? 'Коментар' :
                    'Перегляд';
        await this.transactionsService.create({
            userId,
            type: transaction_entity_1.TransactionType.EARN,
            amount: pointsToAdd,
            description: `YouTube • ${typeLabel} +${pointsToAdd} балів${completingUser?.isVip ? ' 👑' : ''}`,
            balanceAfter: user.pointBalance,
        });
        return { points: pointsToAdd, balanceAfter: user.pointBalance };
    }
    async seed() {
        return;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __param(1, (0, typeorm_1.InjectRepository)(task_completion_entity_1.TaskCompletion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        transactions_service_1.TransactionsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map