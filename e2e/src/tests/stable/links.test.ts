import { AuthScreen } from '../../screens';
import { assert, test, walletURL } from '../../common-test-exports';

test.describe('Links', () => {
  let auth: AuthScreen;

  test.beforeEach(async ({ page }) => {
    await page.goto(walletURL, { waitUntil: 'networkidle' });
    auth = new AuthScreen(page);
  });

  test('Download links are correct', async ({ page }) => {
    const appleLink = await auth.downloadButtons.iOS.getAttribute('href');
    const androidLink = await auth.downloadButtons.android.getAttribute('href');
    assert.isTrue(appleLink?.includes('https://apps.apple.com/'));
    assert.isTrue(androidLink?.includes('https://play.google.com/'));

    await auth.downloadButtons.desktop.click();
    await auth.installWallets.platformsList.waitFor();
    await page.waitForSelector('.platforms');

    const donwloadLinks = await page.$$('a');
    for (let i = 0; i < donwloadLinks.length; i++) {
      const linkElement = donwloadLinks[i];
      const downloadLink = await linkElement.getAttribute('href');
      assert.isTrue(downloadLink?.includes('https://github.com/velas/JsWalletDesktop'), `${await linkElement.textContent()} doesn't lead to correct destination`);
    }
  });
});
