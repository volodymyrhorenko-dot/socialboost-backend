"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api/v1', {
        exclude: [
            { path: '/', method: 0 },
            { path: 'tiktokq4zO2CARHHYwqXYe65LyytYI4HjhO5I7.txt', method: 0 },
            { path: 'terms', method: 0 },
            { path: 'privacy', method: 0 },
        ],
    });
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 SocialBoost API running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map