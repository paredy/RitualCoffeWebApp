import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createConnection, Types, type Connection, type Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { configureHttpApp } from '../src/common/configure-http-app.js';
import { AuthSettings } from '../src/auth/auth-settings.service.js';
import { PasswordService } from '../src/auth/password.service.js';
import {
  AuthService,
  csrfForSession,
  hashSessionToken,
} from '../src/auth/auth.service.js';
import { LoginRateLimiter } from '../src/auth/login-rate-limiter.service.js';
import type { AuthResponseDto } from '../src/auth/dto/auth-user-response.dto.js';
import { Session } from '../src/auth/schemas/session.schema.js';
import { User } from '../src/users/schemas/user.schema.js';
import { createInitialAdmin } from '../src/users/create-initial-admin.js';
import { testMongoUri } from './mongo-test-connection.js';

describe('Autenticación por username (Fastify + MongoDB aislado)', () => {
  let app: NestFastifyApplication | undefined;
  let connection: Connection | undefined;
  let users: Model<User>;
  let sessions: Model<Session>;
  let staffId: Types.ObjectId;
  const ownedUsers: Types.ObjectId[] = [];
  const origin = 'http://localhost:5173';
  const testConfigValues: Record<string, string> = {
    NODE_ENV: 'test',
    AUTH_ALLOWED_ORIGINS: origin,
  };
  const testConfig = {
    get: (key: string) => testConfigValues[key],
  } as unknown as ConfigService;
  const settings = new AuthSettings(testConfig);
  const run = randomUUID().replaceAll('-', '').slice(0, 12);
  const username = `staff_${run}`;
  const inactiveUsername = `off_${run}`;
  const password = 'Test-only contraseña 12345';
  let nextIp = 1;

  async function insertUser(values: Record<string, unknown>) {
    const id = new Types.ObjectId();
    ownedUsers.push(id);
    return users.create({
      name: 'Prueba aislada',
      username: `user_${id.toHexString().slice(0, 20)}`,
      email: `${id.toHexString()}@example.test`,
      role: 'barista',
      ...values,
      _id: id,
    });
  }
  function login(values: Record<string, unknown> = {}, cookie?: string) {
    return app!.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: `192.0.2.${nextIp++}`,
      headers: {
        origin,
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      payload: { username, password, ...values },
    });
  }
  function readSession(response: {
    cookies: Array<{ name: string; value: string }>;
  }) {
    const token = response.cookies.find(
      (cookie) => cookie.name === settings.cookieName,
    )!.value;
    return { token, cookie: `${settings.cookieName}=${token}` };
  }
  function me(cookie?: string) {
    return app!.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: cookie ? { cookie } : {},
    });
  }

  beforeAll(async () => {
    connection = createConnection(testMongoUri(), {
      autoIndex: false,
      autoCreate: false,
      serverSelectionTimeoutMS: 5000,
    });
    await connection.asPromise();
    const fixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getConnectionToken())
      .useValue(connection)
      .overrideProvider(AuthSettings)
      .useValue(settings)
      .compile();
    app = fixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureHttpApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    users = app.get<Model<User>>(getModelToken(User.name));
    sessions = app.get<Model<Session>>(getModelToken(Session.name));
    await users.createCollection();
    await users.createIndexes();
    await sessions.createCollection();
    await sessions.createIndexes();
    const hash = await new PasswordService().hash(password);
    staffId = (await insertUser({ username, passwordHash: hash }))._id;
    await insertUser({
      username: inactiveUsername,
      passwordHash: hash,
      isActive: false,
    });
  }, 30000);

  afterAll(async () => {
    try {
      if (sessions) await sessions.deleteMany({ userId: { $in: ownedUsers } });
      if (users) await users.deleteMany({ _id: { $in: ownedUsers } });
    } finally {
      if (app) await app.close();
      if (connection) await connection.close();
    }
  });

  it('inicia sesión con cookie HttpOnly, respuesta segura, CSRF y actualización de lastLoginAt', async () => {
    const response = await login();
    expect(response.statusCode).toBe(200);
    const { cookie, token } = readSession(response);
    const body = response.json<AuthResponseDto>();
    expect(body.data).toEqual({
      id: staffId.toHexString(),
      name: 'Prueba aislada',
      username,
      role: 'barista',
    });
    expect(body.csrfToken).toBe(csrfForSession(token));
    expect(response.body).not.toContain(token);
    expect(response.body).not.toContain('passwordHash');
    expect(response.body).not.toContain(password);
    expect(response.headers['cache-control']).toBe('no-store');
    const header = String(response.headers['set-cookie']);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain('Path=/');
    expect(header).toContain('Max-Age=28800');
    const stored = await sessions.collection.findOne({
      tokenHash: hashSessionToken(token),
    });
    expect(stored?.userId.toHexString()).toBe(staffId.toHexString());
    expect(stored?.expiresAt).toBeInstanceOf(Date);
    expect(JSON.stringify(stored)).not.toContain(token);
    expect(
      (await sessions.collection.indexes()).some(
        (index) => index.expireAfterSeconds === 0 && index.key.expiresAt === 1,
      ),
    ).toBe(true);
    expect((await users.findById(staffId))?.lastLoginAt).toBeInstanceOf(Date);
    expect((await me(cookie)).statusCode).toBe(200);
  });

  it('normaliza mayúsculas y espacios del username', async () => {
    expect(
      (await login({ username: ` ${username.toUpperCase()} ` })).statusCode,
    ).toBe(200);
  });

  it.each([
    { password: 'incorrecta' },
    { username: `missing_${run}` },
    { username: inactiveUsername },
  ])(
    'devuelve el mismo 401 para credenciales inválidas y cuenta inactiva: %j',
    async (values) => {
      const response = await login(values);
      expect(response.statusCode).toBe(401);
      expect(response.json().message).toBe('Credenciales inválidas');
      expect(response.headers['set-cookie']).toBeUndefined();
    },
  );

  it('consulta la sesión tras recargar, sin contraseña, y recupera el token CSRF', async () => {
    const logged = await login();
    const response = await me(readSession(logged).cookie);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(logged.json());
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('un intento fallido no crea sesión ni cierra una sesión existente', async () => {
    const { cookie } = readSession(await login());
    const before = await sessions.countDocuments({ userId: staffId });
    const failed = await login({ password: 'incorrecta' }, cookie);
    expect(failed.statusCode).toBe(401);
    expect(await sessions.countDocuments({ userId: staffId })).toBe(before);
    expect((await me(cookie)).statusCode).toBe(200);
  });

  it('persiste la sesión en MongoDB y otra instancia del servicio puede validarla', async () => {
    const { token } = readSession(await login());
    const independent = new AuthService(
      users,
      sessions,
      new PasswordService(),
      settings,
      new LoginRateLimiter(),
    );
    expect((await independent.authenticate(token)).data.username).toBe(
      username,
    );
  });

  it('logout revoca la sesión en el servidor y borra la cookie', async () => {
    const logged = await login();
    const { cookie, token } = readSession(logged);
    const response = await app!.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        origin,
        cookie,
        'x-csrf-token': logged.json<AuthResponseDto>().csrfToken,
      },
    });
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
    expect(String(response.headers['set-cookie'])).toContain(
      `${settings.cookieName}=`,
    );
    expect(
      await sessions.countDocuments({ tokenHash: hashSessionToken(token) }),
    ).toBe(0);
    expect((await me(cookie)).statusCode).toBe(401);
  });

  it.each([undefined, 'wrong', 'a'.repeat(43)])(
    'rechaza logout sin CSRF válido: %s',
    async (csrf) => {
      const logged = await login();
      const { cookie } = readSession(logged);
      const response = await app!.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: { origin, cookie, ...(csrf ? { 'x-csrf-token': csrf } : {}) },
      });
      expect(response.statusCode).toBe(403);
      expect((await me(cookie)).statusCode).toBe(200);
    },
  );

  it.each([undefined, 'null', 'https://evil.example'])(
    'rechaza login sin un Origin autorizado: %s',
    async (requestOrigin) => {
      const response = await app!.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'content-type': 'application/json',
          ...(requestOrigin ? { origin: requestOrigin } : {}),
        },
        payload: { username, password },
      });
      expect(response.statusCode).toBe(403);
      expect(response.headers['set-cookie']).toBeUndefined();
    },
  );

  it('rechaza logout desde otro origen aun con cookie y token CSRF válidos', async () => {
    const logged = await login();
    const { cookie } = readSession(logged);
    const response = await app!.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        origin: 'https://evil.example',
        cookie,
        'x-csrf-token': logged.json<AuthResponseDto>().csrfToken,
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('rechaza sesiones vencidas sin depender de que el índice TTL las haya eliminado', async () => {
    const { cookie, token } = readSession(await login());
    await sessions.updateOne(
      { tokenHash: hashSessionToken(token) },
      { $set: { expiresAt: new Date(0) } },
    );
    expect((await me(cookie)).statusCode).toBe(401);
  });

  it('desactivar la cuenta invalida sus sesiones y reactivarla no restaura la sesión revocada', async () => {
    const { cookie } = readSession(await login());
    await users.updateOne({ _id: staffId }, { $set: { isActive: false } });
    try {
      expect((await me(cookie)).statusCode).toBe(401);
    } finally {
      await users.updateOne({ _id: staffId }, { $set: { isActive: true } });
    }
    expect((await me(cookie)).statusCode).toBe(401);
  });

  it('consulta el rol actual en lugar de confiar en un rol antiguo de la cookie', async () => {
    const { cookie } = readSession(await login());
    await users.updateOne({ _id: staffId }, { $set: { role: 'admin' } });
    try {
      expect((await me(cookie)).json<AuthResponseDto>().data.role).toBe(
        'admin',
      );
    } finally {
      await users.updateOne({ _id: staffId }, { $set: { role: 'barista' } });
    }
  });

  it('rechaza una sesión cuyo usuario fue eliminado', async () => {
    const temporaryUsername = `deleted_${run}`;
    const user = await insertUser({
      username: temporaryUsername,
      passwordHash: await new PasswordService().hash(password),
    });
    const { cookie } = readSession(
      await login({ username: temporaryUsername }),
    );
    await users.deleteOne({ _id: user._id });
    expect((await me(cookie)).statusCode).toBe(401);
  });

  it('un nuevo login rota la sesión del navegador y revoca la anterior', async () => {
    const previous = readSession(await login());
    const next = readSession(await login({}, previous.cookie));
    expect(next.token).not.toBe(previous.token);
    expect((await me(previous.cookie)).statusCode).toBe(401);
    expect((await me(next.cookie)).statusCode).toBe(200);
  });

  it.each([undefined, 'fake', 'a'.repeat(43)])(
    'me rechaza cookies ausentes, alteradas o inventadas: %s',
    async (value) => {
      const response = await me(
        value ? `${settings.cookieName}=${value}` : undefined,
      );
      expect(response.statusCode).toBe(401);
      expect(response.headers['cache-control']).toBe('no-store');
    },
  );

  it('no acepta el hash almacenado, Authorization ni parámetros URL como sesión', async () => {
    const { token } = readSession(await login());
    expect(
      (await me(`${settings.cookieName}=${hashSessionToken(token)}`))
        .statusCode,
    ).toBe(401);
    const bearer = await app!.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(bearer.statusCode).toBe(401);
    const query = await app!.inject({
      method: 'GET',
      url: `/api/v1/auth/me?token=${token}`,
    });
    expect(query.statusCode).toBe(401);
  });

  it('permite CORS con credenciales solo para el origen configurado', async () => {
    const response = await app!.inject({
      method: 'OPTIONS',
      url: '/api/v1/auth/login',
      headers: {
        origin,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type,x-csrf-token',
      },
    });
    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    const denied = await app!.inject({
      method: 'OPTIONS',
      url: '/api/v1/auth/login',
      headers: {
        origin: 'https://evil.example',
        'access-control-request-method': 'POST',
      },
    });
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it.each([
    {},
    { username },
    { username: { $ne: null }, password },
    { username, password, role: 'admin' },
    { username, password: '' },
    { username, password: 'a'.repeat(129) },
  ])('valida la entrada de login: %j', async (payload) => {
    const response = await app!.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { origin },
      payload,
    });
    expect(response.statusCode).toBe(400);
  });

  it('rechaza formularios en login', async () => {
    const response = await app!.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { origin, 'content-type': 'text/plain' },
      payload: 'username=test&password=test',
    });
    expect(response.statusCode).toBe(415);
  });

  it('limita intentos por IP aunque se cambie el username o X-Forwarded-For', async () => {
    for (let i = 0; i < 10; i++) {
      const response = await app!.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        remoteAddress: '198.51.100.200',
        headers: { origin, 'x-forwarded-for': `203.0.113.${i}` },
        payload: { username: `missing_${run}_${i}`, password: 'incorrecta' },
      });
      expect(response.statusCode).toBe(401);
    }
    const response = await app!.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: '198.51.100.200',
      headers: { origin },
      payload: { username: `missing_${run}`, password: 'incorrecta' },
    });
    expect(response.statusCode).toBe(429);
  });

  it('mantiene el menú público accesible sin cookies', async () => {
    for (const path of ['/api/v1/menu/categories', '/api/v1/menu/products']) {
      expect((await app!.inject({ method: 'GET', url: path })).statusCode).toBe(
        200,
      );
    }
    expect(
      (
        await app!.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {},
        })
      ).statusCode,
    ).toBe(404);
  });

  it('limita el mismo username desde varias IP y tras normalizar mayúsculas', async () => {
    const target = `target_${run}`;
    for (let i = 0; i < 20; i++) {
      const response = await app!.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        remoteAddress: `203.0.113.${i + 1}`,
        headers: { origin },
        payload: {
          username: i % 2 ? target.toUpperCase() : target,
          password: 'incorrecta',
        },
      });
      expect(response.statusCode).toBe(401);
    }
    const response = await app!.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: '203.0.113.100',
      headers: { origin },
      payload: { username: target, password: 'incorrecta' },
    });
    expect(response.statusCode).toBe(429);
  });

  it('crea el primer administrador mediante la función de CLI sin credenciales predeterminadas y rechaza sobrescribirlo', async () => {
    const input = {
      name: 'Admin aislado',
      username: `admin_${run}`,
      email: `admin-${run}@example.test`,
      password,
    };
    const admin = await createInitialAdmin(users, input);
    ownedUsers.push(new Types.ObjectId(admin.id));
    expect(admin.role).toBe('admin');
    const stored = await users.findById(admin.id).select('+passwordHash');
    expect(stored!.passwordHash).toMatch(/^\$argon2id\$/);
    expect(stored!.passwordHash).not.toBe(password);
    await expect(
      createInitialAdmin(users, { ...input, username: `other_${run}` }),
    ).rejects.toThrow('Ya existe un administrador');
    expect((await login({ username: input.username })).statusCode).toBe(200);
  });

  it('completa login, consulta y logout por HTTP real para un cliente externo al servidor', async () => {
    await app!.listen(0, '127.0.0.1');
    const base = await app!.getUrl();
    const logged = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    expect(logged.status).toBe(200);
    expect(logged.headers.get('access-control-allow-origin')).toBe(origin);
    expect(logged.headers.get('access-control-allow-credentials')).toBe('true');
    const body = (await logged.json()) as AuthResponseDto;
    const cookie = logged.headers.get('set-cookie')!.split(';')[0];
    const current = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Cookie: cookie, Origin: origin },
    });
    expect(current.status).toBe(200);
    expect(await current.json()).toEqual(body);
    const logout = await fetch(`${base}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        Origin: origin,
        'X-CSRF-Token': body.csrfToken,
      },
    });
    expect(logout.status).toBe(204);
    const revoked = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Cookie: cookie },
    });
    expect(revoked.status).toBe(401);
  });
});
