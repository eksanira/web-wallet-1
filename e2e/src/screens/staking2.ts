import { Locator } from '@playwright/test';
import { velasNative } from '@velas/velas-chain-test-wrapper/lib/velas-native';
import { Page } from '../common-test-exports';
import { helpers } from '../tools/helpers';
import { log } from '../tools/logger';
import { BaseScreen } from './base';

type Stake = 'Delegate' | 'Undelegate' | 'Withdraw';

export class Staking2Screen extends BaseScreen {
  constructor(public page: Page) {
    super(page);
  }

  waitForLoaded = async (): Promise<void> => {
    await this.validatorsList.loader.waitFor({ state: 'detached' });
  }

  validatorsList = {
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

    searchButton: this.page.locator(''),
    search: async (text: string) => {
      await this.page.type('input[type="search"]:text("Search..")', text);
      // todo
    },

    validator: this.page.locator('#on-click-validator'),

    stakedValidatorsAmountIsVisible: async (amount: number): Promise<boolean> => {
      return await this.page.locator(`"Staked Validators (${amount})"`).isVisible();
    }
  }

  validator = {
    copyAddress: async (): Promise<string> => {
      await this.page.locator('[data-testid="ContentCopyIcon"]').click();
      const copiedAddress = await this.page.evaluate(async () => await navigator.clipboard.readText());
      log.info(`Clipboard: ${copiedAddress}`);
      return copiedAddress;
    },
    notStaked: {
      stakeButton: this.page.locator('#on-click-stake'),
    },
    staked: {
      stakeMoreButton: this.page.locator('#on-click-stake-more'),
      requestWithdrawButton: this.page.locator('#on-click-request'),
    },
    refresh: this.page.locator('[data-testid="CachedIcon"]'),
  }

  stakeForm = {
    amountInput: this.page.locator('#filled-adornment-amount'),
    useMaxButton: this.page.locator('#on-click-max'),
    nextButton: this.page.locator('"Next"'),
    confirmButton: this.page.locator('"Confirm"'),
    okButton: this.page.locator('"Ok"'),
  }

  async refreshStakes() {
    const refreshStakesButton = this.page.locator('.balance .button.lock');
    await refreshStakesButton.click();
  }

}
