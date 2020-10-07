import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server-express";
import { GraphQLError } from "graphql";

export const formatError = (err: GraphQLError) => {
  console.log("in formatError");
  console.log(err);
  // 恐らく現在のapollo-server-expressのバグで、下記で渡している
  // messageがレスポンスに反映されていない（codeのみがレスポンスに含まれる）。
  // アプリケーションの動作としては問題ないが、開発用にもう少しエラー情報がほしい
  const message = err.message;
  if (message.startsWith("UNAUTHENTICATED:")) {
    return new AuthenticationError(message);
  }
  if (message.startsWith("FORBIDDEN:")) {
    return new ForbiddenError(message);
  }
  if (message.startsWith("NOT_FOUND")) {
    return new ApolloError(message, "NOT_FOUND");
  }
  if (message.startsWith("PDT_ERROR")) {
    return new ApolloError(message, "PDT_ERROR");
  }
  if (message.startsWith("INVALID_ARGS")) {
    return new ApolloError(message, "INVALID_ARGS");
  }
  return err;
};
