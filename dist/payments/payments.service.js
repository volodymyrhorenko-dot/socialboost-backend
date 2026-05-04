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
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/transaction.entity");
const PACKAGES = {
    'pack_500': { points: 500, price: 99, name: '500 балів' },
    'pack_1200': { points: 1200, price: 199, name: '1200 балів' },
    'pack_3000': { points: 3000, price: 399, name: '3000 балів' },
    'pack_8000': { points: 8000, price: 899, name: '8000 балів' },
};
let PaymentsService = class PaymentsService {
    configService;
    usersService;
    transactionsService;
    stripe;
    constructor(configService, usersService, transactionsService) {
        this.configService = configService;
        this.usersService = usersService;
        this.transactionsService = transactionsService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-03-31.basil',
        });
    }
    async createCheckoutSession(userId, packageId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const baseUrl = 'https://socialboost-backend-production-6980.up.railway.app/api/v1/payments';
        if (packageId === 'vip_monthly') {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: { name: 'VIP Місячна підписка', description: '+50% балів, 200 щоденний бонус' },
                            unit_amount: 499,
                            recurring: { interval: 'month' },
                        },
                        quantity: 1,
                    }],
                mode: 'subscription',
                success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/cancel`,
                metadata: { userId, packageId },
            });
            return { url: session.url, sessionId: session.id };
        }
        if (packageId === 'vip_lifetime') {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: { name: 'VIP Назавжди', description: '+50% балів назавжди, 200 щоденний бонус' },
                            unit_amount: 1999,
                        },
                        quantity: 1,
                    }],
                mode: 'payment',
                success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/cancel`,
                metadata: { userId, packageId },
            });
            return { url: session.url, sessionId: session.id };
        }
        const pkg = PACKAGES[packageId];
        if (!pkg)
            throw new common_1.BadRequestException('Invalid package');
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
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel`,
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
            const { userId, packageId, points } = session.metadata;
            if (packageId === 'vip_monthly') {
                await this.usersService.activateVip(userId, 1);
            }
            else if (packageId === 'vip_lifetime') {
                await this.usersService.activateVip(userId);
            }
            else if (points) {
                await this.creditPurchase(userId, parseInt(points));
            }
        }
        return { received: true };
    }
    async handleSuccess(sessionId) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid') {
                const { userId, packageId, points } = session.metadata;
                if (packageId === 'vip_monthly') {
                    await this.usersService.activateVip(userId, 1);
                }
                else if (packageId === 'vip_lifetime') {
                    await this.usersService.activateVip(userId);
                }
                else if (points) {
                    await this.creditPurchase(userId, parseInt(points));
                }
            }
        }
        catch (e) {
            console.error('Handle success error:', e);
        }
    }
    async creditPurchase(userId, points) {
        const existing = await this.transactionsService.findByUser(userId);
        const alreadyCredited = existing.some(t => t.type === transaction_entity_1.TransactionType.PURCHASE && t.amount === points && (Date.now() - new Date(t.createdAt).getTime() < 60000));
        if (alreadyCredited)
            return;
        const user = await this.usersService.updatePoints(userId, points);
        await this.transactionsService.create({
            userId,
            type: transaction_entity_1.TransactionType.PURCHASE,
            amount: points,
            description: `Покупка ${points} балів`,
            balanceAfter: user.pointBalance,
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        transactions_service_1.TransactionsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map