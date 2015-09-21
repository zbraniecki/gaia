define(function(require) {
  'use strict';

  var Template = require('template');
  var Utils = require('utils');
  var html = require('text!banner/banner.html');

  function Banner(node) {
    // Accept a reference to an element or the element id
    if (typeof node === 'string') {
      this.notice = document.getElementById(node);
    } else {
      this.notice = node;
    }
    // Accept an optional reference to template element id
    this.tmpl = new Template(html);
    // Store a reference to timeout to debounce banner
    this.timeout = null;
    return this;
  }

  Banner.prototype = {

    constructor: Banner,

    render: function bn_render(alarmTime) {
      var timeLeft, tl, countdownType, localTimes;

      timeLeft = +alarmTime - Date.now();
      // generate human readable numbers to pass to localization function
      tl = Utils.dateMath.fromMS(timeLeft, {
        unitsPartial: ['days', 'hours', 'minutes']
      });

      // Match properties to localizations string types
      // e.g. minutes maps to nMinutes if there are no hours but
      // nRemainMinutes if hours > 0
      if (tl.days) {
        //countdown-moreThanADay localized only for en-US while 913466 is open
        countdownType = 'countdown-moreThanADay';
        localTimes = {
          'days': tl.days,
          'hours': tl.hours
        };
      } else if (tl.hours > 0) {
        countdownType = 'countdown-moreThanAnHour';
        localTimes = {
          'hours': tl.hours,
          'minutes': tl.minutes
        };
      } else {
        countdownType = 'countdown-lessThanAnHour';
        localTimes = {
          'minutes': tl.minutes
        };
      }

      return {
        noticeId: countdownType,
        noticeArgs: localTimes
      };
    },

    show: function bn_show(alarmTime) {
      // Render the Banner notice
      this.notice.innerHTML = this.tmpl.interpolate(
        this.render(alarmTime)
      );
      // 'visible' class controls the animation
      this.notice.classList.add('visible');
      // use this object rather than a function to retain context
      this.notice.addEventListener('click', this);
      // Debounce timer in case alarms are added more quickly than 4 seconds
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      // After 4 seconds, remove the banner
      this.timeout = setTimeout(this.hide.bind(this), 4000);
    },

    hide: function bn_hide() {
      this.notice.classList.remove('visible');
      this.notice.removeEventListener('click', this);
    },

    handleEvent: function bn_handleEvent() {
      this.hide();
    }
  };

  return Banner;
});
