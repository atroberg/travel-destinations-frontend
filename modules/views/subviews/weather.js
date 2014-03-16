var OpenWeatherMap = require('../../data_services/openweathermap');
var weatherTemplate = require('../../../templates/weather.hbs');
var moment = require('moment');

var Weather = {

  activate: function(options) {
    this.$el = options.$el;
    this.showForecast(options.keyword);
    this.onError = options.onError;
  },

  updateView: function(options) {

    options = options || {};

    // Only show error message if ALSO climateTable is null.
    // If climateTable still avaible, we don't need to worry
    // the user by giving an error message...
    if ( options.error && Weather.climateTable === null ) {
      Weather.onError();
    }

    else {
      Weather.$el.html(weatherTemplate({
        forecast: Weather.forecastList,
        climateTable: Weather.climateTable,
        noResults: Weather.forecastList === null && Weather.climateTable === null,
      }));
    }

  },

  showForecast: function(keyword) {

    OpenWeatherMap.getForecast({
        q: keyword,
      },
      function(error, forecastList) {

        if ( error ) {
          Weather.forecastList = null;
          Weather.updateView({error: true});
        }

        else {
          $.each(forecastList, function(i, day) {
            day.dayLabel = moment.unix(day.dt).format('ddd D.M');
            day.temp.day = Math.round(day.temp.day);
            day.temp.night = Math.round(day.temp.night);
          });

          Weather.forecastList = forecastList;
          Weather.updateView();
        }

    });
  },

  // Parse html from wikivoyage and return table as an array
  setClimateTable: function setClimateTable($el) {
    var $weatherTable = $el.find('#climate_table');

    // No climate table found
    if ( $weatherTable.length <= 0 ) {
      this.climateTable = null;
      return;
    }

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
