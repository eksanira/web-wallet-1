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

  validatorsList = {
    epochInfoButton: this.page.locator(''),
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
      await this.validatorsList.waitForLoaded();
    },

    searchButton: this.page.locator(''),
    search: async (text: string) => {
      await this.page.type('input[type="search"]:text("Search..")', text);
      // todo
    },

    waitForLoaded: async (): Promise<void> => {
      await this.validatorsList.loader.waitFor({ state: 'detached' });
    },
  }

  validator = {
    stakeButton: this.page.locator('.button-block-style-btn-green:text("Stake")')
  }

  async refreshStakes() {
    const refreshStakesButton = this.page.locator('.balance .button.lock');
    await refreshStakesButton.click();
  }

}
