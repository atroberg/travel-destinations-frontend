var frontpageTemplate = require('../templates/frontpage.hbs');

var Frontpage = {

  init: function($frontpage) {
    this.$frontpage = $frontpage;
    this.updateView();

    $frontpage.on('tap', '#frontpage_tabs_menu li', function(e) {
      Frontpage.focusToTab($(this).index());
    });
  },

  updateView: function() {
    var html = frontpageTemplate({

    });
    this.$frontpage.html(html);
  },

  focusToTab: function(index) {
    this.$frontpage.find('#frontpage_tabs_menu li.active').removeClass('active');
    this.$frontpage.find('#frontpage_tabs_menu li:eq(' + index + ')').addClass('active');

    var tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;
    var xpos = -(100 / tabCount * index) + '%';
    this.$frontpage.find('#frontpage_tabs').css('transform', 'translate3d(' + xpos + ',0,0)');
  },

};

module.exports = Frontpage;
