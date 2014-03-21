var settings = require('./settings');
var Analytics = require('./analytics');

var DestinationTabs = {

  init: function() {
    this.clearCache();
    this.currentTab = 0;
    this.initEventHandlers();
  },

  initEventHandlers: function() {
    this.$container.on('tap', 'nav #tabs_menu li', function(e) {
      DestinationTabs.focusToTab($(this).index());
    });
    this.$container.on('dragleft dragright', function(e) {
      // Need to prevent default behavior in order
      // to make swipe gestures to be sensitive enough
      e.gesture.preventDefault();
    })
    .on('swiperight', function(e) {
      $target = $(e.target);
      if ( $target.is('nav') || $target.parents('nav').length > 0 ) {
        return;
      }

      DestinationTabs.prevTab();
    })
    .on('swipeleft', function(e) {
      $target = $(e.target);
      if ( $target.is('nav') || $target.parents('nav').length > 0 ) {
        return;
      }

      DestinationTabs.nextTab();
    });


    // Scrolling for tab menu (if all links don't fit on screen)
    var overflowInfo = {
      maxDelta: 0,
      startOffset: 0,
      allLinksFitOnScreen: true,
    };

    this.$container.on('dragstart', '#tabs_menu', function(e) {
      overflowInfo = DestinationTabs.menu.getOverflowInfo($(this));
    })

    .on('dragleft dragright', '#tabs_menu', function(e) {

      e.gesture.preventDefault();
      e.gesture.stopPropagation();

      var deltaX = e.gesture.deltaX;
      var $ul = $(this);

      if ( overflowInfo.allLinksFitOnScreen ) {
        var newPos = 0;
      }

      else {
        var newPos = overflowInfo.startOffset + deltaX;

        if ( newPos < overflowInfo.maxDelta + overflowInfo.startOffset ) {
          newPos = overflowInfo.maxDelta + overflowInfo.startOffset;
        }
        else if ( newPos > 0 ) {
          newPos = 0;
        }
      }

      $ul.css('transform', 'translate3d(' + newPos + 'px,0,0)');
    });
  },

  menu: {
    getOverflowInfo: function($el) {
      var startOffset = $el.offset().left;
      var $lastLi = $el.find('li:last');
      var $firstLi = $el.find('li:first');

      var maxDelta = $lastLi.offset().left + $lastLi.outerWidth() - $(window).width();
      var overflowWidth = -startOffset + maxDelta;
      var allLinksFitOnScreen = overflowWidth <= 0;

      return {
        startOffset: startOffset,
        maxDelta: -maxDelta,
        allLinksFitOnScreen: allLinksFitOnScreen,
        overflowWidth: overflowWidth,
      };
    }
  },

  setDestinationObject: function(Destination) {
    this.Destination = Destination;
  },

  setElement: function setElement($el) {
    this.$container = $el;
  },

  tabFunctions: {},

  bindTabFunction: function(tab, f) {
    this.tabFunctions[tab] = f;
  },

  // Save tab contents in cache, so that
  // we don't need to rebuild the tab each
  // time we refocus to it
  htmlCache: {},

  clearCache: function clearCache() {
    this.htmlCache = {};
  },

  focusToTab: function focusToTab(index, options) {
    options = options || {};

    $menu = this.$container.find('nav #tabs_menu');
    $viewport = this.$container.find('#destination_tabs');
    var tabCount = $menu.find('li').length;

    if ( index > tabCount - 1 )
      index = tabCount - 1;
    else if ( index < 0 )
      index = 0;

    var value = 100 / tabCount * index;
    $viewport.css('transform', 'translate3d(' + (-value) + '%,0,0)');

    // Move tab links in case they don't fully fit the viewport
    var overflowInfo = DestinationTabs.menu.getOverflowInfo($menu);
    if ( !overflowInfo.allLinksFitOnScreen ) {

      var moveX = overflowInfo.overflowWidth / (tabCount - 1) * index;

      $menu.addClass('animate');
      $menu.css('transform', 'translate3d(' + (-moveX) + 'px,0,0)');
      setTimeout(function() {
        $menu.removeClass('animate');
      }, settings.animationDurations.tabs);
    }

    if ( index !== this.currentTab || options.forceRefresh ) {

      $menu.find('.active').removeClass('active');
      $menu.find('li:eq(' + index + ')').addClass('active');

      var $prevTab = $viewport.find('.tab:eq(' + this.currentTab + ')');

      // If not retrying to load the same tab
      if ( this.currentTab !== index && $prevTab.find('> .tabNotLoaded, > .ajaxError').length === 0 ) {
        this.htmlCache[this.currentTab] = $prevTab.html();

        // Delete contents only after animation is complete
        setTimeout(function() {
          $prevTab.html('');
        }, settings.animationDurations.tabs);
      }

      var $nextTab = $viewport.find('.tab:eq(' + index + ')');

      if ( !options.forceRefresh || options.forceAnalyticsTrack ) {
        var analyticsURI = DestinationTabs.Destination.destination.uri + '/' + $nextTab.attr('data-tab-function');
        Analytics.trackPage(analyticsURI);
      }

      if ( this.htmlCache[index] ) {
        // Need to delay DOM manipulation
        // until animation is done, because DOM
        // manipulation is expensive and thus makes
        // animation unresponsive
        setTimeout(function() {
          $nextTab.html(DestinationTabs.htmlCache[index]);
        }, settings.animationDurations.tabs);
      }

      else {
        // Remove event listeners
        $nextTab.off();

        // Show loading
        $nextTab.html('<p class="ajax_loading"><i class="ajax_spinner fa fa-spinner fa-spin"></i></p>');

        try {
          this.tabFunctions[$nextTab.attr('data-tab-function')]($nextTab);
        }
        catch(e) {
          console.error(e);
        }
      }

      this.currentTab = index;
    }

  },

  nextTab: function() {
    this.focusToTab(this.currentTab + 1);
  },

  prevTab: function() {
    this.focusToTab(this.currentTab - 1);
  },

};

module.exports = DestinationTabs;
