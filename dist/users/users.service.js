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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async findById(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async findByYouTubeChannelId(channelId) {
        return this.userRepo.findOne({ where: { youtubeChannelId: channelId } });
    }
    async create(data) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    async updatePoints(userId, points) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.pointBalance += points;
        if (points > 0)
            user.totalPointsEarned += points;
        else
            user.totalPointsSpent += Math.abs(points);
        return this.userRepo.save(user);
    }
    async incrementTasksCompleted(userId) {
        const user = await this.findById(userId);
        if (!user)
            return;
        user.tasksCompleted += 1;
        await this.userRepo.save(user);
    }
    async incrementCampaignsCreated(userId) {
        const user = await this.findById(userId);
        if (!user)
            return;
        user.campaignsCreated += 1;
        await this.userRepo.save(user);
    }
    async linkSocial(userId, platform, url, handle) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (platform === 'tiktok') {
            user.tiktokUrl = url;
            user.tiktokHandle = handle;
        }
        else {
            user.youtubeUrl = url;
            user.youtubeHandle = handle;
        }
        return this.userRepo.save(user);
    }
    async saveYouTubeTokens(userId, data) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (data.channelId) {
            const existingUser = await this.findByYouTubeChannelId(data.channelId);
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.ConflictException('Цей YouTube канал вже підключено до іншого акаунту SurgeUp');
            }
            user.youtubeChannelId = data.channelId;
        }
        user.youtubeAccessToken = data.accessToken;
        user.youtubeRefreshToken = data.refreshToken;
        user.youtubeTokenExpiry = data.expiry;
        if (data.handle)
            user.youtubeHandle = data.handle;
        if (data.url)
            user.youtubeUrl = data.url;
        return this.userRepo.save(user);
    }
    async disconnectYouTube(userId) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.youtubeAccessToken = null;
        user.youtubeRefreshToken = null;
        user.youtubeTokenExpiry = null;
        user.youtubeChannelId = null;
        user.youtubeHandle = null;
        user.youtubeUrl = null;
        return this.userRepo.save(user);
    }
    async saveTikTokTokens(userId, data) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.tiktokAccessToken = data.accessToken;
        user.tiktokRefreshToken = data.refreshToken;
        user.tiktokTokenExpiry = data.expiry;
        user.tiktokOpenId = data.openId;
        if (data.handle)
            user.tiktokHandle = data.handle;
        if (data.url)
            user.tiktokUrl = data.url;
        return this.userRepo.save(user);
    }
    async activateVip(userId, months) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (months) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            user.vipExpiresAt = expiry;
            user.vipStartedAt = new Date();
        }
        else {
            user.isLifetimeVip = true;
            user.vipStartedAt = new Date();
        }
        user.isVip = true;
        return this.userRepo.save(user);
    }
    async checkAndUpdateVipStatus(userId) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.isAdmin || user.isLifetimeVip) {
            user.isVip = true;
            return this.userRepo.save(user);
        }
        if (user.vipExpiresAt && new Date() > new Date(user.vipExpiresAt)) {
            user.isVip = false;
            user.vipExpiresAt = null;
            return this.userRepo.save(user);
        }
        return user;
    }
    async makeAdmin(userId) {
        const user = await this.findById(userId);
        if (!user)
            return;
        user.isAdmin = true;
        user.isVip = true;
        user.isLifetimeVip = true;
        user.vipExpiresAt = null;
        user.vipStartedAt = new Date();
        user.pointBalance = 999999;
        await this.userRepo.save(user);
    }
    async getStats(userId) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            pointBalance: user.pointBalance,
            tasksCompleted: user.tasksCompleted,
            campaignsCreated: user.campaignsCreated,
            totalPointsEarned: user.totalPointsEarned,
            totalPointsSpent: user.totalPointsSpent,
            successRate: user.tasksCompleted > 0 ? 0.87 : 0,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map