import { test } from '@playwright/test';
import { setupPage } from '../../pw-helpers/setup-page';
import { Auth } from '../../screens/auth';
import { WalletsScreen } from '../../screens/wallets';
import { data } from '../../test-data';
import { log } from '../../tools/logger';
import { velasNative } from '@velas/velas-chain-test-wrapper';
import { walletURL } from '../../config';

let auth: Auth;
let walletsScreen: WalletsScreen;

test.describe('Swap: ', () => {
  test.beforeEach(async ({ page }) => {
    setupPage(page);
    walletsScreen = new WalletsScreen(page);
    auth = new Auth(page);
    await page.goto(walletURL);
    await auth.loginByRestoringSeed(data.wallets.swap.seed);
    await walletsScreen.waitForWalletsDataLoaded();
  });

  test('VLX Native > VLX Legacy', async ({ page }) => {
    await walletsScreen.swapTokens('token-vlx_native', 'token-vlx2', 0.0001);

    const txSignatureLink = await page.getAttribute('.sent .text a', 'href');
    if (!txSignatureLink) throw new Error('No txSignatureLink');
    const txSignature = txSignatureLink.replace('https://native.velas.com/tx/', '');
    log.debug(`txSignature: ${txSignature}`);
    await velasNative.waitForConfirmedTransaction(txSignature);
  });

  test('VLX Native > EVM', async ({ page }) => {
    await walletsScreen.swapTokens('token-vlx_native', 'token-vlx_evm', 0.0001);

    const txSignatureLink = await page.getAttribute('.sent .text a', 'href');
    if (!txSignatureLink) throw new Error('No txSignatureLink');
    const txSignature = txSignatureLink.replace('https://native.velas.com/tx/', '');
    log.debug(`txSignature: ${txSignature}`);

    await velasNative.waitForConfirmedTransaction(txSignature);
  });

  // TODO: unstable
  test.skip('VLX Legacy > VLX Native', async () => {
    await walletsScreen.swapTokens('token-vlx2', 'token-vlx_native', 0.0001);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  // TODO: unstable
  test.skip('VLX Legacy > EVM', async () => {
    await walletsScreen.swapTokens('token-vlx2', 'token-vlx_evm', 0.0001);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  // TODO: tx is found on explorer but test fails sometimes
  test.skip('EVM > VLX Legacy', async () => {
    await walletsScreen.swapTokens('token-vlx_evm', 'token-vlx2', 0.0001);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  // TODO: unstable
  test.skip('EVM > VLX Native', async () => {
    await walletsScreen.swapTokens('token-vlx_evm', 'token-vlx_native', 0.0001);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  // TODO: tx is found on explorer but test fails sometimes
  test.skip('EVM > VLX ERC-20', async () => {
    await walletsScreen.swapTokens('token-vlx_evm', 'token-vlx_erc20', 0.01);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  test.skip('EVM > BEP-20', async () => {
    await walletsScreen.swapTokens('token-vlx_evm', 'token-bsc_vlx', 1);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  test.skip('EVM > HRC-20', async () => {
    await walletsScreen.swapTokens('token-vlx_evm', 'token-vlx_huobi', 0.0001);
    await walletsScreen.confirmTxFromEvmExplorer();
  });

  test('HRC-20 > EVM', async () => {
    await walletsScreen.swapTokens('token-vlx_huobi', 'token-vlx_evm', 0.0001);
    await walletsScreen.confirmTxFromForeignExplorer();
  });

  test('ERC-20 > EVM', async () => {
    await walletsScreen.swapTokens('token-vlx_erc20', 'token-vlx_evm', 0.01);
    await walletsScreen.confirmTxFromForeignExplorer();
  });

  test('BEP-20 > EVM', async () => {
    await walletsScreen.swapTokens('token-bsc_vlx', 'token-vlx_evm', 1);
    await walletsScreen.confirmTxFromForeignExplorer();
  });
});
