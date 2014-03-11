var AppHistory = {

  // On page load, we will automatically get one
  // state, and thus the first time we do replaceState
  // instead of pushState. Tracked with this var.
  noEntriesYet: true,

  popHandlers: {},

  // Need to keep track of this separately,
  // because history.length doesn't give the
  // current position in history but only the
  // total amount of pages in the history
  currentIndex: 0,

  shortcuts: {},

  init: function() {
    window.onpopstate = function(event) {
      AppHistory.currentIndex -= 1;

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
      history.go(addedPosition - AppHistory.currentIndex);
    }
    catch (e) {
      console.log(e);
    }
  },

  push: function(state, title, options) {
    options = options || {};

    if ( this.noEntriesYet ) {
      var fn = 'replaceState';
      this.noEntriesYet = false;
    }
    else {
      var fn = 'pushState';
    }

    history[fn](state, title);

    if ( options.shortcut ) {
      this.shortcuts[options.shortcut] = AppHistory.currentIndex;
    }

    AppHistory.currentIndex += 1;
  },

  // Need this because some history events we need
  // to keep track of are minor actions inside a page.
  // For example, clicking a photo thumb opens the gallery,
  // which is then opened in fullscreen and pushed into history.
  // Problem: because this event is last in the history queue,
  // it will never fire when going back. Therefore we need
  // to add one more "dummy" event to history.
  pushAction: function(state, title) {
    this.push(state, title);
    // Push the "dummy" action
    this.push({}, 'dummy_event');
  },

}

module.exports = AppHistory;
