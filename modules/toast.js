var settings = require('./settings');

var Toast = {
    getEl: function() {
      return $('<div class="toast_msg"></div>');
    },
    show: function(msg) {
      var $el = this.getEl()
      $el.html(msg).appendTo('body');

      // For some reason we need to wait a moment
      // before we can make element visible. Otherwise
      // the fade in animation won't work. This is probably
      // because the class is added before the element gets
      // inserted into the DOM.
      var animationSafetyMargin = 10;
      setTimeout(function() {
        $el.addClass('visible');
      }, animationSafetyMargin);

      setTimeout(function() {
        $el.removeClass('visible');
        setTimeout(function() {
          $el.remove();
        }, settings.animationDurations.toastMsg)
      }, settings.toastMsgDuration + animationSafetyMargin);
    },
};

module.exports = Toast;
