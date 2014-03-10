var OpenWeatherMap = require('./data_services/openweathermap');
var weatherTemplate = require('../templates/weather.hbs');
var moment = require('moment');

var Weather = {

  activate: function(options) {
    this.$el = options.$el;
    this.showForecast(options.keyword);
  },

  updateView: function() {
    Weather.$el.html(weatherTemplate({
      forecast: Weather.forecastList,
      climateTable: Weather.climateTable,
    }));
  },

  showForecast: function(keyword) {

    OpenWeatherMap.getForecast({
        q: keyword,
      },
      function(error, forecastList) {

        if ( error ) {
          // TODO
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
