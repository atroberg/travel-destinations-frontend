var settings = require('./settings');

// Fix problem with Hammer swipebehavior by implementing own event
window.$.fn.trobisHammer = function() {

  var $this = $(this);

  var tabSwitchRequested = false;
  $this.on('dragleft dragright', function(e) {
    e.gesture.preventDefault();

    if ( !tabSwitchRequested && e.gesture.velocityX > settings.tabSwipeVelocity ) {

      if ( e.gesture.direction === 'left' ) {
        var Event = $.Event('trobisHammer.swiperight');
        Event.target = e.target;
        $this.trigger(Event);
      }
      else {
        var Event = $.Event('trobisHammer.swipeleft');
        Event.target = e.target;
        $this.trigger(Event);
      }

      tabSwitchRequested = true;
    }
  })
  .on('dragend', function(e) {
    tabSwitchRequested = false;
  });

  return $this;

};
