import { appsDefinitionLocal, AppEnum } from "@butlerhospitality/shared";
import { logger } from "../logger";

export function expressLocal(app, name: AppEnum): void {
  const { port } = appsDefinitionLocal[name];
  const server = app.listen(port, () => {
    logger.log(`Listening at http://localhost:${port}/api`);
    logger.log(`Documentation at http://butler.localhost:${port}/api/${name}/docs`);
  });
  server.on("error", console.error);
}
