import { AuthScreen, WalletsScreen } from '../screens';
import { expect, data, test, walletURL } from '../common-test-exports';

let auth: AuthScreen;
let wallets: WalletsScreen;

test.describe.parallel('Wallets screen >', () => {
  test.describe('Transactions', () => {
    test('Transactions list is displayed', async ({ page }) => {
      // arrange
      auth = new AuthScreen(page);
      wallets = new WalletsScreen(page);
      await page.goto(walletURL, { waitUntil: 'networkidle' });
      await auth.loginByRestoringSeed(data.wallets.login.seed);

      // assert
      await wallets.waitForWalletsDataLoaded();
      await expect(page.locator('div.disabled-wallet-item')).not.toBeVisible();
    });
  });
});
