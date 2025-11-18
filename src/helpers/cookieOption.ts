import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: '.onrender.com',
  maxAge: 60 * 24 * 60 * 60 * 1000,
};
