'use strict';

window.mozIntl = {
  formatList: function(list) {
    const delimiter = ', ';

    return list.join(delimiter);
  },
  DateTimeFormat: function(locales, options) {
    if (!options.hasOwnProperty('format') &&
        !options.hasOwnProperty('dayperiod')) {
      return Intl.DateTimeFormat(locales, options);
    }

    const resolvedOptions = Object.assign({}, options);

    if (options.dayperiod) {
      if (!('hour' in options)) {
        resolvedOptions.hour = 'numeric';
      }
    }

    var intlFormat = new Intl.DateTimeFormat(locales, resolvedOptions);

    return {
      format: function(date) {
        var dayPeriod;

        var string = intlFormat.format(date);

        if (options.dayperiod === false &&
            intlFormat.resolvedOptions().hour12 === true) {
          dayPeriod = date.toLocaleFormat('%p');
          string = string.replace(dayPeriod, '').trim();
        } else if (options.dayperiod === true &&
           options.hour === undefined) {
          dayPeriod = date.toLocaleFormat('%p');
          const hour = date.toLocaleString(navigator.languages, {
            hour12: options.hour12,
            hour: 'numeric'
          }).replace(dayPeriod, '').trim();
          string = string.replace(hour, '').trim();
        }
        
        for (var token in options.format) {
          const localOptions = {};
          localOptions[token] = resolvedOptions[token];

          var formatter = window.mozIntl.DateTimeFormat(
            navigator.languages, localOptions);
          var tokenString = formatter.format(date);
          string = string.replace(tokenString, options.format[token]);
        }
        return string;
      },
    };
  },
  calendarInfo: function(token) {
    switch (token) {
      case 'firstDayOfTheWeek':
        return navigator.mozL10n.formatValue('firstDayOfTheWeek');
      default:
        throw new Error('Unknown token: ' + token);
    }
  },
};

