import { IResolvers } from "apollo-server-express";
import { app } from "../application-services/";

const Query: any = {
  app: () => app(),
};

const Mutation: any = {
  app: () => app(),
};

export const resolvers = {
  Query,
  Mutation,
} as IResolvers<any, any>;
