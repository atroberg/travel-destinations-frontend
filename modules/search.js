var Search = {

  init: function(options) {
    this.$el = options.$el;

    this.$el.on('focus', 'input', function(e) {
      e.stopPropagation();
      Search.input.activate();
    });

    this.$el.find('input').on('blur', function(e) {
      e.stopPropagation();
      Search.input.deactivate();
    });

    // If window size changes, it's probably because
    // keyboard was closen => deactivate input
    var windowHeight = $(window).height();
    $(window).on('resize', function(e) {
      if ( Search.input.isActive && windowHeight < $(window).height() ) {
        Search.$el.find('input').blur();
      }
      windowHeight = $(window).height();
    });
  },

  input: {
    activate: function() {
      Search.$el.addClass('active');
      this.isActive = true;
    },

    deactivate: function() {
      console.log("dfsd");
      Search.$el.removeClass('active');
      this.isActive = false;
    },
  }

};

module.exports = Search;
