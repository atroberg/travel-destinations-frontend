module.exports = function autohideNav($el) {

  var scrollTop = 0;
  var elHeight = $el.height();
  var navVisible = false;
  var currentPos = 0;

  $(window).on('scroll', function(e) {
    var tmp = $(window).scrollTop();

    // Are we scrolling backwards ( = up )
    if ( tmp < scrollTop ) {
      if ( !navVisible ) {
        currentPos = scrollTop - elHeight;
        $el.css('top', currentPos + 'px');
        navVisible = true;
      }
      else if ( tmp <= currentPos ) {
        $el.css({
          position: 'fixed',
          'top': '0px'
        });
      }
    }
    else {
      if ( navVisible ) {
        $el.css({
          position: 'absolute',
          'top': tmp + 'px'
        });
        navVisible = false;
      }
    }

    scrollTop = tmp;

  });

};
