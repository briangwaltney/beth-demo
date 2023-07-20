import Elysia from "elysia";
import * as elements from "typed-html";
import { Login, Logout } from "../components/Login";

const auth = (app: Elysia) =>
  app
    .get("/clerk", () => Bun.file("./src/clerk.js"))
    .get("/log-out", async () => <Login />)
    .get("/log-in", async () => <Logout />);

export default auth;
