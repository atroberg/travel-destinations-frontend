var settings = require('./settings');

var DestinationTabs = {

  init: function() {
    this.clearCache();
    this.currentTab = 0;
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

    if ( index !== this.currentTab || options.forceRefresh ) {

      $menu.find('.active').removeClass('active');
      $menu.find('li:eq(' + index + ')').addClass('active');

      var $prevTab = $viewport.find('.tab:eq(' + this.currentTab + ')');

      // If not retrying to load the same tab
      if ( this.currentTab !== index && $prevTab.hasClass('loadingFailed') === false ) {
        this.htmlCache[this.currentTab] = $prevTab.html();

        // Delete contents only after animation is complete
        setTimeout(function() {
          $prevTab.html('');
        }, settings.animationDurations.tabs);
      }

      var $nextTab = $viewport.find('.tab:eq(' + index + ')');

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

        try {
          // Clear possible event listeners
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
