import chai from 'chai';

export const { assert } = chai;
export { expect, test } from '@playwright/test';
export { Browser, BrowserContext, ElementHandle, Page } from 'playwright-core';
export { config, walletURL } from './config';
export { data } from './test-data';
export { helpers } from './tools/helpers';

export type Environment = 'devnet' | 'testnet' | 'prod' | 'local';
export type Network = 'devnet' | 'testnet' | 'mainnet';
