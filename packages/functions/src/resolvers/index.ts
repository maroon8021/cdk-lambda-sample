import { IResolvers } from "apollo-server-express";
import { app, exec } from "../application-services/";

const Query: any = {
  app: () => app(),
  exec: () => exec(),
};

const Mutation: any = {
  app: () => app(),
};

export const resolvers = {
  Query,
  Mutation,
} as IResolvers<any, any>;
