import { data, test } from '../../common-test-exports';
import { Currency } from '../../screens';
import { log } from '../../tools/logger';

test.describe('Swap', () => {
  const txHashes: string[] = [];
  const customAddress = '';
  const swapPairs: Currency[][] = [
    ['token-vlx_evm', 'token-vlx_erc20'],
    ['token-vlx_evm', 'token-bsc_vlx'],
    ['token-vlx_evm', 'token-vlx_huobi'],
    ['token-vlx_usdc', 'token-usdc'],
    ['token-vlx_usdt', 'token-usdt_erc20'],
    ['token-vlx_eth', 'token-eth'],
    ['token-vlx_busd', 'token-busd'],
    ['token-usdc', 'token-vlx_usdc'],
    ['token-eth', 'token-vlx_eth'],
    ['token-vlx_erc20', 'token-vlx_evm'],
    ['token-usdt_erc20', 'token-vlx_usdt'],
    ['token-bsc_vlx', 'token-vlx_evm'],
    ['token-busd', 'token-vlx_busd'],
    ['token-vlx_huobi', 'token-vlx_evm']
  ]

  test.beforeEach(async ({ auth, wallets }) => {
    await auth.goto();
    await auth.loginByRestoringSeed(data.wallets.manualSwap.seed);
    await wallets.waitForWalletsDataLoaded();
  });

  test.afterAll(async () => {
    log.info(`List of transactions:\n${txHashes}`);
  });

  for (let swapPair of swapPairs) {
    const [fromToken, toToken] = swapPair;
    test(`${fromToken} > ${toToken}`, async ({ wallets }) => {
      await wallets.swapTokens(fromToken, toToken, '0.0001', { customAddress: customAddress });
      const txHash = await wallets.getTxHashFromTxlink();
      txHashes.push(txHash);
    });
  }
});
