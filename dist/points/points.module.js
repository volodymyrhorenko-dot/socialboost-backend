"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const points_controller_1 = require("./points.controller");
const daily_bonus_entity_1 = require("./daily-bonus.entity");
const users_module_1 = require("../users/users.module");
const transactions_module_1 = require("../transactions/transactions.module");
let PointsModule = class PointsModule {
};
exports.PointsModule = PointsModule;
exports.PointsModule = PointsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([daily_bonus_entity_1.DailyBonus]),
            users_module_1.UsersModule,
            transactions_module_1.TransactionsModule,
        ],
        controllers: [points_controller_1.PointsController],
    })
], PointsModule);
//# sourceMappingURL=points.module.js.map