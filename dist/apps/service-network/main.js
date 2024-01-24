/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/service-network/src/city/entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const repository_1 = __webpack_require__("./apps/service-network/src/city/repository.ts");
const entity_1 = __webpack_require__("./apps/service-network/src/hub/entity.ts");
let City = class City extends service_sdk_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.hubs = new core_1.Collection(this);
    }
};
tslib_1.__decorate([
    core_1.Property({
        columnType: "bigint",
        nullable: true
    }),
    tslib_1.__metadata("design:type", Number)
], City.prototype, "oms_id", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255 }),
    tslib_1.__metadata("design:type", String)
], City.prototype, "name", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255 }),
    tslib_1.__metadata("design:type", String)
], City.prototype, "time_zone", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], City.prototype, "state", void 0);
tslib_1.__decorate([
    core_1.OneToMany({ entity: () => entity_1.default, mappedBy: "city" }),
    tslib_1.__metadata("design:type", Object)
], City.prototype, "hubs", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], City.prototype, "voice_url", void 0);
City = tslib_1.__decorate([
    core_1.Entity({
        customRepository: () => repository_1.CityRepository
    }),
    core_1.Filter({ name: "name", cond: (args) => ({ name: { $eq: args.name } }) })
], City);
exports["default"] = City;


/***/ }),

/***/ "./apps/service-network/src/city/repository.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CityRepository = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
class CityRepository extends service_sdk_1.CustomEntityRepository {
}
exports.CityRepository = CityRepository;


/***/ }),

/***/ "./apps/service-network/src/city/route.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const express = __webpack_require__("express");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const usecases_1 = __webpack_require__("./apps/service-network/src/city/usecases/index.ts");
const create_city_1 = __webpack_require__("./apps/service-network/src/city/usecases/create-city.ts");
const update_city_1 = __webpack_require__("./apps/service-network/src/city/usecases/update-city.ts");
const router = express.Router();
router.get("/", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const [data, count] = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: false
        }).getList(Object.assign(Object.assign({}, service_sdk_1.parsePaginationParam(req.query)), { name: req.query.name }));
        return res.send(service_sdk_1.httpResponse({
            payload: data,
            total: count || 0,
            nextPage: req.query.page ? Number(req.query.page) + 1 : 1
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.get("/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: false
        }).getCity(Number(req.params.id));
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.post("/", service_sdk_1.validateRequest(create_city_1.CreateCityInput), (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).createCity(req.body);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.patch("/:id", service_sdk_1.validateRequest(update_city_1.UpdateCityInput), (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const cityId = Number(req.params.id);
        const { body } = req;
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).updateCity(cityId, body);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.delete("/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).deleteCity(Number(req.params.id));
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
exports["default"] = router;


/***/ }),

/***/ "./apps/service-network/src/city/usecases/create-city.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateCityInput = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const class_validator_1 = __webpack_require__("class-validator");
class CreateCityInput {
}
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateCityInput.prototype, "name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], CreateCityInput.prototype, "oms_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateCityInput.prototype, "time_zone", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], CreateCityInput.prototype, "state", void 0);
exports.CreateCityInput = CreateCityInput;
exports["default"] = (dependency) => {
    const { cityRepository } = dependency;
    return (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield cityRepository.failIfEntityExists({
            name: data.name
        });
        const city = cityRepository.create(data);
        yield cityRepository.persistAndFlush(city);
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.CITY, shared_1.CITY_EVENT.CREATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.CITY }, city));
        return city;
    });
};


/***/ }),

/***/ "./apps/service-network/src/city/usecases/delete-city.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
exports["default"] = (dependency) => {
    const { cityRepository } = dependency;
    return (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const city = yield cityRepository.getOneEntityOrFail({ id }, ["hubs"]);
        if ((_a = city.hubs) === null || _a === void 0 ? void 0 : _a.count()) {
            throw new service_sdk_1.ConflictError("City has hub relations");
        }
        const result = cityRepository.softDelete(id);
        const payload = {
            entity: shared_1.ENTITY.NETWORK.CITY,
            id: city.id
        };
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.CITY, shared_1.CITY_EVENT.DELETED, null, payload);
        return result;
    });
};


/***/ }),

/***/ "./apps/service-network/src/city/usecases/get-city.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
exports["default"] = (dependency) => {
    const { cityRepository } = dependency;
    return (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return cityRepository.getOneEntityOrFail(id);
    });
};


/***/ }),

/***/ "./apps/service-network/src/city/usecases/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const entity_1 = __webpack_require__("./apps/service-network/src/city/entity.ts");
const list_cities_1 = __webpack_require__("./apps/service-network/src/city/usecases/list-cities.ts");
const get_city_1 = __webpack_require__("./apps/service-network/src/city/usecases/get-city.ts");
const create_city_1 = __webpack_require__("./apps/service-network/src/city/usecases/create-city.ts");
const update_city_1 = __webpack_require__("./apps/service-network/src/city/usecases/update-city.ts");
const delete_city_1 = __webpack_require__("./apps/service-network/src/city/usecases/delete-city.ts");
exports["default"] = (dependency) => {
    const { conn } = dependency;
    const cityRepository = conn.em.getRepository(entity_1.default);
    return {
        getList: list_cities_1.default({ cityRepository }),
        getCity: get_city_1.default({ cityRepository }),
        createCity: create_city_1.default({ cityRepository }),
        updateCity: update_city_1.default({ cityRepository }),
        deleteCity: delete_city_1.default({ cityRepository })
    };
};


/***/ }),

/***/ "./apps/service-network/src/city/usecases/list-cities.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
exports["default"] = (dependency) => {
    const { cityRepository } = dependency;
    return (filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const name = (_a = filters === null || filters === void 0 ? void 0 : filters.name) === null || _a === void 0 ? void 0 : _a.trim();
        const whereFilters = Object.assign({ deleted_at: null }, (name && {
            name: {
                $ilike: `%${name}%`
            }
        }));
        const options = Object.assign(Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.page) && { offset: (filters.page - 1) * filters.limit })), ((filters === null || filters === void 0 ? void 0 : filters.limit) && { limit: filters.limit })), { populate: ["hubs.hotels"], orderBy: { created_at: core_1.QueryOrder.DESC } });
        return cityRepository.findAndCount(whereFilters, options);
    });
};


/***/ }),

/***/ "./apps/service-network/src/city/usecases/update-city.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateCityInput = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const class_validator_1 = __webpack_require__("class-validator");
class UpdateCityInput {
}
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateCityInput.prototype, "name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], UpdateCityInput.prototype, "oms_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateCityInput.prototype, "time_zone", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateCityInput.prototype, "state", void 0);
exports.UpdateCityInput = UpdateCityInput;
exports["default"] = (dependency) => {
    const { cityRepository } = dependency;
    return (id, cityInput) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield cityRepository.failIfEntityExists({
            name: cityInput.name,
            id: {
                $ne: id
            }
        });
        const city = yield cityRepository.getOneEntityOrFail({ id });
        core_1.wrap(city).assign(cityInput);
        yield cityRepository.flush();
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.CITY, shared_1.CITY_EVENT.UPDATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.CITY }, city));
        return city;
    });
};


/***/ }),

/***/ "./apps/service-network/src/entities.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NetworkEntities = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const entity_1 = __webpack_require__("./apps/service-network/src/user/entity.ts");
const entity_2 = __webpack_require__("./apps/service-network/src/city/entity.ts");
const entity_3 = __webpack_require__("./apps/service-network/src/hub/entity.ts");
const entity_4 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
const NetworkEntitiesObject = {
    BaseEntity: service_sdk_1.BaseEntity,
    AuditBaseEntity: service_sdk_1.AuditBaseEntity,
    Hotel: entity_4.default,
    Hub: entity_3.default,
    City: entity_2.default,
    User: entity_1.default
};
exports.NetworkEntities = {
    asArray: () => {
        return Object.values(NetworkEntitiesObject);
    },
    asObject: () => {
        return NetworkEntitiesObject;
    }
};


/***/ }),

/***/ "./apps/service-network/src/hotel/entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FeeType = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const entity_1 = __webpack_require__("./apps/service-network/src/hub/entity.ts");
const entity_2 = __webpack_require__("./apps/service-network/src/user/entity.ts");
const repository_1 = __webpack_require__("./apps/service-network/src/hotel/repository.ts");
var FeeType;
(function (FeeType) {
    FeeType["PERCENTAGE"] = "PERCENTAGE";
    FeeType["FIXED_PRICE"] = "FIXED_PRICE";
})(FeeType = exports.FeeType || (exports.FeeType = {}));
let Hotel = class Hotel extends service_sdk_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.is_tax_exempt = false;
        this.active = true;
        this.web_active = false;
        this.allow_payment_room_charge = false;
        this.allow_payment_credit_card = false;
        this.allow_scheduled_orders = false;
        this.has_vouchers_enabled = false;
        this.has_pms_enabled = false;
        this.has_car_service_enabled = false;
        this.has_activities_enabled = false;
    }
};
tslib_1.__decorate([
    core_1.Property({ nullable: true }) // TODO nullable: false when adapter is finished
    ,
    core_1.Unique(),
    tslib_1.__metadata("design:type", Number)
], Hotel.prototype, "oms_id", void 0);
tslib_1.__decorate([
    core_1.ManyToOne({ entity: () => entity_1.default }),
    tslib_1.__metadata("design:type", typeof (_a = typeof entity_1.default !== "undefined" && entity_1.default) === "function" ? _a : Object)
], Hotel.prototype, "hub", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 500 }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "name", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "formal_name", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "is_tax_exempt", void 0);
tslib_1.__decorate([
    core_1.Property({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "active", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "code", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "address_street", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "address_number", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "address_town", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "address_zip_code", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "address_coordinates", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "web_active", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "web_phone", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "web_url_id", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "web_code", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "contact_person", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "contact_email", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    tslib_1.__metadata("design:type", Number)
], Hotel.prototype, "account_manager_id", void 0);
tslib_1.__decorate([
    core_1.ManyToOne({ entity: () => entity_2.default, nullable: true, joinColumn: "account_manager_id" }),
    tslib_1.__metadata("design:type", typeof (_b = typeof entity_2.default !== "undefined" && entity_2.default) === "function" ? _b : Object)
], Hotel.prototype, "account_manager", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    tslib_1.__metadata("design:type", Number)
], Hotel.prototype, "room_count", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _c : Object)
], Hotel.prototype, "room_numbers", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 500, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "delivery_instructions", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true, default: "[]" }),
    tslib_1.__metadata("design:type", typeof (_d = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _d : Object)
], Hotel.prototype, "reskin_config", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "allow_payment_room_charge", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "allow_payment_credit_card", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "allow_scheduled_orders", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "has_vouchers_enabled", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "has_pms_enabled", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "has_car_service_enabled", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hotel.prototype, "has_activities_enabled", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true, default: "[]" }),
    tslib_1.__metadata("design:type", Object)
], Hotel.prototype, "operating_hours", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true, default: "[]" }),
    tslib_1.__metadata("design:type", Object)
], Hotel.prototype, "service_fee", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    tslib_1.__metadata("design:type", Number)
], Hotel.prototype, "menu_id", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hotel.prototype, "phone_number", void 0);
Hotel = tslib_1.__decorate([
    core_1.Entity({
        customRepository: () => repository_1.HotelRepository
    })
], Hotel);
exports["default"] = Hotel;


/***/ }),

/***/ "./apps/service-network/src/hotel/repository.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HotelRepository = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
class HotelRepository extends service_sdk_1.CustomEntityRepository {
}
exports.HotelRepository = HotelRepository;


/***/ }),

/***/ "./apps/service-network/src/hotel/route.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const express = __webpack_require__("express");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const usecases_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/index.ts");
const create_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/create-hotel.ts");
const update_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/update-hotel.ts");
const router = express.Router();
router.get("", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const [data, count] = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: false
        }).listHotels(Object.assign(Object.assign({}, service_sdk_1.parsePaginationParam(req.query)), { account_manager: Number(req.query.account_manager), name: req.query.name, hub_ids: req.query.hub_ids, statuses: req.query.statuses, web_code: req.query.web_code }));
        return res.send(service_sdk_1.httpResponse({
            payload: data,
            total: count || 0,
            nextPage: req.query.page ? Number(req.query.page) + 1 : 1
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.get("/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: false
        }).getHotel(Number(req.params.id));
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.post("", service_sdk_1.validateRequest(create_hotel_1.CreateHotelInput), (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).createHotel(req.body);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.patch("/:id", service_sdk_1.validateRequest(update_hotel_1.UpdateHotelInput), (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const { id } = req.params;
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).updateHotel(Number(id), body);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.delete("/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: false
        }).deleteHotel(Number(req.params.id));
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.patch("/status/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).changeStatusHotel(Number(id), status);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
exports["default"] = router;


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/change-status-hotel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
exports["default"] = (dependency) => {
    const { hotelRepository } = dependency;
    return (id, status) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const hotel = yield hotelRepository.getOneEntityOrFail({ id });
        core_1.wrap(hotel).assign({ active: status });
        yield hotelRepository.flush();
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HOTEL, shared_1.HOTEL_EVENT.UPDATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.HOTEL }, hotel));
        return hotel;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/create-hotel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateHotelInput = exports.ServiceFeeInput = exports.FeeValueInput = exports.OrderRangeInput = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const class_validator_1 = __webpack_require__("class-validator");
const entity_1 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
const class_transformer_1 = __webpack_require__("class-transformer");
const service_fee_1 = __webpack_require__("./apps/service-network/src/utils/service-fee.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const email_notification_1 = __webpack_require__("./apps/service-network/src/utils/email-notification.ts");
const constants_1 = __webpack_require__("./apps/service-network/src/utils/constants.ts");
const operating_hours_1 = __webpack_require__("./apps/service-network/src/utils/operating-hours.ts");
class OrderRangeInput {
}
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsPositive(),
    tslib_1.__metadata("design:type", Number)
], OrderRangeInput.prototype, "from", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    class_validator_1.IsPositive(),
    tslib_1.__metadata("design:type", Number)
], OrderRangeInput.prototype, "to", void 0);
exports.OrderRangeInput = OrderRangeInput;
class FeeValueInput {
}
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsPositive(),
    tslib_1.__metadata("design:type", Number)
], FeeValueInput.prototype, "order", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsPositive(),
    tslib_1.__metadata("design:type", Number)
], FeeValueInput.prototype, "fee_amount", void 0);
tslib_1.__decorate([
    class_validator_1.IsDefined(),
    class_validator_1.IsObject(),
    class_transformer_1.Type(() => OrderRangeInput),
    class_validator_1.ValidateNested(),
    tslib_1.__metadata("design:type", typeof (_a = typeof entity_1.IOrderRange !== "undefined" && entity_1.IOrderRange) === "function" ? _a : Object)
], FeeValueInput.prototype, "order_range", void 0);
exports.FeeValueInput = FeeValueInput;
class ServiceFeeInput {
}
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], ServiceFeeInput.prototype, "menu_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(entity_1.FeeType),
    tslib_1.__metadata("design:type", typeof (_b = typeof entity_1.FeeType !== "undefined" && entity_1.FeeType) === "function" ? _b : Object)
], ServiceFeeInput.prototype, "fee_type", void 0);
tslib_1.__decorate([
    class_validator_1.IsArray(),
    class_validator_1.ArrayNotEmpty(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => FeeValueInput),
    tslib_1.__metadata("design:type", Array)
], ServiceFeeInput.prototype, "fee_values", void 0);
exports.ServiceFeeInput = ServiceFeeInput;
class CreateHotelInput {
}
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(500),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], CreateHotelInput.prototype, "hub_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], CreateHotelInput.prototype, "oms_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "formal_name", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "is_tax_exempt", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "active", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "address_street", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "address_number", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "address_town", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(10),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "address_zip_code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "address_coordinates", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "web_active", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "web_phone", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "web_url_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(3),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "web_code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(6),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "contact_person", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "contact_email", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], CreateHotelInput.prototype, "account_manager_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], CreateHotelInput.prototype, "room_count", void 0);
tslib_1.__decorate([
    class_validator_1.IsJSON(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", typeof (_c = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _c : Object)
], CreateHotelInput.prototype, "room_numbers", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(500),
    tslib_1.__metadata("design:type", String)
], CreateHotelInput.prototype, "delivery_instructions", void 0);
tslib_1.__decorate([
    class_validator_1.IsJSON(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", typeof (_d = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _d : Object)
], CreateHotelInput.prototype, "reskin_config", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "allow_payment_room_charge", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "allow_payment_credit_card", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "allow_scheduled_orders", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "has_vouchers_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "has_pms_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "has_car_service_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHotelInput.prototype, "has_activities_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsArray(),
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => ServiceFeeInput),
    tslib_1.__metadata("design:type", Array)
], CreateHotelInput.prototype, "service_fee", void 0);
tslib_1.__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => operating_hours_1.OperatingHoursValidation),
    tslib_1.__metadata("design:type", typeof (_e = typeof entity_1.IOperatingHours !== "undefined" && entity_1.IOperatingHours) === "function" ? _e : Object)
], CreateHotelInput.prototype, "operating_hours", void 0);
exports.CreateHotelInput = CreateHotelInput;
const notifyOnHotelCreate = (hotel, hotelStatus) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const attachments = yield email_notification_1.createButlerMenuQRCodes(hotel, hotelStatus);
    const subject = Object.values(hotelStatus).every(Boolean) ?
        `${hotel.name} ${constants_1.EMAIL_STATUS.ONBOARDING_COMPLETED}` :
        `${hotel.name} ${constants_1.EMAIL_STATUS.ONBOARDING_FAILED}`;
    return yield service_sdk_1.sendEmail({
        from: constants_1.EMAILS.SUPPORT,
        to: email_notification_1.getEmailsToNotify(),
        subject: subject,
        attachments: attachments,
        htmlBody: email_notification_1.buildEmailBody(hotel, hotelStatus, constants_1.ONBOARDING_MESSAGE),
        textBody: email_notification_1.buildEmailBody(hotel, hotelStatus, constants_1.ONBOARDING_MESSAGE, false)
    });
});
exports["default"] = (dependency) => {
    const { hotelRepository, hubRepository } = dependency;
    return (data, shouldNotify = true) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield hotelRepository.failIfEntityExists({
            $or: [
                {
                    name: { $eq: data.name }
                },
                {
                    web_url_id: { $eq: data.web_url_id }
                },
                {
                    web_code: { $eq: data.web_code }
                },
                {
                    code: { $eq: data.code }
                }
            ]
        });
        const hotelStatus = {
            twilio: false,
            created: false
        };
        const operating_hours = operating_hours_1.getDefaultOperatingHours([
            shared_1.MealPeriod.Breakfast,
            shared_1.MealPeriod.Lunch_Dinner,
            shared_1.MealPeriod.Convenience
        ]);
        const defaultOperatingHours = class_transformer_1.plainToInstance(operating_hours_1.OperatingHoursValidation, operating_hours);
        const errors = yield service_sdk_1.validateInput(defaultOperatingHours);
        if (errors.length > 0) {
            throw new service_sdk_1.ValidationError(errors);
        }
        const service_fee = ((_a = data.service_fee) === null || _a === void 0 ? void 0 : _a.length) > 0 ? service_fee_1.orderServiceFee(data.service_fee) : [];
        const hub = yield hubRepository.getOneEntityOrFail(data.hub_id, ["city"]);
        const twilioClient = yield service_sdk_1.communicationClient(service_sdk_1.CommunicationClient.TWILIO);
        const phoneNumberDetails = yield twilioClient.provisionPhoneNumber({
            coordinates: hub.address_coordinates,
            name: data.name,
            voiceUrl: hub.city.voice_url
        });
        if (phoneNumberDetails) {
            hotelStatus.twilio = true;
        }
        const hotel = hotelRepository.create(Object.assign(Object.assign({}, data), { phone_number: phoneNumberDetails === null || phoneNumberDetails === void 0 ? void 0 : phoneNumberDetails.phoneNumber, service_fee,
            operating_hours, web_active: true }));
        hub.hotels.add(hotel);
        yield hotelRepository.persistAndFlush(hotel).then(() => {
            hotelStatus.created = true;
        });
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HOTEL, shared_1.HOTEL_EVENT.CREATED_ADAPTER, null, Object.assign(Object.assign({}, hotel), { entity: shared_1.ENTITY.NETWORK.HOTEL }));
        if (shouldNotify && process.env.STAGE === shared_1.STAGE.prod) {
            yield notifyOnHotelCreate(hotel, hotelStatus);
        }
        yield hotelRepository.populate(hotel, ["hub"]);
        return hotel;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/delete-hotel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
exports["default"] = (dependency) => {
    const { hotelRepository } = dependency;
    return (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const deleted = yield hotelRepository.softDelete(id);
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HOTEL, shared_1.HOTEL_EVENT.DELETED, null, {
            id,
            entity: shared_1.ENTITY.NETWORK.HOTEL
        });
        return deleted;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/get-hotel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
exports["default"] = (dependency) => {
    const { hotelRepository } = dependency;
    return (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return yield hotelRepository.getOneEntityOrFail({ id }, ["hub.city", "account_manager"]);
    });
};


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const list_hotels_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/list-hotels.ts");
const create_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/create-hotel.ts");
const update_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/update-hotel.ts");
const get_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/get-hotel.ts");
const entity_1 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
const delete_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/delete-hotel.ts");
const change_status_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/change-status-hotel.ts");
const entity_2 = __webpack_require__("./apps/service-network/src/hub/entity.ts");
exports["default"] = (dep) => {
    const { conn } = dep;
    return {
        listHotels: list_hotels_1.default({
            hotelRepository: conn.em.getRepository(entity_1.default)
        }),
        createHotel: create_hotel_1.default({
            hotelRepository: conn.em.getRepository(entity_1.default),
            hubRepository: conn.em.getRepository(entity_2.default)
        }),
        updateHotel: update_hotel_1.default({
            hotelRepository: conn.em.getRepository(entity_1.default),
            hubRepository: conn.em.getRepository(entity_2.default)
        }),
        getHotel: get_hotel_1.default({
            hotelRepository: conn.em.getRepository(entity_1.default)
        }),
        deleteHotel: delete_hotel_1.default({
            hotelRepository: conn.em.getRepository(entity_1.default)
        }),
        changeStatusHotel: change_status_hotel_1.default({
            hotelRepository: conn.em.getRepository(entity_1.default)
        })
    };
};


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/list-hotels.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const parseFilters = (filters) => {
    var _a, _b;
    const name = (_a = filters === null || filters === void 0 ? void 0 : filters.name) === null || _a === void 0 ? void 0 : _a.trim();
    const web_code = (_b = filters === null || filters === void 0 ? void 0 : filters.web_code) === null || _b === void 0 ? void 0 : _b.trim();
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ deleted_at: null }, (name && {
        $or: [
            {
                name: {
                    $ilike: `%${name}%`
                }
            },
            {
                contact_email: {
                    $ilike: `${name}%`
                }
            },
            {
                web_phone: {
                    $ilike: `${name}%`
                }
            },
            {
                code: {
                    $ilike: `${name}%`
                }
            }
        ]
    })), (filters.hub_ids && {
        hub_id: {
            $in: filters.hub_ids
        }
    })), (filters.statuses && { active: filters.statuses })), (filters.account_manager && { account_manager_id: filters.account_manager })), (web_code && { web_code: { $eq: web_code } }));
};
exports["default"] = (dependency) => {
    const { hotelRepository } = dependency;
    return (filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const whereFilters = parseFilters(filters);
        const options = Object.assign(Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.page) && { offset: (filters.page - 1) * filters.limit })), ((filters === null || filters === void 0 ? void 0 : filters.limit) && { limit: filters.limit })), { populate: ["hub.city"], orderBy: { created_at: core_1.QueryOrder.DESC } });
        return hotelRepository.findAndCount(whereFilters, options);
    });
};


/***/ }),

/***/ "./apps/service-network/src/hotel/usecases/update-hotel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateHotelInput = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const class_validator_1 = __webpack_require__("class-validator");
const entity_1 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
const class_transformer_1 = __webpack_require__("class-transformer");
const create_hotel_1 = __webpack_require__("./apps/service-network/src/hotel/usecases/create-hotel.ts");
const service_fee_1 = __webpack_require__("./apps/service-network/src/utils/service-fee.ts");
const operating_hours_1 = __webpack_require__("./apps/service-network/src/utils/operating-hours.ts");
class UpdateHotelInput {
}
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(500),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], UpdateHotelInput.prototype, "hub_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "formal_name", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "is_tax_exempt", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "active", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(6),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "address_street", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "address_number", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "address_town", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(10),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "address_zip_code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "address_coordinates", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "web_active", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "web_phone", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "web_url_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(3),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "web_code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "contact_person", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "contact_email", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], UpdateHotelInput.prototype, "account_manager_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], UpdateHotelInput.prototype, "room_count", void 0);
tslib_1.__decorate([
    class_validator_1.IsJSON(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", typeof (_a = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _a : Object)
], UpdateHotelInput.prototype, "room_numbers", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(500),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "delivery_instructions", void 0);
tslib_1.__decorate([
    class_validator_1.IsJSON(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", typeof (_b = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _b : Object)
], UpdateHotelInput.prototype, "reskin_config", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "allow_payment_room_charge", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "allow_payment_credit_card", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "allow_scheduled_orders", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "has_vouchers_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "has_pms_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "has_car_service_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHotelInput.prototype, "has_activities_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsDefined(),
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => operating_hours_1.OperatingHoursValidation),
    tslib_1.__metadata("design:type", typeof (_c = typeof entity_1.IOperatingHours !== "undefined" && entity_1.IOperatingHours) === "function" ? _c : Object)
], UpdateHotelInput.prototype, "operating_hours", void 0);
tslib_1.__decorate([
    class_validator_1.IsArray(),
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => create_hotel_1.ServiceFeeInput),
    tslib_1.__metadata("design:type", Array)
], UpdateHotelInput.prototype, "service_fee", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateHotelInput.prototype, "phone_number", void 0);
exports.UpdateHotelInput = UpdateHotelInput;
exports["default"] = (dep) => {
    const { hotelRepository, hubRepository } = dep;
    return (id, hotelInput) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const hotel = yield hotelRepository.getOneEntityOrFail({ id });
        if (hotelInput.name || hotelInput.web_url_id || hotelInput.web_code || hotelInput.code) {
            yield hotelRepository.failIfEntityExists({
                $or: [
                    (hotelInput.name && {
                        name: { $eq: hotelInput.name }
                    }),
                    (hotelInput.web_url_id && {
                        web_url_id: { $eq: hotelInput.web_url_id }
                    }),
                    (hotelInput.web_code && {
                        web_code: { $eq: hotelInput.web_code }
                    }),
                    (hotelInput.code && {
                        code: { $eq: hotelInput.code }
                    })
                ],
                id: {
                    $ne: id
                }
            });
        }
        if (hotelInput.hub_id) {
            yield hubRepository.getOneEntityOrFail({ id: hotelInput.hub_id });
        }
        core_1.wrap(hotel).assign(Object.assign(Object.assign(Object.assign({}, hotelInput), { hub: (_a = hotelInput.hub_id) !== null && _a !== void 0 ? _a : hotel.hub.id }), (((_b = hotelInput.service_fee) === null || _b === void 0 ? void 0 : _b.length) ? { service_fee: service_fee_1.orderServiceFee(hotelInput.service_fee) } : {})));
        yield hotelRepository.flush();
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HOTEL, shared_1.HOTEL_EVENT.UPDATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.HOTEL }, hotel));
        yield hotelRepository.populate(hotel, ["hub"]);
        return hotel;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const entity_1 = __webpack_require__("./apps/service-network/src/city/entity.ts");
const entity_2 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
const repository_1 = __webpack_require__("./apps/service-network/src/hub/repository.ts");
let Hub = class Hub extends service_sdk_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.active = false;
        this.has_nextmv_enabled = false;
        this.has_expeditor_app_enabled = false;
        this.hotels = new core_1.Collection(this);
    }
};
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    core_1.Unique(),
    tslib_1.__metadata("design:type", Number)
], Hub.prototype, "oms_id", void 0);
tslib_1.__decorate([
    core_1.ManyToOne({ entity: () => entity_1.default }),
    tslib_1.__metadata("design:type", typeof (_a = typeof entity_1.default !== "undefined" && entity_1.default) === "function" ? _a : Object)
], Hub.prototype, "city", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255 }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "name", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hub.prototype, "active", void 0);
tslib_1.__decorate([
    core_1.Property({
        nullable: true,
        type: service_sdk_1.NumericType
    }),
    tslib_1.__metadata("design:type", Number)
], Hub.prototype, "tax_rate", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "contact_phone", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "contact_email", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "address_street", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "address_number", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "address_town", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "address_zip_code", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "address_coordinates", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 50 }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "color", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hub.prototype, "has_nextmv_enabled", void 0);
tslib_1.__decorate([
    core_1.Property({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Hub.prototype, "has_expeditor_app_enabled", void 0);
tslib_1.__decorate([
    core_1.OneToMany({ entity: () => entity_2.default, mappedBy: "hub", orphanRemoval: true }),
    tslib_1.__metadata("design:type", Object)
], Hub.prototype, "hotels", void 0);
Hub = tslib_1.__decorate([
    core_1.Entity({
        customRepository: () => repository_1.HubRepository
    })
], Hub);
exports["default"] = Hub;


/***/ }),

/***/ "./apps/service-network/src/hub/repository.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HubRepository = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
class HubRepository extends service_sdk_1.CustomEntityRepository {
}
exports.HubRepository = HubRepository;


/***/ }),

/***/ "./apps/service-network/src/hub/route.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const express = __webpack_require__("express");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const usecases_1 = __webpack_require__("./apps/service-network/src/hub/usecases/index.ts");
const create_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/create-hub.ts");
const update_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/update-hub.ts");
const router = express.Router();
router.get("", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const [data, count] = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).listHubs(Object.assign(Object.assign({}, service_sdk_1.parsePaginationParam(req.query)), { name: req.query.name, city_ids: req.query.city_ids, statuses: req.query.statuses }));
        return res.send(service_sdk_1.httpResponse({
            payload: data,
            total: count || 0,
            nextPage: req.query.page ? Number(req.query.page) + 1 : 1
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.get("/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).getHub(Number(req.params.id));
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.post("", service_sdk_1.validateRequest(create_hub_1.CreateHubInput), (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).createHub(body);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.patch("/:id", service_sdk_1.validateRequest(update_hub_1.UpdateHubInput), (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const { id } = req.params;
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).updateHub(Number(id), body);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.delete("/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).deleteHub(Number(req.params.id));
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.patch("/status/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const data = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).changeStatusHub(Number(id), status);
        return res.send(service_sdk_1.httpResponse({
            payload: data
        }));
    }
    catch (e) {
        next(e);
    }
}));
router.patch("/reassign-hotels/:id", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payload = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: !req.isValid
        }).reassignHubHotels(req.body, Number(id));
        return res.send(service_sdk_1.httpResponse({
            payload
        }));
    }
    catch (e) {
        next(e);
    }
}));
exports["default"] = router;


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/create-hub.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateHubInput = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const class_validator_1 = __webpack_require__("class-validator");
class CreateHubInput {
}
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], CreateHubInput.prototype, "city_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], CreateHubInput.prototype, "oms_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.Min(0),
    class_validator_1.Max(99.99999),
    tslib_1.__metadata("design:type", Number)
], CreateHubInput.prototype, "tax_rate", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "contact_phone", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "contact_email", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "address_street", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "address_number", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "address_town", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(10),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "address_zip_code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(10),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "color", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", String)
], CreateHubInput.prototype, "address_coordinates", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHubInput.prototype, "has_nextmv_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHubInput.prototype, "active", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], CreateHubInput.prototype, "has_expeditor_app_enabled", void 0);
exports.CreateHubInput = CreateHubInput;
exports["default"] = (dependency) => {
    const { hubRepository, cityRepository } = dependency;
    return (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield hubRepository.failIfEntityExists({
            name: data.name
        });
        const city = yield cityRepository.getOneEntityOrFail({ id: data.city_id });
        const hub = hubRepository.create(data);
        city.hubs.add(hub);
        yield hubRepository.persistAndFlush(hub);
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HUB, shared_1.HUB_EVENT.CREATED_ADAPTER, null, Object.assign(Object.assign({}, hub), { entity: shared_1.ENTITY.NETWORK.HUB }));
        return hub;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/delete-hub.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
exports["default"] = (dependency) => {
    const { hubRepository } = dependency;
    return (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const hub = yield hubRepository.getOneEntityOrFail({ id }, ["hotels"]);
        const length = hub.hotels.count();
        if (length) {
            throw new service_sdk_1.ConflictError("Hub has hotel relations");
        }
        const deleted = yield hubRepository.softDelete(id);
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HUB, shared_1.HUB_EVENT.DELETED, null, {
            id,
            entity: shared_1.ENTITY.NETWORK.HUB
        });
        return deleted;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/get-hub.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
exports["default"] = (dependency) => {
    const { hubRepository } = dependency;
    return (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return hubRepository.getOneEntityOrFail({ id }, ["hotels", "city"]);
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const list_hubs_1 = __webpack_require__("./apps/service-network/src/hub/usecases/list-hubs.ts");
const create_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/create-hub.ts");
const update_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/update-hub.ts");
const get_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/get-hub.ts");
const entity_1 = __webpack_require__("./apps/service-network/src/hub/entity.ts");
const entity_2 = __webpack_require__("./apps/service-network/src/city/entity.ts");
const reassign_hotels_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/reassign-hotels-hub.ts");
const delete_hub_1 = __webpack_require__("./apps/service-network/src/hub/usecases/delete-hub.ts");
const update_status_1 = __webpack_require__("./apps/service-network/src/hub/usecases/update-status.ts");
const entity_3 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
exports["default"] = (dependency) => {
    const { conn } = dependency;
    return {
        listHubs: list_hubs_1.default({
            hubRepository: conn.em.getRepository(entity_1.default)
        }),
        createHub: create_hub_1.default({
            hubRepository: conn.em.getRepository(entity_1.default),
            cityRepository: conn.em.getRepository(entity_2.default)
        }),
        updateHub: update_hub_1.default({
            hubRepository: conn.em.getRepository(entity_1.default),
            cityRepository: conn.em.getRepository(entity_2.default)
        }),
        getHub: get_hub_1.default({
            hubRepository: conn.em.getRepository(entity_1.default)
        }),
        deleteHub: delete_hub_1.default({
            hubRepository: conn.em.getRepository(entity_1.default)
        }),
        changeStatusHub: update_status_1.default({
            hubRepository: conn.em.getRepository(entity_1.default)
        }),
        reassignHubHotels: reassign_hotels_hub_1.default({
            hubRepository: conn.em.getRepository(entity_1.default),
            hotelRepository: conn.em.getRepository(entity_3.default)
        })
    };
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/list-hubs.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const parseFilters = (filters) => {
    var _a;
    const name = (_a = filters === null || filters === void 0 ? void 0 : filters.name) === null || _a === void 0 ? void 0 : _a.trim();
    return Object.assign(Object.assign(Object.assign({ deleted_at: null }, (name && {
        $or: [
            {
                name: {
                    $ilike: `%${name}%`
                }
            },
            {
                contact_email: {
                    $ilike: `%${name}%`
                }
            },
            {
                contact_phone: {
                    $ilike: `%${name}%`
                }
            }
        ]
    })), (filters.city_ids && {
        city_id: {
            $in: filters.city_ids
        }
    })), (filters.statuses && { active: filters.statuses }));
};
exports["default"] = (dependency) => {
    const { hubRepository } = dependency;
    return (filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const whereFilters = parseFilters(filters);
        const options = Object.assign(Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.page) && { offset: (filters.page - 1) * filters.limit })), ((filters === null || filters === void 0 ? void 0 : filters.limit) && { limit: filters.limit })), { populate: ["city", "hotels"], orderBy: { created_at: core_1.QueryOrder.DESC } });
        return hubRepository.findAndCount(whereFilters, options);
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/reassign-hotels-hub.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
exports["default"] = (dependency) => {
    const { hubRepository, hotelRepository } = dependency;
    function validateHotelIds(hotels, hotelHubs) {
        hotels.getItems().forEach((hotel) => {
            if (!hotelHubs.find((element) => element.hotelId === hotel.id)) {
                return false;
            }
            return true;
        });
        return true;
    }
    return (hotelHubs, hubIdToDeactivate) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const hubToDeactivate = yield hubRepository.getOneEntityOrFail({ id: hubIdToDeactivate }, ["hotels"]);
        const length = hubToDeactivate.hotels.count();
        if (length !== hotelHubs.length) {
            throw new service_sdk_1.ConflictError("Please make sure to reassign all hotels!");
        }
        if (!validateHotelIds(hubToDeactivate.hotels, hotelHubs)) {
            throw new service_sdk_1.NotFoundError("Hotel ids are not relevant!");
        }
        const hubs = yield hubRepository.find({ id: { $in: hotelHubs.map((el) => el.hubId) }, deleted_at: null });
        const hotels = yield hotelRepository.find({ id: { $in: hotelHubs.map((el) => el.hotelId) }, deleted_at: null });
        const hotelsForEvent = [];
        hotelHubs.forEach((data) => {
            const hub = hubs.find((el) => el.id === data.hubId);
            if (!hub) {
                throw new service_sdk_1.NotFoundError("Hub not found");
            }
            if (!hub.active) {
                throw new service_sdk_1.ConflictError("You can not assign Hotel to an inactive Hub!");
            }
            const hotel = hotels.find((el) => el.id === data.hotelId);
            if (!hotel) {
                throw new service_sdk_1.NotFoundError("Hotel not found");
            }
            if (data.hubId === hubIdToDeactivate) {
                throw new service_sdk_1.ConflictError("Can not set deactivated hub on reassign hotels");
            }
            core_1.wrap(hotel).assign({ hub: data.hubId });
            hotelsForEvent.push(hotel);
        });
        yield hotelRepository.flush();
        if (!hubToDeactivate) {
            throw new service_sdk_1.NotFoundError("Hub not found");
        }
        core_1.wrap(hubToDeactivate).assign({ active: false });
        yield hubRepository.flush();
        for (const hotel of hotelsForEvent) {
            yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HOTEL, shared_1.HOTEL_EVENT.UPDATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.HOTEL }, hotel));
        }
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HUB, shared_1.HOTEL_EVENT.UPDATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.HUB }, hubToDeactivate));
        return hubRepository.findOne({ id: hubIdToDeactivate });
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/update-hub.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateHubInput = void 0;
const tslib_1 = __webpack_require__("tslib");
/* eslint-disable unused-imports/no-unused-vars */
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const class_validator_1 = __webpack_require__("class-validator");
class UpdateHubInput {
}
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], UpdateHubInput.prototype, "city_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Number)
], UpdateHubInput.prototype, "oms_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.Min(0),
    class_validator_1.Max(99.99999),
    tslib_1.__metadata("design:type", Number)
], UpdateHubInput.prototype, "tax_rate", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "contact_phone", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "contact_email", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "address_street", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(50),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "address_number", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(255),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "address_town", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    class_validator_1.MaxLength(10),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "address_zip_code", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.MaxLength(10),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "color", void 0);
tslib_1.__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", String)
], UpdateHubInput.prototype, "address_coordinates", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHubInput.prototype, "has_nextmv_enabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateHubInput.prototype, "has_expeditor_app_enabled", void 0);
exports.UpdateHubInput = UpdateHubInput;
exports["default"] = (dependency) => {
    const { hubRepository, cityRepository } = dependency;
    return (id, hubInput) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const hub = yield hubRepository.getOneEntityOrFail({ id });
        yield hubRepository.failIfEntityExists({
            name: hubInput.name,
            id: {
                $ne: id
            }
        });
        if (hubInput.city_id) {
            yield cityRepository.getOneEntityOrFail({ id: hubInput.city_id });
        }
        const { hotels } = hubInput, data = tslib_1.__rest(hubInput, ["hotels"]);
        core_1.wrap(hub).assign(Object.assign(Object.assign({}, data), { city: (_a = hubInput.city_id) !== null && _a !== void 0 ? _a : hub.city.id }));
        yield hubRepository.flush();
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HUB, shared_1.HUB_EVENT.UPDATED, null, Object.assign({ entity: shared_1.ENTITY.NETWORK.HUB }, hub));
        yield hubRepository.populate(hub, ["city"]);
        return hub;
    });
};


/***/ }),

/***/ "./apps/service-network/src/hub/usecases/update-status.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
exports["default"] = (dependency) => {
    const { hubRepository } = dependency;
    return (id, status) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const hub = yield hubRepository.getOneEntityOrFail({ id }, ["hotels"]);
        const { length } = hub.hotels.count;
        if (!status && length) {
            throw new service_sdk_1.ConflictError("This hub has hotels that need to be assigned to another hub.");
        }
        core_1.wrap(hub).assign({ active: status });
        yield hubRepository.flush();
        const payload = Object.assign({ entity: shared_1.ENTITY.NETWORK.HUB }, hub);
        yield service_sdk_1.eventProvider.client().publish(shared_1.SNS_TOPIC.NETWORK.HUB, shared_1.HUB_EVENT.UPDATED, null, payload);
        return hub;
    });
};


/***/ }),

/***/ "./apps/service-network/src/listeners/network-on-iam-user-action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const entity_1 = __webpack_require__("./apps/service-network/src/user/entity.ts");
const entities_1 = __webpack_require__("./apps/service-network/src/entities.ts");
const userEvents = (userRepository) => {
    const userCreated = (context, data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const user = userRepository.create(data);
        yield userRepository.persistAndFlush(user);
    });
    const userUpdated = (context, data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const user = yield userRepository.findOneOrFail({ id: data.id });
        core_1.wrap(user).assign(data);
        yield userRepository.flush();
    });
    const userDeleted = (context, data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const user = yield userRepository.findOneOrFail({ id: data.id });
        user.deleted_at = new Date();
        yield userRepository.flush();
    });
    return {
        userCreated,
        userUpdated,
        userDeleted
    };
};
function networkOnUserAction(event) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (event.source === shared_1.warmupkey) {
            service_sdk_1.logger.log("WarmUP - Lambda is warm!");
            return;
        }
        // TODO revisit for tenant implementation
        const { conn: { em } } = yield service_sdk_1.getConnection({
            tenant: process.env.DEFAULT_TENANT,
            service: shared_1.AppEnum.NETWORK,
            dbname: process.env.DB,
            entities: entities_1.NetworkEntities.asArray(),
            pooling: false,
            subscribers: []
        });
        const userRepository = em.getRepository(entity_1.default);
        for (const record of event.Records) {
            const bodyParsed = JSON.parse(record.body);
            const { context, data } = bodyParsed;
            const messageAttributes = record.MessageAttributes || record.messageAttributes;
            switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
                case shared_1.USER_EVENT.CREATED_ADAPTER:
                    service_sdk_1.logger.log("user create event sent to adapter");
                    break;
                case shared_1.USER_EVENT.CREATED:
                    yield userEvents(userRepository).userCreated(context, data);
                    break;
                case shared_1.USER_EVENT.UPDATED:
                    yield userEvents(userRepository).userUpdated(context, data);
                    break;
                case shared_1.USER_EVENT.DELETED:
                    yield userEvents(userRepository).userDeleted(context, data);
                    break;
                default:
                    throw new service_sdk_1.BadRequestError(shared_1.DEFAULT_EVENT_ERROR_MESSAGE);
            }
        }
    });
}
exports["default"] = networkOnUserAction;


/***/ }),

/***/ "./apps/service-network/src/listeners/network-on-menu-action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hotelEvents = exports.hotelAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const class_transformer_1 = __webpack_require__("class-transformer");
const core_1 = __webpack_require__("@mikro-orm/core");
const entity_1 = __webpack_require__("./apps/service-network/src/hotel/entity.ts");
const operating_hours_1 = __webpack_require__("./apps/service-network/src/utils/operating-hours.ts");
const entities_1 = __webpack_require__("./apps/service-network/src/entities.ts");
const hotelEvents = (hotelRepository) => {
    const hotelsAssigned = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const unassignedHotels = yield hotelRepository.find({ id: { $in: data.unassignedHotelIds } });
        unassignedHotels === null || unassignedHotels === void 0 ? void 0 : unassignedHotels.forEach((hotel) => {
            core_1.wrap(hotel).assign({ operating_hours: "[]" });
            core_1.wrap(hotel).assign({ menu_id: null });
        });
        yield hotelRepository.flush();
        const hotels = yield hotelRepository.find({ id: { $in: data.hotels.map((el) => el.id) } });
        // To do: Remove default known categories and accept categories from data
        const operatingHours = operating_hours_1.getDefaultOperatingHours([
            shared_1.MealPeriod.Breakfast,
            shared_1.MealPeriod.Lunch_Dinner,
            shared_1.MealPeriod.Convenience
        ]);
        const defaultOperatingHours = class_transformer_1.plainToInstance(operating_hours_1.OperatingHoursValidation, operatingHours);
        const errors = yield service_sdk_1.validateInput(defaultOperatingHours);
        if (errors.length > 0) {
            throw new service_sdk_1.ValidationError(errors);
        }
        hotels.forEach((hotel) => {
            core_1.wrap(hotel).assign({ operating_hours: operatingHours });
            core_1.wrap(hotel).assign({ menu_id: data.id });
        });
        yield hotelRepository.flush();
    });
    return {
        hotelsAssigned
    };
};
exports.hotelEvents = hotelEvents;
function hotelAction(event) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (event.source === shared_1.warmupkey) {
            console.log("WarmUP - Lambda is warm!");
            return;
        }
        // TODO revisit for tenant implementation
        const { conn: { em } } = yield service_sdk_1.getConnection({
            tenant: process.env.DEFAULT_TENANT,
            service: shared_1.AppEnum.NETWORK,
            dbname: process.env.DB,
            entities: entities_1.NetworkEntities.asArray(),
            pooling: false,
            subscribers: []
        });
        const hotelRepository = em.getRepository(entity_1.default);
        for (const record of event.Records) {
            const bodyParsed = JSON.parse(record.body);
            const { data } = bodyParsed;
            const messageAttributes = record.MessageAttributes || record.messageAttributes;
            switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
                case shared_1.MENU_EVENT.HOTELS_ASSIGNED:
                    yield hotelEvents(hotelRepository).hotelsAssigned(data);
                    break;
                default:
                    throw new service_sdk_1.BadRequestError("Bad event name provided");
            }
        }
    });
}
exports["default"] = hotelAction;
exports.hotelAction = hotelAction;


/***/ }),

/***/ "./apps/service-network/src/main.ts":
/***/ ((module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express = __webpack_require__("express");
const cors = __webpack_require__("cors");
const bodyParser = __webpack_require__("body-parser");
const serverless = __webpack_require__("serverless-http");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const network_on_iam_user_action_1 = __webpack_require__("./apps/service-network/src/listeners/network-on-iam-user-action.ts");
const network_on_menu_action_1 = __webpack_require__("./apps/service-network/src/listeners/network-on-menu-action.ts");
const route_1 = __webpack_require__("./apps/service-network/src/hub/route.ts");
const route_2 = __webpack_require__("./apps/service-network/src/hotel/route.ts");
const route_3 = __webpack_require__("./apps/service-network/src/city/route.ts");
const route_4 = __webpack_require__("./apps/service-network/src/user/route.ts");
const entities_1 = __webpack_require__("./apps/service-network/src/entities.ts");
const app = express();
const jsonParser = bodyParser.json();
app.use(service_sdk_1.dbctxInjector({
    servicedb: process.env.DB,
    entities: entities_1.NetworkEntities.asArray(),
    service: shared_1.AppEnum.NETWORK,
    subscribers: []
}));
app.use(cors());
app.use(jsonParser);
app.use("/api/network/hubs", route_1.default);
app.use("/api/network/hotels", route_2.default);
app.use("/api/network/cities", route_3.default);
app.use("/api/network/users", route_4.default);
app.use(service_sdk_1.errorHandler);
if (process.env.STAGE === "local") {
    service_sdk_1.expressLocal(app, shared_1.AppEnum.NETWORK);
    service_sdk_1.eventsLocal({
        ServiceIamUserTopic: [network_on_iam_user_action_1.default],
        ServiceMenuMenuTopic: [network_on_menu_action_1.default]
    });
}
module.exports.handler = serverless(app);
module.exports.up = service_sdk_1.up;
module.exports.down = service_sdk_1.down;
module.exports.networkUserOnIamUserAction = shared_1.lambdaWarmupWrapper(network_on_iam_user_action_1.default);
module.exports.networkMenuOnMenuMenuAction = shared_1.lambdaWarmupWrapper(network_on_menu_action_1.default);


/***/ }),

/***/ "./apps/service-network/src/user/entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const repository_1 = __webpack_require__("./apps/service-network/src/user/repository.ts");
let User = class User extends service_sdk_1.BaseEntity {
};
tslib_1.__decorate([
    core_1.Property({ primary: true }),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255 }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "name", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    core_1.Unique(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    core_1.Property({ length: 255 }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "status", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true, default: "[]" }),
    tslib_1.__metadata("design:type", typeof (_a = typeof core_1.JsonType !== "undefined" && core_1.JsonType) === "function" ? _a : Object)
], User.prototype, "roles", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    core_1.Unique(),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "oms_id", void 0);
tslib_1.__decorate([
    core_1.Property({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "phone_number", void 0);
User = tslib_1.__decorate([
    core_1.Entity({ tableName: "iam_user", customRepository: () => repository_1.UserRepository })
], User);
exports["default"] = User;


/***/ }),

/***/ "./apps/service-network/src/user/repository.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepository = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
class UserRepository extends service_sdk_1.CustomEntityRepository {
}
exports.UserRepository = UserRepository;


/***/ }),

/***/ "./apps/service-network/src/user/route.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const express = __webpack_require__("express");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const usecases_1 = __webpack_require__("./apps/service-network/src/user/usecases/index.ts");
const router = express.Router();
router.get("", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const [data, count] = yield usecases_1.default({
            conn: req.conn,
            tenant: req.tenant,
            validate: false
        }).listUsers(Object.assign(Object.assign({}, service_sdk_1.parsePaginationParam(req.query)), { id: Number(req.query.id), name: req.query.name }));
        return res.send(service_sdk_1.httpResponse({
            payload: data,
            total: count || 0,
            nextPage: req.query.page ? Number(req.query.page) + 1 : 1
        }));
    }
    catch (e) {
        next(e);
    }
}));
exports["default"] = router;


/***/ }),

/***/ "./apps/service-network/src/user/usecases/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const entity_1 = __webpack_require__("./apps/service-network/src/user/entity.ts");
const list_users_1 = __webpack_require__("./apps/service-network/src/user/usecases/list-users.ts");
exports["default"] = (dependency) => {
    return {
        listUsers: list_users_1.default({
            userRepository: dependency.conn.em.getRepository(entity_1.default)
        })
    };
};


/***/ }),

/***/ "./apps/service-network/src/user/usecases/list-users.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
exports["default"] = (dependency) => {
    const { userRepository } = dependency;
    return (filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const name = (_a = filters === null || filters === void 0 ? void 0 : filters.name) === null || _a === void 0 ? void 0 : _a.trim();
        const whereFilters = {
            $or: [
                Object.assign({}, (filters.id && {
                    id: {
                        $eq: filters.id
                    }
                })),
                Object.assign({}, (name && {
                    name: {
                        $ilike: `%${name}%`
                    }
                }))
            ]
        };
        return userRepository.findAndCount(whereFilters);
    });
};


/***/ }),

/***/ "./apps/service-network/src/utils/constants.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EMAILS = exports.EMAIL_STATUS = exports.ONBOARDING_MESSAGE = exports.ENTITY = exports.SNS_TOPIC = void 0;
exports.SNS_TOPIC = {
    HOTEL: process.env.ServiceNetworkHotelTopic || "ServiceNetworkHotelTopic",
    HUB: process.env.ServiceNetworkHubTopic || "ServiceNetworkHubTopic",
    CITY: process.env.ServiceNetworkCityTopic || "ServiceNetworkCityTopic"
};
var ENTITY;
(function (ENTITY) {
    ENTITY["HOTEL"] = "hotel";
    ENTITY["HUB"] = "hub";
    ENTITY["CITY"] = "city";
})(ENTITY = exports.ENTITY || (exports.ENTITY = {}));
exports.ONBOARDING_MESSAGE = "Butler Menu will automatically be updated in approximately 5 minutes. If this is a critical partner, please manually confirm that the hotel appears on our site!";
var EMAIL_STATUS;
(function (EMAIL_STATUS) {
    EMAIL_STATUS["ONBOARDING_COMPLETED"] = "Onboarding Completed";
    EMAIL_STATUS["ONBOARDING_FAILED"] = "Onboarding Failed";
})(EMAIL_STATUS = exports.EMAIL_STATUS || (exports.EMAIL_STATUS = {}));
var EMAILS;
(function (EMAILS) {
    EMAILS["SUPPORT"] = "support@butlermenu.com";
    EMAILS["DEV"] = "dev@butlerhospitality.com";
    EMAILS["QA"] = "qa@butlerhospitality.com";
    EMAILS["HOTELS"] = "hotels@butlerhospitality.com";
})(EMAILS = exports.EMAILS || (exports.EMAILS = {}));


/***/ }),

/***/ "./apps/service-network/src/utils/email-notification.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildEmailBody = exports.createButlerMenuQRCodes = exports.getEmailsToNotify = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const constants_1 = __webpack_require__("./apps/service-network/src/utils/constants.ts");
const getEmailsToNotify = () => {
    switch (process.env.STAGE) {
        case shared_1.STAGE.prod:
            return [constants_1.EMAILS.DEV, constants_1.EMAILS.HOTELS];
        case shared_1.STAGE.dev:
            return [constants_1.EMAILS.DEV, constants_1.EMAILS.QA];
        default:
            return [constants_1.EMAILS.DEV];
    }
};
exports.getEmailsToNotify = getEmailsToNotify;
const createButlerMenuQRCodes = (hotel, processStatus) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let codes = [];
    if (Object.values(processStatus).every(Boolean)) {
        const rybQR = yield service_sdk_1.generateQRCode(process.env.RYB_BASE_URL + hotel.web_url_id);
        const butlerMenuQR = yield service_sdk_1.generateQRCode(process.env.BUTLER_MENU_BASE_URL + hotel.web_url_id);
        codes = [
            {
                "Name": "ryb.png",
                "Content": rybQR.slice(rybQR.indexOf("base64,") + 7),
                "ContentType": "image/png"
            },
            {
                "Name": "menu.png",
                "Content": butlerMenuQR.slice(butlerMenuQR.indexOf("base64,") + 7),
                "ContentType": "image/png"
            }
        ];
    }
    return codes;
});
exports.createButlerMenuQRCodes = createButlerMenuQRCodes;
const buildEmailBody = (hotel, hotelStatus, message, htmlBody = true) => {
    const twilioMessage = hotelStatus.twilio && hotel.phone_number ? hotel.phone_number : "Failure";
    const hotelMessage = hotelStatus.created ? hotel.name : "Failure";
    if (htmlBody) {
        return `
    <div>
    Hi there, <br>
    
    There has been a new Hotel created with these information: <br> <br>
    Hotel Name: ${hotelMessage}  <br>
    Twilio Number: ${twilioMessage}  <br> <br>
    ${message}
    </div>
    `;
    }
    return `
  Hi there,
  There has been a new Hotel created with these information:
  Hotel Name: ${hotelMessage}
  Twilio Number: ${twilioMessage}
  ${message}
  `;
};
exports.buildEmailBody = buildEmailBody;


/***/ }),

/***/ "./apps/service-network/src/utils/operating-hours.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDefaultOperatingHours = exports.genDefaultOperatingHours = exports.OperatingHoursValidation = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const class_validator_1 = __webpack_require__("class-validator");
const class_transformer_1 = __webpack_require__("class-transformer");
class AvailabilityTime {
}
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Boolean)
], AvailabilityTime.prototype, "isActive", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], AvailabilityTime.prototype, "startTime", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], AvailabilityTime.prototype, "endTime", void 0);
class AvailabilityDay {
}
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Boolean)
], AvailabilityDay.prototype, "isAvailable", void 0);
tslib_1.__decorate([
    class_validator_1.IsBoolean(),
    class_validator_1.IsOptional(),
    tslib_1.__metadata("design:type", Boolean)
], AvailabilityDay.prototype, "isWebEnabled", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_c = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _c : Object)
], AvailabilityDay.prototype, "Monday", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_d = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _d : Object)
], AvailabilityDay.prototype, "Tuesday", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_e = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _e : Object)
], AvailabilityDay.prototype, "Wednesday", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_f = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _f : Object)
], AvailabilityDay.prototype, "Thursday", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_g = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _g : Object)
], AvailabilityDay.prototype, "Friday", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_h = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _h : Object)
], AvailabilityDay.prototype, "Saturday", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityTime),
    tslib_1.__metadata("design:type", typeof (_j = typeof shared_1.Day !== "undefined" && shared_1.Day) === "function" ? _j : Object)
], AvailabilityDay.prototype, "Sunday", void 0);
class OperatingHoursValidation {
}
_k = shared_1.MealPeriod.Breakfast, _l = shared_1.MealPeriod.Lunch_Dinner, _m = shared_1.MealPeriod.Convenience;
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_transformer_1.Type(() => AvailabilityDay),
    class_validator_1.ValidateNested({ each: true }),
    tslib_1.__metadata("design:type", String)
], OperatingHoursValidation.prototype, _k, void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => AvailabilityDay),
    tslib_1.__metadata("design:type", String)
], OperatingHoursValidation.prototype, _l, void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => AvailabilityDay),
    tslib_1.__metadata("design:type", String)
], OperatingHoursValidation.prototype, _m, void 0);
exports.OperatingHoursValidation = OperatingHoursValidation;
const genDefaultOperatingHours = (data) => {
    const ob = { isAvailable: data.isAvailable, isWebEnabled: data.isWebEnabled };
    Object.keys(shared_1.Day).forEach((day) => {
        ob[day] = {
            isActive: true,
            startTime: data.startTime,
            endTime: data.endTime
        };
    });
    return ob;
};
exports.genDefaultOperatingHours = genDefaultOperatingHours;
const getDefaultOperatingHours = (categories) => {
    const result = {};
    categories.forEach((period) => {
        if (!shared_1.MealPeriod[period]) {
            throw new Error(`Provided period/category ${period} does not exist in ${shared_1.MealPeriod}`);
        }
        switch (period) {
            case shared_1.MealPeriod.Breakfast:
                result[period] = exports.genDefaultOperatingHours({ startTime: "06:30 AM", endTime: "11:30 AM", isAvailable: true, isWebEnabled: true });
                break;
            case shared_1.MealPeriod.Lunch_Dinner:
                result[period] = exports.genDefaultOperatingHours({ startTime: "11:30 AM", endTime: "11:30 PM", isAvailable: true, isWebEnabled: true });
                break;
            case shared_1.MealPeriod.Convenience:
                result[period] = exports.genDefaultOperatingHours({ startTime: "06:30 AM", endTime: "11:30 PM", isAvailable: true, isWebEnabled: true });
                break;
        }
    });
    return result;
};
exports.getDefaultOperatingHours = getDefaultOperatingHours;


/***/ }),

/***/ "./apps/service-network/src/utils/service-fee.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.orderServiceFee = void 0;
const orderServiceFee = (service_fee) => {
    return service_fee.map((s) => {
        return Object.assign(Object.assign({}, s), { fee_values: s.fee_values.sort((a, b) => Number(a.order) > Number(b.order) ? 1 : -1) });
    });
};
exports.orderServiceFee = orderServiceFee;


/***/ }),

/***/ "./libs/service-sdk/analytics-provider/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsProviderType = exports.analytics = void 0;
const tslib_1 = __webpack_require__("tslib");
const utils_1 = __webpack_require__("./libs/service-sdk/utils/index.ts");
const segment_1 = __webpack_require__("./libs/service-sdk/analytics-provider/segment.ts");
var AnalyticsProviderType;
(function (AnalyticsProviderType) {
    AnalyticsProviderType["SEGMENT"] = "SEGMENT";
})(AnalyticsProviderType || (AnalyticsProviderType = {}));
exports.AnalyticsProviderType = AnalyticsProviderType;
class AnalyticsError extends utils_1.BaseError {
    constructor(message, code = utils_1.StatusCodes.INTERNAL_SERVER) {
        super("Analytics Error", code, message);
    }
}
class AnalyticsProvider {
    constructor(providerType) {
        this.providerType = AnalyticsProviderType[providerType];
        if (this.providerType === AnalyticsProviderType.SEGMENT) {
            this.provider = segment_1.SegmentProvider;
        }
        else {
            throw new AnalyticsError(`Analytics provider ${this.providerType} is not supported`, utils_1.StatusCodes.NOT_IMPLEMENTED);
        }
    }
    identify(userId, properties) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.provider().identify(userId, properties);
        });
    }
    track(event, userId, properties) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.provider().track(event, userId, properties);
        });
    }
    page(name, userId, properties) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.provider().page(name, userId, properties);
        });
    }
}
// TODO: Arber, refactor this implementation. We don't need multiple instances for the same provider
const segmentAnalytics = new AnalyticsProvider(AnalyticsProviderType.SEGMENT);
const analytics = (providerType) => {
    if (providerType === AnalyticsProviderType.SEGMENT) {
        return segmentAnalytics;
    }
    return new AnalyticsProvider(providerType);
};
exports.analytics = analytics;


/***/ }),

/***/ "./libs/service-sdk/analytics-provider/segment.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SegmentProvider = void 0;
const tslib_1 = __webpack_require__("tslib");
const Analytics = __webpack_require__("analytics-node");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const createAnalyticsClient = (key) => {
    const stage = process.env.STAGE;
    switch (stage) {
        case "dev":
        case "development":
        case "staging":
        case "prod":
        case "production":
            return new Analytics(key);
        default:
            return {
                identify: (data) => {
                    logger_1.logger.log("Segment identify local: ", data);
                    return data;
                },
                track: (data) => {
                    logger_1.logger.log("Segment track local: ", data);
                    return data;
                },
                page: (data) => {
                    logger_1.logger.log("Segment page local: ", data);
                    return data;
                }
            };
    }
};
const SegmentProvider = () => {
    const client = createAnalyticsClient("homOA2Mvwh1tYM3ZGAyLQ28OB4DIe0Y0");
    const identify = (userId, traits) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            client.identify({
                userId,
                traits
            }, (err) => {
                if (err) {
                    logger_1.logger.error("An error happened while using segment identify: ", err);
                    return reject(err);
                }
            });
            resolve();
        });
    });
    const track = (event, userId, properties) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            client.track({
                userId,
                event,
                properties
            }, (err) => {
                if (err) {
                    logger_1.logger.error("An error happened while using segment track: ", err);
                    return reject(err);
                }
            });
            resolve();
        });
    });
    const page = (name, userId, properties) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            client.page({
                userId,
                name,
                properties
            }, (err) => {
                if (err) {
                    logger_1.logger.error("An error happened while using segment page: ", err);
                    return reject(err);
                }
            });
            resolve();
        });
    });
    return {
        page,
        track,
        identify
    };
};
exports.SegmentProvider = SegmentProvider;


/***/ }),

/***/ "./libs/service-sdk/authorizer/authorizer.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOrigin = exports.handler = void 0;
const tslib_1 = __webpack_require__("tslib");
const AWS = __webpack_require__("aws-sdk");
const use_cases_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/index.ts");
const validate_request_headers_1 = __webpack_require__("./libs/service-sdk/authorizer/validators/validate-request-headers.ts");
const validate_local_1 = __webpack_require__("./libs/service-sdk/authorizer/validators/validate-local.ts");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const warmupkey = "serverless-plugin-warmup";
const dynamoDB = new AWS.DynamoDB.DocumentClient(process.env.STAGE === "local" ? {
    region: "localhost",
    endpoint: "http://0.0.0.0:8000"
} : {});
const getOrigin = (event) => {
    const origin = event.headers.referer || event.headers.Referer || event.headers.authority || event.headers.Authority || event.headers.Origin || event.headers.origin;
    if (origin) {
        const spl = origin.split(".");
        if (spl && spl.length) {
            const protomatch = /^(https?):\/\//;
            return spl[0].replace(protomatch, "");
        }
    }
};
exports.getOrigin = getOrigin;
const mutateUserPermissionsToArray = (user) => {
    user.permissions = user.permissions.map((perm) => perm.name);
};
const handler = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let tenant = null;
    try {
        yield validate_request_headers_1.validateRequestHeaders(event);
        const origin = getOrigin(event);
        tenant = yield use_cases_1.getTenant(dynamoDB, origin);
    }
    catch (err) {
        logger_1.logger.log("[load-tenant-error]: ", err);
        return use_cases_1.getDenyPolicy();
    }
    let payload = null;
    try {
        payload = yield use_cases_1.verifyToken(event.headers.Authorization || event.headers.authorization, tenant);
    }
    catch (err) {
        logger_1.logger.log("[verify-token-error]: ", err);
        return use_cases_1.getDenyPolicy();
    }
    if (!payload) {
        return use_cases_1.getDenyPolicy();
    }
    let user = { permissions: [] };
    try {
        user = yield use_cases_1.getUser(payload.username);
    }
    catch (e) {
        logger_1.logger.log("[get-user-error]: ", e);
        return use_cases_1.getDenyPolicy();
    }
    const localDenyPolicy = yield validate_local_1.validateLocal(user.permissions, {
        uri: event.path,
        action: event.requestContext.httpMethod
    });
    logger_1.logger.log("localdeny: ", localDenyPolicy);
    const policyDocument = yield use_cases_1.generatePolicyDocument(user.permissions);
    mutateUserPermissionsToArray(user);
    policyDocument.context = {
        tenant: JSON.stringify(tenant),
        user: JSON.stringify(user)
    };
    return policyDocument;
});
exports.handler = handler;


/***/ }),

/***/ "./libs/service-sdk/authorizer/context-injector.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.contextInjector = exports.dbctxInjector = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const connection_1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/connection.ts");
const passthrough_1 = __webpack_require__("./libs/service-sdk/authorizer/validators/passthrough.ts");
const authorizer_1 = __webpack_require__("./libs/service-sdk/authorizer/authorizer.ts");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const dbctxInjector = (dep) => {
    const { servicedb, entities, service, subscribers } = dep;
    return (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (((_b = (_a = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _a === void 0 ? void 0 : _a.event) === null || _b === void 0 ? void 0 : _b.source) === shared_1.warmupkey) {
            logger_1.logger.log("WarmUP - Lambda is warm!");
            return;
        }
        try {
            const origin = authorizer_1.getOrigin(req);
            const { conn, repositories } = yield connection_1.getConnection({
                tenant: origin,
                dbname: servicedb,
                entities,
                pooling: true,
                service,
                subscribers
            });
            req.conn = conn;
            req.repositories = repositories;
            req.tenant = origin;
            return next();
        }
        catch (err) {
            logger_1.logger.log("dbctx-injector-error: ", err);
            res.status(500).json({
                status: 500,
                message: "Connection could not be established"
            });
        }
    });
};
exports.dbctxInjector = dbctxInjector;
const contextInjector = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    logger_1.logger.log("context-injector-warmup-event: ", (_b = (_a = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _a === void 0 ? void 0 : _a.event) === null || _b === void 0 ? void 0 : _b.source);
    if (((_d = (_c = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _c === void 0 ? void 0 : _c.event) === null || _d === void 0 ? void 0 : _d.source) === shared_1.warmupkey) {
        logger_1.logger.log("WarmUP - Lambda is warm!");
        return;
    }
    try {
        if (passthrough_1.isExempt(req.path)) {
            return next();
        }
        const requestContext = req.requestContext || createRequestContext(req);
        requestContext.authorizer = requestContext.authorizer || (yield authorize(createEvent(req, requestContext)));
        req.actionContext = createActionContext(requestContext);
        logger_1.logger.log("LOGGER HERE");
        return next();
    }
    catch (err) {
        logger_1.logger.log({ err });
        res.status(403).json({
            status: 403,
            message: err.message
        });
    }
});
exports.contextInjector = contextInjector;
const createActionContext = (requestContext) => {
    const tenant = JSON.parse(requestContext.authorizer.tenant || requestContext.authorizer.context.tenant);
    const userDetails = requestContext.authorizer.user || requestContext.authorizer.context.user;
    return {
        tenant,
        authorizedUser: typeof userDetails === "string" ? JSON.parse(userDetails) : userDetails
    };
};
const createRequestContext = (req) => {
    return {
        accountId: "",
        apiId: "",
        httpMethod: req.method.toUpperCase(),
        identity: undefined,
        path: req.path,
        protocol: "",
        requestId: "",
        requestTimeEpoch: 0,
        resourceId: "",
        resourcePath: "",
        stage: "",
        authorizer: undefined
    };
};
const createEvent = (req, requestContext) => {
    return {
        headers: req.headers,
        httpMethod: req.method.toUpperCase(),
        isBase64Encoded: false,
        multiValueHeaders: undefined,
        multiValueQueryStringParameters: undefined,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: req.query,
        requestContext,
        resource: "",
        stageVariables: undefined,
        body: req.body
    };
};
const authorize = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.STAGE === "local") {
        try {
            const data = yield authorizer_1.handler(event);
            if (data.context && data.context.deny) {
                throw new Error("Permission denied");
            }
            return data;
        }
        catch (e) {
            logger_1.logger.log("[local-authorizer-error]: ", e);
            throw new Error("Permission denied");
        }
    }
});


/***/ }),

/***/ "./libs/service-sdk/authorizer/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/authorizer.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/context-injector.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/authorizer/pgutil.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSingle = exports.queryexec = exports.pool = void 0;
const tslib_1 = __webpack_require__("tslib");
/* eslint-disable @typescript-eslint/no-explicit-any */
const pg_1 = __webpack_require__("pg");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
exports.pool = new pg_1.Pool({
    user: process.env.POSTGRES_USER || "platform",
    host: process.env.POSTGRES_HOST || "0.0.0.0",
    database: "service_iam",
    password: process.env.POSTGRES_PASSWORD || "platform",
    port: 5432
});
const queryexec = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now();
    try {
        const res = yield exports.pool.query(input);
        const duration = Date.now() - start;
        logger_1.logger.log("executed query", { input, duration, rows: res.rowCount });
        return res;
    }
    catch (e) {
        logger_1.logger.log("exec query error: ", e);
    }
    return { command: "", rows: [], rowCount: 0 };
});
exports.queryexec = queryexec;
const getSingle = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const res = yield exports.queryexec(input);
    return res.command == "SELECT" && res.rows && res.rows.length ? res.rows[0] : {};
});
exports.getSingle = getSingle;


/***/ }),

/***/ "./libs/service-sdk/authorizer/types/index.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/generate-policy-document.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.policyObject = exports.generatePolicyDocument = void 0;
const tslib_1 = __webpack_require__("tslib");
const policyObject = {
    "principalId": "1234",
    "policyDocument": {
        "Version": "2012-10-17"
    }
};
exports.policyObject = policyObject;
const generatePolicyDocument = (permissions) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const statements = [];
    permissions.forEach((permission) => {
        statements.push({
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: permission.arn
        });
    });
    policyObject.policyDocument.Statement = statements;
    return policyObject;
});
exports.generatePolicyDocument = generatePolicyDocument;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-deny-policy.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDenyPolicy = void 0;
const generate_policy_document_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/generate-policy-document.ts");
const getDenyPolicy = () => {
    generate_policy_document_1.policyObject.policyDocument.Statement = [
        {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*"
        }
    ];
    generate_policy_document_1.policyObject.context = {
        deny: true
    };
    return generate_policy_document_1.policyObject;
};
exports.getDenyPolicy = getDenyPolicy;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-tenant.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTenant = void 0;
const tslib_1 = __webpack_require__("tslib");
const getTenant = (dynamoDB, tenantName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: `${process.env.TABLE_MAIN}`,
        KeyConditionExpression: " #pk = :pk and #sk = :sk",
        ExpressionAttributeValues: {
            ":pk": "tenant",
            ":sk": `tenant::${tenantName}`
        },
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        }
    };
    const result = yield dynamoDB.query(params).promise();
    if (result.Items && result.Items.length > 0) {
        return result.Items[0];
    }
    throw new Error("No tenant found");
});
exports.getTenant = getTenant;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const pgutil_1 = __webpack_require__("./libs/service-sdk/authorizer/pgutil.ts");
const getUser = (email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const user = yield pgutil_1.getSingle({
        text: `
        select u.id, u.name, u.email, json_agg(json_build_object(
            'id', p.id,
            'name', p.name,
            'arn', p.arn
            )) as permissions from iam_user u
        inner join user_role ur on u.id = ur.user_id
        inner join role_permissiongroup rp on rp.role_id = ur.role_id
        inner join permissiongroup_permission pp on pp.permissiongroup_id = rp.permissiongroup_id
        inner join permission p on pp.permission_id = p.id
        where u.email = $1
        group by u.id;
        `,
        values: [email]
    });
    if (!user || Object.keys(user).length == 0) {
        logger_1.logger.log("inside deny policy - no user");
        throw "User not found";
    }
    if (user.permissions.length === 0) {
        throw "User has no permissions";
    }
    return user;
});
exports.getUser = getUser;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTenant = exports.getDenyPolicy = exports.generatePolicyDocument = exports.verifyToken = exports.getUser = void 0;
const get_user_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-user.ts");
Object.defineProperty(exports, "getUser", ({ enumerable: true, get: function () { return get_user_1.getUser; } }));
const verify_token_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/verify-token.ts");
Object.defineProperty(exports, "verifyToken", ({ enumerable: true, get: function () { return verify_token_1.verifyToken; } }));
const generate_policy_document_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/generate-policy-document.ts");
Object.defineProperty(exports, "generatePolicyDocument", ({ enumerable: true, get: function () { return generate_policy_document_1.generatePolicyDocument; } }));
const get_deny_policy_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-deny-policy.ts");
Object.defineProperty(exports, "getDenyPolicy", ({ enumerable: true, get: function () { return get_deny_policy_1.getDenyPolicy; } }));
const get_tenant_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-tenant.ts");
Object.defineProperty(exports, "getTenant", ({ enumerable: true, get: function () { return get_tenant_1.getTenant; } }));


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/verify-token.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.verifyToken = void 0;
const tslib_1 = __webpack_require__("tslib");
const jwt = __webpack_require__("jsonwebtoken");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const toPem = __webpack_require__("jwk-to-pem");
const verifyToken = (token, tenant) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const decoded = jwt.decode(token, { complete: true });
    const jwk = yield loadJwk(tenant.awsDefaultRegion, tenant.cognito.poolId, (decoded === null || decoded === void 0 ? void 0 : decoded.header.kid) || "", tenant.jwks);
    if (!jwk) {
        throw "No jwk found";
    }
    const pem = toPem(jwk);
    return new Promise((resolve, reject) => {
        jwt.verify(token, pem, { algorithms: [jwk.alg] }, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            return resolve(decoded);
        });
    });
});
exports.verifyToken = verifyToken;
const loadJwk = (region, userPoolId, kid, jwks) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!jwks) {
        throw "JWKs missing";
    }
    logger_1.logger.log(region, userPoolId);
    return findJwk(jwks, kid);
});
const findJwk = (jwkResponse, kidInput) => {
    var _a;
    return (_a = jwkResponse === null || jwkResponse === void 0 ? void 0 : jwkResponse.keys) === null || _a === void 0 ? void 0 : _a.find((key) => {
        return key.kid === kidInput;
    });
};


/***/ }),

/***/ "./libs/service-sdk/authorizer/validators/passthrough.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isExempt = void 0;
const exemptURIs = {
    "/api/iam/users/reset/password": true,
    "/api/iam/users/init/reset/password": true
};
const isExempt = (uri) => {
    return exemptURIs[uri];
};
exports.isExempt = isExempt;


/***/ }),

/***/ "./libs/service-sdk/authorizer/validators/validate-local.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateLocal = void 0;
const tslib_1 = __webpack_require__("tslib");
const validateLocal = (permissions, actionUriObj) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const uris = [];
    permissions.forEach((permission) => {
        const permissionSplit = permission.arn.split(":");
        const lastKey = permissionSplit[permissionSplit.length - 1];
        const uri = lastKey.split("/").slice(3, lastKey.length).join("/");
        const action = lastKey.split("/").slice(2, lastKey.length)[0];
        if (action === actionUriObj.action) {
            uris.push({
                uri: `/${uri}`,
                action: action
            });
        }
    });
    const allowedPermissions = [];
    uris.forEach((arnUri) => {
        allowedPermissions.push(compareUris(arnUri.uri.substring(1).split("/"), actionUriObj.uri.substring(1).split("/")));
    });
    if (!allowedPermissions.includes(true)) {
        throw new Error("Permission denied");
    }
});
exports.validateLocal = validateLocal;
const compareUris = (arnUri, uriB) => {
    let cnt = 0;
    if (arnUri.length !== uriB.length && arnUri.length !== 0) {
        return false;
    }
    for (let i = 0; i < arnUri.length; i++) {
        if (arnUri[i] === "*") {
            cnt++;
            continue;
        }
        if (arnUri[i] === uriB[i]) {
            cnt++;
        }
    }
    return cnt === arnUri.length;
};


/***/ }),

/***/ "./libs/service-sdk/authorizer/validators/validate-request-headers.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateRequestHeaders = void 0;
const tslib_1 = __webpack_require__("tslib");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const validateRequestHeaders = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.log("headers: ", event.headers);
    const requiredHeaders = {
        Origin: event.headers.referer || event.headers.Referer ||
            event.headers.Authority || event.headers.authority || event.headers.Origin || event.headers.origin,
        Authorization: event.headers.Authorization || event.headers.authorization,
        Host: event.headers.Host || event.headers.host
    };
    const missingHeaders = Object.keys(requiredHeaders).filter((key) => {
        const header = requiredHeaders[key];
        return header === undefined || header === null;
    });
    if (missingHeaders && missingHeaders.length) {
        let msg = "";
        missingHeaders.forEach((header) => {
            msg += `Missing header [${header}]\n`;
        });
        throw new Error(msg);
    }
});
exports.validateRequestHeaders = validateRequestHeaders;


/***/ }),

/***/ "./libs/service-sdk/communication/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.communicationClient = exports.CommunicationClient = void 0;
const tslib_1 = __webpack_require__("tslib");
const twilio_1 = __webpack_require__("./libs/service-sdk/communication/twilio.ts");
const secret_manager_1 = __webpack_require__("./libs/service-sdk/secret-manager/index.ts");
var CommunicationClient;
(function (CommunicationClient) {
    CommunicationClient[CommunicationClient["TWILIO"] = 0] = "TWILIO";
})(CommunicationClient = exports.CommunicationClient || (exports.CommunicationClient = {}));
const communicationClient = (client) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    switch (client) {
        case CommunicationClient.TWILIO: {
            const SecretId = `${process.env.STAGE == "local" ? "dev" : process.env.STAGE}/twilio`;
            const secretValues = yield secret_manager_1.SecretManagerService().getSecretValue(SecretId);
            const { TWILIO_ACCOUNT_SID: twilioAccountId, TWILIO_AUTH_TOKEN: twilioAuthToken, TWILIO_TEST_AVAILABLE_NUMBER: twilioTestAvailableNumber, TWILIO_SMS_URL: twilioSMSUrl } = secretValues;
            if (twilioAccountId && twilioAuthToken) {
                return twilio_1.TwilioClient(twilioAccountId, twilioAuthToken, twilioTestAvailableNumber, twilioSMSUrl);
            }
            throw new Error("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env variables must be set");
        }
        default:
            throw new Error(`Communication client ${client} not supported`);
    }
});
exports.communicationClient = communicationClient;


/***/ }),

/***/ "./libs/service-sdk/communication/twilio.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TwilioClient = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const twilio_1 = __webpack_require__("twilio");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const TwilioClient = (accountSid, authToken, twilioTestAvailableNumber, twilioSMSUrl) => {
    let client = null;
    if (!client) {
        client = new twilio_1.Twilio(accountSid, authToken);
    }
    const provisionPhoneNumber = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!client) {
            throw new Error("Twilio client not initiated");
        }
        const { name, coordinates, voiceUrl } = input;
        if (process.env.STAGE !== shared_1.STAGE.prod) {
            return yield createTestNumber();
        }
        const availableNumberDetails = yield client.availablePhoneNumbers("US").local.list({
            nearLatLong: coordinates,
            limit: 1
        });
        if ((availableNumberDetails === null || availableNumberDetails === void 0 ? void 0 : availableNumberDetails.length) < 1) {
            throw new Error("Could not find any suitable number");
        }
        const availableNumber = availableNumberDetails[0].phoneNumber;
        const phoneNumberDetails = yield client.incomingPhoneNumbers.create({
            phoneNumber: availableNumber,
            friendlyName: name
        });
        yield updateSmsUrl(phoneNumberDetails, voiceUrl);
        return phoneNumberDetails;
    });
    const createTestNumber = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // provision phone number - only for testing purpose
        try {
            return yield client.incomingPhoneNumbers.create({
                phoneNumber: twilioTestAvailableNumber
            });
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Could not create phone number");
        }
    });
    const updateSmsUrl = (incomingNumber, voiceUrl) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // Due to how Kustomer works, we need to update the associated sms url so that SMS can be executed properly
        try {
            yield client.incomingPhoneNumbers(incomingNumber.sid).update({
                smsUrl: twilioSMSUrl,
                smsMethod: "POST",
                voiceUrl: voiceUrl,
                voiceMethod: "POST"
            });
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Update sms url failed");
        }
    });
    return {
        client,
        provisionPhoneNumber
    };
};
exports.TwilioClient = TwilioClient;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/audit-base-entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditBaseEntity = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
class AuditBaseEntity {
}
tslib_1.__decorate([
    core_1.Property({ defaultRaw: `now()`, onCreate: () => new Date() }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], AuditBaseEntity.prototype, "created_at", void 0);
tslib_1.__decorate([
    core_1.Property({ onCreate: () => null, onUpdate: () => new Date(), nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], AuditBaseEntity.prototype, "updated_at", void 0);
tslib_1.__decorate([
    core_1.Property({ onCreate: () => null, nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], AuditBaseEntity.prototype, "deleted_at", void 0);
exports.AuditBaseEntity = AuditBaseEntity;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/base-entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmptyBaseEntity = exports.PureBaseEntity = exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const audit_base_entity_1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/audit-base-entity.ts");
const exclude_deleted_1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/exclude-deleted.ts");
let BaseEntity = class BaseEntity extends audit_base_entity_1.AuditBaseEntity {
};
tslib_1.__decorate([
    core_1.PrimaryKey(),
    tslib_1.__metadata("design:type", Number)
], BaseEntity.prototype, "id", void 0);
BaseEntity = tslib_1.__decorate([
    exclude_deleted_1.ExcludeDeleted()
], BaseEntity);
exports.BaseEntity = BaseEntity;
class PureBaseEntity {
}
tslib_1.__decorate([
    core_1.PrimaryKey(),
    tslib_1.__metadata("design:type", Number)
], PureBaseEntity.prototype, "id", void 0);
exports.PureBaseEntity = PureBaseEntity;
class EmptyBaseEntity {
}
exports.EmptyBaseEntity = EmptyBaseEntity;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/connection.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.connection = exports.setConnection = exports.getConnection = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const AWS = __webpack_require__("aws-sdk");
const tenantMap = {};
const defaultDBType = "postgresql";
const secretManager = new AWS.SecretsManager({ region: process.env.REGION });
const getConnectionIdentifier = (dependency) => {
    return dependency.tenant + dependency.service;
};
const getConnection = (dependency) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!dependency.pooling) {
        return exports.setConnection(dependency);
    }
    const connectionId = getConnectionIdentifier(dependency);
    if (tenantMap[connectionId]) {
        tenantMap[connectionId].conn.em = tenantMap[connectionId].conn.mainEntityManager.fork();
        return tenantMap[connectionId];
    }
    else {
        return (exports.setConnection(dependency));
    }
});
exports.getConnection = getConnection;
const setConnection = (dependency) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const id = getConnectionIdentifier(dependency);
    tenantMap[id] = yield connect(dependency);
    tenantMap[id].conn.mainEntityManager = tenantMap[id].conn.em;
    tenantMap[id].conn.em = tenantMap[id].conn.em.fork();
    return tenantMap[id];
});
exports.setConnection = setConnection;
const getTenantConfig = (tenant) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.STAGE === "local") {
        const tenants = process.env.TENANTS;
        return JSON.parse(tenants);
    }
    const secretval = yield secretManager.getSecretValue({
        SecretId: `${process.env.STAGE}/tenants/${tenant}`
    }).promise();
    const secret = JSON.parse(secretval.SecretString);
    return {
        [tenant]: {
            username: secret.aurora_master_user,
            host: secret.aurora_endpoint,
            password: secret.aurora_master_user_password
        }
    };
});
const connect = (dependency) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { tenant, dbname, entities, pooling, subscribers = [] } = dependency;
    const tenantConfig = yield getTenantConfig(tenant);
    const poolConfig = { min: 0, max: 10 };
    const conn = yield core_1.MikroORM.init(Object.assign(Object.assign(Object.assign({}, (pooling && { pool: poolConfig })), (subscribers && { subscribers })), { entities, discovery: {
            warnWhenNoEntities: true,
            requireEntitiesArray: true,
            alwaysAnalyseProperties: false // do not analyse properties when not needed (with ts-morph)
        }, user: tenantConfig[tenant].username, host: tenantConfig[tenant].host, password: tenantConfig[tenant].password, type: defaultDBType, dbName: dbname, debug:  true && process.env.STAGE === "local", migrations: {
            tableName: "mikroorm_migrations",
            path: "./db/migrations",
            pattern: /^[\w-]+\d+\.js$/,
            emit: "js"
        } }));
    return {
        conn,
        repositories: null
    };
});
exports.connection = {
    getConnection: exports.getConnection
};


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/exclude-deleted.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExcludeDeleted = void 0;
const core_1 = __webpack_require__("@mikro-orm/core");
const defaultOptions = { enabled: true, defaultIsDeleted: false, field: "deleted_at" };
const ExcludeDeleted = (options = {}) => {
    const { enabled, defaultIsDeleted, field } = Object.assign(Object.assign({}, defaultOptions), options);
    return core_1.Filter({
        name: "excludeDeleted",
        cond: ({ isDeleted = defaultIsDeleted } = {}) => isDeleted ? { [field]: { $ne: null } } : isDeleted === false ? { [field]: null } : {},
        args: false,
        default: enabled
    });
};
exports.ExcludeDeleted = ExcludeDeleted;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/exclude-deleted.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-time.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-before-date.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-date-only.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-not-sibling-of.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-before-date.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsBeforeDateConstraint = exports.IsBeforeDate = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
function IsBeforeDate(property, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsBeforeDateConstraint
        });
    };
}
exports.IsBeforeDate = IsBeforeDate;
let IsBeforeDateConstraint = class IsBeforeDateConstraint {
    validate(value, args) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = args.object[relatedPropertyName];
        return relatedValue ? value < relatedValue : true;
    }
    defaultMessage(args) {
        return `${args.property} must be before ${args.constraints[0]}`;
    }
};
IsBeforeDateConstraint = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsBeforeDateConstraint" })
], IsBeforeDateConstraint);
exports.IsBeforeDateConstraint = IsBeforeDateConstraint;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-date-only.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsDateOnly = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
let IsDateOnly = class IsDateOnly {
    validate(value, args) {
        const isDateOnlyRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        return isDateOnlyRegex.test(value);
    }
};
IsDateOnly = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsDateOnly", async: false })
], IsDateOnly);
exports.IsDateOnly = IsDateOnly;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-not-sibling-of.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsNotSiblingOf = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
/* This decorator is used to validate if the value is not a sibling of the given property
  i.g when we use this decorator on a specific field:
    @IsNotSiblingOf(["createdDate"])
    confirmationDate: string;
  this means that you can not have both confirmationDate and createdDate defined on the same object
*/
let IsNotSiblingOfConstraint = class IsNotSiblingOfConstraint {
    validate(value, args) {
        if (value) {
            return this.getFailedConstraints(args).length === 0;
        }
        return true;
    }
    defaultMessage(args) {
        return `${args.property} cannot exist alongside the following defined properties: ${this.getFailedConstraints(args).join(", ")}`;
    }
    getFailedConstraints(args) {
        return args.constraints.filter((prop) => !!args.object[prop]);
    }
};
IsNotSiblingOfConstraint = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ async: false })
], IsNotSiblingOfConstraint);
function IsNotSiblingOf(props, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: props,
            validator: IsNotSiblingOfConstraint
        });
    };
}
exports.IsNotSiblingOf = IsNotSiblingOf;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-time.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsTime = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
let IsTime = class IsTime {
    validate(text, args) {
        const isTimeRegex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
        return isTimeRegex.test(text);
    }
};
IsTime = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsTime", async: false })
], IsTime);
exports.IsTime = IsTime;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/entityrepository.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomEntityRepository = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const SoftDelErrorMsg = "deleted_at attr does not exist for the given entity";
class CustomEntityRepository extends core_1.EntityRepository {
    getOneEntityOrFail(where, populate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entity = yield this.findOne(where, populate);
            if (!entity) {
                throw new service_sdk_1.NotFoundError(this.entityName.toString());
            }
            return entity;
        });
    }
    getOneEntityOrFailWithLock(where, lockVersion, populate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockMode = core_1.LockMode.OPTIMISTIC;
            const entity = yield this.findOne(where, {
                populate,
                lockMode,
                lockVersion
            });
            if (!entity) {
                throw new service_sdk_1.NotFoundError(this.entityName.toString());
            }
            return entity;
        });
    }
    failIfEntityExists(where) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entityExists = yield this.findOne(where);
            if (entityExists) {
                const errorMessage = this.constructErrorMessageForUniqueFields(where);
                throw new service_sdk_1.ConflictError(`This ${this.entityName.toString().toLowerCase()} already exists. ${errorMessage}`);
            }
        });
    }
    softDelete(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(id)) {
                const entitiesToDelete = yield this.getEntitiesOrFailIfNotFound(id);
                for (const entity of entitiesToDelete) {
                    if (!(entity instanceof service_sdk_1.AuditBaseEntity)) {
                        throw new Error(SoftDelErrorMsg);
                    }
                    entity.deleted_at = new Date();
                }
                yield this.flush();
            }
            else {
                const entityToDelete = yield this.getOneEntityOrFail({ id });
                if (!(entityToDelete instanceof service_sdk_1.AuditBaseEntity)) {
                    throw new Error(SoftDelErrorMsg);
                }
                entityToDelete.deleted_at = new Date();
                yield this.flush();
            }
            return true;
        });
    }
    getEntitiesOrFailIfNotFound(entityIDs, populate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const uniqueIDs = [...new Set(entityIDs)];
            const foundEntities = yield this.find({ id: { $in: uniqueIDs } }, populate);
            if (foundEntities.length !== uniqueIDs.length) {
                throw new service_sdk_1.NotFoundError("Entity", `Some of the ${this.entityName.toString().toLowerCase()}s do not exist in the database`);
            }
            return foundEntities;
        });
    }
    convertKey(key) {
        /* replaceBracketsRegex --> regex to match anything inside brackets including them i.g name[eq] => [eq] */
        const replaceBracketsRegex = /\[[^]*\]/g;
        /* replace the key if regex match i.g name[eq] => name */
        key = key.replace(replaceBracketsRegex, "");
        if (key.includes("id")) {
            /* removeIdPostfixRegex --> regex to match the postfix _id i.g parent_id => _id */
            const removeIdPostfixRegex = /_id.*/;
            /* replace the _id postfix if regex match i.g parent_id => parent */
            key = key.replace(removeIdPostfixRegex, "");
        }
        /* replace _ with a space " " i.g parent_category => parent category */
        return key.replace("_", " ");
    }
    constructErrorMessageForUniqueFields(where) {
        let errorMessage = "";
        let combinedFields = true;
        const keys = [];
        Object.keys(where).forEach((key) => {
            if (key.startsWith("$")) {
                if (key == "$or") {
                    combinedFields = false;
                }
                if (Array.isArray(where[key])) {
                    where[key].forEach((obj) => {
                        Object.keys(obj).forEach((nestedKey) => {
                            keys.push(this.convertKey(nestedKey));
                        });
                    });
                }
                else if (typeof where[key] == "object") {
                    Object.keys(where[key]).forEach((nestedKey) => {
                        keys.push(this.convertKey(nestedKey));
                    });
                }
            }
            else {
                keys.push(this.convertKey(key));
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        keys.length > 1 ?
            keys.forEach((key, idx) => idx == 0 ?
                (errorMessage += `The ${combinedFields ? "combination of" : "properties"} ${key}`) :
                idx == keys.length - 1 ?
                    (errorMessage += `${combinedFields ? ` and ${key} must be unique.` : ` or ${key} are not unique.`}`) :
                    (errorMessage += `, ${key}`)) :
            keys.length == 1 ?
                (errorMessage += `${keys[0].charAt(0).toUpperCase() + keys[0].slice(1)} must be unique.`) :
                null;
        return errorMessage;
    }
}
exports.CustomEntityRepository = CustomEntityRepository;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/filter.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getPaginationParams = void 0;
const getPaginationParams = (filter) => {
    return {
        offset: !filter.paginate ? (filter.page - 1) * filter.limit : null,
        limit: !filter.paginate ? filter.limit : null
    };
};
exports.getPaginationParams = getPaginationParams;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/connection.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/entityrepository.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/util.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/filter.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/audit-base-entity.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/base-entity.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/subscribers/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/index.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/subscribers/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/subscribers/soft-delete.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/subscribers/soft-delete.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoftDeleteSubscriber = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
class SoftDeleteSubscriber {
    onFlush(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const changeSets = args.uow.getChangeSets();
            const toRemove = changeSets.filter((cs) => cs.entity instanceof service_sdk_1.BaseEntity && cs.type === core_1.ChangeSetType.DELETE);
            for (const changeSet of toRemove) {
                changeSet.type = core_1.ChangeSetType.UPDATE;
                changeSet.entity.deleted_at = new Date();
                changeSet.payload.deleted_at = new Date();
                args.uow.recomputeSingleChangeSet(changeSet.entity);
            }
        });
    }
}
exports.SoftDeleteSubscriber = SoftDeleteSubscriber;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/numeric.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/integer-array.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/integer-array.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IntegerArray = void 0;
const core_1 = __webpack_require__("@mikro-orm/core");
class IntegerArray extends core_1.ArrayType {
    convertToDatabaseValue(value) {
        if (!value || value.length === 0) {
            return "{}";
        }
        else {
            return "{" + value.join(", ") + "}";
        }
    }
    convertToJSValue(value) {
        return value;
    }
    getColumnType() {
        return "json[]";
    }
}
exports.IntegerArray = IntegerArray;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/numeric.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NumericType = void 0;
const core_1 = __webpack_require__("@mikro-orm/core");
class NumericType extends core_1.BigIntType {
    convertToJSValue(value) {
        if (!value) {
            return value;
        }
        else {
            return +value;
        }
    }
}
exports.NumericType = NumericType;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/util.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PG = void 0;
const tslib_1 = __webpack_require__("tslib");
const errors_1 = __webpack_require__("./libs/service-sdk/errors/index.ts");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const pg_1 = __webpack_require__("pg");
var PG;
(function (PG) {
    PG.pool = new pg_1.Pool({
        user: "admin",
        host: "0.0.0.0",
        database: "mikroorm_menu",
        password: "admin",
        port: 5432
    });
    PG.queryexec = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        const res = yield PG.pool.query(input);
        const duration = Date.now() - start;
        logger_1.logger.log("executed query", { input, duration, rows: res.rowCount });
        return res;
    });
    PG.getMultiple = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield PG.queryexec(input);
        return res.command == "SELECT" && res.rows && res.rows.length ? res.rows : [];
    });
    PG.getSingle = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield PG.queryexec(input);
        return res.command == "SELECT" && res.rows && res.rows.length ? res.rows[0] : {};
    });
    PG.insertquery = (table, input, onConstraintQuery = "") => {
        const params = [];
        const values = [];
        const paramvalues = [];
        const bulk = input.length > 0;
        if (bulk) {
            let i = 0;
            let idx = 0;
            input.forEach((ob) => {
                const keys = [];
                Object.keys(ob).forEach((key) => {
                    if (i === 0) {
                        params.push(key);
                    }
                    values.push(`$${idx + 1}`);
                    keys.push(`$${idx + 1}`);
                    idx++;
                });
                i++;
                paramvalues.push(`(${keys.concat("now()").toString()})`);
            });
        }
        else {
            Object.keys(input).forEach((key, idx) => {
                params.push(key);
                values.push(`$${idx + 1}`);
            });
            paramvalues.push(`(${values.concat("now()").toString()})`).toString();
        }
        let inputvals = [];
        if (bulk) {
            const collectedValues = input.map((ob) => Object.values(ob).map((e) => (!e ? null : e)));
            inputvals = [].concat.apply([], collectedValues); // .toString().split(',')
            logger_1.logger.log("bulk-input: ", input);
            logger_1.logger.log("bulk-inputvals: ", inputvals);
        }
        else {
            inputvals = Object.values(input);
            logger_1.logger.log("input: ", input);
            logger_1.logger.log("inputvals: ", inputvals);
        }
        const txt = `insert into ${table} (${params.concat(["created_at"]).toString()}) values ${paramvalues} ${onConstraintQuery} returning *`;
        return {
            text: txt,
            values: inputvals
        };
    };
    PG.insert = (table, input, onConstraintQuery = "") => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.insertquery(table, input, onConstraintQuery);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError("0", "INSERT failure");
    });
    PG.updatequery = (table, id, input) => {
        const params = ["updated_at = $1"];
        Object.keys(input).forEach((key, idx) => {
            params.push(`${key} = $${idx + 2}`);
        });
        return {
            text: `update ${table} set ${params.toString()} where id = $${Object.keys(input).length + 2} returning *`,
            values: ["now()"].concat(Object.values(input)).concat([id.toString()])
        };
    };
    PG.update = (table, id, input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.updatequery(table, id, input);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError("0", "UPDATE failure");
    });
    PG.softdeletequery = (table, id) => {
        const params = ["deleted_at = $1"];
        return {
            text: `update ${table} set ${params.toString()} where id in (${Array.isArray(id) ? id.toString() : id}) returning *`,
            values: ["now()"]
        };
    };
    PG.deletequery = (table, id) => {
        return {
            text: `delete from ${table} where id in (${Array.isArray(id) ? id.toString() : id})`
        };
    };
    PG.softdel = (table, id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.softdeletequery(table, id);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError("0", "DELETE failure");
    });
    PG.del = (table, id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.deletequery(table, id);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rowCount) {
            return id;
        }
        throw errors_1.generalError("0", "DELETE failure");
    });
    PG.TABLE = {
        MODIFIER: process.env.MODIFIER_TABLE || "modifier",
        MODIFIER_OPTION: process.env.MODIFIER_OPTION_TABLE || "modifier_option",
        CATEGORY: process.env.CATEGORY_TABLE || "category",
        PRODUCT: process.env.PRODUCT_TABLE || "product",
        PRODUCT_CATEGORY: process.env.PRODUCT_CATEGORY_TABLE || "product_category",
        PRODUCT_MODIFIER: process.env.PRODUCT_MODIFIER_TABLE || "product_modifier",
        MENU: process.env.MENU_TABLE || "menu",
        PRODUCT_MENU: process.env.PRODUCT_MENU_TABLE || "product_menu",
        OUT_OF_STOCK: process.env.OUT_OF_STOCK_TABLE || "out_of_stock",
        MENU_HOTEL: process.env.MENU_HOTEL_TABLE || "menu_hotel"
    };
    PG.getPaginationString = (page, limit = 20) => {
        const offset = page > 0 ? (page - 1) * limit + 1 : 0;
        return `offset ${offset} limit ${limit}`;
    };
    PG.getOrderByClause = (attr, sort = "asc") => {
        return `order by ${attr} ${sort}`;
    };
    PG.addTotalCountQueryString = () => {
        return `count(*) OVER() AS total_count`;
    };
    PG.getClient = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const client = yield PG.pool.connect();
        const { query } = client;
        const { release } = client;
        // set a timeout of 5 seconds, after which we will log this client's last query
        const timeout = setTimeout(() => {
            console.error("A client has been checked out for more than 5 seconds!");
            console.error(`The last executed query on this client was: ${client.lastQuery}`);
        }, 5000);
        // monkey patch the query method to keep track of the last query executed
        client.query = (...args) => {
            client.lastQuery = args;
            return query.apply(client, args);
        };
        client.release = () => {
            // clear our timeout
            clearTimeout(timeout);
            // set the methods back to their old un-monkey-patched version
            client.query = query;
            client.release = release;
            return release.apply(client);
        };
        return client;
    });
})(PG = exports.PG || (exports.PG = {}));


/***/ }),

/***/ "./libs/service-sdk/errors/error.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generalError = void 0;
const generalError = (code, message) => {
    return {
        error: true,
        code,
        message
    };
};
exports.generalError = generalError;


/***/ }),

/***/ "./libs/service-sdk/errors/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/errors/error.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/event-provider/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvClient = exports.eventProvider = void 0;
const tslib_1 = __webpack_require__("tslib");
/* eslint-disable space-before-function-paren */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/return-await */
const redis_1 = __webpack_require__("./libs/service-sdk/event-provider/redis.ts");
const sns_1 = __webpack_require__("./libs/service-sdk/event-provider/sns.ts");
class EvClient {
    constructor() {
        this.stage = process.env.STAGE;
        switch (this.stage) {
            case "local":
                this.eventProvider = redis_1.RedisClientFactory();
                break;
            case "dev":
            case "development":
            case "staging":
            case "prod":
            case "production":
                this.eventProvider = sns_1.SNSClientFactory();
                break;
            default:
                this.eventProvider = null;
        }
    }
    publish(topicARN, eventName, context, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = { context, data };
            if (!this.eventProvider) {
                return;
            }
            return yield this.eventProvider.publish(topicARN, payload, eventName);
        });
    }
    subscribe(eventName) {
        if (this.stage === "local") {
            return this.eventProvider.client.subscribe(eventName);
        }
    }
    on(event, cb) {
        if (this.stage === "local") {
            return this.eventProvider.client.on(event, cb);
        }
    }
}
exports.EvClient = EvClient;
const eventProvider = (function () {
    let eventClient;
    return {
        client() {
            if (!eventClient) {
                eventClient = new EvClient();
            }
            return eventClient;
        }
    };
})();
exports.eventProvider = eventProvider;


/***/ }),

/***/ "./libs/service-sdk/event-provider/redis.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisClientFactory = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const redis_1 = __webpack_require__("redis");
const RedisClientFactory = () => {
    const client = redis_1.createClient();
    const publish = (topicName, payload, eventName) => {
        return client.publish(topicName, constructMessage(payload, eventName, topicName));
    };
    return {
        client,
        publish
    };
};
exports.RedisClientFactory = RedisClientFactory;
const constructMessage = (payload, eventName, topicName) => {
    return JSON.stringify({
        Records: Array.isArray(payload.data) ? payload.data.map((el) => {
            return bodyMessage({
                context: payload.context,
                data: el,
                topicName: topicName
            }, eventName);
        }) : [
            bodyMessage(Object.assign(Object.assign({}, payload), { topicName: topicName }), eventName)
        ]
    });
};
const formatEventName = (eventName) => {
    if (eventName.includes("_ADAPTER")) {
        eventName = eventName.replace("_ADAPTER", "");
    }
    return eventName;
};
const bodyMessage = (payload, eventName) => {
    const formattedEventName = formatEventName(eventName);
    return {
        body: JSON.stringify(payload),
        MessageAttributes: {
            eventName: {
                DataType: "String",
                StringValue: formattedEventName
            }
        }
    };
};


/***/ }),

/***/ "./libs/service-sdk/event-provider/sns.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SNSClientFactory = void 0;
const tslib_1 = __webpack_require__("tslib");
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_sns_1 = __webpack_require__("@aws-sdk/client-sns");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const SNSClientFactory = () => {
    const client = new client_sns_1.SNSClient({ region: "us-east-1" });
    const publish = (topicARN, payload, eventName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            logger_1.logger.log(`publishing on ${topicARN}`);
            const published = Array.isArray(payload.data) ?
                yield publishBatch(topicARN, payload, eventName) :
                yield simplePublish(topicARN, payload, eventName);
            logger_1.logger.log("published successfully", published);
        }
        catch (e) {
            logger_1.logger.log("[sns-publish-error]: ", e);
        }
    });
    const simplePublish = (topicARN, payload, eventName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return client.send(new client_sns_1.PublishCommand({
            TopicArn: topicARN,
            MessageGroupId: eventName.split("_")[0],
            MessageDeduplicationId: Date.now().toString(),
            Message: JSON.stringify(payload),
            MessageAttributes: {
                eventName: {
                    DataType: "String",
                    StringValue: eventName
                }
            }
        }));
    });
    const publishBatch = (topicARN, payload, eventName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return client.send(new client_sns_1.PublishBatchCommand({
            TopicArn: topicARN,
            PublishBatchRequestEntries: payload.data.map((el, idx) => {
                return {
                    Id: `${idx}`,
                    MessageGroupId: eventName.split("_")[0],
                    MessageDeduplicationId: `${Date.now().toString()}${idx}`,
                    Message: JSON.stringify({ context: payload.context, data: el }),
                    MessageAttributes: {
                        eventName: {
                            DataType: "String",
                            StringValue: eventName
                        }
                    }
                };
            })
        }));
    });
    return {
        client,
        publish,
        publishBatch
    };
};
exports.SNSClientFactory = SNSClientFactory;


/***/ }),

/***/ "./libs/service-sdk/express/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/validator.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/response.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/parse.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/express/parse.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parsePaginationParam = void 0;
const utils_1 = __webpack_require__("./libs/service-sdk/utils/index.ts");
const parsePaginationParam = (reqQuery) => {
    var _a;
    if ((reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.page) && reqQuery.page < 1) {
        throw new utils_1.BadRequestError("Page should not be less than 1");
    }
    if ((reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.limit) && reqQuery.limit < 0) {
        throw new utils_1.BadRequestError("Limit should not be less than 0");
    }
    return {
        page: (reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.page) ? Number(reqQuery.page) : 1,
        limit: (reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.limit) ? Number(reqQuery.limit) : 10,
        paginate: (_a = reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.paginate) !== null && _a !== void 0 ? _a : true
    };
};
exports.parsePaginationParam = parsePaginationParam;


/***/ }),

/***/ "./libs/service-sdk/express/response.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.httpResponse = void 0;
const httpResponse = (data) => {
    return data;
};
exports.httpResponse = httpResponse;


/***/ }),

/***/ "./libs/service-sdk/express/validator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lazyValidateRequest = exports.validate = exports.validateRequest = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const class_transformer_1 = __webpack_require__("class-transformer");
const validator_1 = __webpack_require__("./libs/service-sdk/utils/validator.ts");
const validateRequest = (validationClass) => {
    return (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield exports.validate(validationClass, req.body);
            req.isValid = true;
        }
        catch (e) {
            next(e);
        }
        next();
    });
};
exports.validateRequest = validateRequest;
const validate = (validationClass, payload, exec = true) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!exec) {
        return;
    }
    const output = class_transformer_1.plainToInstance(validationClass, payload);
    const errors = yield validator_1.validateInput(output);
    if (errors.length > 0) {
        throw new service_sdk_1.ValidationError(errors);
    }
});
exports.validate = validate;
const lazyValidateRequest = (validationClass, data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const output = class_transformer_1.plainToInstance(validationClass, data);
    const errors = yield validator_1.validateInput(output);
    if (errors.length > 0) {
        throw new service_sdk_1.ValidationError(errors);
    }
});
exports.lazyValidateRequest = lazyValidateRequest;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/cognito.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCognitoConfig = exports.createInstance = void 0;
/**
 * Cognito Implementation
 */
const AWS = __webpack_require__("aws-sdk");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const types_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/types.ts");
function createInstance(poolId) {
    const config = getCognitoConfig();
    const awsClient = new AWS.CognitoIdentityServiceProvider(config);
    return new Cognito(awsClient, poolId);
}
exports.createInstance = createInstance;
function getCognitoConfig() {
    return {
        apiVersion: "2016-04-18",
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    };
}
exports.getCognitoConfig = getCognitoConfig;
/**
 * Cognito Integration
 */
class Cognito {
    /**
     * Creates new cognito instance
     * @param {any} awsClient
     * @param {String} userPoolID
     */
    constructor(awsClient, userPoolID) {
        this.getServiceName = () => {
            return "cognito-identity-service-provider";
        };
        // #region Group
        /**
         * Create new group inside specified user pool
         * @param {CreateUpdateGroupQuery} group
         * @return {Promise}
         */
        this.createGroup = (group) => {
            const params = Object.assign(Object.assign({}, group), { UserPoolId: this.UserPoolID });
            return this.awsClient.createGroup(params).promise();
        };
        /**
         * Update group inside specified user pool
         * @param {CreateUpdateGroupQuery} userGroup
         * @return {Promise}
         */
        this.updateGroup = (userGroup) => {
            const params = Object.assign(Object.assign({}, userGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.updateGroup(params).promise();
        };
        /**
         * Delete group inside specified user pool
         * @param {DeleteGroupQuery} deleteUserGroup
         * @return {Promise}
         */
        this.deleteGroup = (deleteUserGroup) => {
            const params = Object.assign(Object.assign({}, deleteUserGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.deleteGroup(params).promise();
        };
        /**
         * Get group inside specified user pool
         * @param {GetGroupQuery} getGroupQuery
         * @return {Promise}
         */
        this.getGroup = (getGroupQuery) => {
            const params = Object.assign(Object.assign({}, getGroupQuery), { UserPoolId: this.UserPoolID });
            return this.awsClient.getGroup(params).promise();
        };
        /**
         * List groups inside specified user pool
         * @param {ListGroupsQuery} listGroups
         * @return {Promise}
         */
        this.listGroups = (listGroups) => {
            const params = Object.assign(Object.assign({}, listGroups), { UserPoolId: this.UserPoolID });
            return this.awsClient.listGroups(params).promise();
        };
        // #endregion
        // #region Users
        /**
         * Create user inside specified user pool
         * @param {CreateUserQuery} user
         * @return {Promise}
         */
        this.adminCreateUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID, DesiredDeliveryMediums: [types_1.ENUM_DELIVERY_MEDIUMS.EMAIL], ForceAliasCreation: false });
            return this.awsClient.adminCreateUser(params).promise();
        };
        /**
         * Enable user inside specified user pool
         * @param {EnableDisableUser} user
         * @return {Promise}
         */
        this.adminEnableUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminEnableUser(params).promise();
        };
        /**
         * Disable user inside specified user pool
         * @param {EnableDisableUser} user
         * @return {Promise}
         */
        this.adminDisableUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminDisableUser(params).promise();
        };
        /**
         * Get user
         * @param {AdminGetUserQuery} user
         * @return {Promise}
         */
        this.adminGetUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminGetUser(params).promise();
        };
        /**
         * Reset user password
         * @param {ResetUserPasswordQuery} resetUserPassword
         * @return {Promise}
         */
        this.adminResetUserPassword = (resetUserPassword) => {
            const params = Object.assign(Object.assign({}, resetUserPassword), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminResetUserPassword(params).promise();
        };
        /**
         * Reset user password
         * @param {SetUserPasswordQuery} setSetUserPassword
         * @return {Promise}
         */
        this.adminSetUserPassword = (setSetUserPassword) => {
            const params = Object.assign(Object.assign({}, setSetUserPassword), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminSetUserPassword(params).promise();
        };
        /**
         * Confirm user signUp
         * @param {ConfirmUserSignUp} confirmUserSignUp
         * @return {Promise}
         */
        this.adminConfirmUserSignUp = (confirmUserSignUp) => {
            const params = Object.assign(Object.assign({}, confirmUserSignUp), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminConfirmSignUp(params).promise();
        };
        /**
         * User Global SignOut
         * @param {UserSignOutQuery} user
         * @return {Promise}
         */
        this.adminUserGlobalSignOut = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminUserGlobalSignOut(params).promise();
        };
        /**
         * List users
         * @param {ListUsersQuery} listUsers
         * @return {Promise}
         */
        this.listUsers = (listUsers) => {
            const params = Object.assign(Object.assign({}, listUsers), { UserPoolId: this.UserPoolID });
            return this.awsClient.listUsers(params).promise();
        };
        /**
         * List users
         * @param {ListUsersInGroupQuery} listUserGroup
         * @return {Promise}
         */
        this.listUsersInGroup = (listUserGroup) => {
            const params = Object.assign(Object.assign({}, listUserGroup), { UserPoolId: this.UserPoolID });
            logger_1.logger.log("paramss:: ", params);
            return this.awsClient.listUsersInGroup(params).promise();
        };
        // #region User-Groups
        /**
         * Add user to group
         * @param {AddRemoveUserToGroupQuery} addUserToGroup
         * @return {Promise}
         */
        this.adminAddUserToGroup = (addUserToGroup) => {
            const params = Object.assign(Object.assign({}, addUserToGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminAddUserToGroup(params).promise();
        };
        /**
         * Admin delete-resource user from group
         * @param {AddRemoveUserToGroupQuery} removeUserFromGroup
         * @return {Promise}
         */
        this.adminRemoveUserFromGroup = (removeUserFromGroup) => {
            const params = Object.assign(Object.assign({}, removeUserFromGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminRemoveUserFromGroup(params).promise();
        };
        /**
         * List user groups
         * @param {ListGroupsForUserQuery} listGroupsForUser
         * @return {Promise}
         */
        this.adminListGroupsForUser = (listGroupsForUser) => {
            const params = Object.assign(Object.assign({}, listGroupsForUser), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminListGroupsForUser(params).promise();
        };
        // #endregion
        /**
         * Update user attributes
         * @param {UpdateUserAttributesQuery} userAndAttributes
         * @return {Promise}
         */
        this.adminUpdateUserAttributes = (userAndAttributes) => {
            const params = Object.assign(Object.assign({}, userAndAttributes), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminUpdateUserAttributes(params).promise();
        };
        this.adminConfirmForgotPassword = (params) => {
            return this.awsClient.confirmForgotPassword(params).promise();
        };
        this.forgotPassword = (params) => {
            return this.awsClient.forgotPassword(params).promise();
        };
        this.adminChangePassword = (params) => {
            return this.awsClient.changePassword(params).promise();
        };
        this.adminHardDeleteUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminDeleteUser(params).promise();
        };
        this.awsClient = awsClient;
        this.UserPoolID = userPoolID;
    }
}


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const cognito_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/cognito.ts");
const add_user_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/add-user.ts");
const create_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/create.ts");
const delete_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/delete.ts");
const list_users_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/list-users.ts");
const update_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/update.ts");
const change_password_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/change-password.ts");
const confirm_user_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/confirm-user.ts");
const create_2 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/create.ts");
const delete_2 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/delete.ts");
const forgot_password_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/forgot-password.ts");
const get_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/get.ts");
const reset_password_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/reset-password.ts");
const hard_delete_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/hard-delete.ts");
const CognitoManager = (poolId, logger) => {
    const cognito = cognito_1.createInstance(poolId);
    const createRole = create_1.CreateGroup(cognito, logger).action;
    const updateRole = update_1.UpdateGroup(cognito, logger).action;
    const deleteRole = delete_1.DeleteGroup(cognito, logger).action;
    const listUsersInGroup = list_users_1.ListGroupUsers(cognito, logger).action;
    const addUserToRoles = add_user_1.AddUser(cognito, logger).action;
    const createUser = create_2.CreateUser(cognito, logger).action;
    const getUser = get_1.GetUser(cognito, logger).action;
    const deleteUser = delete_2.DeleteUser(cognito, logger).action;
    const confirmUser = confirm_user_1.ConfirmUser(cognito, logger).action;
    const resetUserPassword = reset_password_1.ResetUserPassword(cognito, logger).action;
    const forgotPassword = forgot_password_1.ForgotPassword(cognito, logger).action;
    const changePassword = change_password_1.ChangePassword(cognito, logger).action;
    const hardDeleteUser = hard_delete_1.HardDeleteUser(cognito, logger).action;
    return {
        createRole,
        updateRole,
        deleteRole,
        addUserToRoles,
        createUser,
        listUsersInGroup,
        getUser,
        deleteUser,
        confirmUser,
        resetUserPassword,
        forgotPassword,
        changePassword,
        hardDeleteUser
    };
};
exports["default"] = CognitoManager;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/types.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ENUM_MESSAGE_ACTIONS = exports.ENUM_DELIVERY_MEDIUMS = void 0;
var ENUM_DELIVERY_MEDIUMS;
(function (ENUM_DELIVERY_MEDIUMS) {
    ENUM_DELIVERY_MEDIUMS["SMS"] = "SMS";
    ENUM_DELIVERY_MEDIUMS["EMAIL"] = "EMAIL";
})(ENUM_DELIVERY_MEDIUMS = exports.ENUM_DELIVERY_MEDIUMS || (exports.ENUM_DELIVERY_MEDIUMS = {}));
var ENUM_MESSAGE_ACTIONS;
(function (ENUM_MESSAGE_ACTIONS) {
    ENUM_MESSAGE_ACTIONS[ENUM_MESSAGE_ACTIONS["RESEND"] = 0] = "RESEND";
    ENUM_MESSAGE_ACTIONS[ENUM_MESSAGE_ACTIONS["SUPPRESS"] = 1] = "SUPPRESS";
})(ENUM_MESSAGE_ACTIONS = exports.ENUM_MESSAGE_ACTIONS || (exports.ENUM_MESSAGE_ACTIONS = {}));


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/add-user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const AddUser = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const { currentRoles, user, newRoles } = data;
        try {
            for (let i = 0; i < currentRoles.length; i += 1) {
                const role = currentRoles[i];
                yield cognito.adminRemoveUserFromGroup({
                    Username: user.email,
                    GroupName: role.name.split("::")[1]
                });
            }
            for (let i = 0; i < newRoles.length; i += 1) {
                yield cognito.adminAddUserToGroup({
                    Username: user.email,
                    GroupName: newRoles[i].name.split("::")[1]
                });
            }
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("add-user", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.AddUser = AddUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/create.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateGroup = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const CreateGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.createGroup({
                GroupName: data.role.name,
                Description: data.role.description
            });
            logger.info(JSON.stringify(cgRes));
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR("create", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.CreateGroup = CreateGroup;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/delete.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeleteGroup = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const DeleteGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.deleteGroup({
                GroupName: data.role.name
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("delete", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.DeleteGroup = DeleteGroup;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/list-users.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListGroupUsers = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ListGroupUsers = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.listUsersInGroup({
                GroupName: data.role.name
            });
            logger.info(JSON.stringify(cgRes));
            return cgRes.Users || [];
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR("list-users", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.ListGroupUsers = ListGroupUsers;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/update.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateGroup = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const UpdateGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.updateGroup({
                GroupName: data.role.name,
                Description: data.role.description
            });
            logger.info(JSON.stringify(cgRes));
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR("update", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.UpdateGroup = UpdateGroup;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/change-password.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChangePassword = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ChangePassword = (cognito, logger) => {
    const action = (params) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.adminChangePassword(params);
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("ChangePassword", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ChangePassword = ChangePassword;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/confirm-user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfirmUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ConfirmUser = (cognito, logger) => {
    const action = (email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield cognito.adminSetUserPassword({
                Username: email,
                Password: "Temporary1!",
                Permanent: true
            });
            return yield cognito.adminUpdateUserAttributes({
                Username: email,
                UserAttributes: [
                    {
                        Name: "email_verified",
                        Value: "true"
                    }
                ]
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("confirm-user", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ConfirmUser = ConfirmUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/create.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const CreateUser = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            yield cognito.adminCreateUser({
                Username: data.user.email,
                ClientMetadata: {
                    displayName: (_a = data.metadata) === null || _a === void 0 ? void 0 : _a.display_name
                },
                UserAttributes: [
                    { Name: "email", Value: data.user.email },
                    { Name: "email_verified", Value: "true" }
                ]
            });
        }
        catch (err) {
            logger.error("[cognito-create-user-error]", err, JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("create", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.CreateUser = CreateUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/delete.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeleteUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const DeleteUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            return yield cognito.adminDisableUser({
                Username: username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("delete", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.DeleteUser = DeleteUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/forgot-password.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ForgotPassword = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ForgotPassword = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.log("forgort-pwd-data: ", data);
            return yield cognito.forgotPassword({
                ClientId: data.clientID,
                Username: data.username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("ResetUserPassword", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ForgotPassword = ForgotPassword;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/get.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const GetUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            const adminUser = yield cognito.adminGetUser({
                Username: username
            });
            return adminUser.Username || null;
        }
        catch (err) {
            logger.error(JSON.stringify(err));
        }
    });
    return {
        action
    };
};
exports.GetUser = GetUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/hard-delete.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HardDeleteUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const HardDeleteUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            return yield cognito.adminHardDeleteUser({
                Username: username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("delete", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.HardDeleteUser = HardDeleteUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/reset-password.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResetUserPassword = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ResetUserPassword = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.adminConfirmForgotPassword({
                ClientId: data.clientID,
                ConfirmationCode: data.confirmationCode,
                Password: data.password,
                Username: data.username
            });
        }
        catch (err) {
            logger.error("[reset-password-cognito-err]: ", err, JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("ResetUserPassword", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ResetUserPassword = ResetUserPassword;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ICognitoChangePasswordInput = exports.IdentityProvider = exports.IdentityProviderType = exports.IdentityProviderFactory = void 0;
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const types_1 = __webpack_require__("./libs/service-sdk/identity-provider/types.ts");
Object.defineProperty(exports, "IdentityProvider", ({ enumerable: true, get: function () { return types_1.IdentityProvider; } }));
Object.defineProperty(exports, "IdentityProviderType", ({ enumerable: true, get: function () { return types_1.IdentityProviderType; } }));
const cognito_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/index.ts");
const change_password_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/change-password.ts");
Object.defineProperty(exports, "ICognitoChangePasswordInput", ({ enumerable: true, get: function () { return change_password_1.ICognitoChangePasswordInput; } }));
const IdentityProviderFactory = (factory) => {
    switch (factory.type) {
        case types_1.IdentityProviderType.Cognito:
            if (!factory.poolId) {
                factory.logger.error("poolId required");
                throw shared_1.GENERAL_ACTION_ERROR("initialize", "cognito manager");
            }
            return cognito_1.default(factory.poolId, factory.logger);
    }
};
exports.IdentityProviderFactory = IdentityProviderFactory;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/types.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdentityProviderType = void 0;
var IdentityProviderType;
(function (IdentityProviderType) {
    IdentityProviderType[IdentityProviderType["Cognito"] = 0] = "Cognito";
})(IdentityProviderType || (IdentityProviderType = {}));
exports.IdentityProviderType = IdentityProviderType;


/***/ }),

/***/ "./libs/service-sdk/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.entitiesToKeyValue = exports.getEntityFromArray = void 0;
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/event-provider/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/analytics-provider/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/post-room-charge/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/identity-provider/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/uploader/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/migrations/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/test-provider/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/communication/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/logger/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/notification/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/payment/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/payment/interfaces.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/sockets/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/sockets/interfaces.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/types/index.ts"), exports);
const getEntityFromArray = (dep) => {
    const { entityName, arr } = dep;
    return exports.entitiesToKeyValue(arr)[entityName];
};
exports.getEntityFromArray = getEntityFromArray;
const entitiesToKeyValue = (input) => {
    return input.reduce((a, v) => {
        return Object.assign(Object.assign({}, a), { [v.name]: v });
    }, {});
};
exports.entitiesToKeyValue = entitiesToKeyValue;


/***/ }),

/***/ "./libs/service-sdk/logger/index.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logger = void 0;
exports.logger = {
    log: (msg, ...args) => {
        console.log(msg, ...args);
    },
    warn: (msg, ...args) => {
        console.warn(msg, ...args);
    },
    debug: (msg, ...args) => {
        console.debug(msg, ...args);
    },
    error: (msg, ...args) => {
        console.error(msg, ...args);
    }
};


/***/ }),

/***/ "./libs/service-sdk/migrations/config.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = void 0;
const config = {
    entities: [],
    discovery: {
        warnWhenNoEntities: false
    },
    dbName: process.env.DB,
    type: "postgresql",
    port: 5432,
    user: process.env.POSTGRES_USER || "platform",
    password: process.env.POSTGRES_PASSWORD || "platform",
    migrations: {
        tableName: "mikroorm_migrations",
        path: "./db/migrations",
        pattern: /^[\w-]+\d+\.js$/,
        emit: "js"
    }
};
exports["default"] = config;


/***/ }),

/***/ "./libs/service-sdk/migrations/handlers.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.down = exports.up = void 0;
const tslib_1 = __webpack_require__("tslib");
const migration_1 = __webpack_require__("./libs/service-sdk/migrations/migration.ts");
const utils_1 = __webpack_require__("./libs/service-sdk/migrations/utils.ts");
const success = (response) => ({
    statusCode: 200,
    body: JSON.stringify(response)
});
const handler = (handlerName) => (event, context, callback, customConfig) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const stage = process.env.STAGE || "local";
    const migration = new migration_1.default(yield utils_1.getConnectionOptions(customConfig));
    try {
        const response = yield migration[handlerName]();
        if (stage !== "local") {
            callback(null, success(response));
        }
    }
    catch (error) {
        console.error(error);
        if (stage !== "local") {
            callback(error);
        }
        else {
            throw error;
        }
    }
});
const up = handler("runMigrations");
exports.up = up;
const down = handler("undoLastMigrations");
exports.down = down;


/***/ }),

/***/ "./libs/service-sdk/migrations/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/migrations/handlers.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/migrations/config.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/migrations/migration.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const path = __webpack_require__("path");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const utils_1 = __webpack_require__("./libs/service-sdk/migrations/utils.ts");
class Migration {
    constructor(config) {
        this.config = config;
        this.orm = null;
        this.connection = null;
        this.migrator = null;
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (process.env.STAGE !== "local") {
                    yield utils_1.createDatabase(this.config);
                }
                this.orm = yield core_1.MikroORM.init(Object.assign(Object.assign({}, this.config), { migrations: Object.assign(Object.assign({}, this.config.migrations), { path: path.join(__dirname, "./migrations") }) }));
                this.connection = this.orm.em.getConnection();
                this.migrator = this.orm.getMigrator();
            }
            catch (error) {
                logger_1.logger.log("Could not initialize DB connection during migration.");
                throw error;
            }
        });
    }
    runMigrations() {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            try {
                yield utils_1.createMigrationsTable(this.connection);
            }
            catch (error) {
                console.error("Could not create the 'batch_migrations' table while running the migrations.", error);
                yield ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.close(true));
                throw error;
            }
            const pending = yield this.migrator.getPendingMigrations();
            if (pending && pending.length > 0) {
                logger_1.logger.log("Executing the latest batch of migrations...");
                try {
                    const migrations = yield this.migrator.up();
                    if (migrations.length > 0) {
                        const migrationsArray = `{${migrations
                            .reverse()
                            .map((a) => a.file)
                            .join(", ")}}`;
                        yield this.connection.execute(`insert into batch_migrations("migrations") values (?);`, [migrationsArray]);
                    }
                    logger_1.logger.log("All the pending migrations were executed successfully.");
                }
                catch (error) {
                    console.error(`Something went wrong while executing the pending migrations${error}`);
                    throw error;
                }
                finally {
                    logger_1.logger.log("Migrations run", pending.map((a) => a.file).join(", "));
                    yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close(true));
                }
            }
            else {
                logger_1.logger.log("No new migrations were found.");
            }
            yield ((_c = this.connection) === null || _c === void 0 ? void 0 : _c.close(true));
            return {
                migrations_up: pending.map((a) => a.file)
            };
        });
    }
    undoLastMigrations() {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            logger_1.logger.log("Rolling back the latest batch of migrations...");
            yield this.init();
            const migrations = yield this.connection.execute("select \"id\", \"migrations\", \"deleted_at\" from batch_migrations order by id desc limit 1");
            let migrationsArray = [];
            if (migrations && migrations.length > 0 && !migrations[0].deleted_at) {
                const migration = migrations[0];
                migrationsArray = migration.migrations;
                try {
                    yield this.migrator.down({
                        migrations: migrationsArray
                    });
                    yield this.connection.execute(`update "batch_migrations" set deleted_at = now() where id = ?;`, [migration.id]);
                    logger_1.logger.log("Latest batch of migrations was rolled back successfully.");
                }
                catch (error) {
                    console.error(`Something went wrong while reverting the latest batch of migrations${error}`);
                    throw error;
                }
                finally {
                    logger_1.logger.log("Latest batch of migrations: ", migrationsArray);
                    yield ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.close(true));
                }
            }
            else {
                logger_1.logger.log("No batch of latest migrations was found or the last migration sequence has already been rolled back.");
            }
            yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close(true));
            return {
                migrations_down: migrationsArray
            };
        });
    }
}
exports["default"] = Migration;


/***/ }),

/***/ "./libs/service-sdk/migrations/utils.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDatabase = exports.createMigrationsTable = exports.getConnectionOptions = void 0;
const tslib_1 = __webpack_require__("tslib");
const AWS = __webpack_require__("aws-sdk");
const core_1 = __webpack_require__("@mikro-orm/core");
const path = __webpack_require__("path");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
function getConnectionOptions(customConfig) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (customConfig) {
            return customConfig;
        }
        const SecretId = `${process.env.STAGE}/infra`;
        const smClient = new AWS.SecretsManager({ region: process.env.REGION });
        const secretValues = yield smClient.getSecretValue({ SecretId }).promise();
        const { aurora_master_user: auroraUsername, aurora_master_user_password: auroraPassword } = JSON.parse(secretValues.SecretString);
        return {
            type: "postgresql",
            dbName: process.env.DB,
            host: process.env.AURORA_ENDPOINT,
            port: 5432,
            discovery: {
                warnWhenNoEntities: false,
                requireEntitiesArray: false
            },
            user: auroraUsername,
            password: auroraPassword,
            migrations: {
                tableName: "mikroorm_migrations",
                path: path.join(__dirname, "./migrations"),
                dropTables: true,
                allOrNothing: true,
                pattern: /^[\w-]+\d+\.js$/,
                emit: "js"
            }
        };
    });
}
exports.getConnectionOptions = getConnectionOptions;
function createMigrationsTable(connection) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield connection.execute(`
    CREATE TABLE IF NOT EXISTS batch_migrations
    (
        id serial NOT NULL,
        migrations character varying[] NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        deleted_at timestamp with time zone,
        CONSTRAINT migrations_custom_pkey PRIMARY KEY (id)
    );
  `);
    });
}
exports.createMigrationsTable = createMigrationsTable;
function createDatabase(config) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: "postgres" }));
        if (!config.dbName) {
            logger_1.logger.error("DB environment variable missing");
            throw new Error("DB not defined");
        }
        try {
            logger_1.logger.log("Creating database if it doesn't already exist...");
            yield connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
        }
        catch (error) {
            if (error.code !== "42P04") {
                logger_1.logger.error("An error happened while creating the database", error);
                throw error;
            }
        }
        finally {
            logger_1.logger.log(`Database ${config.dbName} was created or already exists.`);
        }
        yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
    });
}
exports.createDatabase = createDatabase;


/***/ }),

/***/ "./libs/service-sdk/notification/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.notificationService = void 0;
var notification_service_1 = __webpack_require__("./libs/service-sdk/notification/notification-service.ts");
Object.defineProperty(exports, "notificationService", ({ enumerable: true, get: function () { return notification_service_1.default; } }));


/***/ }),

/***/ "./libs/service-sdk/notification/notification-service.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const aws_sdk_1 = __webpack_require__("aws-sdk");
const sns = new aws_sdk_1.SNS({ apiVersion: "2010-03-31", region: process.env.AWS_REGION });
class NotificationService {
    publish(notification) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.sendSMSNotification(notification);
        });
    }
    sendSMSNotification(notification) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = {
                MessageAttributes: {
                    "AWS.SNS.SMS.SenderID": {
                        DataType: "String",
                        StringValue: notification.senderId
                    }
                },
                Message: notification.message,
                PhoneNumber: notification.phoneNumber
            };
            return yield sns.publish(params).promise();
        });
    }
}
exports["default"] = new NotificationService();


/***/ }),

/***/ "./libs/service-sdk/payment/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getPaymentService = void 0;
const square_1 = __webpack_require__("./libs/service-sdk/payment/square/index.ts");
const interfaces_1 = __webpack_require__("./libs/service-sdk/payment/interfaces.ts");
const squareService = new square_1.SquareService();
const getPaymentService = (type) => {
    switch (type) {
        case interfaces_1.PaymentProvider.SQUARE:
            return squareService;
        default:
            throw new Error("Payment type not supported");
    }
};
exports.getPaymentService = getPaymentService;


/***/ }),

/***/ "./libs/service-sdk/payment/interfaces.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Currencies = exports.PaymentProvider = void 0;
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider[PaymentProvider["SQUARE"] = 0] = "SQUARE";
})(PaymentProvider = exports.PaymentProvider || (exports.PaymentProvider = {}));
var Currencies;
(function (Currencies) {
    Currencies["USD"] = "USD";
})(Currencies = exports.Currencies || (exports.Currencies = {}));


/***/ }),

/***/ "./libs/service-sdk/payment/square/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SquareService = exports.InvalidCreateCustomerError = exports.InvalidCreateCardError = exports.InvalidCompleteError = exports.InvalidCancelError = exports.InvalidUpdateError = exports.InvalidRefundError = exports.InvalidTokenError = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const square_1 = __webpack_require__("square");
const interfaces_1 = __webpack_require__("./libs/service-sdk/payment/interfaces.ts");
class InvalidTokenError extends service_sdk_1.BaseError {
}
exports.InvalidTokenError = InvalidTokenError;
class InvalidRefundError extends service_sdk_1.BaseError {
}
exports.InvalidRefundError = InvalidRefundError;
class InvalidUpdateError extends service_sdk_1.BaseError {
}
exports.InvalidUpdateError = InvalidUpdateError;
class InvalidCancelError extends service_sdk_1.BaseError {
}
exports.InvalidCancelError = InvalidCancelError;
class InvalidCompleteError extends service_sdk_1.BaseError {
}
exports.InvalidCompleteError = InvalidCompleteError;
class InvalidCreateCardError extends service_sdk_1.BaseError {
}
exports.InvalidCreateCardError = InvalidCreateCardError;
class InvalidCreateCustomerError extends service_sdk_1.BaseError {
}
exports.InvalidCreateCustomerError = InvalidCreateCustomerError;
class SquareService {
    constructor() {
        this.client = new square_1.Client({
            environment: process.env.STAGE === "local" || process.env.STAGE === "development" ?
                square_1.Environment.Sandbox : square_1.Environment.Production,
            accessToken: process.env.SQUARE_ACCESS_TOKEN
        });
        this.createCustomer = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const { customersApi } = this.client;
            let response;
            try {
                const { result } = yield customersApi.createCustomer(body);
                response = {
                    id: (_a = result.customer) === null || _a === void 0 ? void 0 : _a.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCreateCustomerError(errors[0].code, statusCode, "Customer is not able to be created");
                    }
                }
            }
            return response;
        });
        this.createCard = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b;
            const { cardsApi } = this.client;
            let response;
            try {
                const { result } = yield cardsApi.createCard(body);
                response = {
                    id: (_b = result.card) === null || _b === void 0 ? void 0 : _b.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCreateCardError(errors[0].code, statusCode, "Card is not able to be created");
                    }
                }
            }
            return response;
        });
        this.createPayment = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.createPayment(body);
                response = {
                    transactionId: result.payment.id,
                    versionToken: result.payment.versionToken
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidTokenError(errors[0].code, statusCode, "Card is not valid");
                    }
                }
            }
            return response;
        });
        this.refundPayment = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { refundsApi } = this.client;
            let response;
            try {
                const { result } = yield refundsApi.refundPayment(body);
                response = {
                    id: result.refund.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidRefundError(errors[0].code, statusCode, "Something went wrong with refund");
                    }
                }
            }
            return response;
        });
        this.updatePayment = (paymentId, body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.updatePayment(paymentId, body);
                response = {
                    id: result.payment.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidUpdateError(errors[0].code, statusCode, "Something went wrong with update payment");
                    }
                }
            }
            return response;
        });
        this.cancelPayment = (paymentId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.cancelPayment(paymentId);
                response = {
                    id: result.payment.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCancelError(errors[0].code, statusCode, "Something went wrong with cancel payment");
                    }
                }
            }
            return response;
        });
        this.completePayment = (paymentId, body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.completePayment(paymentId, body);
                response = {
                    id: result.payment.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCompleteError(errors[0].code, statusCode, "Something went wrong with complete payment");
                    }
                }
                throw error;
            }
            return response;
        });
    }
    pay(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyForCustomerRequest = {};
            bodyForCustomerRequest.emailAddress = input.clientEmail;
            bodyForCustomerRequest.phoneNumber = input.clientPhoneNumber;
            bodyForCustomerRequest.givenName = input.clientName.substring(0, input.clientName.lastIndexOf(" ") + 1);
            bodyForCustomerRequest.familyName = input.clientName.substring(input.clientName.lastIndexOf(" ") + 1, input.clientName.length);
            const customer = yield this.createCustomer(bodyForCustomerRequest);
            const bodyCard = {};
            bodyCard.customerId = customer.id;
            const bodyForCardRequest = {
                card: bodyCard,
                sourceId: input.nonce,
                idempotencyKey: shared_1.uuidv4()
            };
            const card = yield this.createCard(bodyForCardRequest);
            const bodyAmountMoney = {};
            bodyAmountMoney.amount = BigInt(input.amount);
            bodyAmountMoney.currency = interfaces_1.Currencies.USD;
            const bodyTipMoney = {};
            if (input.tip !== null && input.tip !== undefined) {
                bodyTipMoney.amount = BigInt(input.tip);
                bodyTipMoney.currency = interfaces_1.Currencies.USD;
            }
            const body = {
                sourceId: card.id,
                idempotencyKey: shared_1.uuidv4(),
                amountMoney: bodyAmountMoney
            };
            body.autocomplete = false;
            body.tipMoney = bodyTipMoney;
            body.customerId = customer.id;
            body.locationId = process.env.SQUARE_LOCATION_ID;
            return this.createPayment(body);
        });
    }
    refund(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyAmountMoney = {};
            bodyAmountMoney.amount = BigInt(input.amount);
            bodyAmountMoney.currency = interfaces_1.Currencies.USD;
            const body = {
                idempotencyKey: shared_1.uuidv4(),
                amountMoney: bodyAmountMoney
            };
            body.paymentId = input.paymentId;
            body.reason = input.reason;
            return this.refundPayment(body);
        });
    }
    update(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentId } = input;
            const bodyPayment = {};
            if (input.amount !== null && input.amount !== undefined) {
                const bodyPaymentAmountMoney = {};
                bodyPaymentAmountMoney.amount = BigInt(input.amount);
                bodyPaymentAmountMoney.currency = interfaces_1.Currencies.USD;
                bodyPayment.amountMoney = bodyPaymentAmountMoney;
            }
            if (input.tip !== null && input.tip !== undefined) {
                const bodyPaymentTipMoney = {};
                bodyPaymentTipMoney.amount = BigInt(input.tip);
                bodyPaymentTipMoney.currency = interfaces_1.Currencies.USD;
                bodyPayment.tipMoney = bodyPaymentTipMoney;
            }
            const body = {
                idempotencyKey: shared_1.uuidv4()
            };
            body.payment = bodyPayment;
            return this.updatePayment(paymentId, body);
        });
    }
    complete(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = {};
            if (input.versionToken !== null) {
                body.versionToken = input.versionToken;
            }
            return this.completePayment(input.paymentId, body);
        });
    }
    cancel(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.cancelPayment(input.paymentId);
        });
    }
}
exports.SquareService = SquareService;


/***/ }),

/***/ "./libs/service-sdk/post-room-charge/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IPostRoomChargeInput = exports.PostRoomChargeType = exports.getPostRoomChargeService = void 0;
const utils_1 = __webpack_require__("./libs/service-sdk/utils/index.ts");
const pms_1 = __webpack_require__("./libs/service-sdk/post-room-charge/pms/index.ts");
Object.defineProperty(exports, "IPostRoomChargeInput", ({ enumerable: true, get: function () { return pms_1.IPostRoomChargeInput; } }));
var PostRoomChargeType;
(function (PostRoomChargeType) {
    PostRoomChargeType["PMS"] = "PMS";
})(PostRoomChargeType || (PostRoomChargeType = {}));
exports.PostRoomChargeType = PostRoomChargeType;
class PostRoomChargeError extends utils_1.BaseError {
    constructor(message, code = utils_1.StatusCodes.INTERNAL_SERVER) {
        super("Post room charge error", code, message);
    }
}
const postRoomChargePMS = pms_1.PMSProvider();
const getPostRoomChargeService = (type) => {
    if (type === PostRoomChargeType.PMS) {
        return postRoomChargePMS;
    }
    else {
        throw new PostRoomChargeError(`Post room charge type ${type} is not supported`, utils_1.StatusCodes.NOT_IMPLEMENTED);
    }
};
exports.getPostRoomChargeService = getPostRoomChargeService;


/***/ }),

/***/ "./libs/service-sdk/post-room-charge/pms/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PMSProvider = void 0;
const tslib_1 = __webpack_require__("tslib");
const axios_1 = __webpack_require__("axios");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const PMS_URLS = {
    local: process.env.PMS_URL_LOCAL,
    dev: process.env.PMS_URL_DEV,
    qa: process.env.PMS_URL_QA,
    prod: process.env.PMS_URL_PROD
};
const getPMSUrl = (stage) => {
    return PMS_URLS[stage];
};
const sendToPMS = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.STAGE === "test" || "development" === "test") {
        return "Success";
    }
    const pmsUrl = getPMSUrl(process.env.STAGE);
    return axios_1.default.post(pmsUrl, data);
});
const PMSProvider = () => {
    const post = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield sendToPMS(data);
            logger_1.logger.log("Pms post room charge finished successfully", data);
        }
        catch (e) {
            logger_1.logger.log("[PMS-post-room-charge]: ", e.message);
        }
    });
    return {
        post
    };
};
exports.PMSProvider = PMSProvider;


/***/ }),

/***/ "./libs/service-sdk/secret-manager/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SecretManagerService = void 0;
const tslib_1 = __webpack_require__("tslib");
const aws_sdk_1 = __webpack_require__("aws-sdk");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const smClient = new aws_sdk_1.SecretsManager({ region: process.env.REGION });
const SecretManagerService = () => {
    const getSecretValue = (SecretId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        let secretValue = null;
        try {
            secretValue = yield smClient.getSecretValue({ SecretId }).promise();
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Could not retrieve the secret value");
        }
        try {
            return JSON.parse(secretValue === null || secretValue === void 0 ? void 0 : secretValue.SecretString);
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Error parsing the secret string");
        }
    });
    return {
        getSecretValue
    };
};
exports.SecretManagerService = SecretManagerService;


/***/ }),

/***/ "./libs/service-sdk/sockets/api-gateway/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.APIGatewayWebSocketService = exports.BroadCastError = exports.ConnectionError = void 0;
const tslib_1 = __webpack_require__("tslib");
const AWS = __webpack_require__("aws-sdk");
const jwt = __webpack_require__("jsonwebtoken");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const interfaces_1 = __webpack_require__("./libs/service-sdk/sockets/interfaces.ts");
const tableName = process.env.DYNAMO_TABLE_MANAGEMENT_CONNECTION;
const dbClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    endpoint: process.env.DYNAMO_ENDPOINT,
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: process.env.SOCKET_API_GATEWAY_URL
});
class ConnectionError extends service_sdk_1.BaseError {
}
exports.ConnectionError = ConnectionError;
class BroadCastError extends service_sdk_1.BaseError {
}
exports.BroadCastError = BroadCastError;
class APIGatewayWebSocketService {
    connect(event) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connectionId = event.requestContext.connectionId;
            const token = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.token;
            const payload = token ? jwt.decode(token, { complete: true }) : null;
            const putParams = {
                TableName: tableName,
                Item: {
                    connectionId,
                    email: (_b = payload === null || payload === void 0 ? void 0 : payload.payload) === null || _b === void 0 ? void 0 : _b.username
                }
            };
            try {
                yield dbClient.put(putParams).promise();
            }
            catch (e) {
                logger_1.logger.log(e);
                throw new ConnectionError("Connection Error", e.statusCode, JSON.stringify(e));
            }
            return {
                statusCode: service_sdk_1.StatusCodes.OK
            };
        });
    }
    disconnect(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connectionId = event.requestContext.connectionId;
            const delParams = {
                TableName: tableName,
                Key: {
                    connectionId
                }
            };
            try {
                yield dbClient.delete(delParams).promise();
            }
            catch (e) {
                logger_1.logger.log(e);
                throw new ConnectionError("Disconnect Error", e.statusCode, JSON.stringify(e));
            }
            return {
                statusCode: service_sdk_1.StatusCodes.OK
            };
        });
    }
    broadcast(input) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!Object.keys(interfaces_1.WebSocketActionTypes).indexOf(input.action)) {
                return {
                    statusCode: service_sdk_1.StatusCodes.BAD_REQUEST,
                    message: "Invalid action"
                };
            }
            let connectionIds = input.connectionIds;
            if (((_a = input.connectionIds) === null || _a === void 0 ? void 0 : _a.length) === 0 || input.connectionIds === undefined) {
                connectionIds = yield this.fetchAllData();
            }
            const broadCastParameters = {
                connectionIds,
                body: {
                    action: interfaces_1.WebSocketActionTypes[input.action].key,
                    id: input.id,
                    data: interfaces_1.WebSocketActionTypes[input.action].key
                }
            };
            return this.broadcastMessage(broadCastParameters);
        });
    }
    broadcastMessage(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connectionIds = input.connectionIds;
            if (!connectionIds || connectionIds.length === 0) {
                return {
                    statusCode: service_sdk_1.StatusCodes.BAD_REQUEST,
                    message: "No connectionIds"
                };
            }
            const postData = JSON.stringify(input.body);
            const postCalls = connectionIds === null || connectionIds === void 0 ? void 0 : connectionIds.map((connectionId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    yield apigwManagementApi
                        .postToConnection({ ConnectionId: connectionId, Data: postData })
                        .promise();
                }
                catch (e) {
                    if (e.statusCode === 410) {
                        logger_1.logger.log(`Found stale connection, deleting ${connectionId}`);
                        yield dbClient
                            .delete({
                            TableName: tableName,
                            Key: { connectionId }
                        })
                            .promise();
                    }
                    else {
                        logger_1.logger.log(JSON.stringify(e));
                        throw new BroadCastError("Broadcast Error", e.statusCode, JSON.stringify(e));
                    }
                }
            }));
            try {
                if (postCalls)
                    yield Promise.all(postCalls);
            }
            catch (e) {
                logger_1.logger.log(e);
                throw new BroadCastError("Broadcast Error", e.statusCode, JSON.stringify(e));
            }
            return {
                statusCode: service_sdk_1.StatusCodes.OK,
                message: "Data sent."
            };
        });
    }
    fetchAllData() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connectionData = yield dbClient
                .scan({
                TableName: tableName,
                ProjectionExpression: "connectionId"
            })
                .promise();
            return ((_a = connectionData === null || connectionData === void 0 ? void 0 : connectionData.Items) === null || _a === void 0 ? void 0 : _a.map((item) => item.connectionId)) || [];
        });
    }
}
exports.APIGatewayWebSocketService = APIGatewayWebSocketService;


/***/ }),

/***/ "./libs/service-sdk/sockets/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getWebSocketService = void 0;
const interfaces_1 = __webpack_require__("./libs/service-sdk/sockets/interfaces.ts");
const api_gateway_1 = __webpack_require__("./libs/service-sdk/sockets/api-gateway/index.ts");
const getWebSocketService = (type) => {
    switch (type) {
        case interfaces_1.WebSocketProvider.APIGATEWAY:
            return new api_gateway_1.APIGatewayWebSocketService();
        default:
            throw new Error("WebSocket type not supported");
    }
};
exports.getWebSocketService = getWebSocketService;


/***/ }),

/***/ "./libs/service-sdk/sockets/interfaces.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebSocketProvider = exports.WebSocketActionTypes = exports.orderUpdateKitchenConfirmDate = exports.orderRemoveFoodCarrier = exports.markOrderAsReadEvent = exports.orderCompletedEvent = exports.orderConfirmedEvent = exports.orderDeliveredEvent = exports.orderCancelledEvent = exports.orderCreatedEvent = exports.orderUpdateTip = exports.orderUpdatedEvent = exports.orderRejectEvent = exports.orderPickupEvent = exports.orderAssignedEvent = void 0;
exports.orderAssignedEvent = "order-assigned";
exports.orderPickupEvent = "order-pickup";
exports.orderRejectEvent = "order-reject";
exports.orderUpdatedEvent = "order-updated";
exports.orderUpdateTip = "order-update-tip";
exports.orderCreatedEvent = "order-created";
exports.orderCancelledEvent = "order-cancelled";
exports.orderDeliveredEvent = "order-delivered";
exports.orderConfirmedEvent = "order-confirmed";
exports.orderCompletedEvent = "order-completed";
exports.markOrderAsReadEvent = "mark-order-as-read";
exports.orderRemoveFoodCarrier = "order-remove-food-carrier";
exports.orderUpdateKitchenConfirmDate = "order-update-kitchen-confirm-date";
// SQU5-428
exports.WebSocketActionTypes = {
    [exports.orderPickupEvent]: {
        key: "order-pickup"
    },
    [exports.orderUpdatedEvent]: {
        key: "order-updated"
    },
    [exports.orderCreatedEvent]: {
        key: "order-created"
    },
    [exports.orderCancelledEvent]: {
        key: "order-cancelled"
    },
    [exports.orderDeliveredEvent]: {
        key: "order-delivered"
    },
    [exports.orderConfirmedEvent]: {
        key: "order-confirmed"
    },
    [exports.orderCompletedEvent]: {
        key: "order-completed"
    },
    [exports.orderRejectEvent]: {
        key: "order-rejected"
    },
    [exports.orderAssignedEvent]: {
        key: "order-assigned"
    },
    [exports.markOrderAsReadEvent]: {
        key: "mark-order-as-read"
    },
    [exports.orderRemoveFoodCarrier]: {
        key: "order-remove-food-carrier"
    },
    [exports.orderUpdateTip]: {
        key: "order-update-tip"
    },
    [exports.orderUpdateKitchenConfirmDate]: {
        key: "order-update-kitchen-confirm-date"
    }
};
var WebSocketProvider;
(function (WebSocketProvider) {
    WebSocketProvider[WebSocketProvider["APIGATEWAY"] = 0] = "APIGATEWAY";
})(WebSocketProvider = exports.WebSocketProvider || (exports.WebSocketProvider = {}));


/***/ }),

/***/ "./libs/service-sdk/test-provider/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/test-provider/util.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/test-provider/util.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.services = exports.dropTestDatabase = exports.clearDatabase = exports.seedDatabase = exports.getSeedFileContent = exports.runMigrations = exports.getTestConnection = exports.createTestDatabase = void 0;
const tslib_1 = __webpack_require__("tslib");
const fs_1 = __webpack_require__("fs");
const core_1 = __webpack_require__("@mikro-orm/core");
const path = __webpack_require__("path");
const createTestDatabase = (config) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dropTestDatabase(config);
        const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: "postgres" }));
        yield connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
        yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
    }
    catch (error) {
        console.error("An error happened while creating the database", error);
        throw error;
    }
});
exports.createTestDatabase = createTestDatabase;
const getTestConnection = (dbName, entities) => {
    return core_1.MikroORM.init({
        entities: entities,
        host: process.env.POSTGRES_HOST || "127.0.0.1",
        user: process.env.POSTGRES_USERNAME || "platform",
        password: process.env.POSTGRES_PASSWORD || "platform",
        port: +process.env.POSTGRES_PORT || 5432,
        type: "postgresql",
        dbName: dbName,
        debug:  true && process.env.STAGE === "local",
        migrations: {
            tableName: "mikroorm_migrations",
            path: "./db/migrations",
            pattern: /^[\w-]+\d+\.js$/,
            emit: "js"
        }
    });
};
exports.getTestConnection = getTestConnection;
const runMigrations = (connection) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const migrator = connection.getMigrator();
    yield migrator.up();
});
exports.runMigrations = runMigrations;
const getSeedFileContent = (rootDir) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let seedContent = "";
    const fileLocation = path.join(rootDir, "db", "seed.sql");
    try {
        const fileContent = yield fs_1.promises.readFile(fileLocation);
        seedContent = fileContent.toString();
    }
    catch (error) {
        console.error(`The "seed.sql" file is missing in the "${fileLocation}" path.`);
    }
    return seedContent;
});
exports.getSeedFileContent = getSeedFileContent;
const seedDatabase = (connection, rootDir) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const seedContent = yield getSeedFileContent(rootDir);
    yield connection.em.getConnection().execute(seedContent);
});
exports.seedDatabase = seedDatabase;
const clearDatabase = (connection) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const tableNames = [];
    for (const { tableName } of Object.values(connection.getMetadata().getAll())) {
        if (tableName) {
            tableNames.push(tableName);
        }
    }
    yield connection.em.getConnection().execute(`TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE;`);
});
exports.clearDatabase = clearDatabase;
const dropTestDatabase = (config) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: "postgres" }));
    yield (connection === null || connection === void 0 ? void 0 : connection.em.getConnection().execute(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${config.dbName}'
      AND pid <> pg_backend_pid();
  `));
    yield (connection === null || connection === void 0 ? void 0 : connection.em.getConnection().execute(`DROP DATABASE IF EXISTS "${config.dbName}"`));
    yield (connection === null || connection === void 0 ? void 0 : connection.close());
});
exports.dropTestDatabase = dropTestDatabase;
const services = {
    IAM: {
        app: "service-iam",
        database: "service_iam"
    },
    MENU: {
        app: "service-menu",
        database: "service_menu"
    },
    NETWORK: {
        app: "service-network",
        database: "service_network"
    },
    VOUCHER: {
        app: "service-voucher",
        database: "service_voucher"
    },
    ORDER: {
        app: "service-order",
        database: "service_order"
    }
};
exports.services = services;


/***/ }),

/***/ "./libs/service-sdk/uploader/image.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NewUploadService = void 0;
const tslib_1 = __webpack_require__("tslib");
const aws_sdk_1 = __webpack_require__("aws-sdk");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const client_s3_1 = __webpack_require__("@aws-sdk/client-s3");
const s3_request_presigner_1 = __webpack_require__("@aws-sdk/s3-request-presigner");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
const s3Client = new client_s3_1.S3Client({ apiVersion: "2006-03-01", region: process.env.REGION });
const s3 = new aws_sdk_1.S3({ apiVersion: "2006-03-01" });
const stepFunctions = new aws_sdk_1.StepFunctions({ region: "us-east-1" });
const IMAGE_ORIGIN_BASEPATH = "image/original";
const NewUploadService = () => {
    const uploadimage = (bucket, key) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const imagekey = key || shared_1.uuidv4();
        const originalkey = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
        const imageUploadResponse = yield stepFunctions.startSyncExecution({
            stateMachineArn: process.env.SAVE_IMAGE_SF,
            input: JSON.stringify({
                key: imagekey,
                bucket,
                originalkey
            })
        }).promise();
        return (imageUploadResponse.status === shared_1.StepFunctionStatus.SUCCESS &&
            JSON.parse(imageUploadResponse.output).isValid) ? imagekey : null;
    });
    const getPresignedURL = (bucket, existingKey) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const imagekey = existingKey || shared_1.uuidv4();
        const key = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key
        });
        // Create the presigned URL.
        try {
            const signedUrl = yield s3_request_presigner_1.getSignedUrl(s3Client, command, {
                expiresIn: 3600
            });
            return [signedUrl, imagekey];
        }
        catch (err) {
            logger_1.logger.log("error-presign-url-util: ", err);
        }
        return [null, null];
    });
    return {
        uploadimage,
        getPresignedURL
    };
};
exports.NewUploadService = NewUploadService;


/***/ }),

/***/ "./libs/service-sdk/uploader/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/uploader/image.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/utils/error-handler.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorHandler = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
const _1 = __webpack_require__("./libs/service-sdk/utils/index.ts");
const errorHandler = (err, req, res, next) => {
    var _a;
    if (res.headersSent) {
        return next(err);
    }
    console.error(err);
    if (err instanceof service_sdk_1.ValidationError) {
        const errors = [];
        let error;
        if (err.errors) {
            err.errors.forEach((element) => errors.push(element));
            const validationError = new service_sdk_1.ValidationError(errors);
            error = new service_sdk_1.HttpError(validationError.name, validationError.status, validationError.message, errors);
        }
        return res.status(error.status).json(error).end();
    }
    else if (err instanceof core_1.DriverException || err instanceof core_1.ValidationError) {
        let error;
        switch (true) {
            case err instanceof core_1.UniqueConstraintViolationException:
                error = new _1.ConflictError("This entity already exists.");
                break;
            case err instanceof core_1.OptimisticLockError:
                error = new _1.ConflictError("Someone else has already changed this entity.");
                break;
            default:
                error = new _1.InternalServerError();
                break;
        }
        error = new service_sdk_1.HttpError(error.name, error.status, error.message);
        return res.status(error.status).json(error).end();
    }
    else {
        let error;
        if (err instanceof service_sdk_1.BaseError) {
            const message = (_a = err.message) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, "").trim();
            error = new service_sdk_1.HttpError(err.name, err.status, message);
        }
        else {
            error = new service_sdk_1.HttpError();
        }
        return res.status(error.status).json(error).end();
    }
};
exports.errorHandler = errorHandler;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/base-error.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseError = exports.StatusCodes = void 0;
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["OK"] = 200] = "OK";
    StatusCodes[StatusCodes["CREATED"] = 201] = "CREATED";
    StatusCodes[StatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCodes[StatusCodes["UNAUTHORIZED"] = 403] = "UNAUTHORIZED";
    StatusCodes[StatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCodes[StatusCodes["CONFLICT"] = 409] = "CONFLICT";
    StatusCodes[StatusCodes["GONE"] = 410] = "GONE";
    StatusCodes[StatusCodes["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    StatusCodes[StatusCodes["INTERNAL_SERVER"] = 500] = "INTERNAL_SERVER";
    StatusCodes[StatusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
})(StatusCodes || (StatusCodes = {}));
exports.StatusCodes = StatusCodes;
class BaseError extends Error {
    constructor(name, status, message, errors = []) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.message = message;
        this.status = status;
        this.errors = errors;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
    toJSON() {
        return Object.assign(Object.assign(Object.assign({ name: this.name, status: this.status }, (this.errors.length === 0 && { message: this.message })), (this.errors.length > 0 && { errors: this.errors })), ((process.env.STAGE === "local" || process.env.STAGE === "development") && { stack: this.stack }));
    }
}
exports.BaseError = BaseError;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/errors.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InternalServerError = exports.CustomError = exports.ValidationError = exports.NotFoundError = exports.AuthorizationError = exports.BadRequestError = exports.ConflictError = void 0;
const _1 = __webpack_require__("./libs/service-sdk/utils/error-types/index.ts");
class ConflictError extends _1.BaseError {
    constructor(message) {
        super("Conflict Error", _1.StatusCodes.CONFLICT, message);
        this.message = message;
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends _1.BaseError {
    constructor(message) {
        super("Bad Request", _1.StatusCodes.BAD_REQUEST, message);
        this.message = message;
    }
}
exports.BadRequestError = BadRequestError;
class AuthorizationError extends _1.BaseError {
    constructor(message = "Permission denied") {
        super("Authorization Error", _1.StatusCodes.UNAUTHORIZED, message);
        this.message = message;
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends _1.BaseError {
    constructor(entityName, customMessage) {
        super("Not Found", _1.StatusCodes.NOT_FOUND, customMessage || entityName + " not found.");
        this.entityName = entityName;
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends _1.BaseError {
    constructor(message = "Internal server error.") {
        super("Internal Error", _1.StatusCodes.INTERNAL_SERVER, message);
    }
}
exports.InternalServerError = InternalServerError;
class ValidationError extends _1.BaseError {
    constructor(errors) {
        super("Validation Error", _1.StatusCodes.UNPROCESSABLE_ENTITY, "Validation error.", errors);
    }
}
exports.ValidationError = ValidationError;
class CustomError extends _1.BaseError {
    constructor(name, status, message) {
        super(name, status, message);
    }
}
exports.CustomError = CustomError;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/http-error.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpError = void 0;
const base_error_1 = __webpack_require__("./libs/service-sdk/utils/error-types/base-error.ts");
class HttpError extends base_error_1.BaseError {
    constructor(name = "Internal Error", status = base_error_1.StatusCodes.INTERNAL_SERVER, message = "Internal server error.", errors) {
        super(name, status, message, errors);
    }
}
exports.HttpError = HttpError;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/base-error.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/http-error.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/errors.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/utils/events-local.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.eventsLocal = void 0;
const tslib_1 = __webpack_require__("tslib");
const event_provider_1 = __webpack_require__("./libs/service-sdk/event-provider/index.ts");
function eventsLocal(eventHandlers) {
    const localSubscriber = new event_provider_1.EvClient();
    Object.keys(eventHandlers).forEach((channel) => {
        localSubscriber.subscribe(channel);
    });
    localSubscriber.on("message", (channel, message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const messageParsed = JSON.parse(message);
        const functionsToExecute = eventHandlers[channel];
        functionsToExecute.forEach((functionToExecute) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield functionToExecute(messageParsed);
        }));
    }));
}
exports.eventsLocal = eventsLocal;


/***/ }),

/***/ "./libs/service-sdk/utils/express-local.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.expressLocal = void 0;
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const logger_1 = __webpack_require__("./libs/service-sdk/logger/index.ts");
function expressLocal(app, name) {
    const { port } = shared_1.appsDefinitionLocal[name];
    const server = app.listen(port, () => {
        logger_1.logger.log(`Listening at http://localhost:${port}/api`);
        logger_1.logger.log(`Documentation at http://butler.localhost:${port}/api/${name}/docs`);
    });
    server.on("error", console.error);
}
exports.expressLocal = expressLocal;


/***/ }),

/***/ "./libs/service-sdk/utils/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-handler.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/statusCodes.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/events-local.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/express-local.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/validator.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/service-db-connection.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/qr-code.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/postmark.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/utils/postmark.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sendEmail = void 0;
const tslib_1 = __webpack_require__("tslib");
const postmark = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'postmark'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const sendEmail = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const client = new postmark.Client(process.env.POSTMARK_SERVER_TOKEN);
    return yield client.sendEmail(Object.assign({ "From": data.from, "To": data.to.join(","), "Subject": data.subject, "Attachments": data.attachments }, (data.htmlBody ? { "HtmlBody": data.htmlBody } : { "Textbody": data.textBody })));
});
exports.sendEmail = sendEmail;


/***/ }),

/***/ "./libs/service-sdk/utils/qr-code.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateQRCode = void 0;
const tslib_1 = __webpack_require__("tslib");
const QRCode = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'qrcode'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const generateQRCode = (data, version = 8) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return yield QRCode.toDataURL(data, { version });
});
exports.generateQRCode = generateQRCode;


/***/ }),

/***/ "./libs/service-sdk/utils/service-db-connection.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getServiceDBConnection = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const getServiceDBConnection = (dep) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { tenant, service, entities } = dep;
    const serviceConnection = {
        [shared_1.AppEnum.NETWORK]: {
            tenant,
            dbname: process.env.NETWORK_DB,
            entities,
            service: shared_1.AppEnum.NETWORK,
            pooling: true
        },
        [shared_1.AppEnum.MENU]: {
            tenant,
            dbname: process.env.MENU_DB,
            entities,
            service: shared_1.AppEnum.MENU,
            pooling: true
        },
        [shared_1.AppEnum.VOUCHER]: {
            tenant,
            dbname: process.env.VOUCHER_DB,
            entities,
            service: shared_1.AppEnum.VOUCHER,
            pooling: true
        },
        [shared_1.AppEnum.DISCOUNT]: {
            tenant,
            dbname: process.env.DISCOUNT_DB,
            entities,
            service: shared_1.AppEnum.DISCOUNT,
            pooling: true
        },
        [shared_1.AppEnum.IAM]: {
            tenant,
            dbname: process.env.IAM_DB,
            entities,
            service: shared_1.AppEnum.IAM,
            pooling: true
        },
        [shared_1.AppEnum.ORDER]: {
            tenant,
            dbname: process.env.ORDER_DB,
            entities,
            service: shared_1.AppEnum.ORDER,
            pooling: true
        }
    }[service];
    if (!serviceConnection) {
        throw new Error(`No connection found for service ${service} and tenant ${tenant}`);
    }
    return service_sdk_1.connection.getConnection(serviceConnection);
});
exports.getServiceDBConnection = getServiceDBConnection;


/***/ }),

/***/ "./libs/service-sdk/utils/statusCodes.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpStatusCode = void 0;
exports.HttpStatusCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410,
    INTERNAL_SERVER: 500
};


/***/ }),

/***/ "./libs/service-sdk/utils/validator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateInput = exports.prettyError = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
const prettyError = (errors) => {
    let allErrors = [];
    errors.forEach((err) => {
        var _a;
        if (err.children && ((_a = err.children) === null || _a === void 0 ? void 0 : _a.length) !== 0) {
            allErrors = [...allErrors, { entity: err.property, errors: [...exports.prettyError(err.children)] }];
            return allErrors;
        }
        allErrors.push(Object.values(err.constraints)[0]);
        return allErrors;
    });
    return allErrors;
};
exports.prettyError = prettyError;
const validateInput = (payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return class_validator_1.validate(payload, { whitelist: true, forbidNonWhitelisted: true }).then((validationErrors) => {
        if (validationErrors.length > 0) {
            return exports.prettyError(validationErrors);
        }
        return [];
    });
});
exports.validateInput = validateInput;


/***/ }),

/***/ "./libs/shared/base.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/common.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AmountType = exports.VoucherType = exports.PaymentType = exports.VoucherPayer = exports.DiscountUsage = exports.PriceMeasurementType = void 0;
var PriceMeasurementType;
(function (PriceMeasurementType) {
    PriceMeasurementType["AMOUNT"] = "AMOUNT";
    PriceMeasurementType["PERCENTAGE"] = "PERCENTAGE";
})(PriceMeasurementType = exports.PriceMeasurementType || (exports.PriceMeasurementType = {}));
var DiscountUsage;
(function (DiscountUsage) {
    DiscountUsage["SINGLE_USE"] = "SINGLE_USE";
    DiscountUsage["MULTIPLE_USE"] = "MULTIPLE_USE";
    DiscountUsage["DOLLAR_ALLOTMENT"] = "DOLLAR_ALLOTMENT";
})(DiscountUsage = exports.DiscountUsage || (exports.DiscountUsage = {}));
var VoucherPayer;
(function (VoucherPayer) {
    VoucherPayer["BUTLER"] = "BUTLER";
    VoucherPayer["HOTEL"] = "HOTEL";
})(VoucherPayer = exports.VoucherPayer || (exports.VoucherPayer = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentType["CHARGE_TO_ROOM"] = "CHARGE_TO_ROOM";
})(PaymentType = exports.PaymentType || (exports.PaymentType = {}));
var VoucherType;
(function (VoucherType) {
    VoucherType["DISCOUNT"] = "DISCOUNT";
    VoucherType["PER_DIEM"] = "PER_DIEM";
    VoucherType["PRE_FIXE"] = "PRE_FIXE";
})(VoucherType = exports.VoucherType || (exports.VoucherType = {}));
var AmountType;
(function (AmountType) {
    AmountType["PERCENTAGE"] = "PERCENTAGE";
    AmountType["FIXED"] = "FIXED";
})(AmountType = exports.AmountType || (exports.AmountType = {}));


/***/ }),

/***/ "./libs/shared/constants.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.STAGE = exports.ENTITY = exports.SNS_TOPIC = void 0;
exports.SNS_TOPIC = {
    IAM: {
        USER: process.env.ServiceIamUserTopic || "ServiceIamUserTopic"
    },
    NETWORK: {
        HUB: process.env.ServiceNetworkHubTopic || "ServiceNetworkHubTopic",
        HOTEL: process.env.ServiceNetworkHotelTopic || "ServiceNetworkHotelTopic",
        CITY: process.env.ServiceNetworkCityTopic || "ServiceNetworkCityTopic"
    },
    MENU: {
        MODIFIER: process.env.ServiceMenuModifierTopic || "ServiceMenuModifierTopic",
        LABEL: process.env.ServiceMenuLabelTopic || "ServiceMenuLabelTopic",
        CATEGORY: process.env.ServiceMenuCategoryTopic || "ServiceMenuCategoryTopic",
        PRODUCT: process.env.ServiceMenuProductTopic || "ServiceMenuProductTopic",
        MENU: process.env.ServiceMenuMenuTopic || "ServiceMenuMenuTopic"
    },
    VOUCHER: {
        PROGRAM: process.env.ServiceVoucherProgramTopic || "ServiceVoucherProgramTopic"
    },
    ORDER: {
        ORDER: process.env.ServiceOrderOrderTopic || "ServiceOrderOrderTopic"
    }
};
exports.ENTITY = {
    IAM: {
        USER: "user"
    },
    NETWORK: {
        CITY: "city",
        HUB: "hub",
        HOTEL: "hotel"
    },
    MENU: {
        MODIFIER: "modifier",
        CATEGORY: "category",
        PRODUCT: "product",
        MENU: "menu",
        OUT_OF_STOCK: "out-of-stock",
        LABEL: "label"
    },
    VOUCHER: {
        PROGRAM: "program"
    },
    ORDER: {
        ORDER: "order"
    }
};
var STAGE;
(function (STAGE) {
    STAGE["test"] = "test";
    STAGE["dev"] = "dev";
    STAGE["local"] = "local";
    STAGE["prod"] = "prod";
    STAGE["qa"] = "qa";
})(STAGE = exports.STAGE || (exports.STAGE = {}));


/***/ }),

/***/ "./libs/shared/events.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.USER_EVENT = exports.PRODUCT_EVENT = exports.LABEL_EVENT = exports.CATEGORY_EVENT = exports.MODIFIER_EVENT = exports.MENU_EVENT = exports.CITY_EVENT = exports.HOTEL_EVENT = exports.HUB_EVENT = exports.CODE_EVENT = exports.PROGRAM_EVENT = exports.ORDER_EVENT = void 0;
var ORDER_EVENT;
(function (ORDER_EVENT) {
    ORDER_EVENT["CREATED"] = "ORDER_CREATED";
    ORDER_EVENT["UPDATED"] = "ORDER_UPDATED";
    ORDER_EVENT["DELETED"] = "ORDER_DELETED";
    ORDER_EVENT["CONFIRMED"] = "ORDER_CONFIRMED";
    ORDER_EVENT["DELIVERED"] = "ORDER_DELIVERED";
})(ORDER_EVENT = exports.ORDER_EVENT || (exports.ORDER_EVENT = {}));
var PROGRAM_EVENT;
(function (PROGRAM_EVENT) {
    PROGRAM_EVENT["CREATED"] = "PROGRAM_CREATED";
    PROGRAM_EVENT["UPDATED"] = "PROGRAM_UPDATED";
    PROGRAM_EVENT["DELETED"] = "PROGRAM_DELETED";
    PROGRAM_EVENT["STATUS_CHANGED"] = "HOTEL_STATUS_CHANGED";
})(PROGRAM_EVENT = exports.PROGRAM_EVENT || (exports.PROGRAM_EVENT = {}));
var CODE_EVENT;
(function (CODE_EVENT) {
    CODE_EVENT["CREATED"] = "CODE_CREATED";
    CODE_EVENT["DELETED"] = "CODE_DELETED";
    CODE_EVENT["BULK_CREATED"] = "CODE_BULK_CREATED";
    CODE_EVENT["BULK_DELETED"] = "CODE_BULK_DELETED";
})(CODE_EVENT = exports.CODE_EVENT || (exports.CODE_EVENT = {}));
var HUB_EVENT;
(function (HUB_EVENT) {
    HUB_EVENT["CREATED"] = "HUB_CREATED";
    HUB_EVENT["UPDATED"] = "HUB_UPDATED";
    HUB_EVENT["OMS_CREATED"] = "OMS_CREATED";
    HUB_EVENT["OMS_UPDATED"] = "OMS_UPDATED";
    HUB_EVENT["DELETED"] = "HUB_DELETED";
    HUB_EVENT["DEACTIVATED"] = "HUB_DEACTIVATED";
    HUB_EVENT["CREATED_ADAPTER"] = "HUB_CREATED_ADAPTER";
})(HUB_EVENT = exports.HUB_EVENT || (exports.HUB_EVENT = {}));
var HOTEL_EVENT;
(function (HOTEL_EVENT) {
    HOTEL_EVENT["CREATED"] = "HOTEL_CREATED";
    HOTEL_EVENT["UPDATED"] = "HOTEL_UPDATED";
    HOTEL_EVENT["OMS_CREATED"] = "OMS_HOTEL_CREATED";
    HOTEL_EVENT["OMS_UPDATED"] = "OMS_HOTEL_UPDATED";
    HOTEL_EVENT["DELETED"] = "HOTEL_DELETED";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_SHUTTLE_APP"] = "UPDATED_INTEGRATION_CONFIGS_SHUTTLE_APP";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_PMS"] = "UPDATED_INTEGRATION_CONFIGS_PMS";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_ACTIVITIES_APP"] = "UPDATED_INTEGRATION_CONFIGS_ACTIVITIES_APP";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_MENU_APP"] = "UPDATED_INTEGRATION_CONFIGS_MENU_APP";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_VOUCHERS_APP"] = "UPDATED_INTEGRATION_CONFIGS_VOUCHERS_APP";
    HOTEL_EVENT["UPDATED_PAYMENT_SETTINGS"] = "UPDATED_PAYMENT_SETTINGS";
    HOTEL_EVENT["STATUS_CHANGED"] = "HOTEL_STATUS_CHANGED";
    HOTEL_EVENT["MENU_ASSIGNED"] = "HOTEL_MENU_ASSIGNED";
    HOTEL_EVENT["CREATED_ADAPTER"] = "HOTEL_CREATED_ADAPTER";
})(HOTEL_EVENT = exports.HOTEL_EVENT || (exports.HOTEL_EVENT = {}));
var CITY_EVENT;
(function (CITY_EVENT) {
    CITY_EVENT["CREATED"] = "CITY_CREATED";
    CITY_EVENT["UPDATED"] = "CITY_UPDATED";
    CITY_EVENT["DELETED"] = "CITY_DELETED";
})(CITY_EVENT = exports.CITY_EVENT || (exports.CITY_EVENT = {}));
var MENU_EVENT;
(function (MENU_EVENT) {
    MENU_EVENT["CREATED"] = "MENU_CREATED";
    MENU_EVENT["UPDATED"] = "MENU_UPDATED";
    MENU_EVENT["DELETED"] = "MENU_DELETED";
    MENU_EVENT["HOTELS_ASSIGNED"] = "MENU_HOTELS_ASSIGNED";
})(MENU_EVENT = exports.MENU_EVENT || (exports.MENU_EVENT = {}));
var MODIFIER_EVENT;
(function (MODIFIER_EVENT) {
    MODIFIER_EVENT["CREATED"] = "MODIFIER_CREATED";
    MODIFIER_EVENT["UPDATED"] = "MODIFIER_UPDATED";
    MODIFIER_EVENT["DELETED"] = "MODIFIER_DELETED";
})(MODIFIER_EVENT = exports.MODIFIER_EVENT || (exports.MODIFIER_EVENT = {}));
var CATEGORY_EVENT;
(function (CATEGORY_EVENT) {
    CATEGORY_EVENT["CREATED"] = "CATEGORY_CREATED";
    CATEGORY_EVENT["UPDATED"] = "CATEGORY_UPDATED";
    CATEGORY_EVENT["DELETED"] = "CATEGORY_DELETED";
    CATEGORY_EVENT["CREATED_ADAPTER"] = "CATEGORY_CREATED_ADAPTER";
})(CATEGORY_EVENT = exports.CATEGORY_EVENT || (exports.CATEGORY_EVENT = {}));
var LABEL_EVENT;
(function (LABEL_EVENT) {
    LABEL_EVENT["CREATED"] = "LABEL_CREATED";
    LABEL_EVENT["UPDATED"] = "LABEL_UPDATED";
    LABEL_EVENT["DELETED"] = "LABEL_DELETED";
    LABEL_EVENT["CREATED_ADAPTER"] = "LABEL_CREATED_ADAPTER";
})(LABEL_EVENT = exports.LABEL_EVENT || (exports.LABEL_EVENT = {}));
var PRODUCT_EVENT;
(function (PRODUCT_EVENT) {
    PRODUCT_EVENT["CREATED"] = "PRODUCT_CREATED";
    PRODUCT_EVENT["UPDATED"] = "PRODUCT_UPDATED";
    PRODUCT_EVENT["DELETED"] = "PRODUCT_DELETED";
    PRODUCT_EVENT["MODIFIER_UPDATED"] = "PRODUCT_MODIFIER_UPDATED";
    PRODUCT_EVENT["OUT_OF_STOCK"] = "PRODUCT_OUT_OF_STOCK";
    PRODUCT_EVENT["BACK_IN_STOCK"] = "PRODUCT_BACK_IN_STOCK";
    PRODUCT_EVENT["STATUS_CHANGED"] = "PRODUCT_STATUS_CHANGED";
})(PRODUCT_EVENT = exports.PRODUCT_EVENT || (exports.PRODUCT_EVENT = {}));
var USER_EVENT;
(function (USER_EVENT) {
    USER_EVENT["CREATED"] = "USER_CREATED";
    USER_EVENT["UPDATED"] = "USER_UPDATED";
    USER_EVENT["DELETED"] = "USER_DELETED";
    USER_EVENT["CREATED_ADAPTER"] = "USER_CREATED_ADAPTER";
})(USER_EVENT = exports.USER_EVENT || (exports.USER_EVENT = {}));


/***/ }),

/***/ "./libs/shared/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/base.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/events.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/permissions.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/constants.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/protected.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/common.ts"), exports);


/***/ }),

/***/ "./libs/shared/permissions.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PERMISSION = void 0;
exports.PERMISSION = {
    IAM: {
        CAN_GET_SINGLE_ROLE: "CAN_GET_SINGLE_ROLE",
        CAN_LIST_ROLES: "CAN_LIST_ROLES",
        CAN_CREATE_ROLE: "CAN_CREATE_ROLE",
        CAN_UPDATE_ROLE: "CAN_UPDATE_ROLE",
        CAN_DELETE_ROLE: "CAN_DELETE_ROLE",
        CAN_GET_AUTHENTICATED_USER: "CAN_GET_AUTHENTICATED_USER",
        CAN_GET_SINGLE_USER: "CAN_GET_SINGLE_USER",
        CAN_LIST_USERS: "CAN_LIST_USERS",
        CAN_CREATE_USER: "CAN_CREATE_USER",
        CAN_CREATE_HOTEL_PARTNER: "CAN_CREATE_HOTEL_PARTNER",
        CAN_UPDATE_USER: "CAN_UPDATE_USER",
        CAN_DELETE_USER: "CAN_DELETE_USER",
        CAN_GET_APPS: "CAN_GET_APPS",
        CAN_GET_PERMISSIONS: "CAN_GET_PERMISSIONS",
        CAN_GET_SINGLE_PERMISSION_GROUP: "CAN_GET_SINGLE_PERMISSION_GROUP",
        CAN_LIST_PERMISSION_GROUPS: "CAN_LIST_PERMISSION_GROUPS",
        CAN_CREATE_PERMISSION_GROUP: "CAN_CREATE_PERMISSION_GROUP",
        CAN_UPDATE_PERMISSION_GROUP: "CAN_UPDATE_PERMISSION_GROUP",
        CAN_DELETE_PERMISSION_GROUP: "CAN_DELETE_PERMISSION_GROUP",
        CAN_LIST_APPS: "CAN_LIST_APPS",
        CAN_CREATE_USER_COGNITO: "CAN_CREATE_USER_COGNITO"
    },
    MENU: {
        CAN_GET_CATEGORIES: "CAN_GET_CATEGORIES",
        CAN_GET_CATEGORY_RELATIONS: "CAN_GET_CATEGORY_RELATIONS",
        CAN_GET_CATEGORY: "CAN_GET_CATEGORY",
        CAN_CREATE_CATEGORY: "CAN_CREATE_CATEGORY",
        CAN_UPDATE_CATEGORY: "CAN_UPDATE_CATEGORY",
        CAN_DELETE_CATEGORY: "CAN_DELETE_CATEGORY",
        CAN_GET_SUBCATEGORIES: "CAN_GET_SUBCATEGORIES",
        CAN_GET_SUBCATEGORY: "CAN_GET_SUBCATEGORY",
        CAN_GET_SUBCATEGORY_RELATIONS: "CAN_GET_SUBCATEGORY_RELATIONS",
        CAN_CREATE_SUBCCATEGORY: "CAN_CREATE_SUBCCATEGORY",
        CAN_UPDATE_SUBCATEGORY: "CAN_UPDATE_SUBCATEGORY",
        CAN_DELETE_SUBCATEGORY: "CAN_DELETE_SUBCATEGORY",
        CAN_BATCH_GET_SUBCATEGORIES: "CAN_BATCH_GET_SUBCATEGORIES",
        CAN_GET_MODIFIERS: "CAN_GET_MODIFIERS",
        CAN_GET_MODIFIER: "CAN_GET_MODIFIER",
        CAN_CREATE_MODIFIER: "CAN_CREATE_MODIFIER",
        CAN_UPDATE_MODIFIER: "CAN_UPDATE_MODIFIER",
        CAN_DELETE_MODIFIER: "CAN_DELETE_MODIFIER",
        CAN_GET_ITEMS_BY_MODIFIER: "CAN_GET_ITEMS_BY_MODIFIER",
        CAN_GET_PRESIGNED_URL: "CAN_GET_PRESIGNED_URL",
        CAN_GET_ITEM: "CAN_GET_ITEM",
        CAN_GET_ITEM_RELATIONS: "CAN_GET_ITEM_RELATIONS",
        CAN_GET_ITEMS_BY_SUBCATEGORY: "CAN_GET_ITEMS_BY_SUBCATEGORY",
        CAN_GET_ITEMS_BY_CATEGORY: "CAN_GET_ITEMS_BY_CATEGORY",
        CAN_CREATE_ITEM: "CAN_CREATE_ITEM",
        CAN_UPDATE_ITEM: "CAN_UPDATE_ITEM",
        CAN_GET_CATEGORIZED_ITEMS: "CAN_GET_CATEGORIZED_ITEMS",
        CAN_DELETE_ITEM: "CAN_DELETE_ITEM",
        CAN_GET_ITEMS: "CAN_GET_ITEMS",
        CAN_GET_MENUS: "CAN_GET_MENUS",
        CAN_GET_SINGLE_MENU: "CAN_GET_SINGLE_MENU",
        CAN_CREATE_MENU: "CAN_CREATE_MENU",
        CAN_UPDATE_MENU: "CAN_UPDATE_MENU",
        CAN_DUPLICATE_MENU: "CAN_DUPLICATE_MENU",
        CAN_DELETE_MENU: "CAN_DELETE_MENU",
        CAN_BATCH_EDIT_MENU: "CAN_BATCH_EDIT_MENU",
        CAN_GET_HOTELS: "CAN_GET_HOTELS",
        CAN_ASSIGN_MENU: "CAN_ASSIGN_MENU",
        CAN_PUSH_MENU_TO_PRODUCTION: "CAN_PUSH_MENU_TO_PRODUCTION",
        CAN_CHANGE_ITEM_STATUS: "CAN_CHANGE_ITEM_STATUS",
        CAN_GET_LABELS: "CAN_GET_LABELS",
        CAN_GET_LABEL: "CAN_GET_LABEL",
        CAN_CREATE_LABEL: "CAN_CREATE_LABEL",
        CAN_UPDATE_LABEL: "CAN_UPDATE_LABEL",
        CAN_DELETE_LABEL: "CAN_DELETE_LABEL",
        CAN_LIST_LABELS: "CAN_LIST_LABELS"
    },
    NETWORK: {
        CAN_GET_CITIES: "CAN_GET_CITIES",
        CAN_GET_CITY: "CAN_GET_CITY",
        CAN_CREATE_CITY: "CAN_CREATE_CITY",
        CAN_UPDATE_CITY: "CAN_UPDATE_CITY",
        CAN_DELETE_CITY: "CAN_DELETE_CITY",
        CAN_GET_HOTELS: "CAN_GET_HOTELS",
        CAN_GET_HOTEL: "CAN_GET_HOTEL",
        CAN_CREATE_HOTEL: "CAN_CREATE_HOTEL",
        CAN_CREATE_HOTEL_SF: "CAN_CREATE_HOTEL_SF",
        CAN_UPDATE_HOTEL: "CAN_UPDATE_HOTEL",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_CAR_SERVICE: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_CAR_SERVICE",
        CAN_UPDATE_HOTEL_PAYMENTS: "CAN_UPDATE_HOTEL_PAYMENTS",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_PMS: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_PMS",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_ACTIVITIES: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_ACTIVITIES",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_MENU_APP: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_MENU_APP",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_VOUCHERS: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_VOUCHERS",
        CAN_GET_HOTEL_MENU: "CAN_GET_HOTEL_MENU",
        CAN_UPDATE_HOTEL_MENU: "CAN_UPDATE_HOTEL_MENU",
        CAN_CHANGE_HOTEL_STATUS: "CAN_CHANGE_HOTEL_STATUS",
        CAN_DELETE_HOTEL: "CAN_DELETE_HOTEL",
        CAN_GET_HUBS: "CAN_GET_HUBS",
        CAN_GET_HUB: "CAN_GET_HUB",
        CAN_CREATE_HUB: "CAN_CREATE_HUB",
        CAN_UPDATE_HUB: "CAN_UPDATE_HUB",
        CAN_DEACTIVATE_HUB: "CAN_DEACTIVATE_HUB",
        CAN_DELETE_HUB: "CAN_DELETE_HUB",
        CAN_GET_NETWORK_USERS: "CAN_GET_NETWORK_USERS"
    },
    VOUCHER: {
        CAN_GET_SINGLE_VOUCHER_PROGRAM: "CAN_GET_SINGLE_VOUCHER_PROGRAM",
        CAN_CREATE_VOUCHER_PROGRAM: "CAN_CREATE_VOUCHER_PROGRAM",
        CAN_CHANGE_VOUCHER_PROGRAM_STATUS: "CAN_CHANGE_VOUCHER_PROGRAM_STATUS",
        CAN_UPDATE_VOUCHER_PROGRAM: "CAN_UPDATE_VOUCHER_PROGRAM",
        CAN_DELETE_VOUCHER_PROGRAM: "CAN_DELETE_VOUCHER_PROGRAM",
        CAN_LIST_VOUCHER_PROGRAMS_HOTELS: "CAN_LIST_VOUCHER_PROGRAMS_HOTELS",
        CAN_LIST_HOTEL_VOUCHER_PROGRAMS: "CAN_LIST_HOTEL_VOUCHER_PROGRAMS",
        CAN_GET_SINGLE_HOTEL: "CAN_GET_SINGLE_HOTEL",
        CAN_GET_VOUCHER_HOTELS: "CAN_GET_VOUCHER_HOTELS",
        CAN_GET_HOTEL_VOUCHER_CODES: "CAN_GET_HOTEL_VOUCHER_CODES",
        CAN_GET_VOUCHER_CATEGORIES: "CAN_GET_VOUCHER_CATEGORIES"
    }
};


/***/ }),

/***/ "./libs/shared/protected.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PROTECTED_ROLES = void 0;
exports.PROTECTED_ROLES = [
    "super_admin",
    "admin"
];


/***/ }),

/***/ "./libs/shared/utils/apps-definition-local.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appsDefinitionLocal = exports.AppEnum = void 0;
var AppEnum;
(function (AppEnum) {
    AppEnum["TENANT"] = "tenant";
    AppEnum["NETWORK"] = "network";
    AppEnum["MENU"] = "menu";
    AppEnum["VOUCHER"] = "voucher";
    AppEnum["DISCOUNT"] = "discount";
    AppEnum["IAM"] = "iam";
    AppEnum["ORDER"] = "order";
})(AppEnum = exports.AppEnum || (exports.AppEnum = {}));
exports.appsDefinitionLocal = {
    [AppEnum.TENANT]: {
        port: 3332,
        title: "TenantService",
        description: "Tenant Service"
    },
    [AppEnum.NETWORK]: {
        port: 3333,
        title: "Network Service",
        description: "Network Service"
    },
    [AppEnum.MENU]: {
        port: 3222,
        title: "Menu Service",
        description: "Menu Service"
    },
    [AppEnum.VOUCHER]: {
        port: 3335,
        title: "Voucher Service",
        description: "Voucher Service"
    },
    [AppEnum.DISCOUNT]: {
        port: 3336,
        title: "Discount Service",
        description: "Discount Service"
    },
    [AppEnum.IAM]: {
        port: 3337,
        title: "IAM Service",
        description: "Identity Access Management Service"
    },
    [AppEnum.ORDER]: {
        port: 3338,
        title: "Order Service",
        description: "Order Service"
    }
};


/***/ }),

/***/ "./libs/shared/utils/general-action-error.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ENTITY_NOT_FOUND_ERROR = exports.GENERAL_ACTION_ERROR = void 0;
const GENERAL_ACTION_ERROR = (action, entity) => {
    return {
        status: 400,
        message: `Cant ${action.toLowerCase()} ${entity}`
    };
};
exports.GENERAL_ACTION_ERROR = GENERAL_ACTION_ERROR;
const ENTITY_NOT_FOUND_ERROR = (entity, id) => {
    return {
        status: 404,
        message: `${entity} with ${id} not found`
    };
};
exports.ENTITY_NOT_FOUND_ERROR = ENTITY_NOT_FOUND_ERROR;


/***/ }),

/***/ "./libs/shared/utils/helper.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_EVENT_ERROR_MESSAGE = exports.onlyUnique = void 0;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
exports.onlyUnique = onlyUnique;
exports.DEFAULT_EVENT_ERROR_MESSAGE = "Bad event name provided";


/***/ }),

/***/ "./libs/shared/utils/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/general-action-error.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/apps-definition-local.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/step-function.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/sleep.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/helper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/uuid.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/operating-hours.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/lambda-warmup-wrapper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/test-mocks.ts"), exports);


/***/ }),

/***/ "./libs/shared/utils/lambda-warmup-wrapper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lambdaWarmupWrapper = exports.warmupkey = void 0;
const tslib_1 = __webpack_require__("tslib");
exports.warmupkey = "serverless-plugin-warmup";
const lambdaWarmupWrapper = (handler) => (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (event.source === exports.warmupkey) {
        return;
    }
    return handler(event);
});
exports.lambdaWarmupWrapper = lambdaWarmupWrapper;


/***/ }),

/***/ "./libs/shared/utils/operating-hours.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Day = exports.MealPeriod = void 0;
var MealPeriod;
(function (MealPeriod) {
    MealPeriod["Breakfast"] = "Breakfast";
    MealPeriod["Lunch_Dinner"] = "Lunch_Dinner";
    MealPeriod["Convenience"] = "Convenience";
})(MealPeriod = exports.MealPeriod || (exports.MealPeriod = {}));
var Day;
(function (Day) {
    Day["Monday"] = "Monday";
    Day["Tuesday"] = "Tuesday";
    Day["Wednesday"] = "Wednesday";
    Day["Thursday"] = "Thursday";
    Day["Friday"] = "Friday";
    Day["Saturday"] = "Saturday";
    Day["Sunday"] = "Sunday";
})(Day = exports.Day || (exports.Day = {}));


/***/ }),

/***/ "./libs/shared/utils/sleep.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = void 0;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;


/***/ }),

/***/ "./libs/shared/utils/step-function.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StepFunctionStatus = void 0;
var StepFunctionStatus;
(function (StepFunctionStatus) {
    StepFunctionStatus["SUCCESS"] = "SUCCEEDED";
    StepFunctionStatus["FAILURE"] = "FAILED";
})(StepFunctionStatus = exports.StepFunctionStatus || (exports.StepFunctionStatus = {}));


/***/ }),

/***/ "./libs/shared/utils/test-mocks.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mockedTenant = void 0;
exports.mockedTenant = {
    id: 1,
    cognito: {
        poolId: "us-east-1_Tq29inz5l",
        clientId: "7nn3c7l878r6t3vh4mh92ubpl2"
    },
    domain: "http://butler.butlerplatform.com",
    jwks: "",
    name: "Butler Tenant",
    awsDefaultRegion: "us-east-1"
};


/***/ }),

/***/ "./libs/shared/utils/uuid.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uuidv4 = void 0;
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.uuidv4 = uuidv4;


/***/ }),

/***/ "@aws-sdk/client-s3":
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

/***/ }),

/***/ "@aws-sdk/client-sns":
/***/ ((module) => {

module.exports = require("@aws-sdk/client-sns");

/***/ }),

/***/ "@aws-sdk/s3-request-presigner":
/***/ ((module) => {

module.exports = require("@aws-sdk/s3-request-presigner");

/***/ }),

/***/ "@mikro-orm/core":
/***/ ((module) => {

module.exports = require("@mikro-orm/core");

/***/ }),

/***/ "analytics-node":
/***/ ((module) => {

module.exports = require("analytics-node");

/***/ }),

/***/ "aws-sdk":
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "axios":
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "body-parser":
/***/ ((module) => {

module.exports = require("body-parser");

/***/ }),

/***/ "class-transformer":
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "cors":
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "express":
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "jsonwebtoken":
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "jwk-to-pem":
/***/ ((module) => {

module.exports = require("jwk-to-pem");

/***/ }),

/***/ "pg":
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "redis":
/***/ ((module) => {

module.exports = require("redis");

/***/ }),

/***/ "serverless-http":
/***/ ((module) => {

module.exports = require("serverless-http");

/***/ }),

/***/ "square":
/***/ ((module) => {

module.exports = require("square");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "twilio":
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./apps/service-network/src/main.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map