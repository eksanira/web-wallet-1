import { Locator } from '@playwright/test';
import { velasNative } from '@velas/velas-chain-test-wrapper/lib/velas-native';
import { helpers } from '../tools/helpers';
import { log } from '../tools/logger';
import { Page } from '../common-test-exports';
import { BaseScreen } from './base';

type Stake = 'Delegate' | 'Undelegate' | 'Withdraw';

export class StakingScreen extends BaseScreen {
  constructor(public page: Page) {
    super(page);
  }

  accounts = {
    delegateButton: this.page.locator('#staking-accounts tr.inactive span:text(" Delegate")'),
    delegateButtonSecond: this.page.locator(':nth-match(#staking-accounts tr.inactive span:text(" Delegate"), 2)'),
    undelegateButton: this.page.locator('#staking-accounts button:not([disabled]).action-undelegate span:text(" Undelegate")'),
    withdrawButton: this.page.locator('#staking-accounts tr.loading button:not([disabled]) span:text(" Withdraw")'),
    loading: this.page.locator('#staking-accounts .entities-loader'),
    stakerAddress: this.page.locator('#staking-accounts [datacolumn="Staker Address"]'),

    emptyListSelector: '#staking-accounts .amount:text(" (0) ")',

    clickWithdraw: async (): Promise<void> => {
      try {
        await this.accounts.withdrawButton.click();
      } catch (e) {
        throw new Error(`No stakes available to withdraw. Please undelegate first\n${e}`);
      }
    },
    delegate: async (): Promise<void> => {
      try {
        this.accounts.delegateButton.click();
      } catch (e) {
        throw new Error(`No stakes available to delegate. Please undelegate first\n${e}`);
      }
    }
  };

  stakeAccount = {
    withdrawButton: this.page.locator('button span:text(" Withdraw")'),
    splitButton: this.page.locator('button.action-split'),
  };

  validatorsList = {
    validator: {
      icon: this.page.locator('.validator-item .identicon'),
      browse: this.page.locator('.validator-item .browse'),
      copy: this.page.locator('.validator-item .copy'),
      myStakes: this.page.locator('.validator-item .with-stake'),
    },
  };

  createStakingAccountButton = this.page.locator('#create-staking-account button span:text(" Create Account")');

  createStakingAccountForm = {
    amount: this.page.locator('.input-area input'),
  };

  delegateTo = {
    selectValidator: this.page.locator('.select-validators-list button.btn'),
  };

  async waitForLoaded(): Promise<void> {
    try {
      const pageLoaderSelector = '.loading-pulse';
      while (await this.page.isVisible(pageLoaderSelector)) {
        await this.page.waitForTimeout(100);
      }
      const loadingSelector = '#staking-accounts .entities-loader';
      while (await this.page.isVisible(loadingSelector)) {
        await this.page.waitForTimeout(100);
      }
    } catch (e) {
      log.debug('No loading after opening staking. Looks like it\'s already fully loaded.');
    }

    // wait staking account item or make sure there are no accounts
    await this.page.waitForSelector(`#staking-accounts [datacolumn="Staker Address"], ${this.accounts.emptyListSelector}`);
    await this.page.waitForTimeout(500);
  }

  async waitForSplitedStakeToAppear(timeout = 30000): Promise<void> {
    const startTime = new Date().getTime();
    while (! await this.accounts.delegateButtonSecond.isVisible() && new Date().getTime() - startTime < timeout) {
      await this.page.waitForTimeout(1000);
      await this.refresh();
    }
    if (!await this.accounts.delegateButtonSecond.isVisible()) throw new Error(`Splited account does not appear within ${timeout} seconds`);
  }



  async waitForStakesAmountUpdated(params: { initialStakesAmount: number, stakeType?: Stake | 'all', timeout?: number }): Promise<number> {
    const initialStakesAmount = params.initialStakesAmount;
    const stakeType = params.stakeType || 'all';
    const timeout = params.timeout || 30000;

    let finalAmountOfStakingAccounts = await this.getAmountOfStakes(stakeType);
    let startTime = new Date().getTime();
    while (finalAmountOfStakingAccounts === initialStakesAmount) {
      log.debug(`Amount of stake accounts still the same - ${finalAmountOfStakingAccounts}. Wait and refresh the staking data...`);
      await this.page.waitForTimeout(2000);
      await this.refresh();
      finalAmountOfStakingAccounts = await this.getAmountOfStakes(stakeType);
      if (startTime - new Date().getTime() >= timeout) {
        throw new Error(`You expected "${stakeType}" stakes amount to be changed. But no changes during 30 sec. Initial and final "${stakeType}" stakes amount: ${initialStakesAmount}.`);
      }
    }
    return finalAmountOfStakingAccounts;
  }

  async refresh(): Promise<void> {
    await this.page.click('[title="refresh"]');
    await this.waitForLoaded();
  }

  async getFirstStakingAccountAddressFromTheList(type: Stake): Promise<string> {
    await this.waitForLoaded();
    const accountsElementsList = await this.page.$$('#staking-accounts tr');
    const errorText = `No accounts in the list of required type – "${type}"`;

    for (let i = 0; i < accountsElementsList.length; i++) {
      const accountElement = accountsElementsList[i];
      let buttonText: string;

      switch (type) {
        case 'Delegate':
          buttonText = 'Delegate';
          break;
        case 'Undelegate':
          buttonText = 'Undelegate';
          break;
        case 'Withdraw':
          buttonText = 'Withdraw';
          break;
      }

      if (await accountElement.$(`span:text("${buttonText}")`)) {
        const accountAddress = await (await accountElement.$('td[title]'))?.getAttribute('title');
        if (typeof accountAddress !== 'string') throw new Error(errorText);
        return accountAddress;
      }
    }
    throw new Error(errorText);
  }

  async clickUndelegate(): Promise<void> {
    try {
      await this.accounts.undelegateButton.click();
    } catch (e) {
      throw new Error(`No stakes available to undelegate. Please delegate first\n${e}`);
    }
  }

  async getAmountOfStakes(type: Stake | 'all'): Promise<number> {
    await this.waitForLoaded();
    if (type === 'all') return await this.accounts.stakerAddress.count();
    let stakeItemSelector: Locator;
    switch (type) {
      case 'Delegate':
        stakeItemSelector = this.accounts.delegateButton;
        break;
      case 'Undelegate':
        stakeItemSelector = this.accounts.undelegateButton;
        break;
      case 'Withdraw':
        stakeItemSelector = this.accounts.withdrawButton;
        break;
    }
    return await stakeItemSelector.count();
  }

  async getStakingAccountsAddresses(): Promise<string[]> {
    await this.waitForLoaded();
    // const stakesAccountsElements = await this.page.$$(this.stakingAccountAddress);
    const stakesAccountsElements = await this.accounts.stakerAddress.elementHandles();
    const stakingAccountAddresses = await Promise.all(
      stakesAccountsElements.map(async (el) => await el.getAttribute('title') as string),
    );
    return stakingAccountAddresses;
  }

  /**
   * Function requires only initial stake accounts addresses list. Final list could be passed or will be got during function invocation.
   * Returns difference between states with specifying if stake account was added or removed from stake accounts list
   *
   * @param initialAccountsList
   * @param finalAccountsList
   * @return added or removed accounts list
   */
  async getStakingAccountsUpdate(initialAccountsAddressesList: string[], currentAccountsAddressesList?: string[]): Promise<{
    added?: string,
    removed?: string,
  } | null> {
    currentAccountsAddressesList = currentAccountsAddressesList || await this.getStakingAccountsAddresses();
    log.error(currentAccountsAddressesList);
    const diff = helpers.getArraysDiff(initialAccountsAddressesList, currentAccountsAddressesList);
    log.debug(`This is log of getStakingAccountsUpdate function
    initialAccountsAddressesList:
    ${initialAccountsAddressesList};
    finalAccountsAddressesList:
    ${currentAccountsAddressesList};
    diff: ${diff}`);
    if (diff.length === 0) return null;
    return currentAccountsAddressesList.length > initialAccountsAddressesList.length ? { added: diff[0] } : { removed: diff[0] };
  }

  async selectAccount(type: Stake): Promise<void> {
    // "loading" classname corresponds to Undelegate and Withdraw stakes
    const selector = `#staking-accounts tr.${type === 'Delegate' ? 'inactive' : 'loading'} .inner-address-holder div a`;
    await this.page.click(selector);
  }

  async selectAccountByAddress(address: string): Promise<void> {
    await this.waitForLoaded();
    const accountsElementsList = await this.page.$$('#staking-accounts tr');

    for (let i = 0; i < accountsElementsList.length; i++) {
      const accountElement = accountsElementsList[i];

      const accountAddress = await (await accountElement.$('td[title]'))?.getAttribute('title');
      if (typeof accountAddress !== 'string') throw new Error(`Invalid account address: "${accountAddress}"`);
      if (accountAddress === address) {
        await this.page.click(`#staking-accounts tr [title="${address}"] .inner-address-holder`);
        return;
      }
    }

    const stakingAccountsAddresses = await this.getStakingAccountsAddresses();
    throw new Error(`No staking accounts with address ${address} in the staking accounts list.
    Available adresses:
    ${stakingAccountsAddresses}`);
  }

  async makeSureStakingAccIsCreatedAndNotDelegated(address: string): Promise<void> {
    try {
      await velasNative.getStakeAccount(address);
    } catch (error) {
      log.debug('This is expected error. Please ignore:', error);
      if (!(error instanceof Error)) {
        throw new Error(`Cannot parse error: ${error}`);
      }
      if (!error.toString().includes('stake account has not been delegated')) {
        throw new Error(`Something is wrong with staking account on blockchain:\n${error}`);
      }
    }
    log.info(`Newly added staking account: ${address}`);
  }

  async makeSureStakingAccountDoesNotExistOnBlockchain(address: string): Promise<void> {
    try {
      await velasNative.getStakeAccount(address);
    } catch (error: unknown) {
      log.debug('This is expected error. Please ignore:', error);
      if (!(error instanceof Error)) {
        throw new Error(`Cannot parse error: ${error}`);
      }
      if (!error.toString().includes('account not found')) {
        throw new Error(`Staking account still exist but should not. Error:\n${error}`);
      }
    }
    log.info(`Withdrawed staking account: ${address}`);
  }

  cleanup = {
    stakesToUndelegate: async () => {
      let toUndelegateStakesAmount = await this.getAmountOfStakes('Undelegate');
      while (toUndelegateStakesAmount > 0) {
        log.debug(`There are ${toUndelegateStakesAmount} delegated stakes to be undelegate as precondition`);
        await this.clickUndelegate();
        await this.modals.confirmPrompt();
        await this.page.waitForSelector('" Funds undelegated successfully"');
        await this.modals.clickOK();
        await this.waitForLoaded();
        toUndelegateStakesAmount = await this.getAmountOfStakes('Undelegate');
      }
      while (toUndelegateStakesAmount !== 0) {
        await this.page.waitForTimeout(1000);
        this.refresh();
        log.debug('Amount of staking accounts hasn\'t changed, refreshing...');
        toUndelegateStakesAmount = await this.getAmountOfStakes('Undelegate');
      }
    },
    stakesToWithdraw: async () => {
      let toWithdrawStakesAmount = await this.getAmountOfStakes('Withdraw');
      while (toWithdrawStakesAmount > 0) {
        log.debug(`There are ${toWithdrawStakesAmount} stakes to be withdrawn as precondition`);
        await this.accounts.clickWithdraw();
        await this.modals.confirmPrompt();
        await this.page.waitForSelector('" Funds withdrawn successfully"', { timeout: 30000 });
        await this.modals.clickOK();
        await this.waitForLoaded();
        toWithdrawStakesAmount = await this.getAmountOfStakes('Withdraw');
      }
      while (toWithdrawStakesAmount !== 0) {
        await this.page.waitForTimeout(1000);
        this.refresh();
        log.debug('Amount of staking accounts hasn\'t changed, refreshing...');
        toWithdrawStakesAmount = await this.getAmountOfStakes('Withdraw');
      }
    },

    stakesNotDelegated: async () => {
      let notDelegatedStakesAmount = await this.getAmountOfStakes('Delegate');
      while (notDelegatedStakesAmount > 0) {
        log.debug(`There are ${notDelegatedStakesAmount} not delegated stakes to be withdrawn as precondition`);
        await this.selectAccount('Delegate');
        await this.stakeAccount.withdrawButton.click();
        await this.modals.confirmPrompt();
        await this.page.waitForSelector('" Funds withdrawn successfully"', { timeout: 30000 });
        await this.page.click('" Ok"');
        await this.waitForLoaded();
        const previousNotDelegatedStakesAmount = notDelegatedStakesAmount;
        notDelegatedStakesAmount = await this.getAmountOfStakes('Delegate');
        while (previousNotDelegatedStakesAmount === notDelegatedStakesAmount) {
          await this.page.waitForTimeout(1000);
          this.refresh();
          log.debug('Amount of staking accounts hasn\'t changed, refreshing...');
          notDelegatedStakesAmount = await this.getAmountOfStakes('Delegate');
        }
      }
    },

  };

  async makeSureUiBalanceEqualsChainBalance(address: string): Promise<void> {
    const initialWalletBalance = helpers.toFixedNumber((await velasNative.getBalance(address)).VLX);
    let uiBalance = (await this.page.innerText('.section .description span')).replace('VLX', '').trim();
    while (initialWalletBalance !== helpers.toFixedNumber(Number(uiBalance))) {
      await this.refresh();
      uiBalance = (await this.page.innerText('.section .description span')).replace('VLX', '').trim();
      log.debug('Balance on UI is not the same as on blockchain, refreshing...');
    }
  }
}
