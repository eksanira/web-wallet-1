import { data } from './test-data';
import { Environment } from './common-test-exports';

export const environment: Environment = 'local';

export const config = {
  CI: process.env.CI === 'true',
  environment: process.env.ENVIRONMENT as Environment || environment,
  logLevel: process.env.LOG_LEVEL || 'debug',
  network: process.env.NETWORK || 'testnet',
};

export const walletURL = `${data.walletHosts[config.environment]}?network=${config.network}`;
