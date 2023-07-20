import html from "@elysiajs/html";
import Elysia from "elysia";
import cookie from "@elysiajs/cookie";
import * as jose from "jose";

export const setup = (app: Elysia) =>
  app
    .use(html())
    .use(cookie())
    .derive(async (props) => {
      const session = props.cookie["__session"];

      if (!session) return {};

      let clerkId = "";
      try {
        const res = jose.decodeJwt(session);
        clerkId = res.sub ?? "";
      } catch (err) {
        console.log(err);
      }

      if (!clerkId) return { ...props, user: null };

      try {
        const user = (await (
          await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
            headers: {
              Authorization: "Bearer " + process.env.CLERK_SECRET_KEY,
            },
          })
        ).json()) as {
          primary_email_address_id: string;
          email_addresses: {
            id: string;
            email_address: string;
          }[];
        };

        let email =
          user.email_addresses.find(
            (e) => e.id === user.primary_email_address_id,
          )?.email_address ?? "";

        return {
          user: {
            email,
          },
        };
      } catch (err) {
        console.log(err);
        return {};
      }
    });
