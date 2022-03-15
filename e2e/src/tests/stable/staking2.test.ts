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

    // test('epoch info', async ({ page }) => {
    // });

    // name, address
    // identity - only on prod
    test('search', async ({ page }) => {
    });

    test('stake', async ({ page }) => {
    });

    // stake with conversion - gets from EVM
    test.only('stake more', async ({ page }) => {
      // arrange
      await auth.loginByRestoringSeed(data.wallets.staking.withActiveStake.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.staked.stakeMoreButton.click();
      await staking.stakeForm.amountInput.type('0.01');
      await staking.stakeForm.nextButton.click();
      await staking.stakeForm.confirmButton.click();
      await page.locator('"Stake account has been created successfully"').waitFor();
      await staking.stakeForm.okButton.click();
    });

    test('withdraw 2 or more stakes from one validator', async ({ page }) => {
      // stake 1 vlx, stake 1 vlx again, withdraw 2 vlx
    });

    test('request withdrawal', async ({ page }) => {
    });

    test('withdraw', async ({ page }) => {
    });

    test('rewards', async ({ page }) => {
    });

    test('use max', async ({ page }) => {
    });

    test('copy validator address', async ({ page }) => {
      // 3g3bs7co7NKChsSQeqkPYcPJMyKdQbwJ3qoT1EQBUdj2
    });

    // пополнять акк на рандомное значение баланса

    test('sorting', async ({ page }) => {
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
