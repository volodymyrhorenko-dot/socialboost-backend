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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createCheckout(body, req) {
        return this.paymentsService.createCheckoutSession(req.user.id, body.packageId);
    }
    async webhook(body) {
        return this.paymentsService.handleWebhook(body);
    }
    async success(sessionId, res) {
        await this.paymentsService.handleSuccess(sessionId);
        return res.send(`
      <html>
        <head><meta charset="utf-8"><title>Оплата успішна</title></head>
        <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
          <div>
            <div style="font-size:64px">🎉</div>
            <h1 style="color:#10B981">Оплата успішна!</h1>
            <p style="color:#9B99BB">Бали зараховано на ваш рахунок</p>
            <p style="color:#5B5980;font-size:13px">Поверніться до додатку SocialBoost</p>
          </div>
        </body>
      </html>
    `);
    }
    async cancel(res) {
        return res.send(`
      <html>
        <head><meta charset="utf-8"><title>Оплата скасована</title></head>
        <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
          <div>
            <div style="font-size:64px">❌</div>
            <h1 style="color:#F43F5E">Оплату скасовано</h1>
            <p style="color:#9B99BB">Повертайтесь до додатку</p>
          </div>
        </body>
      </html>
    `);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('success'),
    __param(0, (0, common_1.Query)('session_id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "success", null);
__decorate([
    (0, common_1.Get)('cancel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancel", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map