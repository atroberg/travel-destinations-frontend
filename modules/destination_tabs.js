var settings = require('./settings');

var DestinationTabs = {

  setElement: function setElement($el) {
    this.$container = $el;
  },

  tabFunctions: {},

  bindTabFunction: function(tab, f) {
    this.tabFunctions[tab] = f;
  },

  htmlCache: {},

  clearCache: function clearCache() {
    this.htmlCache = {};
  },

  currentTab: 0,

  focusToTab: function focusToTab(index) {

    $menu = this.$container.find('nav #tabs_menu');
    $viewport = this.$container.find('#destination_tabs');
    var tabCount = $menu.find('li').length;

    if ( index > tabCount - 1 )
      index = tabCount - 1;
    else if ( index < 0 )
      index = 0;

    var value = 100 / tabCount * index;
    $viewport.css('transform', 'translate3d(' + (-value) + '%,0,0)');

    if ( index !== this.currentTab ) {
        $menu.find('.active').removeClass('active');
        $menu.find('li:eq(' + index + ')').addClass('active');

        var $prevTab = $viewport.find('.tab:eq(' + this.currentTab + ')');
        this.htmlCache[this.currentTab] = $prevTab.html();

        // Delete contents only after animation is complete
        setTimeout(function() {
          $prevTab.html('');
        }, settings.animationDurations.tabs);

        if ( this.htmlCache[index] ) {
          var $nextTab = $viewport.find('.tab:eq(' + index + ')');
          $nextTab.html(this.htmlCache[index]);
        }

        else {
          var $targetTab = $viewport.find('> .tab:eq(' + index + ')');

          try {
            this.tabFunctions[$targetTab.attr('data-tab-function')]($targetTab);
          }
          catch(e) {
            console.log(e);
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
