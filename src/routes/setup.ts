import html from "@elysiajs/html";
import Elysia from "elysia";
import cookie from "@elysiajs/cookie";
import * as jose from "jose";

type ValidSession = {
  object: "session";
  id: string;
  user_id: string;
  client_id: string;
  status: string;
  last_active_organization_id: string;
  last_active_at: number;
  expire_at: number;
  abandon_at: number;
  updated_at: number;
  created_at: number;
};

const opts = {
  headers: {
    Authorization: "Bearer " + process.env.CLERK_SECRET_KEY,
    "Content-Type": "application/json",
  },
};

const baseUrl = "https://api.clerk.com/v1";

export const useAuth = (app: Elysia) =>
  app.use(setup).derive(async (props) => {
    const session = props.cookie["__session"];

    if (!session) return {};

    let sessionId = "";
    try {
      const res = jose.decodeJwt(session);
      sessionId = (res.sid as string) ?? "";
    } catch (err) {
      console.log(err);
    }

    if (!sessionId) return { ...props, user: null };

    try {
      const valid = (await (
        await fetch(`${baseUrl}/sessions/${sessionId}/verify`, {
          ...opts,
          method: "POST",
          body: JSON.stringify({
            token: session,
          }),
        })
      ).json()) as ValidSession;

      if (valid.status !== "active") return { ...props, user: null };

      return {
        user: {
          clerkId: valid.user_id,
        },
      };
    } catch (err) {
      console.log(err);
      return {};
    }
  });

export const setup = (app: Elysia) => app.use(html()).use(cookie());
