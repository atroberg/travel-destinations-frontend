var AppHistory = {

  // On page load, we will automatically get one
  // state, and thus the first time we do replaceState
  // instead of pushState. Tracked with this var.
  noEntriesYet: true,

  popHandlers: {},

  init: function() {
    var that = this;

    window.onpopstate = function(event) {
      if ( event.state && that.popHandlers[event.state.popHandler] ) {
        that.popHandlers[event.state.popHandler](event.state);
      }
    };
  },

  // Add function handler to
  // be called onPopState
  addPopHandler: function(name, f) {
    this.popHandlers[name] = f;
  },

  push: function(state, title) {
    if ( this.noEntriesYet ) {
      var fn = 'replaceState';
      this.noEntriesYet = false;
    }
    else {
      var fn = 'pushState';
    }

    history[fn](state, title);
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
