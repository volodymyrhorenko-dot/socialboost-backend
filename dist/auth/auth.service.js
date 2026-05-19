"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = __importStar(require("bcryptjs"));
const notifications_service_1 = require("../notifications/notifications.service");
const notification_type_enum_1 = require("../notifications/enums/notification-type.enum");
const notification_priority_enum_1 = require("../notifications/enums/notification-priority.enum");
let AuthService = class AuthService {
    usersService;
    jwtService;
    notificationsService;
    constructor(usersService, jwtService, notificationsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
    }
    async register(data) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing)
            throw new common_1.BadRequestException('Користувач з таким email вже існує');
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            email: data.email,
            displayName: data.displayName || data.email.split('@')[0],
            passwordHash,
            authProvider: user_entity_1.AuthProvider.EMAIL,
            pointBalance: 500,
        });
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        try {
            await this.notificationsService.create({
                userId: user.id,
                type: notification_type_enum_1.NotificationType.WELCOME_BONUS,
                priority: notification_priority_enum_1.NotificationPriority.HIGH,
                title: 'Вітаємо в SurgeUp! 🎉',
                body: 'Ми додали 500 балів на твій баланс. Спробуй платформу безкоштовно!',
                icon: '🎁',
                actionLabel: 'Почати',
                actionLink: '/dashboard',
            });
        }
        catch (e) {
            console.error('Failed to create notification', e);
        }
        return { user, token };
    }
    async login(data) {
        const user = await this.usersService.findByEmail(data.email);
        if (!user)
            throw new common_1.UnauthorizedException('Невірний email або пароль');
        if (!user.passwordHash)
            throw new common_1.UnauthorizedException('Використовуйте Google або Apple для входу');
        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid)
            throw new common_1.UnauthorizedException('Невірний email або пароль');
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return { user, token };
    }
    async googleAuth(data) {
        let user = await this.usersService.findByEmail(data.email);
        if (!user) {
            user = await this.usersService.create({
                email: data.email,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                authProvider: user_entity_1.AuthProvider.GOOGLE,
                pointBalance: 500,
            });
            try {
                await this.notificationsService.create({
                    userId: user.id,
                    type: notification_type_enum_1.NotificationType.WELCOME_BONUS,
                    priority: notification_priority_enum_1.NotificationPriority.HIGH,
                    title: 'Вітаємо в SurgeUp! 🎉',
                    body: 'Ми додали 500 балів на твій баланс. Спробуй платформу безкоштовно!',
                    icon: '🎁',
                    actionLabel: 'Почати',
                    actionLink: '/dashboard',
                });
            }
            catch (e) {
                console.error('Failed to create notification', e);
            }
        }
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return { user, token };
    }
    async appleAuth(data) {
        let user = await this.usersService.findByEmail(data.email);
        if (!user) {
            user = await this.usersService.create({
                email: data.email,
                displayName: data.displayName,
                authProvider: user_entity_1.AuthProvider.APPLE,
                pointBalance: 500,
            });
            try {
                await this.notificationsService.create({
                    userId: user.id,
                    type: notification_type_enum_1.NotificationType.WELCOME_BONUS,
                    priority: notification_priority_enum_1.NotificationPriority.HIGH,
                    title: 'Вітаємо в SurgeUp! 🎉',
                    body: 'Ми додали 500 балів на твій баланс. Спробуй платформу безкоштовно!',
                    icon: '🎁',
                    actionLabel: 'Почати',
                    actionLink: '/dashboard',
                });
            }
            catch (e) {
                console.error('Failed to create notification', e);
            }
        }
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return { user, token };
    }
    async validateUser(userId) {
        return this.usersService.findById(userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map