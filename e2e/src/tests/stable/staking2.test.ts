// Tables load

// [🚗 ] staking accounts 

// [🚗 ] validators

// [🚗 ] 'use max' button

// [🚗 ] create staking account

// [🚗 ] delegate

// [🚗 ] undelegate

// [🚗 ] withdraw

// [🚗 ] split

// update stakes list
// search
// epoch info

// validators list
// no staked validators

// validator info
// stake
// withdrawals
// rewards




import { velasNative } from '@velas/velas-chain-test-wrapper';
import {
  assert, data, expect, helpers, test, walletURL,
} from '../../common-test-exports';
import { AuthScreen, DAppsScreen, Staking2Screen, WalletsScreen } from '../../screens';

let auth: AuthScreen;
let wallets: WalletsScreen;
let staking: Staking2Screen;
let dApps: DAppsScreen;

// TODO: validators loading takes too much time
test.describe('Staking', () => {
  test.beforeEach(async ({ page }) => {
    auth = new AuthScreen(page);
    wallets = new WalletsScreen(page);
    staking = new Staking2Screen(page);
    dApps = new DAppsScreen(page);
    await page.goto(walletURL);
    await auth.loginByRestoringSeed(data.wallets.staking.staker.seed);
    await wallets.openMenu('staking');
    // await staking.waitForLoaded();
  });

  // don't remove "serial". tests in this suite depend on each other
  test.describe('Actions >', () => {
    const stakingAmount = 5;
    test('validators list', async ({ page }) => {
      await page.pause();
      // staked
      // not staked
    });
    
    test('refresh list', async ({ page }) => {
    });

    test('epoch info', async ({ page }) => {
    });

    test('search', async ({ page }) => {
    });

    test('stake', async ({ page }) => {
    });

    test('request withdrawal', async ({ page }) => {
    });

    test('withdraw', async ({ page }) => {
    });

    test('stake more', async ({ page }) => {
    });

    test('rewards', async ({ page }) => {
    });

    test.only('sorting', async ({ page }) => {
      // await staking.validatorsList.sortBy('apr');
      await staking.validatorsList.sortBy('total staked');
      await staking.validatorsList.reload();
      await page.waitForTimeout(4000);
      // await page.pause();
    });

    // test('', async ({ page }) => {
    // });

    // test('', async ({ page }) => {
    // });

  });

});
