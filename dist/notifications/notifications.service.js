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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
let NotificationsService = class NotificationsService {
    notificationRepo;
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async create(dto) {
        const notification = this.notificationRepo.create({
            ...dto,
            expiresAt: dto.expiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });
        return this.notificationRepo.save(notification);
    }
    async findAllForUser(userId, query) {
        const { onlyUnread, types, limit = 20, offset = 0 } = query;
        const qb = this.notificationRepo
            .createQueryBuilder('n')
            .where('n.userId = :userId', { userId })
            .andWhere('(n.expiresAt IS NULL OR n.expiresAt > NOW())')
            .orderBy('n.createdAt', 'DESC')
            .skip(offset)
            .take(limit);
        if (onlyUnread) {
            qb.andWhere('n.isRead = false');
        }
        if (types && types.length > 0) {
            qb.andWhere('n.type IN (:...types)', { types });
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async countUnread(userId) {
        return this.notificationRepo.count({
            where: [
                { userId, isRead: false, expiresAt: (0, typeorm_2.IsNull)() },
                { userId, isRead: false, expiresAt: (0, typeorm_2.MoreThan)(new Date()) },
            ],
        });
    }
    async markAsRead(notificationId, userId) {
        const result = await this.notificationRepo.update({ id: notificationId, userId }, { isRead: true });
        if (!result.affected) {
            throw new common_1.NotFoundException('Notification not found');
        }
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    }
    async delete(notificationId, userId) {
        const result = await this.notificationRepo.delete({ id: notificationId, userId });
        if (!result.affected) {
            throw new common_1.NotFoundException('Notification not found');
        }
    }
    async deleteAll(userId) {
        await this.notificationRepo.delete({ userId });
    }
    async cleanupExpired() {
        const result = await this.notificationRepo
            .createQueryBuilder()
            .delete()
            .where('expiresAt IS NOT NULL AND expiresAt < :now', { now: new Date() })
            .execute();
        return result.affected ?? 0;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map