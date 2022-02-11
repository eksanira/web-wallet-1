import {
  AuthScreen, SearchScreen, SettingsScreen, StakingScreen, WalletsScreen,
} from '../../screens';
import {
  data, expect, test, walletURL,
} from '../../common-test-exports';

let wallets: WalletsScreen;
let auth: AuthScreen;
let settings: SettingsScreen;
let search: SearchScreen;
let staking: StakingScreen;

test.describe.parallel('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    wallets = new WalletsScreen(page);
    settings = new SettingsScreen(page);
    auth = new AuthScreen(page);
    search = new SearchScreen(page);
    staking = new StakingScreen(page);
    await page.goto(walletURL, { waitUntil: 'networkidle' });
    await auth.loginByRestoringSeed(data.wallets.login.seed);
  });

  test('Navigate with back button in header', async () => {
    await wallets.waitForWalletsDataLoaded();

    const screens = ['settings', 'search', 'staking', 'swap', 'send'];

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];

      // check that navigation doesn't get broken by locking screen
      await wallets.lockButton.click();
      await auth.pinForLoggedOutAcc.typeAndConfirm('111222');
      expect(await auth.isLoggedIn()).toBeTruthy();

      switch (screen) {
        case 'settings':
          await wallets.openMenu('settings');
          await settings.networkSwitcher.waitFor();
          break;

        case 'search':
          await wallets.openMenu('wallets');
          await wallets.openMenu('search');
          await search.dapps.waitFor();
          break;

        case 'staking':
          await wallets.openMenu('wallets');
          await wallets.openMenu('staking');
          await staking.createStakingAccountButton.waitFor();
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
          expect(await wallets.swapForm.networkSelector.isVisible()).toBeFalsy();
          break;
      }

      await wallets.backButton.click();
      await wallets.waitForWalletsDataLoaded();
      await expect(wallets.walletItemInWalletsList.first()).toBeVisible();
    }
  });

  test('Redirects to support page from menu', async ({ context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      wallets.openMenu('support'),
    ]);

    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('https://support.velas.com')
  });
});
