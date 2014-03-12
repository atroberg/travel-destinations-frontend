var frontpageTemplate = require('../templates/frontpage.hbs');
var settings = require('./settings');
var AppHistory = require('./history');
var Destination = require('./destination');

var Frontpage = {

  init: function($frontpage) {
    this.$frontpage = $frontpage;
    this.updateView();
    this.menu.init();
    this.initSwipeTabs();

    AppHistory.addPopHandler('closeDestination', function() {
      Frontpage.activate();
      Destination.deactivate();
    });

    AppHistory.push({popHandler: 'closeDestination'}, 'Frontpage', {shortcut: 'closeDestination'});

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

  menu: {
    isVisible: false,

    init: function() {
      Frontpage.$frontpage.on('tap', 'nav .menuBtn', this.toggleVisiblity);
      Frontpage.$frontpage.on('touchstart click', '.overlay', function(e) {
        if ( Frontpage.menu.isVisible ) {
          Frontpage.menu.hide();
        }
      });
      this.initActions();
    },

    actions: {
      savedPages: function() {
        console.log("lreom");
      },
      destinationFinder: function() {
        // TODO: will be implemented later
      },
    },

    initActions: function() {
      Frontpage.$frontpage.on('tap', '#drawerMenu i', function(e) {
        var action = $(this).attr('data-action');

        if ( action && Frontpage.menu.actions[action] ) {
          Frontpage.menu.actions[action]();
        }
      });
    },

    toggleVisiblity: function(e) {
      if ( Frontpage.menu.isVisible ) {
        Frontpage.menu.hide();
      }
      else {
        Frontpage.menu.show();
      }
    },

    show: function() {
      Frontpage.$frontpage.addClass('menuActive');

      // Need timeout, because otherwise menu will immediately
      // hide again (see event binded to .overlay)
      setTimeout(function() {
        Frontpage.menu.isVisible = true;
      }, 10);
    },

    hide: function() {
      Frontpage.$frontpage.removeClass('menuActive');
      Frontpage.menu.isVisible = false;
    },
  },

  initSwipeTabs: function() {
    this.currentTab = 0;
    this.tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;

    this.$frontpage.on('tap', '#frontpage_tabs_menu li', function(e) {
      Frontpage.focusToTab($(this).index());
    });

    this.$frontpage.trobisHammer().on('trobisHammer.swiperight', '#frontpage_tabs', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab + 1);
    })
    .on('trobisHammer.swipeleft', '#frontpage_tabs', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab - 1);
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
