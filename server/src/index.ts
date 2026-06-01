import { buildApp } from './app.js';
import { config } from './config.js';

const app = buildApp();

async function main() {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info({ port: config.port }, 'api listening');
}

main().catch((err) => {
  app.log.error(err, 'failed to start');
  process.exit(1);
});
