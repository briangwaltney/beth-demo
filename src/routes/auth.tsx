import Elysia from "elysia";
import * as elements from "typed-html";
import { Login, Logout } from "../components/Login";
import { useAuth } from "./setup";

const auth = (app: Elysia) =>
  app
    .use(useAuth)
    .get("/clerk", () => Bun.file("./src/clerk.js"))
    .get("/auth", ({ user }) => {
      console.log(user);
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
