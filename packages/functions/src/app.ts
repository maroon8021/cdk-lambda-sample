import { readFileSync, readdir, statSync } from "fs";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { formatError } from "./util";
//import compression from "compression";

function getTypeDefs() {
  const schemaPath = "src/schema/schema.gql";
  const schemaStr = readFileSync(schemaPath, "utf8");
  return gql`
    ${schemaStr}
  `;
}

export function createApp() {
  const typeDefs = getTypeDefs();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    debug: true, //process.env.NODE_ENV === "development"
  });

  //@ts-ignore
  const app = express();
  //app.use(compression());
  server.applyMiddleware({
    app,
  });

  //@ts-ignore
  app.get("/", (req, res) => {
    console.log("in /");
    console.log(req);
    res.send("OK");
  });

  //@ts-ignore
  app.get("/health", (_req, res) => {
    console.log("in /health");
    res.send("OK");
  });

  return app;
}
