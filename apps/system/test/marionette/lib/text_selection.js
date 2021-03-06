/* global Components */
'use strict';

var Actions = require('marionette-client').Actions;
function TextSelection(client) {
  this.client = client;
  this._activeContent = null;
  this.actions = new Actions(this.client);
}

module.exports = TextSelection;

TextSelection.Selector = Object.freeze({
  textSelectionDialog: '.textselection-dialog',
  copy: '.textselection-dialog .textselection-dialog-copy',
  paste: '.textselection-dialog .textselection-dialog-paste',
  cut: '.textselection-dialog .textselection-dialog-cut',
  selectall: '.textselection-dialog .textselection-dialog-selectall'
});

TextSelection.prototype = {
  get visibility() {
    this.client.switchToFrame();
    var isVisible = this.client.executeScript(function(query) {
      var element = document.querySelector(query);
      return element && element.classList.contains('visible');
    }, [TextSelection.Selector.textSelectionDialog]);
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
    return isVisible;

  },

  startCountVisibilityChanged: function() {
    this.client.switchToFrame();
    this.client.executeScript(function(query) {
      var element = document.querySelector(query);
      element.dataset.showSummary = 0;
      var bubbleInitActive = element.classList.contains('visible');
      element.addEventListener('DOMAttrModified',
        function DOMAttrModifiedListener(evt) {
          var active = element.classList.contains('active');
          if (bubbleInitActive !== active) {
            bubbleInitActive = active;
            element.dataset.showSummary =
              parseInt(element.dataset.showSummary, 10) + 1;
          }
        });
    }, [TextSelection.Selector.textSelectionDialog]);
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
  },

  stopCountVisibilityChanged: function() {
    this.client.switchToFrame();
    var result = this.client.executeScript(function(query) {
      var element = document.querySelector(query);
      element.removeEventListener('DOMAttrModified',
        window.wrappedJSObject.DOMAttrModifiedListener);
      var showSummary = element.dataset.showSummary;
      delete element.dataset.showSummary;
      return parseInt(showSummary, 10);
    }, [TextSelection.Selector.textSelectionDialog]);
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
    return result;
  },

  /**
   * Get dialog width from previous operation.
   */
  get width() {
    // We need to make sure we're in system app before getting
    // dialog's location.
    this.client.switchToFrame();
    var size = this.client.helper.waitForElement(
      TextSelection.Selector.textSelectionDialog).size();
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
    return size.width;
  },

  /**
   * Get dialog position from previous operation.
   */
  get location() {
    this.client.switchToFrame();
    var location = this.client.helper.waitForElement(
      TextSelection.Selector.textSelectionDialog).location();
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
    return location;
  },

  switchToCurrentApp: function() {
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
  },

  /**
   * Get appWindow's id and origin of displayed app.
   * XXXXX: Since gecko is not ready yet, we need to simulate gecko dispatching
   *        mozbrowsertextualmenu event to display textselection dialog.
   * 
   * @return {displayApp}.
   */
  _getDisplayedAppInfo: function() {
    // AppWindow information is stored in system app scope.
    var displayApp;
    this.client.waitFor(function() {
      displayApp = this.client.executeScript(function() {
        var app = window.wrappedJSObject.Service.query(
          'AppWindowManager.getActiveWindow');
        var frame = (app.browser) ? app.browser.element : app.frame.firstChild;
        return {
          appWindowId: frame.id,
          origin: app.origin
        };
      });
      return displayApp;
    }.bind(this));
    return displayApp;
  },

  longPress: function(element) {
    // Get element's bounding rectangle. The coordinate is relative to
    // the top left corner of the window instead of the document.
    var rect = this.client.executeScript(function() {
      var rect = arguments[0].getBoundingClientRect();
      return {x: rect.x, y:rect.y, width: rect.width, height: rect.height};
    }, [element], null, 'system');

    this.longPressByPosition(element, rect.x + rect.width / 2,
      rect.y + rect.height / 2);
  },
 
  longPressByPosition: function(element, x, y) {
    this.client.executeScript(function() {
      var Ci = Components.interfaces;
      var utils = window.QueryInterface(Ci.nsIInterfaceRequestor)
                        .getInterface(Ci.nsIDOMWindowUtils);
      utils.sendTouchEventToWindow('touchstart', [0],
                                   [arguments[0]], [arguments[1]],
                                   [1], [1], [0], [1], 1, 0);
      utils.sendMouseEventToWindow('mouselongtap', arguments[0], arguments[1],
                                    0, 1, 0);
      utils.sendTouchEventToWindow('touchend', [0],
                                   [arguments[0]], [arguments[1]],
                                   [1], [1], [0], [1], 1, 0);
    }, [x, y], null, 'system');
  },

  pressCopy: function() {
    this.client.switchToFrame();
    this.client.helper.waitForElement(TextSelection.Selector.copy).tap();
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
  },

  pressCut: function() {
    this.client.switchToFrame();
    this.client.helper.waitForElement(TextSelection.Selector.cut).tap();
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
  },

  pressPaste: function() {
    this.client.switchToFrame();
    this.client.helper.waitForElement(TextSelection.Selector.paste).tap();
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
  },

  pressSelectAll: function() {
    this.client.switchToFrame();
    this.client.helper.waitForElement(TextSelection.Selector.selectall).tap();
    this.client.apps.switchToApp(this._getDisplayedAppInfo().origin);
  }
};
