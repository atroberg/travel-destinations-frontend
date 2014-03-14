var settings = require('./settings');

var PageUtils = {

  buttonTouchFeedback: function() {
    $('body').on('touchstart', '.touchFeedback', function(e) {
      var $el = $(this);

      setTimeout(function() {
        $el.removeClass('touchdown');
      }, settings.buttonTouchFeedbackTimeout)

      $el.addClass('touchdown');
    })
    .on('touchend', '.touchFeedback', function(e) {
      $(this).removeClass('touchdown');
    });
  },

};

module.exports = PageUtils;
