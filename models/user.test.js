'use strict';

const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');
const db = require('../db.js');
const User = require('./user.js');
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe('authenticate', function () {
	test('works', async function () {
		const user = await User.authenticate('u1', 'password1');
		expect(user).toEqual({
			username  : 'u1',
			firstName : 'U1F',
			lastName  : 'U1L',
			email     : 'u1@email.com',
			isAdmin   : false
		});
	});

	test('unauth if no such user', async function () {
		try {
			await User.authenticate('nope', 'password');
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});

	test('unauth if wrong password', async function () {
		try {
			await User.authenticate('c1', 'wrong');
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

/************************************** register */

describe('register', function () {
	const newUser = {
		username  : 'new',
		firstName : 'Test',
		lastName  : 'Tester',
		email     : 'test@test.com',
		isAdmin   : false
	};

	test('works', async function () {
		let user = await User.register({
			...newUser,
			password : 'password'
		});
		expect(user).toEqual(newUser);
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(false);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('works: adds admin', async function () {
		let user = await User.register({
			...newUser,
			password : 'password',
			isAdmin  : true
		});
		expect(user).toEqual({ ...newUser, isAdmin: true });
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(true);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('bad request with dup data', async function () {
		try {
			await User.register({
				...newUser,
				password : 'password'
			});
			await User.register({
				...newUser,
				password : 'password'
			});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** findAll */

describe('findAll', function () {
	test('works', async function () {
		const users = await User.findAll();
		expect(users).toEqual([
			{
				username  : 'u1',
				firstName : 'U1F',
				lastName  : 'U1L',
				email     : 'u1@email.com',
				isAdmin   : false
			},
			{
				username  : 'u2',
				firstName : 'U2F',
				lastName  : 'U2L',
				email     : 'u2@email.com',
				isAdmin   : false
			}
		]);
	});
});

/************************************** get */

describe('get', function () {
	test('works', async function () {
		let user = await User.get('u1');
		expect(user).toEqual({
			username  : 'u1',
			firstName : 'U1F',
			lastName  : 'U1L',
			email     : 'u1@email.com',
			isAdmin   : false
		});
	});

	test('not found if no such user', async function () {
		try {
			await User.get('nope');
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function () {
	const updateData = {
		firstName : 'NewF',
		lastName  : 'NewF',
		email     : 'new@email.com',
		isAdmin   : true
	};

	test('works', async function () {
		let job = await User.update('u1', updateData);
		expect(job).toEqual({
			username : 'u1',
			...updateData
		});
	});

	test('works: set password', async function () {
		let job = await User.update('u1', {
			password : 'new'
		});
		expect(job).toEqual({
			username  : 'u1',
			firstName : 'U1F',
			lastName  : 'U1L',
			email     : 'u1@email.com',
			isAdmin   : false
		});
		const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('not found if no such user', async function () {
		try {
			await User.update('nope', {
				firstName : 'test'
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request if no data', async function () {
		expect.assertions(1);
		try {
			await User.update('c1', {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function () {
	test('works', async function () {
		await User.remove('u1');
		const res = await db.query("SELECT * FROM users WHERE username='u1'");
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such user', async function () {
		try {
			await User.remove('nope');
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	/************************************** applyForJob */

	describe('applyForJob', function () {
		test('works', async function () {
			const result = await User.applyForJob('u1', 1);
			expect(result).toEqual({ applied: 1 });
		});

		test('not found if no such user', async function () {
			try {
				await User.applyForJob('nope', 1);
				fail();
			} catch (e) {
				expect(e instanceof NotFoundError).toBeTruthy();
			}
		});

		test('not found if no such job', async function () {
			try {
				await User.applyForJob('u1', 999);
				fail();
			} catch (e) {
				expect(e instanceof NotFoundError).toBeTruthy();
			}
		});
	});

	/************************************** refreshAccessToken */

	describe('refreshAccessToken', () => {
		test('works for valid refresh token', async () => {
			// Create a user and generate access token and refresh token
			const user = {
				username  : 'testuser',
				firstName : 'Test',
				lastName  : 'User',
				email     : 'testuser@example.com',
				isAdmin   : false
			};
			const accessToken = createToken(user);
			const refreshToken = createRefreshToken(user);

			// Call the refreshAccessToken method
			const newAccessToken = await User.refreshAccessToken(user.username, refreshToken);

			// Verify the new access token
			const decoded = jwt.verify(newAccessToken, SECRET_KEY);
			expect(decoded.username).toEqual(user.username);
			expect(decoded.firstName).toEqual(user.firstName);
			expect(decoded.lastName).toEqual(user.lastName);
			expect(decoded.email).toEqual(user.email);
			expect(decoded.isAdmin).toEqual(user.isAdmin);
		});

		test('throws UnauthorizedError for invalid refresh token', async () => {
			try {
				// Call the refreshAccessToken method with an invalid refresh token
				await User.refreshAccessToken('testuser', 'invalid_refresh_token');
				fail('Expected UnauthorizedError');
			} catch (err) {
				expect(err instanceof UnauthorizedError).toBeTruthy();
				expect(err.message).toEqual('Invalid or expired refresh token');
			}
		});
	});
});
