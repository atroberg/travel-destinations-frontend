var settings = require('../settings');

// Make icons provided by openweathermap
// match the icon set we use
var iconConversions = {
  '01d': '01d',
  '01n': '01n',
  '02d': '03d',
  '02n': '03n',
  '03d': '04',
  '03n': '04',
  '04d': '04',
  '04n': '04',
  '09d': '05d',
  '09n': '05n',
  '10d': '10',
  '10n': '10',
  '11d': '11',
  '11n': '11',
  '13d': '13',
  '13n': '13',
  '50d': '15',
  '50n': '15',
};

var OpenWeatherMap = {

  getForecast: function(options, callback) {

    var data = $.extend({
        mode: 'json',
        units: 'metric',
        cnt: 4,
        APPID: settings.openWeatherMapKey
    }, options);

    $.ajax({
      url: 'http://api.openweathermap.org/data/2.5/forecast/daily',
      data: data,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        var forecastList = [];

        try {
          $.each(data.list, function(i, day) {
            if ( typeof iconConversions[day.weather[0].icon] !== 'undefined' ) {
              day.icon = iconConversions[day.weather[0].icon];
            }
            else {
              day.icon = null;
            }

            forecastList.push(day);
          });

          callback(null, forecastList);
        }
        catch(e) {
          callback(e);
        }
      },
      error: function(msg, textStatus) {
        if ( textStatus === 'abort' ) return;
        callback(msg);
      },
    });
  },

};

module.exports = OpenWeatherMap;
