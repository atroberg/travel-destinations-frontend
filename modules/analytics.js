var settings = require('./settings');

var Analytics = {

  init: function() {
    this.tracker = window.plugins.gaPlugin;
    this.tracker.init(this.successHandler, this.errorHandler, settings.analytics.id, settings.analytics.minDelayBetweenUpdate);
  },

  successHandler: function(msg) {
    // Do nothing
    // console.log(msg);
  },

  errorHandler: function(msg) {
    // console.error(msg);
    // Do nothing
  },

  trackPage: function(path) {
    // console.log('trackPage', path);
    try {
      this.tracker.trackPage(this.successHandler, this.errorHandler, path);
    }
    catch(e) {
      // do nothing
    }
  },

  trackEvent: function(category, eventAction, eventLabel) {
    // console.log(category, eventAction, eventLabel);
    try {
      this.tracker.trackEvent(this.successHandler, this.errorHandler, category, eventAction, eventLabel, 1);
    }
    catch(e) {
      // do nothing
    }
  }

};

module.exports = Analytics;
