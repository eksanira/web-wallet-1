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
    test('VLX Native (Velas) > VLX EVM (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_native', 'token-vlx_evm', '0.0001');
      await wallets.txListAfterSendOrSwap.linkToTxExecuted.waitFor({ timeout: 30000 });
      const txSignature = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txSignature: ${txSignature}`);
      transactionsInProgress.push(velasNative.waitForConfirmedTransaction(txSignature));
    });

    test('VLX Native (Velas) > VLX Legacy (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_native', 'token-vlx2', '0.0001');
      await wallets.txListAfterSendOrSwap.linkToTxExecuted.waitFor({ timeout: 30000 });
      const txSignatureLink = await wallets.txListAfterSendOrSwap.linkToTxExecuted.getAttribute('href');
      if (!txSignatureLink) throw new Error('No txSignatureLink');
      const txSignature = txSignatureLink.replace('https://native.velas.com/tx/', '');
      log.debug(`${test.name} txSignature: ${txSignature}`);
      transactionsInProgress.push(velasNative.waitForConfirmedTransaction(txSignature));
    });

    test('VLX EVM (Velas) > VLX Native (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_native', '0.0001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('VLX EVM (Velas) > VLX Legacy (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx2', '0.0001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('VLX Legacy (Velas) > VLX Native (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx2', 'token-vlx_native', '0.0001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('VLX Legacy (Velas) > VLX EVM (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx2', 'token-vlx_evm', '0.0001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });
  });

  test.describe('From Velas network @smoke', async () => {
    test('VLX EVM (Velas) > VLX ERC-20 (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_erc20', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // bsc is down too often
    test('VLX EVM (Velas) > VLX BEP-20 (BSC) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-bsc_vlx', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('VLX EVM (Velas) > VLX HRC-20 (Heco) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_evm', 'token-vlx_huobi', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('USDC (Velas) > USDC (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_usdc', 'token-usdc', '0.001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('ETH VRC-20 (Velas) > ETH (Ethereum) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_eth', 'token-eth', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    test('USDT (Velas) > USDT (Ethereum)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', '0.001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });

    // to run this test, min amount per tx should be larger that bridge fee, but now its smaller
    test.skip('USDT (Velas) > USDT (Ethereum): min amount per tx error', async ({ page, wallets }) => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', '0.00000001', { confirm: false });
      await (page.locator('button :text("swap")')).click();
      await page.locator('" Min amount per transaction is 0.1 USDT"').waitFor();
    });

    test('USDT (Velas) > USDT (Ethereum): amount is less than bridge fee @smoke', async ({ page, wallets }) => {
      await wallets.swapTokens('token-vlx_usdt', 'token-usdt_erc20', '0.000001', { confirm: false });
      await page.locator('" Amount 0.000001 is less than bridge fee (0.001)"').waitFor();
    });

    test('BUSD (Velas) > BUSD (Ethereum) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_busd', 'token-busd', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(evmchain.waitForTx({ txHash, testName: test.info().title }));
    });
  });

  test.describe('From Ethereum network', async () => {
    test('ETH (Ethereum) > ETH VRC-20 (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-eth', 'token-vlx_eth', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title }));
    });

    test('USDC (Ethereum) > USDC VRC-20 (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-usdc', 'token-vlx_usdc', '0.001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title }));
    });

    // BUG: 0 fee error
    test.skip('VLX ERC-20 (Ethereum) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_erc20', 'token-vlx_evm', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title, waitForConfirmation: false }));
    });

    // not enough funds
    test('USDT (Ethereum) > USDT VRC-20 (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-usdt_erc20', 'token-vlx_usdt', '0.001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(ropsten.waitForTx({ txHash, testName: test.info().title }));
    });
  });

  test.describe('From BSC network', async () => {
    test('VLX BEP-20 (BSC) > VLX EVM (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-bsc_vlx', 'token-vlx_evm', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      await bscchain.waitForTx({ txHash, testName: test.info().title });
    });

    test('BUSD (BSC) > BUSD VRC-20 (Velas) @smoke', async ({ wallets }) => {
      await wallets.swapTokens('token-busd', 'token-vlx_busd', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      await bscchain.waitForTx({ txHash, testName: test.info().title });
    });
  });

  test.describe('From HECO network @smoke', async () => {
    test('VLX HRC-20 (Heco) > VLX EVM (Velas)', async ({ wallets }) => {
      await wallets.swapTokens('token-vlx_huobi', 'token-vlx_evm', '0.00000001');
      const txHash = await wallets.getTxHashFromTxlink();
      log.debug(`${test.name} txHash: ${txHash}`);
      transactionsInProgress.push(hecochain.waitForTx({ txHash, testName: test.info().title }));
    });
  });
});
