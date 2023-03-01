"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreatePhotospotDto = void 0;
var class_validator_1 = require("class-validator");
var decorators_1 = require("nestjs-form-data/dist/decorators");
var CreatePhotospotDto = /** @class */ (function () {
    function CreatePhotospotDto() {
    }
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], CreatePhotospotDto.prototype, "title");
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], CreatePhotospotDto.prototype, "description");
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsNumberString()
    ], CreatePhotospotDto.prototype, "latitude");
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsNumberString()
    ], CreatePhotospotDto.prototype, "longitude");
    __decorate([
        class_validator_1.IsNotEmpty(),
        decorators_1.IsFile(),
        decorators_1.HasMimeType(['image/jpeg', 'image/png'])
    ], CreatePhotospotDto.prototype, "image");
    return CreatePhotospotDto;
}());
exports.CreatePhotospotDto = CreatePhotospotDto;
