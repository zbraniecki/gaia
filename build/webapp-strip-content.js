var utils = require('./utils');
var config = require('./config').config;
const { Cc, Ci, Cr, Cu, CC } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/FileUtils.jsm');

function debug(str) {
  dump(' -*- webapp-strip-content.js: ' + str + '\n');
}


function stripFile(file) {
  var text = utils.getFileContent(file);
  text = text.replace(/(<[^!\/][^\>]*[^\/]\>)[^<]+<\//gi, '$1</');
  text = text.replace(/data\-l10n\-id="([^"]+)"/gi, function(match, p1) {
    return 'data-l10n-id="'+p1.replace('-','_', 'gi')+'"';
  });
  return text;
}

function execute(options) {
  config = options;
  /**
   * Pre-translate all HTML files for the default locale
   */

  debug('Begin');

  utils.getGaia(config).webapps.forEach(function(webapp) {
    // if BUILD_APP_NAME isn't `*`, we only accept one webapp
    if (config.BUILD_APP_NAME != '*' &&
        webapp.sourceDirectoryName != config.BUILD_APP_NAME)
      return;

    var file = webapp.sourceDirectoryFile.clone();
    file.append('index.html');
    var text = stripFile(file);

    utils.writeContent(file, text);
  });
  debug('End');
}


exports.execute = execute;
