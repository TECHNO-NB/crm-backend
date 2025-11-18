import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  domain: "whv-crm.vercel.app",
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "none"
};
