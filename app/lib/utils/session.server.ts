import { createCookie, createCookieSessionStorage } from "@remix-run/node";
import { hoursToSeconds } from "./time";

const sessionCookie = createCookie("session", {
  secrets: [process.env.SESSION_SECRET!],
  maxAge: hoursToSeconds(24 * 7),
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  httpOnly: true,
  path: "/",
});

export const storage = createCookieSessionStorage({
  cookie: sessionCookie,
});

export const createUserSession = async (idToken: string) => {
  const session = await storage.getSession();
  session.set("idToken", idToken);

  return session;
};
