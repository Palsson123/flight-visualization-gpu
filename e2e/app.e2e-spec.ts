import { FlightVisualizationPage } from './app.po';

describe('flight-visualization App', function() {
  let page: FlightVisualizationPage;

  beforeEach(() => {
    page = new FlightVisualizationPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
