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
var aws_sdk_1 = require("aws-sdk");
var sharp = require("sharp");
var s3 = new aws_sdk_1.S3({ apiVersion: "2006-03-01" });
// import {warmupkey} from '@butlerhospitality/shared';
var warmupkey = "serverless-plugin-warmup";
var IMAGE_DIR = "image"; // should be shared
var WEBP_DEFAULT_QUALITY = 100;
var successResponse = { isValid: true };
var failureResponse = { isValid: false };
var saveImage = function (state) { return __awaiter(void 0, void 0, void 0, function () {
    var width, height, bucket, key, originalkey, imagebuffer, body, resizedbuffer, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (state.source === warmupkey) {
                    console.log("WarmUP - Lambda is warm!");
                    return [2 /*return*/];
                }
                width = state.width, height = state.height, bucket = state.bucket, key = state.key, originalkey = state.originalkey;
                return [4 /*yield*/, s3.getObject({
                        Bucket: bucket,
                        Key: originalkey
                    }).promise()];
            case 1:
                imagebuffer = _a.sent();
                console.log({
                    bucket: bucket,
                    originalkey: originalkey,
                    imagebuffer: imagebuffer
                });
                body = imagebuffer.Body;
                return [4 /*yield*/, sharp(body)
                        .resize(width, height, {
                        fit: "contain"
                    })
                        .toFormat("webp", {
                        quality: WEBP_DEFAULT_QUALITY
                    })
                        .toBuffer()];
            case 2:
                resizedbuffer = _a.sent();
                return [4 /*yield*/, s3.putObject({
                        Body: resizedbuffer,
                        Bucket: bucket,
                        Key: IMAGE_DIR + "/" + width + "x" + height + "/" + key,
                        ContentType: "image/webp"
                    }).promise()];
            case 3:
                response = _a.sent();
                return [2 /*return*/, (response.ETag) ? successResponse : failureResponse];
        }
    });
}); };
var checker = function (arr) { return arr.every(function (v) { return v.isValid === true; }); };
var imageSaveSuccess = function (states) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (states.source === warmupkey) {
            console.log("WarmUP - Lambda is warm!");
            return [2 /*return*/];
        }
        console.log("customSuccess: ", states);
        return [2 /*return*/, { isValid: checker(states) }];
    });
}); };
var imageSaveError = function (states) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (states.source === warmupkey) {
            console.log("WarmUP - Lambda is warm!");
            return [2 /*return*/];
        }
        console.log("customError: ", states);
        return [2 /*return*/, { isValid: checker(states) }];
    });
}); };
module.exports.saveImage = saveImage;
module.exports.imageSaveSuccess = imageSaveSuccess;
module.exports.imageSaveError = imageSaveError;
