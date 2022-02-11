import { AuthScreen } from '../../screens';
import { expect, test, walletURL } from '../../common-test-exports';
import { log } from '../../tools/logger';

test.describe('Links', () => {
  let auth: AuthScreen;

  test.beforeEach(async ({ page }) => {
    await page.goto(walletURL, { waitUntil: 'networkidle' });
    auth = new AuthScreen(page);
  });

  test('Download links are correct', async ({ page }) => {
    const appleLink = await auth.downloadButtons.iOS.getAttribute('href');
    const androidLink = await auth.downloadButtons.android.getAttribute('href');
    expect(appleLink).toContain('https://apps.apple.com/');
    expect(androidLink).toContain('https://play.google.com/');

    await auth.downloadButtons.desktop.click();
    await auth.installWallets.platformsList.waitFor();
    await page.waitForSelector('.platforms');

    const donwloadLinks = await page.$$('a');
    for (let i = 0; i < donwloadLinks.length; i++) {
      const linkElement = donwloadLinks[i];
      const downloadLink = await linkElement.getAttribute('href');
      expect(downloadLink).toContain('https://github.com/velas/JsWalletDesktop');
      log.debug(`Desktop download link: ${await linkElement.textContent()}`);
    }
  });
});
