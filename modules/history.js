var AppHistory = {

  popHandlers: {},

  // Need to keep track of this separately,
  // because history.length doesn't give the
  // current position in history but only the
  // total amount of pages in the history
  currentIndex: 0,

  shortcuts: {},

  init: function() {
    window.onpopstate = function(event) {

      if ( AppHistory.currentIndex > 0 ) {
        AppHistory.currentIndex -= 1;
      }

      if ( event.state && AppHistory.popHandlers[event.state.popHandler] ) {
        AppHistory.popHandlers[event.state.popHandler](event.state);
      }
    };
  },

  // Add function handler to
  // be called onPopState
  addPopHandler: function(name, f, options) {
    this.popHandlers[name] = f;
  },

  // Shortcut method for "jumping" over history
  // directly to specified popHandler
  gotoShortcut: function(name) {
    try {
      var addedPosition = this.shortcuts[name];

      var gotoIndex = addedPosition - AppHistory.currentIndex;

      // Dirty hack to an occurring problem...
      if ( gotoIndex >= 0 ) {
        gotoIndex = -1;
      }

      history.go(gotoIndex);

      // Although should never happen, but ensure
      // addedPosition is >= 1, because otherwise
      // onPopState will decrement is < 0
      if ( addedPosition < 1 ) {
        addedPosition = 1;
      }

      AppHistory.currentIndex = addedPosition;

      delete this.shortcuts[name];
    }
    catch (e) {
      //console.error(e);
    }
  },

  extendState: function(state, title) {
    this.push($.extend({}, history.state, state), title, {replaceState: true});
  },

  push: function(state, title, options) {
    options = options || {};

    var fn = 'pushState';

    if ( !this.prevWasReplace && ( options.replaceState || this.currentIndex <= 0 ) ) {
      fn = 'replaceState';
      this.prevWasReplace = true;
    }
    else {
      AppHistory.currentIndex += 1;
      this.prevWasReplace = false;
    }

    history[fn](state, title);

    if ( options.shortcut ) {
      this.shortcuts[options.shortcut] = AppHistory.currentIndex;
    }
  },

  // Need this because some history events we need
  // to keep track of are minor actions inside a page.
  // For example, clicking a photo thumb opens the gallery,
  // which is then opened in fullscreen and pushed into history.
  // Problem: because this event is last in the history queue,
  // it will never fire when going back. Therefore we need
  // to add one more "dummy" event to history.
  pushAction: function(state, title) {
    this.push(state, title, {replaceState: true});
    // Push the "dummy" action
    this.push({}, 'dummy_event');
  },

}

module.exports = AppHistory;
