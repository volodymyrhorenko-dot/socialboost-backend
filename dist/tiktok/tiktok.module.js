"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokModule = void 0;
const common_1 = require("@nestjs/common");
const tiktok_service_1 = require("./tiktok.service");
const tiktok_controller_1 = require("./tiktok.controller");
const users_module_1 = require("../users/users.module");
let TikTokModule = class TikTokModule {
};
exports.TikTokModule = TikTokModule;
exports.TikTokModule = TikTokModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [tiktok_controller_1.TikTokController],
        providers: [tiktok_service_1.TikTokService],
        exports: [tiktok_service_1.TikTokService],
    })
], TikTokModule);
//# sourceMappingURL=tiktok.module.js.map