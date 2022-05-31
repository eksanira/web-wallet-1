import { data, test } from '../../common-test-exports';
import { Currency } from '../../screens';
import { log } from '../../tools/logger';

test.describe('Swap', () => {
  const transactionsInProgress: string[] = [];
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
    await auth.loginByRestoringSeed(data.wallets.manual.seed);
    await wallets.waitForWalletsDataLoaded();
  });

  test.afterAll(async () => {
    log.info(transactionsInProgress);
  });

  test.describe(' all tokens to custom address ', async () => {
    for (let i = 0; i < swapPairs.length; i++){
      test(`${swapPairs[i][0]} > ${swapPairs[i][1]}`, async ({ wallets }) => {
        await wallets.swapTokens(swapPairs[i][0], swapPairs[i][1], '0.0001', {customAddress: customAddress});
        const txHash = await wallets.getTxHashFromTxlink();
        transactionsInProgress.push(txHash);
      });
    }
  });
});
