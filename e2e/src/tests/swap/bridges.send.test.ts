import { data, test } from '../../common-test-exports';
import { Currency } from '../../screens';
import { log } from '../../tools/logger';

const today = new Date().toLocaleDateString("nu").replace(/\//g, '');
let receiverAddress = '';

test.describe('Bridge test 1:', () => {
  test('Get today\'s address', async ({ auth, wallets}) => {
    await auth.goto({environment: 'prod'});
    await auth.loginByRestoringSeed(today);
    await wallets.selectWallet('token-vlx_evm');
    receiverAddress = await wallets.getWalletAddress();    
  });
});

test.describe('Swap', () => {
  const txHashes: string[] = [];
  let amount = '0.000001';
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
  ];

  test.beforeEach(async ({ auth, wallets }) => {
    await auth.goto({environment: 'prod'});
    await auth.loginByRestoringSeed(data.wallets.manualSwap.seed);
    await wallets.waitForWalletsDataLoaded();
  });

  test.afterAll(async () => {
    log.info(`List of transactions:\n${txHashes}`);
  });

  for (let swapPair of swapPairs) {
    const [fromToken, toToken] = swapPair;
    if (swapPair == ['token-bsc_vlx', 'token-vlx_evm']) amount = '0.000002';
    if (swapPair == ['token-vlx_huobi', 'token-vlx_evm']) amount = '0.000004';
    test(`Swap ${fromToken} > ${toToken}`, async ({ wallets }) => {
      await wallets.swapTokens(fromToken, toToken, amount, { customAddress: receiverAddress });
      const txHash = await wallets.getTxHashFromTxlink();
      txHashes.push(txHash);
    });
  };
});
