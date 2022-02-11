import {
  assert, config, data, expect, test, walletURL
} from '../../common-test-exports';
import { AuthScreen, WalletsScreen } from '../../screens';

let auth: AuthScreen;
let wallets: WalletsScreen;

test.describe.parallel('Wallets screen', () => {
  test.beforeEach(async ({ page }) => {
    auth = new AuthScreen(page);
    wallets = new WalletsScreen(page);
    await page.goto(walletURL, { waitUntil: 'networkidle' });
  });

  test.describe('Transactions', () => {
    test('Transactions list is displayed', async () => {
      // arrange
      await auth.loginByRestoringSeed(data.wallets.fundsReceiver.seed);

      await wallets.selectWallet('token-vlx_native');
      await wallets.txHistory.txDetails.first().waitFor({ timeout: 35000 });
      const transactions = await wallets.txHistory.txDetails.elementHandles();
      assert.isAbove(transactions.length, 10, 'Amount of transactions in the list is less than 10');

      const prodSenderAddress = '46LegTMYJ7ZYLftiCv3Ldzzud3dwajrV6S1oonF5wqFV';
      const txDetails = await wallets.txHistory.txDetails.first().elementHandle();
      await txDetails?.waitForSelector(`.address-holder a[href*="https://native.velas.com/address/${config.network === 'mainnet' ? prodSenderAddress : data.wallets.txSender.address}"]`);
    });
  });

  test.describe(' > ', () => {
    test.beforeEach(async () => {
      await auth.loginByRestoringSeed(data.wallets.login.seed);
      await wallets.waitForWalletsDataLoaded();
    });

    test('Lock and unlock', async () => {
      await wallets.lockButton.click();
      await auth.passwordInput.isVisible();
      await expect(wallets.lockButton).toBeVisible();

      await auth.pinForLoggedOutAcc.typeAndConfirm('111222');
      expect(await auth.isLoggedIn()).toBeTruthy();
    });

    test('Add and hide litecoin wallet', async () => {
      // TODO: need to scroll to launch test for mainnet
      // add litecoin
      await wallets.addWalletsPopup.open();
      await wallets.addWalletsPopup.add('token-ltc');
      await wallets.selectWallet('token-ltc');
      expect(await wallets.isWalletInWalletsList('token-ltc')).toBeTruthy();

      // remove litecoin
      await wallets.hideWallet();
      expect(await wallets.isWalletInWalletsList('token-ltc')).toBeFalsy();
    });

    test('Switch account', async ({ page }) => {
      await wallets.selectWallet('token-vlx_native');
      await page.click('.switch-account');
      await page.click('" Account 2"');
      expect(await wallets.getWalletAddress()).toEqual('BfGhk12f68mBGz5hZqm4bDSDaTBFfNZmegppzVcVdGDW');
    });

    test('Show QR', async ({ page }) => {
      await page.hover('.wallet-detailed .address-holder .copy');
      await page.waitForSelector('.qrcode');
    });

    test('Copy wallet address from "Receive" page', async ({ context, page }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      // clear clipboard
      await page.evaluate(async () => await navigator.clipboard.writeText(''));

      await wallets.selectWallet('token-vlx_native');
      await page.click('#wallets-receive');
      await page.waitForSelector('.ill-qr img');
      await wallets.qrCode.waitFor();

      // copy to clipboard
      await wallets.copyToClipboardButton.click();
      const copiedText = await page.evaluate(async () => await navigator.clipboard.readText());
      expect(copiedText).toEqual('G3N4212jLtDNCkfuWuUHsyG2aiwMWQLkeKDETZbo4KG');

      // back to wallets list
      await page.click('" Cancel"');
      await wallets.waitForWalletsDataLoaded();
    });
  });

  test.describe('Add custom tokens: ', () => {
    test.beforeEach(async () => {
      await auth.loginByRestoringSeed(data.wallets.withFunds.seed);
      await wallets.waitForWalletsDataLoaded();
    });

    test('WAG on Velas', async () => {
      await wallets.addCustomToken(data.customTokens.velas.wag, 'Velas', 'testnet');
      const customTokenBalance = await wallets.getCustomTokenBalance('#token-wag_testnet_Velas__custom');
      expect(customTokenBalance).toEqual('1');
    });

    test('WEENUS on Ethereum', async () => {
      await wallets.addCustomToken(data.customTokens.eth.weenus, 'Ethereum', 'testnet');
      const customTokenBalance = await wallets.getCustomTokenBalance('#token-weenus_testnet_Ethereum__custom');
      expect(customTokenBalance).toEqual('2');
    });

    test('DAI on BSC', async () => {
      await wallets.addCustomToken(data.customTokens.bsc.dai, 'BSC', 'testnet');

      const customTokenBalance = await wallets.getCustomTokenBalance('#token-dai_testnet_BSC__custom');
      expect(customTokenBalance).toEqual('3');
    });

    test('DAI on Heco', async () => {
      await wallets.addCustomToken(data.customTokens.heco.dai, 'Heco', 'testnet');

      const customTokenBalance = await wallets.getCustomTokenBalance('#token-dai_testnet_Heco__custom');
      expect(customTokenBalance).toEqual('4');
    });
  });
});
