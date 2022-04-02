import { velasNative } from '@velas/velas-chain-test-wrapper';
import {
  bscchain, evmchain, hecochain, ropsten,
} from '../../api/explorers-api';
import { data, test, walletURL } from '../../common-test-exports';
import { AuthScreen, WalletsScreen } from '../../screens';
import { log } from '../../tools/logger';

let auth: AuthScreen;
let wallets: WalletsScreen;

test.describe('Swap', () => {
  const transactionsInProgress: Promise<any>[] = [];

  test.beforeEach(async ({ page }) => {
    wallets = new WalletsScreen(page);
    auth = new AuthScreen(page);
    await page.goto(walletURL);
    await auth.loginByRestoringSeed(data.wallets.swap.seed);
    await wallets.waitForWalletsDataLoaded();
  });

  test.afterAll(async () => {
    await Promise.all(transactionsInProgress);
  });

  test.describe('From Velas network: ', async () => {
    test('EVM > HRC-20', async () => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_huobi', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('EVM > VLX ERC-20', async () => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_erc20', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // TODO: bsc is down too often
    test.skip('EVM > BEP-20', async () => {
      await wallets.swapTokens('token-vlx_evm', 'token-bsc_vlx', 1);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // TODO: fix ETH > ETH velas bridge
    test.skip('ETH Velas > ETH', async () => {
      await wallets.swapTokens('token-vlx_eth', 'token-eth', 0.1);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // not enough funds
    test.skip('USDT Velas > USDT', async () => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', 0.1);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });
    
    // not enough funds
    test.skip('USDT Velas > USDT: min amount per tx error', async ({ page }) => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', 0.09, { confirm: false });
      await (page.locator('button :text("swap")')).click();
      await page.locator('" Min amount per transaction is 0.1 USDT"').waitFor();
    });

    test.skip('USDC Velas > USDC', async () => {
      await wallets.swapTokens('token-vlx_usdc', 'token-usdc', 0.001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // always fails with error
    // locator.click: Timeout 5000ms exceeded.
    // waiting for selector "#add-token-vlx_busd button"
    test('BUSD Velas > BUSD', async () => {
      await wallets.swapTokens('token-vlx_busd', 'token-busd', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });
  });

  test.describe('To Velas network', async () => {
    test('HRC-20 > EVM', async () => {
      await wallets.swapTokens('token-vlx_huobi', 'token-vlx_evm', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(hecochain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('ERC-20 > EVM', async () => {
      await wallets.swapTokens('token-vlx_erc20', 'token-vlx_evm', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title, waitForConfirmation: false }));
    });

    // TODO: fix VLWA-904 (bsc network issue)
    test.skip('BEP-20 > EVM', async () => {
      await wallets.swapTokens('token-bsc_vlx', 'token-vlx_evm', 1);
      const txHash = await wallets.getTxHashFromTxlink();
      await bscchain.waitForTx({ txHash, testName: test.info().title });
    });

    // TODO: fix ETH > ETH velas bridge
    test.skip('ETH > ETH Velas', async () => {
      await wallets.swapTokens('token-eth', 'token-vlx_eth', 0.1);
      const txHash = await wallets.getTxHashFromTxlink();
      await ropsten.waitForTx({ txHash, testName: test.info().title });
    });

    // not enough funds
    test.skip('USDT > USDT Velas', async () => {
      await wallets.swapTokens('token-usdt_erc20', 'token-vlx_usdt', 0.012);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title }));
    });

    test.skip('USDC > USDC Velas', async () => {
      await wallets.swapTokens('token-usdc', 'token-vlx_usdc', 0.001);
      const txHash = await wallets.getTxHashFromTxlink();
      await ropsten.waitForTx({ txHash, testName: test.info().title });
    });

    // TODO: fix VLWA-904 (bsc network issue)
    test.skip('BUSD > BUSD Velas', async () => {
      await wallets.swapTokens('token-busd', 'token-vlx_busd', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      await bscchain.waitForTx({ txHash, testName: test.info().title });
    });
  });

  test.describe('In Velas network: ', () => {
    test('VLX Native > EVM', async () => {
      await wallets.swapTokens('token-vlx_native', 'token-vlx_evm', 0.0001);
      await wallets.txListAfterSendOrSwap.linkToTxExecuted.waitFor({ timeout: 30000 });
      const txSignatureLink = await wallets.txListAfterSendOrSwap.linkToTxExecuted.getAttribute('href');
      if (!txSignatureLink) throw new Error('No txSignatureLink');
      const txSignature = txSignatureLink.replace('https://native.velas.com/tx/', '');
      log.debug(`txSignature: ${txSignature}`);

      transactionsInProgress.push(velasNative.waitForConfirmedTransaction(txSignature));
    });

    test('EVM > VLX Native', async () => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_native', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // Legacy is irrelevant
    test.skip('VLX Native > VLX Legacy', async () => {
      await wallets.swapTokens('token-vlx_native', 'token-vlx2', 0.0001);
      await wallets.txListAfterSendOrSwap.linkToTxExecuted.waitFor({ timeout: 30000 });
      const txSignatureLink = await wallets.txListAfterSendOrSwap.linkToTxExecuted.getAttribute('href');
      if (!txSignatureLink) throw new Error('No txSignatureLink');
      const txSignature = txSignatureLink.replace('https://native.velas.com/tx/', '');
      log.debug(`txSignature: ${txSignature}`);
      await velasNative.waitForConfirmedTransaction(txSignature);
    });

    // Legacy is irrelevant
    test.skip('VLX Legacy > VLX Native', async () => {
      await wallets.swapTokens('token-vlx2', 'token-vlx_native', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // Legacy is irrelevant
    test.skip('VLX Legacy > EVM', async () => {
      await wallets.swapTokens('token-vlx2', 'token-vlx_evm', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // Legacy is irrelevant
    test.skip('EVM > VLX Legacy', async () => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx2', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });
  });
});
