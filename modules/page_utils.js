var settings = require('./settings');

var PageUtils = {

  buttonTouchFeedback: function() {
    $('body').on('touchstart', '.touchFeedback', function(e) {
      var $el = $(this);

      var btnClasses = PageUtils.getBtnClasses($el);

      setTimeout(function() {
        $el.removeClass(btnClasses.removeClass);
      }, settings.buttonTouchFeedbackTimeout)

      $el.addClass(btnClasses.addClass);
    })
    .on('touchend', '.touchFeedback', function(e) {
      var btnClasses = PageUtils.getBtnClasses($(this));
      $(this).removeClass(btnClasses.removeClass);
    });
  },

  getBtnClasses: function($el) {
    var addClass = 'touchdown';
    var removeClass = 'touchdown';

    var isBootstrapBtn = $el.hasClass('btn');

    if ( isBootstrapBtn ) {
      addClass += ' active';
      removeClass += ' active';
    }

    return {
      addClass: addClass,
      removeClass: removeClass,
    };
  }

};

module.exports = PageUtils;
