"use strict";

const db = require("../db");
const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  jobIds,
} = require("../tests/common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "Test Job",
        salary: 60000,
        equity: "0.1",
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Test Job",
        salary: 60000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  // Add more test cases for admin and non-admin users
});

describe("GET /jobs", function () {
  test("works", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Software Engineer",
          salary: 100000,
          equity: "0.05",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Product Manager",
          salary: 120000,
          equity: "0.02",
          companyHandle: "c2",
        },
        // Add more job data as needed
      ],
    });
  });

  // Add more test cases as needed
});

describe("GET /jobs/:id", function () {
  test("works", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "Software Engineer",
        salary: 100000,
        equity: "0.05",
        companyHandle: "c1",
      },
    });
  });

  // Add more test cases as needed
});
