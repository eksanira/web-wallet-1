import { velasNative } from '@velas/velas-chain-test-wrapper';
import {
  data, expect, helpers, test, walletURL,
} from '../../common-test-exports';
import { AuthScreen, Staking2Screen, WalletsScreen } from '../../screens';
import { log } from '../../tools/logger';

let auth: AuthScreen;
let wallets: WalletsScreen;
let staking: Staking2Screen;

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
    await page.goto(walletURL);
  });

  test.describe('validators list', () => {
    test('validator item info: active/inactive, name', async () => {
      await auth.fastLogin(data.wallets.staking.withoutStakeAccounts);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.validator.first().waitFor();

      // status: active/inactive
      await expect(staking.validatorsList.activeStatus.first()).toBeVisible();
      await expect(staking.validatorsList.inactiveStatus.first()).toBeVisible();

      // name
      await expect(staking.validatorsList.validatorName.first()).toBeVisible();
    });

    test('sorting', async () => {
      await auth.fastLogin(data.wallets.staking.withoutStakeAccounts);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.sortBy('apr');
      await staking.validatorsList.apr.first().waitFor();
      const aprs = await staking.validatorsList.apr.allInnerTexts();
      expect(aprs).toEqual([...aprs].sort().reverse());

      await staking.validatorsList.sortBy('total staked');
      await staking.validatorsList.totalStaked.first().waitFor();
      let totalStakes = await staking.validatorsList.totalStaked.allInnerTexts();
      totalStakes = totalStakes.map((stake) => stake.split(' VLX')[0]);
      expect(totalStakes).toEqual([...totalStakes].sort((a, b) => Number(a) - Number(b)));
    });

    test('search', async () => {
      await staking.goto({ network: 'mainnet' });
      await auth.fastLogin(data.wallets.staking.withoutStakeAccounts);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      // nothing found
      await staking.search.open.click();
      await staking.search.input.type('none');
      await expect(staking.search.noResults).toBeVisible();
      await staking.search.cancel.click();

      // address
      await staking.search.open.click();
      await expect(staking.search.getSearchResultItemWithText('Velas Validator Node')).not.toBeVisible();
      await staking.search.input.fill('DgmRwYK5tNLKeCSk6a4zpnwXSw3RdgMDTfAU1x6iqL3g');
      await expect(staking.search.getSearchResultItemWithText('Velas Validator Node')).toBeVisible();
      await staking.search.cancel.click();

      // name (case insensitive)
      await staking.search.open.click();
      await expect(staking.search.getSearchResultItemWithText('BlueZilla.vc')).not.toBeVisible();
      await staking.search.input.fill('BlueZilla.vc');
      await expect(staking.search.getSearchResultItemWithText('BlueZilla.vc')).toBeVisible();
      await staking.search.cancel.click();

      // identity (type only part of string)
      await staking.search.open.click();
      await expect(staking.search.getSearchResultItemWithText('VelasPad.io')).not.toBeVisible();
      await staking.search.input.fill('HdCn5cV2Cugcb2XgpCR3Uu6FcdTAyJw');
      await expect(staking.search.getSearchResultItemWithText('VelasPad.io')).toBeVisible();
      await staking.search.cancel.click();
    });
  });

  test.describe.serial('stake > stake more > withdraw', () => {
    let allTestsPassed = false;

    test('cleanup on start', async () => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.cleanup();
    });

    test('stake', async ({ page }) => {
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

    test('stake more', async ({ page }) => {
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

    test('request withdraw (2 stakes from one validator)', async () => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.staked.requestWithdrawButton.click();
      await staking.stakeForm.useMaxButton.click();
      await staking.stakeForm.withdrawButton.click();
      await staking.stakeForm.successfulWithdrawMessage.waitFor({ timeout: 15000 });
      await staking.stakeForm.okButton.click();
    });

    test('withdraw', async () => {
      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.tab.withdrawals.click();
      await staking.validator.withdrawals.withdrawButton.click();
      await staking.stakeForm.successfulWithdrawMessage.waitFor({ timeout: 15000 });
      await staking.stakeForm.okButton.click();
      await staking.validator.goBack();

      await staking.validatorsList.refreshStakesUntilStakedValidatorDisappears();

      allTestsPassed = true;
    });

    test('cleanup on teardown', async () => {
      test.skip(allTestsPassed);

      await auth.loginByRestoringSeed(data.wallets.staking.staker2_1.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.cleanup();
    });
  });

  test.describe('validator', () => {
    test('rewards', async () => {
      await auth.fastLogin(data.wallets.staking.rewards);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.stakedValidatorsAmountIsVisible(1);
      await staking.validatorsList.validator.first().click();
      await staking.validator.tab.rewards.click();

      await expect(staking.validator.rewards.rewardItem).toBeVisible();
      const lastRewardEpoch = Number(await staking.validator.rewards.epochNumber.textContent());
      const epochNumberFromBlockchain = (await velasNative.getEpochInfo()).epoch;
      expect(lastRewardEpoch).toEqual(epochNumberFromBlockchain - 1);
    });

    test('use max', async () => {
      await auth.loginByRestoringSeed(data.wallets.staking.useMax.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.validator.first().click();
      await staking.validator.notStaked.stakeButton.click();
      const availableForStakingAmount = await staking.stakeForm.getAvailableForStakingAmount();
      await staking.stakeForm.useMaxButton.click();
      const inputValue = await staking.stakeForm.amountInput.inputValue();

      expect(Number(inputValue)).toEqual(availableForStakingAmount - 1);
    });

    test('copy validator address', async ({ page }) => {
      await auth.loginByRestoringSeed(data.wallets.staking.withoutStakeAccounts.seed);
      await wallets.openMenu('staking');
      await staking.waitForLoaded();

      await staking.validatorsList.validator.first().click();

      const copiedAddress = await staking.validator.copyAddress();

      expect(copiedAddress).toHaveLength(44);
      await expect(page.locator('#message', { hasText: 'Copied' })).toBeVisible();
    });
  });

  test('stake with conversion (ENM > Native)', async ({ page }) => {
    await auth.loginByRestoringSeed(data.wallets.staking.stakerEVM.seed);
    await wallets.openMenu('staking');
    await staking.waitForLoaded();

    await staking.validatorsList.validator.first().click();
    await staking.validator.notStaked.stakeButton.click();
    await staking.stakeForm.amountInput.fill('13.13');
    await staking.stakeForm.nextButton.click();

    await expect(page.locator('"Convert 11.13 VLX EVM to VLX Native"')).toBeVisible();
  });
});
