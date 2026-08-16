import request from "supertest";
import app from "../app.js";

export async function loginAs(email, password) {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  return res.body.data?.accessToken || res.headers["set-cookie"]?.[0];
}

export const TEST_ACCOUNTS = {
  admin1: {
    email: "admin1@test.com",
    password: "Password@1234",
  },
  partner1: {
    email: "partner1@test.com",
    password: "Password@1234",
  },
  partner2: {
    email: "partner2@test.com",
    password: "Password@1234",
  },
};
