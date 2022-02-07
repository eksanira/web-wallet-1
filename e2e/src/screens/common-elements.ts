import { Page } from '../common-test-exports';
import { BaseScreen } from './base';

export class CommonElements extends BaseScreen {
  constructor(public page: Page) {
    super(page);
  }
}
