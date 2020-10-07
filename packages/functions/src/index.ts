import { Express } from "express";
import { createApp } from "./app";

let appCache: Express;
export const getServer = async (): Promise<Express> => {
  if (appCache) {
    return appCache;
  }
  console.log("app creating...");
  const app = createApp();
  console.log("app created");
  appCache = app;
  return app;
};

const PORT = process.env.PORT || 9000;
getServer()
  .then((app) => app.listen(PORT))
  .then(() => {
    console.log(`Server listening on :${PORT}`);
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e.stack);
    process.exit(1);
  });
