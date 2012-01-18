var L20n = {
  getContext: function() {
    return new this.Context();
  }
};

L20n.Context = function() {
  this.frozen = false;

  this._resources = {};

  this._events = {
    'ready': false
  };

  this._objects = {
    'resources': {},
    'context': {},
    'system': {},
    'globals': {}
  }

  var paths = {
    'system': 'js/l20n/data/sys.j20n',
    'globals': 'js/l20n/data/default.j20n'
  };
  
  for (var name in paths)
    this._loadResource(this._objects[name], paths[name]);
}

L20n.Context.prototype = {
  addResource: function(url) {
    this._loadResource(this._objects['resources'], url);
  },

  get: function(id, args) {
    return this._get(id, args);
  },

  getAttributes: function(id, args) {
    return this._get(id, args, true);
  },

  set data(data) {
    return this._objects['context'] = data
  },

  get data() {
    return this._objects['context'];
  },

  freeze: function() {
    this.frozen = true;

    if (this.isReady())
      this._fireCallback();
  },

  isReady: function() {
    if (!this.frozen)
      return false;

    var resources = this._resources;
    for (var url in resources) {
      if (resources[url])
        return false;
    }

    return true;
  },

  set onReady(callback) {
    this._events['ready'] = callback;
  },

  // Private
  _get: function(id, args, isAttributes) {
    var objects = this._objects;

    var currentObject = objects['resources'];
    if (args) {
      args.__proto__ = currentObject;
      currentObject = args;
    }

    if (objects['context']) {
      objects['context'].__proto__ = currentObject;
      currentObject = objects['context'];
    }

    objects['globals'].__proto__ = currentObject;
    currentObject = objects['globals'];

    var system = objects['system'];
    if (isAttributes)
      return system.getattrs(currentObject, system, id);
    else
      return system.getent(currentObject, system, id);
  },

  _loadObject: function(obj, data) {
    // XXX HO MY!
    var read = function(data) {
      eval(data);
    }
    read.apply(obj, Array(data));
  },

  _loadResource: function(obj, url) {
    this._resources[url] = true;

    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('text/plain');

    xhr.addEventListener('load', (function() {
      this._loadObject(obj, xhr.responseText);
      this._resources[url] = false;

      if (this.isReady())
        this._fireCallback();
    }).bind(this));

    xhr.open('GET', url, true);
    xhr.send('');
  },

  _fireCallback: function() {
    var callback = this._events['ready'];
    if (!callback)
      return;

    callback();
    this._events['ready'] = null;
  }
}

