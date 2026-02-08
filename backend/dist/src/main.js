"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: configService.get('frontend.url'),
        credentials: true,
    });
    const apiVersion = configService.get('apiVersion');
    app.setGlobalPrefix(`api/${apiVersion}`);
    const port = configService.get('port', 3001);
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API available at: http://localhost:${port}/api/${apiVersion}`);
}
bootstrap();
//# sourceMappingURL=main.js.map