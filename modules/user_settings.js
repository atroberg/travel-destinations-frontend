var UserSettings = {

  set: function(key, value) {
    localStorage.setItem(key, value);
  },

  get: function(key) {
    return localStorage.getItem(key);
  },

};

module.exports = UserSettings;
