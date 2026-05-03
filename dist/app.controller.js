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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AppController = class AppController {
    landing(res) {
        const landingPath = path.join(process.cwd(), 'public', 'landing.html');
        if (fs.existsSync(landingPath)) {
            res.type('text/html').send(fs.readFileSync(landingPath, 'utf-8'));
        }
        else {
            res.type('text/html').send('<h1>SocialBoost</h1><p>Landing not found</p>');
        }
    }
    tiktokVerification(res) {
        res.type('text/plain').send('tiktok-developers-site-verification=q4zO2CARHHYwqXYe65LyytYI4HjhO5I7');
    }
    terms(res) {
        res.type('text/html').send(`
      <html><head><meta charset="utf-8"><title>Terms of Service</title></head>
      <body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333">
        <h1>Terms of Service</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <h2>1. Acceptance</h2>
        <p>By using SocialBoost, you agree to these terms.</p>
        <h2>2. Service Description</h2>
        <p>SocialBoost is a mutual growth platform where users earn points by completing tasks (subscribing, liking) on TikTok and YouTube, and spend points to promote their own content.</p>
        <h2>3. User Responsibilities</h2>
        <p>You must comply with TikTok and YouTube Terms of Service. You are responsible for content you promote.</p>
        <h2>4. Points System</h2>
        <p>Points have no monetary value and cannot be exchanged for cash.</p>
        <h2>5. Account Termination</h2>
        <p>We reserve the right to terminate accounts that violate these terms.</p>
        <h2>6. Contact</h2>
        <p>For questions: support@socialboost.app</p>
      </body></html>
    `);
    }
    privacy(res) {
        res.type('text/html').send(`
      <html><head><meta charset="utf-8"><title>Privacy Policy</title></head>
      <body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333">
        <h1>Privacy Policy</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <h2>1. Information We Collect</h2>
        <p>We collect: email address, display name, YouTube/TikTok account info (when you connect them via OAuth).</p>
        <h2>2. How We Use Information</h2>
        <p>To provide our service: authenticate you, perform actions on your behalf (subscribing, liking with your explicit consent), track your points balance.</p>
        <h2>3. Data Sharing</h2>
        <p>We do not sell your data. We share data only with TikTok/YouTube APIs to perform actions you authorize.</p>
        <h2>4. Data Storage</h2>
        <p>Data is stored securely on Railway PostgreSQL servers. Passwords are hashed with bcrypt.</p>
        <h2>5. Your Rights</h2>
        <p>You can delete your account anytime. You can revoke YouTube/TikTok access via their account settings.</p>
        <h2>6. Contact</h2>
        <p>For privacy concerns: privacy@socialboost.app</p>
      </body></html>
    `);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "landing", null);
__decorate([
    (0, common_1.Get)('tiktokq4zO2CARHHYwqXYe65LyytYI4HjhO5I7.txt'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "tiktokVerification", null);
__decorate([
    (0, common_1.Get)('terms'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "terms", null);
__decorate([
    (0, common_1.Get)('privacy'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "privacy", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map