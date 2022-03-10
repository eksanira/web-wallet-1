import { data } from './test-data';

export type Environment = 'devnet' | 'testnet' | 'prod' | 'local';
export type Network = 'devnet' | 'testnet' | 'mainnet';
export const environment: Environment = process.env.ENVIRONMENT as Environment || 'local';
export const network: Network = process.env.NETWORK as Network || 'testnet';

export const config = {
  CI: !!process.env.CI,
  environment,
  logLevel: process.env.LOG_LEVEL || 'debug',
  network,
  headless: !!process.env.CI || !!process.env.HEADLESS || false,
};

export const walletURL = `${data.walletHosts[config.environment]}?network=${config.network}`;
