module.exports = function autohideNav($el) {

  var scrollTop = 0;
  var menuVisible = true;
  var menuHeight = $el.outerHeight();

  // Binding to onscroll is resource intensive,
  // use interval instead
  window.setInterval(function() {
    var newScrollTop = $(window).scrollTop();

    // User scrolled down the screen => hide nav
    if ( menuVisible && newScrollTop > scrollTop && newScrollTop > menuHeight ) {
      $el.css('transform', 'translate3d(0,' + (-menuHeight) + 'px,0)');
      menuVisible = false;
    }

    else if ( !menuVisible && newScrollTop < scrollTop ) {
      $el.css('transform', 'translate3d(0,0,0)');
      menuVisible = true;
    }

    scrollTop = newScrollTop;

  }, 250);

};
