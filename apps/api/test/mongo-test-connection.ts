import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Test-only connection: never fall back to the application database.
export function testMongoUri(): string {
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const envPath = fileURLToPath(
      new URL('../../../infrastructure/.env', import.meta.url),
    );
    if (existsSync(envPath)) process.loadEnvFile(envPath);
    const user = process.env.MONGO_ROOT_USER;
    const password = process.env.MONGO_ROOT_PASSWORD;
    if (!user || !password)
      throw new Error(
        'Configura TEST_MONGO_URI para ritual_coffee_test o las credenciales Docker locales',
      );
    uri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@127.0.0.1:27017/ritual_coffee_test?authSource=admin`;
  }
  const parsed = new URL(uri);
  if (
    parsed.protocol !== 'mongodb:' ||
    !['localhost', '127.0.0.1'].includes(parsed.hostname) ||
    parsed.pathname !== '/ritual_coffee_test'
  ) {
    throw new Error(
      'Las pruebas e2e requieren MongoDB local y la base aislada ritual_coffee_test',
    );
  }
  return uri;
}
