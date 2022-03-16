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
import { log } from '../../tools/logger';

let auth: AuthScreen;
let wallets: WalletsScreen;
let staking: Staking2Screen;
let dApps: DAppsScreen;

// TODO: validators loading takes too much time
test.describe('Staking', () => {
  test.beforeAll(async () => {
    const epochInfo = await velasNative.getEpochInfo();
    const amountOfSlotsRemaining = epochInfo.slotsInEpoch - epochInfo.slotIndex;
    if (amountOfSlotsRemaining < 150) {
      const timeToNewEpochStart = amountOfSlotsRemaining * 400;
      log.warn(`The new epoch will start in less than a minute. The test suite will wait to avoid unstability.
      Its better if tests start and finish within the same epoch.
      Estimated time to wait: ${timeToNewEpochStart / 1000} seconds`);
      await helpers.sleep(timeToNewEpochStart);

      const newEpochInfo = await velasNative.getEpochInfo();
      expect(newEpochInfo.epoch).toEqual(epochInfo.epoch + 1);
    }
  });


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
    // test('validators list', async ({ page }) => {
    //   await page.pause();
    //   // staked
    //   // not staked
    // });

    // test('refresh list', async ({ page }) => {
    // });

    // test('epoch info', async ({ page }) => {
    // });

    // name, address
    // identity - only on prod
    // test('search', async ({ page }) => {
    // });

    // test.only('EPOCH', async () => {
    //   const epochinfo = await velasNative.getEpochInfo();
    //   log.warn(epochinfo);
    // });

    test('cleanup', async ({ page }) => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      // withdraw stake in case we have active one
      if (await staking.validatorsList.stakedValidatorsAmountIsVisible(1)) {
        await staking.validatorsList.validator.first().click();
        await staking.validator.staked.stakeMoreButton.waitFor();

        // request withdraw if relevant
        if (await staking.validator.staked.requestWithdrawButton.isVisible()) {
          await staking.validator.staked.requestWithdrawButton.click();
          await staking.stakeForm.useMaxButton.click();
          await staking.stakeForm.withdrawButton.click();
          await page.locator('"Withdrawal has been submitted successfully').waitFor({ timeout: 15000 });
          await staking.stakeForm.okButton.click();
        }

        // final withdrawal
        await staking.validator.tab.withdrawals.click();
        await staking.validator.withdrawals.withdrawButton.click();
        await page.locator('"Withdrawal has been submitted successfully"').waitFor();
      }
    });

    test.only('stake', async ({ page }) => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();
      await staking.validatorsList.refreshStakesUntilStakedValidatorDisappears();

      await staking.validatorsList.validator.first().click();
      await staking.validator.notStaked.stakeButton.click();
      await staking.stakeForm.amountInput.type('1.1');
      await staking.stakeForm.nextButton.click();
      await staking.stakeForm.confirmButton.click();

      await page.locator('"Stake account has been created successfully"').waitFor();
      await staking.stakeForm.okButton.click();
      await staking.validator.goBack();
      await staking.validatorsList.refreshStakesUntilStakedValidatorAppears();
    });
    
    test.only('stake more', async ({ page }) => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.staked.stakeMoreButton.click();
      await staking.stakeForm.amountInput.type('0.2');
      await staking.stakeForm.nextButton.click();
      await staking.stakeForm.confirmButton.click();

      await page.locator('"Stake account has been created successfully"').waitFor();
      await staking.stakeForm.okButton.click();
      await staking.validator.getStakeValue();
      await staking.validator.waitForStakeValueUpdate({ fromValue: '1.10', toValue: '1.30' });
    });

    test('request withdraw', async ({ page }) => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.staked.requestWithdrawButton.click();
      await staking.stakeForm.useMaxButton.click();
      await staking.stakeForm.withdrawButton.click();
      await page.locator('"Withdrawal has been submitted successfully').waitFor({ timeout: 15000 });
      await staking.stakeForm.okButton.click();
    });

    test('withdraw', async ({ page }) => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.tab.withdrawals.click();
      await staking.validator.withdrawals.withdrawButton.click();
      await page.locator('"Withdrawal has been submitted successfully"').waitFor();
      await staking.stakeForm.okButton.click();
      await staking.validator.goBack();

      await staking.validatorsList.refreshStakesUntilStakedValidatorDisappears();
    });

    // // DONE
    // test('rewards', async () => {
    //   await auth.loginByRestoringSeed(data.wallets.staking.rewards.seed);
    //   await wallets.openMenu('staking');
    //   await staking.waitForLoaded();

    //   await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
    //   await staking.validatorsList.validator.first().click();
    //   await staking.validator.tab.rewards.click();

    //   await expect(staking.validator.rewards.rewardItem).toBeVisible();
    //   const lastRewardEpoch = Number(await staking.validator.rewards.epochNumber.textContent());
    //   const epochNumberFromBlockchain = (await velasNative.getEpochInfo()).epoch;
    //   expect(lastRewardEpoch).toEqual(epochNumberFromBlockchain - 1);
    // });

    // // DONE
    // test('use max', async ({ page }) => {
    //   // arrange
    //   await auth.loginByRestoringSeed(data.wallets.staking.useMax.seed);
    //   await wallets.openMenu('staking');
    //   await staking.waitForLoaded();

    //   await staking.validatorsList.validator.first().click();
    //   await staking.validator.notStaked.stakeButton.click();
    //   const availableForStakingAmount = await staking.stakeForm.getAvailableForStakingAmount();
    //   await staking.stakeForm.useMaxButton.click();
    //   const inputValue = await staking.stakeForm.amountInput.inputValue();

    //   expect(Number(inputValue)).toEqual(availableForStakingAmount - 1);
    // });

    // test('sorting', async ({ page }) => {
    //   await auth.loginByRestoringSeed(data.wallets.staking.withoutStakeAccounts.seed);
    //   await wallets.openMenu('staking');
    //   await staking.waitForLoaded();

    //   // await staking.validatorsList.sortBy('apr');
    //   await staking.validatorsList.sortBy('total staked');
    //   await staking.validatorsList.reload();
    //   await page.waitForTimeout(1000);
    //   // await page.pause();
    // });


    // stake with conversion - gets from EVM

    // test('withdraw 2 or more stakes from one validator', async ({ page }) => {
    //   // stake 1 vlx, stake 1 vlx again, withdraw 2 vlx
    // });

    // test('withdraw', async ({ page }) => {
    // });


    // test('copy validator address', async ({ page }) => {
    //   // 3g3bs7co7NKChsSQeqkPYcPJMyKdQbwJ3qoT1EQBUdj2
    // });

    // пополнять акк на рандомное значение баланса



    // test('', async ({ page }) => {
    // });

    // test('', async ({ page }) => {
    // });

  });

});
