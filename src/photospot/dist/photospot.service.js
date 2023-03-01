"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.PhotospotService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var _ = require("lodash");
var photospot_entity_1 = require("../photospot/entities/photospot.entity");
var PhotospotService = /** @class */ (function () {
    function PhotospotService(photospotRepository, dataSource, s3Service) {
        this.photospotRepository = photospotRepository;
        this.dataSource = dataSource;
        this.s3Service = s3Service;
    }
    PhotospotService.prototype.createPhotospot = function (createPhtospotDto, userId, collectionId) {
        return __awaiter(this, void 0, Promise, function () {
            var title, description, latitude, longitude, image, imagePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        title = createPhtospotDto.title, description = createPhtospotDto.description, latitude = createPhtospotDto.latitude, longitude = createPhtospotDto.longitude, image = createPhtospotDto.image;
                        return [4 /*yield*/, this.s3Service.putObject(image)];
                    case 1:
                        imagePath = _a.sent();
                        this.photospotRepository.insert({ title: title, description: description, latitude: latitude, longitude: longitude, imagePath: imagePath, userId: userId, collectionId: collectionId });
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotospotService.prototype.getAllPhotospot = function (collectionId) {
        return __awaiter(this, void 0, Promise, function () {
            var photospots;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.photospotRepository.find({ where: { collectionId: collectionId } })];
                    case 1:
                        photospots = _a.sent();
                        if (!photospots.length) {
                            // throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
                            throw new common_1.NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
                        }
                        return [2 /*return*/, photospots];
                }
            });
        });
    };
    PhotospotService.prototype.getPhotospot = function (_a) {
        var collectionId = _a.collectionId, photospotId = _a.photospotId;
        return __awaiter(this, void 0, Promise, function () {
            var photospot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.photospotRepository.findOne({ where: { collectionId: collectionId, id: photospotId } })];
                    case 1:
                        photospot = _b.sent();
                        if (_.isNil(photospot)) {
                            throw new common_1.NotFoundException('해당 포토스팟을 찾을 수 없습니다.');
                        }
                        return [2 /*return*/, photospot];
                }
            });
        });
    };
    PhotospotService.prototype.modifyPhotospot = function (modifyPhotospotDto, param) {
        return __awaiter(this, void 0, Promise, function () {
            var title, description, image, collectionId, photospotId, updateData, imagePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        title = modifyPhotospotDto.title, description = modifyPhotospotDto.description, image = modifyPhotospotDto.image;
                        collectionId = param.collectionId, photospotId = param.photospotId;
                        return [4 /*yield*/, this.getPhotospot({ collectionId: collectionId, photospotId: photospotId })];
                    case 1:
                        _a.sent();
                        if (!_.isNil(image)) return [3 /*break*/, 2];
                        updateData = { title: title, description: description };
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.s3Service.putObject(image)];
                    case 3:
                        imagePath = _a.sent();
                        updateData = { title: title, description: description, imagePath: imagePath };
                        _a.label = 4;
                    case 4:
                        this.photospotRepository.update({ id: photospotId }, updateData);
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotospotService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(photospot_entity_1.Photospot))
    ], PhotospotService);
    return PhotospotService;
}());
exports.PhotospotService = PhotospotService;
