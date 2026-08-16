import { loginAs, TEST_ACCOUNTS } from ".";
import request from "supertest";
import app from "../app";

let adminToken1;
let partnerToken1;
let partnerToken2;
let manuId;
let manucategoryId;

beforeAll(async () => {
  adminToken1 = await loginAs(
    TEST_ACCOUNTS.admin1.email,
    TEST_ACCOUNTS.admin1.password,
  );

  partnerToken1 = await loginAs(
    TEST_ACCOUNTS.partner1.email,
    TEST_ACCOUNTS.partner1.password,
  );

  partnerToken2 = await loginAs(
    TEST_ACCOUNTS.partner2.email,
    TEST_ACCOUNTS.partner2.password,
  );
});

describe("manucategory Flow Test", () => {
  it("Partner1 create manu", async () => {
    const res = await request(app)
      .post("/api/v1/oparetions/manage-manu")
      .set("Authorization", `Bearer ${partnerToken1}`)
      .send({
        name: "Partner1 manu",
      });
    expect(res.status).toBe(201);
    manuId = res.body.data.id;
  });
  it("Partner1 create manucategory", async () => {
    const res = await request(app)
      .post("/api/v1/oparetions/manage-manucategory")
      .set("Authorization", `Bearer ${partnerToken1}`)
      .send({
        manu: manuId,
        nameEnglish: "Partner1 manucategory",
        nameArabic: "غداء",
        preparetionTime: "10:00",
        scheduleStart: "10:00",
        scheduleEnd: "10:00",
      });
    expect(res.status).toBe(201);
    manucategoryId = res.body.data.id;
  });
  it("Partner1 edit own manucategory", async () => {
    const res = await request(app)
      .post("/api/v1/oparetions/manage-manucategory")
      .set("Authorization", `Bearer ${partnerToken1}`)
      .send({
        id: manucategoryId,
        nameEnglish: "Updated manucategory Name",
      });
    expect(res.status).toBe(200);
  });
  it("Partner2 try to edit Partner1 manucategory (should fail)", async () => {
    const res = await request(app)
      .post("/api/v1/oparetions/manage-manucategory")
      .set("Authorization", `Bearer ${partnerToken2}`)
      .send({
        id: manucategoryId,
        nameEnglish: "Hacked Name",
      });
    expect([403, 404]).toContain(res.status);
  });
  it("Partner1 try to delete manucategory (should fail)", async () => {
    const res = await request(app)
      .delete("/api/v1/oparetions/delete-manucategory")
      .set("Authorization", `Bearer ${partnerToken1}`)
      .send({
        id: manucategoryId,
      });
    expect([403]).toContain(res.status);
  });
  it("Admin delete manucategory (cleanup)", async () => {
    const res = await request(app)
      .delete("/api/v1/oparetions/delete-manucategory")
      .set("Authorization", `Bearer ${adminToken1}`)
      .send({
        id: manucategoryId,
      });
    expect([200, 404]).toContain(res.status);
  });
  it("Admin delete parent manu (cleanup)", async () => {
    const res = await request(app)
      .delete("/api/v1/oparetions/delete-manu")
      .set("Authorization", `Bearer ${adminToken1}`)
      .send({
        id: manuId,
      });
    expect([200, 404]).toContain(res.status);
  });
});
