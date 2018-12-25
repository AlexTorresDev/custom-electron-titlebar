'use strict';

const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const electron = require('electron');
const { Application } = require('spectron');

chai.use(chaiAsPromised);
chai.should();

const applicationPath = path.join(__dirname, '../example', 'main.js');

describe('application launch', () => {
  beforeEach((done) => {
    this.app = new Application({
      path: electron,
      args:[ applicationPath ]
    });
    done();
    return this.app.start();
  });

  beforeEach(() => {
    chaiAsPromised.transferPromiseness = this.app.transferPromiseness;
  });

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('opens a window', (done) => {
    done();
    return this.app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(1)
      .browserWindow.isMinimized().should.eventually.be.false
      .browserWindow.isDevToolsOpened().should.eventually.be.false
      .browserWindow.isVisible().should.eventually.be.true
      .browserWindow.isFocused().should.eventually.be.true
      .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
      .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0);
  });
});