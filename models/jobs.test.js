"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../tests/common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  test("works", async function () {
    const job = await Job.create({
      title: "Test Job",
      salary: 50000,
      equity: "0.1",
      companyHandle: "c1",
    });
    expect(job).toEqual({
      id: expect.any(Number),
      title: "Test Job",
      salary: 50000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  // Add more test cases as needed
});

describe("findAll", function () {
  test("works", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ]);
  });

  // Add more test cases as needed
});

describe("get", function () {
  test("works", async function () {
    const job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "Software Engineer",
      salary: 100000,
      equity: "0.05",
      companyHandle: "c1",
    });
  });

  // Add more test cases as needed
});

