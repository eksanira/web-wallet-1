import { Page } from '../common-test-exports';
import { BaseScreen } from './base';

export class SearchScreen extends BaseScreen {
  constructor(public page: Page) {
    super(page);
  }

  dapps = this.page.locator('[placeholder="dapps"]');
}
