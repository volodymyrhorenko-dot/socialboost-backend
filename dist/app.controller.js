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
const users_service_1 = require("./users/users.service");
let AppController = class AppController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async makeAdmin(secret, body) {
        if (secret !== 'surgeup-admin-2024')
            return { error: 'forbidden' };
        const user = await this.usersService.findByEmail(body.email);
        if (!user)
            return { error: 'user not found' };
        await this.usersService.makeAdmin(user.id);
        return { success: true, userId: user.id };
    }
    serveStaticHtml(res, filename, fallbackTitle) {
        const filePath = path.join(process.cwd(), 'public', filename);
        if (fs.existsSync(filePath)) {
            res.type('text/html').send(fs.readFileSync(filePath, 'utf-8'));
        }
        else {
            res.type('text/html').send(`<h1>${fallbackTitle}</h1><p>File not found</p>`);
        }
    }
    landing(res) {
        this.serveStaticHtml(res, 'landing.html', 'SurgeUp');
    }
    privacy(res) {
        this.serveStaticHtml(res, 'privacy.html', 'Privacy Policy');
    }
    terms(res) {
        this.serveStaticHtml(res, 'terms.html', 'Terms of Service');
    }
    tiktokVerification(res) {
        res.type('text/plain').send('tiktok-developers-site-verification=q4zO2CARHHYwqXYe65LyytYI4HjhO5I7');
    }
    appIndex(res) {
        this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
    }
    appStatic(filePath, res) {
        if (!filePath) {
            return this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
        }
        const fullPath = path.join(process.cwd(), 'public', 'app', filePath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            res.sendFile(fullPath);
        }
        else {
            this.serveStaticHtml(res, 'app/index.html', 'SurgeUp App');
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)('users/make-admin/:secret'),
    __param(0, (0, common_1.Param)('secret')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "makeAdmin", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "landing", null);
__decorate([
    (0, common_1.Get)('privacy'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "privacy", null);
__decorate([
    (0, common_1.Get)('terms'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "terms", null);
__decorate([
    (0, common_1.Get)('tiktokq4zO2CARHHYwqXYe65LyytYI4HjhO5I7.txt'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "tiktokVerification", null);
__decorate([
    (0, common_1.Get)('app'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "appIndex", null);
__decorate([
    (0, common_1.Get)('app/*path'),
    __param(0, (0, common_1.Param)('path')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "appStatic", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AppController);
//# sourceMappingURL=app.controller.js.map