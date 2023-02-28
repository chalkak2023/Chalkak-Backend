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
exports.__esModule = true;
exports.PhotospotController = void 0;
var common_1 = require("@nestjs/common");
var form_data_1 = require("nestjs-form-data/dist/decorators/form-data");
var PhotospotController = /** @class */ (function () {
    function PhotospotController(photospotService) {
        this.photospotService = photospotService;
    }
    PhotospotController.prototype.createPhotospot = function (createPhtospotDto) {
        this.photospotService.createPhotospot(createPhtospotDto, 1, 1);
    };
    __decorate([
        common_1.Post(),
        form_data_1.FormDataRequest(),
        __param(0, common_1.Body())
    ], PhotospotController.prototype, "createPhotospot");
    PhotospotController = __decorate([
        common_1.Controller('/collections/photospots')
    ], PhotospotController);
    return PhotospotController;
}());
exports.PhotospotController = PhotospotController;
