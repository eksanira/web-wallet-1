import { velasNative } from '@velas/velas-chain-test-wrapper';
import {
  assert, data, expect, helpers, test, walletURL,
} from '../../common-test-exports';
import { AuthScreen, StakingScreen, WalletsScreen } from '../../screens';

let auth: AuthScreen;
let wallets: WalletsScreen;
let staking: StakingScreen;

// TODO: validators loading takes too much time
test.describe('Staking', () => {
  test.beforeEach(async ({ page }) => {
    auth = new AuthScreen(page);
    wallets = new WalletsScreen(page);
    staking = new StakingScreen(page);
    await page.goto(walletURL);
    await auth.loginByRestoringSeed(data.wallets.staking.staker.seed);
    await wallets.openMenu('staking');

    // TEMPORARY
    await page.click('.switch-account');
    await page.waitForTimeout(500);
    await page.click('" Account 2"');
    await staking.waitForLoaded();
  });

  // don't remove "serial". tests in this suite depend on each other
  test.describe.serial('Actions >', () => {
    const stakingAmount = 5;
    test('Cleanup beforeall', async () => {
      await staking.cleanup.stakesToUndelegate();
      await staking.cleanup.stakesToWithdraw();
      await staking.cleanup.stakesNotDelegated();
    });

    test.skip('Use max', async () => {
      const balance = await staking.getVLXNativeBalance();
      await staking.createStakingAccountButton.click();
      await staking.useMax();
      const maxAmount = await staking.createStakingAccountForm.getMaxAmount();
      assert.equal(maxAmount, Math.floor(balance) - 1);
    });

    test('Create staking account', async () => {
      // arrange
      const VLXNativeAddress = data.wallets.staking.staker.publicKey;
      const initialAmountOfStakingAccounts = await staking.getAmountOfStakes('Delegate');
      const stakingAccountAddresses = await staking.getStakingAccountsAddresses();
      const initialVLXNativeBalance = helpers.toFixedNumber((await velasNative.getBalance(VLXNativeAddress)).VLX);

      // act
      await staking.createStakingAccountButton.click();
      await staking.createStakingAccountForm.amount.fill(String(stakingAmount));
      await staking.modals.confirmPrompt();
      await staking.waitForStakingAccountCreation();
      await staking.waitForLoaded();

      // assert
      // new stake does not appear in the list immediately
      const finalAmountOfStakingAccounts = await staking.waitForStakesAmountUpdated({ initialStakesAmount: initialAmountOfStakingAccounts, stakeType: 'Delegate' });
      assert.equal(finalAmountOfStakingAccounts, initialAmountOfStakingAccounts + 1);

      const newlyAddedStakingAccountAddress = (await staking.getStakingAccountsUpdate(stakingAccountAddresses))?.added;
      if (!newlyAddedStakingAccountAddress) throw new Error('No new staking account appears in the list');

      // assert VLXNative balance decreases on staking amount
      const finalVLXNativeBalance = helpers.toFixedNumber((await velasNative.getBalance(VLXNativeAddress)).VLX);
      assert.equal(finalVLXNativeBalance, initialVLXNativeBalance - stakingAmount);

      // check newly created staking account on blockchain
      await staking.makeSureStakingAccIsCreatedAndNotDelegated(newlyAddedStakingAccountAddress);
      assert.equal(helpers.toFixedNumber((await velasNative.getBalance(newlyAddedStakingAccountAddress)).VLX), stakingAmount);
    });

    test('Delegate stake', async ({ page }) => {
      const initialAmountOfDelegatedStakes = await staking.getAmountOfStakes('Undelegate');
      const stakeAccountAddress = await staking.getFirstStakingAccountAddressFromTheList('Delegate');

      await staking.accounts.delegate();
      await staking.delegateTo.selectValidator.first().waitFor({ timeout: 20000 });
      await staking.delegateTo.selectValidator.first().click();
      await staking.modals.confirmPrompt();
      const alert = page.locator('.confirmation .text');
      await alert.waitFor({ timeout: 15000 });
      const alertText = await alert.textContent();
      assert.include(alertText, 'Funds delegated to');
      await staking.modals.clickOK();
      await staking.waitForLoaded();
      const finalAmountOfDelegatedStakes = await staking.waitForStakesAmountUpdated({ initialStakesAmount: initialAmountOfDelegatedStakes, stakeType: 'Undelegate' });
      expect(finalAmountOfDelegatedStakes).toEqual(initialAmountOfDelegatedStakes + 1);

      const stakeAccOnBlockchain = await velasNative.getStakeAccount(stakeAccountAddress);
      assert.equal(stakeAccOnBlockchain.active, 0);
      assert.equal(stakeAccOnBlockchain.inactive, stakingAmount * 10 ** 9);
      assert.equal(stakeAccOnBlockchain.state, 'activating');
    });

    test('Undelegate stake', async ({ page }) => {
      const initialToUndelegateStakesAmount = await staking.getAmountOfStakes('Undelegate');
      const initialToDelegateStakesAmount = await staking.getAmountOfStakes('Delegate');
      const stakeAccountAddress = await staking.getFirstStakingAccountAddressFromTheList('Delegate');

      await staking.clickUndelegate();
      await staking.modals.confirmPrompt();
      await page.waitForSelector('" Funds undelegated successfully"', { timeout: 10000 });
      await staking.modals.clickOK();
      await staking.waitForLoaded();
      const finalToUndelegateStakesAmount = await staking.waitForStakesAmountUpdated({ initialStakesAmount: initialToUndelegateStakesAmount, stakeType: 'Undelegate' });
      assert.equal(finalToUndelegateStakesAmount, initialToUndelegateStakesAmount - 1, 'Amount of stakes to undelegate has not changed after undelegation');
      assert.equal(await staking.getAmountOfStakes('Delegate'), initialToDelegateStakesAmount + 1, 'Amount of stakes to withdraw has not changed after undelegation');

      const stakeAccOnBlockchain = await velasNative.getStakeAccount(stakeAccountAddress);
      assert.equal(stakeAccOnBlockchain.active, 0);
      assert.equal(stakeAccOnBlockchain.inactive, stakingAmount * 10 ** 9);
      assert.equal(stakeAccOnBlockchain.state, 'inactive');
    });

    test('Split stake', async ({ page }) => {
      const initialAmountOfStakingAccounts = await staking.getAmountOfStakes('Delegate');
      const stakingAccountAddresses = await staking.getStakingAccountsAddresses();

      await staking.selectAccount('Delegate');
      await staking.stakeAccount.splitButton.click();
      await staking.createStakingAccountForm.amount.fill('1');
      await staking.modals.confirmPrompt();
      await page.waitForSelector('text=/account created and funds are splitted successfully/i', { timeout: 20000 });
      await staking.modals.clickOK();
      await staking.waitForSplitedStakeToAppear();

      const finalAmountOfStakingAccounts = await staking.waitForStakesAmountUpdated({ initialStakesAmount: initialAmountOfStakingAccounts, stakeType: 'Delegate' });
      assert.equal(finalAmountOfStakingAccounts, initialAmountOfStakingAccounts + 1);

      const addedAfterSplitAccountAddress = (await staking.getStakingAccountsUpdate(stakingAccountAddresses))?.added;
      if (!addedAfterSplitAccountAddress) throw new Error('No staking accounts appears. But it was expected after staking');

      // postcondition – withdraw splitted account
      await staking.selectAccountByAddress(addedAfterSplitAccountAddress);
      await staking.stakeAccount.withdrawButton.click();
      await staking.modals.confirmPrompt();
      await page.waitForSelector('" Funds withdrawn successfully"', { timeout: 20000 });
      await staking.modals.clickOK();
    });

    test('Withdraw stake', async ({ page }) => {
      const stakingAccountAddresses = await staking.getStakingAccountsAddresses();
      const initialAmountOfStakingAccounts = await staking.getAmountOfStakes('all');
      const stakeAccountAddress = await staking.getFirstStakingAccountAddressFromTheList('Delegate');

      await staking.selectAccount('Delegate');
      await staking.stakeAccount.withdrawButton.click();
      await staking.modals.confirmPrompt();
      await page.waitForSelector('" Funds withdrawn successfully"', { timeout: 30000 });
      await staking.modals.clickOK();
      await staking.waitForLoaded();

      const finalAmountOfStakingAccounts = await staking.waitForStakesAmountUpdated({ initialStakesAmount: initialAmountOfStakingAccounts, stakeType: 'all' });

      assert.equal(finalAmountOfStakingAccounts, initialAmountOfStakingAccounts - 1);

      await staking.makeSureStakingAccountDoesNotExistOnBlockchain(stakeAccountAddress);
      const withdrawedStakeAccountAddress = (await staking.getStakingAccountsUpdate(stakingAccountAddresses))?.removed;
      if (!withdrawedStakeAccountAddress) throw new Error(`Withdwed stake ${stakingAccountAddresses} does not disappear from stakes list`);
      assert.equal(withdrawedStakeAccountAddress, stakeAccountAddress);
    });

    test('Validators list', async ({ page }) => {
      await page.waitForSelector('.validator-item .identicon', { timeout: 10000 });
      await staking.validatorsList.validator.icon.first().waitFor();
      assert.isTrue(await staking.validatorsList.validator.browse.first().isVisible(), 'No icon with link to explorer in validators list');
      assert.isTrue(await staking.validatorsList.validator.copy.first().isVisible(), 'No copy address icon in validators list');
      assert.isTrue(await staking.validatorsList.validator.myStakes.first().isVisible(), 'No my-stake column in validators list');
    });

    // TODO
    test.skip('stakes list could be refreshed manually if WS connection is not established', async () => {
    });

    test('Cleanup afterall', async () => {
      await staking.cleanup.stakesToUndelegate();
      await staking.cleanup.stakesToWithdraw();
      await staking.cleanup.stakesNotDelegated();
    });

  });
});
