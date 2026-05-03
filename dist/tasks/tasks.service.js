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
const users_service_1 = require("../users/users.service");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/transaction.entity");
let TasksService = class TasksService {
    campaignRepo;
    usersService;
    transactionsService;
    constructor(campaignRepo, usersService, transactionsService) {
        this.campaignRepo = campaignRepo;
        this.usersService = usersService;
        this.transactionsService = transactionsService;
    }
    async findAll(userId, platform, type) {
        const query = this.campaignRepo.createQueryBuilder('campaign')
            .leftJoinAndSelect('campaign.owner', 'owner')
            .where('campaign.status = :status', { status: campaign_entity_1.CampaignStatus.ACTIVE })
            .andWhere('campaign.completedCount < campaign.targetCount')
            .andWhere('owner.id != :userId', { userId });
        query.andWhere('campaign.platform = :p', { p: 'youtube' });
        if (type)
            query.andWhere('campaign.type = :type', { type });
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
        campaign.completedCount += 1;
        if (campaign.completedCount >= campaign.targetCount) {
            campaign.status = campaign_entity_1.CampaignStatus.COMPLETED;
        }
        await this.campaignRepo.save(campaign);
        const user = await this.usersService.updatePoints(userId, campaign.pointsPerAction);
        await this.usersService.incrementTasksCompleted(userId);
        const typeLabel = campaign.type === 'subscribe' ? '????????' : campaign.type === 'like' ? '????' : '????????';
        const platformLabel = campaign.platform === 'tiktok' ? 'TikTok' : 'YouTube';
        await this.transactionsService.create({
            userId,
            type: transaction_entity_1.TransactionType.EARN,
            amount: campaign.pointsPerAction,
            description: `${platformLabel} ${typeLabel}`,
            balanceAfter: user.pointBalance,
        });
        return { points: campaign.pointsPerAction, balanceAfter: user.pointBalance };
    }
    async seed() {
        return;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        transactions_service_1.TransactionsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map