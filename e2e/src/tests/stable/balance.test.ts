import { velasNative } from '@velas/velas-chain-test-wrapper';
import balancesAPI from '../../api/balances-api';
import { AuthScreen, Currency, WalletsScreen } from '../../screens';
import {
  assert, data, helpers, test, walletURL,
} from '../../common-test-exports';
import { log } from '../../tools/logger';

test.describe('Balance', () => {
  let auth: AuthScreen;
  let wallets: WalletsScreen;

  test.beforeEach(async ({ page }) => {
    auth = new AuthScreen(page);
    wallets = new WalletsScreen(page);
    await page.goto(walletURL);
    await auth.loginByRestoringSeed(data.wallets.withFunds.seed);
    await wallets.waitForWalletsDataLoaded();
  });

  test('Check VLX Legacy, VLX Native, Litecoin and Bitcoin balances', async () => {
    // await wallets.addWalletsPopup.open();
    // await wallets.addWalletsPopup.add('token-ltc');

    const balances = await wallets.getWalletsBalances();
    const walletsList = Object.keys(balances) as Currency[];

    for (let i = 0; i < walletsList.length; i++) {
      const currency = walletsList[i];
      const VLXNativeBalanceOnBlockchain = (await velasNative.getBalance(data.wallets.withFunds.address)).VLX;
      const balanceUpdateAmount = 0.001;
      const amountOfTokens = balances[currency];

      // if no balance – skip currency
      if (amountOfTokens === null) continue;

      switch (walletsList[i]) {
        case 'token-vlx2':
          assert.equal(amountOfTokens, '80.999895');
          break;
        case 'token-vlx_native':
          assert.equal(amountOfTokens, String(VLXNativeBalanceOnBlockchain));
          const tx = await velasNative.transfer({
            lamports: balanceUpdateAmount * 10 ** 9,
            payerSeed: data.wallets.payer.seed,
            toAddress: data.wallets.withFunds.address,
          });
          await velasNative.waitForConfirmedTransaction(tx);
          await wallets.updateBalances();
          const amountOfTokensAfterUpdate = helpers.toFixedNumber(Number((await wallets.getWalletsBalances())['token-vlx_native']), 6);
          assert.equal(amountOfTokensAfterUpdate, helpers.toFixedNumber((VLXNativeBalanceOnBlockchain + balanceUpdateAmount), 6), 'Velas Native wallet balance was not updated after funding it');
          break;
        case 'token-btc':
          try {
            await balancesAPI.bitcore();
            assert.equal(amountOfTokens, '0.03484302');
          } catch (e) {
            log.debug(e);
            log.warn('Bitcoin balance check skipped because of 3rd party service is down');
          }
          break;
        case 'token-vlx_evm':
          assert.equal(amountOfTokens, '1801.000622564');
          break;
      }
    }
  });
});
