"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var sinon = require("sinon");
var typeorm_2 = require("typeorm");
var storage_1 = require("nestjs-form-data/dist/classes/storage");
var nestjs_form_data_1 = require("nestjs-form-data");
var testing_1 = require("@nestjs/testing");
var create_photospot_dto_1 = require("./dto/create-photospot.dto");
var photospot_controller_1 = require("./photospot.controller");
var photospot_service_1 = require("./photospot.service");
var photospot_entity_1 = require("src/photospot/entities/photospot.entity");
var s3_service_1 = require("./../common/aws/s3.service");
var typeorm_config_service_1 = require("./../common/config/typeorm.config.service");
describe('PhotospotService', function () {
    var photoService;
    var spyS3Service;
    var sandbox;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var S3ServiceProvider, app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sandbox = sinon.createSandbox();
                    S3ServiceProvider = {
                        provide: s3_service_1.S3Service,
                        useFactory: function () { return ({
                            putObject: jest.fn(function () { })
                        }); }
                    };
                    return [4 /*yield*/, testing_1.Test.createTestingModule({
                            imports: [
                                config_1.ConfigModule.forRoot({ isGlobal: true }),
                                typeorm_1.TypeOrmModule.forRootAsync({ useClass: typeorm_config_service_1.TypeOrmConfigService }),
                                typeorm_1.TypeOrmModule.forFeature([photospot_entity_1.Photospot]),
                                nestjs_form_data_1.NestjsFormDataModule.config({
                                    storage: storage_1.FileSystemStoredFile,
                                    autoDeleteFile: false
                                }),
                            ],
                            controllers: [photospot_controller_1.PhotospotController],
                            providers: [
                                photospot_service_1.PhotospotService,
                                s3_service_1.S3Service,
                                S3ServiceProvider,
                                {
                                    provide: typeorm_1.getRepositoryToken(photospot_entity_1.Photospot),
                                    useValue: sinon.createStubInstance(typeorm_2.Repository)
                                },
                            ]
                        }).compile()];
                case 1:
                    app = _a.sent();
                    photoService = app.get(photospot_service_1.PhotospotService);
                    spyS3Service = app.get(s3_service_1.S3Service);
                    return [2 /*return*/];
            }
        });
    }); });
    it('calling Service createPhotospot method', function () {
        var dto = new create_photospot_dto_1.CreatePhotospotDto();
        var userId = 1;
        var collectionId = 1;
        expect(photoService.createPhotospot(dto, userId, collectionId)).not.toEqual(null);
    });
    it('calling S3Service putObject method', function () {
        var dto = new create_photospot_dto_1.CreatePhotospotDto();
        var userId = 1;
        var collectionId = 1;
        photoService.createPhotospot(dto, userId, collectionId);
        expect(spyS3Service.putObject).toHaveBeenCalled();
        expect(spyS3Service.putObject).toHaveBeenCalledWith(dto.image);
    });
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sandbox.restore();
            return [2 /*return*/];
        });
    }); });
});
