'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('my app', function() {

  browser.get('/app/index.html');

  it('should automatically redirect to /population when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/population");
  });


  describe('population', function() {

    it('should render view when user navigates to #/view/0', function() {
        browser.get('#/view/0');
        expect(browser.getLocationAbsUrl()).toMatch("/view/0");
    });

    it('should return to population after propagating', function() {
        browser.get('#/propagate/0');
        expect(browser.getLocationAbsUrl()).toMatch("/population");
    });

  });


  xdescribe('view2', function() {

    beforeEach(function() {
      browser.get('index.html#/view2');
    });


    it('should render view2 when user navigates to /view2', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
