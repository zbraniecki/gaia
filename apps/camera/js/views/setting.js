define(function(require, exports, module) {
'use strict';

/**
 * Dependencies
 */

var debug = require('debug')('view:setting');
var bind = require('lib/bind');
var View = require('view');

/**
 * Exports
 */

module.exports = View.extend({
  tag: 'li',
  name: 'setting',

  initialize: function(options) {
    this.l10n = options.l10n || navigator.mozL10n;
    this.model = options.model;
    this.model.on('change', this.render);
    this.on('destroy', this.onDestroy);
    this.el.dataset.icon = this.model.get('icon');
    this.el.classList.add('test-' + this.model.get('title') + '-setting');
    bind(this.el, 'click', this.onClick);
  },

  onClick: function() {
    this.emit('click', this);
  },

  onDestroy: function() {
    this.model.off('change', this.render);
  },

  render: function() {
    var data = this.model.get();

    data.selected = this.model.selected();
    data.value = data.selected && data.selected.title;

    // The settings list is a listbox (list of actionable items) thus the
    // setting must be an 'option'.
    this.el.setAttribute('role', 'option');
    // The only way to exclude content from :before element (present in setting
    // item) is to override it with ARIA label.
    this.l10n.formatValue(data.value).then((value) => {
      this.l10n.setAttributes(this.el, 'setting-option-' + data.title, {
        value: value
      });
    }).then(() => {
      this.el.innerHTML = this.template(data);

      if (data.optionsLocalizable === false) {
        this.el.querySelector('.setting_value').textContent = data.value;
      } else {
        this.el.querySelector('.setting_value').setAttribute('data-l10n-id',
          data.value);
      }

      // Clean up
      delete this.template;

      debug('rendered (item %s)', data.key);
    });

    return this;
  },

  template: function(data) {
    return '<div class="setting_text">' +
      '<h4 class="setting_title"></h4>' +
      '<h5 class="setting_value"></h5>' +
    '</div>';
  },
});

});
