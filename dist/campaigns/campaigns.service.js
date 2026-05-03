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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const campaign_entity_1 = require("./entities/campaign.entity");
const users_service_1 = require("../users/users.service");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/transaction.entity");
let CampaignsService = class CampaignsService {
    campaignRepo;
    usersService;
    transactionsService;
    constructor(campaignRepo, usersService, transactionsService) {
        this.campaignRepo = campaignRepo;
        this.usersService = usersService;
        this.transactionsService = transactionsService;
    }
    async findByUser(userId) {
        return this.campaignRepo.createQueryBuilder('campaign')
            .leftJoin('campaign.owner', 'owner')
            .where('owner.id = :userId', { userId })
            .orderBy('campaign.createdAt', 'DESC')
            .getMany();
    }
    async create(userId, data) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.pointBalance < (data.totalCost || 0)) {
            throw new common_1.BadRequestException('Недостатньо балів для створення кампанії');
        }
        const campaign = this.campaignRepo.create({ ...data, owner: { id: userId } });
        const saved = await this.campaignRepo.save(campaign);
        const updated = await this.usersService.updatePoints(userId, -(data.totalCost || 0));
        await this.usersService.incrementCampaignsCreated(userId);
        const platformLabel = data.platform === 'tiktok' ? 'TikTok' : 'YouTube';
        const typeLabel = data.type === 'subscribe' ? 'підписки' : data.type === 'like' ? 'лайки' : 'перегляди';
        await this.transactionsService.create({
            userId,
            type: transaction_entity_1.TransactionType.SPEND,
            amount: data.totalCost || 0,
            description: `Кампанія ${platformLabel} ${typeLabel}`,
            balanceAfter: updated.pointBalance,
        });
        return saved;
    }
    async pause(id, userId) {
        const campaign = await this.campaignRepo.findOne({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        campaign.status = campaign.status === campaign_entity_1.CampaignStatus.ACTIVE ? campaign_entity_1.CampaignStatus.PAUSED : campaign_entity_1.CampaignStatus.ACTIVE;
        return this.campaignRepo.save(campaign);
    }
    async delete(id, userId) {
        await this.campaignRepo.delete({ id });
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        transactions_service_1.TransactionsService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map