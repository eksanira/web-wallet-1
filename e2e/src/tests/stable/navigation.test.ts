import {
  AuthScreen, SearchScreen, SettingsScreen, Staking2Screen, WalletsScreen,
} from '../../screens';
import {
  assert, data, test, walletURL,
} from '../../common-test-exports';

let wallets: WalletsScreen;
let auth: AuthScreen;
let settings: SettingsScreen;
let search: SearchScreen;
let staking: Staking2Screen;

test.describe.parallel('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    wallets = new WalletsScreen(page);
    settings = new SettingsScreen(page);
    auth = new AuthScreen(page);
    search = new SearchScreen(page);
    staking = new Staking2Screen(page);
    await page.goto(walletURL, { waitUntil: 'networkidle' });
    await auth.loginByRestoringSeed(data.wallets.login.seed);
  });

  test('Navigate with back button in header', async ({ page }) => {
    await wallets.waitForWalletsDataLoaded();

    const screens = ['settings', 'search', 'staking', 'swap', 'send'];

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];

      // check that navigation doesn't get broken by locking screen
      await page.reload();
      await auth.pinForLoggedOutAcc.typeAndConfirm('111222');
      assert.isTrue(await auth.isLoggedIn());

      switch (screen) {
        case 'settings':
          await wallets.openMenu('settings');
          await settings.networkSwitcher.waitFor();
          break;

        case 'search':
          await wallets.openMenu('wallets');
          await wallets.openMenu('dApps');
          await search.dapps.waitFor();
          break;

        case 'staking':
          await wallets.openMenu('wallets');
          await wallets.openMenu('staking');
          await staking.container.waitFor();
          break;

        case 'swap':
          await wallets.openMenu('wallets');
          await wallets.swapButton.click({ timeout: 25000 });
          await wallets.swapForm.networkSelector.waitFor();
          break;

        case 'send':
          await wallets.openMenu('wallets');
          await wallets.clickSendButton();
          await wallets.sendForm.recepientInput.waitFor();
          assert.isFalse(await wallets.swapForm.networkSelector.isVisible());
          break;
      }
    }
  });

  test('Redirects to support page from menu', async ({ context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      wallets.openMenu('support'),
    ]);

    await newPage.waitForLoadState();
    assert.isTrue(newPage.url().includes('https://support.velas.com'));
  });
});
