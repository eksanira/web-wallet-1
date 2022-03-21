import { Locator } from '@playwright/test';
import { velasNative } from '@velas/velas-chain-test-wrapper/lib/velas-native';
import { Page } from '../common-test-exports';
import { helpers } from '../tools/helpers';
import { log } from '../tools/logger';
import { BaseScreen } from './base';

export class Staking2Screen extends BaseScreen {
  constructor(public page: Page) {
    super(page);
  }

  container = this.page.locator('.staking2 .staking');

  waitForLoaded = async (): Promise<void> => {
    await this.validatorsList.loader.waitFor({ state: 'detached', timeout: 15000 });
    await this.validatorsList.validator.first().waitFor();
  }

  search = {
    open: this.page.locator('#open-search'),
    cancel: this.page.locator('#on-close'),
    input: this.page.locator('input[type="search"]'),
    noResults: this.page.locator('"Nothing to see here!"'),
    searchResultItem: this.page.locator('.search-table #on-click-validator'),
    getSearchResultItemWithText: (text: string): Locator => {
      return this.page.locator(`.search-table #on-click-validator :text("${text}")`);
    }
  }

  validatorsList = {
    apr: this.page.locator('#on-click-validator #apr-validator'),
    totalStaked: this.page.locator('#on-click-validator #total-staked-validator'),
    epochInfoButton: this.page.locator('#on-click-epoch'),

    sortBy: async (sortBy: 'apr' | 'total staked'): Promise<void> => {
      const selectValues = {
        'apr': 'apr',
        'total staked': 'activeStake'
      }
      await this.page.locator('.index-title-row-staked select').selectOption(selectValues[sortBy]);
    },

    loader: this.page.locator('.MuiCircularProgress-circle.MuiCircularProgress-circleIndeterminate'),
    reloadListButton: this.page.locator('#on-press-reload'),
    reload: async (): Promise<void> => {
      await this.validatorsList.reloadListButton.click();
      await this.waitForLoaded();
    },

    validator: this.page.locator('#on-click-validator'),
    validatorName: this.page.locator('#on-click-validator #name-validator'),
    activeStatus: this.page.locator('#on-click-validator #active-status'),
    inactiveStatus: this.page.locator('#on-click-validator #inactive-status'),

    stakedValidatorsAmountIsVisible: async (amount: number): Promise<boolean> => {
      return await this.page.locator(`"Staked Validators (${amount})"`).isVisible();
    },

    refreshStakesUntilStakedValidatorAppears: async (timeout: number = 30000): Promise<void> => {
      const startTime = new Date().getTime();
      while (!await this.validatorsList.stakedValidatorsAmountIsVisible(1) && new Date().getTime() < startTime + timeout) {
        await this.validatorsList.reload();
        await this.page.waitForTimeout(500);
      }
      if (!await this.validatorsList.stakedValidatorsAmountIsVisible(1)) throw new Error(`Staked validator does not appear within ${timeout / 1000} seconds`);
    },

    refreshStakesUntilStakedValidatorDisappears: async (timeout: number = 30000): Promise<void> => {
      const startTime = new Date().getTime();
      while (await this.validatorsList.stakedValidatorsAmountIsVisible(1) && new Date().getTime() < startTime + timeout) {
        await this.validatorsList.reload();
        await this.page.waitForTimeout(500);
      }
      if (await this.validatorsList.stakedValidatorsAmountIsVisible(1)) throw new Error(`Staked validator does not disappear within ${timeout / 1000} seconds`);
    },
  }

  validator = {
    copyAddress: async (): Promise<string> => {
      await this.page.locator('[data-testid="ContentCopyIcon"]').click();
      const copiedAddress = await this.page.evaluate(async () => await navigator.clipboard.readText());
      log.info(`Clipboard: ${copiedAddress}`);
      return copiedAddress;
    },
    goBack: async (): Promise<void> => {
      await this.page.locator('[data-testid="ArrowBackIosIcon"]').click();
      await this.waitForLoaded();
    },

    getStakeValue: async (): Promise<string> => {
      const textContainingStakeValue = await this.page.locator('.info-block-column2 #value1').textContent();
      if (!textContainingStakeValue) throw new Error(`Cant get text containing stake value. It equals: ${textContainingStakeValue}`)
      return textContainingStakeValue.split(' VLX')[0];
    },

    waitForStakeValueUpdate: async (params: { fromValue?: string, toValue?: string }, timeout = 30000): Promise<string> => {
      log.info(`Wait for staking update from ${params.fromValue || 'any'} to ${params.toValue || 'any'} value`);

      if (!params.fromValue && !params.toValue) throw new Error(`At lease one param should be passed: ${helpers.stringify(params)}`);
      const startTime = new Date().getTime();

      const startStakeValue = String(params.fromValue) || await this.validator.getStakeValue();

      while (new Date().getTime() < startTime + timeout) {
        const currentStakeValue = await this.validator.getStakeValue();

        // if we expect specific amount
        if (currentStakeValue === String(params.toValue)) {
          if (currentStakeValue === startStakeValue) {
            throw new Error(`Looks like you are doing something wrong. You expect stake amount to be cahnged from ${startStakeValue} to ${params.toValue}`);
          }

          log.info(`Stake amount was updated: from ${startStakeValue} to expected ${currentStakeValue}`);
          return currentStakeValue;
        }

        // if stake amount was changed, but not to the value we expected
        if (currentStakeValue !== startStakeValue && params.toValue && currentStakeValue !== String(params.toValue)) {
          throw new Error(`Stake amount was updated: from ${startStakeValue} to ${currentStakeValue}. But we expect change to value ${params.toValue}`);
        }

        // if we expect stake amount change to any value 
        if (!params.toValue && startStakeValue !== startStakeValue) {
          log.info(`Stake amount was updated: from ${startStakeValue} to ${currentStakeValue}`);
          return currentStakeValue;
        }

        await this.page.waitForTimeout(500);
        await this.validator.reload();
      }

      log.debug(`IF YOU SEE THIS TEXT LOOKS LIKE SOME CASES WERE MISSED DURING THIS METHOD DEVELOPMENT. PLEASE FIX`);
      if (await this.validator.getStakeValue() === startStakeValue) throw new Error(`Stake amount was not updated during ${timeout / 1000} seconds and equals to ${startStakeValue} VLX.`)
      return await this.validator.getStakeValue();
    },

    notStaked: {
      stakeButton: this.page.locator('#on-click-stake'),
    },
    staked: {
      stakeMoreButton: this.page.locator('#on-click-stake-more'),
      requestWithdrawButton: this.page.locator('#on-click-request'),
    },

    /**
     * Refreshes the validator data including your stake data
     */
    reload: async (): Promise<void> => {
      await this.page.locator('[data-testid="CachedIcon"]').click();
      await this.page.locator('.button-block-style').waitFor();
    },
    tab: {
      stake: this.page.locator('#tab-stake'),
      withdrawals: this.page.locator('#tab-withdrawals'),
      rewards: this.page.locator('#tab-rewards'),
    },
    rewards: {
      rewardItem: this.page.locator('#reward-item'),
      epochNumber: this.page.locator('#reward-item div').first(),
    },
    withdrawals: {
      withdrawButton: this.page.locator('#withdraw'),
    }
  }

  stakeForm = {
    amountInput: this.page.locator('#filled-adornment-amount'),
    useMaxButton: this.page.locator('#on-click-max'),
    nextButton: this.page.locator('"Next"'),
    confirmButton: this.page.locator('"Confirm"'),
    okButton: this.page.locator('"Ok"'),
    successfulWithdrawMessage: this.page.locator('"Withdrawal has been submitted successfully"'),
    withdrawButton: this.page.locator('#withdraw'),
    _availableForStaking: this.page.locator('#standard-weight-helper-text'),

    getAvailableForStakingAmount: async (): Promise<number> => {
      const textContainingAvailableForStakingAmount = await this.stakeForm._availableForStaking.textContent();
      if (!textContainingAvailableForStakingAmount) throw new Error(`Cannot find available for staking amount hint`);
      return Number(textContainingAvailableForStakingAmount.replace(/[^0-9.]/g, ""));
    }
  }

  cleanup = async (): Promise<void> => {
    // withdraw stake in case we have active one
    if (await this.validatorsList.stakedValidatorsAmountIsVisible(1)) {
      await this.validatorsList.validator.first().click();
      await this.validator.staked.stakeMoreButton.waitFor();

      // request withdraw if relevant
      if (await this.validator.staked.requestWithdrawButton.isVisible()) {
        await this.validator.staked.requestWithdrawButton.click();
        await this.stakeForm.useMaxButton.click();
        await this.stakeForm.withdrawButton.click();
        await this.stakeForm.successfulWithdrawMessage.waitFor({ timeout: 15000 });
        await this.stakeForm.okButton.click();
      }

      // final withdrawal
      await this.validator.tab.withdrawals.click();
      await this.validator.withdrawals.withdrawButton.click();
      await this.stakeForm.successfulWithdrawMessage.waitFor();
    }
  }

}
