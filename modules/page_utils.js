var settings = require('./settings');

var PageUtils = {

  buttonTouchFeedback: function() {
    $('body').on('touchstart', '.touchFeedback', function(e) {
      var $el = $(this);

      setTimeout(function() {
        $el.removeClass('touchdown active');
      }, settings.buttonTouchFeedbackTimeout)

      $el.addClass('touchdown active');
    })
    .on('touchend', '.touchFeedback', function(e) {
      $(this).removeClass('touchdown active');
    });
  },

};

module.exports = PageUtils;
