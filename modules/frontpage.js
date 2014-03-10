var frontpageTemplate = require('../templates/frontpage.hbs');
var settings = require('./settings');
var AppHistory = require('./history');
var Destination = require('./destination');

var Frontpage = {

  init: function($frontpage) {
    this.$frontpage = $frontpage;
    this.updateView();
    this.initSwipeTabs();

    AppHistory.addPopHandler('closeDestination', function() {
      Frontpage.activate();
      Destination.deactivate();
    });
    AppHistory.push({popHandler: 'closeDestination'}, "Frontpage");

    this.$frontpage.on('tap', '.destination', function(e) {
      Frontpage.deactivate();
      var url = $(this).attr('data-url');
      Destination.show(url);
    });
  },

  activate: function() {
    this.$frontpage.removeClass('inactive');
  },

  deactivate: function() {
    this.$frontpage.addClass('inactive');
  },

  updateView: function() {
    var html = frontpageTemplate({

    });
    this.$frontpage.html(html);
  },

  initSwipeTabs: function() {
    this.currentTab = 0;
    this.tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;

    this.$frontpage.on('tap', '#frontpage_tabs_menu li', function(e) {
      Frontpage.focusToTab($(this).index());
    });

    var tabSwitchRequested = false;
    this.$frontpage.on('dragleft dragright', '#frontpage_tabs', function(e) {
      e.gesture.preventDefault();

      if ( !tabSwitchRequested && e.gesture.velocityX > settings.tabSwipeVelocity ) {

        if ( e.gesture.direction === 'left' ) {
          Frontpage.focusToTab(Frontpage.currentTab + 1);
        }
        else {
          Frontpage.focusToTab(Frontpage.currentTab - 1);
        }

        tabSwitchRequested = true;
      }
    })
    .on('dragend', function(e) {
      tabSwitchRequested = false;
    });
  },

  focusToTab: function(index) {
    if ( index < 0) {
      index = 0;
    }
    else if ( index > this.tabCount - 1) {
      index = this.tabCount - 1;
    }

    if ( index === this.currentTab ) return;

    this.$frontpage.find('#frontpage_tabs_menu li.active').removeClass('active');
    this.$frontpage.find('#frontpage_tabs_menu li:eq(' + index + ')').addClass('active');

    var tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;
    var xpos = -(100 / tabCount * index) + '%';
    this.$frontpage.find('#frontpage_tabs').css('transform', 'translate3d(' + xpos + ',0,0)');

    this.currentTab = index;
  },

};

module.exports = Frontpage;
