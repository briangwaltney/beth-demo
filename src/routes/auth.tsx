import Elysia from "elysia";
import * as elements from "typed-html";
import { Login, Logout } from "../components/Login";
import { setup } from "./setup";

const auth = (app: Elysia) =>
  app
    .use(setup)
    .get("/clerk", () => Bun.file("./src/clerk.js"))
    .get("/auth", ({ user }) => {
      if (user) {
        return <Logout />;
      } else {
        return <Login />;
      }
    })
    .get("/log-out", () => {
      return <Login />;
    });

export default auth;
