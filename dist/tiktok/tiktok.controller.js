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
exports.TikTokController = void 0;
const common_1 = require("@nestjs/common");
const tiktok_service_1 = require("./tiktok.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TikTokController = class TikTokController {
    tiktokService;
    constructor(tiktokService) {
        this.tiktokService = tiktokService;
    }
    getAuthUrl(req) {
        return { url: this.tiktokService.getAuthUrl(req.user.id) };
    }
    async callback(code, state, res) {
        try {
            await this.tiktokService.handleCallback(code, state);
            return res.send(`
        <html>
          <head><meta charset="utf-8"><title>TikTok підключено</title></head>
          <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
            <div>
              <div style="font-size:64px">✅</div>
              <h1 style="color:#10B981">TikTok підключено!</h1>
              <p style="color:#9B99BB">Поверніться до додатку SocialBoost</p>
            </div>
          </body>
        </html>
      `);
        }
        catch (e) {
            return res.send(`
        <html>
          <head><meta charset="utf-8"><title>Помилка</title></head>
          <body style="background:#0A0A0F;color:#F1F0FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
            <div>
              <div style="font-size:64px">❌</div>
              <h1 style="color:#F43F5E">Помилка підключення</h1>
              <p style="color:#9B99BB">${e.message}</p>
            </div>
          </body>
        </html>
      `);
        }
    }
};
exports.TikTokController = TikTokController;
__decorate([
    (0, common_1.Get)('auth-url'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TikTokController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TikTokController.prototype, "callback", null);
exports.TikTokController = TikTokController = __decorate([
    (0, common_1.Controller)('tiktok'),
    __metadata("design:paramtypes", [tiktok_service_1.TikTokService])
], TikTokController);
//# sourceMappingURL=tiktok.controller.js.map