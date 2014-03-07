var settings = require('./settings');

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

var Weather = {

  getForecast: function(options) {
    $.ajax({
      url: 'http://api.openweathermap.org/data/2.5/forecast/daily',
      data: {
        q: options.q,
        mode: 'json',
        units: 'metric',
        cnt: options.days || 4,
        APPID: settings.openWeatherMapKey,
      },
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

          options.callback(null, forecastList);
        }
        catch(e) {
          options.callback(e);
        }
      },
      error: function(msg) {
        options.callback(msg);
      },
    });
  },

  // Parse html from wikivoyage and return table as an array
  setClimateTable: function setClimateTable($el) {
    var $weatherTable = $el.find('#climate_table');

    if ( $weatherTable.length <= 0 )
      throw "no_weather_data_found";

    var climateTable = [];

    $weatherTable.find('tr').each(function(i, row) {
      $row = $(row);
      if ( $row.text().trim() !== '' ) {
        var row = [];
        $row.find('td,th').each(function(j, cell) {
          row.push($(cell).text().trim());
        });
        climateTable.push(row);
      }
    });

    this.climateTable = climateTable;
  },

};

module.exports = Weather;
