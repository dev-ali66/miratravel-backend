import request from "supertest";
import app from "../app";
import { TEST_ACCOUNTS } from ".";

describe("Auth Flow Tests", () => {
  it("Login success", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: TEST_ACCOUNTS.admin1.email,
      password: TEST_ACCOUNTS.admin1.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("Wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_ACCOUNTS.admin1.email, password: "wrongpass" });

    expect(res.statusCode).toBe(401);
  });
  it("Invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "Test123!" });
    expect([400, 401]).toContain(res.status);
  });

  it("Refresh token", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: TEST_ACCOUNTS.admin1.email,
      password: TEST_ACCOUNTS.admin1.password,
    });

    const cookies = loginRes.headers["set-cookie"];

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh-token")
      .set("Cookie", cookies);

    expect(refreshRes.statusCode).toBe(200);
  });

  it("Logout", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: TEST_ACCOUNTS.admin1.email,
      password: TEST_ACCOUNTS.admin1.password,
    });

    const cookies = loginRes.headers["set-cookie"];

    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookies);

    expect(logoutRes.statusCode).toBe(200);
  });
});
