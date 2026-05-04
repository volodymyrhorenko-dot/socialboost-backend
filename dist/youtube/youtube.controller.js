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
exports.YouTubeController = void 0;
const common_1 = require("@nestjs/common");
const youtube_service_1 = require("./youtube.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let YouTubeController = class YouTubeController {
    youtubeService;
    constructor(youtubeService) {
        this.youtubeService = youtubeService;
    }
    getAuthUrl(req) {
        return { url: this.youtubeService.getAuthUrl(req.user.id) };
    }
    async callback(code, state, res) {
        try {
            await this.youtubeService.handleCallback(code, state);
            return res.send(`
        <!DOCTYPE html>
        <html lang="uk">
        <head>
          <meta charset="utf-8">
          <title>YouTube підключено — SurgeUp</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #06060B; color: #F1F0FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
            .card { max-width: 460px; padding: 48px 32px; background: linear-gradient(135deg, rgba(20, 20, 31, 0.9), rgba(11, 11, 18, 0.7)); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 24px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(16, 185, 129, 0.2); }
            .emoji { font-size: 80px; margin-bottom: 16px; animation: bounce 1s ease; }
            @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
            h1 { color: #10B981; font-size: 28px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
            p { color: #9B99BB; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
            .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="emoji">✅</div>
            <h1>YouTube підключено!</h1>
            <p>Поверніться до додатку SurgeUp щоб почати виконувати завдання та просувати свій канал.</p>
            <a href="/" class="btn">На головну SurgeUp</a>
          </div>
        </body>
        </html>
      `);
        }
        catch (e) {
            const errorMsg = e.message || 'Невідома помилка';
            const isConflict = e.status === 409 || errorMsg.includes('вже підключено');
            return res.send(`
        <!DOCTYPE html>
        <html lang="uk">
        <head>
          <meta charset="utf-8">
          <title>Помилка підключення — SurgeUp</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #06060B; color: #F1F0FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
            .card { max-width: 460px; padding: 48px 32px; background: linear-gradient(135deg, rgba(20, 20, 31, 0.9), rgba(11, 11, 18, 0.7)); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 24px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(244, 63, 94, 0.2); }
            .emoji { font-size: 80px; margin-bottom: 16px; }
            h1 { color: #F43F5E; font-size: 26px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
            p { color: #9B99BB; font-size: 15px; line-height: 1.6; margin-bottom: 24px; word-break: break-word; }
            .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="emoji">${isConflict ? '🔒' : '❌'}</div>
            <h1>${isConflict ? 'Канал вже зайнятий' : 'Помилка підключення'}</h1>
            <p>${errorMsg}</p>
            <a href="/" class="btn">На головну SurgeUp</a>
          </div>
        </body>
        </html>
      `);
        }
    }
    async subscribe(body, req) {
        return this.youtubeService.subscribe(req.user.id, body.channelUrl);
    }
    async like(body, req) {
        return this.youtubeService.like(req.user.id, body.videoUrl);
    }
    async comment(body, req) {
        return this.youtubeService.comment(req.user.id, body.videoUrl, body.commentText);
    }
    async disconnect(req) {
        return this.youtubeService.disconnect(req.user.id);
    }
};
exports.YouTubeController = YouTubeController;
__decorate([
    (0, common_1.Get)('auth-url'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], YouTubeController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "like", null);
__decorate([
    (0, common_1.Post)('comment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "comment", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "disconnect", null);
exports.YouTubeController = YouTubeController = __decorate([
    (0, common_1.Controller)('youtube'),
    __metadata("design:paramtypes", [youtube_service_1.YouTubeService])
], YouTubeController);
//# sourceMappingURL=youtube.controller.js.map