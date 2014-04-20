'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('my app', function() {

  browser.get('/app/index.html');

  it('should automatically redirect to /population when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/population");
  });


  describe('population', function() {

    it('should render view when user navigates to #/view/0', function() {
        browser.get('/app/index.html#/population');
        browser.get('#/view/0');
        expect(browser.getLocationAbsUrl()).toMatch("/view/0");
    });

    it('should return to population after propagating', function() {
        browser.get('/app/index.html');
        element.all(by.className('propagate')).first().click();
        expect(browser.getLocationAbsUrl()).toMatch("/population");
    });

    it('should be 1 after load', function() {
        browser.get('/app/index.html');
        element.all(by.className('propagate')).then(
            function(elems) { expect(elems.length).toEqual(1); },
            function() { expect(0).toEqual(1); }
        );
    });

    it('should be 8 after propapage', function() {
        browser.get('/app/index.html');
        element.all(by.className('propagate')).first().click();
        element.all(by.className('propagate')).then(
            function(elems) { expect(elems.length).toEqual(8); },
            function() { expect(0).toEqual(1); }
        );
    });

    it('should have no lineage after load', function() {
        browser.get('/app/index.html');
        element.all(by.className('ancestor')).then(
            function(elems) { expect(elems.length).toEqual(0); },
            function() { expect(0).toEqual(1); }
        );
    });

    it('should have 1 ancestor in lineage after propagate', function() {
        browser.get('/app/index.html');
        element.all(by.className('propagate')).first().click();
        element.all(by.className('ancestor')).then(
            function(elems) { expect(elems.length).toEqual(1); },
            function() { expect(0).toEqual(1); }
        );
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
