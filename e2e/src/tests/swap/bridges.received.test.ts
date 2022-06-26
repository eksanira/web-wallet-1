import { test } from '../../common-test-exports';
import { Currency } from '../../screens';
import { log } from '../../tools/logger';

test.describe('Bridge test 2:', () => {
  const today = new Date().toLocaleDateString("nu").replace(/\//g, '');

  test.beforeEach(async ({ auth }) => {
    await auth.goto({environment: 'prod'});
    await auth.loginByRestoringSeed(today);
  });

  test('check balances', async ({ wallets }) => {
    const tokens : Currency[] = [
      'token-bsc_vlx', 'token-vlx_huobi', 'token-bnb', 'token-busd', 
      'token-eth', 'token-huobi', 'token-usdc', 'token-usdt_erc20', 
      'token-vlx_busd', 'token-vlx_erc20', 'token-vlx_eth', 'token-vlx_evm',
      'token-vlx_usdc', 'token-vlx_usdt'
    ]

    for(let token of tokens){
      await wallets.addToken(token);
    };

    let balances = await wallets.getWalletsBalances();

    for (let [key, value] of Object.entries(balances)) {
      let tokenKey = key as Currency;
      if (key === 'token-vlx_evm' && Number(value) < 0.000007){
        throw new Error (`Balance of ${key} is ${value}, 0.000007 expected`)
      }
      if (key !== 'token-vlx_evm' && tokens.includes(tokenKey) && Number(value) === 0){
        throw new Error (`Balance of ${key} is zero`)
      }
    }
    log.debug(balances);
  });
});
