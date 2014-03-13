var frontpageTemplate = require('../../templates/frontpage.hbs');

var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');
var SavedPages = require('./saved_pages');
var Search = require('../search');


var Frontpage = {

  init: function($frontpage) {
    this.$frontpage = $frontpage;
    this.updateView();
    this.menu.init();
    this.initSwipeTabs();
    this.initSearch();

    this.$frontpage.on('tap', '.destination', function(e) {
      Destination.openDestination($(this).attr('data-url'));
    });
  },

  openDestination: function(url) {
    AppHistory.addPopHandler('closeDestination', function() {
      Frontpage.activate();
      Destination.deactivate();
    });

    AppHistory.push({popHandler: 'closeDestination'}, 'Frontpage', {shortcut: 'closeDestination'});

    Frontpage.deactivate();
    Destination.show(url);
  },

  initSearch: function() {
    Search.init({
      $el: this.$frontpage.find('.searchInput'),
      Frontpage: Frontpage,
    });
  },

  activate: function() {
    this.$frontpage.removeClass('inactive');
  },

  deactivate: function() {
    setTimeout(function() {
      Frontpage.$frontpage.addClass('inactive');
    }, settings.animationDurations.page);
  },

  updateView: function() {
    var html = frontpageTemplate({

    });
    this.$frontpage.html(html);
  },

  menu: {
    isVisible: false,

    init: function() {
      Frontpage.$frontpage.on('tap', 'nav .menuBtn', this.show);
      Frontpage.$frontpage.on('touchstart click', '.overlay', function(e) {
        if ( Frontpage.menu.isVisible ) {
          Frontpage.menu.hide();
        }
      });
      this.initActions();
    },

    actions: {
      savedPages: function() {
        Frontpage.menu.hide();
        SavedPages.activate();
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

    show: function() {
      Frontpage.$frontpage.addClass('menuActive');

      // Need timeout, because otherwise menu will immediately
      // hide again (see event binded to .overlay)
      setTimeout(function() {
        Frontpage.menu.isVisible = true;
      }, 200);
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

    this.$frontpage.trobisHammer().on('trobisHammer.swiperight', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab + 1);
    })
    .on('trobisHammer.swipeleft', function(e) {
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
