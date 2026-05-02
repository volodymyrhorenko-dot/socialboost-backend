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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const users_service_1 = require("../users/users.service");
const PACKAGES = {
    'pack_500': { points: 500, price: 99, name: '500 балів' },
    'pack_1200': { points: 1200, price: 199, name: '1200 балів' },
    'pack_3000': { points: 3000, price: 399, name: '3000 балів' },
    'pack_8000': { points: 8000, price: 899, name: '8000 балів' },
};
let PaymentsService = class PaymentsService {
    configService;
    usersService;
    stripe;
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-03-31.basil',
        });
    }
    async createCheckoutSession(userId, packageId) {
        const pkg = PACKAGES[packageId];
        if (!pkg)
            throw new common_1.BadRequestException('Invalid package');
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: pkg.name,
                            description: pkg.points + ' балів для SocialBoost',
                        },
                        unit_amount: pkg.price,
                    },
                    quantity: 1,
                }],
            mode: 'payment',
            success_url: 'https://socialboost-backend-production-6980.up.railway.app/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://socialboost-backend-production-6980.up.railway.app/api/v1/payments/cancel',
            metadata: {
                userId,
                packageId,
                points: pkg.points.toString(),
            },
        });
        return { url: session.url, sessionId: session.id };
    }
    async handleWebhook(payload) {
        const event = payload;
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, points } = session.metadata;
            await this.usersService.updatePoints(userId, parseInt(points));
        }
        return { received: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map