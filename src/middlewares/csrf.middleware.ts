import csurf from "csurf";
import config from "../config/index.js";

export const csrfProtection = csurf({
  cookie: {
    httpOnly: false, // frontend JS can read
    sameSite: "strict",
    secure: config.IS_PRODUCTION,
  },
});
