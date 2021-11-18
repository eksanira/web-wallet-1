import { test } from '@playwright/test';
import { assert } from '../assert';
import { walletURL } from '../config';
import { setupPage } from '../pw-helpers/setup-page';
import { Auth } from '../screens/auth';
import { WalletsScreen } from '../screens/wallets';
import { data } from '../test-data';

let auth: Auth;
let walletsScreen: WalletsScreen;

test.describe.parallel('Wallets screen >', () => {
  test.describe('Transactions', () => {
    test('Transactions list is displayed', async ({ page }) => {
      // arrange
      setupPage(page);
      auth = new Auth(page);
      walletsScreen = new WalletsScreen(page);
      await page.goto(walletURL, { waitUntil: 'networkidle' });
      await auth.loginByRestoringSeed(data.wallets.login.seed);

      // assert
      await walletsScreen.waitForWalletsDataLoaded();
      assert.isFalse(await page.isVisible('div.disabled-wallet-item'));
    });
  });
});
