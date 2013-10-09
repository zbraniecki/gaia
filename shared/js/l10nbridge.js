(function() {

var settings = {}; 
var observers = {};

if (!navigator.mozSettings) {
  navigator.mozSettings = {
    'addObserver': function(type, cb) {
      if (!observers[type]) {
        observers[type] = [];
      }
      observers[type].push(cb);
    },
    'createLock': function() {
      return {
        'get': function() {
          return {
            set onsuccess(cb) {}
          }
        },
        'set': function(cset) {
          for (i in cset) {
            if (observers[i]) {
              for (j in observers[i]) {
                observers[i][j]({
                  'settingValue': cset[i]
                });
              }
            }
            settings[i] = cset[i];
          }
        }
      };
    }
  };
}

navigator.addIdleObserver = function(cb) {
}

navigator.mozSetMessageHandler = function(type, cb) {
}

navigator.mozMobileConnection = {
  cardState: null,
  addEventListener: function(type, cb) {
  }
}

navigator.mozIccManager = {
}

navigator.getDeviceStorage = function(id) {
  return {
    freeSpace: function() {
      return {};
    }
  }
}
}());
