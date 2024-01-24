"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressLocal = void 0;
const shared_1 = require("@butlerhospitality/shared");
const logger_1 = require("../logger");
function expressLocal(app, name) {
    const { port } = shared_1.appsDefinitionLocal[name];
    const server = app.listen(port, () => {
        logger_1.logger.log(`Listening at http://localhost:${port}/api`);
        logger_1.logger.log(`Documentation at http://butler.localhost:${port}/api/${name}/docs`);
    });
    server.on("error", console.error);
}
exports.expressLocal = expressLocal;
//# sourceMappingURL=express-local.js.map