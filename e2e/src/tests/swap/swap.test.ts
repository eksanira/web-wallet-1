import { velasNative } from '@velas/velas-chain-test-wrapper';
import {
  bscchain, evmchain, hecochain, ropsten,
} from '../../api/explorers-api';
import { data, test } from '../../common-test-exports';
import { log } from '../../tools/logger';

test.describe('Swap', () => {
  const transactionsInProgress: Promise<any>[] = [];

  test.beforeEach(async ({ auth, wallets }) => {
    await auth.goto();
    await auth.loginByRestoringSeed(data.wallets.swap.seed);
    await wallets.waitForWalletsDataLoaded();
  });

  test.afterAll(async () => {
    await Promise.all(transactionsInProgress);
  });

  test.describe('Inside Velas network: ', () => {
    test('VLX Native (Velas) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_native', 'token-vlx_evm', 0.0001);
      await wallets.txListAfterSendOrSwap.linkToTxExecuted.waitFor({ timeout: 30000 });
      const txSignature = await wallets.getTxHashFromTxlink();
      log.debug(`txSignature: ${txSignature}`);

      transactionsInProgress.push(velasNative.waitForConfirmedTransaction(txSignature));
    });

    // Legacy is irrelevant
    // TODO
    test.skip('VLX Native (Velas) > VLX Legacy (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_native', 'token-vlx2', 0.0001);
      await wallets.txListAfterSendOrSwap.linkToTxExecuted.waitFor({ timeout: 30000 });
      const txSignatureLink = await wallets.txListAfterSendOrSwap.linkToTxExecuted.getAttribute('href');
      if (!txSignatureLink) throw new Error('No txSignatureLink');
      const txSignature = txSignatureLink.replace('https://native.velas.com/tx/', '');
      log.debug(`txSignature: ${txSignature}`);
      await velasNative.waitForConfirmedTransaction(txSignature);
    });

    test('VLX EVM (Velas) > VLX Native (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_native', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // Legacy is irrelevant
    // TODO
    test.skip('VLX EVM (Velas) > VLX Legacy (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx2', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // Legacy is irrelevant
    // TODO
    test.skip('VLX Legacy (Velas) > VLX Native (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx2', 'token-vlx_native', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // Legacy is irrelevant
    // TODO
    test.skip('VLX Legacy (Velas) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx2', 'token-vlx_evm', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });
  });

  test.describe('From Velas network', async () => {
    test('VLX EVM (Velas) > VLX ERC-20 (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_erc20', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // TODO: bsc is down too often
    test('VLX EVM (Velas) > VLX BEP-20 (BSC)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-bsc_vlx', 1);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('VLX EVM (Velas) > VLX HRC-20 (Heco)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_huobi', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test.skip('USDC (Velas) > USDC (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_usdc', 'token-usdc', 0.001);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // TODO: fix ETH > ETH velas bridge
    test('ETH VRC-20 (Velas) > ETH (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_eth', 'token-eth', 0.1);
      const txHash = await wallets.getTxHashFromTxlink();
      await evmchain.waitForTx({ txHash, testName: test.info().title });
    });

    // not enough funds
    // TODO
    test.only('USDT (Velas) > USDT (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', 0.1);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // not enough funds
    // TODO
    test.skip('USDT (Velas) > USDT (Ethereum): min amount per tx error', async ({ page, wallets }) => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', 0.09, { confirm: false });
      await (page.locator('button :text("swap")')).click();
      await page.locator('" Min amount per transaction is 0.1 USDT"').waitFor();
    });

    test('BUSD (Velas) > BUSD (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_busd', 'token-busd', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });
  });

  test.describe('From Ethereum network', async () => {
    // TODO: fix ETH > ETH velas bridge
    test.skip('ETH (Ethereum) > ETH VRC-20 (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-eth', 'token-vlx_eth', 0.1);
      const txHash = await wallets.getTxHashFromTxlink();
      await ropsten.waitForTx({ txHash, testName: test.info().title });
    });

    test.skip('USDC (Ethereum) > USDC VRC-20 (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-usdc', 'token-vlx_usdc', 0.001);
      const txHash = await wallets.getTxHashFromTxlink();
      await ropsten.waitForTx({ txHash, testName: test.info().title });
    });

    test('VLX ERC-20 (Ethereum) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_erc20', 'token-vlx_evm', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title, waitForConfirmation: false }));
    });

    // not enough funds
    test.skip('USDT (Ethereum) > USDT VRC-20 (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-usdt_erc20', 'token-vlx_usdt', 0.012);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title }));
    });
  });

  test.describe('From BSC network', async () => {
    // TODO: fix VLWA-904 (bsc network issue)
    test.skip('VLX BEP-20 (BSC) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-bsc_vlx', 'token-vlx_evm', 1);
      const txHash = await wallets.getTxHashFromTxlink();
      await bscchain.waitForTx({ txHash, testName: test.info().title });
    });

    // TODO: fix VLWA-904 (bsc network issue)
    test.skip('BUSD (BSC) > BUSD VRC-20 (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-busd', 'token-vlx_busd', 0.01);
      const txHash = await wallets.getTxHashFromTxlink();
      await bscchain.waitForTx({ txHash, testName: test.info().title });
    });
  });

  test.describe('From HECO network', async () => {
    test('VLX HRC-20 (Heco) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_huobi', 'token-vlx_evm', 0.0001);
      const txHash = await wallets.getTxHashFromTxlink();
      transactionsInProgress.push(hecochain.waitForTx({ txHash, testName: test.info().title }));
    });
  });
});
