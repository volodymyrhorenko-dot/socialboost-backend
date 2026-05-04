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
exports.PointsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const users_service_1 = require("../users/users.service");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/transaction.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const daily_bonus_entity_1 = require("./daily-bonus.entity");
let PointsController = class PointsController {
    usersService;
    transactionsService;
    dailyBonusRepo;
    constructor(usersService, transactionsService, dailyBonusRepo) {
        this.usersService = usersService;
        this.transactionsService = transactionsService;
        this.dailyBonusRepo = dailyBonusRepo;
    }
    async claimDaily(req) {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const existing = await this.dailyBonusRepo.findOne({ where: { userId, date: today } });
        if (existing)
            throw new common_1.BadRequestException('Щоденний бонус вже отримано сьогодні');
        await this.dailyBonusRepo.save(this.dailyBonusRepo.create({ userId, date: today, type: 'daily' }));
        const currentUser = await this.usersService.findById(userId);
        const points = currentUser?.isVip ? 200 : 100;
        const user = await this.usersService.updatePoints(userId, points);
        await this.transactionsService.create({
            userId,
            type: transaction_entity_1.TransactionType.BONUS,
            amount: points,
            description: 'Щоденний бонус',
            balanceAfter: user.pointBalance,
        });
        return { success: true, points, balanceAfter: user.pointBalance };
    }
    async watchAd(req) {
        const userId = req.user.id;
        const now = new Date();
        const key = `ad_${userId}`;
        const existing = await this.dailyBonusRepo.findOne({
            where: { userId, type: 'ad' },
            order: { createdAt: 'DESC' },
        });
        if (existing) {
            const lastWatched = new Date(existing.createdAt);
            const diffMinutes = (now.getTime() - lastWatched.getTime()) / 1000 / 60;
            if (diffMinutes < 30) {
                throw new common_1.BadRequestException(`Реклама доступна через ${Math.ceil(30 - diffMinutes)} хв`);
            }
        }
        await this.dailyBonusRepo.save(this.dailyBonusRepo.create({ userId, date: now.toISOString().split('T')[0], type: 'ad' }));
        const points = 50;
        const user = await this.usersService.updatePoints(userId, points);
        await this.transactionsService.create({
            userId,
            type: transaction_entity_1.TransactionType.BONUS,
            amount: points,
            description: 'Перегляд реклами',
            balanceAfter: user.pointBalance,
        });
        return { success: true, points, balanceAfter: user.pointBalance };
    }
};
exports.PointsController = PointsController;
__decorate([
    (0, common_1.Post)('claim-daily'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "claimDaily", null);
__decorate([
    (0, common_1.Post)('watch-ad'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointsController.prototype, "watchAd", null);
exports.PointsController = PointsController = __decorate([
    (0, common_1.Controller)('points'),
    __param(2, (0, typeorm_1.InjectRepository)(daily_bonus_entity_1.DailyBonus)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        transactions_service_1.TransactionsService,
        typeorm_2.Repository])
], PointsController);
//# sourceMappingURL=points.controller.js.map