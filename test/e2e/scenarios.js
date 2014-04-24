'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('my app', function() {

  browser.get('/app/index.html');

  it('should default to /population', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/population");
  });


  describe('The population template', function() {

    it('should allow navigation to individual view', function() {
        browser.get('/app/index.html#/population');
        browser.get('#/view/0');
        expect(browser.getLocationAbsUrl()).toMatch("/view/0");
        
        // TODO What's a better way to do this?
        element.all(by.className('individual-template')).first().then(
            function(elem) { expect(1).toEqual(1); },
            function() { expect(0).toEqual(1); }
        );
    });

    it('should remain visible after propagating', function() {
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

    it('should be 8 after propapate', function() {
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


  xdescribe('view', function() {

    beforeEach(function() {
      browser.get('index.html#/view/0');
    });


    it('should render view when user navigates to /view/0', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
