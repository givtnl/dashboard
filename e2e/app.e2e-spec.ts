import { GivtPlatformPage } from './app.po';

describe('givtplatform App', () => {
  let page: GivtPlatformPage;

  beforeEach(() => {
    page = new GivtPlatformPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
