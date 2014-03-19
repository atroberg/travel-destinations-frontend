var settings = {
  flickrApiKey: 'cb604a39c91c3feca7769fa5fa012b5a',
  youtubeApiKey: 'AIzaSyDaS1ZttUF_kl-geMgtEy9X5_eqV3UWEXs',
  youtubeApiURI: 'http://td.alexistroberg.com/youtube',
  openWeatherMapKey: 'ea3739d944e0f931dee8b175958316c0',
  featuredURI: 'http://td.alexistroberg.com/static/featured.json',
  popularURI: 'http://td.alexistroberg.com/static/popular.json',
  animationDurations: {
    page: 500,
    tabs: 200,
    toastMsg: 200,
  },
  tabSwipeVelocity: 0.2,
  hammer: {
    tap_max_distance: 20,
    tap_max_touchtime: 400,
    swipe_velocity: 0.1,
  },
  toastMsgDuration: 2000,
  map: {
    defaultZoomLevel: 8,
  },
  autoSuggestMinLength: 3,
  playStoreLink: 'TODO_INSERT_PLAYSTORE_LINK',
  buttonTouchFeedbackTimeout: 500,
  databaseInitSize: 52428800, // 50MB
  ajaxCache: {
    pageCount: 10,
    lifetime: 1800, // 30 min (argument given in seconds)
  },
  frontpage: {
    destinationListLimit: 5,
  },
  recentlyViewed: {
    limit: 5,
  },
  analytics: {
    id: 'UA-48112060-2',
    minDelayBetweenUpdate: 30, // seconds
  },
  remoteAppScript: 'http://td.alexistroberg.com/static/app.js',
};

module.exports = settings;
