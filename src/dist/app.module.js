"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var app_controller_1 = require("./app.controller");
var app_service_1 = require("./app.service");
var typeorm_config_service_1 = require("./common/config/typeorm.config.service");
var auth_module_1 = require("./auth/auth.module");
var collections_module_1 = require("./collections/collections.module");
var meetups_module_1 = require("./meetups/meetups.module");
var admin_module_1 = require("./admin/admin.module");
var jwt_1 = require("@nestjs/jwt");
var jwt_strategy_1 = require("./auth/guard/jwt/jwt.strategy");
var photospot_module_1 = require("./photospot/photospot.module");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        common_1.Module({
            imports: [
                config_1.ConfigModule.forRoot({ isGlobal: true }),
                typeorm_1.TypeOrmModule.forRootAsync({ useClass: typeorm_config_service_1.TypeOrmConfigService }),
                jwt_1.JwtModule.register({
                    secret: 'test',
                    signOptions: {
                        expiresIn: '1h'
                    }
                }),
                auth_module_1.AuthModule,
                collections_module_1.CollectionsModule,
                meetups_module_1.MeetupsModule,
                admin_module_1.AdminModule,
                photospot_module_1.PhotospotModule,
            ],
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService, jwt_strategy_1.JwtStrategy]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
