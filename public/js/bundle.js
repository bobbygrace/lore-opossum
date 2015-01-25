(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/bobbygrace/Code/lore-opossum/index.coffee":[function(require,module,exports){
var AppView, LoremModel;

AppView = require('./src/coffeescript/appview.coffee');

LoremModel = require('./src/coffeescript/model.coffee');

new AppView({
  model: new LoremModel
}).render();



},{"./src/coffeescript/appview.coffee":"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/appview.coffee","./src/coffeescript/model.coffee":"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/model.coffee"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/backbone.js":[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

},{"underscore":"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/node_modules/underscore/underscore.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/node_modules/underscore/underscore.js":[function(require,module,exports){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/index.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

module.exports = function (element) {
    var self = this,
        Combokeys = self.constructor;

    /**
     * a list of all the callbacks setup via Combokeys.bind()
     *
     * @type {Object}
     */
    self.callbacks = {};

    /**
     * direct map of string combinations to callbacks used for trigger()
     *
     * @type {Object}
     */
    self.directMap = {};

    /**
     * keeps track of what level each sequence is at since multiple
     * sequences can start out with the same sequence
     *
     * @type {Object}
     */
    self.sequenceLevels = {};

    /**
     * variable to store the setTimeout call
     *
     * @type {null|number}
     */
    self.resetTimer;

    /**
     * temporary state where we will ignore the next keyup
     *
     * @type {boolean|string}
     */
    self.ignoreNextKeyup = false;

    /**
     * temporary state where we will ignore the next keypress
     *
     * @type {boolean}
     */
    self.ignoreNextKeypress = false;

    /**
     * are we currently inside of a sequence?
     * type of action ("keyup" or "keydown" or "keypress") or false
     *
     * @type {boolean|string}
     */
    self.nextExpectedAction = false;

    self.element = element;

    self.addEvents();

    Combokeys.instances.push(self);
    return self;
};

module.exports.prototype.bind = require("./prototype/bind");
module.exports.prototype.bindMultiple = require("./prototype/bindMultiple");
module.exports.prototype.unbind = require("./prototype/unbind");
module.exports.prototype.trigger = require("./prototype/trigger");
module.exports.prototype.reset = require("./prototype/reset.js");
module.exports.prototype.stopCallback = require("./prototype/stopCallback");
module.exports.prototype.handleKey = require("./prototype/handleKey");
module.exports.prototype.addEvents = require("./prototype/addEvents");
module.exports.prototype.bindSingle = require("./prototype/bindSingle");
module.exports.prototype.getKeyInfo = require("./prototype/getKeyInfo");
module.exports.prototype.pickBestAction = require("./prototype/pickBestAction");
module.exports.prototype.getReverseMap = require("./prototype/getReverseMap");
module.exports.prototype.getMatches = require("./prototype/getMatches");
module.exports.prototype.resetSequences = require("./prototype/resetSequences");
module.exports.prototype.fireCallback = require("./prototype/fireCallback");
module.exports.prototype.bindSequence = require("./prototype/bindSequence");
module.exports.prototype.resetSequenceTimer = require("./prototype/resetSequenceTimer");

module.exports.instances = [];
module.exports.reset = require("./reset");

/**
 * variable to store the flipped version of MAP from above
 * needed to check if we should use keypress or not when no action
 * is specified
 *
 * @type {Object|undefined}
 */
module.exports.REVERSE_MAP = null;

},{"./prototype/addEvents":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/addEvents.js","./prototype/bind":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bind.js","./prototype/bindMultiple":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bindMultiple.js","./prototype/bindSequence":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bindSequence.js","./prototype/bindSingle":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bindSingle.js","./prototype/fireCallback":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/fireCallback.js","./prototype/getKeyInfo":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/getKeyInfo.js","./prototype/getMatches":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/getMatches.js","./prototype/getReverseMap":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/getReverseMap.js","./prototype/handleKey":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/handleKey.js","./prototype/pickBestAction":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/pickBestAction.js","./prototype/reset.js":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/reset.js","./prototype/resetSequenceTimer":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/resetSequenceTimer.js","./prototype/resetSequences":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/resetSequences.js","./prototype/stopCallback":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/stopCallback.js","./prototype/trigger":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/trigger.js","./prototype/unbind":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/unbind.js","./reset":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/reset.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/addEvents.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
module.exports = function () {
    var self = this,
        addEvent,
        element = self.element,
        handleKeyEvent,
        boundHandler;

    handleKeyEvent = require("./handleKeyEvent");

    addEvent = require("../../helpers/addEvent");
    boundHandler = handleKeyEvent.bind(self);
    addEvent(element, "keypress", boundHandler);
    addEvent(element, "keydown", boundHandler);
    addEvent(element, "keyup", boundHandler);
};

},{"../../helpers/addEvent":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/addEvent.js","./handleKeyEvent":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/handleKeyEvent.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bind.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * binds an event to Combokeys
 *
 * can be a single key, a combination of keys separated with +,
 * an array of keys, or a sequence of keys separated by spaces
 *
 * be sure to list the modifier keys first to make sure that the
 * correct key ends up getting bound (the last key in the pattern)
 *
 * @param {string|Array} keys
 * @param {Function} callback
 * @param {string=} action - "keypress", "keydown", or "keyup"
 * @returns void
 */
module.exports = function(keys, callback, action) {
    var self = this;

    keys = keys instanceof Array ? keys : [keys];
    self.bindMultiple(keys, callback, action);
    return self;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bindMultiple.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * binds multiple combinations to the same callback
 *
 * @param {Array} combinations
 * @param {Function} callback
 * @param {string|undefined} action
 * @returns void
 */
module.exports = function (combinations, callback, action) {
    var self = this;

    for (var j = 0; j < combinations.length; ++j) {
        self.bindSingle(combinations[j], callback, action);
    }
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bindSequence.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * binds a key sequence to an event
 *
 * @param {string} combo - combo specified in bind call
 * @param {Array} keys
 * @param {Function} callback
 * @param {string=} action
 * @returns void
 */
module.exports = function (combo, keys, callback, action) {
    var self = this;

    // start off by adding a sequence level record for this combination
    // and setting the level to 0
    self.sequenceLevels[combo] = 0;

    /**
     * callback to increase the sequence level for this sequence and reset
     * all other sequences that were active
     *
     * @param {string} nextAction
     * @returns {Function}
     */
    function increaseSequence(nextAction) {
        return function() {
            self.nextExpectedAction = nextAction;
            ++self.sequenceLevels[combo];
            self.resetSequenceTimer();
        };
    }

    /**
     * wraps the specified callback inside of another function in order
     * to reset all sequence counters as soon as this sequence is done
     *
     * @param {Event} e
     * @returns void
     */
    function callbackAndReset(e) {
        var characterFromEvent;
        self.fireCallback(callback, e, combo);

        // we should ignore the next key up if the action is key down
        // or keypress.  this is so if you finish a sequence and
        // release the key the final key will not trigger a keyup
        if (action !== "keyup") {
            characterFromEvent = require("../../helpers/characterFromEvent");
            self.ignoreNextKeyup = characterFromEvent(e);
        }

        // weird race condition if a sequence ends with the key
        // another sequence begins with
        setTimeout(
            function() {
                self.resetSequences();
            },
            10
        );
    }

    // loop through keys one at a time and bind the appropriate callback
    // function.  for any key leading up to the final one it should
    // increase the sequence. after the final, it should reset all sequences
    //
    // if an action is specified in the original bind call then that will
    // be used throughout.  otherwise we will pass the action that the
    // next key in the sequence should match.  this allows a sequence
    // to mix and match keypress and keydown events depending on which
    // ones are better suited to the key provided
    for (var j = 0; j < keys.length; ++j) {
        var isFinal = j + 1 === keys.length;
        var wrappedCallback = isFinal ? callbackAndReset : increaseSequence(action || self.getKeyInfo(keys[j + 1]).action);
        self.bindSingle(keys[j], wrappedCallback, action, combo, j);
    }
};

},{"../../helpers/characterFromEvent":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/characterFromEvent.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/bindSingle.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * binds a single keyboard combination
 *
 * @param {string} combination
 * @param {Function} callback
 * @param {string=} action
 * @param {string=} sequenceName - name of sequence if part of sequence
 * @param {number=} level - what part of the sequence the command is
 * @returns void
 */
module.exports = function (combination, callback, action, sequenceName, level) {
    var self = this;

    // store a direct mapped reference for use with Combokeys.trigger
    self.directMap[combination + ":" + action] = callback;

    // make sure multiple spaces in a row become a single space
    combination = combination.replace(/\s+/g, " ");

    var sequence = combination.split(" "),
        info;

    // if this pattern is a sequence of keys then run through this method
    // to reprocess each pattern one key at a time
    if (sequence.length > 1) {
        self.bindSequence(combination, sequence, callback, action);
        return;
    }

    info = self.getKeyInfo(combination, action);

    // make sure to initialize array if this is the first time
    // a callback is added for this key
    self.callbacks[info.key] = self.callbacks[info.key] || [];

    // remove an existing match if there is one
    self.getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

    // add this call back to the array
    // if it is a sequence put it at the beginning
    // if not put it at the end
    //
    // this is important because the way these are processed expects
    // the sequence ones to come first
    self.callbacks[info.key][sequenceName ? "unshift" : "push"]({
        callback: callback,
        modifiers: info.modifiers,
        action: info.action,
        seq: sequenceName,
        level: level,
        combo: combination
    });
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/fireCallback.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * actually calls the callback function
 *
 * if your callback function returns false this will use the jquery
 * convention - prevent default and stop propogation on the event
 *
 * @param {Function} callback
 * @param {Event} e
 * @returns void
 */
module.exports = function (callback, e, combo, sequence) {
    var self = this,
        preventDefault,
        stopPropagation;

    // if this event should not happen stop here
    if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
        return;
    }

    if (callback(e, combo) === false) {
        preventDefault = require("../../helpers/preventDefault");
        preventDefault(e);
        stopPropagation = require("../../helpers/stopPropagation");
        stopPropagation(e);
    }
};

},{"../../helpers/preventDefault":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/preventDefault.js","../../helpers/stopPropagation":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/stopPropagation.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/getKeyInfo.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * Gets info for a specific key combination
 *
 * @param  {string} combination key combination ("command+s" or "a" or "*")
 * @param  {string=} action
 * @returns {Object}
 */
module.exports = function (combination, action) {
    var self = this,
        keysFromString,
        keys,
        key,
        j,
        modifiers = [],
        SPECIAL_ALIASES,
        SHIFT_MAP,
        isModifier;

    keysFromString = require("../../helpers/keysFromString");
    // take the keys from this pattern and figure out what the actual
    // pattern is all about
    keys = keysFromString(combination);

    SPECIAL_ALIASES = require("../../helpers/special-aliases");
    SHIFT_MAP = require("../../helpers/shift-map");
    isModifier = require("../../helpers/isModifier");
    for (j = 0; j < keys.length; ++j) {
        key = keys[j];

        // normalize key names
        if (SPECIAL_ALIASES[key]) {
            key = SPECIAL_ALIASES[key];
        }

        // if this is not a keypress event then we should
        // be smart about using shift keys
        // this will only work for US keyboards however
        if (action && action !== "keypress" && SHIFT_MAP[key]) {
            key = SHIFT_MAP[key];
            modifiers.push("shift");
        }

        // if this key is a modifier then add it to the list of modifiers
        if (isModifier(key)) {
            modifiers.push(key);
        }
    }

    // depending on what the key combination is
    // we will try to pick the best event for it
    action = self.pickBestAction(key, modifiers, action);

    return {
        key: key,
        modifiers: modifiers,
        action: action
    };
};

},{"../../helpers/isModifier":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/isModifier.js","../../helpers/keysFromString":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/keysFromString.js","../../helpers/shift-map":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/shift-map.js","../../helpers/special-aliases":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-aliases.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/getMatches.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * finds all callbacks that match based on the keycode, modifiers,
 * and action
 *
 * @param {string} character
 * @param {Array} modifiers
 * @param {Event|Object} e
 * @param {string=} sequenceName - name of the sequence we are looking for
 * @param {string=} combination
 * @param {number=} level
 * @returns {Array}
 */
module.exports = function (character, modifiers, e, sequenceName, combination, level) {
    var self = this,
        j,
        callback,
        matches = [],
        action = e.type,
        isModifier,
        modifiersMatch;

    // if there are no events related to this keycode
    if (!self.callbacks[character]) {
        return [];
    }

    isModifier = require("../../helpers/isModifier");
    // if a modifier key is coming up on its own we should allow it
    if (action === "keyup" && isModifier(character)) {
        modifiers = [character];
    }

    // loop through all callbacks for the key that was pressed
    // and see if any of them match
    for (j = 0; j < self.callbacks[character].length; ++j) {
        callback = self.callbacks[character][j];

        // if a sequence name is not specified, but this is a sequence at
        // the wrong level then move onto the next match
        if (!sequenceName && callback.seq && self.sequenceLevels[callback.seq] !== callback.level) {
            continue;
        }

        // if the action we are looking for doesn't match the action we got
        // then we should keep going
        if (action !== callback.action) {
            continue;
        }

        // if this is a keypress event and the meta key and control key
        // are not pressed that means that we need to only look at the
        // character, otherwise check the modifiers as well
        //
        // chrome will not fire a keypress if meta or control is down
        // safari will fire a keypress if meta or meta+shift is down
        // firefox will fire a keypress if meta or control is down
        modifiersMatch = require("./modifiersMatch");
        if ((action === "keypress" && !e.metaKey && !e.ctrlKey) || modifiersMatch(modifiers, callback.modifiers)) {

            // when you bind a combination or sequence a second time it
            // should overwrite the first one.  if a sequenceName or
            // combination is specified in this call it does just that
            //
            // @todo make deleting its own method?
            var deleteCombo = !sequenceName && callback.combo === combination;
            var deleteSequence = sequenceName && callback.seq === sequenceName && callback.level === level;
            if (deleteCombo || deleteSequence) {
                self.callbacks[character].splice(j, 1);
            }

            matches.push(callback);
        }
    }

    return matches;
};

},{"../../helpers/isModifier":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/isModifier.js","./modifiersMatch":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/modifiersMatch.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/getReverseMap.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * reverses the map lookup so that we can look for specific keys
 * to see what can and can't use keypress
 *
 * @return {Object}
 */
module.exports = function () {
    var self = this,
        constructor = self.constructor,
        SPECIAL_KEYS_MAP;

    if (!constructor.REVERSE_MAP) {
        constructor.REVERSE_MAP = {};
        SPECIAL_KEYS_MAP = require("../../helpers/special-keys-map");
        for (var key in SPECIAL_KEYS_MAP) {

            // pull out the numeric keypad from here cause keypress should
            // be able to detect the keys from the character
            if (key > 95 && key < 112) {
                continue;
            }

            if (SPECIAL_KEYS_MAP.hasOwnProperty(key)) {
                constructor.REVERSE_MAP[SPECIAL_KEYS_MAP[key]] = key;
            }
        }
    }
    return constructor.REVERSE_MAP;
};

},{"../../helpers/special-keys-map":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-keys-map.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/handleKey.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * handles a character key event
 *
 * @param {string} character
 * @param {Array} modifiers
 * @param {Event} e
 * @returns void
 */
module.exports = function (character, modifiers, e) {
    var self = this,
        callbacks,
        j,
        doNotReset = {},
        maxLevel = 0,
        processedSequenceCallback = false,
        isModifier,
        ignoreThisKeypress;

    callbacks = self.getMatches(character, modifiers, e);
    // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
    for (j = 0; j < callbacks.length; ++j) {
        if (callbacks[j].seq) {
            maxLevel = Math.max(maxLevel, callbacks[j].level);
        }
    }

    // loop through matching callbacks for this key event
    for (j = 0; j < callbacks.length; ++j) {

        // fire for all sequence callbacks
        // this is because if for example you have multiple sequences
        // bound such as "g i" and "g t" they both need to fire the
        // callback for matching g cause otherwise you can only ever
        // match the first one
        if (callbacks[j].seq) {

            // only fire callbacks for the maxLevel to prevent
            // subsequences from also firing
            //
            // for example 'a option b' should not cause 'option b' to fire
            // even though 'option b' is part of the other sequence
            //
            // any sequences that do not match here will be discarded
            // below by the resetSequences call
            if (callbacks[j].level !== maxLevel) {
                continue;
            }

            processedSequenceCallback = true;

            // keep a list of which sequences were matches for later
            doNotReset[callbacks[j].seq] = 1;
            self.fireCallback(callbacks[j].callback, e, callbacks[j].combo, callbacks[j].seq);
            continue;
        }

        // if there were no sequence matches but we are still here
        // that means this is a regular match so we should fire that
        if (!processedSequenceCallback) {
            self.fireCallback(callbacks[j].callback, e, callbacks[j].combo);
        }
    }

    // if the key you pressed matches the type of sequence without
    // being a modifier (ie "keyup" or "keypress") then we should
    // reset all sequences that were not matched by this event
    //
    // this is so, for example, if you have the sequence "h a t" and you
    // type "h e a r t" it does not match.  in this case the "e" will
    // cause the sequence to reset
    //
    // modifier keys are ignored because you can have a sequence
    // that contains modifiers such as "enter ctrl+space" and in most
    // cases the modifier key will be pressed before the next key
    //
    // also if you have a sequence such as "ctrl+b a" then pressing the
    // "b" key will trigger a "keypress" and a "keydown"
    //
    // the "keydown" is expected when there is a modifier, but the
    // "keypress" ends up matching the nextExpectedAction since it occurs
    // after and that causes the sequence to reset
    //
    // we ignore keypresses in a sequence that directly follow a keydown
    // for the same character
    ignoreThisKeypress = e.type === "keypress" && self.ignoreNextKeypress;
    isModifier = require("../../helpers/isModifier");
    if (e.type === self.nextExpectedAction && !isModifier(character) && !ignoreThisKeypress) {
        self.resetSequences(doNotReset);
    }

    self.ignoreNextKeypress = processedSequenceCallback && e.type === "keydown";
};

},{"../../helpers/isModifier":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/isModifier.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/handleKeyEvent.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * handles a keydown event
 *
 * @param {Event} e
 * @returns void
 */
module.exports = function (e) {
    var self = this,
        characterFromEvent,
        eventModifiers;

    // normalize e.which for key events
    // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
    if (typeof e.which !== "number") {
        e.which = e.keyCode;
    }
    characterFromEvent = require("../../helpers/characterFromEvent");
    var character = characterFromEvent(e);

    // no character found then stop
    if (!character) {
        return;
    }

    // need to use === for the character check because the character can be 0
    if (e.type === "keyup" && self.ignoreNextKeyup === character) {
        self.ignoreNextKeyup = false;
        return;
    }

    eventModifiers = require("../../helpers/eventModifiers");
    self.handleKey(character, eventModifiers(e), e);
};

},{"../../helpers/characterFromEvent":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/characterFromEvent.js","../../helpers/eventModifiers":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/eventModifiers.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/modifiersMatch.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * checks if two arrays are equal
 *
 * @param {Array} modifiers1
 * @param {Array} modifiers2
 * @returns {boolean}
 */
module.exports = function (modifiers1, modifiers2) {
    return modifiers1.sort().join(",") === modifiers2.sort().join(",");
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/pickBestAction.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * picks the best action based on the key combination
 *
 * @param {string} key - character for key
 * @param {Array} modifiers
 * @param {string=} action passed in
 */
module.exports = function (key, modifiers, action) {
    var self = this;

    // if no action was picked in we should try to pick the one
    // that we think would work best for this key
    if (!action) {
        action = self.getReverseMap()[key] ? "keydown" : "keypress";
    }

    // modifier keys don't work as expected with keypress,
    // switch to keydown
    if (action === "keypress" && modifiers.length) {
        action = "keydown";
    }

    return action;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/reset.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * resets the library back to its initial state. This is useful
 * if you want to clear out the current keyboard shortcuts and bind
 * new ones - for example if you switch to another page
 *
 * @returns void
 */
module.exports = function() {
    var self = this;
    self.callbacks = {};
    self.directMap = {};
    return this;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/resetSequenceTimer.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * called to set a 1 second timeout on the specified sequence
 *
 * this is so after each key press in the sequence you have 1 second
 * to press the next key before you have to start over
 *
 * @returns void
 */
module.exports = function () {
    var self = this;

    clearTimeout(self.resetTimer);
    self.resetTimer = setTimeout(
        function() {
        self.resetSequences();
        },
        1000
    );
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/resetSequences.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * resets all sequence counters except for the ones passed in
 *
 * @param {Object} doNotReset
 * @returns void
 */
module.exports = function (doNotReset) {
    var self = this;

    doNotReset = doNotReset || {};

    var activeSequences = false,
        key;

    for (key in self.sequenceLevels) {
        if (doNotReset[key]) {
            activeSequences = true;
            continue;
        }
        self.sequenceLevels[key] = 0;
    }

    if (!activeSequences) {
        self.nextExpectedAction = false;
    }
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/stopCallback.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
* should we stop this event before firing off callbacks
*
* @param {Event} e
* @param {Element} element
* @return {boolean}
*/
module.exports = function(e, element) {

    // if the element has the class "combokeys" then no need to stop
    if ((" " + element.className + " ").indexOf(" combokeys ") > -1) {
        return false;
    }

    // stop for input, select, and textarea
    return element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA" || element.isContentEditable;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/trigger.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * triggers an event that has already been bound
 *
 * @param {string} keys
 * @param {string=} action
 * @returns void
 */
module.exports = function(keys, action) {
    if (directMap[keys + ":" + action]) {
        directMap[keys + ":" + action]({}, keys);
    }
    return this;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/prototype/unbind.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * unbinds an event to Combokeys
 *
 * the unbinding sets the callback function of the specified key combo
 * to an empty function and deletes the corresponding key in the
 * directMap dict.
 *
 * TODO: actually remove this from the callbacks dictionary instead
 * of binding an empty function
 *
 * the keycombo+action has to be exactly the same as
 * it was defined in the bind method
 *
 * @param {string|Array} keys
 * @param {string} action
 * @returns void
 */
module.exports = function(keys, action) {
    var self = this;

    return self.bind(keys, function() {}, action);
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/reset.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

module.exports = function () {
    var self = this;

    self.instances.forEach(function(combokeys) {
        combokeys.reset();
    });
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/addEvent.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * cross browser add event method
 *
 * @param {Element|HTMLDocument} object
 * @param {string} type
 * @param {Function} callback
 * @returns void
 */
module.exports = function (object, type, callback) {
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
        return;
    }

    object.attachEvent("on" + type, callback);
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/characterFromEvent.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * takes the event and returns the key character
 *
 * @param {Event} e
 * @return {string}
 */
module.exports = function (e) {
    var SPECIAL_KEYS_MAP,
        SPECIAL_CHARACTERS_MAP;
    SPECIAL_KEYS_MAP = require("./special-keys-map");
    SPECIAL_CHARACTERS_MAP = require("./special-characters-map");


    // for keypress events we should return the character as is
    if (e.type === "keypress") {
        var character = String.fromCharCode(e.which);

        // if the shift key is not pressed then it is safe to assume
        // that we want the character to be lowercase.  this means if
        // you accidentally have caps lock on then your key bindings
        // will continue to work
        //
        // the only side effect that might not be desired is if you
        // bind something like 'A' cause you want to trigger an
        // event when capital A is pressed caps lock will no longer
        // trigger the event.  shift+a will though.
        if (!e.shiftKey) {
            character = character.toLowerCase();
        }

        return character;
    }

    // for non keypress events the special maps are needed
    if (SPECIAL_KEYS_MAP[e.which]) {
        return SPECIAL_KEYS_MAP[e.which];
    }

    if (SPECIAL_CHARACTERS_MAP[e.which]) {
        return SPECIAL_CHARACTERS_MAP[e.which];
    }

    // if it is not in the special map

    // with keydown and keyup events the character seems to always
    // come in as an uppercase character whether you are pressing shift
    // or not.  we should make sure it is always lowercase for comparisons
    return String.fromCharCode(e.which).toLowerCase();
};

},{"./special-characters-map":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-characters-map.js","./special-keys-map":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-keys-map.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/eventModifiers.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * takes a key event and figures out what the modifiers are
 *
 * @param {Event} e
 * @returns {Array}
 */
module.exports = function (e) {
    var modifiers = [];

    if (e.shiftKey) {
        modifiers.push("shift");
    }

    if (e.altKey) {
        modifiers.push("alt");
    }

    if (e.ctrlKey) {
        modifiers.push("ctrl");
    }

    if (e.metaKey) {
        modifiers.push("meta");
    }

    return modifiers;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/isModifier.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * determines if the keycode specified is a modifier key or not
 *
 * @param {string} key
 * @returns {boolean}
 */
module.exports = function (key) {
    return key === "shift" || key === "ctrl" || key === "alt" || key === "meta";
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/keysFromString.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * Converts from a string key combination to an array
 *
 * @param  {string} combination like "command+shift+l"
 * @return {Array}
 */
module.exports = function (combination) {
    if (combination === "+") {
        return ["+"];
    }

    return combination.split("+");
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/preventDefault.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * prevents default for this event
 *
 * @param {Event} e
 * @returns void
 */
module.exports = function (e) {
    if (e.preventDefault) {
        e.preventDefault();
        return;
    }

    e.returnValue = false;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/shift-map.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * this is a mapping of keys that require shift on a US keypad
 * back to the non shift equivelents
 *
 * this is so you can use keyup events with these keys
 *
 * note that this will only work reliably on US keyboards
 *
 * @type {Object}
 */
module.exports = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    "$": "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    "_": "-",
    "+": "=",
    ":": ";",
    "\"": "'",
    "<": ",",
    ">": ".",
    "?": "/",
    "|": "\\"
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-aliases.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * this is a list of special strings you can use to map
 * to modifier keys when you specify your keyboard shortcuts
 *
 * @type {Object}
 */
module.exports = {
    "option": "alt",
    "command": "meta",
    "return": "enter",
    "escape": "esc",
    "mod": /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-characters-map.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * mapping for special characters so they can support
 *
 * this dictionary is only used incase you want to bind a
 * keyup or keydown event to one of these keys
 *
 * @type {Object}
 */
module.exports = {
    106: "*",
    107: "+",
    109: "-",
    110: ".",
    111: "/",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'"
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/special-keys-map.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";
/**
 * mapping of special keycodes to their corresponding keys
 *
 * everything in this dictionary cannot use keypress events
 * so it has to be here to map to the correct keycodes for
 * keyup/keydown events
 *
 * @type {Object}
 */
module.exports = {
    8: "backspace",
    9: "tab",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    20: "capslock",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    45: "ins",
    46: "del",
    91: "meta",
    93: "meta",
    224: "meta"
};

/**
 * loop through the f keys, f1 to f19 and add them to the map
 * programatically
 */
for (var i = 1; i < 20; ++i) {
    module.exports[111 + i] = "f" + i;
}

/**
 * loop through to map numbers on the numeric keypad
 */
for (i = 0; i <= 9; ++i) {
    module.exports[i + 96] = i;
}

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/helpers/stopPropagation.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

/**
 * stops propogation for this event
 *
 * @param {Event} e
 * @returns void
 */
module.exports = function (e) {
    if (e.stopPropagation) {
        e.stopPropagation();
        return;
    }

    e.cancelBubble = true;
};

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/index.js":[function(require,module,exports){
/* eslint-env node, browser */
"use strict";

module.exports = require("./Combokeys");

},{"./Combokeys":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/Combokeys/index.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/teacup/lib/teacup.js":[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var Teacup, doctypes, elements, merge_elements, tagName, _fn, _fn1, _fn2, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  doctypes = {
    'default': '<!DOCTYPE html>',
    '5': '<!DOCTYPE html>',
    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
    'ce': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "ce-html-1.0-transitional.dtd">'
  };

  elements = {
    regular: 'a abbr address article aside audio b bdi bdo blockquote body button canvas caption cite code colgroup datalist dd del details dfn div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup html i iframe ins kbd label legend li map mark menu meter nav noscript object ol optgroup option output p pre progress q rp rt ruby s samp section select small span strong sub summary sup table tbody td textarea tfoot th thead time title tr u ul video',
    raw: 'script style',
    "void": 'area base br col command embed hr img input keygen link meta param source track wbr',
    obsolete: 'applet acronym bgsound dir frameset noframes isindex listing nextid noembed plaintext rb strike xmp big blink center font marquee multicol nobr spacer tt',
    obsolete_void: 'basefont frame'
  };

  merge_elements = function() {
    var a, args, element, result, _i, _j, _len, _len1, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    result = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      a = args[_i];
      _ref = elements[a].split(' ');
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        element = _ref[_j];
        if (__indexOf.call(result, element) < 0) {
          result.push(element);
        }
      }
    }
    return result;
  };

  Teacup = (function() {
    function Teacup() {
      this.htmlOut = null;
    }

    Teacup.prototype.resetBuffer = function(html) {
      var previous;
      if (html == null) {
        html = null;
      }
      previous = this.htmlOut;
      this.htmlOut = html;
      return previous;
    };

    Teacup.prototype.render = function() {
      var args, previous, result, template;
      template = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      previous = this.resetBuffer('');
      try {
        template.apply(null, args);
      } finally {
        result = this.resetBuffer(previous);
      }
      return result;
    };

    Teacup.prototype.cede = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.render.apply(this, args);
    };

    Teacup.prototype.renderable = function(template) {
      var teacup;
      teacup = this;
      return function() {
        var args, result;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (teacup.htmlOut === null) {
          teacup.htmlOut = '';
          try {
            template.apply(this, args);
          } finally {
            result = teacup.resetBuffer();
          }
          return result;
        } else {
          return template.apply(this, args);
        }
      };
    };

    Teacup.prototype.renderAttr = function(name, value) {
      var k, v;
      if (value == null) {
        return " " + name;
      }
      if (value === false) {
        return '';
      }
      if (name === 'data' && typeof value === 'object') {
        return ((function() {
          var _results;
          _results = [];
          for (k in value) {
            v = value[k];
            _results.push(this.renderAttr("data-" + k, v));
          }
          return _results;
        }).call(this)).join('');
      }
      if (value === true) {
        value = name;
      }
      return " " + name + "=" + (this.quote(this.escape(value.toString())));
    };

    Teacup.prototype.attrOrder = ['id', 'class'];

    Teacup.prototype.renderAttrs = function(obj) {
      var name, result, value, _i, _len, _ref;
      result = '';
      _ref = this.attrOrder;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (!(name in obj)) {
          continue;
        }
        result += this.renderAttr(name, obj[name]);
        delete obj[name];
      }
      for (name in obj) {
        value = obj[name];
        result += this.renderAttr(name, value);
      }
      return result;
    };

    Teacup.prototype.renderContents = function(contents) {
      var result;
      if (contents == null) {

      } else if (typeof contents === 'function') {
        result = contents.call(this);
        if (typeof result === 'string') {
          return this.text(result);
        }
      } else {
        return this.text(contents);
      }
    };

    Teacup.prototype.isSelector = function(string) {
      var _ref;
      return string.length > 1 && ((_ref = string.charAt(0)) === '#' || _ref === '.');
    };

    Teacup.prototype.parseSelector = function(selector) {
      var classes, id, klass, token, _i, _len, _ref, _ref1;
      id = null;
      classes = [];
      _ref = selector.split('.');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        token = _ref[_i];
        token = token.trim();
        if (id) {
          classes.push(token);
        } else {
          _ref1 = token.split('#'), klass = _ref1[0], id = _ref1[1];
          if (klass !== '') {
            classes.push(token);
          }
        }
      }
      return {
        id: id,
        classes: classes
      };
    };

    Teacup.prototype.normalizeArgs = function(args) {
      var arg, attrs, classes, contents, id, index, selector, _i, _len;
      attrs = {};
      selector = null;
      contents = null;
      for (index = _i = 0, _len = args.length; _i < _len; index = ++_i) {
        arg = args[index];
        if (arg != null) {
          switch (typeof arg) {
            case 'string':
              if (index === 0 && this.isSelector(arg)) {
                selector = this.parseSelector(arg);
              } else {
                contents = arg;
              }
              break;
            case 'function':
            case 'number':
            case 'boolean':
              contents = arg;
              break;
            case 'object':
              if (arg.constructor === Object) {
                attrs = arg;
              } else {
                contents = arg;
              }
              break;
            default:
              contents = arg;
          }
        }
      }
      if (selector != null) {
        id = selector.id, classes = selector.classes;
        if (id != null) {
          attrs.id = id;
        }
        if (classes != null ? classes.length : void 0) {
          if (attrs["class"]) {
            classes.push(attrs["class"]);
          }
          attrs["class"] = classes.join(' ');
        }
      }
      return {
        attrs: attrs,
        contents: contents
      };
    };

    Teacup.prototype.tag = function() {
      var args, attrs, contents, tagName, _ref;
      tagName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this.normalizeArgs(args), attrs = _ref.attrs, contents = _ref.contents;
      this.raw("<" + tagName + (this.renderAttrs(attrs)) + ">");
      this.renderContents(contents);
      return this.raw("</" + tagName + ">");
    };

    Teacup.prototype.rawTag = function() {
      var args, attrs, contents, tagName, _ref;
      tagName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this.normalizeArgs(args), attrs = _ref.attrs, contents = _ref.contents;
      this.raw("<" + tagName + (this.renderAttrs(attrs)) + ">");
      this.raw(contents);
      return this.raw("</" + tagName + ">");
    };

    Teacup.prototype.selfClosingTag = function() {
      var args, attrs, contents, tag, _ref;
      tag = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this.normalizeArgs(args), attrs = _ref.attrs, contents = _ref.contents;
      if (contents) {
        throw new Error("Teacup: <" + tag + "/> must not have content.  Attempted to nest " + contents);
      }
      return this.raw("<" + tag + (this.renderAttrs(attrs)) + " />");
    };

    Teacup.prototype.coffeescript = function(fn) {
      return this.raw("<script type=\"text/javascript\">(function() {\n  var __slice = [].slice,\n      __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },\n      __hasProp = {}.hasOwnProperty,\n      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };\n  (" + (fn.toString()) + ")();\n})();</script>");
    };

    Teacup.prototype.comment = function(text) {
      return this.raw("<!--" + (this.escape(text)) + "-->");
    };

    Teacup.prototype.doctype = function(type) {
      if (type == null) {
        type = 5;
      }
      return this.raw(doctypes[type]);
    };

    Teacup.prototype.ie = function(condition, contents) {
      this.raw("<!--[if " + (this.escape(condition)) + "]>");
      this.renderContents(contents);
      return this.raw("<![endif]-->");
    };

    Teacup.prototype.text = function(s) {
      if (this.htmlOut == null) {
        throw new Error("Teacup: can't call a tag function outside a rendering context");
      }
      this.htmlOut += (s != null) && this.escape(s.toString()) || '';
      return null;
    };

    Teacup.prototype.raw = function(s) {
      if (s == null) {
        return;
      }
      this.htmlOut += s;
      return null;
    };

    Teacup.prototype.escape = function(text) {
      return text.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    Teacup.prototype.quote = function(value) {
      return "\"" + value + "\"";
    };

    Teacup.prototype.use = function(plugin) {
      return plugin(this);
    };

    Teacup.prototype.tags = function() {
      var bound, boundMethodNames, method, _fn, _i, _len;
      bound = {};
      boundMethodNames = [].concat('cede coffeescript comment doctype escape ie normalizeArgs raw render renderable script tag text use'.split(' '), merge_elements('regular', 'obsolete', 'raw', 'void', 'obsolete_void'));
      _fn = (function(_this) {
        return function(method) {
          return bound[method] = function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return _this[method].apply(_this, args);
          };
        };
      })(this);
      for (_i = 0, _len = boundMethodNames.length; _i < _len; _i++) {
        method = boundMethodNames[_i];
        _fn(method);
      }
      return bound;
    };

    return Teacup;

  })();

  _ref = merge_elements('regular', 'obsolete');
  _fn = function(tagName) {
    return Teacup.prototype[tagName] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.tag.apply(this, [tagName].concat(__slice.call(args)));
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    tagName = _ref[_i];
    _fn(tagName);
  }

  _ref1 = merge_elements('raw');
  _fn1 = function(tagName) {
    return Teacup.prototype[tagName] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.rawTag.apply(this, [tagName].concat(__slice.call(args)));
    };
  };
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    tagName = _ref1[_j];
    _fn1(tagName);
  }

  _ref2 = merge_elements('void', 'obsolete_void');
  _fn2 = function(tagName) {
    return Teacup.prototype[tagName] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.selfClosingTag.apply(this, [tagName].concat(__slice.call(args)));
    };
  };
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    tagName = _ref2[_k];
    _fn2(tagName);
  }

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports = new Teacup().tags();
    module.exports.Teacup = Teacup;
  } else if (typeof define === 'function' && define.amd) {
    define('teacup', [], function() {
      return new Teacup().tags();
    });
  } else {
    window.teacup = new Teacup().tags();
    window.teacup.Teacup = Teacup;
  }

}).call(this);

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/underscore/underscore.js":[function(require,module,exports){
module.exports=require("/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/node_modules/underscore/underscore.js")
},{"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/node_modules/underscore/underscore.js":"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/node_modules/underscore/underscore.js"}],"/Users/bobbygrace/Code/lore-opossum/node_modules/zeptojs/zepto.js":[function(require,module,exports){
/* Zepto v1.1.4 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = []
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

module.exports = Zepto

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)

},{}],"/Users/bobbygrace/Code/lore-opossum/node_modules/zeroclipboard/dist/ZeroClipboard.js":[function(require,module,exports){
/*!
 * ZeroClipboard
 * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
 * Copyright (c) 2014 Jon Rohan, James M. Greene
 * Licensed MIT
 * http://zeroclipboard.org/
 * v2.1.6
 */
(function(window, undefined) {
  "use strict";
  /**
 * Store references to critically important global functions that may be
 * overridden on certain web pages.
 */
  var _window = window, _document = _window.document, _navigator = _window.navigator, _setTimeout = _window.setTimeout, _encodeURIComponent = _window.encodeURIComponent, _ActiveXObject = _window.ActiveXObject, _Error = _window.Error, _parseInt = _window.Number.parseInt || _window.parseInt, _parseFloat = _window.Number.parseFloat || _window.parseFloat, _isNaN = _window.Number.isNaN || _window.isNaN, _round = _window.Math.round, _now = _window.Date.now, _keys = _window.Object.keys, _defineProperty = _window.Object.defineProperty, _hasOwn = _window.Object.prototype.hasOwnProperty, _slice = _window.Array.prototype.slice, _unwrap = function() {
    var unwrapper = function(el) {
      return el;
    };
    if (typeof _window.wrap === "function" && typeof _window.unwrap === "function") {
      try {
        var div = _document.createElement("div");
        var unwrappedDiv = _window.unwrap(div);
        if (div.nodeType === 1 && unwrappedDiv && unwrappedDiv.nodeType === 1) {
          unwrapper = _window.unwrap;
        }
      } catch (e) {}
    }
    return unwrapper;
  }();
  /**
 * Convert an `arguments` object into an Array.
 *
 * @returns The arguments as an Array
 * @private
 */
  var _args = function(argumentsObj) {
    return _slice.call(argumentsObj, 0);
  };
  /**
 * Shallow-copy the owned, enumerable properties of one object over to another, similar to jQuery's `$.extend`.
 *
 * @returns The target object, augmented
 * @private
 */
  var _extend = function() {
    var i, len, arg, prop, src, copy, args = _args(arguments), target = args[0] || {};
    for (i = 1, len = args.length; i < len; i++) {
      if ((arg = args[i]) != null) {
        for (prop in arg) {
          if (_hasOwn.call(arg, prop)) {
            src = target[prop];
            copy = arg[prop];
            if (target !== copy && copy !== undefined) {
              target[prop] = copy;
            }
          }
        }
      }
    }
    return target;
  };
  /**
 * Return a deep copy of the source object or array.
 *
 * @returns Object or Array
 * @private
 */
  var _deepCopy = function(source) {
    var copy, i, len, prop;
    if (typeof source !== "object" || source == null) {
      copy = source;
    } else if (typeof source.length === "number") {
      copy = [];
      for (i = 0, len = source.length; i < len; i++) {
        if (_hasOwn.call(source, i)) {
          copy[i] = _deepCopy(source[i]);
        }
      }
    } else {
      copy = {};
      for (prop in source) {
        if (_hasOwn.call(source, prop)) {
          copy[prop] = _deepCopy(source[prop]);
        }
      }
    }
    return copy;
  };
  /**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to keep.
 * The inverse of `_omit`, mostly. The big difference is that these properties do NOT need to be enumerable to
 * be kept.
 *
 * @returns A new filtered object.
 * @private
 */
  var _pick = function(obj, keys) {
    var newObj = {};
    for (var i = 0, len = keys.length; i < len; i++) {
      if (keys[i] in obj) {
        newObj[keys[i]] = obj[keys[i]];
      }
    }
    return newObj;
  };
  /**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to omit.
 * The inverse of `_pick`.
 *
 * @returns A new filtered object.
 * @private
 */
  var _omit = function(obj, keys) {
    var newObj = {};
    for (var prop in obj) {
      if (keys.indexOf(prop) === -1) {
        newObj[prop] = obj[prop];
      }
    }
    return newObj;
  };
  /**
 * Remove all owned, enumerable properties from an object.
 *
 * @returns The original object without its owned, enumerable properties.
 * @private
 */
  var _deleteOwnProperties = function(obj) {
    if (obj) {
      for (var prop in obj) {
        if (_hasOwn.call(obj, prop)) {
          delete obj[prop];
        }
      }
    }
    return obj;
  };
  /**
 * Determine if an element is contained within another element.
 *
 * @returns Boolean
 * @private
 */
  var _containedBy = function(el, ancestorEl) {
    if (el && el.nodeType === 1 && el.ownerDocument && ancestorEl && (ancestorEl.nodeType === 1 && ancestorEl.ownerDocument && ancestorEl.ownerDocument === el.ownerDocument || ancestorEl.nodeType === 9 && !ancestorEl.ownerDocument && ancestorEl === el.ownerDocument)) {
      do {
        if (el === ancestorEl) {
          return true;
        }
        el = el.parentNode;
      } while (el);
    }
    return false;
  };
  /**
 * Get the URL path's parent directory.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getDirPathOfUrl = function(url) {
    var dir;
    if (typeof url === "string" && url) {
      dir = url.split("#")[0].split("?")[0];
      dir = url.slice(0, url.lastIndexOf("/") + 1);
    }
    return dir;
  };
  /**
 * Get the current script's URL by throwing an `Error` and analyzing it.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrlFromErrorStack = function(stack) {
    var url, matches;
    if (typeof stack === "string" && stack) {
      matches = stack.match(/^(?:|[^:@]*@|.+\)@(?=http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
      if (matches && matches[1]) {
        url = matches[1];
      } else {
        matches = stack.match(/\)@((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
        if (matches && matches[1]) {
          url = matches[1];
        }
      }
    }
    return url;
  };
  /**
 * Get the current script's URL by throwing an `Error` and analyzing it.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrlFromError = function() {
    var url, err;
    try {
      throw new _Error();
    } catch (e) {
      err = e;
    }
    if (err) {
      url = err.sourceURL || err.fileName || _getCurrentScriptUrlFromErrorStack(err.stack);
    }
    return url;
  };
  /**
 * Get the current script's URL.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrl = function() {
    var jsPath, scripts, i;
    if (_document.currentScript && (jsPath = _document.currentScript.src)) {
      return jsPath;
    }
    scripts = _document.getElementsByTagName("script");
    if (scripts.length === 1) {
      return scripts[0].src || undefined;
    }
    if ("readyState" in scripts[0]) {
      for (i = scripts.length; i--; ) {
        if (scripts[i].readyState === "interactive" && (jsPath = scripts[i].src)) {
          return jsPath;
        }
      }
    }
    if (_document.readyState === "loading" && (jsPath = scripts[scripts.length - 1].src)) {
      return jsPath;
    }
    if (jsPath = _getCurrentScriptUrlFromError()) {
      return jsPath;
    }
    return undefined;
  };
  /**
 * Get the unanimous parent directory of ALL script tags.
 * If any script tags are either (a) inline or (b) from differing parent
 * directories, this method must return `undefined`.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getUnanimousScriptParentDir = function() {
    var i, jsDir, jsPath, scripts = _document.getElementsByTagName("script");
    for (i = scripts.length; i--; ) {
      if (!(jsPath = scripts[i].src)) {
        jsDir = null;
        break;
      }
      jsPath = _getDirPathOfUrl(jsPath);
      if (jsDir == null) {
        jsDir = jsPath;
      } else if (jsDir !== jsPath) {
        jsDir = null;
        break;
      }
    }
    return jsDir || undefined;
  };
  /**
 * Get the presumed location of the "ZeroClipboard.swf" file, based on the location
 * of the executing JavaScript file (e.g. "ZeroClipboard.js", etc.).
 *
 * @returns String
 * @private
 */
  var _getDefaultSwfPath = function() {
    var jsDir = _getDirPathOfUrl(_getCurrentScriptUrl()) || _getUnanimousScriptParentDir() || "";
    return jsDir + "ZeroClipboard.swf";
  };
  /**
 * Keep track of the state of the Flash object.
 * @private
 */
  var _flashState = {
    bridge: null,
    version: "0.0.0",
    pluginType: "unknown",
    disabled: null,
    outdated: null,
    unavailable: null,
    deactivated: null,
    overdue: null,
    ready: null
  };
  /**
 * The minimum Flash Player version required to use ZeroClipboard completely.
 * @readonly
 * @private
 */
  var _minimumFlashVersion = "11.0.0";
  /**
 * Keep track of all event listener registrations.
 * @private
 */
  var _handlers = {};
  /**
 * Keep track of the currently activated element.
 * @private
 */
  var _currentElement;
  /**
 * Keep track of the element that was activated when a `copy` process started.
 * @private
 */
  var _copyTarget;
  /**
 * Keep track of data for the pending clipboard transaction.
 * @private
 */
  var _clipData = {};
  /**
 * Keep track of data formats for the pending clipboard transaction.
 * @private
 */
  var _clipDataFormatMap = null;
  /**
 * The `message` store for events
 * @private
 */
  var _eventMessages = {
    ready: "Flash communication is established",
    error: {
      "flash-disabled": "Flash is disabled or not installed",
      "flash-outdated": "Flash is too outdated to support ZeroClipboard",
      "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
      "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate",
      "flash-overdue": "Flash communication was established but NOT within the acceptable time limit"
    }
  };
  /**
 * ZeroClipboard configuration defaults for the Core module.
 * @private
 */
  var _globalConfig = {
    swfPath: _getDefaultSwfPath(),
    trustedDomains: window.location.host ? [ window.location.host ] : [],
    cacheBust: true,
    forceEnhancedClipboard: false,
    flashLoadTimeout: 3e4,
    autoActivate: true,
    bubbleEvents: true,
    containerId: "global-zeroclipboard-html-bridge",
    containerClass: "global-zeroclipboard-container",
    swfObjectId: "global-zeroclipboard-flash-bridge",
    hoverClass: "zeroclipboard-is-hover",
    activeClass: "zeroclipboard-is-active",
    forceHandCursor: false,
    title: null,
    zIndex: 999999999
  };
  /**
 * The underlying implementation of `ZeroClipboard.config`.
 * @private
 */
  var _config = function(options) {
    if (typeof options === "object" && options !== null) {
      for (var prop in options) {
        if (_hasOwn.call(options, prop)) {
          if (/^(?:forceHandCursor|title|zIndex|bubbleEvents)$/.test(prop)) {
            _globalConfig[prop] = options[prop];
          } else if (_flashState.bridge == null) {
            if (prop === "containerId" || prop === "swfObjectId") {
              if (_isValidHtml4Id(options[prop])) {
                _globalConfig[prop] = options[prop];
              } else {
                throw new Error("The specified `" + prop + "` value is not valid as an HTML4 Element ID");
              }
            } else {
              _globalConfig[prop] = options[prop];
            }
          }
        }
      }
    }
    if (typeof options === "string" && options) {
      if (_hasOwn.call(_globalConfig, options)) {
        return _globalConfig[options];
      }
      return;
    }
    return _deepCopy(_globalConfig);
  };
  /**
 * The underlying implementation of `ZeroClipboard.state`.
 * @private
 */
  var _state = function() {
    return {
      browser: _pick(_navigator, [ "userAgent", "platform", "appName" ]),
      flash: _omit(_flashState, [ "bridge" ]),
      zeroclipboard: {
        version: ZeroClipboard.version,
        config: ZeroClipboard.config()
      }
    };
  };
  /**
 * The underlying implementation of `ZeroClipboard.isFlashUnusable`.
 * @private
 */
  var _isFlashUnusable = function() {
    return !!(_flashState.disabled || _flashState.outdated || _flashState.unavailable || _flashState.deactivated);
  };
  /**
 * The underlying implementation of `ZeroClipboard.on`.
 * @private
 */
  var _on = function(eventType, listener) {
    var i, len, events, added = {};
    if (typeof eventType === "string" && eventType) {
      events = eventType.toLowerCase().split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          ZeroClipboard.on(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].replace(/^on/, "");
        added[eventType] = true;
        if (!_handlers[eventType]) {
          _handlers[eventType] = [];
        }
        _handlers[eventType].push(listener);
      }
      if (added.ready && _flashState.ready) {
        ZeroClipboard.emit({
          type: "ready"
        });
      }
      if (added.error) {
        var errorTypes = [ "disabled", "outdated", "unavailable", "deactivated", "overdue" ];
        for (i = 0, len = errorTypes.length; i < len; i++) {
          if (_flashState[errorTypes[i]] === true) {
            ZeroClipboard.emit({
              type: "error",
              name: "flash-" + errorTypes[i]
            });
            break;
          }
        }
      }
    }
    return ZeroClipboard;
  };
  /**
 * The underlying implementation of `ZeroClipboard.off`.
 * @private
 */
  var _off = function(eventType, listener) {
    var i, len, foundIndex, events, perEventHandlers;
    if (arguments.length === 0) {
      events = _keys(_handlers);
    } else if (typeof eventType === "string" && eventType) {
      events = eventType.split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          ZeroClipboard.off(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].toLowerCase().replace(/^on/, "");
        perEventHandlers = _handlers[eventType];
        if (perEventHandlers && perEventHandlers.length) {
          if (listener) {
            foundIndex = perEventHandlers.indexOf(listener);
            while (foundIndex !== -1) {
              perEventHandlers.splice(foundIndex, 1);
              foundIndex = perEventHandlers.indexOf(listener, foundIndex);
            }
          } else {
            perEventHandlers.length = 0;
          }
        }
      }
    }
    return ZeroClipboard;
  };
  /**
 * The underlying implementation of `ZeroClipboard.handlers`.
 * @private
 */
  var _listeners = function(eventType) {
    var copy;
    if (typeof eventType === "string" && eventType) {
      copy = _deepCopy(_handlers[eventType]) || null;
    } else {
      copy = _deepCopy(_handlers);
    }
    return copy;
  };
  /**
 * The underlying implementation of `ZeroClipboard.emit`.
 * @private
 */
  var _emit = function(event) {
    var eventCopy, returnVal, tmp;
    event = _createEvent(event);
    if (!event) {
      return;
    }
    if (_preprocessEvent(event)) {
      return;
    }
    if (event.type === "ready" && _flashState.overdue === true) {
      return ZeroClipboard.emit({
        type: "error",
        name: "flash-overdue"
      });
    }
    eventCopy = _extend({}, event);
    _dispatchCallbacks.call(this, eventCopy);
    if (event.type === "copy") {
      tmp = _mapClipDataToFlash(_clipData);
      returnVal = tmp.data;
      _clipDataFormatMap = tmp.formatMap;
    }
    return returnVal;
  };
  /**
 * The underlying implementation of `ZeroClipboard.create`.
 * @private
 */
  var _create = function() {
    if (typeof _flashState.ready !== "boolean") {
      _flashState.ready = false;
    }
    if (!ZeroClipboard.isFlashUnusable() && _flashState.bridge === null) {
      var maxWait = _globalConfig.flashLoadTimeout;
      if (typeof maxWait === "number" && maxWait >= 0) {
        _setTimeout(function() {
          if (typeof _flashState.deactivated !== "boolean") {
            _flashState.deactivated = true;
          }
          if (_flashState.deactivated === true) {
            ZeroClipboard.emit({
              type: "error",
              name: "flash-deactivated"
            });
          }
        }, maxWait);
      }
      _flashState.overdue = false;
      _embedSwf();
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.destroy`.
 * @private
 */
  var _destroy = function() {
    ZeroClipboard.clearData();
    ZeroClipboard.blur();
    ZeroClipboard.emit("destroy");
    _unembedSwf();
    ZeroClipboard.off();
  };
  /**
 * The underlying implementation of `ZeroClipboard.setData`.
 * @private
 */
  var _setData = function(format, data) {
    var dataObj;
    if (typeof format === "object" && format && typeof data === "undefined") {
      dataObj = format;
      ZeroClipboard.clearData();
    } else if (typeof format === "string" && format) {
      dataObj = {};
      dataObj[format] = data;
    } else {
      return;
    }
    for (var dataFormat in dataObj) {
      if (typeof dataFormat === "string" && dataFormat && _hasOwn.call(dataObj, dataFormat) && typeof dataObj[dataFormat] === "string" && dataObj[dataFormat]) {
        _clipData[dataFormat] = dataObj[dataFormat];
      }
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.clearData`.
 * @private
 */
  var _clearData = function(format) {
    if (typeof format === "undefined") {
      _deleteOwnProperties(_clipData);
      _clipDataFormatMap = null;
    } else if (typeof format === "string" && _hasOwn.call(_clipData, format)) {
      delete _clipData[format];
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.getData`.
 * @private
 */
  var _getData = function(format) {
    if (typeof format === "undefined") {
      return _deepCopy(_clipData);
    } else if (typeof format === "string" && _hasOwn.call(_clipData, format)) {
      return _clipData[format];
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.focus`/`ZeroClipboard.activate`.
 * @private
 */
  var _focus = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    if (_currentElement) {
      _removeClass(_currentElement, _globalConfig.activeClass);
      if (_currentElement !== element) {
        _removeClass(_currentElement, _globalConfig.hoverClass);
      }
    }
    _currentElement = element;
    _addClass(element, _globalConfig.hoverClass);
    var newTitle = element.getAttribute("title") || _globalConfig.title;
    if (typeof newTitle === "string" && newTitle) {
      var htmlBridge = _getHtmlBridge(_flashState.bridge);
      if (htmlBridge) {
        htmlBridge.setAttribute("title", newTitle);
      }
    }
    var useHandCursor = _globalConfig.forceHandCursor === true || _getStyle(element, "cursor") === "pointer";
    _setHandCursor(useHandCursor);
    _reposition();
  };
  /**
 * The underlying implementation of `ZeroClipboard.blur`/`ZeroClipboard.deactivate`.
 * @private
 */
  var _blur = function() {
    var htmlBridge = _getHtmlBridge(_flashState.bridge);
    if (htmlBridge) {
      htmlBridge.removeAttribute("title");
      htmlBridge.style.left = "0px";
      htmlBridge.style.top = "-9999px";
      htmlBridge.style.width = "1px";
      htmlBridge.style.top = "1px";
    }
    if (_currentElement) {
      _removeClass(_currentElement, _globalConfig.hoverClass);
      _removeClass(_currentElement, _globalConfig.activeClass);
      _currentElement = null;
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.activeElement`.
 * @private
 */
  var _activeElement = function() {
    return _currentElement || null;
  };
  /**
 * Check if a value is a valid HTML4 `ID` or `Name` token.
 * @private
 */
  var _isValidHtml4Id = function(id) {
    return typeof id === "string" && id && /^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(id);
  };
  /**
 * Create or update an `event` object, based on the `eventType`.
 * @private
 */
  var _createEvent = function(event) {
    var eventType;
    if (typeof event === "string" && event) {
      eventType = event;
      event = {};
    } else if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
      eventType = event.type;
    }
    if (!eventType) {
      return;
    }
    if (!event.target && /^(copy|aftercopy|_click)$/.test(eventType.toLowerCase())) {
      event.target = _copyTarget;
    }
    _extend(event, {
      type: eventType.toLowerCase(),
      target: event.target || _currentElement || null,
      relatedTarget: event.relatedTarget || null,
      currentTarget: _flashState && _flashState.bridge || null,
      timeStamp: event.timeStamp || _now() || null
    });
    var msg = _eventMessages[event.type];
    if (event.type === "error" && event.name && msg) {
      msg = msg[event.name];
    }
    if (msg) {
      event.message = msg;
    }
    if (event.type === "ready") {
      _extend(event, {
        target: null,
        version: _flashState.version
      });
    }
    if (event.type === "error") {
      if (/^flash-(disabled|outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
        _extend(event, {
          target: null,
          minimumVersion: _minimumFlashVersion
        });
      }
      if (/^flash-(outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
        _extend(event, {
          version: _flashState.version
        });
      }
    }
    if (event.type === "copy") {
      event.clipboardData = {
        setData: ZeroClipboard.setData,
        clearData: ZeroClipboard.clearData
      };
    }
    if (event.type === "aftercopy") {
      event = _mapClipResultsFromFlash(event, _clipDataFormatMap);
    }
    if (event.target && !event.relatedTarget) {
      event.relatedTarget = _getRelatedTarget(event.target);
    }
    event = _addMouseData(event);
    return event;
  };
  /**
 * Get a relatedTarget from the target's `data-clipboard-target` attribute
 * @private
 */
  var _getRelatedTarget = function(targetEl) {
    var relatedTargetId = targetEl && targetEl.getAttribute && targetEl.getAttribute("data-clipboard-target");
    return relatedTargetId ? _document.getElementById(relatedTargetId) : null;
  };
  /**
 * Add element and position data to `MouseEvent` instances
 * @private
 */
  var _addMouseData = function(event) {
    if (event && /^_(?:click|mouse(?:over|out|down|up|move))$/.test(event.type)) {
      var srcElement = event.target;
      var fromElement = event.type === "_mouseover" && event.relatedTarget ? event.relatedTarget : undefined;
      var toElement = event.type === "_mouseout" && event.relatedTarget ? event.relatedTarget : undefined;
      var pos = _getDOMObjectPosition(srcElement);
      var screenLeft = _window.screenLeft || _window.screenX || 0;
      var screenTop = _window.screenTop || _window.screenY || 0;
      var scrollLeft = _document.body.scrollLeft + _document.documentElement.scrollLeft;
      var scrollTop = _document.body.scrollTop + _document.documentElement.scrollTop;
      var pageX = pos.left + (typeof event._stageX === "number" ? event._stageX : 0);
      var pageY = pos.top + (typeof event._stageY === "number" ? event._stageY : 0);
      var clientX = pageX - scrollLeft;
      var clientY = pageY - scrollTop;
      var screenX = screenLeft + clientX;
      var screenY = screenTop + clientY;
      var moveX = typeof event.movementX === "number" ? event.movementX : 0;
      var moveY = typeof event.movementY === "number" ? event.movementY : 0;
      delete event._stageX;
      delete event._stageY;
      _extend(event, {
        srcElement: srcElement,
        fromElement: fromElement,
        toElement: toElement,
        screenX: screenX,
        screenY: screenY,
        pageX: pageX,
        pageY: pageY,
        clientX: clientX,
        clientY: clientY,
        x: clientX,
        y: clientY,
        movementX: moveX,
        movementY: moveY,
        offsetX: 0,
        offsetY: 0,
        layerX: 0,
        layerY: 0
      });
    }
    return event;
  };
  /**
 * Determine if an event's registered handlers should be execute synchronously or asynchronously.
 *
 * @returns {boolean}
 * @private
 */
  var _shouldPerformAsync = function(event) {
    var eventType = event && typeof event.type === "string" && event.type || "";
    return !/^(?:(?:before)?copy|destroy)$/.test(eventType);
  };
  /**
 * Control if a callback should be executed asynchronously or not.
 *
 * @returns `undefined`
 * @private
 */
  var _dispatchCallback = function(func, context, args, async) {
    if (async) {
      _setTimeout(function() {
        func.apply(context, args);
      }, 0);
    } else {
      func.apply(context, args);
    }
  };
  /**
 * Handle the actual dispatching of events to client instances.
 *
 * @returns `undefined`
 * @private
 */
  var _dispatchCallbacks = function(event) {
    if (!(typeof event === "object" && event && event.type)) {
      return;
    }
    var async = _shouldPerformAsync(event);
    var wildcardTypeHandlers = _handlers["*"] || [];
    var specificTypeHandlers = _handlers[event.type] || [];
    var handlers = wildcardTypeHandlers.concat(specificTypeHandlers);
    if (handlers && handlers.length) {
      var i, len, func, context, eventCopy, originalContext = this;
      for (i = 0, len = handlers.length; i < len; i++) {
        func = handlers[i];
        context = originalContext;
        if (typeof func === "string" && typeof _window[func] === "function") {
          func = _window[func];
        }
        if (typeof func === "object" && func && typeof func.handleEvent === "function") {
          context = func;
          func = func.handleEvent;
        }
        if (typeof func === "function") {
          eventCopy = _extend({}, event);
          _dispatchCallback(func, context, [ eventCopy ], async);
        }
      }
    }
    return this;
  };
  /**
 * Preprocess any special behaviors, reactions, or state changes after receiving this event.
 * Executes only once per event emitted, NOT once per client.
 * @private
 */
  var _preprocessEvent = function(event) {
    var element = event.target || _currentElement || null;
    var sourceIsSwf = event._source === "swf";
    delete event._source;
    var flashErrorNames = [ "flash-disabled", "flash-outdated", "flash-unavailable", "flash-deactivated", "flash-overdue" ];
    switch (event.type) {
     case "error":
      if (flashErrorNames.indexOf(event.name) !== -1) {
        _extend(_flashState, {
          disabled: event.name === "flash-disabled",
          outdated: event.name === "flash-outdated",
          unavailable: event.name === "flash-unavailable",
          deactivated: event.name === "flash-deactivated",
          overdue: event.name === "flash-overdue",
          ready: false
        });
      }
      break;

     case "ready":
      var wasDeactivated = _flashState.deactivated === true;
      _extend(_flashState, {
        disabled: false,
        outdated: false,
        unavailable: false,
        deactivated: false,
        overdue: wasDeactivated,
        ready: !wasDeactivated
      });
      break;

     case "beforecopy":
      _copyTarget = element;
      break;

     case "copy":
      var textContent, htmlContent, targetEl = event.relatedTarget;
      if (!(_clipData["text/html"] || _clipData["text/plain"]) && targetEl && (htmlContent = targetEl.value || targetEl.outerHTML || targetEl.innerHTML) && (textContent = targetEl.value || targetEl.textContent || targetEl.innerText)) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
        if (htmlContent !== textContent) {
          event.clipboardData.setData("text/html", htmlContent);
        }
      } else if (!_clipData["text/plain"] && event.target && (textContent = event.target.getAttribute("data-clipboard-text"))) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
      }
      break;

     case "aftercopy":
      ZeroClipboard.clearData();
      if (element && element !== _safeActiveElement() && element.focus) {
        element.focus();
      }
      break;

     case "_mouseover":
      ZeroClipboard.focus(element);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        if (element && element !== event.relatedTarget && !_containedBy(event.relatedTarget, element)) {
          _fireMouseEvent(_extend({}, event, {
            type: "mouseenter",
            bubbles: false,
            cancelable: false
          }));
        }
        _fireMouseEvent(_extend({}, event, {
          type: "mouseover"
        }));
      }
      break;

     case "_mouseout":
      ZeroClipboard.blur();
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        if (element && element !== event.relatedTarget && !_containedBy(event.relatedTarget, element)) {
          _fireMouseEvent(_extend({}, event, {
            type: "mouseleave",
            bubbles: false,
            cancelable: false
          }));
        }
        _fireMouseEvent(_extend({}, event, {
          type: "mouseout"
        }));
      }
      break;

     case "_mousedown":
      _addClass(element, _globalConfig.activeClass);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_mouseup":
      _removeClass(element, _globalConfig.activeClass);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_click":
      _copyTarget = null;
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_mousemove":
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;
    }
    if (/^_(?:click|mouse(?:over|out|down|up|move))$/.test(event.type)) {
      return true;
    }
  };
  /**
 * Dispatch a synthetic MouseEvent.
 *
 * @returns `undefined`
 * @private
 */
  var _fireMouseEvent = function(event) {
    if (!(event && typeof event.type === "string" && event)) {
      return;
    }
    var e, target = event.target || null, doc = target && target.ownerDocument || _document, defaults = {
      view: doc.defaultView || _window,
      canBubble: true,
      cancelable: true,
      detail: event.type === "click" ? 1 : 0,
      button: typeof event.which === "number" ? event.which - 1 : typeof event.button === "number" ? event.button : doc.createEvent ? 0 : 1
    }, args = _extend(defaults, event);
    if (!target) {
      return;
    }
    if (doc.createEvent && target.dispatchEvent) {
      args = [ args.type, args.canBubble, args.cancelable, args.view, args.detail, args.screenX, args.screenY, args.clientX, args.clientY, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, args.button, args.relatedTarget ];
      e = doc.createEvent("MouseEvents");
      if (e.initMouseEvent) {
        e.initMouseEvent.apply(e, args);
        e._source = "js";
        target.dispatchEvent(e);
      }
    }
  };
  /**
 * Create the HTML bridge element to embed the Flash object into.
 * @private
 */
  var _createHtmlBridge = function() {
    var container = _document.createElement("div");
    container.id = _globalConfig.containerId;
    container.className = _globalConfig.containerClass;
    container.style.position = "absolute";
    container.style.left = "0px";
    container.style.top = "-9999px";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.zIndex = "" + _getSafeZIndex(_globalConfig.zIndex);
    return container;
  };
  /**
 * Get the HTML element container that wraps the Flash bridge object/element.
 * @private
 */
  var _getHtmlBridge = function(flashBridge) {
    var htmlBridge = flashBridge && flashBridge.parentNode;
    while (htmlBridge && htmlBridge.nodeName === "OBJECT" && htmlBridge.parentNode) {
      htmlBridge = htmlBridge.parentNode;
    }
    return htmlBridge || null;
  };
  /**
 * Create the SWF object.
 *
 * @returns The SWF object reference.
 * @private
 */
  var _embedSwf = function() {
    var len, flashBridge = _flashState.bridge, container = _getHtmlBridge(flashBridge);
    if (!flashBridge) {
      var allowScriptAccess = _determineScriptAccess(_window.location.host, _globalConfig);
      var allowNetworking = allowScriptAccess === "never" ? "none" : "all";
      var flashvars = _vars(_globalConfig);
      var swfUrl = _globalConfig.swfPath + _cacheBust(_globalConfig.swfPath, _globalConfig);
      container = _createHtmlBridge();
      var divToBeReplaced = _document.createElement("div");
      container.appendChild(divToBeReplaced);
      _document.body.appendChild(container);
      var tmpDiv = _document.createElement("div");
      var oldIE = _flashState.pluginType === "activex";
      tmpDiv.innerHTML = '<object id="' + _globalConfig.swfObjectId + '" name="' + _globalConfig.swfObjectId + '" ' + 'width="100%" height="100%" ' + (oldIE ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : 'type="application/x-shockwave-flash" data="' + swfUrl + '"') + ">" + (oldIE ? '<param name="movie" value="' + swfUrl + '"/>' : "") + '<param name="allowScriptAccess" value="' + allowScriptAccess + '"/>' + '<param name="allowNetworking" value="' + allowNetworking + '"/>' + '<param name="menu" value="false"/>' + '<param name="wmode" value="transparent"/>' + '<param name="flashvars" value="' + flashvars + '"/>' + "</object>";
      flashBridge = tmpDiv.firstChild;
      tmpDiv = null;
      _unwrap(flashBridge).ZeroClipboard = ZeroClipboard;
      container.replaceChild(flashBridge, divToBeReplaced);
    }
    if (!flashBridge) {
      flashBridge = _document[_globalConfig.swfObjectId];
      if (flashBridge && (len = flashBridge.length)) {
        flashBridge = flashBridge[len - 1];
      }
      if (!flashBridge && container) {
        flashBridge = container.firstChild;
      }
    }
    _flashState.bridge = flashBridge || null;
    return flashBridge;
  };
  /**
 * Destroy the SWF object.
 * @private
 */
  var _unembedSwf = function() {
    var flashBridge = _flashState.bridge;
    if (flashBridge) {
      var htmlBridge = _getHtmlBridge(flashBridge);
      if (htmlBridge) {
        if (_flashState.pluginType === "activex" && "readyState" in flashBridge) {
          flashBridge.style.display = "none";
          (function removeSwfFromIE() {
            if (flashBridge.readyState === 4) {
              for (var prop in flashBridge) {
                if (typeof flashBridge[prop] === "function") {
                  flashBridge[prop] = null;
                }
              }
              if (flashBridge.parentNode) {
                flashBridge.parentNode.removeChild(flashBridge);
              }
              if (htmlBridge.parentNode) {
                htmlBridge.parentNode.removeChild(htmlBridge);
              }
            } else {
              _setTimeout(removeSwfFromIE, 10);
            }
          })();
        } else {
          if (flashBridge.parentNode) {
            flashBridge.parentNode.removeChild(flashBridge);
          }
          if (htmlBridge.parentNode) {
            htmlBridge.parentNode.removeChild(htmlBridge);
          }
        }
      }
      _flashState.ready = null;
      _flashState.bridge = null;
      _flashState.deactivated = null;
    }
  };
  /**
 * Map the data format names of the "clipData" to Flash-friendly names.
 *
 * @returns A new transformed object.
 * @private
 */
  var _mapClipDataToFlash = function(clipData) {
    var newClipData = {}, formatMap = {};
    if (!(typeof clipData === "object" && clipData)) {
      return;
    }
    for (var dataFormat in clipData) {
      if (dataFormat && _hasOwn.call(clipData, dataFormat) && typeof clipData[dataFormat] === "string" && clipData[dataFormat]) {
        switch (dataFormat.toLowerCase()) {
         case "text/plain":
         case "text":
         case "air:text":
         case "flash:text":
          newClipData.text = clipData[dataFormat];
          formatMap.text = dataFormat;
          break;

         case "text/html":
         case "html":
         case "air:html":
         case "flash:html":
          newClipData.html = clipData[dataFormat];
          formatMap.html = dataFormat;
          break;

         case "application/rtf":
         case "text/rtf":
         case "rtf":
         case "richtext":
         case "air:rtf":
         case "flash:rtf":
          newClipData.rtf = clipData[dataFormat];
          formatMap.rtf = dataFormat;
          break;

         default:
          break;
        }
      }
    }
    return {
      data: newClipData,
      formatMap: formatMap
    };
  };
  /**
 * Map the data format names from Flash-friendly names back to their original "clipData" names (via a format mapping).
 *
 * @returns A new transformed object.
 * @private
 */
  var _mapClipResultsFromFlash = function(clipResults, formatMap) {
    if (!(typeof clipResults === "object" && clipResults && typeof formatMap === "object" && formatMap)) {
      return clipResults;
    }
    var newResults = {};
    for (var prop in clipResults) {
      if (_hasOwn.call(clipResults, prop)) {
        if (prop !== "success" && prop !== "data") {
          newResults[prop] = clipResults[prop];
          continue;
        }
        newResults[prop] = {};
        var tmpHash = clipResults[prop];
        for (var dataFormat in tmpHash) {
          if (dataFormat && _hasOwn.call(tmpHash, dataFormat) && _hasOwn.call(formatMap, dataFormat)) {
            newResults[prop][formatMap[dataFormat]] = tmpHash[dataFormat];
          }
        }
      }
    }
    return newResults;
  };
  /**
 * Will look at a path, and will create a "?noCache={time}" or "&noCache={time}"
 * query param string to return. Does NOT append that string to the original path.
 * This is useful because ExternalInterface often breaks when a Flash SWF is cached.
 *
 * @returns The `noCache` query param with necessary "?"/"&" prefix.
 * @private
 */
  var _cacheBust = function(path, options) {
    var cacheBust = options == null || options && options.cacheBust === true;
    if (cacheBust) {
      return (path.indexOf("?") === -1 ? "?" : "&") + "noCache=" + _now();
    } else {
      return "";
    }
  };
  /**
 * Creates a query string for the FlashVars param.
 * Does NOT include the cache-busting query param.
 *
 * @returns FlashVars query string
 * @private
 */
  var _vars = function(options) {
    var i, len, domain, domains, str = "", trustedOriginsExpanded = [];
    if (options.trustedDomains) {
      if (typeof options.trustedDomains === "string") {
        domains = [ options.trustedDomains ];
      } else if (typeof options.trustedDomains === "object" && "length" in options.trustedDomains) {
        domains = options.trustedDomains;
      }
    }
    if (domains && domains.length) {
      for (i = 0, len = domains.length; i < len; i++) {
        if (_hasOwn.call(domains, i) && domains[i] && typeof domains[i] === "string") {
          domain = _extractDomain(domains[i]);
          if (!domain) {
            continue;
          }
          if (domain === "*") {
            trustedOriginsExpanded.length = 0;
            trustedOriginsExpanded.push(domain);
            break;
          }
          trustedOriginsExpanded.push.apply(trustedOriginsExpanded, [ domain, "//" + domain, _window.location.protocol + "//" + domain ]);
        }
      }
    }
    if (trustedOriginsExpanded.length) {
      str += "trustedOrigins=" + _encodeURIComponent(trustedOriginsExpanded.join(","));
    }
    if (options.forceEnhancedClipboard === true) {
      str += (str ? "&" : "") + "forceEnhancedClipboard=true";
    }
    if (typeof options.swfObjectId === "string" && options.swfObjectId) {
      str += (str ? "&" : "") + "swfObjectId=" + _encodeURIComponent(options.swfObjectId);
    }
    return str;
  };
  /**
 * Extract the domain (e.g. "github.com") from an origin (e.g. "https://github.com") or
 * URL (e.g. "https://github.com/zeroclipboard/zeroclipboard/").
 *
 * @returns the domain
 * @private
 */
  var _extractDomain = function(originOrUrl) {
    if (originOrUrl == null || originOrUrl === "") {
      return null;
    }
    originOrUrl = originOrUrl.replace(/^\s+|\s+$/g, "");
    if (originOrUrl === "") {
      return null;
    }
    var protocolIndex = originOrUrl.indexOf("//");
    originOrUrl = protocolIndex === -1 ? originOrUrl : originOrUrl.slice(protocolIndex + 2);
    var pathIndex = originOrUrl.indexOf("/");
    originOrUrl = pathIndex === -1 ? originOrUrl : protocolIndex === -1 || pathIndex === 0 ? null : originOrUrl.slice(0, pathIndex);
    if (originOrUrl && originOrUrl.slice(-4).toLowerCase() === ".swf") {
      return null;
    }
    return originOrUrl || null;
  };
  /**
 * Set `allowScriptAccess` based on `trustedDomains` and `window.location.host` vs. `swfPath`.
 *
 * @returns The appropriate script access level.
 * @private
 */
  var _determineScriptAccess = function() {
    var _extractAllDomains = function(origins) {
      var i, len, tmp, resultsArray = [];
      if (typeof origins === "string") {
        origins = [ origins ];
      }
      if (!(typeof origins === "object" && origins && typeof origins.length === "number")) {
        return resultsArray;
      }
      for (i = 0, len = origins.length; i < len; i++) {
        if (_hasOwn.call(origins, i) && (tmp = _extractDomain(origins[i]))) {
          if (tmp === "*") {
            resultsArray.length = 0;
            resultsArray.push("*");
            break;
          }
          if (resultsArray.indexOf(tmp) === -1) {
            resultsArray.push(tmp);
          }
        }
      }
      return resultsArray;
    };
    return function(currentDomain, configOptions) {
      var swfDomain = _extractDomain(configOptions.swfPath);
      if (swfDomain === null) {
        swfDomain = currentDomain;
      }
      var trustedDomains = _extractAllDomains(configOptions.trustedDomains);
      var len = trustedDomains.length;
      if (len > 0) {
        if (len === 1 && trustedDomains[0] === "*") {
          return "always";
        }
        if (trustedDomains.indexOf(currentDomain) !== -1) {
          if (len === 1 && currentDomain === swfDomain) {
            return "sameDomain";
          }
          return "always";
        }
      }
      return "never";
    };
  }();
  /**
 * Get the currently active/focused DOM element.
 *
 * @returns the currently active/focused element, or `null`
 * @private
 */
  var _safeActiveElement = function() {
    try {
      return _document.activeElement;
    } catch (err) {
      return null;
    }
  };
  /**
 * Add a class to an element, if it doesn't already have it.
 *
 * @returns The element, with its new class added.
 * @private
 */
  var _addClass = function(element, value) {
    if (!element || element.nodeType !== 1) {
      return element;
    }
    if (element.classList) {
      if (!element.classList.contains(value)) {
        element.classList.add(value);
      }
      return element;
    }
    if (value && typeof value === "string") {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1) {
        if (!element.className) {
          element.className = value;
        } else {
          var className = " " + element.className + " ", setClass = element.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0) {
              setClass += " " + classNames[c];
            }
          }
          element.className = setClass.replace(/^\s+|\s+$/g, "");
        }
      }
    }
    return element;
  };
  /**
 * Remove a class from an element, if it has it.
 *
 * @returns The element, with its class removed.
 * @private
 */
  var _removeClass = function(element, value) {
    if (!element || element.nodeType !== 1) {
      return element;
    }
    if (element.classList) {
      if (element.classList.contains(value)) {
        element.classList.remove(value);
      }
      return element;
    }
    if (typeof value === "string" && value) {
      var classNames = value.split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
        for (var c = 0, cl = classNames.length; c < cl; c++) {
          className = className.replace(" " + classNames[c] + " ", " ");
        }
        element.className = className.replace(/^\s+|\s+$/g, "");
      }
    }
    return element;
  };
  /**
 * Attempt to interpret the element's CSS styling. If `prop` is `"cursor"`,
 * then we assume that it should be a hand ("pointer") cursor if the element
 * is an anchor element ("a" tag).
 *
 * @returns The computed style property.
 * @private
 */
  var _getStyle = function(el, prop) {
    var value = _window.getComputedStyle(el, null).getPropertyValue(prop);
    if (prop === "cursor") {
      if (!value || value === "auto") {
        if (el.nodeName === "A") {
          return "pointer";
        }
      }
    }
    return value;
  };
  /**
 * Get the zoom factor of the browser. Always returns `1.0`, except at
 * non-default zoom levels in IE<8 and some older versions of WebKit.
 *
 * @returns Floating unit percentage of the zoom factor (e.g. 150% = `1.5`).
 * @private
 */
  var _getZoomFactor = function() {
    var rect, physicalWidth, logicalWidth, zoomFactor = 1;
    if (typeof _document.body.getBoundingClientRect === "function") {
      rect = _document.body.getBoundingClientRect();
      physicalWidth = rect.right - rect.left;
      logicalWidth = _document.body.offsetWidth;
      zoomFactor = _round(physicalWidth / logicalWidth * 100) / 100;
    }
    return zoomFactor;
  };
  /**
 * Get the DOM positioning info of an element.
 *
 * @returns Object containing the element's position, width, and height.
 * @private
 */
  var _getDOMObjectPosition = function(obj) {
    var info = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    if (obj.getBoundingClientRect) {
      var rect = obj.getBoundingClientRect();
      var pageXOffset, pageYOffset, zoomFactor;
      if ("pageXOffset" in _window && "pageYOffset" in _window) {
        pageXOffset = _window.pageXOffset;
        pageYOffset = _window.pageYOffset;
      } else {
        zoomFactor = _getZoomFactor();
        pageXOffset = _round(_document.documentElement.scrollLeft / zoomFactor);
        pageYOffset = _round(_document.documentElement.scrollTop / zoomFactor);
      }
      var leftBorderWidth = _document.documentElement.clientLeft || 0;
      var topBorderWidth = _document.documentElement.clientTop || 0;
      info.left = rect.left + pageXOffset - leftBorderWidth;
      info.top = rect.top + pageYOffset - topBorderWidth;
      info.width = "width" in rect ? rect.width : rect.right - rect.left;
      info.height = "height" in rect ? rect.height : rect.bottom - rect.top;
    }
    return info;
  };
  /**
 * Reposition the Flash object to cover the currently activated element.
 *
 * @returns `undefined`
 * @private
 */
  var _reposition = function() {
    var htmlBridge;
    if (_currentElement && (htmlBridge = _getHtmlBridge(_flashState.bridge))) {
      var pos = _getDOMObjectPosition(_currentElement);
      _extend(htmlBridge.style, {
        width: pos.width + "px",
        height: pos.height + "px",
        top: pos.top + "px",
        left: pos.left + "px",
        zIndex: "" + _getSafeZIndex(_globalConfig.zIndex)
      });
    }
  };
  /**
 * Sends a signal to the Flash object to display the hand cursor if `true`.
 *
 * @returns `undefined`
 * @private
 */
  var _setHandCursor = function(enabled) {
    if (_flashState.ready === true) {
      if (_flashState.bridge && typeof _flashState.bridge.setHandCursor === "function") {
        _flashState.bridge.setHandCursor(enabled);
      } else {
        _flashState.ready = false;
      }
    }
  };
  /**
 * Get a safe value for `zIndex`
 *
 * @returns an integer, or "auto"
 * @private
 */
  var _getSafeZIndex = function(val) {
    if (/^(?:auto|inherit)$/.test(val)) {
      return val;
    }
    var zIndex;
    if (typeof val === "number" && !_isNaN(val)) {
      zIndex = val;
    } else if (typeof val === "string") {
      zIndex = _getSafeZIndex(_parseInt(val, 10));
    }
    return typeof zIndex === "number" ? zIndex : "auto";
  };
  /**
 * Detect the Flash Player status, version, and plugin type.
 *
 * @see {@link https://code.google.com/p/doctype-mirror/wiki/ArticleDetectFlash#The_code}
 * @see {@link http://stackoverflow.com/questions/12866060/detecting-pepper-ppapi-flash-with-javascript}
 *
 * @returns `undefined`
 * @private
 */
  var _detectFlashSupport = function(ActiveXObject) {
    var plugin, ax, mimeType, hasFlash = false, isActiveX = false, isPPAPI = false, flashVersion = "";
    /**
   * Derived from Apple's suggested sniffer.
   * @param {String} desc e.g. "Shockwave Flash 7.0 r61"
   * @returns {String} "7.0.61"
   * @private
   */
    function parseFlashVersion(desc) {
      var matches = desc.match(/[\d]+/g);
      matches.length = 3;
      return matches.join(".");
    }
    function isPepperFlash(flashPlayerFileName) {
      return !!flashPlayerFileName && (flashPlayerFileName = flashPlayerFileName.toLowerCase()) && (/^(pepflashplayer\.dll|libpepflashplayer\.so|pepperflashplayer\.plugin)$/.test(flashPlayerFileName) || flashPlayerFileName.slice(-13) === "chrome.plugin");
    }
    function inspectPlugin(plugin) {
      if (plugin) {
        hasFlash = true;
        if (plugin.version) {
          flashVersion = parseFlashVersion(plugin.version);
        }
        if (!flashVersion && plugin.description) {
          flashVersion = parseFlashVersion(plugin.description);
        }
        if (plugin.filename) {
          isPPAPI = isPepperFlash(plugin.filename);
        }
      }
    }
    if (_navigator.plugins && _navigator.plugins.length) {
      plugin = _navigator.plugins["Shockwave Flash"];
      inspectPlugin(plugin);
      if (_navigator.plugins["Shockwave Flash 2.0"]) {
        hasFlash = true;
        flashVersion = "2.0.0.11";
      }
    } else if (_navigator.mimeTypes && _navigator.mimeTypes.length) {
      mimeType = _navigator.mimeTypes["application/x-shockwave-flash"];
      plugin = mimeType && mimeType.enabledPlugin;
      inspectPlugin(plugin);
    } else if (typeof ActiveXObject !== "undefined") {
      isActiveX = true;
      try {
        ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        hasFlash = true;
        flashVersion = parseFlashVersion(ax.GetVariable("$version"));
      } catch (e1) {
        try {
          ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
          hasFlash = true;
          flashVersion = "6.0.21";
        } catch (e2) {
          try {
            ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            hasFlash = true;
            flashVersion = parseFlashVersion(ax.GetVariable("$version"));
          } catch (e3) {
            isActiveX = false;
          }
        }
      }
    }
    _flashState.disabled = hasFlash !== true;
    _flashState.outdated = flashVersion && _parseFloat(flashVersion) < _parseFloat(_minimumFlashVersion);
    _flashState.version = flashVersion || "0.0.0";
    _flashState.pluginType = isPPAPI ? "pepper" : isActiveX ? "activex" : hasFlash ? "netscape" : "unknown";
  };
  /**
 * Invoke the Flash detection algorithms immediately upon inclusion so we're not waiting later.
 */
  _detectFlashSupport(_ActiveXObject);
  /**
 * A shell constructor for `ZeroClipboard` client instances.
 *
 * @constructor
 */
  var ZeroClipboard = function() {
    if (!(this instanceof ZeroClipboard)) {
      return new ZeroClipboard();
    }
    if (typeof ZeroClipboard._createClient === "function") {
      ZeroClipboard._createClient.apply(this, _args(arguments));
    }
  };
  /**
 * The ZeroClipboard library's version number.
 *
 * @static
 * @readonly
 * @property {string}
 */
  _defineProperty(ZeroClipboard, "version", {
    value: "2.1.6",
    writable: false,
    configurable: true,
    enumerable: true
  });
  /**
 * Update or get a copy of the ZeroClipboard global configuration.
 * Returns a copy of the current/updated configuration.
 *
 * @returns Object
 * @static
 */
  ZeroClipboard.config = function() {
    return _config.apply(this, _args(arguments));
  };
  /**
 * Diagnostic method that describes the state of the browser, Flash Player, and ZeroClipboard.
 *
 * @returns Object
 * @static
 */
  ZeroClipboard.state = function() {
    return _state.apply(this, _args(arguments));
  };
  /**
 * Check if Flash is unusable for any reason: disabled, outdated, deactivated, etc.
 *
 * @returns Boolean
 * @static
 */
  ZeroClipboard.isFlashUnusable = function() {
    return _isFlashUnusable.apply(this, _args(arguments));
  };
  /**
 * Register an event listener.
 *
 * @returns `ZeroClipboard`
 * @static
 */
  ZeroClipboard.on = function() {
    return _on.apply(this, _args(arguments));
  };
  /**
 * Unregister an event listener.
 * If no `listener` function/object is provided, it will unregister all listeners for the provided `eventType`.
 * If no `eventType` is provided, it will unregister all listeners for every event type.
 *
 * @returns `ZeroClipboard`
 * @static
 */
  ZeroClipboard.off = function() {
    return _off.apply(this, _args(arguments));
  };
  /**
 * Retrieve event listeners for an `eventType`.
 * If no `eventType` is provided, it will retrieve all listeners for every event type.
 *
 * @returns array of listeners for the `eventType`; if no `eventType`, then a map/hash object of listeners for all event types; or `null`
 */
  ZeroClipboard.handlers = function() {
    return _listeners.apply(this, _args(arguments));
  };
  /**
 * Event emission receiver from the Flash object, forwarding to any registered JavaScript event listeners.
 *
 * @returns For the "copy" event, returns the Flash-friendly "clipData" object; otherwise `undefined`.
 * @static
 */
  ZeroClipboard.emit = function() {
    return _emit.apply(this, _args(arguments));
  };
  /**
 * Create and embed the Flash object.
 *
 * @returns The Flash object
 * @static
 */
  ZeroClipboard.create = function() {
    return _create.apply(this, _args(arguments));
  };
  /**
 * Self-destruct and clean up everything, including the embedded Flash object.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.destroy = function() {
    return _destroy.apply(this, _args(arguments));
  };
  /**
 * Set the pending data for clipboard injection.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.setData = function() {
    return _setData.apply(this, _args(arguments));
  };
  /**
 * Clear the pending data for clipboard injection.
 * If no `format` is provided, all pending data formats will be cleared.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.clearData = function() {
    return _clearData.apply(this, _args(arguments));
  };
  /**
 * Get a copy of the pending data for clipboard injection.
 * If no `format` is provided, a copy of ALL pending data formats will be returned.
 *
 * @returns `String` or `Object`
 * @static
 */
  ZeroClipboard.getData = function() {
    return _getData.apply(this, _args(arguments));
  };
  /**
 * Sets the current HTML object that the Flash object should overlay. This will put the global
 * Flash object on top of the current element; depending on the setup, this may also set the
 * pending clipboard text data as well as the Flash object's wrapping element's title attribute
 * based on the underlying HTML element and ZeroClipboard configuration.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.focus = ZeroClipboard.activate = function() {
    return _focus.apply(this, _args(arguments));
  };
  /**
 * Un-overlays the Flash object. This will put the global Flash object off-screen; depending on
 * the setup, this may also unset the Flash object's wrapping element's title attribute based on
 * the underlying HTML element and ZeroClipboard configuration.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.blur = ZeroClipboard.deactivate = function() {
    return _blur.apply(this, _args(arguments));
  };
  /**
 * Returns the currently focused/"activated" HTML element that the Flash object is wrapping.
 *
 * @returns `HTMLElement` or `null`
 * @static
 */
  ZeroClipboard.activeElement = function() {
    return _activeElement.apply(this, _args(arguments));
  };
  /**
 * Keep track of the ZeroClipboard client instance counter.
 */
  var _clientIdCounter = 0;
  /**
 * Keep track of the state of the client instances.
 *
 * Entry structure:
 *   _clientMeta[client.id] = {
 *     instance: client,
 *     elements: [],
 *     handlers: {}
 *   };
 */
  var _clientMeta = {};
  /**
 * Keep track of the ZeroClipboard clipped elements counter.
 */
  var _elementIdCounter = 0;
  /**
 * Keep track of the state of the clipped element relationships to clients.
 *
 * Entry structure:
 *   _elementMeta[element.zcClippingId] = [client1.id, client2.id];
 */
  var _elementMeta = {};
  /**
 * Keep track of the state of the mouse event handlers for clipped elements.
 *
 * Entry structure:
 *   _mouseHandlers[element.zcClippingId] = {
 *     mouseover:  function(event) {},
 *     mouseout:   function(event) {},
 *     mouseenter: function(event) {},
 *     mouseleave: function(event) {},
 *     mousemove:  function(event) {}
 *   };
 */
  var _mouseHandlers = {};
  /**
 * Extending the ZeroClipboard configuration defaults for the Client module.
 */
  _extend(_globalConfig, {
    autoActivate: true
  });
  /**
 * The real constructor for `ZeroClipboard` client instances.
 * @private
 */
  var _clientConstructor = function(elements) {
    var client = this;
    client.id = "" + _clientIdCounter++;
    _clientMeta[client.id] = {
      instance: client,
      elements: [],
      handlers: {}
    };
    if (elements) {
      client.clip(elements);
    }
    ZeroClipboard.on("*", function(event) {
      return client.emit(event);
    });
    ZeroClipboard.on("destroy", function() {
      client.destroy();
    });
    ZeroClipboard.create();
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.on`.
 * @private
 */
  var _clientOn = function(eventType, listener) {
    var i, len, events, added = {}, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (typeof eventType === "string" && eventType) {
      events = eventType.toLowerCase().split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          this.on(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].replace(/^on/, "");
        added[eventType] = true;
        if (!handlers[eventType]) {
          handlers[eventType] = [];
        }
        handlers[eventType].push(listener);
      }
      if (added.ready && _flashState.ready) {
        this.emit({
          type: "ready",
          client: this
        });
      }
      if (added.error) {
        var errorTypes = [ "disabled", "outdated", "unavailable", "deactivated", "overdue" ];
        for (i = 0, len = errorTypes.length; i < len; i++) {
          if (_flashState[errorTypes[i]]) {
            this.emit({
              type: "error",
              name: "flash-" + errorTypes[i],
              client: this
            });
            break;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.off`.
 * @private
 */
  var _clientOff = function(eventType, listener) {
    var i, len, foundIndex, events, perEventHandlers, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (arguments.length === 0) {
      events = _keys(handlers);
    } else if (typeof eventType === "string" && eventType) {
      events = eventType.split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          this.off(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].toLowerCase().replace(/^on/, "");
        perEventHandlers = handlers[eventType];
        if (perEventHandlers && perEventHandlers.length) {
          if (listener) {
            foundIndex = perEventHandlers.indexOf(listener);
            while (foundIndex !== -1) {
              perEventHandlers.splice(foundIndex, 1);
              foundIndex = perEventHandlers.indexOf(listener, foundIndex);
            }
          } else {
            perEventHandlers.length = 0;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.handlers`.
 * @private
 */
  var _clientListeners = function(eventType) {
    var copy = null, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (handlers) {
      if (typeof eventType === "string" && eventType) {
        copy = handlers[eventType] ? handlers[eventType].slice(0) : [];
      } else {
        copy = _deepCopy(handlers);
      }
    }
    return copy;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.emit`.
 * @private
 */
  var _clientEmit = function(event) {
    if (_clientShouldEmit.call(this, event)) {
      if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
        event = _extend({}, event);
      }
      var eventCopy = _extend({}, _createEvent(event), {
        client: this
      });
      _clientDispatchCallbacks.call(this, eventCopy);
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.clip`.
 * @private
 */
  var _clientClip = function(elements) {
    elements = _prepClip(elements);
    for (var i = 0; i < elements.length; i++) {
      if (_hasOwn.call(elements, i) && elements[i] && elements[i].nodeType === 1) {
        if (!elements[i].zcClippingId) {
          elements[i].zcClippingId = "zcClippingId_" + _elementIdCounter++;
          _elementMeta[elements[i].zcClippingId] = [ this.id ];
          if (_globalConfig.autoActivate === true) {
            _addMouseHandlers(elements[i]);
          }
        } else if (_elementMeta[elements[i].zcClippingId].indexOf(this.id) === -1) {
          _elementMeta[elements[i].zcClippingId].push(this.id);
        }
        var clippedElements = _clientMeta[this.id] && _clientMeta[this.id].elements;
        if (clippedElements.indexOf(elements[i]) === -1) {
          clippedElements.push(elements[i]);
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.unclip`.
 * @private
 */
  var _clientUnclip = function(elements) {
    var meta = _clientMeta[this.id];
    if (!meta) {
      return this;
    }
    var clippedElements = meta.elements;
    var arrayIndex;
    if (typeof elements === "undefined") {
      elements = clippedElements.slice(0);
    } else {
      elements = _prepClip(elements);
    }
    for (var i = elements.length; i--; ) {
      if (_hasOwn.call(elements, i) && elements[i] && elements[i].nodeType === 1) {
        arrayIndex = 0;
        while ((arrayIndex = clippedElements.indexOf(elements[i], arrayIndex)) !== -1) {
          clippedElements.splice(arrayIndex, 1);
        }
        var clientIds = _elementMeta[elements[i].zcClippingId];
        if (clientIds) {
          arrayIndex = 0;
          while ((arrayIndex = clientIds.indexOf(this.id, arrayIndex)) !== -1) {
            clientIds.splice(arrayIndex, 1);
          }
          if (clientIds.length === 0) {
            if (_globalConfig.autoActivate === true) {
              _removeMouseHandlers(elements[i]);
            }
            delete elements[i].zcClippingId;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.elements`.
 * @private
 */
  var _clientElements = function() {
    var meta = _clientMeta[this.id];
    return meta && meta.elements ? meta.elements.slice(0) : [];
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.destroy`.
 * @private
 */
  var _clientDestroy = function() {
    this.unclip();
    this.off();
    delete _clientMeta[this.id];
  };
  /**
 * Inspect an Event to see if the Client (`this`) should honor it for emission.
 * @private
 */
  var _clientShouldEmit = function(event) {
    if (!(event && event.type)) {
      return false;
    }
    if (event.client && event.client !== this) {
      return false;
    }
    var clippedEls = _clientMeta[this.id] && _clientMeta[this.id].elements;
    var hasClippedEls = !!clippedEls && clippedEls.length > 0;
    var goodTarget = !event.target || hasClippedEls && clippedEls.indexOf(event.target) !== -1;
    var goodRelTarget = event.relatedTarget && hasClippedEls && clippedEls.indexOf(event.relatedTarget) !== -1;
    var goodClient = event.client && event.client === this;
    if (!(goodTarget || goodRelTarget || goodClient)) {
      return false;
    }
    return true;
  };
  /**
 * Handle the actual dispatching of events to a client instance.
 *
 * @returns `this`
 * @private
 */
  var _clientDispatchCallbacks = function(event) {
    if (!(typeof event === "object" && event && event.type)) {
      return;
    }
    var async = _shouldPerformAsync(event);
    var wildcardTypeHandlers = _clientMeta[this.id] && _clientMeta[this.id].handlers["*"] || [];
    var specificTypeHandlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[event.type] || [];
    var handlers = wildcardTypeHandlers.concat(specificTypeHandlers);
    if (handlers && handlers.length) {
      var i, len, func, context, eventCopy, originalContext = this;
      for (i = 0, len = handlers.length; i < len; i++) {
        func = handlers[i];
        context = originalContext;
        if (typeof func === "string" && typeof _window[func] === "function") {
          func = _window[func];
        }
        if (typeof func === "object" && func && typeof func.handleEvent === "function") {
          context = func;
          func = func.handleEvent;
        }
        if (typeof func === "function") {
          eventCopy = _extend({}, event);
          _dispatchCallback(func, context, [ eventCopy ], async);
        }
      }
    }
    return this;
  };
  /**
 * Prepares the elements for clipping/unclipping.
 *
 * @returns An Array of elements.
 * @private
 */
  var _prepClip = function(elements) {
    if (typeof elements === "string") {
      elements = [];
    }
    return typeof elements.length !== "number" ? [ elements ] : elements;
  };
  /**
 * Add a `mouseover` handler function for a clipped element.
 *
 * @returns `undefined`
 * @private
 */
  var _addMouseHandlers = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    var _suppressMouseEvents = function(event) {
      if (!(event || (event = _window.event))) {
        return;
      }
      if (event._source !== "js") {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
      delete event._source;
    };
    var _elementMouseOver = function(event) {
      if (!(event || (event = _window.event))) {
        return;
      }
      _suppressMouseEvents(event);
      ZeroClipboard.focus(element);
    };
    element.addEventListener("mouseover", _elementMouseOver, false);
    element.addEventListener("mouseout", _suppressMouseEvents, false);
    element.addEventListener("mouseenter", _suppressMouseEvents, false);
    element.addEventListener("mouseleave", _suppressMouseEvents, false);
    element.addEventListener("mousemove", _suppressMouseEvents, false);
    _mouseHandlers[element.zcClippingId] = {
      mouseover: _elementMouseOver,
      mouseout: _suppressMouseEvents,
      mouseenter: _suppressMouseEvents,
      mouseleave: _suppressMouseEvents,
      mousemove: _suppressMouseEvents
    };
  };
  /**
 * Remove a `mouseover` handler function for a clipped element.
 *
 * @returns `undefined`
 * @private
 */
  var _removeMouseHandlers = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    var mouseHandlers = _mouseHandlers[element.zcClippingId];
    if (!(typeof mouseHandlers === "object" && mouseHandlers)) {
      return;
    }
    var key, val, mouseEvents = [ "move", "leave", "enter", "out", "over" ];
    for (var i = 0, len = mouseEvents.length; i < len; i++) {
      key = "mouse" + mouseEvents[i];
      val = mouseHandlers[key];
      if (typeof val === "function") {
        element.removeEventListener(key, val, false);
      }
    }
    delete _mouseHandlers[element.zcClippingId];
  };
  /**
 * Creates a new ZeroClipboard client instance.
 * Optionally, auto-`clip` an element or collection of elements.
 *
 * @constructor
 */
  ZeroClipboard._createClient = function() {
    _clientConstructor.apply(this, _args(arguments));
  };
  /**
 * Register an event listener to the client.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.on = function() {
    return _clientOn.apply(this, _args(arguments));
  };
  /**
 * Unregister an event handler from the client.
 * If no `listener` function/object is provided, it will unregister all handlers for the provided `eventType`.
 * If no `eventType` is provided, it will unregister all handlers for every event type.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.off = function() {
    return _clientOff.apply(this, _args(arguments));
  };
  /**
 * Retrieve event listeners for an `eventType` from the client.
 * If no `eventType` is provided, it will retrieve all listeners for every event type.
 *
 * @returns array of listeners for the `eventType`; if no `eventType`, then a map/hash object of listeners for all event types; or `null`
 */
  ZeroClipboard.prototype.handlers = function() {
    return _clientListeners.apply(this, _args(arguments));
  };
  /**
 * Event emission receiver from the Flash object for this client's registered JavaScript event listeners.
 *
 * @returns For the "copy" event, returns the Flash-friendly "clipData" object; otherwise `undefined`.
 */
  ZeroClipboard.prototype.emit = function() {
    return _clientEmit.apply(this, _args(arguments));
  };
  /**
 * Register clipboard actions for new element(s) to the client.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.clip = function() {
    return _clientClip.apply(this, _args(arguments));
  };
  /**
 * Unregister the clipboard actions of previously registered element(s) on the page.
 * If no elements are provided, ALL registered elements will be unregistered.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.unclip = function() {
    return _clientUnclip.apply(this, _args(arguments));
  };
  /**
 * Get all of the elements to which this client is clipped.
 *
 * @returns array of clipped elements
 */
  ZeroClipboard.prototype.elements = function() {
    return _clientElements.apply(this, _args(arguments));
  };
  /**
 * Self-destruct and clean up everything for a single client.
 * This will NOT destroy the embedded Flash object.
 *
 * @returns `undefined`
 */
  ZeroClipboard.prototype.destroy = function() {
    return _clientDestroy.apply(this, _args(arguments));
  };
  /**
 * Stores the pending plain text to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setText = function(text) {
    ZeroClipboard.setData("text/plain", text);
    return this;
  };
  /**
 * Stores the pending HTML text to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setHtml = function(html) {
    ZeroClipboard.setData("text/html", html);
    return this;
  };
  /**
 * Stores the pending rich text (RTF) to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setRichText = function(richText) {
    ZeroClipboard.setData("application/rtf", richText);
    return this;
  };
  /**
 * Stores the pending data to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setData = function() {
    ZeroClipboard.setData.apply(this, _args(arguments));
    return this;
  };
  /**
 * Clears the pending data to inject into the clipboard.
 * If no `format` is provided, all pending data formats will be cleared.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.clearData = function() {
    ZeroClipboard.clearData.apply(this, _args(arguments));
    return this;
  };
  /**
 * Gets a copy of the pending data to inject into the clipboard.
 * If no `format` is provided, a copy of ALL pending data formats will be returned.
 *
 * @returns `String` or `Object`
 */
  ZeroClipboard.prototype.getData = function() {
    return ZeroClipboard.getData.apply(this, _args(arguments));
  };
  if (typeof define === "function" && define.amd) {
    define(function() {
      return ZeroClipboard;
    });
  } else if (typeof module === "object" && module && typeof module.exports === "object" && module.exports) {
    module.exports = ZeroClipboard;
  } else {
    window.ZeroClipboard = ZeroClipboard;
  }
})(function() {
  return this || window;
}());
},{}],"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/appview.coffee":[function(require,module,exports){
var $, AppView, Backbone, Combokeys, LoremClipboard, a, br, flavors, li, p, raw, render, text, ul, zeroclipboard, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require('zeptojs');

_ = require('underscore');

Backbone = require('backbone');

Backbone.$ = $;

zeroclipboard = require('zeroclipboard');

flavors = require('./flavors.coffee');

Combokeys = require('combokeys');

LoremClipboard = require('./clipboard.coffee');

_ref = require('teacup'), render = _ref.render, p = _ref.p, raw = _ref.raw, br = _ref.br, text = _ref.text, li = _ref.li, ul = _ref.ul, a = _ref.a;

zeroclipboard.config({
  swfPath: "swf/ZeroClipboard.swf"
});

AppView = (function(_super) {
  __extends(AppView, _super);

  function AppView() {
    return AppView.__super__.constructor.apply(this, arguments);
  }

  AppView.prototype.events = {
    "click .js-select-flavor a": "selectFlavor",
    "click .js-select-paragraphs a": "selectNumParagraphs",
    "click .js-select-format a": "selectFormat",
    "click .js-copy-to-clipboard": "cancel",
    "click .js-open-statement": "openStatement",
    "click .js-close-statement": "closeStatement"
  };

  AppView.prototype.initialize = function() {
    this.fLoadedStatement = false;
    this.loremClipboard = new LoremClipboard();
    this.listenTo(this.model, "change", this.renderIpsum);
    this.listenTo(this.model, "change:flavor", this.renderFlavors);
    this.listenTo(this.model, "change:paragraphs", this.renderNumParagraphs);
    return this.listenTo(this.model, "change:format", this.renderFormats);
  };

  AppView.prototype.render = function() {
    var combokeys;
    this.setElement($(".js-app"));
    this.renderFlavors();
    this.renderNumParagraphs();
    this.renderFormats();
    this.renderIpsum();
    this.zeroClipboardClient = new zeroclipboard(this.$(".js-copy-to-clipboard"));
    this.zeroClipboardClient.on("error", (function(_this) {
      return function(e) {
        return _this.$(".js-copy-to-clipboard").addClass("hidden");
      };
    })(this));
    this.zeroClipboardClient.on("ready", (function(_this) {
      return function(e) {
        return _this.$(".js-copy-to-clipboard").removeClass("hidden");
      };
    })(this));
    this.zeroClipboardClient.on("copy", (function(_this) {
      return function(e) {
        var clipboard;
        clipboard = e.clipboardData;
        return clipboard.setData("text/plain", _this.loremClipboard.value);
      };
    })(this));
    this.zeroClipboardClient.on("aftercopy", (function(_this) {
      return function() {
        return _this.flashCopiedState();
      };
    })(this));
    if (!/Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      this.$(".js-meta-key-type").text('Ctrl');
    }
    _.defer((function(_this) {
      return function() {
        return _this.$el.removeClass("hidden");
      };
    })(this));
    combokeys = new Combokeys(document);
    combokeys.bind("1", (function(_this) {
      return function() {
        return _this.model.setParagraphs("1");
      };
    })(this));
    combokeys.bind("2", (function(_this) {
      return function() {
        return _this.model.setParagraphs("2");
      };
    })(this));
    combokeys.bind("3", (function(_this) {
      return function() {
        return _this.model.setParagraphs("3");
      };
    })(this));
    combokeys.bind("4", (function(_this) {
      return function() {
        return _this.model.setParagraphs("4");
      };
    })(this));
    combokeys.bind("5", (function(_this) {
      return function() {
        return _this.model.setParagraphs("5");
      };
    })(this));
    combokeys.bind("6", (function(_this) {
      return function() {
        return _this.model.setParagraphs("6");
      };
    })(this));
    combokeys.bind("7", (function(_this) {
      return function() {
        return _this.model.setParagraphs("7");
      };
    })(this));
    combokeys.bind("8", (function(_this) {
      return function() {
        return _this.model.setParagraphs("8");
      };
    })(this));
    combokeys.bind("t", (function(_this) {
      return function() {
        return _this.model.setFormat("Text");
      };
    })(this));
    combokeys.bind("h", (function(_this) {
      return function() {
        return _this.model.setFormat("HTML");
      };
    })(this));
    combokeys.bind("j", (function(_this) {
      return function() {
        return _this.model.setFormat("JSON");
      };
    })(this));
    combokeys.bind("esc", (function(_this) {
      return function() {
        return _this.closeStatement();
      };
    })(this));
    return this;
  };

  AppView.prototype.renderFlavors = function() {
    var getAttrs, html, selectedFlavor;
    selectedFlavor = this.model.get("flavor");
    getAttrs = function(flavor) {
      var classes;
      classes = "meta-control-options-item-link";
      if (flavor === selectedFlavor) {
        classes += " is-current";
      }
      return {
        "href": "#",
        "data-flavor": flavor,
        "class": classes
      };
    };
    html = render(function() {
      var flavor, _results;
      _results = [];
      for (flavor in flavors) {
        _results.push(li('.meta-control-options-item', function() {
          return a(getAttrs(flavor), function() {
            return text(flavor);
          });
        }));
      }
      return _results;
    });
    this.$(".js-list-flavors").html(html);
    return this;
  };

  AppView.prototype.renderNumParagraphs = function() {
    var getAttrs, html, paragraphsRange, selectedNumParagraphs;
    paragraphsRange = [1, 2, 3, 4, 5, 6, 7, 8];
    selectedNumParagraphs = Number(this.model.get("paragraphs"));
    getAttrs = function(numPara) {
      var classes;
      classes = "meta-control-options-item-link";
      if (numPara === selectedNumParagraphs) {
        classes += " is-current";
      }
      return {
        "href": "#",
        "data-paragraphs": numPara,
        "class": classes
      };
    };
    html = render(function() {
      var numPara, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = paragraphsRange.length; _i < _len; _i++) {
        numPara = paragraphsRange[_i];
        _results.push(li('.meta-control-options-item', function() {
          return a(getAttrs(numPara), function() {
            return text(numPara);
          });
        }));
      }
      return _results;
    });
    this.$(".js-list-paragraphs").html(html);
    return this;
  };

  AppView.prototype.renderFormats = function() {
    var formats, getAttrs, html, selectedFormat;
    formats = ["Text", "HTML", "JSON"];
    selectedFormat = this.model.get("format");
    getAttrs = function(format) {
      var classes;
      classes = "meta-control-options-item-link";
      if (format === selectedFormat) {
        classes += " is-current";
      }
      return {
        "href": "#",
        "data-format": format,
        "class": classes
      };
    };
    html = render(function() {
      var format, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = formats.length; _i < _len; _i++) {
        format = formats[_i];
        _results.push(li('.meta-control-options-item', function() {
          return a(getAttrs(format), function() {
            return text(format);
          });
        }));
      }
      return _results;
    });
    this.$(".js-list-formats").html(html);
    return this;
  };

  AppView.prototype.renderIpsum = function() {
    var $ipsum, clipboard, format, html, joinedParagraphs, numParagraphs, para, paragraphs;
    $ipsum = $(".js-render-ipsum");
    format = this.model.get("format");
    numParagraphs = this.model.get("paragraphs");
    paragraphs = (function() {
      var _i, _results;
      _results = [];
      for (para = _i = 1; 1 <= numParagraphs ? _i <= numParagraphs : _i >= numParagraphs; para = 1 <= numParagraphs ? ++_i : --_i) {
        _results.push(this.generateParagraph());
      }
      return _results;
    }).call(this);
    switch (format) {
      case "HTML":
        html = render(function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = paragraphs.length; _i < _len; _i++) {
            para = paragraphs[_i];
            _results.push(p("<p>" + para + "</p>"));
          }
          return _results;
        });
        clipboard = render(function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = paragraphs.length; _i < _len; _i++) {
            para = paragraphs[_i];
            _results.push(raw("<p>" + para + "</p>\n\n"));
          }
          return _results;
        });
        break;
      case "JSON":
        paragraphs = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = paragraphs.length; _i < _len; _i++) {
            para = paragraphs[_i];
            _results.push("\"" + para + "\"");
          }
          return _results;
        })();
        joinedParagraphs = paragraphs.join(",");
        html = render(function() {
          text("[");
          text(paragraphs);
          return text("]");
        });
        clipboard = render(function() {
          text("[");
          raw(paragraphs);
          return text("]");
        });
        break;
      default:
        html = render(function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = paragraphs.length; _i < _len; _i++) {
            para = paragraphs[_i];
            _results.push(p(para));
          }
          return _results;
        });
        clipboard = render(function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = paragraphs.length; _i < _len; _i++) {
            para = paragraphs[_i];
            _results.push(raw("" + para + "\n\n"));
          }
          return _results;
        });
    }
    $ipsum.html(html);
    this.loremClipboard.set(clipboard);
    return this;
  };

  AppView.prototype.generateSentence = function() {
    var flavor, length, lengthRange, rawSentence, sentence, wordArray;
    lengthRange = [6, 7, 8, 9, 10];
    length = _.sample(lengthRange);
    flavor = this.model.get("flavor");
    wordArray = _.sample(flavors[flavor], length);
    rawSentence = wordArray.join(" ");
    return sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + ".";
  };

  AppView.prototype.generateParagraph = function() {
    var length, lengthRange, paragraph, s;
    lengthRange = [4, 5, 6, 7, 8];
    length = _.sample(lengthRange);
    return paragraph = ((function() {
      var _i, _results;
      _results = [];
      for (s = _i = 0; 0 <= length ? _i <= length : _i >= length; s = 0 <= length ? ++_i : --_i) {
        _results.push(this.generateSentence());
      }
      return _results;
    }).call(this)).join(" ");
  };

  AppView.prototype.selectFlavor = function(e) {
    var value;
    e.preventDefault();
    value = $(e.target).attr("data-flavor");
    this.model.setFlavor(value);
    return false;
  };

  AppView.prototype.selectNumParagraphs = function(e) {
    var value;
    e.preventDefault();
    value = $(e.target).attr("data-paragraphs");
    this.model.setParagraphs(value);
    return false;
  };

  AppView.prototype.selectFormat = function(e) {
    var value;
    e.preventDefault();
    value = $(e.target).attr("data-format");
    this.model.setFormat(value);
    return false;
  };

  AppView.prototype.flashCopiedState = function() {
    var $copyBtn, originalText;
    $copyBtn = this.$(".js-copy-to-clipboard");
    originalText = $copyBtn.html();
    $copyBtn.text("Copied!");
    return setTimeout((function(_this) {
      return function() {
        return $copyBtn.html(originalText);
      };
    })(this), 2000);
  };

  AppView.prototype.openStatement = function(e) {
    e.preventDefault();
    if (!this.fLoadedStatement) {
      $.get("/statement.html", (function(_this) {
        return function(data) {
          _this.fLoadedStatement = true;
          return _this.$(".js-statement").html(data);
        };
      })(this));
    }
    $("body").addClass("is-shown-statement");
    return false;
  };

  AppView.prototype.closeStatement = function(e) {
    if (e != null) {
      e.preventDefault();
    }
    $("body").removeClass("is-shown-statement");
    return false;
  };

  AppView.prototype.cancel = function(e) {
    e.preventDefault();
    return false;
  };

  return AppView;

})(Backbone.View);

module.exports = AppView;



},{"./clipboard.coffee":"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/clipboard.coffee","./flavors.coffee":"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/flavors.coffee","backbone":"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/backbone.js","combokeys":"/Users/bobbygrace/Code/lore-opossum/node_modules/combokeys/index.js","teacup":"/Users/bobbygrace/Code/lore-opossum/node_modules/teacup/lib/teacup.js","underscore":"/Users/bobbygrace/Code/lore-opossum/node_modules/underscore/underscore.js","zeptojs":"/Users/bobbygrace/Code/lore-opossum/node_modules/zeptojs/zepto.js","zeroclipboard":"/Users/bobbygrace/Code/lore-opossum/node_modules/zeroclipboard/dist/ZeroClipboard.js"}],"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/clipboard.coffee":[function(require,module,exports){
var $, LoremClipboard, isVisibleInput, _;

$ = require('zeptojs');

_ = require('underscore');

isVisibleInput = function(elem) {
  elem = $(elem);
  return !!(elem.width() || elem.height()) && elem.css("display") !== "none";
};

LoremClipboard = (function() {
  function LoremClipboard() {
    this.value = "";
    $(document).keydown((function(_this) {
      return function(e) {
        var $copyBtn, elem, originalHtml, _ref, _ref1;
        if (!_this.value || !(e.ctrlKey || e.metaKey)) {
          return;
        }
        if (e.keyCode === 67) {
          $copyBtn = $(".js-copy-to-clipboard");
          originalHtml = $copyBtn.html();
          $copyBtn.text("Copied!").addClass("is-focus");
          setTimeout(function() {
            return $copyBtn.html(originalHtml).removeClass("is-focus");
          }, 2000);
        }
        elem = $(e.target);
        if (elem.is("input,textarea")) {
          if (isVisibleInput(elem)) {
            return;
          }
        }
        if (typeof window.getSelection === "function" ? (_ref = window.getSelection()) != null ? _ref.toString() : void 0 : void 0) {
          return;
        }
        if ((_ref1 = document.selection) != null ? _ref1.createRange().text : void 0) {
          return;
        }
        return _.defer(function() {
          var $clipboardContainer;
          $clipboardContainer = $(".js-lorem-clipboard");
          $clipboardContainer.empty().show();
          _this.$clipboardInput = $("<textarea class='lorem-clipboard-input js-lorem-clipboard-input'></textarea>").val(_this.value).appendTo($clipboardContainer).focus();
          return _this.$clipboardInput[0].select();
        });
      };
    })(this));
    $(document).keyup(function(e) {
      if ($(e.target).is(".js-lorem-clipboard-input")) {
        return $(".js-lorem-clipboard").empty().hide();
      }
    });
  }

  LoremClipboard.prototype.set = function(value) {
    this.value = value;
  };

  return LoremClipboard;

})();

module.exports = LoremClipboard;



},{"underscore":"/Users/bobbygrace/Code/lore-opossum/node_modules/underscore/underscore.js","zeptojs":"/Users/bobbygrace/Code/lore-opossum/node_modules/zeptojs/zepto.js"}],"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/flavors.coffee":[function(require,module,exports){
var flavors;

flavors = {
  "Lorem Ipsum": ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'quisque', 'ac', 'semper', 'nisi', 'hendrerit', 'neque', 'aliquet', 'bibendum', 'sem', 'lacus', 'molestie', 'ante', 'porta', 'metus', 'a', 'tortor', 'aenean', 'facilisis', 'venenatis', 'nunc', 'in', 'lacinia', 'mollis', 'eget', 'phasellus', 'varius', 'augue', 'nulla', 'faucibus', 'morbi', 'placerat', 'ullamcorper', 'risus', 'et', 'rhoncus', 'erat', 'efficitur', 'ut', 'eu', 'eros', 'convallis', 'tellus', 'suscipit', 'dignissim', 'enim', 'viverra', 'sollicitudin', 'leo', 'turpis', 'vestibulum', 'fringilla', 'fusce', 'purus', 'feugiat', 'ut', 'nec', 'lobortis', 'lectus', 'vulputate', 'id', 'integer', 'ornare', 'ex', 'pellentesque', 'duis', 'quis', 'pellentesque', 'vel', 'diam', 'congue', 'consequat', 'nam', 'commodo', 'non', 'porttitor', 'egestas', 'mattis', 'urna', 'auctor', 'dui', 'justo', 'volutpat', 'odio', 'euismod', 'pulvinar', 'sed', 'nibh', 'mauris', 'velit', 'aliquam', 'maximus', 'lorem', 'condimentum', 'donec', 'quam', 'rutrum', 'praesent', 'elementum', 'scelerisque', 'vitae', 'nullam', 'cursus', 'tempus', 'proin', 'imperdiet', 'orci', 'interdum', 'at', 'dictum', 'iaculis', 'nulla', 'sed', 'blandit', 'cras', 'gravida', 'nunc', 'est', 'dapibus', 'magna', 'luctus', 'massa', 'laoreet', 'vivamus', 'tincidunt', 'eleifend', 'suspendisse', 'ligula', 'libero', 'finibus', 'pretium', 'accumsan', 'fermentum', 'tristique', 'pharetra', 'mi', 'curabitur', 'habitant', 'morbi', 'senectus', 'netus', 'malesuada', 'fames', 'felis', 'in', 'sapien', 'sodales', 'arcu'],
  "Trello": ["card", "board", "lists", "list of lists", "at a glance", "Trello", "Taco", "checklists", "Chorizo", "Trello Gold", "Business Class", "visual", "free", "attachment", "drag and drop", "due dates", "members", "organization", "list", "with anyone", "anything", "team", "family and friends", "label", "flexible", "project", "real time", "simple", "power-ups", "comment", "notifications", "done", "easy", "organize", "stickers"],
  "Skate": ["Tony Hawk", "Bob Burnquist", "Steve Caballero", "Rune Glifberg", "Elissa Steamer", "Geoff Rowley", "Bucky Lasek", "Kareem Campbell", "Rodney Mullen", "Thrasher", "Vans", "180", "360", "540", "720", "900", "1080", "half-pipe", "full pipe", "downhill", "skate or die", "trucks", "S.K.A.T.E.", "50-50", "boneless", "nose slide", "nosegrind", "stoked", "rad", "goofy-footed", "crooked grind", "fakie", "pump", "ollie", "nollie", "tail", "grind", "bail", "fail", "gnarly", "manual", "spine", "lip", "rails", "airwalk", "shoveit", "heel flip", "mini ramp", "lien air", "varial", "method air", "frigid air", "kickflip", "McTwist", "drop in", "body varial"],
  "Hodor": ["hodor", "hodor", "hodor", "hodor", "hodor", "hodor", "HODOR", "Hodor"],
  "Redacted": ["█", "█", "██", "██", "██", "███", "████", "████", "████", "█████", "██████", "████████"],
  "HaXsSoR": ["<p>", "<B>haxorz</B>", "<script>alert('1337')</script>", "</p>", "</html>", "<img src='/' width='500' height='300'>"]
};

module.exports = flavors;



},{}],"/Users/bobbygrace/Code/lore-opossum/src/coffeescript/model.coffee":[function(require,module,exports){
var Backbone, LoremModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = require('backbone');

LoremModel = (function(_super) {
  __extends(LoremModel, _super);

  function LoremModel() {
    return LoremModel.__super__.constructor.apply(this, arguments);
  }

  LoremModel.prototype.defaults = function() {
    var ls, _ref, _ref1, _ref2;
    ls = JSON.parse(localStorage.getItem('settings'));
    return {
      flavor: (_ref = ls != null ? ls["flavor"] : void 0) != null ? _ref : "Lorem Ipsum",
      paragraphs: (_ref1 = ls != null ? ls["paragraphs"] : void 0) != null ? _ref1 : 3,
      format: (_ref2 = ls != null ? ls["format"] : void 0) != null ? _ref2 : "Text"
    };
  };

  LoremModel.prototype.set = function() {
    LoremModel.__super__.set.apply(this, arguments);
    return localStorage.setItem("settings", JSON.stringify(this.attributes));
  };

  LoremModel.prototype.setFlavor = function(value) {
    return this.set({
      flavor: value
    });
  };

  LoremModel.prototype.setParagraphs = function(value) {
    return this.set({
      paragraphs: value
    });
  };

  LoremModel.prototype.setFormat = function(value) {
    return this.set({
      format: value
    });
  };

  return LoremModel;

})(Backbone.Model);

module.exports = LoremModel;



},{"backbone":"/Users/bobbygrace/Code/lore-opossum/node_modules/backbone/backbone.js"}]},{},["/Users/bobbygrace/Code/lore-opossum/index.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm9iYnlncmFjZS9Db2RlL2xvcmUtb3Bvc3N1bS9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYmFja2JvbmUvYmFja2JvbmUuanMiLCJub2RlX21vZHVsZXMvYmFja2JvbmUvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL2FkZEV2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS9iaW5kLmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL2JpbmRNdWx0aXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS9iaW5kU2VxdWVuY2UuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL0NvbWJva2V5cy9wcm90b3R5cGUvYmluZFNpbmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS9maXJlQ2FsbGJhY2suanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL0NvbWJva2V5cy9wcm90b3R5cGUvZ2V0S2V5SW5mby5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS9nZXRNYXRjaGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL2dldFJldmVyc2VNYXAuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL0NvbWJva2V5cy9wcm90b3R5cGUvaGFuZGxlS2V5LmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL2hhbmRsZUtleUV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL21vZGlmaWVyc01hdGNoLmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL3BpY2tCZXN0QWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL3Jlc2V0LmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9Db21ib2tleXMvcHJvdG90eXBlL3Jlc2V0U2VxdWVuY2VUaW1lci5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS9yZXNldFNlcXVlbmNlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS9zdG9wQ2FsbGJhY2suanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL0NvbWJva2V5cy9wcm90b3R5cGUvdHJpZ2dlci5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvQ29tYm9rZXlzL3Byb3RvdHlwZS91bmJpbmQuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL0NvbWJva2V5cy9yZXNldC5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvaGVscGVycy9hZGRFdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvaGVscGVycy9jaGFyYWN0ZXJGcm9tRXZlbnQuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL2hlbHBlcnMvZXZlbnRNb2RpZmllcnMuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL2hlbHBlcnMvaXNNb2RpZmllci5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvaGVscGVycy9rZXlzRnJvbVN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvaGVscGVycy9wcmV2ZW50RGVmYXVsdC5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvaGVscGVycy9zaGlmdC1tYXAuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL2hlbHBlcnMvc3BlY2lhbC1hbGlhc2VzLmpzIiwibm9kZV9tb2R1bGVzL2NvbWJva2V5cy9oZWxwZXJzL3NwZWNpYWwtY2hhcmFjdGVycy1tYXAuanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL2hlbHBlcnMvc3BlY2lhbC1rZXlzLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9jb21ib2tleXMvaGVscGVycy9zdG9wUHJvcGFnYXRpb24uanMiLCJub2RlX21vZHVsZXMvY29tYm9rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RlYWN1cC9saWIvdGVhY3VwLmpzIiwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIm5vZGVfbW9kdWxlcy96ZXB0b2pzL3plcHRvLmpzIiwibm9kZV9tb2R1bGVzL3plcm9jbGlwYm9hcmQvZGlzdC9aZXJvQ2xpcGJvYXJkLmpzIiwiL1VzZXJzL2JvYmJ5Z3JhY2UvQ29kZS9sb3JlLW9wb3NzdW0vc3JjL2NvZmZlZXNjcmlwdC9hcHB2aWV3LmNvZmZlZSIsIi9Vc2Vycy9ib2JieWdyYWNlL0NvZGUvbG9yZS1vcG9zc3VtL3NyYy9jb2ZmZWVzY3JpcHQvY2xpcGJvYXJkLmNvZmZlZSIsIi9Vc2Vycy9ib2JieWdyYWNlL0NvZGUvbG9yZS1vcG9zc3VtL3NyYy9jb2ZmZWVzY3JpcHQvZmxhdm9ycy5jb2ZmZWUiLCIvVXNlcnMvYm9iYnlncmFjZS9Db2RlL2xvcmUtb3Bvc3N1bS9zcmMvY29mZmVlc2NyaXB0L21vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsbUJBQUE7O0FBQUEsT0FBQSxHQUFrQixPQUFBLENBQVEsbUNBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxVQUNBLEdBQWtCLE9BQUEsQ0FBUSxpQ0FBUixDQURsQixDQUFBOztBQUFBLElBR0ksT0FBQSxDQUFRO0FBQUEsRUFBQyxLQUFBLEVBQU8sR0FBQSxDQUFBLFVBQVI7Q0FBUixDQUFnQyxDQUFDLE1BQWpDLENBQUEsQ0FISixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hrREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Y0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyWUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzaURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3p3RUEsSUFBQSxxSEFBQTtFQUFBO2lTQUFBOztBQUFBLENBQUEsR0FBa0IsT0FBQSxDQUFRLFNBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxDQUNBLEdBQWtCLE9BQUEsQ0FBUSxZQUFSLENBRGxCLENBQUE7O0FBQUEsUUFFQSxHQUFrQixPQUFBLENBQVEsVUFBUixDQUZsQixDQUFBOztBQUFBLFFBR1EsQ0FBQyxDQUFULEdBQWtCLENBSGxCLENBQUE7O0FBQUEsYUFJQSxHQUFrQixPQUFBLENBQVEsZUFBUixDQUpsQixDQUFBOztBQUFBLE9BS0EsR0FBa0IsT0FBQSxDQUFRLGtCQUFSLENBTGxCLENBQUE7O0FBQUEsU0FNQSxHQUFrQixPQUFBLENBQVEsV0FBUixDQU5sQixDQUFBOztBQUFBLGNBT0EsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBUGxCLENBQUE7O0FBQUEsT0FRMEMsT0FBQSxDQUFRLFFBQVIsQ0FBMUMsRUFBRSxjQUFBLE1BQUYsRUFBVSxTQUFBLENBQVYsRUFBYSxXQUFBLEdBQWIsRUFBa0IsVUFBQSxFQUFsQixFQUFzQixZQUFBLElBQXRCLEVBQTRCLFVBQUEsRUFBNUIsRUFBZ0MsVUFBQSxFQUFoQyxFQUFvQyxTQUFBLENBUnBDLENBQUE7O0FBQUEsYUFVYSxDQUFDLE1BQWQsQ0FBc0I7QUFBQSxFQUFFLE9BQUEsRUFBUyx1QkFBWDtDQUF0QixDQVZBLENBQUE7O0FBQUE7QUFjRSw0QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsb0JBQUEsTUFBQSxHQUNFO0FBQUEsSUFBQSwyQkFBQSxFQUE2QixjQUE3QjtBQUFBLElBQ0EsK0JBQUEsRUFBaUMscUJBRGpDO0FBQUEsSUFFQSwyQkFBQSxFQUE2QixjQUY3QjtBQUFBLElBR0EsNkJBQUEsRUFBK0IsUUFIL0I7QUFBQSxJQUlBLDBCQUFBLEVBQTRCLGVBSjVCO0FBQUEsSUFLQSwyQkFBQSxFQUE2QixnQkFMN0I7R0FERixDQUFBOztBQUFBLG9CQVFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixLQUFwQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLGNBQUEsQ0FBQSxDQUR0QixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBQWtCLFFBQWxCLEVBQTRCLElBQUMsQ0FBQSxXQUE3QixDQUZBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLEtBQVgsRUFBa0IsZUFBbEIsRUFBbUMsSUFBQyxDQUFBLGFBQXBDLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsS0FBWCxFQUFrQixtQkFBbEIsRUFBdUMsSUFBQyxDQUFBLG1CQUF4QyxDQUpBLENBQUE7V0FLQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBQWtCLGVBQWxCLEVBQW1DLElBQUMsQ0FBQSxhQUFwQyxFQU5VO0VBQUEsQ0FSWixDQUFBOztBQUFBLG9CQWdCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sUUFBQSxTQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQUEsQ0FBRSxTQUFGLENBQVosQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBSkEsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUxBLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLGFBQUEsQ0FBYyxJQUFDLENBQUEsQ0FBRCxDQUFHLHVCQUFILENBQWQsQ0FWM0IsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEVBQXJCLENBQXdCLE9BQXhCLEVBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtlQUMvQixLQUFDLENBQUEsQ0FBRCxDQUFHLHVCQUFILENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsUUFBckMsRUFEK0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxDQVpBLENBQUE7QUFBQSxJQWVBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxFQUFyQixDQUF3QixPQUF4QixFQUFpQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7ZUFDL0IsS0FBQyxDQUFBLENBQUQsQ0FBRyx1QkFBSCxDQUEyQixDQUFDLFdBQTVCLENBQXdDLFFBQXhDLEVBRCtCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakMsQ0FmQSxDQUFBO0FBQUEsSUFrQkEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEVBQXJCLENBQXdCLE1BQXhCLEVBQWdDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUM5QixZQUFBLFNBQUE7QUFBQSxRQUFBLFNBQUEsR0FBWSxDQUFDLENBQUMsYUFBZCxDQUFBO2VBQ0EsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsWUFBbEIsRUFBZ0MsS0FBQyxDQUFBLGNBQWMsQ0FBQyxLQUFoRCxFQUY4QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDLENBbEJBLENBQUE7QUFBQSxJQXNCQSxJQUFDLENBQUEsbUJBQW1CLENBQUMsRUFBckIsQ0FBd0IsV0FBeEIsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNuQyxLQUFDLENBQUEsZ0JBQUQsQ0FBQSxFQURtQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLENBdEJBLENBQUE7QUF5QkEsSUFBQSxJQUFHLENBQUEsc0JBQXVCLENBQUMsSUFBdkIsQ0FBNEIsU0FBUyxDQUFDLFFBQXRDLENBQUo7QUFDRSxNQUFBLElBQUMsQ0FBQSxDQUFELENBQUcsbUJBQUgsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixNQUE3QixDQUFBLENBREY7S0F6QkE7QUFBQSxJQTRCQSxDQUFDLENBQUMsS0FBRixDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDTixLQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsUUFBakIsRUFETTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsQ0E1QkEsQ0FBQTtBQUFBLElBa0NBLFNBQUEsR0FBZ0IsSUFBQSxTQUFBLENBQVUsUUFBVixDQWxDaEIsQ0FBQTtBQUFBLElBb0NBLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZixFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQXFCLEdBQXJCLEVBQUg7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXBDQSxDQUFBO0FBQUEsSUFxQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsRUFBSDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBckNBLENBQUE7QUFBQSxJQXNDQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQWYsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUFHLEtBQUMsQ0FBQSxLQUFLLENBQUMsYUFBUCxDQUFxQixHQUFyQixFQUFIO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0F0Q0EsQ0FBQTtBQUFBLElBdUNBLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZixFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQXFCLEdBQXJCLEVBQUg7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXZDQSxDQUFBO0FBQUEsSUF3Q0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsRUFBSDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBeENBLENBQUE7QUFBQSxJQXlDQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQWYsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUFHLEtBQUMsQ0FBQSxLQUFLLENBQUMsYUFBUCxDQUFxQixHQUFyQixFQUFIO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0F6Q0EsQ0FBQTtBQUFBLElBMENBLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZixFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQXFCLEdBQXJCLEVBQUg7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQTFDQSxDQUFBO0FBQUEsSUEyQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsRUFBSDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBM0NBLENBQUE7QUFBQSxJQTZDQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQWYsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUFHLEtBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixNQUFqQixFQUFIO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0E3Q0EsQ0FBQTtBQUFBLElBOENBLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZixFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLE1BQWpCLEVBQUg7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQTlDQSxDQUFBO0FBQUEsSUErQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsTUFBakIsRUFBSDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBL0NBLENBQUE7QUFBQSxJQWlEQSxTQUFTLENBQUMsSUFBVixDQUFlLEtBQWYsRUFBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUFHLEtBQUMsQ0FBQSxjQUFELENBQUEsRUFBSDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCLENBakRBLENBQUE7V0FtREEsS0FwRE07RUFBQSxDQWhCUixDQUFBOztBQUFBLG9CQXNFQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsUUFBQSw4QkFBQTtBQUFBLElBQUEsY0FBQSxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQWpCLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTtBQUNULFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLGdDQUFWLENBQUE7QUFDQSxNQUFBLElBQUcsTUFBQSxLQUFVLGNBQWI7QUFDRSxRQUFBLE9BQUEsSUFBVyxhQUFYLENBREY7T0FEQTtBQUlBLGFBQU87QUFBQSxRQUNMLE1BQUEsRUFBUSxHQURIO0FBQUEsUUFFTCxhQUFBLEVBQWUsTUFGVjtBQUFBLFFBR0wsT0FBQSxFQUFTLE9BSEo7T0FBUCxDQUxTO0lBQUEsQ0FGWCxDQUFBO0FBQUEsSUFhQSxJQUFBLEdBQU8sTUFBQSxDQUFPLFNBQUEsR0FBQTtBQUNaLFVBQUEsZ0JBQUE7QUFBQTtXQUFBLGlCQUFBLEdBQUE7QUFDRSxzQkFBQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO2lCQUMvQixDQUFBLENBQUUsUUFBQSxDQUFTLE1BQVQsQ0FBRixFQUFvQixTQUFBLEdBQUE7bUJBQ2xCLElBQUEsQ0FBSyxNQUFMLEVBRGtCO1VBQUEsQ0FBcEIsRUFEK0I7UUFBQSxDQUFqQyxFQUFBLENBREY7QUFBQTtzQkFEWTtJQUFBLENBQVAsQ0FiUCxDQUFBO0FBQUEsSUFtQkEsSUFBQyxDQUFBLENBQUQsQ0FBRyxrQkFBSCxDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLENBbkJBLENBQUE7V0FxQkEsS0F0QmE7RUFBQSxDQXRFZixDQUFBOztBQUFBLG9CQThGQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxzREFBQTtBQUFBLElBQUEsZUFBQSxHQUFrQix3QkFBbEIsQ0FBQTtBQUFBLElBQ0EscUJBQUEsR0FBd0IsTUFBQSxDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsQ0FBUCxDQUR4QixDQUFBO0FBQUEsSUFHQSxRQUFBLEdBQVcsU0FBQyxPQUFELEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxnQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFHLE9BQUEsS0FBVyxxQkFBZDtBQUNFLFFBQUEsT0FBQSxJQUFXLGFBQVgsQ0FERjtPQURBO0FBSUEsYUFBTztBQUFBLFFBQ0wsTUFBQSxFQUFRLEdBREg7QUFBQSxRQUVMLGlCQUFBLEVBQW1CLE9BRmQ7QUFBQSxRQUdMLE9BQUEsRUFBUyxPQUhKO09BQVAsQ0FMUztJQUFBLENBSFgsQ0FBQTtBQUFBLElBY0EsSUFBQSxHQUFPLE1BQUEsQ0FBTyxTQUFBLEdBQUE7QUFDWixVQUFBLDJCQUFBO0FBQUE7V0FBQSxzREFBQTtzQ0FBQTtBQUNFLHNCQUFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7aUJBQy9CLENBQUEsQ0FBRSxRQUFBLENBQVMsT0FBVCxDQUFGLEVBQXFCLFNBQUEsR0FBQTttQkFDbkIsSUFBQSxDQUFLLE9BQUwsRUFEbUI7VUFBQSxDQUFyQixFQUQrQjtRQUFBLENBQWpDLEVBQUEsQ0FERjtBQUFBO3NCQURZO0lBQUEsQ0FBUCxDQWRQLENBQUE7QUFBQSxJQW9CQSxJQUFDLENBQUEsQ0FBRCxDQUFHLHFCQUFILENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0IsQ0FwQkEsQ0FBQTtXQXNCQSxLQXZCbUI7RUFBQSxDQTlGckIsQ0FBQTs7QUFBQSxvQkF1SEEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLFFBQUEsdUNBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLENBQVYsQ0FBQTtBQUFBLElBQ0EsY0FBQSxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBRGpCLENBQUE7QUFBQSxJQUdBLFFBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTtBQUNULFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLGdDQUFWLENBQUE7QUFDQSxNQUFBLElBQUcsTUFBQSxLQUFVLGNBQWI7QUFDRSxRQUFBLE9BQUEsSUFBVyxhQUFYLENBREY7T0FEQTtBQUlBLGFBQU87QUFBQSxRQUNMLE1BQUEsRUFBUSxHQURIO0FBQUEsUUFFTCxhQUFBLEVBQWUsTUFGVjtBQUFBLFFBR0wsT0FBQSxFQUFTLE9BSEo7T0FBUCxDQUxTO0lBQUEsQ0FIWCxDQUFBO0FBQUEsSUFjQSxJQUFBLEdBQU8sTUFBQSxDQUFPLFNBQUEsR0FBQTtBQUNaLFVBQUEsMEJBQUE7QUFBQTtXQUFBLDhDQUFBOzZCQUFBO0FBQ0Usc0JBQUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTtpQkFDL0IsQ0FBQSxDQUFFLFFBQUEsQ0FBUyxNQUFULENBQUYsRUFBb0IsU0FBQSxHQUFBO21CQUNsQixJQUFBLENBQUssTUFBTCxFQURrQjtVQUFBLENBQXBCLEVBRCtCO1FBQUEsQ0FBakMsRUFBQSxDQURGO0FBQUE7c0JBRFk7SUFBQSxDQUFQLENBZFAsQ0FBQTtBQUFBLElBb0JBLElBQUMsQ0FBQSxDQUFELENBQUcsa0JBQUgsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixDQXBCQSxDQUFBO1dBc0JBLEtBdkJhO0VBQUEsQ0F2SGYsQ0FBQTs7QUFBQSxvQkFnSkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsa0ZBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsa0JBQUYsQ0FBVCxDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQURULENBQUE7QUFBQSxJQUVBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxDQUZoQixDQUFBO0FBQUEsSUFHQSxVQUFBOztBQUFjO1dBQWlDLHNIQUFqQyxHQUFBO0FBQUEsc0JBQUEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFBQSxDQUFBO0FBQUE7O2lCQUhkLENBQUE7QUFLQSxZQUFPLE1BQVA7QUFBQSxXQUVPLE1BRlA7QUFHSSxRQUFBLElBQUEsR0FBTyxNQUFBLENBQU8sU0FBQSxHQUFBO0FBQ1osY0FBQSxrQkFBQTtBQUFBO2VBQUEsaURBQUE7a0NBQUE7QUFDRSwwQkFBQSxDQUFBLENBQUcsS0FBQSxHQUFLLElBQUwsR0FBVSxNQUFiLEVBQUEsQ0FERjtBQUFBOzBCQURZO1FBQUEsQ0FBUCxDQUFQLENBQUE7QUFBQSxRQUlBLFNBQUEsR0FBWSxNQUFBLENBQU8sU0FBQSxHQUFBO0FBQ2pCLGNBQUEsa0JBQUE7QUFBQTtlQUFBLGlEQUFBO2tDQUFBO0FBQ0UsMEJBQUEsR0FBQSxDQUFLLEtBQUEsR0FBSyxJQUFMLEdBQVUsVUFBZixFQUFBLENBREY7QUFBQTswQkFEaUI7UUFBQSxDQUFQLENBSlosQ0FISjtBQUVPO0FBRlAsV0FXTyxNQVhQO0FBWUksUUFBQSxVQUFBOztBQUFjO2VBQUEsaURBQUE7a0NBQUE7QUFBQSwwQkFBQyxJQUFBLEdBQUksSUFBSixHQUFTLEtBQVYsQ0FBQTtBQUFBOztZQUFkLENBQUE7QUFBQSxRQUNBLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEdBQWhCLENBRG5CLENBQUE7QUFBQSxRQUdBLElBQUEsR0FBTyxNQUFBLENBQU8sU0FBQSxHQUFBO0FBQ1osVUFBQSxJQUFBLENBQUssR0FBTCxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUEsQ0FBSyxVQUFMLENBREEsQ0FBQTtpQkFFQSxJQUFBLENBQUssR0FBTCxFQUhZO1FBQUEsQ0FBUCxDQUhQLENBQUE7QUFBQSxRQVFBLFNBQUEsR0FBWSxNQUFBLENBQU8sU0FBQSxHQUFBO0FBQ2pCLFVBQUEsSUFBQSxDQUFLLEdBQUwsQ0FBQSxDQUFBO0FBQUEsVUFDQSxHQUFBLENBQUksVUFBSixDQURBLENBQUE7aUJBRUEsSUFBQSxDQUFLLEdBQUwsRUFIaUI7UUFBQSxDQUFQLENBUlosQ0FaSjtBQVdPO0FBWFA7QUEwQkksUUFBQSxJQUFBLEdBQU8sTUFBQSxDQUFPLFNBQUEsR0FBQTtBQUNaLGNBQUEsa0JBQUE7QUFBQTtlQUFBLGlEQUFBO2tDQUFBO0FBQ0UsMEJBQUEsQ0FBQSxDQUFFLElBQUYsRUFBQSxDQURGO0FBQUE7MEJBRFk7UUFBQSxDQUFQLENBQVAsQ0FBQTtBQUFBLFFBSUEsU0FBQSxHQUFZLE1BQUEsQ0FBTyxTQUFBLEdBQUE7QUFDakIsY0FBQSxrQkFBQTtBQUFBO2VBQUEsaURBQUE7a0NBQUE7QUFDRSwwQkFBQSxHQUFBLENBQUksRUFBQSxHQUFHLElBQUgsR0FBUSxNQUFaLEVBQUEsQ0FERjtBQUFBOzBCQURpQjtRQUFBLENBQVAsQ0FKWixDQTFCSjtBQUFBLEtBTEE7QUFBQSxJQXVDQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0F2Q0EsQ0FBQTtBQUFBLElBeUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBb0IsU0FBcEIsQ0F6Q0EsQ0FBQTtXQTJDQSxLQTVDVztFQUFBLENBaEpiLENBQUE7O0FBQUEsb0JBOExBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUVoQixRQUFBLDZEQUFBO0FBQUEsSUFBQSxXQUFBLEdBQWMsZ0JBQWQsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLENBQUMsQ0FBQyxNQUFGLENBQVMsV0FBVCxDQURULENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBRlQsQ0FBQTtBQUFBLElBR0EsU0FBQSxHQUFZLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBUSxDQUFBLE1BQUEsQ0FBakIsRUFBMEIsTUFBMUIsQ0FIWixDQUFBO0FBQUEsSUFJQSxXQUFBLEdBQWMsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFmLENBSmQsQ0FBQTtXQU1BLFFBQUEsR0FBVyxXQUFXLENBQUMsTUFBWixDQUFtQixDQUFuQixDQUFxQixDQUFDLFdBQXRCLENBQUEsQ0FBQSxHQUFzQyxXQUFXLENBQUMsS0FBWixDQUFrQixDQUFsQixDQUF0QyxHQUE2RCxJQVJ4RDtFQUFBLENBOUxsQixDQUFBOztBQUFBLG9CQXdNQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFFakIsUUFBQSxpQ0FBQTtBQUFBLElBQUEsV0FBQSxHQUFjLGVBQWQsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLENBQUMsQ0FBQyxNQUFGLENBQVMsV0FBVCxDQURULENBQUE7V0FFQSxTQUFBLEdBQVk7O0FBQUM7V0FBNkIsb0ZBQTdCLEdBQUE7QUFBQSxzQkFBQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxFQUFBLENBQUE7QUFBQTs7aUJBQUQsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxHQUFoRCxFQUpLO0VBQUEsQ0F4TW5CLENBQUE7O0FBQUEsb0JBOE1BLFlBQUEsR0FBYyxTQUFDLENBQUQsR0FBQTtBQUNaLFFBQUEsS0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsYUFBakIsQ0FEUixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsS0FBakIsQ0FGQSxDQUFBO1dBR0EsTUFKWTtFQUFBLENBOU1kLENBQUE7O0FBQUEsb0JBb05BLG1CQUFBLEdBQXFCLFNBQUMsQ0FBRCxHQUFBO0FBQ25CLFFBQUEsS0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsaUJBQWpCLENBRFIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQXFCLEtBQXJCLENBRkEsQ0FBQTtXQUdBLE1BSm1CO0VBQUEsQ0FwTnJCLENBQUE7O0FBQUEsb0JBME5BLFlBQUEsR0FBYyxTQUFDLENBQUQsR0FBQTtBQUNaLFFBQUEsS0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsYUFBakIsQ0FEUixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsS0FBakIsQ0FGQSxDQUFBO1dBR0EsTUFKWTtFQUFBLENBMU5kLENBQUE7O0FBQUEsb0JBZ09BLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLHNCQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLENBQUQsQ0FBRyx1QkFBSCxDQUFYLENBQUE7QUFBQSxJQUNBLFlBQUEsR0FBZSxRQUFRLENBQUMsSUFBVCxDQUFBLENBRGYsQ0FBQTtBQUFBLElBRUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFkLENBRkEsQ0FBQTtXQUdBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQ1QsUUFBUSxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBRFM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRUUsSUFGRixFQUpnQjtFQUFBLENBaE9sQixDQUFBOztBQUFBLG9CQXdPQSxhQUFBLEdBQWUsU0FBQyxDQUFELEdBQUE7QUFDYixJQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLGdCQUFMO0FBQ0UsTUFBQSxDQUFDLENBQUMsR0FBRixDQUFNLGlCQUFOLEVBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUN2QixVQUFBLEtBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFwQixDQUFBO2lCQUNBLEtBQUMsQ0FBQSxDQUFELENBQUcsZUFBSCxDQUFtQixDQUFDLElBQXBCLENBQXlCLElBQXpCLEVBRnVCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBQSxDQURGO0tBRkE7QUFBQSxJQU9BLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLG9CQUFuQixDQVBBLENBQUE7V0FTQSxNQVZhO0VBQUEsQ0F4T2YsQ0FBQTs7QUFBQSxvQkFvUEEsY0FBQSxHQUFnQixTQUFDLENBQUQsR0FBQTs7TUFDZCxDQUFDLENBQUUsY0FBSCxDQUFBO0tBQUE7QUFBQSxJQUNBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxXQUFWLENBQXNCLG9CQUF0QixDQURBLENBQUE7V0FFQSxNQUhjO0VBQUEsQ0FwUGhCLENBQUE7O0FBQUEsb0JBeVBBLE1BQUEsR0FBUSxTQUFDLENBQUQsR0FBQTtBQUNOLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7V0FDQSxNQUZNO0VBQUEsQ0F6UFIsQ0FBQTs7aUJBQUE7O0dBRm9CLFFBQVEsQ0FBQyxLQVovQixDQUFBOztBQUFBLE1BNFFNLENBQUMsT0FBUCxHQUFpQixPQTVRakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLG9DQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsU0FBUixDQUFKLENBQUE7O0FBQUEsQ0FDQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBREosQ0FBQTs7QUFBQSxjQUdBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2YsRUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBUCxDQUFBO0FBQ0EsU0FBTyxDQUFBLENBQUMsQ0FBRSxJQUFJLENBQUMsS0FBTCxDQUFBLENBQUEsSUFBZ0IsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFqQixDQUFGLElBQXFDLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBVCxDQUFBLEtBQXVCLE1BQW5FLENBRmU7QUFBQSxDQUhqQixDQUFBOztBQUFBO0FBUWUsRUFBQSx3QkFBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBQVQsQ0FBQTtBQUFBLElBRUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE9BQVosQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO0FBSWxCLFlBQUEseUNBQUE7QUFBQSxRQUFBLElBQUcsQ0FBQSxLQUFFLENBQUEsS0FBRixJQUFXLENBQUEsQ0FBRSxDQUFDLENBQUMsT0FBRixJQUFhLENBQUMsQ0FBQyxPQUFoQixDQUFmO0FBQ0UsZ0JBQUEsQ0FERjtTQUFBO0FBSUEsUUFBQSxJQUFHLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBaEI7QUFDRSxVQUFBLFFBQUEsR0FBVyxDQUFBLENBQUUsdUJBQUYsQ0FBWCxDQUFBO0FBQUEsVUFDQSxZQUFBLEdBQWUsUUFBUSxDQUFDLElBQVQsQ0FBQSxDQURmLENBQUE7QUFBQSxVQUVBLFFBQ0EsQ0FBQyxJQURELENBQ00sU0FETixDQUVBLENBQUMsUUFGRCxDQUVVLFVBRlYsQ0FGQSxDQUFBO0FBQUEsVUFLQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULFFBQ0EsQ0FBQyxJQURELENBQ00sWUFETixDQUVBLENBQUMsV0FGRCxDQUVhLFVBRmIsRUFEUztVQUFBLENBQVgsRUFJRSxJQUpGLENBTEEsQ0FERjtTQUpBO0FBQUEsUUFnQkEsSUFBQSxHQUFPLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQWhCUCxDQUFBO0FBaUJBLFFBQUEsSUFBRyxJQUFJLENBQUMsRUFBTCxDQUFRLGdCQUFSLENBQUg7QUFDRSxVQUFBLElBQUcsY0FBQSxDQUFlLElBQWYsQ0FBSDtBQUNFLGtCQUFBLENBREY7V0FERjtTQWpCQTtBQXVCQSxRQUFBLDZGQUF5QixDQUFFLFFBQXhCLENBQUEsbUJBQUg7QUFDRSxnQkFBQSxDQURGO1NBdkJBO0FBMEJBLFFBQUEsZ0RBQXFCLENBQUUsV0FBcEIsQ0FBQSxDQUFpQyxDQUFDLGFBQXJDO0FBQ0UsZ0JBQUEsQ0FERjtTQTFCQTtlQTZCQSxDQUFDLENBQUMsS0FBRixDQUFRLFNBQUEsR0FBQTtBQUNOLGNBQUEsbUJBQUE7QUFBQSxVQUFBLG1CQUFBLEdBQXNCLENBQUEsQ0FBRSxxQkFBRixDQUF0QixDQUFBO0FBQUEsVUFDQSxtQkFBbUIsQ0FBQyxLQUFwQixDQUFBLENBQTJCLENBQUMsSUFBNUIsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLEtBQUMsQ0FBQSxlQUFELEdBQW1CLENBQUEsQ0FBRSw4RUFBRixDQUNuQixDQUFDLEdBRGtCLENBQ2QsS0FBQyxDQUFBLEtBRGEsQ0FFbkIsQ0FBQyxRQUZrQixDQUVULG1CQUZTLENBR25CLENBQUMsS0FIa0IsQ0FBQSxDQUZuQixDQUFBO2lCQU9BLEtBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXBCLENBQUEsRUFSTTtRQUFBLENBQVIsRUFqQ2tCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FGQSxDQUFBO0FBQUEsSUE4Q0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQyxDQUFELEdBQUE7QUFFaEIsTUFBQSxJQUFHLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsRUFBWixDQUFlLDJCQUFmLENBQUg7ZUFDRSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxLQUF6QixDQUFBLENBQWdDLENBQUMsSUFBakMsQ0FBQSxFQURGO09BRmdCO0lBQUEsQ0FBbEIsQ0E5Q0EsQ0FEVztFQUFBLENBQWI7O0FBQUEsMkJBb0RBLEdBQUEsR0FBSyxTQUFFLEtBQUYsR0FBQTtBQUFVLElBQVQsSUFBQyxDQUFBLFFBQUEsS0FBUSxDQUFWO0VBQUEsQ0FwREwsQ0FBQTs7d0JBQUE7O0lBUkYsQ0FBQTs7QUFBQSxNQThETSxDQUFDLE9BQVAsR0FBaUIsY0E5RGpCLENBQUE7Ozs7O0FDQUEsSUFBQSxPQUFBOztBQUFBLE9BQUEsR0FDRTtBQUFBLEVBQUEsYUFBQSxFQUFlLENBQ2IsT0FEYSxFQUViLE9BRmEsRUFHYixPQUhhLEVBSWIsS0FKYSxFQUtiLE1BTGEsRUFNYixhQU5hLEVBT2IsWUFQYSxFQVFiLE1BUmEsRUFTYixTQVRhLEVBVWIsSUFWYSxFQVdiLFFBWGEsRUFZYixNQVphLEVBYWIsV0FiYSxFQWNiLE9BZGEsRUFlYixTQWZhLEVBZ0JiLFVBaEJhLEVBaUJiLEtBakJhLEVBa0JiLE9BbEJhLEVBbUJiLFVBbkJhLEVBb0JiLE1BcEJhLEVBcUJiLE9BckJhLEVBc0JiLE9BdEJhLEVBdUJiLEdBdkJhLEVBd0JiLFFBeEJhLEVBeUJiLFFBekJhLEVBMEJiLFdBMUJhLEVBMkJiLFdBM0JhLEVBNEJiLE1BNUJhLEVBNkJiLElBN0JhLEVBOEJiLFNBOUJhLEVBK0JiLFFBL0JhLEVBZ0NiLE1BaENhLEVBaUNiLFdBakNhLEVBa0NiLFFBbENhLEVBbUNiLE9BbkNhLEVBb0NiLE9BcENhLEVBcUNiLFVBckNhLEVBc0NiLE9BdENhLEVBdUNiLFVBdkNhLEVBd0NiLGFBeENhLEVBeUNiLE9BekNhLEVBMENiLElBMUNhLEVBMkNiLFNBM0NhLEVBNENiLE1BNUNhLEVBNkNiLFdBN0NhLEVBOENiLElBOUNhLEVBK0NiLElBL0NhLEVBZ0RiLE1BaERhLEVBaURiLFdBakRhLEVBa0RiLFFBbERhLEVBbURiLFVBbkRhLEVBb0RiLFdBcERhLEVBcURiLE1BckRhLEVBc0RiLFNBdERhLEVBdURiLGNBdkRhLEVBd0RiLEtBeERhLEVBeURiLFFBekRhLEVBMERiLFlBMURhLEVBMkRiLFdBM0RhLEVBNERiLE9BNURhLEVBNkRiLE9BN0RhLEVBOERiLFNBOURhLEVBK0RiLElBL0RhLEVBZ0ViLEtBaEVhLEVBaUViLFVBakVhLEVBa0ViLFFBbEVhLEVBbUViLFdBbkVhLEVBb0ViLElBcEVhLEVBcUViLFNBckVhLEVBc0ViLFFBdEVhLEVBdUViLElBdkVhLEVBd0ViLGNBeEVhLEVBeUViLE1BekVhLEVBMEViLE1BMUVhLEVBMkViLGNBM0VhLEVBNEViLEtBNUVhLEVBNkViLE1BN0VhLEVBOEViLFFBOUVhLEVBK0ViLFdBL0VhLEVBZ0ZiLEtBaEZhLEVBaUZiLFNBakZhLEVBa0ZiLEtBbEZhLEVBbUZiLFdBbkZhLEVBb0ZiLFNBcEZhLEVBcUZiLFFBckZhLEVBc0ZiLE1BdEZhLEVBdUZiLFFBdkZhLEVBd0ZiLEtBeEZhLEVBeUZiLE9BekZhLEVBMEZiLFVBMUZhLEVBMkZiLE1BM0ZhLEVBNEZiLFNBNUZhLEVBNkZiLFVBN0ZhLEVBOEZiLEtBOUZhLEVBK0ZiLE1BL0ZhLEVBZ0diLFFBaEdhLEVBaUdiLE9BakdhLEVBa0diLFNBbEdhLEVBbUdiLFNBbkdhLEVBb0diLE9BcEdhLEVBcUdiLGFBckdhLEVBc0diLE9BdEdhLEVBdUdiLE1BdkdhLEVBd0diLFFBeEdhLEVBeUdiLFVBekdhLEVBMEdiLFdBMUdhLEVBMkdiLGFBM0dhLEVBNEdiLE9BNUdhLEVBNkdiLFFBN0dhLEVBOEdiLFFBOUdhLEVBK0diLFFBL0dhLEVBZ0hiLE9BaEhhLEVBaUhiLFdBakhhLEVBa0hiLE1BbEhhLEVBbUhiLFVBbkhhLEVBb0hiLElBcEhhLEVBcUhiLFFBckhhLEVBc0hiLFNBdEhhLEVBdUhiLE9BdkhhLEVBd0hiLEtBeEhhLEVBeUhiLFNBekhhLEVBMEhiLE1BMUhhLEVBMkhiLFNBM0hhLEVBNEhiLE1BNUhhLEVBNkhiLEtBN0hhLEVBOEhiLFNBOUhhLEVBK0hiLE9BL0hhLEVBZ0liLFFBaElhLEVBaUliLE9BaklhLEVBa0liLFNBbElhLEVBbUliLFNBbklhLEVBb0liLFdBcElhLEVBcUliLFVBcklhLEVBc0liLGFBdElhLEVBdUliLFFBdklhLEVBd0liLFFBeElhLEVBeUliLFNBeklhLEVBMEliLFNBMUlhLEVBMkliLFVBM0lhLEVBNEliLFdBNUlhLEVBNkliLFdBN0lhLEVBOEliLFVBOUlhLEVBK0liLElBL0lhLEVBZ0piLFdBaEphLEVBaUpiLFVBakphLEVBa0piLE9BbEphLEVBbUpiLFVBbkphLEVBb0piLE9BcEphLEVBcUpiLFdBckphLEVBc0piLE9BdEphLEVBdUpiLE9BdkphLEVBd0piLElBeEphLEVBeUpiLFFBekphLEVBMEpiLFNBMUphLEVBMkpiLE1BM0phLENBQWY7QUFBQSxFQTZKQSxRQUFBLEVBQVUsQ0FDUixNQURRLEVBRVIsT0FGUSxFQUdSLE9BSFEsRUFJUixlQUpRLEVBS1IsYUFMUSxFQU1SLFFBTlEsRUFPUixNQVBRLEVBUVIsWUFSUSxFQVNSLFNBVFEsRUFVUixhQVZRLEVBV1IsZ0JBWFEsRUFZUixRQVpRLEVBYVIsTUFiUSxFQWNSLFlBZFEsRUFlUixlQWZRLEVBZ0JSLFdBaEJRLEVBaUJSLFNBakJRLEVBa0JSLGNBbEJRLEVBbUJSLE1BbkJRLEVBb0JSLGFBcEJRLEVBcUJSLFVBckJRLEVBc0JSLE1BdEJRLEVBdUJSLG9CQXZCUSxFQXdCUixPQXhCUSxFQXlCUixVQXpCUSxFQTBCUixTQTFCUSxFQTJCUixXQTNCUSxFQTRCUixRQTVCUSxFQTZCUixXQTdCUSxFQThCUixTQTlCUSxFQStCUixlQS9CUSxFQWdDUixNQWhDUSxFQWlDUixNQWpDUSxFQWtDUixVQWxDUSxFQW1DUixVQW5DUSxDQTdKVjtBQUFBLEVBa01BLE9BQUEsRUFBUyxDQUNQLFdBRE8sRUFFUCxlQUZPLEVBR1AsaUJBSE8sRUFJUCxlQUpPLEVBS1AsZ0JBTE8sRUFNUCxjQU5PLEVBT1AsYUFQTyxFQVFQLGlCQVJPLEVBU1AsZUFUTyxFQVVQLFVBVk8sRUFXUCxNQVhPLEVBWVAsS0FaTyxFQWFQLEtBYk8sRUFjUCxLQWRPLEVBZVAsS0FmTyxFQWdCUCxLQWhCTyxFQWlCUCxNQWpCTyxFQWtCUCxXQWxCTyxFQW1CUCxXQW5CTyxFQW9CUCxVQXBCTyxFQXFCUCxjQXJCTyxFQXNCUCxRQXRCTyxFQXVCUCxZQXZCTyxFQXdCUCxPQXhCTyxFQXlCUCxVQXpCTyxFQTBCUCxZQTFCTyxFQTJCUCxXQTNCTyxFQTRCUCxRQTVCTyxFQTZCUCxLQTdCTyxFQThCUCxjQTlCTyxFQStCUCxlQS9CTyxFQWdDUCxPQWhDTyxFQWlDUCxNQWpDTyxFQWtDUCxPQWxDTyxFQW1DUCxRQW5DTyxFQW9DUCxNQXBDTyxFQXFDUCxPQXJDTyxFQXNDUCxNQXRDTyxFQXVDUCxNQXZDTyxFQXdDUCxRQXhDTyxFQXlDUCxRQXpDTyxFQTBDUCxPQTFDTyxFQTJDUCxLQTNDTyxFQTRDUCxPQTVDTyxFQTZDUCxTQTdDTyxFQThDUCxTQTlDTyxFQStDUCxXQS9DTyxFQWdEUCxXQWhETyxFQWlEUCxVQWpETyxFQWtEUCxRQWxETyxFQW1EUCxZQW5ETyxFQW9EUCxZQXBETyxFQXFEUCxVQXJETyxFQXNEUCxTQXRETyxFQXVEUCxTQXZETyxFQXdEUCxhQXhETyxDQWxNVDtBQUFBLEVBNFBBLE9BQUEsRUFBUyxDQUNQLE9BRE8sRUFFUCxPQUZPLEVBR1AsT0FITyxFQUlQLE9BSk8sRUFLUCxPQUxPLEVBTVAsT0FOTyxFQU9QLE9BUE8sRUFRUCxPQVJPLENBNVBUO0FBQUEsRUFzUUEsVUFBQSxFQUFZLENBQ1YsR0FEVSxFQUVWLEdBRlUsRUFHVixJQUhVLEVBSVYsSUFKVSxFQUtWLElBTFUsRUFNVixLQU5VLEVBT1YsTUFQVSxFQVFWLE1BUlUsRUFTVixNQVRVLEVBVVYsT0FWVSxFQVdWLFFBWFUsRUFZVixVQVpVLENBdFFaO0FBQUEsRUFvUkEsU0FBQSxFQUFXLENBQ1QsS0FEUyxFQUVULGVBRlMsRUFHVCxnQ0FIUyxFQUlULE1BSlMsRUFLVCxTQUxTLEVBTVQsd0NBTlMsQ0FwUlg7Q0FERixDQUFBOztBQUFBLE1BOFJNLENBQUMsT0FBUCxHQUFpQixPQTlSakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLG9CQUFBO0VBQUE7aVNBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBQVgsQ0FBQTs7QUFBQTtBQUdFLCtCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSx1QkFBQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSxzQkFBQTtBQUFBLElBQUEsRUFBQSxHQUFLLElBQUksQ0FBQyxLQUFMLENBQVcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsVUFBckIsQ0FBWCxDQUFMLENBQUE7V0FDQTtBQUFBLE1BQ0UsTUFBQSwrREFBd0IsYUFEMUI7QUFBQSxNQUVFLFVBQUEscUVBQWdDLENBRmxDO0FBQUEsTUFHRSxNQUFBLGlFQUF3QixNQUgxQjtNQUZRO0VBQUEsQ0FBVixDQUFBOztBQUFBLHVCQVFBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFDSCxJQUFBLHFDQUFBLFNBQUEsQ0FBQSxDQUFBO1dBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsVUFBckIsRUFBaUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsVUFBaEIsQ0FBakMsRUFGRztFQUFBLENBUkwsQ0FBQTs7QUFBQSx1QkFZQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7V0FDVCxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsTUFBQyxNQUFBLEVBQVEsS0FBVDtLQUFMLEVBRFM7RUFBQSxDQVpYLENBQUE7O0FBQUEsdUJBZUEsYUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBO1dBQ2IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLE1BQUMsVUFBQSxFQUFZLEtBQWI7S0FBTCxFQURhO0VBQUEsQ0FmZixDQUFBOztBQUFBLHVCQWtCQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7V0FDVCxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsTUFBQyxNQUFBLEVBQVEsS0FBVDtLQUFMLEVBRFM7RUFBQSxDQWxCWCxDQUFBOztvQkFBQTs7R0FEdUIsUUFBUSxDQUFDLE1BRmxDLENBQUE7O0FBQUEsTUF3Qk0sQ0FBQyxPQUFQLEdBQWlCLFVBeEJqQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkFwcFZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4vc3JjL2NvZmZlZXNjcmlwdC9hcHB2aWV3LmNvZmZlZSdcbkxvcmVtTW9kZWwgICAgICA9IHJlcXVpcmUgJy4vc3JjL2NvZmZlZXNjcmlwdC9tb2RlbC5jb2ZmZWUnXG5cbm5ldyBBcHBWaWV3KHttb2RlbDogbmV3IExvcmVtTW9kZWx9KS5yZW5kZXIoKVxuIiwiLy8gICAgIEJhY2tib25lLmpzIDEuMS4yXG5cbi8vICAgICAoYykgMjAxMC0yMDE0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgQmFja2JvbmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyAgICAgRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuLy8gICAgIGh0dHA6Ly9iYWNrYm9uZWpzLm9yZ1xuXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gIC8vIFNldCB1cCBCYWNrYm9uZSBhcHByb3ByaWF0ZWx5IGZvciB0aGUgZW52aXJvbm1lbnQuIFN0YXJ0IHdpdGggQU1ELlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknLCAnZXhwb3J0cyddLCBmdW5jdGlvbihfLCAkLCBleHBvcnRzKSB7XG4gICAgICAvLyBFeHBvcnQgZ2xvYmFsIGV2ZW4gaW4gQU1EIGNhc2UgaW4gY2FzZSB0aGlzIHNjcmlwdCBpcyBsb2FkZWQgd2l0aFxuICAgICAgLy8gb3RoZXJzIHRoYXQgbWF5IHN0aWxsIGV4cGVjdCBhIGdsb2JhbCBCYWNrYm9uZS5cbiAgICAgIHJvb3QuQmFja2JvbmUgPSBmYWN0b3J5KHJvb3QsIGV4cG9ydHMsIF8sICQpO1xuICAgIH0pO1xuXG4gIC8vIE5leHQgZm9yIE5vZGUuanMgb3IgQ29tbW9uSlMuIGpRdWVyeSBtYXkgbm90IGJlIG5lZWRlZCBhcyBhIG1vZHVsZS5cbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbiAgICBmYWN0b3J5KHJvb3QsIGV4cG9ydHMsIF8pO1xuXG4gIC8vIEZpbmFsbHksIGFzIGEgYnJvd3NlciBnbG9iYWwuXG4gIH0gZWxzZSB7XG4gICAgcm9vdC5CYWNrYm9uZSA9IGZhY3Rvcnkocm9vdCwge30sIHJvb3QuXywgKHJvb3QualF1ZXJ5IHx8IHJvb3QuWmVwdG8gfHwgcm9vdC5lbmRlciB8fCByb290LiQpKTtcbiAgfVxuXG59KHRoaXMsIGZ1bmN0aW9uKHJvb3QsIEJhY2tib25lLCBfLCAkKSB7XG5cbiAgLy8gSW5pdGlhbCBTZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBCYWNrYm9uZWAgdmFyaWFibGUsIHNvIHRoYXQgaXQgY2FuIGJlXG4gIC8vIHJlc3RvcmVkIGxhdGVyIG9uLCBpZiBgbm9Db25mbGljdGAgaXMgdXNlZC5cbiAgdmFyIHByZXZpb3VzQmFja2JvbmUgPSByb290LkJhY2tib25lO1xuXG4gIC8vIENyZWF0ZSBsb2NhbCByZWZlcmVuY2VzIHRvIGFycmF5IG1ldGhvZHMgd2UnbGwgd2FudCB0byB1c2UgbGF0ZXIuXG4gIHZhciBhcnJheSA9IFtdO1xuICB2YXIgcHVzaCA9IGFycmF5LnB1c2g7XG4gIHZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xuICB2YXIgc3BsaWNlID0gYXJyYXkuc3BsaWNlO1xuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgbGlicmFyeS4gS2VlcCBpbiBzeW5jIHdpdGggYHBhY2thZ2UuanNvbmAuXG4gIEJhY2tib25lLlZFUlNJT04gPSAnMS4xLjInO1xuXG4gIC8vIEZvciBCYWNrYm9uZSdzIHB1cnBvc2VzLCBqUXVlcnksIFplcHRvLCBFbmRlciwgb3IgTXkgTGlicmFyeSAoa2lkZGluZykgb3duc1xuICAvLyB0aGUgYCRgIHZhcmlhYmxlLlxuICBCYWNrYm9uZS4kID0gJDtcblxuICAvLyBSdW5zIEJhY2tib25lLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBCYWNrYm9uZWAgdmFyaWFibGVcbiAgLy8gdG8gaXRzIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmFja2JvbmUgb2JqZWN0LlxuICBCYWNrYm9uZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5CYWNrYm9uZSA9IHByZXZpb3VzQmFja2JvbmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gVHVybiBvbiBgZW11bGF0ZUhUVFBgIHRvIHN1cHBvcnQgbGVnYWN5IEhUVFAgc2VydmVycy4gU2V0dGluZyB0aGlzIG9wdGlvblxuICAvLyB3aWxsIGZha2UgYFwiUEFUQ0hcImAsIGBcIlBVVFwiYCBhbmQgYFwiREVMRVRFXCJgIHJlcXVlc3RzIHZpYSB0aGUgYF9tZXRob2RgIHBhcmFtZXRlciBhbmRcbiAgLy8gc2V0IGEgYFgtSHR0cC1NZXRob2QtT3ZlcnJpZGVgIGhlYWRlci5cbiAgQmFja2JvbmUuZW11bGF0ZUhUVFAgPSBmYWxzZTtcblxuICAvLyBUdXJuIG9uIGBlbXVsYXRlSlNPTmAgdG8gc3VwcG9ydCBsZWdhY3kgc2VydmVycyB0aGF0IGNhbid0IGRlYWwgd2l0aCBkaXJlY3RcbiAgLy8gYGFwcGxpY2F0aW9uL2pzb25gIHJlcXVlc3RzIC4uLiB3aWxsIGVuY29kZSB0aGUgYm9keSBhc1xuICAvLyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYCBpbnN0ZWFkIGFuZCB3aWxsIHNlbmQgdGhlIG1vZGVsIGluIGFcbiAgLy8gZm9ybSBwYXJhbSBuYW1lZCBgbW9kZWxgLlxuICBCYWNrYm9uZS5lbXVsYXRlSlNPTiA9IGZhbHNlO1xuXG4gIC8vIEJhY2tib25lLkV2ZW50c1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdCB3aXRoXG4gIC8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2tcbiAgLy8gZnVuY3Rpb25zIHRvIGFuIGV2ZW50OyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIF8uZXh0ZW5kKG9iamVjdCwgQmFja2JvbmUuRXZlbnRzKTtcbiAgLy8gICAgIG9iamVjdC5vbignZXhwYW5kJywgZnVuY3Rpb24oKXsgYWxlcnQoJ2V4cGFuZGVkJyk7IH0pO1xuICAvLyAgICAgb2JqZWN0LnRyaWdnZXIoJ2V4cGFuZCcpO1xuICAvL1xuICB2YXIgRXZlbnRzID0gQmFja2JvbmUuRXZlbnRzID0ge1xuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZFxuICAgIC8vIHRoZSBjYWxsYmFjayB0byBhbGwgZXZlbnRzIGZpcmVkLlxuICAgIG9uOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSB8fCAodGhpcy5fZXZlbnRzW25hbWVdID0gW10pO1xuICAgICAgZXZlbnRzLnB1c2goe2NhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCwgY3R4OiBjb250ZXh0IHx8IHRoaXN9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBCaW5kIGFuIGV2ZW50IHRvIG9ubHkgYmUgdHJpZ2dlcmVkIGEgc2luZ2xlIHRpbWUuIEFmdGVyIHRoZSBmaXJzdCB0aW1lXG4gICAgLy8gdGhlIGNhbGxiYWNrIGlzIGludm9rZWQsIGl0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICBvbmNlOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uY2UnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIG9uY2UgPSBfLm9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYub2ZmKG5hbWUsIG9uY2UpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICBvbmNlLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgcmV0dXJuIHRoaXMub24obmFtZSwgb25jZSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gICAgLy8gY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxuICAgIG9mZjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCAnb2ZmJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB2b2lkIDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogXy5rZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcbiAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGV2LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0YWluLnB1c2goZXYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAndHJpZ2dlcicsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxuICAgIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBsaXN0ZW5pbmdUbyA9IHRoaXMuX2xpc3RlbmluZ1RvO1xuICAgICAgaWYgKCFsaXN0ZW5pbmdUbykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgcmVtb3ZlID0gIW5hbWUgJiYgIWNhbGxiYWNrO1xuICAgICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIGlmIChvYmopIChsaXN0ZW5pbmdUbyA9IHt9KVtvYmouX2xpc3RlbklkXSA9IG9iajtcbiAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmluZ1RvKSB7XG4gICAgICAgIG9iaiA9IGxpc3RlbmluZ1RvW2lkXTtcbiAgICAgICAgb2JqLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIGlmIChyZW1vdmUgfHwgXy5pc0VtcHR5KG9iai5fZXZlbnRzKSkgZGVsZXRlIHRoaXMuX2xpc3RlbmluZ1RvW2lkXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9O1xuXG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHNwbGl0IGV2ZW50IHN0cmluZ3MuXG4gIHZhciBldmVudFNwbGl0dGVyID0gL1xccysvO1xuXG4gIC8vIEltcGxlbWVudCBmYW5jeSBmZWF0dXJlcyBvZiB0aGUgRXZlbnRzIEFQSSBzdWNoIGFzIG11bHRpcGxlIGV2ZW50XG4gIC8vIG5hbWVzIGBcImNoYW5nZSBibHVyXCJgIGFuZCBqUXVlcnktc3R5bGUgZXZlbnQgbWFwcyBge2NoYW5nZTogYWN0aW9ufWBcbiAgLy8gaW4gdGVybXMgb2YgdGhlIGV4aXN0aW5nIEFQSS5cbiAgdmFyIGV2ZW50c0FwaSA9IGZ1bmN0aW9uKG9iaiwgYWN0aW9uLCBuYW1lLCByZXN0KSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIEhhbmRsZSBldmVudCBtYXBzLlxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGFjZSBzZXBhcmF0ZWQgZXZlbnQgbmFtZXMuXG4gICAgaWYgKGV2ZW50U3BsaXR0ZXIudGVzdChuYW1lKSkge1xuICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChldmVudFNwbGl0dGVyKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW25hbWVzW2ldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIEEgZGlmZmljdWx0LXRvLWJlbGlldmUsIGJ1dCBvcHRpbWl6ZWQgaW50ZXJuYWwgZGlzcGF0Y2ggZnVuY3Rpb24gZm9yXG4gIC8vIHRyaWdnZXJpbmcgZXZlbnRzLiBUcmllcyB0byBrZWVwIHRoZSB1c3VhbCBjYXNlcyBzcGVlZHkgKG1vc3QgaW50ZXJuYWxcbiAgLy8gQmFja2JvbmUgZXZlbnRzIGhhdmUgMyBhcmd1bWVudHMpLlxuICB2YXIgdHJpZ2dlckV2ZW50cyA9IGZ1bmN0aW9uKGV2ZW50cywgYXJncykge1xuICAgIHZhciBldiwgaSA9IC0xLCBsID0gZXZlbnRzLmxlbmd0aCwgYTEgPSBhcmdzWzBdLCBhMiA9IGFyZ3NbMV0sIGEzID0gYXJnc1syXTtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4KTsgcmV0dXJuO1xuICAgICAgY2FzZSAxOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEpOyByZXR1cm47XG4gICAgICBjYXNlIDI6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIpOyByZXR1cm47XG4gICAgICBjYXNlIDM6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIsIGEzKTsgcmV0dXJuO1xuICAgICAgZGVmYXVsdDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suYXBwbHkoZXYuY3R4LCBhcmdzKTsgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbGlzdGVuTWV0aG9kcyA9IHtsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4gIC8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3NcbiAgLy8gbGlzdGVuaW5nIHRvLlxuICBfLmVhY2gobGlzdGVuTWV0aG9kcywgZnVuY3Rpb24oaW1wbGVtZW50YXRpb24sIG1ldGhvZCkge1xuICAgIEV2ZW50c1ttZXRob2RdID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmluZ1RvID0gdGhpcy5fbGlzdGVuaW5nVG8gfHwgKHRoaXMuX2xpc3RlbmluZ1RvID0ge30pO1xuICAgICAgdmFyIGlkID0gb2JqLl9saXN0ZW5JZCB8fCAob2JqLl9saXN0ZW5JZCA9IF8udW5pcXVlSWQoJ2wnKSk7XG4gICAgICBsaXN0ZW5pbmdUb1tpZF0gPSBvYmo7XG4gICAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgb2JqW2ltcGxlbWVudGF0aW9uXShuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9KTtcblxuICAvLyBBbGlhc2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgRXZlbnRzLmJpbmQgICA9IEV2ZW50cy5vbjtcbiAgRXZlbnRzLnVuYmluZCA9IEV2ZW50cy5vZmY7XG5cbiAgLy8gQWxsb3cgdGhlIGBCYWNrYm9uZWAgb2JqZWN0IHRvIHNlcnZlIGFzIGEgZ2xvYmFsIGV2ZW50IGJ1cywgZm9yIGZvbGtzIHdob1xuICAvLyB3YW50IGdsb2JhbCBcInB1YnN1YlwiIGluIGEgY29udmVuaWVudCBwbGFjZS5cbiAgXy5leHRlbmQoQmFja2JvbmUsIEV2ZW50cyk7XG5cbiAgLy8gQmFja2JvbmUuTW9kZWxcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBCYWNrYm9uZSAqKk1vZGVscyoqIGFyZSB0aGUgYmFzaWMgZGF0YSBvYmplY3QgaW4gdGhlIGZyYW1ld29yayAtLVxuICAvLyBmcmVxdWVudGx5IHJlcHJlc2VudGluZyBhIHJvdyBpbiBhIHRhYmxlIGluIGEgZGF0YWJhc2Ugb24geW91ciBzZXJ2ZXIuXG4gIC8vIEEgZGlzY3JldGUgY2h1bmsgb2YgZGF0YSBhbmQgYSBidW5jaCBvZiB1c2VmdWwsIHJlbGF0ZWQgbWV0aG9kcyBmb3JcbiAgLy8gcGVyZm9ybWluZyBjb21wdXRhdGlvbnMgYW5kIHRyYW5zZm9ybWF0aW9ucyBvbiB0aGF0IGRhdGEuXG5cbiAgLy8gQ3JlYXRlIGEgbmV3IG1vZGVsIHdpdGggdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGVzLiBBIGNsaWVudCBpZCAoYGNpZGApXG4gIC8vIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGFuZCBhc3NpZ25lZCBmb3IgeW91LlxuICB2YXIgTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbCA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgYXR0cnMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgdGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCdjJyk7XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgaWYgKG9wdGlvbnMuY29sbGVjdGlvbikgdGhpcy5jb2xsZWN0aW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uO1xuICAgIGlmIChvcHRpb25zLnBhcnNlKSBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMsIG9wdGlvbnMpIHx8IHt9O1xuICAgIGF0dHJzID0gXy5kZWZhdWx0cyh7fSwgYXR0cnMsIF8ucmVzdWx0KHRoaXMsICdkZWZhdWx0cycpKTtcbiAgICB0aGlzLnNldChhdHRycywgb3B0aW9ucyk7XG4gICAgdGhpcy5jaGFuZ2VkID0ge307XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQXR0YWNoIGFsbCBpbmhlcml0YWJsZSBtZXRob2RzIHRvIHRoZSBNb2RlbCBwcm90b3R5cGUuXG4gIF8uZXh0ZW5kKE1vZGVsLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cbiAgICAvLyBBIGhhc2ggb2YgYXR0cmlidXRlcyB3aG9zZSBjdXJyZW50IGFuZCBwcmV2aW91cyB2YWx1ZSBkaWZmZXIuXG4gICAgY2hhbmdlZDogbnVsbCxcblxuICAgIC8vIFRoZSB2YWx1ZSByZXR1cm5lZCBkdXJpbmcgdGhlIGxhc3QgZmFpbGVkIHZhbGlkYXRpb24uXG4gICAgdmFsaWRhdGlvbkVycm9yOiBudWxsLFxuXG4gICAgLy8gVGhlIGRlZmF1bHQgbmFtZSBmb3IgdGhlIEpTT04gYGlkYCBhdHRyaWJ1dGUgaXMgYFwiaWRcImAuIE1vbmdvREIgYW5kXG4gICAgLy8gQ291Y2hEQiB1c2VycyBtYXkgd2FudCB0byBzZXQgdGhpcyB0byBgXCJfaWRcImAuXG4gICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG5cbiAgICAvLyBJbml0aWFsaXplIGlzIGFuIGVtcHR5IGZ1bmN0aW9uIGJ5IGRlZmF1bHQuIE92ZXJyaWRlIGl0IHdpdGggeW91ciBvd25cbiAgICAvLyBpbml0aWFsaXphdGlvbiBsb2dpYy5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cbiAgICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBtb2RlbCdzIGBhdHRyaWJ1dGVzYCBvYmplY3QuXG4gICAgdG9KU09OOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICByZXR1cm4gXy5jbG9uZSh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgIH0sXG5cbiAgICAvLyBQcm94eSBgQmFja2JvbmUuc3luY2AgYnkgZGVmYXVsdCAtLSBidXQgb3ZlcnJpZGUgdGhpcyBpZiB5b3UgbmVlZFxuICAgIC8vIGN1c3RvbSBzeW5jaW5nIHNlbWFudGljcyBmb3IgKnRoaXMqIHBhcnRpY3VsYXIgbW9kZWwuXG4gICAgc3luYzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gQmFja2JvbmUuc3luYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZS5cbiAgICBnZXQ6IGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbYXR0cl07XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgSFRNTC1lc2NhcGVkIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZS5cbiAgICBlc2NhcGU6IGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgIHJldHVybiBfLmVzY2FwZSh0aGlzLmdldChhdHRyKSk7XG4gICAgfSxcblxuICAgIC8vIFJldHVybnMgYHRydWVgIGlmIHRoZSBhdHRyaWJ1dGUgY29udGFpbnMgYSB2YWx1ZSB0aGF0IGlzIG5vdCBudWxsXG4gICAgLy8gb3IgdW5kZWZpbmVkLlxuICAgIGhhczogZnVuY3Rpb24oYXR0cikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KGF0dHIpICE9IG51bGw7XG4gICAgfSxcblxuICAgIC8vIFNldCBhIGhhc2ggb2YgbW9kZWwgYXR0cmlidXRlcyBvbiB0aGUgb2JqZWN0LCBmaXJpbmcgYFwiY2hhbmdlXCJgLiBUaGlzIGlzXG4gICAgLy8gdGhlIGNvcmUgcHJpbWl0aXZlIG9wZXJhdGlvbiBvZiBhIG1vZGVsLCB1cGRhdGluZyB0aGUgZGF0YSBhbmQgbm90aWZ5aW5nXG4gICAgLy8gYW55b25lIHdobyBuZWVkcyB0byBrbm93IGFib3V0IHRoZSBjaGFuZ2UgaW4gc3RhdGUuIFRoZSBoZWFydCBvZiB0aGUgYmVhc3QuXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbCwgb3B0aW9ucykge1xuICAgICAgdmFyIGF0dHIsIGF0dHJzLCB1bnNldCwgY2hhbmdlcywgc2lsZW50LCBjaGFuZ2luZywgcHJldiwgY3VycmVudDtcbiAgICAgIGlmIChrZXkgPT0gbnVsbCkgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIEhhbmRsZSBib3RoIGBcImtleVwiLCB2YWx1ZWAgYW5kIGB7a2V5OiB2YWx1ZX1gIC1zdHlsZSBhcmd1bWVudHMuXG4gICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYXR0cnMgPSBrZXk7XG4gICAgICAgIG9wdGlvbnMgPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoYXR0cnMgPSB7fSlba2V5XSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgICAgLy8gUnVuIHZhbGlkYXRpb24uXG4gICAgICBpZiAoIXRoaXMuX3ZhbGlkYXRlKGF0dHJzLCBvcHRpb25zKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBFeHRyYWN0IGF0dHJpYnV0ZXMgYW5kIG9wdGlvbnMuXG4gICAgICB1bnNldCAgICAgICAgICAgPSBvcHRpb25zLnVuc2V0O1xuICAgICAgc2lsZW50ICAgICAgICAgID0gb3B0aW9ucy5zaWxlbnQ7XG4gICAgICBjaGFuZ2VzICAgICAgICAgPSBbXTtcbiAgICAgIGNoYW5naW5nICAgICAgICA9IHRoaXMuX2NoYW5naW5nO1xuICAgICAgdGhpcy5fY2hhbmdpbmcgID0gdHJ1ZTtcblxuICAgICAgaWYgKCFjaGFuZ2luZykge1xuICAgICAgICB0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHt9O1xuICAgICAgfVxuICAgICAgY3VycmVudCA9IHRoaXMuYXR0cmlidXRlcywgcHJldiA9IHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcztcblxuICAgICAgLy8gQ2hlY2sgZm9yIGNoYW5nZXMgb2YgYGlkYC5cbiAgICAgIGlmICh0aGlzLmlkQXR0cmlidXRlIGluIGF0dHJzKSB0aGlzLmlkID0gYXR0cnNbdGhpcy5pZEF0dHJpYnV0ZV07XG5cbiAgICAgIC8vIEZvciBlYWNoIGBzZXRgIGF0dHJpYnV0ZSwgdXBkYXRlIG9yIGRlbGV0ZSB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICAgIGZvciAoYXR0ciBpbiBhdHRycykge1xuICAgICAgICB2YWwgPSBhdHRyc1thdHRyXTtcbiAgICAgICAgaWYgKCFfLmlzRXF1YWwoY3VycmVudFthdHRyXSwgdmFsKSkgY2hhbmdlcy5wdXNoKGF0dHIpO1xuICAgICAgICBpZiAoIV8uaXNFcXVhbChwcmV2W2F0dHJdLCB2YWwpKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkW2F0dHJdID0gdmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoYW5nZWRbYXR0cl07XG4gICAgICAgIH1cbiAgICAgICAgdW5zZXQgPyBkZWxldGUgY3VycmVudFthdHRyXSA6IGN1cnJlbnRbYXR0cl0gPSB2YWw7XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWdnZXIgYWxsIHJlbGV2YW50IGF0dHJpYnV0ZSBjaGFuZ2VzLlxuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoKSB0aGlzLl9wZW5kaW5nID0gb3B0aW9ucztcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGFuZ2VzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlOicgKyBjaGFuZ2VzW2ldLCB0aGlzLCBjdXJyZW50W2NoYW5nZXNbaV1dLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBZb3UgbWlnaHQgYmUgd29uZGVyaW5nIHdoeSB0aGVyZSdzIGEgYHdoaWxlYCBsb29wIGhlcmUuIENoYW5nZXMgY2FuXG4gICAgICAvLyBiZSByZWN1cnNpdmVseSBuZXN0ZWQgd2l0aGluIGBcImNoYW5nZVwiYCBldmVudHMuXG4gICAgICBpZiAoY2hhbmdpbmcpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuX3BlbmRpbmcpIHtcbiAgICAgICAgICBvcHRpb25zID0gdGhpcy5fcGVuZGluZztcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2UnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fcGVuZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fY2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhlIG1vZGVsLCBmaXJpbmcgYFwiY2hhbmdlXCJgLiBgdW5zZXRgIGlzIGEgbm9vcFxuICAgIC8vIGlmIHRoZSBhdHRyaWJ1dGUgZG9lc24ndCBleGlzdC5cbiAgICB1bnNldDogZnVuY3Rpb24oYXR0ciwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0KGF0dHIsIHZvaWQgMCwgXy5leHRlbmQoe30sIG9wdGlvbnMsIHt1bnNldDogdHJ1ZX0pKTtcbiAgICB9LFxuXG4gICAgLy8gQ2xlYXIgYWxsIGF0dHJpYnV0ZXMgb24gdGhlIG1vZGVsLCBmaXJpbmcgYFwiY2hhbmdlXCJgLlxuICAgIGNsZWFyOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgYXR0cnMgPSB7fTtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmF0dHJpYnV0ZXMpIGF0dHJzW2tleV0gPSB2b2lkIDA7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoYXR0cnMsIF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB7dW5zZXQ6IHRydWV9KSk7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiB0aGUgbW9kZWwgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYFwiY2hhbmdlXCJgIGV2ZW50LlxuICAgIC8vIElmIHlvdSBzcGVjaWZ5IGFuIGF0dHJpYnV0ZSBuYW1lLCBkZXRlcm1pbmUgaWYgdGhhdCBhdHRyaWJ1dGUgaGFzIGNoYW5nZWQuXG4gICAgaGFzQ2hhbmdlZDogZnVuY3Rpb24oYXR0cikge1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkgcmV0dXJuICFfLmlzRW1wdHkodGhpcy5jaGFuZ2VkKTtcbiAgICAgIHJldHVybiBfLmhhcyh0aGlzLmNoYW5nZWQsIGF0dHIpO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBjaGFuZ2VkLCBvclxuICAgIC8vIGZhbHNlIGlmIHRoZXJlIGFyZSBubyBjaGFuZ2VkIGF0dHJpYnV0ZXMuIFVzZWZ1bCBmb3IgZGV0ZXJtaW5pbmcgd2hhdFxuICAgIC8vIHBhcnRzIG9mIGEgdmlldyBuZWVkIHRvIGJlIHVwZGF0ZWQgYW5kL29yIHdoYXQgYXR0cmlidXRlcyBuZWVkIHRvIGJlXG4gICAgLy8gcGVyc2lzdGVkIHRvIHRoZSBzZXJ2ZXIuIFVuc2V0IGF0dHJpYnV0ZXMgd2lsbCBiZSBzZXQgdG8gdW5kZWZpbmVkLlxuICAgIC8vIFlvdSBjYW4gYWxzbyBwYXNzIGFuIGF0dHJpYnV0ZXMgb2JqZWN0IHRvIGRpZmYgYWdhaW5zdCB0aGUgbW9kZWwsXG4gICAgLy8gZGV0ZXJtaW5pbmcgaWYgdGhlcmUgKndvdWxkIGJlKiBhIGNoYW5nZS5cbiAgICBjaGFuZ2VkQXR0cmlidXRlczogZnVuY3Rpb24oZGlmZikge1xuICAgICAgaWYgKCFkaWZmKSByZXR1cm4gdGhpcy5oYXNDaGFuZ2VkKCkgPyBfLmNsb25lKHRoaXMuY2hhbmdlZCkgOiBmYWxzZTtcbiAgICAgIHZhciB2YWwsIGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHZhciBvbGQgPSB0aGlzLl9jaGFuZ2luZyA/IHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcyA6IHRoaXMuYXR0cmlidXRlcztcbiAgICAgIGZvciAodmFyIGF0dHIgaW4gZGlmZikge1xuICAgICAgICBpZiAoXy5pc0VxdWFsKG9sZFthdHRyXSwgKHZhbCA9IGRpZmZbYXR0cl0pKSkgY29udGludWU7XG4gICAgICAgIChjaGFuZ2VkIHx8IChjaGFuZ2VkID0ge30pKVthdHRyXSA9IHZhbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHByZXZpb3VzIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSwgcmVjb3JkZWQgYXQgdGhlIHRpbWUgdGhlIGxhc3RcbiAgICAvLyBgXCJjaGFuZ2VcImAgZXZlbnQgd2FzIGZpcmVkLlxuICAgIHByZXZpb3VzOiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICBpZiAoYXR0ciA9PSBudWxsIHx8ICF0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlc1thdHRyXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFsbCBvZiB0aGUgYXR0cmlidXRlcyBvZiB0aGUgbW9kZWwgYXQgdGhlIHRpbWUgb2YgdGhlIHByZXZpb3VzXG4gICAgLy8gYFwiY2hhbmdlXCJgIGV2ZW50LlxuICAgIHByZXZpb3VzQXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5jbG9uZSh0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMpO1xuICAgIH0sXG5cbiAgICAvLyBGZXRjaCB0aGUgbW9kZWwgZnJvbSB0aGUgc2VydmVyLiBJZiB0aGUgc2VydmVyJ3MgcmVwcmVzZW50YXRpb24gb2YgdGhlXG4gICAgLy8gbW9kZWwgZGlmZmVycyBmcm9tIGl0cyBjdXJyZW50IGF0dHJpYnV0ZXMsIHRoZXkgd2lsbCBiZSBvdmVycmlkZGVuLFxuICAgIC8vIHRyaWdnZXJpbmcgYSBgXCJjaGFuZ2VcImAgZXZlbnQuXG4gICAgZmV0Y2g6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gXy5jbG9uZShvcHRpb25zKSA6IHt9O1xuICAgICAgaWYgKG9wdGlvbnMucGFyc2UgPT09IHZvaWQgMCkgb3B0aW9ucy5wYXJzZSA9IHRydWU7XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG4gICAgICBvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGlmICghbW9kZWwuc2V0KG1vZGVsLnBhcnNlKHJlc3AsIG9wdGlvbnMpLCBvcHRpb25zKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcyhtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICAgIG1vZGVsLnRyaWdnZXIoJ3N5bmMnLCBtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgd3JhcEVycm9yKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHRoaXMuc3luYygncmVhZCcsIHRoaXMsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgYSBoYXNoIG9mIG1vZGVsIGF0dHJpYnV0ZXMsIGFuZCBzeW5jIHRoZSBtb2RlbCB0byB0aGUgc2VydmVyLlxuICAgIC8vIElmIHRoZSBzZXJ2ZXIgcmV0dXJucyBhbiBhdHRyaWJ1dGVzIGhhc2ggdGhhdCBkaWZmZXJzLCB0aGUgbW9kZWwnc1xuICAgIC8vIHN0YXRlIHdpbGwgYmUgYHNldGAgYWdhaW4uXG4gICAgc2F2ZTogZnVuY3Rpb24oa2V5LCB2YWwsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBhdHRycywgbWV0aG9kLCB4aHIsIGF0dHJpYnV0ZXMgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cbiAgICAgIC8vIEhhbmRsZSBib3RoIGBcImtleVwiLCB2YWx1ZWAgYW5kIGB7a2V5OiB2YWx1ZX1gIC1zdHlsZSBhcmd1bWVudHMuXG4gICAgICBpZiAoa2V5ID09IG51bGwgfHwgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYXR0cnMgPSBrZXk7XG4gICAgICAgIG9wdGlvbnMgPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoYXR0cnMgPSB7fSlba2V5XSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt2YWxpZGF0ZTogdHJ1ZX0sIG9wdGlvbnMpO1xuXG4gICAgICAvLyBJZiB3ZSdyZSBub3Qgd2FpdGluZyBhbmQgYXR0cmlidXRlcyBleGlzdCwgc2F2ZSBhY3RzIGFzXG4gICAgICAvLyBgc2V0KGF0dHIpLnNhdmUobnVsbCwgb3B0cylgIHdpdGggdmFsaWRhdGlvbi4gT3RoZXJ3aXNlLCBjaGVjayBpZlxuICAgICAgLy8gdGhlIG1vZGVsIHdpbGwgYmUgdmFsaWQgd2hlbiB0aGUgYXR0cmlidXRlcywgaWYgYW55LCBhcmUgc2V0LlxuICAgICAgaWYgKGF0dHJzICYmICFvcHRpb25zLndhaXQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNldChhdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5fdmFsaWRhdGUoYXR0cnMsIG9wdGlvbnMpKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0ZW1wb3JhcnkgYXR0cmlidXRlcyBpZiBge3dhaXQ6IHRydWV9YC5cbiAgICAgIGlmIChhdHRycyAmJiBvcHRpb25zLndhaXQpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0gXy5leHRlbmQoe30sIGF0dHJpYnV0ZXMsIGF0dHJzKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWZ0ZXIgYSBzdWNjZXNzZnVsIHNlcnZlci1zaWRlIHNhdmUsIHRoZSBjbGllbnQgaXMgKG9wdGlvbmFsbHkpXG4gICAgICAvLyB1cGRhdGVkIHdpdGggdGhlIHNlcnZlci1zaWRlIHN0YXRlLlxuICAgICAgaWYgKG9wdGlvbnMucGFyc2UgPT09IHZvaWQgMCkgb3B0aW9ucy5wYXJzZSA9IHRydWU7XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG4gICAgICBvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIC8vIEVuc3VyZSBhdHRyaWJ1dGVzIGFyZSByZXN0b3JlZCBkdXJpbmcgc3luY2hyb25vdXMgc2F2ZXMuXG4gICAgICAgIG1vZGVsLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICB2YXIgc2VydmVyQXR0cnMgPSBtb2RlbC5wYXJzZShyZXNwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKG9wdGlvbnMud2FpdCkgc2VydmVyQXR0cnMgPSBfLmV4dGVuZChhdHRycyB8fCB7fSwgc2VydmVyQXR0cnMpO1xuICAgICAgICBpZiAoXy5pc09iamVjdChzZXJ2ZXJBdHRycykgJiYgIW1vZGVsLnNldChzZXJ2ZXJBdHRycywgb3B0aW9ucykpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHN1Y2Nlc3MobW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBtb2RlbC50cmlnZ2VyKCdzeW5jJywgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgfTtcbiAgICAgIHdyYXBFcnJvcih0aGlzLCBvcHRpb25zKTtcblxuICAgICAgbWV0aG9kID0gdGhpcy5pc05ldygpID8gJ2NyZWF0ZScgOiAob3B0aW9ucy5wYXRjaCA/ICdwYXRjaCcgOiAndXBkYXRlJyk7XG4gICAgICBpZiAobWV0aG9kID09PSAncGF0Y2gnKSBvcHRpb25zLmF0dHJzID0gYXR0cnM7XG4gICAgICB4aHIgPSB0aGlzLnN5bmMobWV0aG9kLCB0aGlzLCBvcHRpb25zKTtcblxuICAgICAgLy8gUmVzdG9yZSBhdHRyaWJ1dGVzLlxuICAgICAgaWYgKGF0dHJzICYmIG9wdGlvbnMud2FpdCkgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblxuICAgICAgcmV0dXJuIHhocjtcbiAgICB9LFxuXG4gICAgLy8gRGVzdHJveSB0aGlzIG1vZGVsIG9uIHRoZSBzZXJ2ZXIgaWYgaXQgd2FzIGFscmVhZHkgcGVyc2lzdGVkLlxuICAgIC8vIE9wdGltaXN0aWNhbGx5IHJlbW92ZXMgdGhlIG1vZGVsIGZyb20gaXRzIGNvbGxlY3Rpb24sIGlmIGl0IGhhcyBvbmUuXG4gICAgLy8gSWYgYHdhaXQ6IHRydWVgIGlzIHBhc3NlZCwgd2FpdHMgZm9yIHRoZSBzZXJ2ZXIgdG8gcmVzcG9uZCBiZWZvcmUgcmVtb3ZhbC5cbiAgICBkZXN0cm95OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IF8uY2xvbmUob3B0aW9ucykgOiB7fTtcbiAgICAgIHZhciBtb2RlbCA9IHRoaXM7XG4gICAgICB2YXIgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2VzcztcblxuICAgICAgdmFyIGRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbW9kZWwudHJpZ2dlcignZGVzdHJveScsIG1vZGVsLCBtb2RlbC5jb2xsZWN0aW9uLCBvcHRpb25zKTtcbiAgICAgIH07XG5cbiAgICAgIG9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMud2FpdCB8fCBtb2RlbC5pc05ldygpKSBkZXN0cm95KCk7XG4gICAgICAgIGlmIChzdWNjZXNzKSBzdWNjZXNzKG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKCFtb2RlbC5pc05ldygpKSBtb2RlbC50cmlnZ2VyKCdzeW5jJywgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuaXNOZXcoKSkge1xuICAgICAgICBvcHRpb25zLnN1Y2Nlc3MoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgd3JhcEVycm9yKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICB2YXIgeGhyID0gdGhpcy5zeW5jKCdkZWxldGUnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgIGlmICghb3B0aW9ucy53YWl0KSBkZXN0cm95KCk7XG4gICAgICByZXR1cm4geGhyO1xuICAgIH0sXG5cbiAgICAvLyBEZWZhdWx0IFVSTCBmb3IgdGhlIG1vZGVsJ3MgcmVwcmVzZW50YXRpb24gb24gdGhlIHNlcnZlciAtLSBpZiB5b3UncmVcbiAgICAvLyB1c2luZyBCYWNrYm9uZSdzIHJlc3RmdWwgbWV0aG9kcywgb3ZlcnJpZGUgdGhpcyB0byBjaGFuZ2UgdGhlIGVuZHBvaW50XG4gICAgLy8gdGhhdCB3aWxsIGJlIGNhbGxlZC5cbiAgICB1cmw6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJhc2UgPVxuICAgICAgICBfLnJlc3VsdCh0aGlzLCAndXJsUm9vdCcpIHx8XG4gICAgICAgIF8ucmVzdWx0KHRoaXMuY29sbGVjdGlvbiwgJ3VybCcpIHx8XG4gICAgICAgIHVybEVycm9yKCk7XG4gICAgICBpZiAodGhpcy5pc05ldygpKSByZXR1cm4gYmFzZTtcbiAgICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyhbXlxcL10pJC8sICckMS8nKSArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLmlkKTtcbiAgICB9LFxuXG4gICAgLy8gKipwYXJzZSoqIGNvbnZlcnRzIGEgcmVzcG9uc2UgaW50byB0aGUgaGFzaCBvZiBhdHRyaWJ1dGVzIHRvIGJlIGBzZXRgIG9uXG4gICAgLy8gdGhlIG1vZGVsLiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpcyBqdXN0IHRvIHBhc3MgdGhlIHJlc3BvbnNlIGFsb25nLlxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gcmVzcDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IG1vZGVsIHdpdGggaWRlbnRpY2FsIGF0dHJpYnV0ZXMgdG8gdGhpcyBvbmUuXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgfSxcblxuICAgIC8vIEEgbW9kZWwgaXMgbmV3IGlmIGl0IGhhcyBuZXZlciBiZWVuIHNhdmVkIHRvIHRoZSBzZXJ2ZXIsIGFuZCBsYWNrcyBhbiBpZC5cbiAgICBpc05ldzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXRoaXMuaGFzKHRoaXMuaWRBdHRyaWJ1dGUpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiB0aGUgbW9kZWwgaXMgY3VycmVudGx5IGluIGEgdmFsaWQgc3RhdGUuXG4gICAgaXNWYWxpZDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlKHt9LCBfLmV4dGVuZChvcHRpb25zIHx8IHt9LCB7IHZhbGlkYXRlOiB0cnVlIH0pKTtcbiAgICB9LFxuXG4gICAgLy8gUnVuIHZhbGlkYXRpb24gYWdhaW5zdCB0aGUgbmV4dCBjb21wbGV0ZSBzZXQgb2YgbW9kZWwgYXR0cmlidXRlcyxcbiAgICAvLyByZXR1cm5pbmcgYHRydWVgIGlmIGFsbCBpcyB3ZWxsLiBPdGhlcndpc2UsIGZpcmUgYW4gYFwiaW52YWxpZFwiYCBldmVudC5cbiAgICBfdmFsaWRhdGU6IGZ1bmN0aW9uKGF0dHJzLCBvcHRpb25zKSB7XG4gICAgICBpZiAoIW9wdGlvbnMudmFsaWRhdGUgfHwgIXRoaXMudmFsaWRhdGUpIHJldHVybiB0cnVlO1xuICAgICAgYXR0cnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5hdHRyaWJ1dGVzLCBhdHRycyk7XG4gICAgICB2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRpb25FcnJvciA9IHRoaXMudmFsaWRhdGUoYXR0cnMsIG9wdGlvbnMpIHx8IG51bGw7XG4gICAgICBpZiAoIWVycm9yKSByZXR1cm4gdHJ1ZTtcbiAgICAgIHRoaXMudHJpZ2dlcignaW52YWxpZCcsIHRoaXMsIGVycm9yLCBfLmV4dGVuZChvcHRpb25zLCB7dmFsaWRhdGlvbkVycm9yOiBlcnJvcn0pKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gVW5kZXJzY29yZSBtZXRob2RzIHRoYXQgd2Ugd2FudCB0byBpbXBsZW1lbnQgb24gdGhlIE1vZGVsLlxuICB2YXIgbW9kZWxNZXRob2RzID0gWydrZXlzJywgJ3ZhbHVlcycsICdwYWlycycsICdpbnZlcnQnLCAncGljaycsICdvbWl0J107XG5cbiAgLy8gTWl4IGluIGVhY2ggVW5kZXJzY29yZSBtZXRob2QgYXMgYSBwcm94eSB0byBgTW9kZWwjYXR0cmlidXRlc2AuXG4gIF8uZWFjaChtb2RlbE1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIE1vZGVsLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGFyZ3MudW5zaGlmdCh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgcmV0dXJuIF9bbWV0aG9kXS5hcHBseShfLCBhcmdzKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBCYWNrYm9uZS5Db2xsZWN0aW9uXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBJZiBtb2RlbHMgdGVuZCB0byByZXByZXNlbnQgYSBzaW5nbGUgcm93IG9mIGRhdGEsIGEgQmFja2JvbmUgQ29sbGVjdGlvbiBpc1xuICAvLyBtb3JlIGFuYWxhZ291cyB0byBhIHRhYmxlIGZ1bGwgb2YgZGF0YSAuLi4gb3IgYSBzbWFsbCBzbGljZSBvciBwYWdlIG9mIHRoYXRcbiAgLy8gdGFibGUsIG9yIGEgY29sbGVjdGlvbiBvZiByb3dzIHRoYXQgYmVsb25nIHRvZ2V0aGVyIGZvciBhIHBhcnRpY3VsYXIgcmVhc29uXG4gIC8vIC0tIGFsbCBvZiB0aGUgbWVzc2FnZXMgaW4gdGhpcyBwYXJ0aWN1bGFyIGZvbGRlciwgYWxsIG9mIHRoZSBkb2N1bWVudHNcbiAgLy8gYmVsb25naW5nIHRvIHRoaXMgcGFydGljdWxhciBhdXRob3IsIGFuZCBzbyBvbi4gQ29sbGVjdGlvbnMgbWFpbnRhaW5cbiAgLy8gaW5kZXhlcyBvZiB0aGVpciBtb2RlbHMsIGJvdGggaW4gb3JkZXIsIGFuZCBmb3IgbG9va3VwIGJ5IGBpZGAuXG5cbiAgLy8gQ3JlYXRlIGEgbmV3ICoqQ29sbGVjdGlvbioqLCBwZXJoYXBzIHRvIGNvbnRhaW4gYSBzcGVjaWZpYyB0eXBlIG9mIGBtb2RlbGAuXG4gIC8vIElmIGEgYGNvbXBhcmF0b3JgIGlzIHNwZWNpZmllZCwgdGhlIENvbGxlY3Rpb24gd2lsbCBtYWludGFpblxuICAvLyBpdHMgbW9kZWxzIGluIHNvcnQgb3JkZXIsIGFzIHRoZXkncmUgYWRkZWQgYW5kIHJlbW92ZWQuXG4gIHZhciBDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgaWYgKG9wdGlvbnMubW9kZWwpIHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuICAgIGlmIChvcHRpb25zLmNvbXBhcmF0b3IgIT09IHZvaWQgMCkgdGhpcy5jb21wYXJhdG9yID0gb3B0aW9ucy5jb21wYXJhdG9yO1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKG1vZGVscykgdGhpcy5yZXNldChtb2RlbHMsIF8uZXh0ZW5kKHtzaWxlbnQ6IHRydWV9LCBvcHRpb25zKSk7XG4gIH07XG5cbiAgLy8gRGVmYXVsdCBvcHRpb25zIGZvciBgQ29sbGVjdGlvbiNzZXRgLlxuICB2YXIgc2V0T3B0aW9ucyA9IHthZGQ6IHRydWUsIHJlbW92ZTogdHJ1ZSwgbWVyZ2U6IHRydWV9O1xuICB2YXIgYWRkT3B0aW9ucyA9IHthZGQ6IHRydWUsIHJlbW92ZTogZmFsc2V9O1xuXG4gIC8vIERlZmluZSB0aGUgQ29sbGVjdGlvbidzIGluaGVyaXRhYmxlIG1ldGhvZHMuXG4gIF8uZXh0ZW5kKENvbGxlY3Rpb24ucHJvdG90eXBlLCBFdmVudHMsIHtcblxuICAgIC8vIFRoZSBkZWZhdWx0IG1vZGVsIGZvciBhIGNvbGxlY3Rpb24gaXMganVzdCBhICoqQmFja2JvbmUuTW9kZWwqKi5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBvdmVycmlkZGVuIGluIG1vc3QgY2FzZXMuXG4gICAgbW9kZWw6IE1vZGVsLFxuXG4gICAgLy8gSW5pdGlhbGl6ZSBpcyBhbiBlbXB0eSBmdW5jdGlvbiBieSBkZWZhdWx0LiBPdmVycmlkZSBpdCB3aXRoIHlvdXIgb3duXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gICAgLy8gVGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgYSBDb2xsZWN0aW9uIGlzIGFuIGFycmF5IG9mIHRoZVxuICAgIC8vIG1vZGVscycgYXR0cmlidXRlcy5cbiAgICB0b0pTT046IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbihtb2RlbCl7IHJldHVybiBtb2RlbC50b0pTT04ob3B0aW9ucyk7IH0pO1xuICAgIH0sXG5cbiAgICAvLyBQcm94eSBgQmFja2JvbmUuc3luY2AgYnkgZGVmYXVsdC5cbiAgICBzeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBCYWNrYm9uZS5zeW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIG1vZGVsLCBvciBsaXN0IG9mIG1vZGVscyB0byB0aGUgc2V0LlxuICAgIGFkZDogZnVuY3Rpb24obW9kZWxzLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXQobW9kZWxzLCBfLmV4dGVuZCh7bWVyZ2U6IGZhbHNlfSwgb3B0aW9ucywgYWRkT3B0aW9ucykpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYSBtb2RlbCwgb3IgYSBsaXN0IG9mIG1vZGVscyBmcm9tIHRoZSBzZXQuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihtb2RlbHMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzaW5ndWxhciA9ICFfLmlzQXJyYXkobW9kZWxzKTtcbiAgICAgIG1vZGVscyA9IHNpbmd1bGFyID8gW21vZGVsc10gOiBfLmNsb25lKG1vZGVscyk7XG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgICAgdmFyIGksIGwsIGluZGV4LCBtb2RlbDtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBtb2RlbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG1vZGVsID0gbW9kZWxzW2ldID0gdGhpcy5nZXQobW9kZWxzW2ldKTtcbiAgICAgICAgaWYgKCFtb2RlbCkgY29udGludWU7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9ieUlkW21vZGVsLmlkXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2J5SWRbbW9kZWwuY2lkXTtcbiAgICAgICAgaW5kZXggPSB0aGlzLmluZGV4T2YobW9kZWwpO1xuICAgICAgICB0aGlzLm1vZGVscy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLmxlbmd0aC0tO1xuICAgICAgICBpZiAoIW9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgb3B0aW9ucy5pbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1vZGVsLnRyaWdnZXIoJ3JlbW92ZScsIG1vZGVsLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW1vdmVSZWZlcmVuY2UobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNpbmd1bGFyID8gbW9kZWxzWzBdIDogbW9kZWxzO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgYSBjb2xsZWN0aW9uIGJ5IGBzZXRgLWluZyBhIG5ldyBsaXN0IG9mIG1vZGVscywgYWRkaW5nIG5ldyBvbmVzLFxuICAgIC8vIHJlbW92aW5nIG1vZGVscyB0aGF0IGFyZSBubyBsb25nZXIgcHJlc2VudCwgYW5kIG1lcmdpbmcgbW9kZWxzIHRoYXRcbiAgICAvLyBhbHJlYWR5IGV4aXN0IGluIHRoZSBjb2xsZWN0aW9uLCBhcyBuZWNlc3NhcnkuIFNpbWlsYXIgdG8gKipNb2RlbCNzZXQqKixcbiAgICAvLyB0aGUgY29yZSBvcGVyYXRpb24gZm9yIHVwZGF0aW5nIHRoZSBkYXRhIGNvbnRhaW5lZCBieSB0aGUgY29sbGVjdGlvbi5cbiAgICBzZXQ6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IF8uZGVmYXVsdHMoe30sIG9wdGlvbnMsIHNldE9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMucGFyc2UpIG1vZGVscyA9IHRoaXMucGFyc2UobW9kZWxzLCBvcHRpb25zKTtcbiAgICAgIHZhciBzaW5ndWxhciA9ICFfLmlzQXJyYXkobW9kZWxzKTtcbiAgICAgIG1vZGVscyA9IHNpbmd1bGFyID8gKG1vZGVscyA/IFttb2RlbHNdIDogW10pIDogXy5jbG9uZShtb2RlbHMpO1xuICAgICAgdmFyIGksIGwsIGlkLCBtb2RlbCwgYXR0cnMsIGV4aXN0aW5nLCBzb3J0O1xuICAgICAgdmFyIGF0ID0gb3B0aW9ucy5hdDtcbiAgICAgIHZhciB0YXJnZXRNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICB2YXIgc29ydGFibGUgPSB0aGlzLmNvbXBhcmF0b3IgJiYgKGF0ID09IG51bGwpICYmIG9wdGlvbnMuc29ydCAhPT0gZmFsc2U7XG4gICAgICB2YXIgc29ydEF0dHIgPSBfLmlzU3RyaW5nKHRoaXMuY29tcGFyYXRvcikgPyB0aGlzLmNvbXBhcmF0b3IgOiBudWxsO1xuICAgICAgdmFyIHRvQWRkID0gW10sIHRvUmVtb3ZlID0gW10sIG1vZGVsTWFwID0ge307XG4gICAgICB2YXIgYWRkID0gb3B0aW9ucy5hZGQsIG1lcmdlID0gb3B0aW9ucy5tZXJnZSwgcmVtb3ZlID0gb3B0aW9ucy5yZW1vdmU7XG4gICAgICB2YXIgb3JkZXIgPSAhc29ydGFibGUgJiYgYWRkICYmIHJlbW92ZSA/IFtdIDogZmFsc2U7XG5cbiAgICAgIC8vIFR1cm4gYmFyZSBvYmplY3RzIGludG8gbW9kZWwgcmVmZXJlbmNlcywgYW5kIHByZXZlbnQgaW52YWxpZCBtb2RlbHNcbiAgICAgIC8vIGZyb20gYmVpbmcgYWRkZWQuXG4gICAgICBmb3IgKGkgPSAwLCBsID0gbW9kZWxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBhdHRycyA9IG1vZGVsc1tpXSB8fCB7fTtcbiAgICAgICAgaWYgKGF0dHJzIGluc3RhbmNlb2YgTW9kZWwpIHtcbiAgICAgICAgICBpZCA9IG1vZGVsID0gYXR0cnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWQgPSBhdHRyc1t0YXJnZXRNb2RlbC5wcm90b3R5cGUuaWRBdHRyaWJ1dGUgfHwgJ2lkJ107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGR1cGxpY2F0ZSBpcyBmb3VuZCwgcHJldmVudCBpdCBmcm9tIGJlaW5nIGFkZGVkIGFuZFxuICAgICAgICAvLyBvcHRpb25hbGx5IG1lcmdlIGl0IGludG8gdGhlIGV4aXN0aW5nIG1vZGVsLlxuICAgICAgICBpZiAoZXhpc3RpbmcgPSB0aGlzLmdldChpZCkpIHtcbiAgICAgICAgICBpZiAocmVtb3ZlKSBtb2RlbE1hcFtleGlzdGluZy5jaWRdID0gdHJ1ZTtcbiAgICAgICAgICBpZiAobWVyZ2UpIHtcbiAgICAgICAgICAgIGF0dHJzID0gYXR0cnMgPT09IG1vZGVsID8gbW9kZWwuYXR0cmlidXRlcyA6IGF0dHJzO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGFyc2UpIGF0dHJzID0gZXhpc3RpbmcucGFyc2UoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgZXhpc3Rpbmcuc2V0KGF0dHJzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZSAmJiAhc29ydCAmJiBleGlzdGluZy5oYXNDaGFuZ2VkKHNvcnRBdHRyKSkgc29ydCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1vZGVsc1tpXSA9IGV4aXN0aW5nO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcsIHZhbGlkIG1vZGVsLCBwdXNoIGl0IHRvIHRoZSBgdG9BZGRgIGxpc3QuXG4gICAgICAgIH0gZWxzZSBpZiAoYWRkKSB7XG4gICAgICAgICAgbW9kZWwgPSBtb2RlbHNbaV0gPSB0aGlzLl9wcmVwYXJlTW9kZWwoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICAgIGlmICghbW9kZWwpIGNvbnRpbnVlO1xuICAgICAgICAgIHRvQWRkLnB1c2gobW9kZWwpO1xuICAgICAgICAgIHRoaXMuX2FkZFJlZmVyZW5jZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyBub3QgYWRkIG11bHRpcGxlIG1vZGVscyB3aXRoIHRoZSBzYW1lIGBpZGAuXG4gICAgICAgIG1vZGVsID0gZXhpc3RpbmcgfHwgbW9kZWw7XG4gICAgICAgIGlmIChvcmRlciAmJiAobW9kZWwuaXNOZXcoKSB8fCAhbW9kZWxNYXBbbW9kZWwuaWRdKSkgb3JkZXIucHVzaChtb2RlbCk7XG4gICAgICAgIG1vZGVsTWFwW21vZGVsLmlkXSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBub25leGlzdGVudCBtb2RlbHMgaWYgYXBwcm9wcmlhdGUuXG4gICAgICBpZiAocmVtb3ZlKSB7XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgIGlmICghbW9kZWxNYXBbKG1vZGVsID0gdGhpcy5tb2RlbHNbaV0pLmNpZF0pIHRvUmVtb3ZlLnB1c2gobW9kZWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b1JlbW92ZS5sZW5ndGgpIHRoaXMucmVtb3ZlKHRvUmVtb3ZlLCBvcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VlIGlmIHNvcnRpbmcgaXMgbmVlZGVkLCB1cGRhdGUgYGxlbmd0aGAgYW5kIHNwbGljZSBpbiBuZXcgbW9kZWxzLlxuICAgICAgaWYgKHRvQWRkLmxlbmd0aCB8fCAob3JkZXIgJiYgb3JkZXIubGVuZ3RoKSkge1xuICAgICAgICBpZiAoc29ydGFibGUpIHNvcnQgPSB0cnVlO1xuICAgICAgICB0aGlzLmxlbmd0aCArPSB0b0FkZC5sZW5ndGg7XG4gICAgICAgIGlmIChhdCAhPSBudWxsKSB7XG4gICAgICAgICAgZm9yIChpID0gMCwgbCA9IHRvQWRkLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGF0ICsgaSwgMCwgdG9BZGRbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAob3JkZXIpIHRoaXMubW9kZWxzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgdmFyIG9yZGVyZWRNb2RlbHMgPSBvcmRlciB8fCB0b0FkZDtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gb3JkZXJlZE1vZGVscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxzLnB1c2gob3JkZXJlZE1vZGVsc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbGVudGx5IHNvcnQgdGhlIGNvbGxlY3Rpb24gaWYgYXBwcm9wcmlhdGUuXG4gICAgICBpZiAoc29ydCkgdGhpcy5zb3J0KHtzaWxlbnQ6IHRydWV9KTtcblxuICAgICAgLy8gVW5sZXNzIHNpbGVuY2VkLCBpdCdzIHRpbWUgdG8gZmlyZSBhbGwgYXBwcm9wcmlhdGUgYWRkL3NvcnQgZXZlbnRzLlxuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICBmb3IgKGkgPSAwLCBsID0gdG9BZGQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgKG1vZGVsID0gdG9BZGRbaV0pLnRyaWdnZXIoJ2FkZCcsIG1vZGVsLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc29ydCB8fCAob3JkZXIgJiYgb3JkZXIubGVuZ3RoKSkgdGhpcy50cmlnZ2VyKCdzb3J0JywgdGhpcywgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiB0aGUgYWRkZWQgKG9yIG1lcmdlZCkgbW9kZWwgKG9yIG1vZGVscykuXG4gICAgICByZXR1cm4gc2luZ3VsYXIgPyBtb2RlbHNbMF0gOiBtb2RlbHM7XG4gICAgfSxcblxuICAgIC8vIFdoZW4geW91IGhhdmUgbW9yZSBpdGVtcyB0aGFuIHlvdSB3YW50IHRvIGFkZCBvciByZW1vdmUgaW5kaXZpZHVhbGx5LFxuICAgIC8vIHlvdSBjYW4gcmVzZXQgdGhlIGVudGlyZSBzZXQgd2l0aCBhIG5ldyBsaXN0IG9mIG1vZGVscywgd2l0aG91dCBmaXJpbmdcbiAgICAvLyBhbnkgZ3JhbnVsYXIgYGFkZGAgb3IgYHJlbW92ZWAgZXZlbnRzLiBGaXJlcyBgcmVzZXRgIHdoZW4gZmluaXNoZWQuXG4gICAgLy8gVXNlZnVsIGZvciBidWxrIG9wZXJhdGlvbnMgYW5kIG9wdGltaXphdGlvbnMuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5tb2RlbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZVJlZmVyZW5jZSh0aGlzLm1vZGVsc1tpXSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLnByZXZpb3VzTW9kZWxzID0gdGhpcy5tb2RlbHM7XG4gICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgbW9kZWxzID0gdGhpcy5hZGQobW9kZWxzLCBfLmV4dGVuZCh7c2lsZW50OiB0cnVlfSwgb3B0aW9ucykpO1xuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy50cmlnZ2VyKCdyZXNldCcsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIG1vZGVscztcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgbW9kZWwgdG8gdGhlIGVuZCBvZiB0aGUgY29sbGVjdGlvbi5cbiAgICBwdXNoOiBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkKG1vZGVsLCBfLmV4dGVuZCh7YXQ6IHRoaXMubGVuZ3RofSwgb3B0aW9ucykpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYSBtb2RlbCBmcm9tIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgcG9wOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzLmF0KHRoaXMubGVuZ3RoIC0gMSk7XG4gICAgICB0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gbW9kZWw7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIG1vZGVsIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgdW5zaGlmdDogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChtb2RlbCwgXy5leHRlbmQoe2F0OiAwfSwgb3B0aW9ucykpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYSBtb2RlbCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgc2hpZnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBtb2RlbCA9IHRoaXMuYXQoMCk7XG4gICAgICB0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gbW9kZWw7XG4gICAgfSxcblxuICAgIC8vIFNsaWNlIG91dCBhIHN1Yi1hcnJheSBvZiBtb2RlbHMgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICBzbGljZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2xpY2UuYXBwbHkodGhpcy5tb2RlbHMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIG1vZGVsIGZyb20gdGhlIHNldCBieSBpZC5cbiAgICBnZXQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgcmV0dXJuIHRoaXMuX2J5SWRbb2JqXSB8fCB0aGlzLl9ieUlkW29iai5pZF0gfHwgdGhpcy5fYnlJZFtvYmouY2lkXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBtb2RlbCBhdCB0aGUgZ2l2ZW4gaW5kZXguXG4gICAgYXQ6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbHNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gbW9kZWxzIHdpdGggbWF0Y2hpbmcgYXR0cmlidXRlcy4gVXNlZnVsIGZvciBzaW1wbGUgY2FzZXMgb2ZcbiAgICAvLyBgZmlsdGVyYC5cbiAgICB3aGVyZTogZnVuY3Rpb24oYXR0cnMsIGZpcnN0KSB7XG4gICAgICBpZiAoXy5pc0VtcHR5KGF0dHJzKSkgcmV0dXJuIGZpcnN0ID8gdm9pZCAwIDogW107XG4gICAgICByZXR1cm4gdGhpc1tmaXJzdCA/ICdmaW5kJyA6ICdmaWx0ZXInXShmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gbW9kZWwuZ2V0KGtleSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gdGhlIGZpcnN0IG1vZGVsIHdpdGggbWF0Y2hpbmcgYXR0cmlidXRlcy4gVXNlZnVsIGZvciBzaW1wbGUgY2FzZXNcbiAgICAvLyBvZiBgZmluZGAuXG4gICAgZmluZFdoZXJlOiBmdW5jdGlvbihhdHRycykge1xuICAgICAgcmV0dXJuIHRoaXMud2hlcmUoYXR0cnMsIHRydWUpO1xuICAgIH0sXG5cbiAgICAvLyBGb3JjZSB0aGUgY29sbGVjdGlvbiB0byByZS1zb3J0IGl0c2VsZi4gWW91IGRvbid0IG5lZWQgdG8gY2FsbCB0aGlzIHVuZGVyXG4gICAgLy8gbm9ybWFsIGNpcmN1bXN0YW5jZXMsIGFzIHRoZSBzZXQgd2lsbCBtYWludGFpbiBzb3J0IG9yZGVyIGFzIGVhY2ggaXRlbVxuICAgIC8vIGlzIGFkZGVkLlxuICAgIHNvcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmICghdGhpcy5jb21wYXJhdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzb3J0IGEgc2V0IHdpdGhvdXQgYSBjb21wYXJhdG9yJyk7XG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgICAvLyBSdW4gc29ydCBiYXNlZCBvbiB0eXBlIG9mIGBjb21wYXJhdG9yYC5cbiAgICAgIGlmIChfLmlzU3RyaW5nKHRoaXMuY29tcGFyYXRvcikgfHwgdGhpcy5jb21wYXJhdG9yLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB0aGlzLm1vZGVscyA9IHRoaXMuc29ydEJ5KHRoaXMuY29tcGFyYXRvciwgdGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vZGVscy5zb3J0KF8uYmluZCh0aGlzLmNvbXBhcmF0b3IsIHRoaXMpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy50cmlnZ2VyKCdzb3J0JywgdGhpcywgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gUGx1Y2sgYW4gYXR0cmlidXRlIGZyb20gZWFjaCBtb2RlbCBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICBwbHVjazogZnVuY3Rpb24oYXR0cikge1xuICAgICAgcmV0dXJuIF8uaW52b2tlKHRoaXMubW9kZWxzLCAnZ2V0JywgYXR0cik7XG4gICAgfSxcblxuICAgIC8vIEZldGNoIHRoZSBkZWZhdWx0IHNldCBvZiBtb2RlbHMgZm9yIHRoaXMgY29sbGVjdGlvbiwgcmVzZXR0aW5nIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24gd2hlbiB0aGV5IGFycml2ZS4gSWYgYHJlc2V0OiB0cnVlYCBpcyBwYXNzZWQsIHRoZSByZXNwb25zZVxuICAgIC8vIGRhdGEgd2lsbCBiZSBwYXNzZWQgdGhyb3VnaCB0aGUgYHJlc2V0YCBtZXRob2QgaW5zdGVhZCBvZiBgc2V0YC5cbiAgICBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG4gICAgICBpZiAob3B0aW9ucy5wYXJzZSA9PT0gdm9pZCAwKSBvcHRpb25zLnBhcnNlID0gdHJ1ZTtcbiAgICAgIHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuICAgICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzO1xuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICB2YXIgbWV0aG9kID0gb3B0aW9ucy5yZXNldCA/ICdyZXNldCcgOiAnc2V0JztcbiAgICAgICAgY29sbGVjdGlvblttZXRob2RdKHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcyhjb2xsZWN0aW9uLCByZXNwLCBvcHRpb25zKTtcbiAgICAgICAgY29sbGVjdGlvbi50cmlnZ2VyKCdzeW5jJywgY29sbGVjdGlvbiwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgd3JhcEVycm9yKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHRoaXMuc3luYygncmVhZCcsIHRoaXMsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBtb2RlbCBpbiB0aGlzIGNvbGxlY3Rpb24uIEFkZCB0aGUgbW9kZWwgdG8gdGhlXG4gICAgLy8gY29sbGVjdGlvbiBpbW1lZGlhdGVseSwgdW5sZXNzIGB3YWl0OiB0cnVlYCBpcyBwYXNzZWQsIGluIHdoaWNoIGNhc2Ugd2VcbiAgICAvLyB3YWl0IGZvciB0aGUgc2VydmVyIHRvIGFncmVlLlxuICAgIGNyZWF0ZTogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gXy5jbG9uZShvcHRpb25zKSA6IHt9O1xuICAgICAgaWYgKCEobW9kZWwgPSB0aGlzLl9wcmVwYXJlTW9kZWwobW9kZWwsIG9wdGlvbnMpKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFvcHRpb25zLndhaXQpIHRoaXMuYWRkKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gdGhpcztcbiAgICAgIHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24obW9kZWwsIHJlc3ApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMud2FpdCkgY29sbGVjdGlvbi5hZGQobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcyhtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgbW9kZWwuc2F2ZShudWxsLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBtb2RlbDtcbiAgICB9LFxuXG4gICAgLy8gKipwYXJzZSoqIGNvbnZlcnRzIGEgcmVzcG9uc2UgaW50byBhIGxpc3Qgb2YgbW9kZWxzIHRvIGJlIGFkZGVkIHRvIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24uIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIGp1c3QgdG8gcGFzcyBpdCB0aHJvdWdoLlxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gcmVzcDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IGNvbGxlY3Rpb24gd2l0aCBhbiBpZGVudGljYWwgbGlzdCBvZiBtb2RlbHMgYXMgdGhpcyBvbmUuXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMubW9kZWxzKTtcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2QgdG8gcmVzZXQgYWxsIGludGVybmFsIHN0YXRlLiBDYWxsZWQgd2hlbiB0aGUgY29sbGVjdGlvblxuICAgIC8vIGlzIGZpcnN0IGluaXRpYWxpemVkIG9yIHJlc2V0LlxuICAgIF9yZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgICAgdGhpcy5fYnlJZCAgPSB7fTtcbiAgICB9LFxuXG4gICAgLy8gUHJlcGFyZSBhIGhhc2ggb2YgYXR0cmlidXRlcyAob3Igb3RoZXIgbW9kZWwpIHRvIGJlIGFkZGVkIHRvIHRoaXNcbiAgICAvLyBjb2xsZWN0aW9uLlxuICAgIF9wcmVwYXJlTW9kZWw6IGZ1bmN0aW9uKGF0dHJzLCBvcHRpb25zKSB7XG4gICAgICBpZiAoYXR0cnMgaW5zdGFuY2VvZiBNb2RlbCkgcmV0dXJuIGF0dHJzO1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG4gICAgICBvcHRpb25zLmNvbGxlY3Rpb24gPSB0aGlzO1xuICAgICAgdmFyIG1vZGVsID0gbmV3IHRoaXMubW9kZWwoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgaWYgKCFtb2RlbC52YWxpZGF0aW9uRXJyb3IpIHJldHVybiBtb2RlbDtcbiAgICAgIHRoaXMudHJpZ2dlcignaW52YWxpZCcsIHRoaXMsIG1vZGVsLnZhbGlkYXRpb25FcnJvciwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG1ldGhvZCB0byBjcmVhdGUgYSBtb2RlbCdzIHRpZXMgdG8gYSBjb2xsZWN0aW9uLlxuICAgIF9hZGRSZWZlcmVuY2U6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLl9ieUlkW21vZGVsLmNpZF0gPSBtb2RlbDtcbiAgICAgIGlmIChtb2RlbC5pZCAhPSBudWxsKSB0aGlzLl9ieUlkW21vZGVsLmlkXSA9IG1vZGVsO1xuICAgICAgaWYgKCFtb2RlbC5jb2xsZWN0aW9uKSBtb2RlbC5jb2xsZWN0aW9uID0gdGhpcztcbiAgICAgIG1vZGVsLm9uKCdhbGwnLCB0aGlzLl9vbk1vZGVsRXZlbnQsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBJbnRlcm5hbCBtZXRob2QgdG8gc2V2ZXIgYSBtb2RlbCdzIHRpZXMgdG8gYSBjb2xsZWN0aW9uLlxuICAgIF9yZW1vdmVSZWZlcmVuY2U6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICBpZiAodGhpcyA9PT0gbW9kZWwuY29sbGVjdGlvbikgZGVsZXRlIG1vZGVsLmNvbGxlY3Rpb247XG4gICAgICBtb2RlbC5vZmYoJ2FsbCcsIHRoaXMuX29uTW9kZWxFdmVudCwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG1ldGhvZCBjYWxsZWQgZXZlcnkgdGltZSBhIG1vZGVsIGluIHRoZSBzZXQgZmlyZXMgYW4gZXZlbnQuXG4gICAgLy8gU2V0cyBuZWVkIHRvIHVwZGF0ZSB0aGVpciBpbmRleGVzIHdoZW4gbW9kZWxzIGNoYW5nZSBpZHMuIEFsbCBvdGhlclxuICAgIC8vIGV2ZW50cyBzaW1wbHkgcHJveHkgdGhyb3VnaC4gXCJhZGRcIiBhbmQgXCJyZW1vdmVcIiBldmVudHMgdGhhdCBvcmlnaW5hdGVcbiAgICAvLyBpbiBvdGhlciBjb2xsZWN0aW9ucyBhcmUgaWdub3JlZC5cbiAgICBfb25Nb2RlbEV2ZW50OiBmdW5jdGlvbihldmVudCwgbW9kZWwsIGNvbGxlY3Rpb24sIG9wdGlvbnMpIHtcbiAgICAgIGlmICgoZXZlbnQgPT09ICdhZGQnIHx8IGV2ZW50ID09PSAncmVtb3ZlJykgJiYgY29sbGVjdGlvbiAhPT0gdGhpcykgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50ID09PSAnZGVzdHJveScpIHRoaXMucmVtb3ZlKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgIGlmIChtb2RlbCAmJiBldmVudCA9PT0gJ2NoYW5nZTonICsgbW9kZWwuaWRBdHRyaWJ1dGUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2J5SWRbbW9kZWwucHJldmlvdXMobW9kZWwuaWRBdHRyaWJ1dGUpXTtcbiAgICAgICAgaWYgKG1vZGVsLmlkICE9IG51bGwpIHRoaXMuX2J5SWRbbW9kZWwuaWRdID0gbW9kZWw7XG4gICAgICB9XG4gICAgICB0aGlzLnRyaWdnZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gVW5kZXJzY29yZSBtZXRob2RzIHRoYXQgd2Ugd2FudCB0byBpbXBsZW1lbnQgb24gdGhlIENvbGxlY3Rpb24uXG4gIC8vIDkwJSBvZiB0aGUgY29yZSB1c2VmdWxuZXNzIG9mIEJhY2tib25lIENvbGxlY3Rpb25zIGlzIGFjdHVhbGx5IGltcGxlbWVudGVkXG4gIC8vIHJpZ2h0IGhlcmU6XG4gIHZhciBtZXRob2RzID0gWydmb3JFYWNoJywgJ2VhY2gnLCAnbWFwJywgJ2NvbGxlY3QnLCAncmVkdWNlJywgJ2ZvbGRsJyxcbiAgICAnaW5qZWN0JywgJ3JlZHVjZVJpZ2h0JywgJ2ZvbGRyJywgJ2ZpbmQnLCAnZGV0ZWN0JywgJ2ZpbHRlcicsICdzZWxlY3QnLFxuICAgICdyZWplY3QnLCAnZXZlcnknLCAnYWxsJywgJ3NvbWUnLCAnYW55JywgJ2luY2x1ZGUnLCAnY29udGFpbnMnLCAnaW52b2tlJyxcbiAgICAnbWF4JywgJ21pbicsICd0b0FycmF5JywgJ3NpemUnLCAnZmlyc3QnLCAnaGVhZCcsICd0YWtlJywgJ2luaXRpYWwnLCAncmVzdCcsXG4gICAgJ3RhaWwnLCAnZHJvcCcsICdsYXN0JywgJ3dpdGhvdXQnLCAnZGlmZmVyZW5jZScsICdpbmRleE9mJywgJ3NodWZmbGUnLFxuICAgICdsYXN0SW5kZXhPZicsICdpc0VtcHR5JywgJ2NoYWluJywgJ3NhbXBsZSddO1xuXG4gIC8vIE1peCBpbiBlYWNoIFVuZGVyc2NvcmUgbWV0aG9kIGFzIGEgcHJveHkgdG8gYENvbGxlY3Rpb24jbW9kZWxzYC5cbiAgXy5lYWNoKG1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIENvbGxlY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgYXJncy51bnNoaWZ0KHRoaXMubW9kZWxzKTtcbiAgICAgIHJldHVybiBfW21ldGhvZF0uYXBwbHkoXywgYXJncyk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gVW5kZXJzY29yZSBtZXRob2RzIHRoYXQgdGFrZSBhIHByb3BlcnR5IG5hbWUgYXMgYW4gYXJndW1lbnQuXG4gIHZhciBhdHRyaWJ1dGVNZXRob2RzID0gWydncm91cEJ5JywgJ2NvdW50QnknLCAnc29ydEJ5JywgJ2luZGV4QnknXTtcblxuICAvLyBVc2UgYXR0cmlidXRlcyBpbnN0ZWFkIG9mIHByb3BlcnRpZXMuXG4gIF8uZWFjaChhdHRyaWJ1dGVNZXRob2RzLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBDb2xsZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZSA6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQodmFsdWUpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBfW21ldGhvZF0odGhpcy5tb2RlbHMsIGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBCYWNrYm9uZS5WaWV3XG4gIC8vIC0tLS0tLS0tLS0tLS1cblxuICAvLyBCYWNrYm9uZSBWaWV3cyBhcmUgYWxtb3N0IG1vcmUgY29udmVudGlvbiB0aGFuIHRoZXkgYXJlIGFjdHVhbCBjb2RlLiBBIFZpZXdcbiAgLy8gaXMgc2ltcGx5IGEgSmF2YVNjcmlwdCBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgbG9naWNhbCBjaHVuayBvZiBVSSBpbiB0aGVcbiAgLy8gRE9NLiBUaGlzIG1pZ2h0IGJlIGEgc2luZ2xlIGl0ZW0sIGFuIGVudGlyZSBsaXN0LCBhIHNpZGViYXIgb3IgcGFuZWwsIG9yXG4gIC8vIGV2ZW4gdGhlIHN1cnJvdW5kaW5nIGZyYW1lIHdoaWNoIHdyYXBzIHlvdXIgd2hvbGUgYXBwLiBEZWZpbmluZyBhIGNodW5rIG9mXG4gIC8vIFVJIGFzIGEgKipWaWV3KiogYWxsb3dzIHlvdSB0byBkZWZpbmUgeW91ciBET00gZXZlbnRzIGRlY2xhcmF0aXZlbHksIHdpdGhvdXRcbiAgLy8gaGF2aW5nIHRvIHdvcnJ5IGFib3V0IHJlbmRlciBvcmRlciAuLi4gYW5kIG1ha2VzIGl0IGVhc3kgZm9yIHRoZSB2aWV3IHRvXG4gIC8vIHJlYWN0IHRvIHNwZWNpZmljIGNoYW5nZXMgaW4gdGhlIHN0YXRlIG9mIHlvdXIgbW9kZWxzLlxuXG4gIC8vIENyZWF0aW5nIGEgQmFja2JvbmUuVmlldyBjcmVhdGVzIGl0cyBpbml0aWFsIGVsZW1lbnQgb3V0c2lkZSBvZiB0aGUgRE9NLFxuICAvLyBpZiBhbiBleGlzdGluZyBlbGVtZW50IGlzIG5vdCBwcm92aWRlZC4uLlxuICB2YXIgVmlldyA9IEJhY2tib25lLlZpZXcgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCd2aWV3Jyk7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICBfLmV4dGVuZCh0aGlzLCBfLnBpY2sob3B0aW9ucywgdmlld09wdGlvbnMpKTtcbiAgICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xuICB9O1xuXG4gIC8vIENhY2hlZCByZWdleCB0byBzcGxpdCBrZXlzIGZvciBgZGVsZWdhdGVgLlxuICB2YXIgZGVsZWdhdGVFdmVudFNwbGl0dGVyID0gL14oXFxTKylcXHMqKC4qKSQvO1xuXG4gIC8vIExpc3Qgb2YgdmlldyBvcHRpb25zIHRvIGJlIG1lcmdlZCBhcyBwcm9wZXJ0aWVzLlxuICB2YXIgdmlld09wdGlvbnMgPSBbJ21vZGVsJywgJ2NvbGxlY3Rpb24nLCAnZWwnLCAnaWQnLCAnYXR0cmlidXRlcycsICdjbGFzc05hbWUnLCAndGFnTmFtZScsICdldmVudHMnXTtcblxuICAvLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuVmlldyoqIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuXG4gIF8uZXh0ZW5kKFZpZXcucHJvdG90eXBlLCBFdmVudHMsIHtcblxuICAgIC8vIFRoZSBkZWZhdWx0IGB0YWdOYW1lYCBvZiBhIFZpZXcncyBlbGVtZW50IGlzIGBcImRpdlwiYC5cbiAgICB0YWdOYW1lOiAnZGl2JyxcblxuICAgIC8vIGpRdWVyeSBkZWxlZ2F0ZSBmb3IgZWxlbWVudCBsb29rdXAsIHNjb3BlZCB0byBET00gZWxlbWVudHMgd2l0aGluIHRoZVxuICAgIC8vIGN1cnJlbnQgdmlldy4gVGhpcyBzaG91bGQgYmUgcHJlZmVycmVkIHRvIGdsb2JhbCBsb29rdXBzIHdoZXJlIHBvc3NpYmxlLlxuICAgICQ6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy4kZWwuZmluZChzZWxlY3Rvcik7XG4gICAgfSxcblxuICAgIC8vIEluaXRpYWxpemUgaXMgYW4gZW1wdHkgZnVuY3Rpb24gYnkgZGVmYXVsdC4gT3ZlcnJpZGUgaXQgd2l0aCB5b3VyIG93blxuICAgIC8vIGluaXRpYWxpemF0aW9uIGxvZ2ljLlxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblxuICAgIC8vICoqcmVuZGVyKiogaXMgdGhlIGNvcmUgZnVuY3Rpb24gdGhhdCB5b3VyIHZpZXcgc2hvdWxkIG92ZXJyaWRlLCBpbiBvcmRlclxuICAgIC8vIHRvIHBvcHVsYXRlIGl0cyBlbGVtZW50IChgdGhpcy5lbGApLCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBIVE1MLiBUaGVcbiAgICAvLyBjb252ZW50aW9uIGlzIGZvciAqKnJlbmRlcioqIHRvIGFsd2F5cyByZXR1cm4gYHRoaXNgLlxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHRoaXMgdmlldyBieSB0YWtpbmcgdGhlIGVsZW1lbnQgb3V0IG9mIHRoZSBET00sIGFuZCByZW1vdmluZyBhbnlcbiAgICAvLyBhcHBsaWNhYmxlIEJhY2tib25lLkV2ZW50cyBsaXN0ZW5lcnMuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQ2hhbmdlIHRoZSB2aWV3J3MgZWxlbWVudCAoYHRoaXMuZWxgIHByb3BlcnR5KSwgaW5jbHVkaW5nIGV2ZW50XG4gICAgLy8gcmUtZGVsZWdhdGlvbi5cbiAgICBzZXRFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBkZWxlZ2F0ZSkge1xuICAgICAgaWYgKHRoaXMuJGVsKSB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIHRoaXMuJGVsID0gZWxlbWVudCBpbnN0YW5jZW9mIEJhY2tib25lLiQgPyBlbGVtZW50IDogQmFja2JvbmUuJChlbGVtZW50KTtcbiAgICAgIHRoaXMuZWwgPSB0aGlzLiRlbFswXTtcbiAgICAgIGlmIChkZWxlZ2F0ZSAhPT0gZmFsc2UpIHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgY2FsbGJhY2tzLCB3aGVyZSBgdGhpcy5ldmVudHNgIGlzIGEgaGFzaCBvZlxuICAgIC8vXG4gICAgLy8gKntcImV2ZW50IHNlbGVjdG9yXCI6IFwiY2FsbGJhY2tcIn0qXG4gICAgLy9cbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICdtb3VzZWRvd24gLnRpdGxlJzogICdlZGl0JyxcbiAgICAvLyAgICAgICAnY2xpY2sgLmJ1dHRvbic6ICAgICAnc2F2ZScsXG4gICAgLy8gICAgICAgJ2NsaWNrIC5vcGVuJzogICAgICAgZnVuY3Rpb24oZSkgeyAuLi4gfVxuICAgIC8vICAgICB9XG4gICAgLy9cbiAgICAvLyBwYWlycy4gQ2FsbGJhY2tzIHdpbGwgYmUgYm91bmQgdG8gdGhlIHZpZXcsIHdpdGggYHRoaXNgIHNldCBwcm9wZXJseS5cbiAgICAvLyBVc2VzIGV2ZW50IGRlbGVnYXRpb24gZm9yIGVmZmljaWVuY3kuXG4gICAgLy8gT21pdHRpbmcgdGhlIHNlbGVjdG9yIGJpbmRzIHRoZSBldmVudCB0byBgdGhpcy5lbGAuXG4gICAgLy8gVGhpcyBvbmx5IHdvcmtzIGZvciBkZWxlZ2F0ZS1hYmxlIGV2ZW50czogbm90IGBmb2N1c2AsIGBibHVyYCwgYW5kXG4gICAgLy8gbm90IGBjaGFuZ2VgLCBgc3VibWl0YCwgYW5kIGByZXNldGAgaW4gSW50ZXJuZXQgRXhwbG9yZXIuXG4gICAgZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICAgaWYgKCEoZXZlbnRzIHx8IChldmVudHMgPSBfLnJlc3VsdCh0aGlzLCAnZXZlbnRzJykpKSkgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBldmVudHMpIHtcbiAgICAgICAgdmFyIG1ldGhvZCA9IGV2ZW50c1trZXldO1xuICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihtZXRob2QpKSBtZXRob2QgPSB0aGlzW2V2ZW50c1trZXldXTtcbiAgICAgICAgaWYgKCFtZXRob2QpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBtYXRjaCA9IGtleS5tYXRjaChkZWxlZ2F0ZUV2ZW50U3BsaXR0ZXIpO1xuICAgICAgICB2YXIgZXZlbnROYW1lID0gbWF0Y2hbMV0sIHNlbGVjdG9yID0gbWF0Y2hbMl07XG4gICAgICAgIG1ldGhvZCA9IF8uYmluZChtZXRob2QsIHRoaXMpO1xuICAgICAgICBldmVudE5hbWUgKz0gJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZDtcbiAgICAgICAgaWYgKHNlbGVjdG9yID09PSAnJykge1xuICAgICAgICAgIHRoaXMuJGVsLm9uKGV2ZW50TmFtZSwgbWV0aG9kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLiRlbC5vbihldmVudE5hbWUsIHNlbGVjdG9yLCBtZXRob2QpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQ2xlYXJzIGFsbCBjYWxsYmFja3MgcHJldmlvdXNseSBib3VuZCB0byB0aGUgdmlldyB3aXRoIGBkZWxlZ2F0ZUV2ZW50c2AuXG4gICAgLy8gWW91IHVzdWFsbHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcywgYnV0IG1heSB3aXNoIHRvIGlmIHlvdSBoYXZlIG11bHRpcGxlXG4gICAgLy8gQmFja2JvbmUgdmlld3MgYXR0YWNoZWQgdG8gdGhlIHNhbWUgRE9NIGVsZW1lbnQuXG4gICAgdW5kZWxlZ2F0ZUV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRlbC5vZmYoJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRW5zdXJlIHRoYXQgdGhlIFZpZXcgaGFzIGEgRE9NIGVsZW1lbnQgdG8gcmVuZGVyIGludG8uXG4gICAgLy8gSWYgYHRoaXMuZWxgIGlzIGEgc3RyaW5nLCBwYXNzIGl0IHRocm91Z2ggYCQoKWAsIHRha2UgdGhlIGZpcnN0XG4gICAgLy8gbWF0Y2hpbmcgZWxlbWVudCwgYW5kIHJlLWFzc2lnbiBpdCB0byBgZWxgLiBPdGhlcndpc2UsIGNyZWF0ZVxuICAgIC8vIGFuIGVsZW1lbnQgZnJvbSB0aGUgYGlkYCwgYGNsYXNzTmFtZWAgYW5kIGB0YWdOYW1lYCBwcm9wZXJ0aWVzLlxuICAgIF9lbnN1cmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5lbCkge1xuICAgICAgICB2YXIgYXR0cnMgPSBfLmV4dGVuZCh7fSwgXy5yZXN1bHQodGhpcywgJ2F0dHJpYnV0ZXMnKSk7XG4gICAgICAgIGlmICh0aGlzLmlkKSBhdHRycy5pZCA9IF8ucmVzdWx0KHRoaXMsICdpZCcpO1xuICAgICAgICBpZiAodGhpcy5jbGFzc05hbWUpIGF0dHJzWydjbGFzcyddID0gXy5yZXN1bHQodGhpcywgJ2NsYXNzTmFtZScpO1xuICAgICAgICB2YXIgJGVsID0gQmFja2JvbmUuJCgnPCcgKyBfLnJlc3VsdCh0aGlzLCAndGFnTmFtZScpICsgJz4nKS5hdHRyKGF0dHJzKTtcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50KCRlbCwgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50KF8ucmVzdWx0KHRoaXMsICdlbCcpLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEJhY2tib25lLnN5bmNcbiAgLy8gLS0tLS0tLS0tLS0tLVxuXG4gIC8vIE92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBtYW5uZXIgaW4gd2hpY2ggQmFja2JvbmUgcGVyc2lzdHNcbiAgLy8gbW9kZWxzIHRvIHRoZSBzZXJ2ZXIuIFlvdSB3aWxsIGJlIHBhc3NlZCB0aGUgdHlwZSBvZiByZXF1ZXN0LCBhbmQgdGhlXG4gIC8vIG1vZGVsIGluIHF1ZXN0aW9uLiBCeSBkZWZhdWx0LCBtYWtlcyBhIFJFU1RmdWwgQWpheCByZXF1ZXN0XG4gIC8vIHRvIHRoZSBtb2RlbCdzIGB1cmwoKWAuIFNvbWUgcG9zc2libGUgY3VzdG9taXphdGlvbnMgY291bGQgYmU6XG4gIC8vXG4gIC8vICogVXNlIGBzZXRUaW1lb3V0YCB0byBiYXRjaCByYXBpZC1maXJlIHVwZGF0ZXMgaW50byBhIHNpbmdsZSByZXF1ZXN0LlxuICAvLyAqIFNlbmQgdXAgdGhlIG1vZGVscyBhcyBYTUwgaW5zdGVhZCBvZiBKU09OLlxuICAvLyAqIFBlcnNpc3QgbW9kZWxzIHZpYSBXZWJTb2NrZXRzIGluc3RlYWQgb2YgQWpheC5cbiAgLy9cbiAgLy8gVHVybiBvbiBgQmFja2JvbmUuZW11bGF0ZUhUVFBgIGluIG9yZGVyIHRvIHNlbmQgYFBVVGAgYW5kIGBERUxFVEVgIHJlcXVlc3RzXG4gIC8vIGFzIGBQT1NUYCwgd2l0aCBhIGBfbWV0aG9kYCBwYXJhbWV0ZXIgY29udGFpbmluZyB0aGUgdHJ1ZSBIVFRQIG1ldGhvZCxcbiAgLy8gYXMgd2VsbCBhcyBhbGwgcmVxdWVzdHMgd2l0aCB0aGUgYm9keSBhcyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYFxuICAvLyBpbnN0ZWFkIG9mIGBhcHBsaWNhdGlvbi9qc29uYCB3aXRoIHRoZSBtb2RlbCBpbiBhIHBhcmFtIG5hbWVkIGBtb2RlbGAuXG4gIC8vIFVzZWZ1bCB3aGVuIGludGVyZmFjaW5nIHdpdGggc2VydmVyLXNpZGUgbGFuZ3VhZ2VzIGxpa2UgKipQSFAqKiB0aGF0IG1ha2VcbiAgLy8gaXQgZGlmZmljdWx0IHRvIHJlYWQgdGhlIGJvZHkgb2YgYFBVVGAgcmVxdWVzdHMuXG4gIEJhY2tib25lLnN5bmMgPSBmdW5jdGlvbihtZXRob2QsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgdmFyIHR5cGUgPSBtZXRob2RNYXBbbWV0aG9kXTtcblxuICAgIC8vIERlZmF1bHQgb3B0aW9ucywgdW5sZXNzIHNwZWNpZmllZC5cbiAgICBfLmRlZmF1bHRzKG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSksIHtcbiAgICAgIGVtdWxhdGVIVFRQOiBCYWNrYm9uZS5lbXVsYXRlSFRUUCxcbiAgICAgIGVtdWxhdGVKU09OOiBCYWNrYm9uZS5lbXVsYXRlSlNPTlxuICAgIH0pO1xuXG4gICAgLy8gRGVmYXVsdCBKU09OLXJlcXVlc3Qgb3B0aW9ucy5cbiAgICB2YXIgcGFyYW1zID0ge3R5cGU6IHR5cGUsIGRhdGFUeXBlOiAnanNvbid9O1xuXG4gICAgLy8gRW5zdXJlIHRoYXQgd2UgaGF2ZSBhIFVSTC5cbiAgICBpZiAoIW9wdGlvbnMudXJsKSB7XG4gICAgICBwYXJhbXMudXJsID0gXy5yZXN1bHQobW9kZWwsICd1cmwnKSB8fCB1cmxFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHdlIGhhdmUgdGhlIGFwcHJvcHJpYXRlIHJlcXVlc3QgZGF0YS5cbiAgICBpZiAob3B0aW9ucy5kYXRhID09IG51bGwgJiYgbW9kZWwgJiYgKG1ldGhvZCA9PT0gJ2NyZWF0ZScgfHwgbWV0aG9kID09PSAndXBkYXRlJyB8fCBtZXRob2QgPT09ICdwYXRjaCcpKSB7XG4gICAgICBwYXJhbXMuY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICBwYXJhbXMuZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuYXR0cnMgfHwgbW9kZWwudG9KU09OKG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICAvLyBGb3Igb2xkZXIgc2VydmVycywgZW11bGF0ZSBKU09OIGJ5IGVuY29kaW5nIHRoZSByZXF1ZXN0IGludG8gYW4gSFRNTC1mb3JtLlxuICAgIGlmIChvcHRpb25zLmVtdWxhdGVKU09OKSB7XG4gICAgICBwYXJhbXMuY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztcbiAgICAgIHBhcmFtcy5kYXRhID0gcGFyYW1zLmRhdGEgPyB7bW9kZWw6IHBhcmFtcy5kYXRhfSA6IHt9O1xuICAgIH1cblxuICAgIC8vIEZvciBvbGRlciBzZXJ2ZXJzLCBlbXVsYXRlIEhUVFAgYnkgbWltaWNraW5nIHRoZSBIVFRQIG1ldGhvZCB3aXRoIGBfbWV0aG9kYFxuICAgIC8vIEFuZCBhbiBgWC1IVFRQLU1ldGhvZC1PdmVycmlkZWAgaGVhZGVyLlxuICAgIGlmIChvcHRpb25zLmVtdWxhdGVIVFRQICYmICh0eXBlID09PSAnUFVUJyB8fCB0eXBlID09PSAnREVMRVRFJyB8fCB0eXBlID09PSAnUEFUQ0gnKSkge1xuICAgICAgcGFyYW1zLnR5cGUgPSAnUE9TVCc7XG4gICAgICBpZiAob3B0aW9ucy5lbXVsYXRlSlNPTikgcGFyYW1zLmRhdGEuX21ldGhvZCA9IHR5cGU7XG4gICAgICB2YXIgYmVmb3JlU2VuZCA9IG9wdGlvbnMuYmVmb3JlU2VuZDtcbiAgICAgIG9wdGlvbnMuYmVmb3JlU2VuZCA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1IVFRQLU1ldGhvZC1PdmVycmlkZScsIHR5cGUpO1xuICAgICAgICBpZiAoYmVmb3JlU2VuZCkgcmV0dXJuIGJlZm9yZVNlbmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgcHJvY2VzcyBkYXRhIG9uIGEgbm9uLUdFVCByZXF1ZXN0LlxuICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ0dFVCcgJiYgIW9wdGlvbnMuZW11bGF0ZUpTT04pIHtcbiAgICAgIHBhcmFtcy5wcm9jZXNzRGF0YSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHdlJ3JlIHNlbmRpbmcgYSBgUEFUQ0hgIHJlcXVlc3QsIGFuZCB3ZSdyZSBpbiBhbiBvbGQgSW50ZXJuZXQgRXhwbG9yZXJcbiAgICAvLyB0aGF0IHN0aWxsIGhhcyBBY3RpdmVYIGVuYWJsZWQgYnkgZGVmYXVsdCwgb3ZlcnJpZGUgalF1ZXJ5IHRvIHVzZSB0aGF0XG4gICAgLy8gZm9yIFhIUiBpbnN0ZWFkLiBSZW1vdmUgdGhpcyBsaW5lIHdoZW4galF1ZXJ5IHN1cHBvcnRzIGBQQVRDSGAgb24gSUU4LlxuICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ1BBVENIJyAmJiBub1hoclBhdGNoKSB7XG4gICAgICBwYXJhbXMueGhyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0LCBhbGxvd2luZyB0aGUgdXNlciB0byBvdmVycmlkZSBhbnkgQWpheCBvcHRpb25zLlxuICAgIHZhciB4aHIgPSBvcHRpb25zLnhociA9IEJhY2tib25lLmFqYXgoXy5leHRlbmQocGFyYW1zLCBvcHRpb25zKSk7XG4gICAgbW9kZWwudHJpZ2dlcigncmVxdWVzdCcsIG1vZGVsLCB4aHIsIG9wdGlvbnMpO1xuICAgIHJldHVybiB4aHI7XG4gIH07XG5cbiAgdmFyIG5vWGhyUGF0Y2ggPVxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICEhd2luZG93LkFjdGl2ZVhPYmplY3QgJiZcbiAgICAgICEod2luZG93LlhNTEh0dHBSZXF1ZXN0ICYmIChuZXcgWE1MSHR0cFJlcXVlc3QpLmRpc3BhdGNoRXZlbnQpO1xuXG4gIC8vIE1hcCBmcm9tIENSVUQgdG8gSFRUUCBmb3Igb3VyIGRlZmF1bHQgYEJhY2tib25lLnN5bmNgIGltcGxlbWVudGF0aW9uLlxuICB2YXIgbWV0aG9kTWFwID0ge1xuICAgICdjcmVhdGUnOiAnUE9TVCcsXG4gICAgJ3VwZGF0ZSc6ICdQVVQnLFxuICAgICdwYXRjaCc6ICAnUEFUQ0gnLFxuICAgICdkZWxldGUnOiAnREVMRVRFJyxcbiAgICAncmVhZCc6ICAgJ0dFVCdcbiAgfTtcblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgYEJhY2tib25lLmFqYXhgIHRvIHByb3h5IHRocm91Z2ggdG8gYCRgLlxuICAvLyBPdmVycmlkZSB0aGlzIGlmIHlvdSdkIGxpa2UgdG8gdXNlIGEgZGlmZmVyZW50IGxpYnJhcnkuXG4gIEJhY2tib25lLmFqYXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQmFja2JvbmUuJC5hamF4LmFwcGx5KEJhY2tib25lLiQsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQmFja2JvbmUuUm91dGVyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJvdXRlcnMgbWFwIGZhdXgtVVJMcyB0byBhY3Rpb25zLCBhbmQgZmlyZSBldmVudHMgd2hlbiByb3V0ZXMgYXJlXG4gIC8vIG1hdGNoZWQuIENyZWF0aW5nIGEgbmV3IG9uZSBzZXRzIGl0cyBgcm91dGVzYCBoYXNoLCBpZiBub3Qgc2V0IHN0YXRpY2FsbHkuXG4gIHZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICBpZiAob3B0aW9ucy5yb3V0ZXMpIHRoaXMucm91dGVzID0gb3B0aW9ucy5yb3V0ZXM7XG4gICAgdGhpcy5fYmluZFJvdXRlcygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIENhY2hlZCByZWd1bGFyIGV4cHJlc3Npb25zIGZvciBtYXRjaGluZyBuYW1lZCBwYXJhbSBwYXJ0cyBhbmQgc3BsYXR0ZWRcbiAgLy8gcGFydHMgb2Ygcm91dGUgc3RyaW5ncy5cbiAgdmFyIG9wdGlvbmFsUGFyYW0gPSAvXFwoKC4qPylcXCkvZztcbiAgdmFyIG5hbWVkUGFyYW0gICAgPSAvKFxcKFxcPyk/OlxcdysvZztcbiAgdmFyIHNwbGF0UGFyYW0gICAgPSAvXFwqXFx3Ky9nO1xuICB2YXIgZXNjYXBlUmVnRXhwICA9IC9bXFwte31cXFtcXF0rPy4sXFxcXFxcXiR8I1xcc10vZztcblxuICAvLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuUm91dGVyKiogcHJvcGVydGllcyBhbmQgbWV0aG9kcy5cbiAgXy5leHRlbmQoUm91dGVyLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cbiAgICAvLyBJbml0aWFsaXplIGlzIGFuIGVtcHR5IGZ1bmN0aW9uIGJ5IGRlZmF1bHQuIE92ZXJyaWRlIGl0IHdpdGggeW91ciBvd25cbiAgICAvLyBpbml0aWFsaXphdGlvbiBsb2dpYy5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cbiAgICAvLyBNYW51YWxseSBiaW5kIGEgc2luZ2xlIG5hbWVkIHJvdXRlIHRvIGEgY2FsbGJhY2suIEZvciBleGFtcGxlOlxuICAgIC8vXG4gICAgLy8gICAgIHRoaXMucm91dGUoJ3NlYXJjaC86cXVlcnkvcDpudW0nLCAnc2VhcmNoJywgZnVuY3Rpb24ocXVlcnksIG51bSkge1xuICAgIC8vICAgICAgIC4uLlxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIHJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICghXy5pc1JlZ0V4cChyb3V0ZSkpIHJvdXRlID0gdGhpcy5fcm91dGVUb1JlZ0V4cChyb3V0ZSk7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmFtZTtcbiAgICAgICAgbmFtZSA9ICcnO1xuICAgICAgfVxuICAgICAgaWYgKCFjYWxsYmFjaykgY2FsbGJhY2sgPSB0aGlzW25hbWVdO1xuICAgICAgdmFyIHJvdXRlciA9IHRoaXM7XG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnJvdXRlKHJvdXRlLCBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgICB2YXIgYXJncyA9IHJvdXRlci5fZXh0cmFjdFBhcmFtZXRlcnMocm91dGUsIGZyYWdtZW50KTtcbiAgICAgICAgcm91dGVyLmV4ZWN1dGUoY2FsbGJhY2ssIGFyZ3MpO1xuICAgICAgICByb3V0ZXIudHJpZ2dlci5hcHBseShyb3V0ZXIsIFsncm91dGU6JyArIG5hbWVdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIHJvdXRlci50cmlnZ2VyKCdyb3V0ZScsIG5hbWUsIGFyZ3MpO1xuICAgICAgICBCYWNrYm9uZS5oaXN0b3J5LnRyaWdnZXIoJ3JvdXRlJywgcm91dGVyLCBuYW1lLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEV4ZWN1dGUgYSByb3V0ZSBoYW5kbGVyIHdpdGggdGhlIHByb3ZpZGVkIHBhcmFtZXRlcnMuICBUaGlzIGlzIGFuXG4gICAgLy8gZXhjZWxsZW50IHBsYWNlIHRvIGRvIHByZS1yb3V0ZSBzZXR1cCBvciBwb3N0LXJvdXRlIGNsZWFudXAuXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgfSxcblxuICAgIC8vIFNpbXBsZSBwcm94eSB0byBgQmFja2JvbmUuaGlzdG9yeWAgdG8gc2F2ZSBhIGZyYWdtZW50IGludG8gdGhlIGhpc3RvcnkuXG4gICAgbmF2aWdhdGU6IGZ1bmN0aW9uKGZyYWdtZW50LCBvcHRpb25zKSB7XG4gICAgICBCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKGZyYWdtZW50LCBvcHRpb25zKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBCaW5kIGFsbCBkZWZpbmVkIHJvdXRlcyB0byBgQmFja2JvbmUuaGlzdG9yeWAuIFdlIGhhdmUgdG8gcmV2ZXJzZSB0aGVcbiAgICAvLyBvcmRlciBvZiB0aGUgcm91dGVzIGhlcmUgdG8gc3VwcG9ydCBiZWhhdmlvciB3aGVyZSB0aGUgbW9zdCBnZW5lcmFsXG4gICAgLy8gcm91dGVzIGNhbiBiZSBkZWZpbmVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHJvdXRlIG1hcC5cbiAgICBfYmluZFJvdXRlczogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMucm91dGVzKSByZXR1cm47XG4gICAgICB0aGlzLnJvdXRlcyA9IF8ucmVzdWx0KHRoaXMsICdyb3V0ZXMnKTtcbiAgICAgIHZhciByb3V0ZSwgcm91dGVzID0gXy5rZXlzKHRoaXMucm91dGVzKTtcbiAgICAgIHdoaWxlICgocm91dGUgPSByb3V0ZXMucG9wKCkpICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yb3V0ZShyb3V0ZSwgdGhpcy5yb3V0ZXNbcm91dGVdKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIHJvdXRlIHN0cmluZyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uLCBzdWl0YWJsZSBmb3IgbWF0Y2hpbmdcbiAgICAvLyBhZ2FpbnN0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGhhc2guXG4gICAgX3JvdXRlVG9SZWdFeHA6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICByb3V0ZSA9IHJvdXRlLnJlcGxhY2UoZXNjYXBlUmVnRXhwLCAnXFxcXCQmJylcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZShvcHRpb25hbFBhcmFtLCAnKD86JDEpPycpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2UobmFtZWRQYXJhbSwgZnVuY3Rpb24obWF0Y2gsIG9wdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9uYWwgPyBtYXRjaCA6ICcoW14vP10rKSc7XG4gICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZShzcGxhdFBhcmFtLCAnKFteP10qPyknKTtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKCdeJyArIHJvdXRlICsgJyg/OlxcXFw/KFtcXFxcc1xcXFxTXSopKT8kJyk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgcm91dGUsIGFuZCBhIFVSTCBmcmFnbWVudCB0aGF0IGl0IG1hdGNoZXMsIHJldHVybiB0aGUgYXJyYXkgb2ZcbiAgICAvLyBleHRyYWN0ZWQgZGVjb2RlZCBwYXJhbWV0ZXJzLiBFbXB0eSBvciB1bm1hdGNoZWQgcGFyYW1ldGVycyB3aWxsIGJlXG4gICAgLy8gdHJlYXRlZCBhcyBgbnVsbGAgdG8gbm9ybWFsaXplIGNyb3NzLWJyb3dzZXIgYmVoYXZpb3IuXG4gICAgX2V4dHJhY3RQYXJhbWV0ZXJzOiBmdW5jdGlvbihyb3V0ZSwgZnJhZ21lbnQpIHtcbiAgICAgIHZhciBwYXJhbXMgPSByb3V0ZS5leGVjKGZyYWdtZW50KS5zbGljZSgxKTtcbiAgICAgIHJldHVybiBfLm1hcChwYXJhbXMsIGZ1bmN0aW9uKHBhcmFtLCBpKSB7XG4gICAgICAgIC8vIERvbid0IGRlY29kZSB0aGUgc2VhcmNoIHBhcmFtcy5cbiAgICAgICAgaWYgKGkgPT09IHBhcmFtcy5sZW5ndGggLSAxKSByZXR1cm4gcGFyYW0gfHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHBhcmFtID8gZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtKSA6IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gQmFja2JvbmUuSGlzdG9yeVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSGFuZGxlcyBjcm9zcy1icm93c2VyIGhpc3RvcnkgbWFuYWdlbWVudCwgYmFzZWQgb24gZWl0aGVyXG4gIC8vIFtwdXNoU3RhdGVdKGh0dHA6Ly9kaXZlaW50b2h0bWw1LmluZm8vaGlzdG9yeS5odG1sKSBhbmQgcmVhbCBVUkxzLCBvclxuICAvLyBbb25oYXNoY2hhbmdlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0RPTS93aW5kb3cub25oYXNoY2hhbmdlKVxuICAvLyBhbmQgVVJMIGZyYWdtZW50cy4gSWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgbmVpdGhlciAob2xkIElFLCBuYXRjaCksXG4gIC8vIGZhbGxzIGJhY2sgdG8gcG9sbGluZy5cbiAgdmFyIEhpc3RvcnkgPSBCYWNrYm9uZS5IaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5oYW5kbGVycyA9IFtdO1xuICAgIF8uYmluZEFsbCh0aGlzLCAnY2hlY2tVcmwnKTtcblxuICAgIC8vIEVuc3VyZSB0aGF0IGBIaXN0b3J5YCBjYW4gYmUgdXNlZCBvdXRzaWRlIG9mIHRoZSBicm93c2VyLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5sb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcbiAgICAgIHRoaXMuaGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5O1xuICAgIH1cbiAgfTtcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHN0cmlwcGluZyBhIGxlYWRpbmcgaGFzaC9zbGFzaCBhbmQgdHJhaWxpbmcgc3BhY2UuXG4gIHZhciByb3V0ZVN0cmlwcGVyID0gL15bI1xcL118XFxzKyQvZztcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHN0cmlwcGluZyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzLlxuICB2YXIgcm9vdFN0cmlwcGVyID0gL15cXC8rfFxcLyskL2c7XG5cbiAgLy8gQ2FjaGVkIHJlZ2V4IGZvciBkZXRlY3RpbmcgTVNJRS5cbiAgdmFyIGlzRXhwbG9yZXIgPSAvbXNpZSBbXFx3Ll0rLztcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHJlbW92aW5nIGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciB0cmFpbGluZ1NsYXNoID0gL1xcLyQvO1xuXG4gIC8vIENhY2hlZCByZWdleCBmb3Igc3RyaXBwaW5nIHVybHMgb2YgaGFzaC5cbiAgdmFyIHBhdGhTdHJpcHBlciA9IC8jLiokLztcblxuICAvLyBIYXMgdGhlIGhpc3RvcnkgaGFuZGxpbmcgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQ/XG4gIEhpc3Rvcnkuc3RhcnRlZCA9IGZhbHNlO1xuXG4gIC8vIFNldCB1cCBhbGwgaW5oZXJpdGFibGUgKipCYWNrYm9uZS5IaXN0b3J5KiogcHJvcGVydGllcyBhbmQgbWV0aG9kcy5cbiAgXy5leHRlbmQoSGlzdG9yeS5wcm90b3R5cGUsIEV2ZW50cywge1xuXG4gICAgLy8gVGhlIGRlZmF1bHQgaW50ZXJ2YWwgdG8gcG9sbCBmb3IgaGFzaCBjaGFuZ2VzLCBpZiBuZWNlc3NhcnksIGlzXG4gICAgLy8gdHdlbnR5IHRpbWVzIGEgc2Vjb25kLlxuICAgIGludGVydmFsOiA1MCxcblxuICAgIC8vIEFyZSB3ZSBhdCB0aGUgYXBwIHJvb3Q/XG4gICAgYXRSb290OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1teXFwvXSQvLCAnJCYvJykgPT09IHRoaXMucm9vdDtcbiAgICB9LFxuXG4gICAgLy8gR2V0cyB0aGUgdHJ1ZSBoYXNoIHZhbHVlLiBDYW5ub3QgdXNlIGxvY2F0aW9uLmhhc2ggZGlyZWN0bHkgZHVlIHRvIGJ1Z1xuICAgIC8vIGluIEZpcmVmb3ggd2hlcmUgbG9jYXRpb24uaGFzaCB3aWxsIGFsd2F5cyBiZSBkZWNvZGVkLlxuICAgIGdldEhhc2g6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgICAgdmFyIG1hdGNoID0gKHdpbmRvdyB8fCB0aGlzKS5sb2NhdGlvbi5ocmVmLm1hdGNoKC8jKC4qKSQvKTtcbiAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY3Jvc3MtYnJvd3NlciBub3JtYWxpemVkIFVSTCBmcmFnbWVudCwgZWl0aGVyIGZyb20gdGhlIFVSTCxcbiAgICAvLyB0aGUgaGFzaCwgb3IgdGhlIG92ZXJyaWRlLlxuICAgIGdldEZyYWdtZW50OiBmdW5jdGlvbihmcmFnbWVudCwgZm9yY2VQdXNoU3RhdGUpIHtcbiAgICAgIGlmIChmcmFnbWVudCA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNQdXNoU3RhdGUgfHwgIXRoaXMuX3dhbnRzSGFzaENoYW5nZSB8fCBmb3JjZVB1c2hTdGF0ZSkge1xuICAgICAgICAgIGZyYWdtZW50ID0gZGVjb2RlVVJJKHRoaXMubG9jYXRpb24ucGF0aG5hbWUgKyB0aGlzLmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgICAgdmFyIHJvb3QgPSB0aGlzLnJvb3QucmVwbGFjZSh0cmFpbGluZ1NsYXNoLCAnJyk7XG4gICAgICAgICAgaWYgKCFmcmFnbWVudC5pbmRleE9mKHJvb3QpKSBmcmFnbWVudCA9IGZyYWdtZW50LnNsaWNlKHJvb3QubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcmFnbWVudCA9IHRoaXMuZ2V0SGFzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZnJhZ21lbnQucmVwbGFjZShyb3V0ZVN0cmlwcGVyLCAnJyk7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHRoZSBoYXNoIGNoYW5nZSBoYW5kbGluZywgcmV0dXJuaW5nIGB0cnVlYCBpZiB0aGUgY3VycmVudCBVUkwgbWF0Y2hlc1xuICAgIC8vIGFuIGV4aXN0aW5nIHJvdXRlLCBhbmQgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmIChIaXN0b3J5LnN0YXJ0ZWQpIHRocm93IG5ldyBFcnJvcihcIkJhY2tib25lLmhpc3RvcnkgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkXCIpO1xuICAgICAgSGlzdG9yeS5zdGFydGVkID0gdHJ1ZTtcblxuICAgICAgLy8gRmlndXJlIG91dCB0aGUgaW5pdGlhbCBjb25maWd1cmF0aW9uLiBEbyB3ZSBuZWVkIGFuIGlmcmFtZT9cbiAgICAgIC8vIElzIHB1c2hTdGF0ZSBkZXNpcmVkIC4uLiBpcyBpdCBhdmFpbGFibGU/XG4gICAgICB0aGlzLm9wdGlvbnMgICAgICAgICAgPSBfLmV4dGVuZCh7cm9vdDogJy8nfSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgIHRoaXMucm9vdCAgICAgICAgICAgICA9IHRoaXMub3B0aW9ucy5yb290O1xuICAgICAgdGhpcy5fd2FudHNIYXNoQ2hhbmdlID0gdGhpcy5vcHRpb25zLmhhc2hDaGFuZ2UgIT09IGZhbHNlO1xuICAgICAgdGhpcy5fd2FudHNQdXNoU3RhdGUgID0gISF0aGlzLm9wdGlvbnMucHVzaFN0YXRlO1xuICAgICAgdGhpcy5faGFzUHVzaFN0YXRlICAgID0gISEodGhpcy5vcHRpb25zLnB1c2hTdGF0ZSAmJiB0aGlzLmhpc3RvcnkgJiYgdGhpcy5oaXN0b3J5LnB1c2hTdGF0ZSk7XG4gICAgICB2YXIgZnJhZ21lbnQgICAgICAgICAgPSB0aGlzLmdldEZyYWdtZW50KCk7XG4gICAgICB2YXIgZG9jTW9kZSAgICAgICAgICAgPSBkb2N1bWVudC5kb2N1bWVudE1vZGU7XG4gICAgICB2YXIgb2xkSUUgICAgICAgICAgICAgPSAoaXNFeHBsb3Jlci5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSkgJiYgKCFkb2NNb2RlIHx8IGRvY01vZGUgPD0gNykpO1xuXG4gICAgICAvLyBOb3JtYWxpemUgcm9vdCB0byBhbHdheXMgaW5jbHVkZSBhIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoLlxuICAgICAgdGhpcy5yb290ID0gKCcvJyArIHRoaXMucm9vdCArICcvJykucmVwbGFjZShyb290U3RyaXBwZXIsICcvJyk7XG5cbiAgICAgIGlmIChvbGRJRSAmJiB0aGlzLl93YW50c0hhc2hDaGFuZ2UpIHtcbiAgICAgICAgdmFyIGZyYW1lID0gQmFja2JvbmUuJCgnPGlmcmFtZSBzcmM9XCJqYXZhc2NyaXB0OjBcIiB0YWJpbmRleD1cIi0xXCI+Jyk7XG4gICAgICAgIHRoaXMuaWZyYW1lID0gZnJhbWUuaGlkZSgpLmFwcGVuZFRvKCdib2R5JylbMF0uY29udGVudFdpbmRvdztcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZShmcmFnbWVudCk7XG4gICAgICB9XG5cbiAgICAgIC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHdlJ3JlIHVzaW5nIHB1c2hTdGF0ZSBvciBoYXNoZXMsIGFuZCB3aGV0aGVyXG4gICAgICAvLyAnb25oYXNoY2hhbmdlJyBpcyBzdXBwb3J0ZWQsIGRldGVybWluZSBob3cgd2UgY2hlY2sgdGhlIFVSTCBzdGF0ZS5cbiAgICAgIGlmICh0aGlzLl9oYXNQdXNoU3RhdGUpIHtcbiAgICAgICAgQmFja2JvbmUuJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuY2hlY2tVcmwpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl93YW50c0hhc2hDaGFuZ2UgJiYgKCdvbmhhc2hjaGFuZ2UnIGluIHdpbmRvdykgJiYgIW9sZElFKSB7XG4gICAgICAgIEJhY2tib25lLiQod2luZG93KS5vbignaGFzaGNoYW5nZScsIHRoaXMuY2hlY2tVcmwpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl93YW50c0hhc2hDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fY2hlY2tVcmxJbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMuY2hlY2tVcmwsIHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgd2UgbmVlZCB0byBjaGFuZ2UgdGhlIGJhc2UgdXJsLCBmb3IgYSBwdXNoU3RhdGUgbGlua1xuICAgICAgLy8gb3BlbmVkIGJ5IGEgbm9uLXB1c2hTdGF0ZSBicm93c2VyLlxuICAgICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuICAgICAgdmFyIGxvYyA9IHRoaXMubG9jYXRpb247XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gZnJvbSBoYXNoQ2hhbmdlIHRvIHB1c2hTdGF0ZSBvciB2aWNlIHZlcnNhIGlmIGJvdGggYXJlXG4gICAgICAvLyByZXF1ZXN0ZWQuXG4gICAgICBpZiAodGhpcy5fd2FudHNIYXNoQ2hhbmdlICYmIHRoaXMuX3dhbnRzUHVzaFN0YXRlKSB7XG5cbiAgICAgICAgLy8gSWYgd2UndmUgc3RhcnRlZCBvZmYgd2l0aCBhIHJvdXRlIGZyb20gYSBgcHVzaFN0YXRlYC1lbmFibGVkXG4gICAgICAgIC8vIGJyb3dzZXIsIGJ1dCB3ZSdyZSBjdXJyZW50bHkgaW4gYSBicm93c2VyIHRoYXQgZG9lc24ndCBzdXBwb3J0IGl0Li4uXG4gICAgICAgIGlmICghdGhpcy5faGFzUHVzaFN0YXRlICYmICF0aGlzLmF0Um9vdCgpKSB7XG4gICAgICAgICAgdGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0RnJhZ21lbnQobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgdGhpcy5sb2NhdGlvbi5yZXBsYWNlKHRoaXMucm9vdCArICcjJyArIHRoaXMuZnJhZ21lbnQpO1xuICAgICAgICAgIC8vIFJldHVybiBpbW1lZGlhdGVseSBhcyBicm93c2VyIHdpbGwgZG8gcmVkaXJlY3QgdG8gbmV3IHVybFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIE9yIGlmIHdlJ3ZlIHN0YXJ0ZWQgb3V0IHdpdGggYSBoYXNoLWJhc2VkIHJvdXRlLCBidXQgd2UncmUgY3VycmVudGx5XG4gICAgICAgIC8vIGluIGEgYnJvd3NlciB3aGVyZSBpdCBjb3VsZCBiZSBgcHVzaFN0YXRlYC1iYXNlZCBpbnN0ZWFkLi4uXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faGFzUHVzaFN0YXRlICYmIHRoaXMuYXRSb290KCkgJiYgbG9jLmhhc2gpIHtcbiAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gdGhpcy5nZXRIYXNoKCkucmVwbGFjZShyb3V0ZVN0cmlwcGVyLCAnJyk7XG4gICAgICAgICAgdGhpcy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHRoaXMucm9vdCArIHRoaXMuZnJhZ21lbnQpO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2lsZW50KSByZXR1cm4gdGhpcy5sb2FkVXJsKCk7XG4gICAgfSxcblxuICAgIC8vIERpc2FibGUgQmFja2JvbmUuaGlzdG9yeSwgcGVyaGFwcyB0ZW1wb3JhcmlseS4gTm90IHVzZWZ1bCBpbiBhIHJlYWwgYXBwLFxuICAgIC8vIGJ1dCBwb3NzaWJseSB1c2VmdWwgZm9yIHVuaXQgdGVzdGluZyBSb3V0ZXJzLlxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgQmFja2JvbmUuJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLmNoZWNrVXJsKS5vZmYoJ2hhc2hjaGFuZ2UnLCB0aGlzLmNoZWNrVXJsKTtcbiAgICAgIGlmICh0aGlzLl9jaGVja1VybEludGVydmFsKSBjbGVhckludGVydmFsKHRoaXMuX2NoZWNrVXJsSW50ZXJ2YWwpO1xuICAgICAgSGlzdG9yeS5zdGFydGVkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIHJvdXRlIHRvIGJlIHRlc3RlZCB3aGVuIHRoZSBmcmFnbWVudCBjaGFuZ2VzLiBSb3V0ZXMgYWRkZWQgbGF0ZXJcbiAgICAvLyBtYXkgb3ZlcnJpZGUgcHJldmlvdXMgcm91dGVzLlxuICAgIHJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMudW5zaGlmdCh7cm91dGU6IHJvdXRlLCBjYWxsYmFjazogY2FsbGJhY2t9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2tzIHRoZSBjdXJyZW50IFVSTCB0byBzZWUgaWYgaXQgaGFzIGNoYW5nZWQsIGFuZCBpZiBpdCBoYXMsXG4gICAgLy8gY2FsbHMgYGxvYWRVcmxgLCBub3JtYWxpemluZyBhY3Jvc3MgdGhlIGhpZGRlbiBpZnJhbWUuXG4gICAgY2hlY2tVcmw6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRGcmFnbWVudCgpO1xuICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMuZnJhZ21lbnQgJiYgdGhpcy5pZnJhbWUpIHtcbiAgICAgICAgY3VycmVudCA9IHRoaXMuZ2V0RnJhZ21lbnQodGhpcy5nZXRIYXNoKHRoaXMuaWZyYW1lKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudCA9PT0gdGhpcy5mcmFnbWVudCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHRoaXMuaWZyYW1lKSB0aGlzLm5hdmlnYXRlKGN1cnJlbnQpO1xuICAgICAgdGhpcy5sb2FkVXJsKCk7XG4gICAgfSxcblxuICAgIC8vIEF0dGVtcHQgdG8gbG9hZCB0aGUgY3VycmVudCBVUkwgZnJhZ21lbnQuIElmIGEgcm91dGUgc3VjY2VlZHMgd2l0aCBhXG4gICAgLy8gbWF0Y2gsIHJldHVybnMgYHRydWVgLiBJZiBubyBkZWZpbmVkIHJvdXRlcyBtYXRjaGVzIHRoZSBmcmFnbWVudCxcbiAgICAvLyByZXR1cm5zIGBmYWxzZWAuXG4gICAgbG9hZFVybDogZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgIGZyYWdtZW50ID0gdGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0RnJhZ21lbnQoZnJhZ21lbnQpO1xuICAgICAgcmV0dXJuIF8uYW55KHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXIucm91dGUudGVzdChmcmFnbWVudCkpIHtcbiAgICAgICAgICBoYW5kbGVyLmNhbGxiYWNrKGZyYWdtZW50KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIFNhdmUgYSBmcmFnbWVudCBpbnRvIHRoZSBoYXNoIGhpc3RvcnksIG9yIHJlcGxhY2UgdGhlIFVSTCBzdGF0ZSBpZiB0aGVcbiAgICAvLyAncmVwbGFjZScgb3B0aW9uIGlzIHBhc3NlZC4gWW91IGFyZSByZXNwb25zaWJsZSBmb3IgcHJvcGVybHkgVVJMLWVuY29kaW5nXG4gICAgLy8gdGhlIGZyYWdtZW50IGluIGFkdmFuY2UuXG4gICAgLy9cbiAgICAvLyBUaGUgb3B0aW9ucyBvYmplY3QgY2FuIGNvbnRhaW4gYHRyaWdnZXI6IHRydWVgIGlmIHlvdSB3aXNoIHRvIGhhdmUgdGhlXG4gICAgLy8gcm91dGUgY2FsbGJhY2sgYmUgZmlyZWQgKG5vdCB1c3VhbGx5IGRlc2lyYWJsZSksIG9yIGByZXBsYWNlOiB0cnVlYCwgaWZcbiAgICAvLyB5b3Ugd2lzaCB0byBtb2RpZnkgdGhlIGN1cnJlbnQgVVJMIHdpdGhvdXQgYWRkaW5nIGFuIGVudHJ5IHRvIHRoZSBoaXN0b3J5LlxuICAgIG5hdmlnYXRlOiBmdW5jdGlvbihmcmFnbWVudCwgb3B0aW9ucykge1xuICAgICAgaWYgKCFIaXN0b3J5LnN0YXJ0ZWQpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghb3B0aW9ucyB8fCBvcHRpb25zID09PSB0cnVlKSBvcHRpb25zID0ge3RyaWdnZXI6ICEhb3B0aW9uc307XG5cbiAgICAgIHZhciB1cmwgPSB0aGlzLnJvb3QgKyAoZnJhZ21lbnQgPSB0aGlzLmdldEZyYWdtZW50KGZyYWdtZW50IHx8ICcnKSk7XG5cbiAgICAgIC8vIFN0cmlwIHRoZSBoYXNoIGZvciBtYXRjaGluZy5cbiAgICAgIGZyYWdtZW50ID0gZnJhZ21lbnQucmVwbGFjZShwYXRoU3RyaXBwZXIsICcnKTtcblxuICAgICAgaWYgKHRoaXMuZnJhZ21lbnQgPT09IGZyYWdtZW50KSByZXR1cm47XG4gICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG5cbiAgICAgIC8vIERvbid0IGluY2x1ZGUgYSB0cmFpbGluZyBzbGFzaCBvbiB0aGUgcm9vdC5cbiAgICAgIGlmIChmcmFnbWVudCA9PT0gJycgJiYgdXJsICE9PSAnLycpIHVybCA9IHVybC5zbGljZSgwLCAtMSk7XG5cbiAgICAgIC8vIElmIHB1c2hTdGF0ZSBpcyBhdmFpbGFibGUsIHdlIHVzZSBpdCB0byBzZXQgdGhlIGZyYWdtZW50IGFzIGEgcmVhbCBVUkwuXG4gICAgICBpZiAodGhpcy5faGFzUHVzaFN0YXRlKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeVtvcHRpb25zLnJlcGxhY2UgPyAncmVwbGFjZVN0YXRlJyA6ICdwdXNoU3RhdGUnXSh7fSwgZG9jdW1lbnQudGl0bGUsIHVybCk7XG5cbiAgICAgIC8vIElmIGhhc2ggY2hhbmdlcyBoYXZlbid0IGJlZW4gZXhwbGljaXRseSBkaXNhYmxlZCwgdXBkYXRlIHRoZSBoYXNoXG4gICAgICAvLyBmcmFnbWVudCB0byBzdG9yZSBoaXN0b3J5LlxuICAgICAgfSBlbHNlIGlmICh0aGlzLl93YW50c0hhc2hDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlSGFzaCh0aGlzLmxvY2F0aW9uLCBmcmFnbWVudCwgb3B0aW9ucy5yZXBsYWNlKTtcbiAgICAgICAgaWYgKHRoaXMuaWZyYW1lICYmIChmcmFnbWVudCAhPT0gdGhpcy5nZXRGcmFnbWVudCh0aGlzLmdldEhhc2godGhpcy5pZnJhbWUpKSkpIHtcbiAgICAgICAgICAvLyBPcGVuaW5nIGFuZCBjbG9zaW5nIHRoZSBpZnJhbWUgdHJpY2tzIElFNyBhbmQgZWFybGllciB0byBwdXNoIGFcbiAgICAgICAgICAvLyBoaXN0b3J5IGVudHJ5IG9uIGhhc2gtdGFnIGNoYW5nZS4gIFdoZW4gcmVwbGFjZSBpcyB0cnVlLCB3ZSBkb24ndFxuICAgICAgICAgIC8vIHdhbnQgdGhpcy5cbiAgICAgICAgICBpZighb3B0aW9ucy5yZXBsYWNlKSB0aGlzLmlmcmFtZS5kb2N1bWVudC5vcGVuKCkuY2xvc2UoKTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVIYXNoKHRoaXMuaWZyYW1lLmxvY2F0aW9uLCBmcmFnbWVudCwgb3B0aW9ucy5yZXBsYWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBJZiB5b3UndmUgdG9sZCB1cyB0aGF0IHlvdSBleHBsaWNpdGx5IGRvbid0IHdhbnQgZmFsbGJhY2sgaGFzaGNoYW5nZS1cbiAgICAgIC8vIGJhc2VkIGhpc3RvcnksIHRoZW4gYG5hdmlnYXRlYCBiZWNvbWVzIGEgcGFnZSByZWZyZXNoLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYXRpb24uYXNzaWduKHVybCk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy50cmlnZ2VyKSByZXR1cm4gdGhpcy5sb2FkVXJsKGZyYWdtZW50KTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIHRoZSBoYXNoIGxvY2F0aW9uLCBlaXRoZXIgcmVwbGFjaW5nIHRoZSBjdXJyZW50IGVudHJ5LCBvciBhZGRpbmdcbiAgICAvLyBhIG5ldyBvbmUgdG8gdGhlIGJyb3dzZXIgaGlzdG9yeS5cbiAgICBfdXBkYXRlSGFzaDogZnVuY3Rpb24obG9jYXRpb24sIGZyYWdtZW50LCByZXBsYWNlKSB7XG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2YXIgaHJlZiA9IGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvKGphdmFzY3JpcHQ6fCMpLiokLywgJycpO1xuICAgICAgICBsb2NhdGlvbi5yZXBsYWNlKGhyZWYgKyAnIycgKyBmcmFnbWVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTb21lIGJyb3dzZXJzIHJlcXVpcmUgdGhhdCBgaGFzaGAgY29udGFpbnMgYSBsZWFkaW5nICMuXG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSAnIycgKyBmcmFnbWVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IEJhY2tib25lLmhpc3RvcnkuXG4gIEJhY2tib25lLmhpc3RvcnkgPSBuZXcgSGlzdG9yeTtcblxuICAvLyBIZWxwZXJzXG4gIC8vIC0tLS0tLS1cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29ycmVjdGx5IHNldCB1cCB0aGUgcHJvdG90eXBlIGNoYWluLCBmb3Igc3ViY2xhc3Nlcy5cbiAgLy8gU2ltaWxhciB0byBgZ29vZy5pbmhlcml0c2AsIGJ1dCB1c2VzIGEgaGFzaCBvZiBwcm90b3R5cGUgcHJvcGVydGllcyBhbmRcbiAgLy8gY2xhc3MgcHJvcGVydGllcyB0byBiZSBleHRlbmRlZC5cbiAgdmFyIGV4dGVuZCA9IGZ1bmN0aW9uKHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgdmFyIGNoaWxkO1xuXG4gICAgLy8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuICAgIC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuICAgIC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cbiAgICBpZiAocHJvdG9Qcm9wcyAmJiBfLmhhcyhwcm90b1Byb3BzLCAnY29uc3RydWN0b3InKSkge1xuICAgICAgY2hpbGQgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZCA9IGZ1bmN0aW9uKCl7IHJldHVybiBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICB9XG5cbiAgICAvLyBBZGQgc3RhdGljIHByb3BlcnRpZXMgdG8gdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLCBpZiBzdXBwbGllZC5cbiAgICBfLmV4dGVuZChjaGlsZCwgcGFyZW50LCBzdGF0aWNQcm9wcyk7XG5cbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuICAgIC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gICAgdmFyIFN1cnJvZ2F0ZSA9IGZ1bmN0aW9uKCl7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfTtcbiAgICBTdXJyb2dhdGUucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgU3Vycm9nYXRlO1xuXG4gICAgLy8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG4gICAgLy8gaWYgc3VwcGxpZWQuXG4gICAgaWYgKHByb3RvUHJvcHMpIF8uZXh0ZW5kKGNoaWxkLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG5cbiAgICAvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkXG4gICAgLy8gbGF0ZXIuXG4gICAgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblxuICAgIHJldHVybiBjaGlsZDtcbiAgfTtcblxuICAvLyBTZXQgdXAgaW5oZXJpdGFuY2UgZm9yIHRoZSBtb2RlbCwgY29sbGVjdGlvbiwgcm91dGVyLCB2aWV3IGFuZCBoaXN0b3J5LlxuICBNb2RlbC5leHRlbmQgPSBDb2xsZWN0aW9uLmV4dGVuZCA9IFJvdXRlci5leHRlbmQgPSBWaWV3LmV4dGVuZCA9IEhpc3RvcnkuZXh0ZW5kID0gZXh0ZW5kO1xuXG4gIC8vIFRocm93IGFuIGVycm9yIHdoZW4gYSBVUkwgaXMgbmVlZGVkLCBhbmQgbm9uZSBpcyBzdXBwbGllZC5cbiAgdmFyIHVybEVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBIFwidXJsXCIgcHJvcGVydHkgb3IgZnVuY3Rpb24gbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgfTtcblxuICAvLyBXcmFwIGFuIG9wdGlvbmFsIGVycm9yIGNhbGxiYWNrIHdpdGggYSBmYWxsYmFjayBlcnJvciBldmVudC5cbiAgdmFyIHdyYXBFcnJvciA9IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgdmFyIGVycm9yID0gb3B0aW9ucy5lcnJvcjtcbiAgICBvcHRpb25zLmVycm9yID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgaWYgKGVycm9yKSBlcnJvcihtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICBtb2RlbC50cmlnZ2VyKCdlcnJvcicsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICB9O1xuICB9O1xuXG4gIHJldHVybiBCYWNrYm9uZTtcblxufSkpO1xuIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS43LjBcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjcuMCc7XG5cbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxuICAvLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuICAvLyBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVDYWxsYmFjayA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgb3RoZXIpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEEgbW9zdGx5LWludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGNhbGxiYWNrcyB0aGF0IGNhbiBiZSBhcHBsaWVkXG4gIC8vIHRvIGVhY2ggZWxlbWVudCBpbiBhIGNvbGxlY3Rpb24sIHJldHVybmluZyB0aGUgZGVzaXJlZCByZXN1bHQg4oCUIGVpdGhlclxuICAvLyBpZGVudGl0eSwgYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBjcmVhdGVDYWxsYmFjayh2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcyh2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID09PSArbGVuZ3RoKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpLFxuICAgICAgICBjdXJyZW50S2V5O1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IDAsIGN1cnJlbnRLZXk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBpZiAoIWxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgICBtZW1vID0gb2JqW2tleXMgPyBrZXlzW2luZGV4KytdIDogaW5kZXgrK107XG4gICAgfVxuICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArIG9iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGluZGV4ID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGN1cnJlbnRLZXk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBpZiAoIWluZGV4KSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbLS1pbmRleF0gOiAtLWluZGV4XTtcbiAgICB9XG4gICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uc29tZShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKF8uaXRlcmF0ZWUocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCwgY3VycmVudEtleTtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIGN1cnJlbnRLZXk7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIHRhcmdldCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gb2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGggPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPCByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IG9iaiAmJiBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IHNldC5sZW5ndGg7XG4gICAgdmFyIHNodWZmbGVkID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIHJhbmQ7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgaWYgKHJhbmQgIT09IGluZGV4KSBzaHVmZmxlZFtpbmRleF0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gc2V0W2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IGxvdyArIGhpZ2ggPj4+IDE7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgICAgKHByZWRpY2F0ZSh2YWx1ZSwga2V5LCBvYmopID8gcGFzcyA6IGZhaWwpLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICBpZiAobiA8IDApIHJldHVybiBbXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aFxuICAvLyBgXy5tYXBgLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gKG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKSkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gICAgaWYgKHNoYWxsb3cgJiYgXy5ldmVyeShpbnB1dCwgXy5pc0FycmF5KSkge1xuICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShvdXRwdXQsIGlucHV0KTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpbnB1dFtpXTtcbiAgICAgIGlmICghXy5pc0FycmF5KHZhbHVlKSAmJiAhXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCFzdHJpY3QpIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2hhbGxvdykge1xuICAgICAgICBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UsIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiBbXTtcbiAgICBpZiAoIV8uaXNCb29sZWFuKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdGVlO1xuICAgICAgaXRlcmF0ZWUgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpdGVyYXRlZSAhPSBudWxsKSBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaV07XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IHZhbHVlKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGksIGFycmF5KTtcbiAgICAgICAgaWYgKF8uaW5kZXhPZihzZWVuLCBjb21wdXRlZCkgPCAwKSB7XG4gICAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXy5pbmRleE9mKHJlc3VsdCwgdmFsdWUpIDwgMCkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSwgW10pKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIHRydWUsIHRydWUsIFtdKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gW107XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KGFyZ3VtZW50cywgJ2xlbmd0aCcpLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgaWYgKHR5cGVvZiBpc1NvcnRlZCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpID0gaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbGVuZ3RoICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaWR4ID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgZnJvbSA9PSAnbnVtYmVyJykge1xuICAgICAgaWR4ID0gZnJvbSA8IDAgPyBpZHggKyBmcm9tICsgMSA6IE1hdGgubWluKGlkeCwgZnJvbSArIDEpO1xuICAgIH1cbiAgICB3aGlsZSAoLS1pZHggPj0gMCkgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBzdGVwIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciByYW5nZSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgICByYW5nZVtpZHhdID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV1c2FibGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHByb3RvdHlwZSBzZXR0aW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncywgYm91bmQ7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIEN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgc2VsZiA9IG5ldyBDdG9yO1xuICAgICAgQ3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBpZiAoXy5pc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMDtcbiAgICAgIHZhciBhcmdzID0gYm91bmRBcmdzLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJnc1tpXSA9PT0gXykgYXJnc1tpXSA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9IGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5O1xuICAgICAgaWYgKCFfLmhhcyhjYWNoZSwgYWRkcmVzcykpIGNhY2hlW2FkZHJlc3NdID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xuICAgIH07XG4gICAgbWVtb2l6ZS5jYWNoZSA9IHt9O1xuICAgIHJldHVybiBtZW1vaXplO1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG5cbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID4gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVuYyA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgdmFyIHNvdXJjZSwgcHJvcDtcbiAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgcHJvcCkpIHtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIGtleTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgICBpZiAoaXRlcmF0ZWUodmFsdWUsIGtleSwgb2JqKSkgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoW10sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICBvYmogPSBuZXcgT2JqZWN0KG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBpZiAoa2V5IGluIG9iaikgcmVzdWx0W2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBfLm5lZ2F0ZShpdGVyYXRlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5tYXAoY29uY2F0LmFwcGx5KFtdLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG4gICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzXG4gICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgaWYgKFxuICAgICAgYUN0b3IgIT09IGJDdG9yICYmXG4gICAgICAvLyBIYW5kbGUgT2JqZWN0LmNyZWF0ZSh4KSBjYXNlc1xuICAgICAgJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYiAmJlxuICAgICAgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUsIHJlc3VsdDtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgc2l6ZSA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgcmVzdWx0ID0gXy5rZXlzKGIpLmxlbmd0aCA9PT0gc2l6ZTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICAgIGtleSA9IGtleXNbc2l6ZV07XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSB8fCBfLmlzQXJndW1lbnRzKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgXy5lYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5oYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgYW4gSUUgMTEgYnVnLlxuICBpZiAodHlwZW9mIC8uLyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICBfLnByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIHZhciBwYWlycyA9IF8ucGFpcnMoYXR0cnMpLCBsZW5ndGggPSBwYWlycy5sZW5ndGg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcbiAgICAgIG9iaiA9IG5ldyBPYmplY3Qob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhaXIgPSBwYWlyc1tpXSwga2V5ID0gcGFpclswXTtcbiAgICAgICAgaWYgKHBhaXJbMV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRlZShpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVzY2FwZU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICdgJzogJyYjeDYwOydcbiAgfTtcbiAgdmFyIHVuZXNjYXBlTWFwID0gXy5pbnZlcnQoZXNjYXBlTWFwKTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIHZhciBjcmVhdGVFc2NhcGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVzY2FwZXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XG4gICAgfTtcbiAgICAvLyBSZWdleGVzIGZvciBpZGVudGlmeWluZyBhIGtleSB0aGF0IG5lZWRzIHRvIGJlIGVzY2FwZWRcbiAgICB2YXIgc291cmNlID0gJyg/OicgKyBfLmtleXMobWFwKS5qb2luKCd8JykgKyAnKSc7XG4gICAgdmFyIHRlc3RSZWdleHAgPSBSZWdFeHAoc291cmNlKTtcbiAgICB2YXIgcmVwbGFjZVJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UsICdnJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nID09IG51bGwgPyAnJyA6ICcnICsgc3RyaW5nO1xuICAgICAgcmV0dXJuIHRlc3RSZWdleHAudGVzdChzdHJpbmcpID8gc3RyaW5nLnJlcGxhY2UocmVwbGFjZVJlZ2V4cCwgZXNjYXBlcikgOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgXy5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKGVzY2FwZU1hcCk7XG4gIF8udW5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKHVuZXNjYXBlTWFwKTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyBvYmplY3RbcHJvcGVydHldKCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG4gIH07XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgLy8gTkI6IGBvbGRTZXR0aW5nc2Agb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gICAgaWYgKCFzZXR0aW5ncyAmJiBvbGRTZXR0aW5ncykgc2V0dGluZ3MgPSBvbGRTZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlciwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2ZmZXN0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHZhciBhcmd1bWVudCA9IHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonO1xuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbi4gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICAgIGluc3RhbmNlLl9jaGFpbiA9IHRydWU7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBfLmVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09PSAnc2hpZnQnIHx8IG5hbWUgPT09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgXy5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBDb21ib2tleXMgPSBzZWxmLmNvbnN0cnVjdG9yO1xuXG4gICAgLyoqXG4gICAgICogYSBsaXN0IG9mIGFsbCB0aGUgY2FsbGJhY2tzIHNldHVwIHZpYSBDb21ib2tleXMuYmluZCgpXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNlbGYuY2FsbGJhY2tzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBkaXJlY3QgbWFwIG9mIHN0cmluZyBjb21iaW5hdGlvbnMgdG8gY2FsbGJhY2tzIHVzZWQgZm9yIHRyaWdnZXIoKVxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBzZWxmLmRpcmVjdE1hcCA9IHt9O1xuXG4gICAgLyoqXG4gICAgICoga2VlcHMgdHJhY2sgb2Ygd2hhdCBsZXZlbCBlYWNoIHNlcXVlbmNlIGlzIGF0IHNpbmNlIG11bHRpcGxlXG4gICAgICogc2VxdWVuY2VzIGNhbiBzdGFydCBvdXQgd2l0aCB0aGUgc2FtZSBzZXF1ZW5jZVxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBzZWxmLnNlcXVlbmNlTGV2ZWxzID0ge307XG5cbiAgICAvKipcbiAgICAgKiB2YXJpYWJsZSB0byBzdG9yZSB0aGUgc2V0VGltZW91dCBjYWxsXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVsbHxudW1iZXJ9XG4gICAgICovXG4gICAgc2VsZi5yZXNldFRpbWVyO1xuXG4gICAgLyoqXG4gICAgICogdGVtcG9yYXJ5IHN0YXRlIHdoZXJlIHdlIHdpbGwgaWdub3JlIHRoZSBuZXh0IGtleXVwXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbnxzdHJpbmd9XG4gICAgICovXG4gICAgc2VsZi5pZ25vcmVOZXh0S2V5dXAgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIHRlbXBvcmFyeSBzdGF0ZSB3aGVyZSB3ZSB3aWxsIGlnbm9yZSB0aGUgbmV4dCBrZXlwcmVzc1xuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgc2VsZi5pZ25vcmVOZXh0S2V5cHJlc3MgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIGFyZSB3ZSBjdXJyZW50bHkgaW5zaWRlIG9mIGEgc2VxdWVuY2U/XG4gICAgICogdHlwZSBvZiBhY3Rpb24gKFwia2V5dXBcIiBvciBcImtleWRvd25cIiBvciBcImtleXByZXNzXCIpIG9yIGZhbHNlXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbnxzdHJpbmd9XG4gICAgICovXG4gICAgc2VsZi5uZXh0RXhwZWN0ZWRBY3Rpb24gPSBmYWxzZTtcblxuICAgIHNlbGYuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICBzZWxmLmFkZEV2ZW50cygpO1xuXG4gICAgQ29tYm9rZXlzLmluc3RhbmNlcy5wdXNoKHNlbGYpO1xuICAgIHJldHVybiBzZWxmO1xufTtcblxubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLmJpbmQgPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvYmluZFwiKTtcbm1vZHVsZS5leHBvcnRzLnByb3RvdHlwZS5iaW5kTXVsdGlwbGUgPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvYmluZE11bHRpcGxlXCIpO1xubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLnVuYmluZCA9IHJlcXVpcmUoXCIuL3Byb3RvdHlwZS91bmJpbmRcIik7XG5tb2R1bGUuZXhwb3J0cy5wcm90b3R5cGUudHJpZ2dlciA9IHJlcXVpcmUoXCIuL3Byb3RvdHlwZS90cmlnZ2VyXCIpO1xubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLnJlc2V0ID0gcmVxdWlyZShcIi4vcHJvdG90eXBlL3Jlc2V0LmpzXCIpO1xubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLnN0b3BDYWxsYmFjayA9IHJlcXVpcmUoXCIuL3Byb3RvdHlwZS9zdG9wQ2FsbGJhY2tcIik7XG5tb2R1bGUuZXhwb3J0cy5wcm90b3R5cGUuaGFuZGxlS2V5ID0gcmVxdWlyZShcIi4vcHJvdG90eXBlL2hhbmRsZUtleVwiKTtcbm1vZHVsZS5leHBvcnRzLnByb3RvdHlwZS5hZGRFdmVudHMgPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvYWRkRXZlbnRzXCIpO1xubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLmJpbmRTaW5nbGUgPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvYmluZFNpbmdsZVwiKTtcbm1vZHVsZS5leHBvcnRzLnByb3RvdHlwZS5nZXRLZXlJbmZvID0gcmVxdWlyZShcIi4vcHJvdG90eXBlL2dldEtleUluZm9cIik7XG5tb2R1bGUuZXhwb3J0cy5wcm90b3R5cGUucGlja0Jlc3RBY3Rpb24gPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvcGlja0Jlc3RBY3Rpb25cIik7XG5tb2R1bGUuZXhwb3J0cy5wcm90b3R5cGUuZ2V0UmV2ZXJzZU1hcCA9IHJlcXVpcmUoXCIuL3Byb3RvdHlwZS9nZXRSZXZlcnNlTWFwXCIpO1xubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLmdldE1hdGNoZXMgPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvZ2V0TWF0Y2hlc1wiKTtcbm1vZHVsZS5leHBvcnRzLnByb3RvdHlwZS5yZXNldFNlcXVlbmNlcyA9IHJlcXVpcmUoXCIuL3Byb3RvdHlwZS9yZXNldFNlcXVlbmNlc1wiKTtcbm1vZHVsZS5leHBvcnRzLnByb3RvdHlwZS5maXJlQ2FsbGJhY2sgPSByZXF1aXJlKFwiLi9wcm90b3R5cGUvZmlyZUNhbGxiYWNrXCIpO1xubW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLmJpbmRTZXF1ZW5jZSA9IHJlcXVpcmUoXCIuL3Byb3RvdHlwZS9iaW5kU2VxdWVuY2VcIik7XG5tb2R1bGUuZXhwb3J0cy5wcm90b3R5cGUucmVzZXRTZXF1ZW5jZVRpbWVyID0gcmVxdWlyZShcIi4vcHJvdG90eXBlL3Jlc2V0U2VxdWVuY2VUaW1lclwiKTtcblxubW9kdWxlLmV4cG9ydHMuaW5zdGFuY2VzID0gW107XG5tb2R1bGUuZXhwb3J0cy5yZXNldCA9IHJlcXVpcmUoXCIuL3Jlc2V0XCIpO1xuXG4vKipcbiAqIHZhcmlhYmxlIHRvIHN0b3JlIHRoZSBmbGlwcGVkIHZlcnNpb24gb2YgTUFQIGZyb20gYWJvdmVcbiAqIG5lZWRlZCB0byBjaGVjayBpZiB3ZSBzaG91bGQgdXNlIGtleXByZXNzIG9yIG5vdCB3aGVuIG5vIGFjdGlvblxuICogaXMgc3BlY2lmaWVkXG4gKlxuICogQHR5cGUge09iamVjdHx1bmRlZmluZWR9XG4gKi9cbm1vZHVsZS5leHBvcnRzLlJFVkVSU0VfTUFQID0gbnVsbDtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFkZEV2ZW50LFxuICAgICAgICBlbGVtZW50ID0gc2VsZi5lbGVtZW50LFxuICAgICAgICBoYW5kbGVLZXlFdmVudCxcbiAgICAgICAgYm91bmRIYW5kbGVyO1xuXG4gICAgaGFuZGxlS2V5RXZlbnQgPSByZXF1aXJlKFwiLi9oYW5kbGVLZXlFdmVudFwiKTtcblxuICAgIGFkZEV2ZW50ID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvYWRkRXZlbnRcIik7XG4gICAgYm91bmRIYW5kbGVyID0gaGFuZGxlS2V5RXZlbnQuYmluZChzZWxmKTtcbiAgICBhZGRFdmVudChlbGVtZW50LCBcImtleXByZXNzXCIsIGJvdW5kSGFuZGxlcik7XG4gICAgYWRkRXZlbnQoZWxlbWVudCwgXCJrZXlkb3duXCIsIGJvdW5kSGFuZGxlcik7XG4gICAgYWRkRXZlbnQoZWxlbWVudCwgXCJrZXl1cFwiLCBib3VuZEhhbmRsZXIpO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIGJpbmRzIGFuIGV2ZW50IHRvIENvbWJva2V5c1xuICpcbiAqIGNhbiBiZSBhIHNpbmdsZSBrZXksIGEgY29tYmluYXRpb24gb2Yga2V5cyBzZXBhcmF0ZWQgd2l0aCArLFxuICogYW4gYXJyYXkgb2Yga2V5cywgb3IgYSBzZXF1ZW5jZSBvZiBrZXlzIHNlcGFyYXRlZCBieSBzcGFjZXNcbiAqXG4gKiBiZSBzdXJlIHRvIGxpc3QgdGhlIG1vZGlmaWVyIGtleXMgZmlyc3QgdG8gbWFrZSBzdXJlIHRoYXQgdGhlXG4gKiBjb3JyZWN0IGtleSBlbmRzIHVwIGdldHRpbmcgYm91bmQgKHRoZSBsYXN0IGtleSBpbiB0aGUgcGF0dGVybilcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xBcnJheX0ga2V5c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7c3RyaW5nPX0gYWN0aW9uIC0gXCJrZXlwcmVzc1wiLCBcImtleWRvd25cIiwgb3IgXCJrZXl1cFwiXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5cywgY2FsbGJhY2ssIGFjdGlvbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGtleXMgPSBrZXlzIGluc3RhbmNlb2YgQXJyYXkgPyBrZXlzIDogW2tleXNdO1xuICAgIHNlbGYuYmluZE11bHRpcGxlKGtleXMsIGNhbGxiYWNrLCBhY3Rpb24pO1xuICAgIHJldHVybiBzZWxmO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogYmluZHMgbXVsdGlwbGUgY29tYmluYXRpb25zIHRvIHRoZSBzYW1lIGNhbGxiYWNrXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY29tYmluYXRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBhY3Rpb25cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29tYmluYXRpb25zLCBjYWxsYmFjaywgYWN0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb21iaW5hdGlvbnMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgc2VsZi5iaW5kU2luZ2xlKGNvbWJpbmF0aW9uc1tqXSwgY2FsbGJhY2ssIGFjdGlvbik7XG4gICAgfVxufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogYmluZHMgYSBrZXkgc2VxdWVuY2UgdG8gYW4gZXZlbnRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tYm8gLSBjb21ibyBzcGVjaWZpZWQgaW4gYmluZCBjYWxsXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHtzdHJpbmc9fSBhY3Rpb25cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29tYm8sIGtleXMsIGNhbGxiYWNrLCBhY3Rpb24pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBzdGFydCBvZmYgYnkgYWRkaW5nIGEgc2VxdWVuY2UgbGV2ZWwgcmVjb3JkIGZvciB0aGlzIGNvbWJpbmF0aW9uXG4gICAgLy8gYW5kIHNldHRpbmcgdGhlIGxldmVsIHRvIDBcbiAgICBzZWxmLnNlcXVlbmNlTGV2ZWxzW2NvbWJvXSA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBjYWxsYmFjayB0byBpbmNyZWFzZSB0aGUgc2VxdWVuY2UgbGV2ZWwgZm9yIHRoaXMgc2VxdWVuY2UgYW5kIHJlc2V0XG4gICAgICogYWxsIG90aGVyIHNlcXVlbmNlcyB0aGF0IHdlcmUgYWN0aXZlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dEFjdGlvblxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbmNyZWFzZVNlcXVlbmNlKG5leHRBY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5uZXh0RXhwZWN0ZWRBY3Rpb24gPSBuZXh0QWN0aW9uO1xuICAgICAgICAgICAgKytzZWxmLnNlcXVlbmNlTGV2ZWxzW2NvbWJvXTtcbiAgICAgICAgICAgIHNlbGYucmVzZXRTZXF1ZW5jZVRpbWVyKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogd3JhcHMgdGhlIHNwZWNpZmllZCBjYWxsYmFjayBpbnNpZGUgb2YgYW5vdGhlciBmdW5jdGlvbiBpbiBvcmRlclxuICAgICAqIHRvIHJlc2V0IGFsbCBzZXF1ZW5jZSBjb3VudGVycyBhcyBzb29uIGFzIHRoaXMgc2VxdWVuY2UgaXMgZG9uZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjYWxsYmFja0FuZFJlc2V0KGUpIHtcbiAgICAgICAgdmFyIGNoYXJhY3RlckZyb21FdmVudDtcbiAgICAgICAgc2VsZi5maXJlQ2FsbGJhY2soY2FsbGJhY2ssIGUsIGNvbWJvKTtcblxuICAgICAgICAvLyB3ZSBzaG91bGQgaWdub3JlIHRoZSBuZXh0IGtleSB1cCBpZiB0aGUgYWN0aW9uIGlzIGtleSBkb3duXG4gICAgICAgIC8vIG9yIGtleXByZXNzLiAgdGhpcyBpcyBzbyBpZiB5b3UgZmluaXNoIGEgc2VxdWVuY2UgYW5kXG4gICAgICAgIC8vIHJlbGVhc2UgdGhlIGtleSB0aGUgZmluYWwga2V5IHdpbGwgbm90IHRyaWdnZXIgYSBrZXl1cFxuICAgICAgICBpZiAoYWN0aW9uICE9PSBcImtleXVwXCIpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlckZyb21FdmVudCA9IHJlcXVpcmUoXCIuLi8uLi9oZWxwZXJzL2NoYXJhY3RlckZyb21FdmVudFwiKTtcbiAgICAgICAgICAgIHNlbGYuaWdub3JlTmV4dEtleXVwID0gY2hhcmFjdGVyRnJvbUV2ZW50KGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2VpcmQgcmFjZSBjb25kaXRpb24gaWYgYSBzZXF1ZW5jZSBlbmRzIHdpdGggdGhlIGtleVxuICAgICAgICAvLyBhbm90aGVyIHNlcXVlbmNlIGJlZ2lucyB3aXRoXG4gICAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlc2V0U2VxdWVuY2VzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBsb29wIHRocm91Z2gga2V5cyBvbmUgYXQgYSB0aW1lIGFuZCBiaW5kIHRoZSBhcHByb3ByaWF0ZSBjYWxsYmFja1xuICAgIC8vIGZ1bmN0aW9uLiAgZm9yIGFueSBrZXkgbGVhZGluZyB1cCB0byB0aGUgZmluYWwgb25lIGl0IHNob3VsZFxuICAgIC8vIGluY3JlYXNlIHRoZSBzZXF1ZW5jZS4gYWZ0ZXIgdGhlIGZpbmFsLCBpdCBzaG91bGQgcmVzZXQgYWxsIHNlcXVlbmNlc1xuICAgIC8vXG4gICAgLy8gaWYgYW4gYWN0aW9uIGlzIHNwZWNpZmllZCBpbiB0aGUgb3JpZ2luYWwgYmluZCBjYWxsIHRoZW4gdGhhdCB3aWxsXG4gICAgLy8gYmUgdXNlZCB0aHJvdWdob3V0LiAgb3RoZXJ3aXNlIHdlIHdpbGwgcGFzcyB0aGUgYWN0aW9uIHRoYXQgdGhlXG4gICAgLy8gbmV4dCBrZXkgaW4gdGhlIHNlcXVlbmNlIHNob3VsZCBtYXRjaC4gIHRoaXMgYWxsb3dzIGEgc2VxdWVuY2VcbiAgICAvLyB0byBtaXggYW5kIG1hdGNoIGtleXByZXNzIGFuZCBrZXlkb3duIGV2ZW50cyBkZXBlbmRpbmcgb24gd2hpY2hcbiAgICAvLyBvbmVzIGFyZSBiZXR0ZXIgc3VpdGVkIHRvIHRoZSBrZXkgcHJvdmlkZWRcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgdmFyIGlzRmluYWwgPSBqICsgMSA9PT0ga2V5cy5sZW5ndGg7XG4gICAgICAgIHZhciB3cmFwcGVkQ2FsbGJhY2sgPSBpc0ZpbmFsID8gY2FsbGJhY2tBbmRSZXNldCA6IGluY3JlYXNlU2VxdWVuY2UoYWN0aW9uIHx8IHNlbGYuZ2V0S2V5SW5mbyhrZXlzW2ogKyAxXSkuYWN0aW9uKTtcbiAgICAgICAgc2VsZi5iaW5kU2luZ2xlKGtleXNbal0sIHdyYXBwZWRDYWxsYmFjaywgYWN0aW9uLCBjb21ibywgaik7XG4gICAgfVxufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogYmluZHMgYSBzaW5nbGUga2V5Ym9hcmQgY29tYmluYXRpb25cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tYmluYXRpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge3N0cmluZz19IGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmc9fSBzZXF1ZW5jZU5hbWUgLSBuYW1lIG9mIHNlcXVlbmNlIGlmIHBhcnQgb2Ygc2VxdWVuY2VcbiAqIEBwYXJhbSB7bnVtYmVyPX0gbGV2ZWwgLSB3aGF0IHBhcnQgb2YgdGhlIHNlcXVlbmNlIHRoZSBjb21tYW5kIGlzXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbWJpbmF0aW9uLCBjYWxsYmFjaywgYWN0aW9uLCBzZXF1ZW5jZU5hbWUsIGxldmVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gc3RvcmUgYSBkaXJlY3QgbWFwcGVkIHJlZmVyZW5jZSBmb3IgdXNlIHdpdGggQ29tYm9rZXlzLnRyaWdnZXJcbiAgICBzZWxmLmRpcmVjdE1hcFtjb21iaW5hdGlvbiArIFwiOlwiICsgYWN0aW9uXSA9IGNhbGxiYWNrO1xuXG4gICAgLy8gbWFrZSBzdXJlIG11bHRpcGxlIHNwYWNlcyBpbiBhIHJvdyBiZWNvbWUgYSBzaW5nbGUgc3BhY2VcbiAgICBjb21iaW5hdGlvbiA9IGNvbWJpbmF0aW9uLnJlcGxhY2UoL1xccysvZywgXCIgXCIpO1xuXG4gICAgdmFyIHNlcXVlbmNlID0gY29tYmluYXRpb24uc3BsaXQoXCIgXCIpLFxuICAgICAgICBpbmZvO1xuXG4gICAgLy8gaWYgdGhpcyBwYXR0ZXJuIGlzIGEgc2VxdWVuY2Ugb2Yga2V5cyB0aGVuIHJ1biB0aHJvdWdoIHRoaXMgbWV0aG9kXG4gICAgLy8gdG8gcmVwcm9jZXNzIGVhY2ggcGF0dGVybiBvbmUga2V5IGF0IGEgdGltZVxuICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHNlbGYuYmluZFNlcXVlbmNlKGNvbWJpbmF0aW9uLCBzZXF1ZW5jZSwgY2FsbGJhY2ssIGFjdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpbmZvID0gc2VsZi5nZXRLZXlJbmZvKGNvbWJpbmF0aW9uLCBhY3Rpb24pO1xuXG4gICAgLy8gbWFrZSBzdXJlIHRvIGluaXRpYWxpemUgYXJyYXkgaWYgdGhpcyBpcyB0aGUgZmlyc3QgdGltZVxuICAgIC8vIGEgY2FsbGJhY2sgaXMgYWRkZWQgZm9yIHRoaXMga2V5XG4gICAgc2VsZi5jYWxsYmFja3NbaW5mby5rZXldID0gc2VsZi5jYWxsYmFja3NbaW5mby5rZXldIHx8IFtdO1xuXG4gICAgLy8gcmVtb3ZlIGFuIGV4aXN0aW5nIG1hdGNoIGlmIHRoZXJlIGlzIG9uZVxuICAgIHNlbGYuZ2V0TWF0Y2hlcyhpbmZvLmtleSwgaW5mby5tb2RpZmllcnMsIHt0eXBlOiBpbmZvLmFjdGlvbn0sIHNlcXVlbmNlTmFtZSwgY29tYmluYXRpb24sIGxldmVsKTtcblxuICAgIC8vIGFkZCB0aGlzIGNhbGwgYmFjayB0byB0aGUgYXJyYXlcbiAgICAvLyBpZiBpdCBpcyBhIHNlcXVlbmNlIHB1dCBpdCBhdCB0aGUgYmVnaW5uaW5nXG4gICAgLy8gaWYgbm90IHB1dCBpdCBhdCB0aGUgZW5kXG4gICAgLy9cbiAgICAvLyB0aGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoZSB3YXkgdGhlc2UgYXJlIHByb2Nlc3NlZCBleHBlY3RzXG4gICAgLy8gdGhlIHNlcXVlbmNlIG9uZXMgdG8gY29tZSBmaXJzdFxuICAgIHNlbGYuY2FsbGJhY2tzW2luZm8ua2V5XVtzZXF1ZW5jZU5hbWUgPyBcInVuc2hpZnRcIiA6IFwicHVzaFwiXSh7XG4gICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgbW9kaWZpZXJzOiBpbmZvLm1vZGlmaWVycyxcbiAgICAgICAgYWN0aW9uOiBpbmZvLmFjdGlvbixcbiAgICAgICAgc2VxOiBzZXF1ZW5jZU5hbWUsXG4gICAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgICAgY29tYm86IGNvbWJpbmF0aW9uXG4gICAgfSk7XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBhY3R1YWxseSBjYWxscyB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAqXG4gKiBpZiB5b3VyIGNhbGxiYWNrIGZ1bmN0aW9uIHJldHVybnMgZmFsc2UgdGhpcyB3aWxsIHVzZSB0aGUganF1ZXJ5XG4gKiBjb252ZW50aW9uIC0gcHJldmVudCBkZWZhdWx0IGFuZCBzdG9wIHByb3BvZ2F0aW9uIG9uIHRoZSBldmVudFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0V2ZW50fSBlXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlLCBjb21ibywgc2VxdWVuY2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHByZXZlbnREZWZhdWx0LFxuICAgICAgICBzdG9wUHJvcGFnYXRpb247XG5cbiAgICAvLyBpZiB0aGlzIGV2ZW50IHNob3VsZCBub3QgaGFwcGVuIHN0b3AgaGVyZVxuICAgIGlmIChzZWxmLnN0b3BDYWxsYmFjayhlLCBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsIGNvbWJvLCBzZXF1ZW5jZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjayhlLCBjb21ibykgPT09IGZhbHNlKSB7XG4gICAgICAgIHByZXZlbnREZWZhdWx0ID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvcHJldmVudERlZmF1bHRcIik7XG4gICAgICAgIHByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgICBzdG9wUHJvcGFnYXRpb24gPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9zdG9wUHJvcGFnYXRpb25cIik7XG4gICAgICAgIHN0b3BQcm9wYWdhdGlvbihlKTtcbiAgICB9XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBHZXRzIGluZm8gZm9yIGEgc3BlY2lmaWMga2V5IGNvbWJpbmF0aW9uXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBjb21iaW5hdGlvbiBrZXkgY29tYmluYXRpb24gKFwiY29tbWFuZCtzXCIgb3IgXCJhXCIgb3IgXCIqXCIpXG4gKiBAcGFyYW0gIHtzdHJpbmc9fSBhY3Rpb25cbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbWJpbmF0aW9uLCBhY3Rpb24pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGtleXNGcm9tU3RyaW5nLFxuICAgICAgICBrZXlzLFxuICAgICAgICBrZXksXG4gICAgICAgIGosXG4gICAgICAgIG1vZGlmaWVycyA9IFtdLFxuICAgICAgICBTUEVDSUFMX0FMSUFTRVMsXG4gICAgICAgIFNISUZUX01BUCxcbiAgICAgICAgaXNNb2RpZmllcjtcblxuICAgIGtleXNGcm9tU3RyaW5nID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMva2V5c0Zyb21TdHJpbmdcIik7XG4gICAgLy8gdGFrZSB0aGUga2V5cyBmcm9tIHRoaXMgcGF0dGVybiBhbmQgZmlndXJlIG91dCB3aGF0IHRoZSBhY3R1YWxcbiAgICAvLyBwYXR0ZXJuIGlzIGFsbCBhYm91dFxuICAgIGtleXMgPSBrZXlzRnJvbVN0cmluZyhjb21iaW5hdGlvbik7XG5cbiAgICBTUEVDSUFMX0FMSUFTRVMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9zcGVjaWFsLWFsaWFzZXNcIik7XG4gICAgU0hJRlRfTUFQID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvc2hpZnQtbWFwXCIpO1xuICAgIGlzTW9kaWZpZXIgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9pc01vZGlmaWVyXCIpO1xuICAgIGZvciAoaiA9IDA7IGogPCBrZXlzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIGtleSA9IGtleXNbal07XG5cbiAgICAgICAgLy8gbm9ybWFsaXplIGtleSBuYW1lc1xuICAgICAgICBpZiAoU1BFQ0lBTF9BTElBU0VTW2tleV0pIHtcbiAgICAgICAgICAgIGtleSA9IFNQRUNJQUxfQUxJQVNFU1trZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhpcyBpcyBub3QgYSBrZXlwcmVzcyBldmVudCB0aGVuIHdlIHNob3VsZFxuICAgICAgICAvLyBiZSBzbWFydCBhYm91dCB1c2luZyBzaGlmdCBrZXlzXG4gICAgICAgIC8vIHRoaXMgd2lsbCBvbmx5IHdvcmsgZm9yIFVTIGtleWJvYXJkcyBob3dldmVyXG4gICAgICAgIGlmIChhY3Rpb24gJiYgYWN0aW9uICE9PSBcImtleXByZXNzXCIgJiYgU0hJRlRfTUFQW2tleV0pIHtcbiAgICAgICAgICAgIGtleSA9IFNISUZUX01BUFtrZXldO1xuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goXCJzaGlmdFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoaXMga2V5IGlzIGEgbW9kaWZpZXIgdGhlbiBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgbW9kaWZpZXJzXG4gICAgICAgIGlmIChpc01vZGlmaWVyKGtleSkpIHtcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZXBlbmRpbmcgb24gd2hhdCB0aGUga2V5IGNvbWJpbmF0aW9uIGlzXG4gICAgLy8gd2Ugd2lsbCB0cnkgdG8gcGljayB0aGUgYmVzdCBldmVudCBmb3IgaXRcbiAgICBhY3Rpb24gPSBzZWxmLnBpY2tCZXN0QWN0aW9uKGtleSwgbW9kaWZpZXJzLCBhY3Rpb24pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzLFxuICAgICAgICBhY3Rpb246IGFjdGlvblxuICAgIH07XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBmaW5kcyBhbGwgY2FsbGJhY2tzIHRoYXQgbWF0Y2ggYmFzZWQgb24gdGhlIGtleWNvZGUsIG1vZGlmaWVycyxcbiAqIGFuZCBhY3Rpb25cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hhcmFjdGVyXG4gKiBAcGFyYW0ge0FycmF5fSBtb2RpZmllcnNcbiAqIEBwYXJhbSB7RXZlbnR8T2JqZWN0fSBlXG4gKiBAcGFyYW0ge3N0cmluZz19IHNlcXVlbmNlTmFtZSAtIG5hbWUgb2YgdGhlIHNlcXVlbmNlIHdlIGFyZSBsb29raW5nIGZvclxuICogQHBhcmFtIHtzdHJpbmc9fSBjb21iaW5hdGlvblxuICogQHBhcmFtIHtudW1iZXI9fSBsZXZlbFxuICogQHJldHVybnMge0FycmF5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFyYWN0ZXIsIG1vZGlmaWVycywgZSwgc2VxdWVuY2VOYW1lLCBjb21iaW5hdGlvbiwgbGV2ZWwpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGosXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgICBtYXRjaGVzID0gW10sXG4gICAgICAgIGFjdGlvbiA9IGUudHlwZSxcbiAgICAgICAgaXNNb2RpZmllcixcbiAgICAgICAgbW9kaWZpZXJzTWF0Y2g7XG5cbiAgICAvLyBpZiB0aGVyZSBhcmUgbm8gZXZlbnRzIHJlbGF0ZWQgdG8gdGhpcyBrZXljb2RlXG4gICAgaWYgKCFzZWxmLmNhbGxiYWNrc1tjaGFyYWN0ZXJdKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBpc01vZGlmaWVyID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvaXNNb2RpZmllclwiKTtcbiAgICAvLyBpZiBhIG1vZGlmaWVyIGtleSBpcyBjb21pbmcgdXAgb24gaXRzIG93biB3ZSBzaG91bGQgYWxsb3cgaXRcbiAgICBpZiAoYWN0aW9uID09PSBcImtleXVwXCIgJiYgaXNNb2RpZmllcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgIG1vZGlmaWVycyA9IFtjaGFyYWN0ZXJdO1xuICAgIH1cblxuICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgY2FsbGJhY2tzIGZvciB0aGUga2V5IHRoYXQgd2FzIHByZXNzZWRcbiAgICAvLyBhbmQgc2VlIGlmIGFueSBvZiB0aGVtIG1hdGNoXG4gICAgZm9yIChqID0gMDsgaiA8IHNlbGYuY2FsbGJhY2tzW2NoYXJhY3Rlcl0ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgY2FsbGJhY2sgPSBzZWxmLmNhbGxiYWNrc1tjaGFyYWN0ZXJdW2pdO1xuXG4gICAgICAgIC8vIGlmIGEgc2VxdWVuY2UgbmFtZSBpcyBub3Qgc3BlY2lmaWVkLCBidXQgdGhpcyBpcyBhIHNlcXVlbmNlIGF0XG4gICAgICAgIC8vIHRoZSB3cm9uZyBsZXZlbCB0aGVuIG1vdmUgb250byB0aGUgbmV4dCBtYXRjaFxuICAgICAgICBpZiAoIXNlcXVlbmNlTmFtZSAmJiBjYWxsYmFjay5zZXEgJiYgc2VsZi5zZXF1ZW5jZUxldmVsc1tjYWxsYmFjay5zZXFdICE9PSBjYWxsYmFjay5sZXZlbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgYWN0aW9uIHdlIGFyZSBsb29raW5nIGZvciBkb2Vzbid0IG1hdGNoIHRoZSBhY3Rpb24gd2UgZ290XG4gICAgICAgIC8vIHRoZW4gd2Ugc2hvdWxkIGtlZXAgZ29pbmdcbiAgICAgICAgaWYgKGFjdGlvbiAhPT0gY2FsbGJhY2suYWN0aW9uKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoaXMgaXMgYSBrZXlwcmVzcyBldmVudCBhbmQgdGhlIG1ldGEga2V5IGFuZCBjb250cm9sIGtleVxuICAgICAgICAvLyBhcmUgbm90IHByZXNzZWQgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gb25seSBsb29rIGF0IHRoZVxuICAgICAgICAvLyBjaGFyYWN0ZXIsIG90aGVyd2lzZSBjaGVjayB0aGUgbW9kaWZpZXJzIGFzIHdlbGxcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY2hyb21lIHdpbGwgbm90IGZpcmUgYSBrZXlwcmVzcyBpZiBtZXRhIG9yIGNvbnRyb2wgaXMgZG93blxuICAgICAgICAvLyBzYWZhcmkgd2lsbCBmaXJlIGEga2V5cHJlc3MgaWYgbWV0YSBvciBtZXRhK3NoaWZ0IGlzIGRvd25cbiAgICAgICAgLy8gZmlyZWZveCB3aWxsIGZpcmUgYSBrZXlwcmVzcyBpZiBtZXRhIG9yIGNvbnRyb2wgaXMgZG93blxuICAgICAgICBtb2RpZmllcnNNYXRjaCA9IHJlcXVpcmUoXCIuL21vZGlmaWVyc01hdGNoXCIpO1xuICAgICAgICBpZiAoKGFjdGlvbiA9PT0gXCJrZXlwcmVzc1wiICYmICFlLm1ldGFLZXkgJiYgIWUuY3RybEtleSkgfHwgbW9kaWZpZXJzTWF0Y2gobW9kaWZpZXJzLCBjYWxsYmFjay5tb2RpZmllcnMpKSB7XG5cbiAgICAgICAgICAgIC8vIHdoZW4geW91IGJpbmQgYSBjb21iaW5hdGlvbiBvciBzZXF1ZW5jZSBhIHNlY29uZCB0aW1lIGl0XG4gICAgICAgICAgICAvLyBzaG91bGQgb3ZlcndyaXRlIHRoZSBmaXJzdCBvbmUuICBpZiBhIHNlcXVlbmNlTmFtZSBvclxuICAgICAgICAgICAgLy8gY29tYmluYXRpb24gaXMgc3BlY2lmaWVkIGluIHRoaXMgY2FsbCBpdCBkb2VzIGp1c3QgdGhhdFxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEB0b2RvIG1ha2UgZGVsZXRpbmcgaXRzIG93biBtZXRob2Q/XG4gICAgICAgICAgICB2YXIgZGVsZXRlQ29tYm8gPSAhc2VxdWVuY2VOYW1lICYmIGNhbGxiYWNrLmNvbWJvID09PSBjb21iaW5hdGlvbjtcbiAgICAgICAgICAgIHZhciBkZWxldGVTZXF1ZW5jZSA9IHNlcXVlbmNlTmFtZSAmJiBjYWxsYmFjay5zZXEgPT09IHNlcXVlbmNlTmFtZSAmJiBjYWxsYmFjay5sZXZlbCA9PT0gbGV2ZWw7XG4gICAgICAgICAgICBpZiAoZGVsZXRlQ29tYm8gfHwgZGVsZXRlU2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrc1tjaGFyYWN0ZXJdLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGVzO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogcmV2ZXJzZXMgdGhlIG1hcCBsb29rdXAgc28gdGhhdCB3ZSBjYW4gbG9vayBmb3Igc3BlY2lmaWMga2V5c1xuICogdG8gc2VlIHdoYXQgY2FuIGFuZCBjYW4ndCB1c2Uga2V5cHJlc3NcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY29uc3RydWN0b3IgPSBzZWxmLmNvbnN0cnVjdG9yLFxuICAgICAgICBTUEVDSUFMX0tFWVNfTUFQO1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5SRVZFUlNFX01BUCkge1xuICAgICAgICBjb25zdHJ1Y3Rvci5SRVZFUlNFX01BUCA9IHt9O1xuICAgICAgICBTUEVDSUFMX0tFWVNfTUFQID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvc3BlY2lhbC1rZXlzLW1hcFwiKTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIFNQRUNJQUxfS0VZU19NQVApIHtcblxuICAgICAgICAgICAgLy8gcHVsbCBvdXQgdGhlIG51bWVyaWMga2V5cGFkIGZyb20gaGVyZSBjYXVzZSBrZXlwcmVzcyBzaG91bGRcbiAgICAgICAgICAgIC8vIGJlIGFibGUgdG8gZGV0ZWN0IHRoZSBrZXlzIGZyb20gdGhlIGNoYXJhY3RlclxuICAgICAgICAgICAgaWYgKGtleSA+IDk1ICYmIGtleSA8IDExMikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoU1BFQ0lBTF9LRVlTX01BUC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IuUkVWRVJTRV9NQVBbU1BFQ0lBTF9LRVlTX01BUFtrZXldXSA9IGtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29uc3RydWN0b3IuUkVWRVJTRV9NQVA7XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBoYW5kbGVzIGEgY2hhcmFjdGVyIGtleSBldmVudFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaGFyYWN0ZXJcbiAqIEBwYXJhbSB7QXJyYXl9IG1vZGlmaWVyc1xuICogQHBhcmFtIHtFdmVudH0gZVxuICogQHJldHVybnMgdm9pZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFyYWN0ZXIsIG1vZGlmaWVycywgZSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY2FsbGJhY2tzLFxuICAgICAgICBqLFxuICAgICAgICBkb05vdFJlc2V0ID0ge30sXG4gICAgICAgIG1heExldmVsID0gMCxcbiAgICAgICAgcHJvY2Vzc2VkU2VxdWVuY2VDYWxsYmFjayA9IGZhbHNlLFxuICAgICAgICBpc01vZGlmaWVyLFxuICAgICAgICBpZ25vcmVUaGlzS2V5cHJlc3M7XG5cbiAgICBjYWxsYmFja3MgPSBzZWxmLmdldE1hdGNoZXMoY2hhcmFjdGVyLCBtb2RpZmllcnMsIGUpO1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgbWF4TGV2ZWwgZm9yIHNlcXVlbmNlcyBzbyB3ZSBjYW4gb25seSBleGVjdXRlIHRoZSBsb25nZXN0IGNhbGxiYWNrIHNlcXVlbmNlXG4gICAgZm9yIChqID0gMDsgaiA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraikge1xuICAgICAgICBpZiAoY2FsbGJhY2tzW2pdLnNlcSkge1xuICAgICAgICAgICAgbWF4TGV2ZWwgPSBNYXRoLm1heChtYXhMZXZlbCwgY2FsbGJhY2tzW2pdLmxldmVsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxvb3AgdGhyb3VnaCBtYXRjaGluZyBjYWxsYmFja3MgZm9yIHRoaXMga2V5IGV2ZW50XG4gICAgZm9yIChqID0gMDsgaiA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraikge1xuXG4gICAgICAgIC8vIGZpcmUgZm9yIGFsbCBzZXF1ZW5jZSBjYWxsYmFja3NcbiAgICAgICAgLy8gdGhpcyBpcyBiZWNhdXNlIGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIG11bHRpcGxlIHNlcXVlbmNlc1xuICAgICAgICAvLyBib3VuZCBzdWNoIGFzIFwiZyBpXCIgYW5kIFwiZyB0XCIgdGhleSBib3RoIG5lZWQgdG8gZmlyZSB0aGVcbiAgICAgICAgLy8gY2FsbGJhY2sgZm9yIG1hdGNoaW5nIGcgY2F1c2Ugb3RoZXJ3aXNlIHlvdSBjYW4gb25seSBldmVyXG4gICAgICAgIC8vIG1hdGNoIHRoZSBmaXJzdCBvbmVcbiAgICAgICAgaWYgKGNhbGxiYWNrc1tqXS5zZXEpIHtcblxuICAgICAgICAgICAgLy8gb25seSBmaXJlIGNhbGxiYWNrcyBmb3IgdGhlIG1heExldmVsIHRvIHByZXZlbnRcbiAgICAgICAgICAgIC8vIHN1YnNlcXVlbmNlcyBmcm9tIGFsc28gZmlyaW5nXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gZm9yIGV4YW1wbGUgJ2Egb3B0aW9uIGInIHNob3VsZCBub3QgY2F1c2UgJ29wdGlvbiBiJyB0byBmaXJlXG4gICAgICAgICAgICAvLyBldmVuIHRob3VnaCAnb3B0aW9uIGInIGlzIHBhcnQgb2YgdGhlIG90aGVyIHNlcXVlbmNlXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gYW55IHNlcXVlbmNlcyB0aGF0IGRvIG5vdCBtYXRjaCBoZXJlIHdpbGwgYmUgZGlzY2FyZGVkXG4gICAgICAgICAgICAvLyBiZWxvdyBieSB0aGUgcmVzZXRTZXF1ZW5jZXMgY2FsbFxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrc1tqXS5sZXZlbCAhPT0gbWF4TGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvY2Vzc2VkU2VxdWVuY2VDYWxsYmFjayA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIGtlZXAgYSBsaXN0IG9mIHdoaWNoIHNlcXVlbmNlcyB3ZXJlIG1hdGNoZXMgZm9yIGxhdGVyXG4gICAgICAgICAgICBkb05vdFJlc2V0W2NhbGxiYWNrc1tqXS5zZXFdID0gMTtcbiAgICAgICAgICAgIHNlbGYuZmlyZUNhbGxiYWNrKGNhbGxiYWNrc1tqXS5jYWxsYmFjaywgZSwgY2FsbGJhY2tzW2pdLmNvbWJvLCBjYWxsYmFja3Nbal0uc2VxKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgd2VyZSBubyBzZXF1ZW5jZSBtYXRjaGVzIGJ1dCB3ZSBhcmUgc3RpbGwgaGVyZVxuICAgICAgICAvLyB0aGF0IG1lYW5zIHRoaXMgaXMgYSByZWd1bGFyIG1hdGNoIHNvIHdlIHNob3VsZCBmaXJlIHRoYXRcbiAgICAgICAgaWYgKCFwcm9jZXNzZWRTZXF1ZW5jZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICBzZWxmLmZpcmVDYWxsYmFjayhjYWxsYmFja3Nbal0uY2FsbGJhY2ssIGUsIGNhbGxiYWNrc1tqXS5jb21ibyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGUga2V5IHlvdSBwcmVzc2VkIG1hdGNoZXMgdGhlIHR5cGUgb2Ygc2VxdWVuY2Ugd2l0aG91dFxuICAgIC8vIGJlaW5nIGEgbW9kaWZpZXIgKGllIFwia2V5dXBcIiBvciBcImtleXByZXNzXCIpIHRoZW4gd2Ugc2hvdWxkXG4gICAgLy8gcmVzZXQgYWxsIHNlcXVlbmNlcyB0aGF0IHdlcmUgbm90IG1hdGNoZWQgYnkgdGhpcyBldmVudFxuICAgIC8vXG4gICAgLy8gdGhpcyBpcyBzbywgZm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIHRoZSBzZXF1ZW5jZSBcImggYSB0XCIgYW5kIHlvdVxuICAgIC8vIHR5cGUgXCJoIGUgYSByIHRcIiBpdCBkb2VzIG5vdCBtYXRjaC4gIGluIHRoaXMgY2FzZSB0aGUgXCJlXCIgd2lsbFxuICAgIC8vIGNhdXNlIHRoZSBzZXF1ZW5jZSB0byByZXNldFxuICAgIC8vXG4gICAgLy8gbW9kaWZpZXIga2V5cyBhcmUgaWdub3JlZCBiZWNhdXNlIHlvdSBjYW4gaGF2ZSBhIHNlcXVlbmNlXG4gICAgLy8gdGhhdCBjb250YWlucyBtb2RpZmllcnMgc3VjaCBhcyBcImVudGVyIGN0cmwrc3BhY2VcIiBhbmQgaW4gbW9zdFxuICAgIC8vIGNhc2VzIHRoZSBtb2RpZmllciBrZXkgd2lsbCBiZSBwcmVzc2VkIGJlZm9yZSB0aGUgbmV4dCBrZXlcbiAgICAvL1xuICAgIC8vIGFsc28gaWYgeW91IGhhdmUgYSBzZXF1ZW5jZSBzdWNoIGFzIFwiY3RybCtiIGFcIiB0aGVuIHByZXNzaW5nIHRoZVxuICAgIC8vIFwiYlwiIGtleSB3aWxsIHRyaWdnZXIgYSBcImtleXByZXNzXCIgYW5kIGEgXCJrZXlkb3duXCJcbiAgICAvL1xuICAgIC8vIHRoZSBcImtleWRvd25cIiBpcyBleHBlY3RlZCB3aGVuIHRoZXJlIGlzIGEgbW9kaWZpZXIsIGJ1dCB0aGVcbiAgICAvLyBcImtleXByZXNzXCIgZW5kcyB1cCBtYXRjaGluZyB0aGUgbmV4dEV4cGVjdGVkQWN0aW9uIHNpbmNlIGl0IG9jY3Vyc1xuICAgIC8vIGFmdGVyIGFuZCB0aGF0IGNhdXNlcyB0aGUgc2VxdWVuY2UgdG8gcmVzZXRcbiAgICAvL1xuICAgIC8vIHdlIGlnbm9yZSBrZXlwcmVzc2VzIGluIGEgc2VxdWVuY2UgdGhhdCBkaXJlY3RseSBmb2xsb3cgYSBrZXlkb3duXG4gICAgLy8gZm9yIHRoZSBzYW1lIGNoYXJhY3RlclxuICAgIGlnbm9yZVRoaXNLZXlwcmVzcyA9IGUudHlwZSA9PT0gXCJrZXlwcmVzc1wiICYmIHNlbGYuaWdub3JlTmV4dEtleXByZXNzO1xuICAgIGlzTW9kaWZpZXIgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9pc01vZGlmaWVyXCIpO1xuICAgIGlmIChlLnR5cGUgPT09IHNlbGYubmV4dEV4cGVjdGVkQWN0aW9uICYmICFpc01vZGlmaWVyKGNoYXJhY3RlcikgJiYgIWlnbm9yZVRoaXNLZXlwcmVzcykge1xuICAgICAgICBzZWxmLnJlc2V0U2VxdWVuY2VzKGRvTm90UmVzZXQpO1xuICAgIH1cblxuICAgIHNlbGYuaWdub3JlTmV4dEtleXByZXNzID0gcHJvY2Vzc2VkU2VxdWVuY2VDYWxsYmFjayAmJiBlLnR5cGUgPT09IFwia2V5ZG93blwiO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogaGFuZGxlcyBhIGtleWRvd24gZXZlbnRcbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBlXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNoYXJhY3RlckZyb21FdmVudCxcbiAgICAgICAgZXZlbnRNb2RpZmllcnM7XG5cbiAgICAvLyBub3JtYWxpemUgZS53aGljaCBmb3Iga2V5IGV2ZW50c1xuICAgIC8vIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80Mjg1NjI3L2phdmFzY3JpcHQta2V5Y29kZS12cy1jaGFyY29kZS11dHRlci1jb25mdXNpb25cbiAgICBpZiAodHlwZW9mIGUud2hpY2ggIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgZS53aGljaCA9IGUua2V5Q29kZTtcbiAgICB9XG4gICAgY2hhcmFjdGVyRnJvbUV2ZW50ID0gcmVxdWlyZShcIi4uLy4uL2hlbHBlcnMvY2hhcmFjdGVyRnJvbUV2ZW50XCIpO1xuICAgIHZhciBjaGFyYWN0ZXIgPSBjaGFyYWN0ZXJGcm9tRXZlbnQoZSk7XG5cbiAgICAvLyBubyBjaGFyYWN0ZXIgZm91bmQgdGhlbiBzdG9wXG4gICAgaWYgKCFjaGFyYWN0ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG5lZWQgdG8gdXNlID09PSBmb3IgdGhlIGNoYXJhY3RlciBjaGVjayBiZWNhdXNlIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIDBcbiAgICBpZiAoZS50eXBlID09PSBcImtleXVwXCIgJiYgc2VsZi5pZ25vcmVOZXh0S2V5dXAgPT09IGNoYXJhY3Rlcikge1xuICAgICAgICBzZWxmLmlnbm9yZU5leHRLZXl1cCA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnRNb2RpZmllcnMgPSByZXF1aXJlKFwiLi4vLi4vaGVscGVycy9ldmVudE1vZGlmaWVyc1wiKTtcbiAgICBzZWxmLmhhbmRsZUtleShjaGFyYWN0ZXIsIGV2ZW50TW9kaWZpZXJzKGUpLCBlKTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIGNoZWNrcyBpZiB0d28gYXJyYXlzIGFyZSBlcXVhbFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IG1vZGlmaWVyczFcbiAqIEBwYXJhbSB7QXJyYXl9IG1vZGlmaWVyczJcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtb2RpZmllcnMxLCBtb2RpZmllcnMyKSB7XG4gICAgcmV0dXJuIG1vZGlmaWVyczEuc29ydCgpLmpvaW4oXCIsXCIpID09PSBtb2RpZmllcnMyLnNvcnQoKS5qb2luKFwiLFwiKTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIHBpY2tzIHRoZSBiZXN0IGFjdGlvbiBiYXNlZCBvbiB0aGUga2V5IGNvbWJpbmF0aW9uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIGNoYXJhY3RlciBmb3Iga2V5XG4gKiBAcGFyYW0ge0FycmF5fSBtb2RpZmllcnNcbiAqIEBwYXJhbSB7c3RyaW5nPX0gYWN0aW9uIHBhc3NlZCBpblxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIG1vZGlmaWVycywgYWN0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gaWYgbm8gYWN0aW9uIHdhcyBwaWNrZWQgaW4gd2Ugc2hvdWxkIHRyeSB0byBwaWNrIHRoZSBvbmVcbiAgICAvLyB0aGF0IHdlIHRoaW5rIHdvdWxkIHdvcmsgYmVzdCBmb3IgdGhpcyBrZXlcbiAgICBpZiAoIWFjdGlvbikge1xuICAgICAgICBhY3Rpb24gPSBzZWxmLmdldFJldmVyc2VNYXAoKVtrZXldID8gXCJrZXlkb3duXCIgOiBcImtleXByZXNzXCI7XG4gICAgfVxuXG4gICAgLy8gbW9kaWZpZXIga2V5cyBkb24ndCB3b3JrIGFzIGV4cGVjdGVkIHdpdGgga2V5cHJlc3MsXG4gICAgLy8gc3dpdGNoIHRvIGtleWRvd25cbiAgICBpZiAoYWN0aW9uID09PSBcImtleXByZXNzXCIgJiYgbW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgICBhY3Rpb24gPSBcImtleWRvd25cIjtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogcmVzZXRzIHRoZSBsaWJyYXJ5IGJhY2sgdG8gaXRzIGluaXRpYWwgc3RhdGUuIFRoaXMgaXMgdXNlZnVsXG4gKiBpZiB5b3Ugd2FudCB0byBjbGVhciBvdXQgdGhlIGN1cnJlbnQga2V5Ym9hcmQgc2hvcnRjdXRzIGFuZCBiaW5kXG4gKiBuZXcgb25lcyAtIGZvciBleGFtcGxlIGlmIHlvdSBzd2l0Y2ggdG8gYW5vdGhlciBwYWdlXG4gKlxuICogQHJldHVybnMgdm9pZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLmNhbGxiYWNrcyA9IHt9O1xuICAgIHNlbGYuZGlyZWN0TWFwID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcbi8qKlxuICogY2FsbGVkIHRvIHNldCBhIDEgc2Vjb25kIHRpbWVvdXQgb24gdGhlIHNwZWNpZmllZCBzZXF1ZW5jZVxuICpcbiAqIHRoaXMgaXMgc28gYWZ0ZXIgZWFjaCBrZXkgcHJlc3MgaW4gdGhlIHNlcXVlbmNlIHlvdSBoYXZlIDEgc2Vjb25kXG4gKiB0byBwcmVzcyB0aGUgbmV4dCBrZXkgYmVmb3JlIHlvdSBoYXZlIHRvIHN0YXJ0IG92ZXJcbiAqXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGNsZWFyVGltZW91dChzZWxmLnJlc2V0VGltZXIpO1xuICAgIHNlbGYucmVzZXRUaW1lciA9IHNldFRpbWVvdXQoXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnJlc2V0U2VxdWVuY2VzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIDEwMDBcbiAgICApO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogcmVzZXRzIGFsbCBzZXF1ZW5jZSBjb3VudGVycyBleGNlcHQgZm9yIHRoZSBvbmVzIHBhc3NlZCBpblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkb05vdFJlc2V0XG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRvTm90UmVzZXQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBkb05vdFJlc2V0ID0gZG9Ob3RSZXNldCB8fCB7fTtcblxuICAgIHZhciBhY3RpdmVTZXF1ZW5jZXMgPSBmYWxzZSxcbiAgICAgICAga2V5O1xuXG4gICAgZm9yIChrZXkgaW4gc2VsZi5zZXF1ZW5jZUxldmVscykge1xuICAgICAgICBpZiAoZG9Ob3RSZXNldFtrZXldKSB7XG4gICAgICAgICAgICBhY3RpdmVTZXF1ZW5jZXMgPSB0cnVlO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5zZXF1ZW5jZUxldmVsc1trZXldID0gMDtcbiAgICB9XG5cbiAgICBpZiAoIWFjdGl2ZVNlcXVlbmNlcykge1xuICAgICAgICBzZWxmLm5leHRFeHBlY3RlZEFjdGlvbiA9IGZhbHNlO1xuICAgIH1cbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiogc2hvdWxkIHdlIHN0b3AgdGhpcyBldmVudCBiZWZvcmUgZmlyaW5nIG9mZiBjYWxsYmFja3NcbipcbiogQHBhcmFtIHtFdmVudH0gZVxuKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiogQHJldHVybiB7Ym9vbGVhbn1cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGUsIGVsZW1lbnQpIHtcblxuICAgIC8vIGlmIHRoZSBlbGVtZW50IGhhcyB0aGUgY2xhc3MgXCJjb21ib2tleXNcIiB0aGVuIG5vIG5lZWQgdG8gc3RvcFxuICAgIGlmICgoXCIgXCIgKyBlbGVtZW50LmNsYXNzTmFtZSArIFwiIFwiKS5pbmRleE9mKFwiIGNvbWJva2V5cyBcIikgPiAtMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gc3RvcCBmb3IgaW5wdXQsIHNlbGVjdCwgYW5kIHRleHRhcmVhXG4gICAgcmV0dXJuIGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJTlBVVFwiIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIiB8fCBlbGVtZW50LnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIiB8fCBlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIHRyaWdnZXJzIGFuIGV2ZW50IHRoYXQgaGFzIGFscmVhZHkgYmVlbiBib3VuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlzXG4gKiBAcGFyYW0ge3N0cmluZz19IGFjdGlvblxuICogQHJldHVybnMgdm9pZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleXMsIGFjdGlvbikge1xuICAgIGlmIChkaXJlY3RNYXBba2V5cyArIFwiOlwiICsgYWN0aW9uXSkge1xuICAgICAgICBkaXJlY3RNYXBba2V5cyArIFwiOlwiICsgYWN0aW9uXSh7fSwga2V5cyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIHVuYmluZHMgYW4gZXZlbnQgdG8gQ29tYm9rZXlzXG4gKlxuICogdGhlIHVuYmluZGluZyBzZXRzIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGtleSBjb21ib1xuICogdG8gYW4gZW1wdHkgZnVuY3Rpb24gYW5kIGRlbGV0ZXMgdGhlIGNvcnJlc3BvbmRpbmcga2V5IGluIHRoZVxuICogZGlyZWN0TWFwIGRpY3QuXG4gKlxuICogVE9ETzogYWN0dWFsbHkgcmVtb3ZlIHRoaXMgZnJvbSB0aGUgY2FsbGJhY2tzIGRpY3Rpb25hcnkgaW5zdGVhZFxuICogb2YgYmluZGluZyBhbiBlbXB0eSBmdW5jdGlvblxuICpcbiAqIHRoZSBrZXljb21ibythY3Rpb24gaGFzIHRvIGJlIGV4YWN0bHkgdGhlIHNhbWUgYXNcbiAqIGl0IHdhcyBkZWZpbmVkIGluIHRoZSBiaW5kIG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfEFycmF5fSBrZXlzXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5cywgYWN0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYuYmluZChrZXlzLCBmdW5jdGlvbigpIHt9LCBhY3Rpb24pO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuaW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24oY29tYm9rZXlzKSB7XG4gICAgICAgIGNvbWJva2V5cy5yZXNldCgpO1xuICAgIH0pO1xufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogY3Jvc3MgYnJvd3NlciBhZGQgZXZlbnQgbWV0aG9kXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fEhUTUxEb2N1bWVudH0gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIGlmIChvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgb2JqZWN0LmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGNhbGxiYWNrKTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIHRha2VzIHRoZSBldmVudCBhbmQgcmV0dXJucyB0aGUga2V5IGNoYXJhY3RlclxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBTUEVDSUFMX0tFWVNfTUFQLFxuICAgICAgICBTUEVDSUFMX0NIQVJBQ1RFUlNfTUFQO1xuICAgIFNQRUNJQUxfS0VZU19NQVAgPSByZXF1aXJlKFwiLi9zcGVjaWFsLWtleXMtbWFwXCIpO1xuICAgIFNQRUNJQUxfQ0hBUkFDVEVSU19NQVAgPSByZXF1aXJlKFwiLi9zcGVjaWFsLWNoYXJhY3RlcnMtbWFwXCIpO1xuXG5cbiAgICAvLyBmb3Iga2V5cHJlc3MgZXZlbnRzIHdlIHNob3VsZCByZXR1cm4gdGhlIGNoYXJhY3RlciBhcyBpc1xuICAgIGlmIChlLnR5cGUgPT09IFwia2V5cHJlc3NcIikge1xuICAgICAgICB2YXIgY2hhcmFjdGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZShlLndoaWNoKTtcblxuICAgICAgICAvLyBpZiB0aGUgc2hpZnQga2V5IGlzIG5vdCBwcmVzc2VkIHRoZW4gaXQgaXMgc2FmZSB0byBhc3N1bWVcbiAgICAgICAgLy8gdGhhdCB3ZSB3YW50IHRoZSBjaGFyYWN0ZXIgdG8gYmUgbG93ZXJjYXNlLiAgdGhpcyBtZWFucyBpZlxuICAgICAgICAvLyB5b3UgYWNjaWRlbnRhbGx5IGhhdmUgY2FwcyBsb2NrIG9uIHRoZW4geW91ciBrZXkgYmluZGluZ3NcbiAgICAgICAgLy8gd2lsbCBjb250aW51ZSB0byB3b3JrXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHRoZSBvbmx5IHNpZGUgZWZmZWN0IHRoYXQgbWlnaHQgbm90IGJlIGRlc2lyZWQgaXMgaWYgeW91XG4gICAgICAgIC8vIGJpbmQgc29tZXRoaW5nIGxpa2UgJ0EnIGNhdXNlIHlvdSB3YW50IHRvIHRyaWdnZXIgYW5cbiAgICAgICAgLy8gZXZlbnQgd2hlbiBjYXBpdGFsIEEgaXMgcHJlc3NlZCBjYXBzIGxvY2sgd2lsbCBubyBsb25nZXJcbiAgICAgICAgLy8gdHJpZ2dlciB0aGUgZXZlbnQuICBzaGlmdCthIHdpbGwgdGhvdWdoLlxuICAgICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGNoYXJhY3Rlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoYXJhY3RlcjtcbiAgICB9XG5cbiAgICAvLyBmb3Igbm9uIGtleXByZXNzIGV2ZW50cyB0aGUgc3BlY2lhbCBtYXBzIGFyZSBuZWVkZWRcbiAgICBpZiAoU1BFQ0lBTF9LRVlTX01BUFtlLndoaWNoXSkge1xuICAgICAgICByZXR1cm4gU1BFQ0lBTF9LRVlTX01BUFtlLndoaWNoXTtcbiAgICB9XG5cbiAgICBpZiAoU1BFQ0lBTF9DSEFSQUNURVJTX01BUFtlLndoaWNoXSkge1xuICAgICAgICByZXR1cm4gU1BFQ0lBTF9DSEFSQUNURVJTX01BUFtlLndoaWNoXTtcbiAgICB9XG5cbiAgICAvLyBpZiBpdCBpcyBub3QgaW4gdGhlIHNwZWNpYWwgbWFwXG5cbiAgICAvLyB3aXRoIGtleWRvd24gYW5kIGtleXVwIGV2ZW50cyB0aGUgY2hhcmFjdGVyIHNlZW1zIHRvIGFsd2F5c1xuICAgIC8vIGNvbWUgaW4gYXMgYW4gdXBwZXJjYXNlIGNoYXJhY3RlciB3aGV0aGVyIHlvdSBhcmUgcHJlc3Npbmcgc2hpZnRcbiAgICAvLyBvciBub3QuICB3ZSBzaG91bGQgbWFrZSBzdXJlIGl0IGlzIGFsd2F5cyBsb3dlcmNhc2UgZm9yIGNvbXBhcmlzb25zXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkudG9Mb3dlckNhc2UoKTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIHRha2VzIGEga2V5IGV2ZW50IGFuZCBmaWd1cmVzIG91dCB3aGF0IHRoZSBtb2RpZmllcnMgYXJlXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZVxuICogQHJldHVybnMge0FycmF5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIG1vZGlmaWVycyA9IFtdO1xuXG4gICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goXCJzaGlmdFwiKTtcbiAgICB9XG5cbiAgICBpZiAoZS5hbHRLZXkpIHtcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goXCJhbHRcIik7XG4gICAgfVxuXG4gICAgaWYgKGUuY3RybEtleSkge1xuICAgICAgICBtb2RpZmllcnMucHVzaChcImN0cmxcIik7XG4gICAgfVxuXG4gICAgaWYgKGUubWV0YUtleSkge1xuICAgICAgICBtb2RpZmllcnMucHVzaChcIm1ldGFcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGlmaWVycztcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIGRldGVybWluZXMgaWYgdGhlIGtleWNvZGUgc3BlY2lmaWVkIGlzIGEgbW9kaWZpZXIga2V5IG9yIG5vdFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ga2V5ID09PSBcInNoaWZ0XCIgfHwga2V5ID09PSBcImN0cmxcIiB8fCBrZXkgPT09IFwiYWx0XCIgfHwga2V5ID09PSBcIm1ldGFcIjtcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENvbnZlcnRzIGZyb20gYSBzdHJpbmcga2V5IGNvbWJpbmF0aW9uIHRvIGFuIGFycmF5XG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBjb21iaW5hdGlvbiBsaWtlIFwiY29tbWFuZCtzaGlmdCtsXCJcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb21iaW5hdGlvbikge1xuICAgIGlmIChjb21iaW5hdGlvbiA9PT0gXCIrXCIpIHtcbiAgICAgICAgcmV0dXJuIFtcIitcIl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbWJpbmF0aW9uLnNwbGl0KFwiK1wiKTtcbn07XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIHByZXZlbnRzIGRlZmF1bHQgZm9yIHRoaXMgZXZlbnRcbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBlXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcbi8qKlxuICogdGhpcyBpcyBhIG1hcHBpbmcgb2Yga2V5cyB0aGF0IHJlcXVpcmUgc2hpZnQgb24gYSBVUyBrZXlwYWRcbiAqIGJhY2sgdG8gdGhlIG5vbiBzaGlmdCBlcXVpdmVsZW50c1xuICpcbiAqIHRoaXMgaXMgc28geW91IGNhbiB1c2Uga2V5dXAgZXZlbnRzIHdpdGggdGhlc2Uga2V5c1xuICpcbiAqIG5vdGUgdGhhdCB0aGlzIHdpbGwgb25seSB3b3JrIHJlbGlhYmx5IG9uIFVTIGtleWJvYXJkc1xuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiflwiOiBcImBcIixcbiAgICBcIiFcIjogXCIxXCIsXG4gICAgXCJAXCI6IFwiMlwiLFxuICAgIFwiI1wiOiBcIjNcIixcbiAgICBcIiRcIjogXCI0XCIsXG4gICAgXCIlXCI6IFwiNVwiLFxuICAgIFwiXlwiOiBcIjZcIixcbiAgICBcIiZcIjogXCI3XCIsXG4gICAgXCIqXCI6IFwiOFwiLFxuICAgIFwiKFwiOiBcIjlcIixcbiAgICBcIilcIjogXCIwXCIsXG4gICAgXCJfXCI6IFwiLVwiLFxuICAgIFwiK1wiOiBcIj1cIixcbiAgICBcIjpcIjogXCI7XCIsXG4gICAgXCJcXFwiXCI6IFwiJ1wiLFxuICAgIFwiPFwiOiBcIixcIixcbiAgICBcIj5cIjogXCIuXCIsXG4gICAgXCI/XCI6IFwiL1wiLFxuICAgIFwifFwiOiBcIlxcXFxcIlxufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIHRoaXMgaXMgYSBsaXN0IG9mIHNwZWNpYWwgc3RyaW5ncyB5b3UgY2FuIHVzZSB0byBtYXBcbiAqIHRvIG1vZGlmaWVyIGtleXMgd2hlbiB5b3Ugc3BlY2lmeSB5b3VyIGtleWJvYXJkIHNob3J0Y3V0c1xuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwib3B0aW9uXCI6IFwiYWx0XCIsXG4gICAgXCJjb21tYW5kXCI6IFwibWV0YVwiLFxuICAgIFwicmV0dXJuXCI6IFwiZW50ZXJcIixcbiAgICBcImVzY2FwZVwiOiBcImVzY1wiLFxuICAgIFwibW9kXCI6IC9NYWN8aVBvZHxpUGhvbmV8aVBhZC8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pID8gXCJtZXRhXCIgOiBcImN0cmxcIlxufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIG1hcHBpbmcgZm9yIHNwZWNpYWwgY2hhcmFjdGVycyBzbyB0aGV5IGNhbiBzdXBwb3J0XG4gKlxuICogdGhpcyBkaWN0aW9uYXJ5IGlzIG9ubHkgdXNlZCBpbmNhc2UgeW91IHdhbnQgdG8gYmluZCBhXG4gKiBrZXl1cCBvciBrZXlkb3duIGV2ZW50IHRvIG9uZSBvZiB0aGVzZSBrZXlzXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgMTA2OiBcIipcIixcbiAgICAxMDc6IFwiK1wiLFxuICAgIDEwOTogXCItXCIsXG4gICAgMTEwOiBcIi5cIixcbiAgICAxMTE6IFwiL1wiLFxuICAgIDE4NjogXCI7XCIsXG4gICAgMTg3OiBcIj1cIixcbiAgICAxODg6IFwiLFwiLFxuICAgIDE4OTogXCItXCIsXG4gICAgMTkwOiBcIi5cIixcbiAgICAxOTE6IFwiL1wiLFxuICAgIDE5MjogXCJgXCIsXG4gICAgMjE5OiBcIltcIixcbiAgICAyMjA6IFwiXFxcXFwiLFxuICAgIDIyMTogXCJdXCIsXG4gICAgMjIyOiBcIidcIlxufTtcbiIsIi8qIGVzbGludC1lbnYgbm9kZSwgYnJvd3NlciAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIG1hcHBpbmcgb2Ygc3BlY2lhbCBrZXljb2RlcyB0byB0aGVpciBjb3JyZXNwb25kaW5nIGtleXNcbiAqXG4gKiBldmVyeXRoaW5nIGluIHRoaXMgZGljdGlvbmFyeSBjYW5ub3QgdXNlIGtleXByZXNzIGV2ZW50c1xuICogc28gaXQgaGFzIHRvIGJlIGhlcmUgdG8gbWFwIHRvIHRoZSBjb3JyZWN0IGtleWNvZGVzIGZvclxuICoga2V5dXAva2V5ZG93biBldmVudHNcbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICA4OiBcImJhY2tzcGFjZVwiLFxuICAgIDk6IFwidGFiXCIsXG4gICAgMTM6IFwiZW50ZXJcIixcbiAgICAxNjogXCJzaGlmdFwiLFxuICAgIDE3OiBcImN0cmxcIixcbiAgICAxODogXCJhbHRcIixcbiAgICAyMDogXCJjYXBzbG9ja1wiLFxuICAgIDI3OiBcImVzY1wiLFxuICAgIDMyOiBcInNwYWNlXCIsXG4gICAgMzM6IFwicGFnZXVwXCIsXG4gICAgMzQ6IFwicGFnZWRvd25cIixcbiAgICAzNTogXCJlbmRcIixcbiAgICAzNjogXCJob21lXCIsXG4gICAgMzc6IFwibGVmdFwiLFxuICAgIDM4OiBcInVwXCIsXG4gICAgMzk6IFwicmlnaHRcIixcbiAgICA0MDogXCJkb3duXCIsXG4gICAgNDU6IFwiaW5zXCIsXG4gICAgNDY6IFwiZGVsXCIsXG4gICAgOTE6IFwibWV0YVwiLFxuICAgIDkzOiBcIm1ldGFcIixcbiAgICAyMjQ6IFwibWV0YVwiXG59O1xuXG4vKipcbiAqIGxvb3AgdGhyb3VnaCB0aGUgZiBrZXlzLCBmMSB0byBmMTkgYW5kIGFkZCB0aGVtIHRvIHRoZSBtYXBcbiAqIHByb2dyYW1hdGljYWxseVxuICovXG5mb3IgKHZhciBpID0gMTsgaSA8IDIwOyArK2kpIHtcbiAgICBtb2R1bGUuZXhwb3J0c1sxMTEgKyBpXSA9IFwiZlwiICsgaTtcbn1cblxuLyoqXG4gKiBsb29wIHRocm91Z2ggdG8gbWFwIG51bWJlcnMgb24gdGhlIG51bWVyaWMga2V5cGFkXG4gKi9cbmZvciAoaSA9IDA7IGkgPD0gOTsgKytpKSB7XG4gICAgbW9kdWxlLmV4cG9ydHNbaSArIDk2XSA9IGk7XG59XG4iLCIvKiBlc2xpbnQtZW52IG5vZGUsIGJyb3dzZXIgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIHN0b3BzIHByb3BvZ2F0aW9uIGZvciB0aGlzIGV2ZW50XG4gKlxuICogQHBhcmFtIHtFdmVudH0gZVxuICogQHJldHVybnMgdm9pZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9Db21ib2tleXNcIik7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOC4wXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUZWFjdXAsIGRvY3R5cGVzLCBlbGVtZW50cywgbWVyZ2VfZWxlbWVudHMsIHRhZ05hbWUsIF9mbiwgX2ZuMSwgX2ZuMiwgX2ksIF9qLCBfaywgX2xlbiwgX2xlbjEsIF9sZW4yLCBfcmVmLCBfcmVmMSwgX3JlZjIsXG4gICAgX19zbGljZSA9IFtdLnNsaWNlLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGRvY3R5cGVzID0ge1xuICAgICdkZWZhdWx0JzogJzwhRE9DVFlQRSBodG1sPicsXG4gICAgJzUnOiAnPCFET0NUWVBFIGh0bWw+JyxcbiAgICAneG1sJzogJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cInV0Zi04XCIgPz4nLFxuICAgICd0cmFuc2l0aW9uYWwnOiAnPCFET0NUWVBFIGh0bWwgUFVCTElDIFwiLS8vVzNDLy9EVEQgWEhUTUwgMS4wIFRyYW5zaXRpb25hbC8vRU5cIiBcImh0dHA6Ly93d3cudzMub3JnL1RSL3hodG1sMS9EVEQveGh0bWwxLXRyYW5zaXRpb25hbC5kdGRcIj4nLFxuICAgICdzdHJpY3QnOiAnPCFET0NUWVBFIGh0bWwgUFVCTElDIFwiLS8vVzNDLy9EVEQgWEhUTUwgMS4wIFN0cmljdC8vRU5cIiBcImh0dHA6Ly93d3cudzMub3JnL1RSL3hodG1sMS9EVEQveGh0bWwxLXN0cmljdC5kdGRcIj4nLFxuICAgICdmcmFtZXNldCc6ICc8IURPQ1RZUEUgaHRtbCBQVUJMSUMgXCItLy9XM0MvL0RURCBYSFRNTCAxLjAgRnJhbWVzZXQvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9UUi94aHRtbDEvRFREL3hodG1sMS1mcmFtZXNldC5kdGRcIj4nLFxuICAgICcxLjEnOiAnPCFET0NUWVBFIGh0bWwgUFVCTElDIFwiLS8vVzNDLy9EVEQgWEhUTUwgMS4xLy9FTlwiIFwiaHR0cDovL3d3dy53My5vcmcvVFIveGh0bWwxMS9EVEQveGh0bWwxMS5kdGRcIj4nLFxuICAgICdiYXNpYyc6ICc8IURPQ1RZUEUgaHRtbCBQVUJMSUMgXCItLy9XM0MvL0RURCBYSFRNTCBCYXNpYyAxLjEvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9UUi94aHRtbC1iYXNpYy94aHRtbC1iYXNpYzExLmR0ZFwiPicsXG4gICAgJ21vYmlsZSc6ICc8IURPQ1RZUEUgaHRtbCBQVUJMSUMgXCItLy9XQVBGT1JVTS8vRFREIFhIVE1MIE1vYmlsZSAxLjIvL0VOXCIgXCJodHRwOi8vd3d3Lm9wZW5tb2JpbGVhbGxpYW5jZS5vcmcvdGVjaC9EVEQveGh0bWwtbW9iaWxlMTIuZHRkXCI+JyxcbiAgICAnY2UnOiAnPCFET0NUWVBFIGh0bWwgUFVCTElDIFwiLS8vVzNDLy9EVEQgWEhUTUwgMS4wIFRyYW5zaXRpb25hbC8vRU5cIiBcImNlLWh0bWwtMS4wLXRyYW5zaXRpb25hbC5kdGRcIj4nXG4gIH07XG5cbiAgZWxlbWVudHMgPSB7XG4gICAgcmVndWxhcjogJ2EgYWJiciBhZGRyZXNzIGFydGljbGUgYXNpZGUgYXVkaW8gYiBiZGkgYmRvIGJsb2NrcXVvdGUgYm9keSBidXR0b24gY2FudmFzIGNhcHRpb24gY2l0ZSBjb2RlIGNvbGdyb3VwIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXYgZGwgZHQgZW0gZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGZvcm0gaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaGdyb3VwIGh0bWwgaSBpZnJhbWUgaW5zIGtiZCBsYWJlbCBsZWdlbmQgbGkgbWFwIG1hcmsgbWVudSBtZXRlciBuYXYgbm9zY3JpcHQgb2JqZWN0IG9sIG9wdGdyb3VwIG9wdGlvbiBvdXRwdXQgcCBwcmUgcHJvZ3Jlc3MgcSBycCBydCBydWJ5IHMgc2FtcCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzcGFuIHN0cm9uZyBzdWIgc3VtbWFyeSBzdXAgdGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB1IHVsIHZpZGVvJyxcbiAgICByYXc6ICdzY3JpcHQgc3R5bGUnLFxuICAgIFwidm9pZFwiOiAnYXJlYSBiYXNlIGJyIGNvbCBjb21tYW5kIGVtYmVkIGhyIGltZyBpbnB1dCBrZXlnZW4gbGluayBtZXRhIHBhcmFtIHNvdXJjZSB0cmFjayB3YnInLFxuICAgIG9ic29sZXRlOiAnYXBwbGV0IGFjcm9ueW0gYmdzb3VuZCBkaXIgZnJhbWVzZXQgbm9mcmFtZXMgaXNpbmRleCBsaXN0aW5nIG5leHRpZCBub2VtYmVkIHBsYWludGV4dCByYiBzdHJpa2UgeG1wIGJpZyBibGluayBjZW50ZXIgZm9udCBtYXJxdWVlIG11bHRpY29sIG5vYnIgc3BhY2VyIHR0JyxcbiAgICBvYnNvbGV0ZV92b2lkOiAnYmFzZWZvbnQgZnJhbWUnXG4gIH07XG5cbiAgbWVyZ2VfZWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSwgYXJncywgZWxlbWVudCwgcmVzdWx0LCBfaSwgX2osIF9sZW4sIF9sZW4xLCBfcmVmO1xuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gYXJncy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgYSA9IGFyZ3NbX2ldO1xuICAgICAgX3JlZiA9IGVsZW1lbnRzW2FdLnNwbGl0KCcgJyk7XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICBlbGVtZW50ID0gX3JlZltfal07XG4gICAgICAgIGlmIChfX2luZGV4T2YuY2FsbChyZXN1bHQsIGVsZW1lbnQpIDwgMCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgVGVhY3VwID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFRlYWN1cCgpIHtcbiAgICAgIHRoaXMuaHRtbE91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5yZXNldEJ1ZmZlciA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgIHZhciBwcmV2aW91cztcbiAgICAgIGlmIChodG1sID09IG51bGwpIHtcbiAgICAgICAgaHRtbCA9IG51bGw7XG4gICAgICB9XG4gICAgICBwcmV2aW91cyA9IHRoaXMuaHRtbE91dDtcbiAgICAgIHRoaXMuaHRtbE91dCA9IGh0bWw7XG4gICAgICByZXR1cm4gcHJldmlvdXM7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncywgcHJldmlvdXMsIHJlc3VsdCwgdGVtcGxhdGU7XG4gICAgICB0ZW1wbGF0ZSA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBwcmV2aW91cyA9IHRoaXMucmVzZXRCdWZmZXIoJycpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGVtcGxhdGUuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLnJlc2V0QnVmZmVyKHByZXZpb3VzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUuY2VkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5yZW5kZXJhYmxlID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgIHZhciB0ZWFjdXA7XG4gICAgICB0ZWFjdXAgPSB0aGlzO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncywgcmVzdWx0O1xuICAgICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgaWYgKHRlYWN1cC5odG1sT3V0ID09PSBudWxsKSB7XG4gICAgICAgICAgdGVhY3VwLmh0bWxPdXQgPSAnJztcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGVtcGxhdGUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRlYWN1cC5yZXNldEJ1ZmZlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5yZW5kZXJBdHRyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIHZhciBrLCB2O1xuICAgICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFwiIFwiICsgbmFtZTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgaWYgKG5hbWUgPT09ICdkYXRhJyAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiAoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVzdWx0cztcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgdiA9IHZhbHVlW2tdO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0aGlzLnJlbmRlckF0dHIoXCJkYXRhLVwiICsgaywgdikpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH0pLmNhbGwodGhpcykpLmpvaW4oJycpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHZhbHVlID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiBcIiArIG5hbWUgKyBcIj1cIiArICh0aGlzLnF1b3RlKHRoaXMuZXNjYXBlKHZhbHVlLnRvU3RyaW5nKCkpKSk7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUuYXR0ck9yZGVyID0gWydpZCcsICdjbGFzcyddO1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5yZW5kZXJBdHRycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIG5hbWUsIHJlc3VsdCwgdmFsdWUsIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICBfcmVmID0gdGhpcy5hdHRyT3JkZXI7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbmFtZSA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAoIShuYW1lIGluIG9iaikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gdGhpcy5yZW5kZXJBdHRyKG5hbWUsIG9ialtuYW1lXSk7XG4gICAgICAgIGRlbGV0ZSBvYmpbbmFtZV07XG4gICAgICB9XG4gICAgICBmb3IgKG5hbWUgaW4gb2JqKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW25hbWVdO1xuICAgICAgICByZXN1bHQgKz0gdGhpcy5yZW5kZXJBdHRyKG5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUucmVuZGVyQ29udGVudHMgPSBmdW5jdGlvbihjb250ZW50cykge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGlmIChjb250ZW50cyA9PSBudWxsKSB7XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnRlbnRzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc3VsdCA9IGNvbnRlbnRzLmNhbGwodGhpcyk7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRleHQocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dChjb250ZW50cyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUuaXNTZWxlY3RvciA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgdmFyIF9yZWY7XG4gICAgICByZXR1cm4gc3RyaW5nLmxlbmd0aCA+IDEgJiYgKChfcmVmID0gc3RyaW5nLmNoYXJBdCgwKSkgPT09ICcjJyB8fCBfcmVmID09PSAnLicpO1xuICAgIH07XG5cbiAgICBUZWFjdXAucHJvdG90eXBlLnBhcnNlU2VsZWN0b3IgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIGNsYXNzZXMsIGlkLCBrbGFzcywgdG9rZW4sIF9pLCBfbGVuLCBfcmVmLCBfcmVmMTtcbiAgICAgIGlkID0gbnVsbDtcbiAgICAgIGNsYXNzZXMgPSBbXTtcbiAgICAgIF9yZWYgPSBzZWxlY3Rvci5zcGxpdCgnLicpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIHRva2VuID0gX3JlZltfaV07XG4gICAgICAgIHRva2VuID0gdG9rZW4udHJpbSgpO1xuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICBjbGFzc2VzLnB1c2godG9rZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9yZWYxID0gdG9rZW4uc3BsaXQoJyMnKSwga2xhc3MgPSBfcmVmMVswXSwgaWQgPSBfcmVmMVsxXTtcbiAgICAgICAgICBpZiAoa2xhc3MgIT09ICcnKSB7XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2godG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICBjbGFzc2VzOiBjbGFzc2VzXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBUZWFjdXAucHJvdG90eXBlLm5vcm1hbGl6ZUFyZ3MgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgYXJnLCBhdHRycywgY2xhc3NlcywgY29udGVudHMsIGlkLCBpbmRleCwgc2VsZWN0b3IsIF9pLCBfbGVuO1xuICAgICAgYXR0cnMgPSB7fTtcbiAgICAgIHNlbGVjdG9yID0gbnVsbDtcbiAgICAgIGNvbnRlbnRzID0gbnVsbDtcbiAgICAgIGZvciAoaW5kZXggPSBfaSA9IDAsIF9sZW4gPSBhcmdzLmxlbmd0aDsgX2kgPCBfbGVuOyBpbmRleCA9ICsrX2kpIHtcbiAgICAgICAgYXJnID0gYXJnc1tpbmRleF07XG4gICAgICAgIGlmIChhcmcgIT0gbnVsbCkge1xuICAgICAgICAgIHN3aXRjaCAodHlwZW9mIGFyZykge1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwICYmIHRoaXMuaXNTZWxlY3RvcihhcmcpKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSB0aGlzLnBhcnNlU2VsZWN0b3IoYXJnKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50cyA9IGFyZztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgICAgY29udGVudHMgPSBhcmc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgaWYgKGFyZy5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgYXR0cnMgPSBhcmc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGVudHMgPSBhcmc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBjb250ZW50cyA9IGFyZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzZWxlY3RvciAhPSBudWxsKSB7XG4gICAgICAgIGlkID0gc2VsZWN0b3IuaWQsIGNsYXNzZXMgPSBzZWxlY3Rvci5jbGFzc2VzO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGF0dHJzLmlkID0gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYXNzZXMgIT0gbnVsbCA/IGNsYXNzZXMubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgICAgaWYgKGF0dHJzW1wiY2xhc3NcIl0pIHtcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChhdHRyc1tcImNsYXNzXCJdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXR0cnNbXCJjbGFzc1wiXSA9IGNsYXNzZXMuam9pbignICcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgIGNvbnRlbnRzOiBjb250ZW50c1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS50YWcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBhdHRycywgY29udGVudHMsIHRhZ05hbWUsIF9yZWY7XG4gICAgICB0YWdOYW1lID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICAgIF9yZWYgPSB0aGlzLm5vcm1hbGl6ZUFyZ3MoYXJncyksIGF0dHJzID0gX3JlZi5hdHRycywgY29udGVudHMgPSBfcmVmLmNvbnRlbnRzO1xuICAgICAgdGhpcy5yYXcoXCI8XCIgKyB0YWdOYW1lICsgKHRoaXMucmVuZGVyQXR0cnMoYXR0cnMpKSArIFwiPlwiKTtcbiAgICAgIHRoaXMucmVuZGVyQ29udGVudHMoY29udGVudHMpO1xuICAgICAgcmV0dXJuIHRoaXMucmF3KFwiPC9cIiArIHRhZ05hbWUgKyBcIj5cIik7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUucmF3VGFnID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncywgYXR0cnMsIGNvbnRlbnRzLCB0YWdOYW1lLCBfcmVmO1xuICAgICAgdGFnTmFtZSA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBfcmVmID0gdGhpcy5ub3JtYWxpemVBcmdzKGFyZ3MpLCBhdHRycyA9IF9yZWYuYXR0cnMsIGNvbnRlbnRzID0gX3JlZi5jb250ZW50cztcbiAgICAgIHRoaXMucmF3KFwiPFwiICsgdGFnTmFtZSArICh0aGlzLnJlbmRlckF0dHJzKGF0dHJzKSkgKyBcIj5cIik7XG4gICAgICB0aGlzLnJhdyhjb250ZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5yYXcoXCI8L1wiICsgdGFnTmFtZSArIFwiPlwiKTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5zZWxmQ2xvc2luZ1RhZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MsIGF0dHJzLCBjb250ZW50cywgdGFnLCBfcmVmO1xuICAgICAgdGFnID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICAgIF9yZWYgPSB0aGlzLm5vcm1hbGl6ZUFyZ3MoYXJncyksIGF0dHJzID0gX3JlZi5hdHRycywgY29udGVudHMgPSBfcmVmLmNvbnRlbnRzO1xuICAgICAgaWYgKGNvbnRlbnRzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRlYWN1cDogPFwiICsgdGFnICsgXCIvPiBtdXN0IG5vdCBoYXZlIGNvbnRlbnQuICBBdHRlbXB0ZWQgdG8gbmVzdCBcIiArIGNvbnRlbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJhdyhcIjxcIiArIHRhZyArICh0aGlzLnJlbmRlckF0dHJzKGF0dHJzKSkgKyBcIiAvPlwiKTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5jb2ZmZWVzY3JpcHQgPSBmdW5jdGlvbihmbikge1xuICAgICAgcmV0dXJuIHRoaXMucmF3KFwiPHNjcmlwdCB0eXBlPVxcXCJ0ZXh0L2phdmFzY3JpcHRcXFwiPihmdW5jdGlvbigpIHtcXG4gIHZhciBfX3NsaWNlID0gW10uc2xpY2UsXFxuICAgICAgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH0sXFxuICAgICAgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXFxuICAgICAgX19leHRlbmRzID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH07XFxuICAoXCIgKyAoZm4udG9TdHJpbmcoKSkgKyBcIikoKTtcXG59KSgpOzwvc2NyaXB0PlwiKTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5jb21tZW50ID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMucmF3KFwiPCEtLVwiICsgKHRoaXMuZXNjYXBlKHRleHQpKSArIFwiLS0+XCIpO1xuICAgIH07XG5cbiAgICBUZWFjdXAucHJvdG90eXBlLmRvY3R5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBudWxsKSB7XG4gICAgICAgIHR5cGUgPSA1O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmF3KGRvY3R5cGVzW3R5cGVdKTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5pZSA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgY29udGVudHMpIHtcbiAgICAgIHRoaXMucmF3KFwiPCEtLVtpZiBcIiArICh0aGlzLmVzY2FwZShjb25kaXRpb24pKSArIFwiXT5cIik7XG4gICAgICB0aGlzLnJlbmRlckNvbnRlbnRzKGNvbnRlbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLnJhdyhcIjwhW2VuZGlmXS0tPlwiKTtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24ocykge1xuICAgICAgaWYgKHRoaXMuaHRtbE91dCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRlYWN1cDogY2FuJ3QgY2FsbCBhIHRhZyBmdW5jdGlvbiBvdXRzaWRlIGEgcmVuZGVyaW5nIGNvbnRleHRcIik7XG4gICAgICB9XG4gICAgICB0aGlzLmh0bWxPdXQgKz0gKHMgIT0gbnVsbCkgJiYgdGhpcy5lc2NhcGUocy50b1N0cmluZygpKSB8fCAnJztcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBUZWFjdXAucHJvdG90eXBlLnJhdyA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5odG1sT3V0ICs9IHM7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICByZXR1cm4gdGV4dC50b1N0cmluZygpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUucXVvdGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIFwiXFxcIlwiICsgdmFsdWUgKyBcIlxcXCJcIjtcbiAgICB9O1xuXG4gICAgVGVhY3VwLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihwbHVnaW4pIHtcbiAgICAgIHJldHVybiBwbHVnaW4odGhpcyk7XG4gICAgfTtcblxuICAgIFRlYWN1cC5wcm90b3R5cGUudGFncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJvdW5kLCBib3VuZE1ldGhvZE5hbWVzLCBtZXRob2QsIF9mbiwgX2ksIF9sZW47XG4gICAgICBib3VuZCA9IHt9O1xuICAgICAgYm91bmRNZXRob2ROYW1lcyA9IFtdLmNvbmNhdCgnY2VkZSBjb2ZmZWVzY3JpcHQgY29tbWVudCBkb2N0eXBlIGVzY2FwZSBpZSBub3JtYWxpemVBcmdzIHJhdyByZW5kZXIgcmVuZGVyYWJsZSBzY3JpcHQgdGFnIHRleHQgdXNlJy5zcGxpdCgnICcpLCBtZXJnZV9lbGVtZW50cygncmVndWxhcicsICdvYnNvbGV0ZScsICdyYXcnLCAndm9pZCcsICdvYnNvbGV0ZV92b2lkJykpO1xuICAgICAgX2ZuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICByZXR1cm4gYm91bmRbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3M7XG4gICAgICAgICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpc1ttZXRob2RdLmFwcGx5KF90aGlzLCBhcmdzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGJvdW5kTWV0aG9kTmFtZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbWV0aG9kID0gYm91bmRNZXRob2ROYW1lc1tfaV07XG4gICAgICAgIF9mbihtZXRob2QpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH07XG5cbiAgICByZXR1cm4gVGVhY3VwO1xuXG4gIH0pKCk7XG5cbiAgX3JlZiA9IG1lcmdlX2VsZW1lbnRzKCdyZWd1bGFyJywgJ29ic29sZXRlJyk7XG4gIF9mbiA9IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICByZXR1cm4gVGVhY3VwLnByb3RvdHlwZVt0YWdOYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHJldHVybiB0aGlzLnRhZy5hcHBseSh0aGlzLCBbdGFnTmFtZV0uY29uY2F0KF9fc2xpY2UuY2FsbChhcmdzKSkpO1xuICAgIH07XG4gIH07XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHRhZ05hbWUgPSBfcmVmW19pXTtcbiAgICBfZm4odGFnTmFtZSk7XG4gIH1cblxuICBfcmVmMSA9IG1lcmdlX2VsZW1lbnRzKCdyYXcnKTtcbiAgX2ZuMSA9IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICByZXR1cm4gVGVhY3VwLnByb3RvdHlwZVt0YWdOYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHJldHVybiB0aGlzLnJhd1RhZy5hcHBseSh0aGlzLCBbdGFnTmFtZV0uY29uY2F0KF9fc2xpY2UuY2FsbChhcmdzKSkpO1xuICAgIH07XG4gIH07XG4gIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYxLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgIHRhZ05hbWUgPSBfcmVmMVtfal07XG4gICAgX2ZuMSh0YWdOYW1lKTtcbiAgfVxuXG4gIF9yZWYyID0gbWVyZ2VfZWxlbWVudHMoJ3ZvaWQnLCAnb2Jzb2xldGVfdm9pZCcpO1xuICBfZm4yID0gZnVuY3Rpb24odGFnTmFtZSkge1xuICAgIHJldHVybiBUZWFjdXAucHJvdG90eXBlW3RhZ05hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncztcbiAgICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgcmV0dXJuIHRoaXMuc2VsZkNsb3NpbmdUYWcuYXBwbHkodGhpcywgW3RhZ05hbWVdLmNvbmNhdChfX3NsaWNlLmNhbGwoYXJncykpKTtcbiAgICB9O1xuICB9O1xuICBmb3IgKF9rID0gMCwgX2xlbjIgPSBfcmVmMi5sZW5ndGg7IF9rIDwgX2xlbjI7IF9rKyspIHtcbiAgICB0YWdOYW1lID0gX3JlZjJbX2tdO1xuICAgIF9mbjIodGFnTmFtZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgPyBtb2R1bGUuZXhwb3J0cyA6IHZvaWQgMCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gbmV3IFRlYWN1cCgpLnRhZ3MoKTtcbiAgICBtb2R1bGUuZXhwb3J0cy5UZWFjdXAgPSBUZWFjdXA7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd0ZWFjdXAnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFRlYWN1cCgpLnRhZ3MoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cudGVhY3VwID0gbmV3IFRlYWN1cCgpLnRhZ3MoKTtcbiAgICB3aW5kb3cudGVhY3VwLlRlYWN1cCA9IFRlYWN1cDtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcIi9Vc2Vycy9ib2JieWdyYWNlL0NvZGUvbG9yZS1vcG9zc3VtL25vZGVfbW9kdWxlcy9iYWNrYm9uZS9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzXCIpIiwiLyogWmVwdG8gdjEuMS40IC0gemVwdG8gZXZlbnQgYWpheCBmb3JtIGllIC0gemVwdG9qcy5jb20vbGljZW5zZSAqL1xuXG52YXIgWmVwdG8gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1bmRlZmluZWQsIGtleSwgJCwgY2xhc3NMaXN0LCBlbXB0eUFycmF5ID0gW10sIHNsaWNlID0gZW1wdHlBcnJheS5zbGljZSwgZmlsdGVyID0gZW1wdHlBcnJheS5maWx0ZXIsXG4gICAgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQsXG4gICAgZWxlbWVudERpc3BsYXkgPSB7fSwgY2xhc3NDYWNoZSA9IHt9LFxuICAgIGNzc051bWJlciA9IHsgJ2NvbHVtbi1jb3VudCc6IDEsICdjb2x1bW5zJzogMSwgJ2ZvbnQtd2VpZ2h0JzogMSwgJ2xpbmUtaGVpZ2h0JzogMSwnb3BhY2l0eSc6IDEsICd6LWluZGV4JzogMSwgJ3pvb20nOiAxIH0sXG4gICAgZnJhZ21lbnRSRSA9IC9eXFxzKjwoXFx3K3whKVtePl0qPi8sXG4gICAgc2luZ2xlVGFnUkUgPSAvXjwoXFx3KylcXHMqXFwvPz4oPzo8XFwvXFwxPnwpJC8sXG4gICAgdGFnRXhwYW5kZXJSRSA9IC88KD8hYXJlYXxicnxjb2x8ZW1iZWR8aHJ8aW1nfGlucHV0fGxpbmt8bWV0YXxwYXJhbSkoKFtcXHc6XSspW14+XSopXFwvPi9pZyxcbiAgICByb290Tm9kZVJFID0gL14oPzpib2R5fGh0bWwpJC9pLFxuICAgIGNhcGl0YWxSRSA9IC8oW0EtWl0pL2csXG5cbiAgICAvLyBzcGVjaWFsIGF0dHJpYnV0ZXMgdGhhdCBzaG91bGQgYmUgZ2V0L3NldCB2aWEgbWV0aG9kIGNhbGxzXG4gICAgbWV0aG9kQXR0cmlidXRlcyA9IFsndmFsJywgJ2NzcycsICdodG1sJywgJ3RleHQnLCAnZGF0YScsICd3aWR0aCcsICdoZWlnaHQnLCAnb2Zmc2V0J10sXG5cbiAgICBhZGphY2VuY3lPcGVyYXRvcnMgPSBbICdhZnRlcicsICdwcmVwZW5kJywgJ2JlZm9yZScsICdhcHBlbmQnIF0sXG4gICAgdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpLFxuICAgIHRhYmxlUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSxcbiAgICBjb250YWluZXJzID0ge1xuICAgICAgJ3RyJzogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGJvZHknKSxcbiAgICAgICd0Ym9keSc6IHRhYmxlLCAndGhlYWQnOiB0YWJsZSwgJ3Rmb290JzogdGFibGUsXG4gICAgICAndGQnOiB0YWJsZVJvdywgJ3RoJzogdGFibGVSb3csXG4gICAgICAnKic6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgfSxcbiAgICByZWFkeVJFID0gL2NvbXBsZXRlfGxvYWRlZHxpbnRlcmFjdGl2ZS8sXG4gICAgc2ltcGxlU2VsZWN0b3JSRSA9IC9eW1xcdy1dKiQvLFxuICAgIGNsYXNzMnR5cGUgPSB7fSxcbiAgICB0b1N0cmluZyA9IGNsYXNzMnR5cGUudG9TdHJpbmcsXG4gICAgemVwdG8gPSB7fSxcbiAgICBjYW1lbGl6ZSwgdW5pcSxcbiAgICB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgcHJvcE1hcCA9IHtcbiAgICAgICd0YWJpbmRleCc6ICd0YWJJbmRleCcsXG4gICAgICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAgICAgJ2Zvcic6ICdodG1sRm9yJyxcbiAgICAgICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAgICAgJ21heGxlbmd0aCc6ICdtYXhMZW5ndGgnLFxuICAgICAgJ2NlbGxzcGFjaW5nJzogJ2NlbGxTcGFjaW5nJyxcbiAgICAgICdjZWxscGFkZGluZyc6ICdjZWxsUGFkZGluZycsXG4gICAgICAncm93c3Bhbic6ICdyb3dTcGFuJyxcbiAgICAgICdjb2xzcGFuJzogJ2NvbFNwYW4nLFxuICAgICAgJ3VzZW1hcCc6ICd1c2VNYXAnLFxuICAgICAgJ2ZyYW1lYm9yZGVyJzogJ2ZyYW1lQm9yZGVyJyxcbiAgICAgICdjb250ZW50ZWRpdGFibGUnOiAnY29udGVudEVkaXRhYmxlJ1xuICAgIH0sXG4gICAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHxcbiAgICAgIGZ1bmN0aW9uKG9iamVjdCl7IHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBBcnJheSB9XG5cbiAgemVwdG8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgaWYgKCFzZWxlY3RvciB8fCAhZWxlbWVudCB8fCBlbGVtZW50Lm5vZGVUeXBlICE9PSAxKSByZXR1cm4gZmFsc2VcbiAgICB2YXIgbWF0Y2hlc1NlbGVjdG9yID0gZWxlbWVudC53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHwgZWxlbWVudC5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vTWF0Y2hlc1NlbGVjdG9yIHx8IGVsZW1lbnQubWF0Y2hlc1NlbGVjdG9yXG4gICAgaWYgKG1hdGNoZXNTZWxlY3RvcikgcmV0dXJuIG1hdGNoZXNTZWxlY3Rvci5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKVxuICAgIC8vIGZhbGwgYmFjayB0byBwZXJmb3JtaW5nIGEgc2VsZWN0b3I6XG4gICAgdmFyIG1hdGNoLCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGUsIHRlbXAgPSAhcGFyZW50XG4gICAgaWYgKHRlbXApIChwYXJlbnQgPSB0ZW1wUGFyZW50KS5hcHBlbmRDaGlsZChlbGVtZW50KVxuICAgIG1hdGNoID0gfnplcHRvLnFzYShwYXJlbnQsIHNlbGVjdG9yKS5pbmRleE9mKGVsZW1lbnQpXG4gICAgdGVtcCAmJiB0ZW1wUGFyZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpXG4gICAgcmV0dXJuIG1hdGNoXG4gIH1cblxuICBmdW5jdGlvbiB0eXBlKG9iaikge1xuICAgIHJldHVybiBvYmogPT0gbnVsbCA/IFN0cmluZyhvYmopIDpcbiAgICAgIGNsYXNzMnR5cGVbdG9TdHJpbmcuY2FsbChvYmopXSB8fCBcIm9iamVjdFwiXG4gIH1cblxuICBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB0eXBlKHZhbHVlKSA9PSBcImZ1bmN0aW9uXCIgfVxuICBmdW5jdGlvbiBpc1dpbmRvdyhvYmopICAgICB7IHJldHVybiBvYmogIT0gbnVsbCAmJiBvYmogPT0gb2JqLndpbmRvdyB9XG4gIGZ1bmN0aW9uIGlzRG9jdW1lbnQob2JqKSAgIHsgcmV0dXJuIG9iaiAhPSBudWxsICYmIG9iai5ub2RlVHlwZSA9PSBvYmouRE9DVU1FTlRfTk9ERSB9XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikgICAgIHsgcmV0dXJuIHR5cGUob2JqKSA9PSBcIm9iamVjdFwiIH1cbiAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqKSAmJiAhaXNXaW5kb3cob2JqKSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PSBPYmplY3QucHJvdG90eXBlXG4gIH1cbiAgZnVuY3Rpb24gbGlrZUFycmF5KG9iaikgeyByZXR1cm4gdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcicgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhY3QoYXJyYXkpIHsgcmV0dXJuIGZpbHRlci5jYWxsKGFycmF5LCBmdW5jdGlvbihpdGVtKXsgcmV0dXJuIGl0ZW0gIT0gbnVsbCB9KSB9XG4gIGZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpIHsgcmV0dXJuIGFycmF5Lmxlbmd0aCA+IDAgPyAkLmZuLmNvbmNhdC5hcHBseShbXSwgYXJyYXkpIDogYXJyYXkgfVxuICBjYW1lbGl6ZSA9IGZ1bmN0aW9uKHN0cil7IHJldHVybiBzdHIucmVwbGFjZSgvLSsoLik/L2csIGZ1bmN0aW9uKG1hdGNoLCBjaHIpeyByZXR1cm4gY2hyID8gY2hyLnRvVXBwZXJDYXNlKCkgOiAnJyB9KSB9XG4gIGZ1bmN0aW9uIGRhc2hlcml6ZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLzo6L2csICcvJylcbiAgICAgICAgICAgLnJlcGxhY2UoLyhbQS1aXSspKFtBLVpdW2Etel0pL2csICckMV8kMicpXG4gICAgICAgICAgIC5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCAnJDFfJDInKVxuICAgICAgICAgICAucmVwbGFjZSgvXy9nLCAnLScpXG4gICAgICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gIH1cbiAgdW5pcSA9IGZ1bmN0aW9uKGFycmF5KXsgcmV0dXJuIGZpbHRlci5jYWxsKGFycmF5LCBmdW5jdGlvbihpdGVtLCBpZHgpeyByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtKSA9PSBpZHggfSkgfVxuXG4gIGZ1bmN0aW9uIGNsYXNzUkUobmFtZSkge1xuICAgIHJldHVybiBuYW1lIGluIGNsYXNzQ2FjaGUgP1xuICAgICAgY2xhc3NDYWNoZVtuYW1lXSA6IChjbGFzc0NhY2hlW25hbWVdID0gbmV3IFJlZ0V4cCgnKF58XFxcXHMpJyArIG5hbWUgKyAnKFxcXFxzfCQpJykpXG4gIH1cblxuICBmdW5jdGlvbiBtYXliZUFkZFB4KG5hbWUsIHZhbHVlKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIiAmJiAhY3NzTnVtYmVyW2Rhc2hlcml6ZShuYW1lKV0pID8gdmFsdWUgKyBcInB4XCIgOiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZGVmYXVsdERpc3BsYXkobm9kZU5hbWUpIHtcbiAgICB2YXIgZWxlbWVudCwgZGlzcGxheVxuICAgIGlmICghZWxlbWVudERpc3BsYXlbbm9kZU5hbWVdKSB7XG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSlcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudClcbiAgICAgIGRpc3BsYXkgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsICcnKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZGlzcGxheVwiKVxuICAgICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpXG4gICAgICBkaXNwbGF5ID09IFwibm9uZVwiICYmIChkaXNwbGF5ID0gXCJibG9ja1wiKVxuICAgICAgZWxlbWVudERpc3BsYXlbbm9kZU5hbWVdID0gZGlzcGxheVxuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudERpc3BsYXlbbm9kZU5hbWVdXG4gIH1cblxuICBmdW5jdGlvbiBjaGlsZHJlbihlbGVtZW50KSB7XG4gICAgcmV0dXJuICdjaGlsZHJlbicgaW4gZWxlbWVudCA/XG4gICAgICBzbGljZS5jYWxsKGVsZW1lbnQuY2hpbGRyZW4pIDpcbiAgICAgICQubWFwKGVsZW1lbnQuY2hpbGROb2RlcywgZnVuY3Rpb24obm9kZSl7IGlmIChub2RlLm5vZGVUeXBlID09IDEpIHJldHVybiBub2RlIH0pXG4gIH1cblxuICAvLyBgJC56ZXB0by5mcmFnbWVudGAgdGFrZXMgYSBodG1sIHN0cmluZyBhbmQgYW4gb3B0aW9uYWwgdGFnIG5hbWVcbiAgLy8gdG8gZ2VuZXJhdGUgRE9NIG5vZGVzIG5vZGVzIGZyb20gdGhlIGdpdmVuIGh0bWwgc3RyaW5nLlxuICAvLyBUaGUgZ2VuZXJhdGVkIERPTSBub2RlcyBhcmUgcmV0dXJuZWQgYXMgYW4gYXJyYXkuXG4gIC8vIFRoaXMgZnVuY3Rpb24gY2FuIGJlIG92ZXJyaWRlbiBpbiBwbHVnaW5zIGZvciBleGFtcGxlIHRvIG1ha2VcbiAgLy8gaXQgY29tcGF0aWJsZSB3aXRoIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0aGUgRE9NIGZ1bGx5LlxuICB6ZXB0by5mcmFnbWVudCA9IGZ1bmN0aW9uKGh0bWwsIG5hbWUsIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZG9tLCBub2RlcywgY29udGFpbmVyXG5cbiAgICAvLyBBIHNwZWNpYWwgY2FzZSBvcHRpbWl6YXRpb24gZm9yIGEgc2luZ2xlIHRhZ1xuICAgIGlmIChzaW5nbGVUYWdSRS50ZXN0KGh0bWwpKSBkb20gPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoUmVnRXhwLiQxKSlcblxuICAgIGlmICghZG9tKSB7XG4gICAgICBpZiAoaHRtbC5yZXBsYWNlKSBodG1sID0gaHRtbC5yZXBsYWNlKHRhZ0V4cGFuZGVyUkUsIFwiPCQxPjwvJDI+XCIpXG4gICAgICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSBuYW1lID0gZnJhZ21lbnRSRS50ZXN0KGh0bWwpICYmIFJlZ0V4cC4kMVxuICAgICAgaWYgKCEobmFtZSBpbiBjb250YWluZXJzKSkgbmFtZSA9ICcqJ1xuXG4gICAgICBjb250YWluZXIgPSBjb250YWluZXJzW25hbWVdXG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJycgKyBodG1sXG4gICAgICBkb20gPSAkLmVhY2goc2xpY2UuY2FsbChjb250YWluZXIuY2hpbGROb2RlcyksIGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChwcm9wZXJ0aWVzKSkge1xuICAgICAgbm9kZXMgPSAkKGRvbSlcbiAgICAgICQuZWFjaChwcm9wZXJ0aWVzLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChtZXRob2RBdHRyaWJ1dGVzLmluZGV4T2Yoa2V5KSA+IC0xKSBub2Rlc1trZXldKHZhbHVlKVxuICAgICAgICBlbHNlIG5vZGVzLmF0dHIoa2V5LCB2YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbVxuICB9XG5cbiAgLy8gYCQuemVwdG8uWmAgc3dhcHMgb3V0IHRoZSBwcm90b3R5cGUgb2YgdGhlIGdpdmVuIGBkb21gIGFycmF5XG4gIC8vIG9mIG5vZGVzIHdpdGggYCQuZm5gIGFuZCB0aHVzIHN1cHBseWluZyBhbGwgdGhlIFplcHRvIGZ1bmN0aW9uc1xuICAvLyB0byB0aGUgYXJyYXkuIE5vdGUgdGhhdCBgX19wcm90b19fYCBpcyBub3Qgc3VwcG9ydGVkIG9uIEludGVybmV0XG4gIC8vIEV4cGxvcmVyLiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGVuIGluIHBsdWdpbnMuXG4gIHplcHRvLlogPSBmdW5jdGlvbihkb20sIHNlbGVjdG9yKSB7XG4gICAgZG9tID0gZG9tIHx8IFtdXG4gICAgZG9tLl9fcHJvdG9fXyA9ICQuZm5cbiAgICBkb20uc2VsZWN0b3IgPSBzZWxlY3RvciB8fCAnJ1xuICAgIHJldHVybiBkb21cbiAgfVxuXG4gIC8vIGAkLnplcHRvLmlzWmAgc2hvdWxkIHJldHVybiBgdHJ1ZWAgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhIFplcHRvXG4gIC8vIGNvbGxlY3Rpb24uIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZW4gaW4gcGx1Z2lucy5cbiAgemVwdG8uaXNaID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIHplcHRvLlpcbiAgfVxuXG4gIC8vIGAkLnplcHRvLmluaXRgIGlzIFplcHRvJ3MgY291bnRlcnBhcnQgdG8galF1ZXJ5J3MgYCQuZm4uaW5pdGAgYW5kXG4gIC8vIHRha2VzIGEgQ1NTIHNlbGVjdG9yIGFuZCBhbiBvcHRpb25hbCBjb250ZXh0IChhbmQgaGFuZGxlcyB2YXJpb3VzXG4gIC8vIHNwZWNpYWwgY2FzZXMpLlxuICAvLyBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGVuIGluIHBsdWdpbnMuXG4gIHplcHRvLmluaXQgPSBmdW5jdGlvbihzZWxlY3RvciwgY29udGV4dCkge1xuICAgIHZhciBkb21cbiAgICAvLyBJZiBub3RoaW5nIGdpdmVuLCByZXR1cm4gYW4gZW1wdHkgWmVwdG8gY29sbGVjdGlvblxuICAgIGlmICghc2VsZWN0b3IpIHJldHVybiB6ZXB0by5aKClcbiAgICAvLyBPcHRpbWl6ZSBmb3Igc3RyaW5nIHNlbGVjdG9yc1xuICAgIGVsc2UgaWYgKHR5cGVvZiBzZWxlY3RvciA9PSAnc3RyaW5nJykge1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci50cmltKClcbiAgICAgIC8vIElmIGl0J3MgYSBodG1sIGZyYWdtZW50LCBjcmVhdGUgbm9kZXMgZnJvbSBpdFxuICAgICAgLy8gTm90ZTogSW4gYm90aCBDaHJvbWUgMjEgYW5kIEZpcmVmb3ggMTUsIERPTSBlcnJvciAxMlxuICAgICAgLy8gaXMgdGhyb3duIGlmIHRoZSBmcmFnbWVudCBkb2Vzbid0IGJlZ2luIHdpdGggPFxuICAgICAgaWYgKHNlbGVjdG9yWzBdID09ICc8JyAmJiBmcmFnbWVudFJFLnRlc3Qoc2VsZWN0b3IpKVxuICAgICAgICBkb20gPSB6ZXB0by5mcmFnbWVudChzZWxlY3RvciwgUmVnRXhwLiQxLCBjb250ZXh0KSwgc2VsZWN0b3IgPSBudWxsXG4gICAgICAvLyBJZiB0aGVyZSdzIGEgY29udGV4dCwgY3JlYXRlIGEgY29sbGVjdGlvbiBvbiB0aGF0IGNvbnRleHQgZmlyc3QsIGFuZCBzZWxlY3RcbiAgICAgIC8vIG5vZGVzIGZyb20gdGhlcmVcbiAgICAgIGVsc2UgaWYgKGNvbnRleHQgIT09IHVuZGVmaW5lZCkgcmV0dXJuICQoY29udGV4dCkuZmluZChzZWxlY3RvcilcbiAgICAgIC8vIElmIGl0J3MgYSBDU1Mgc2VsZWN0b3IsIHVzZSBpdCB0byBzZWxlY3Qgbm9kZXMuXG4gICAgICBlbHNlIGRvbSA9IHplcHRvLnFzYShkb2N1bWVudCwgc2VsZWN0b3IpXG4gICAgfVxuICAgIC8vIElmIGEgZnVuY3Rpb24gaXMgZ2l2ZW4sIGNhbGwgaXQgd2hlbiB0aGUgRE9NIGlzIHJlYWR5XG4gICAgZWxzZSBpZiAoaXNGdW5jdGlvbihzZWxlY3RvcikpIHJldHVybiAkKGRvY3VtZW50KS5yZWFkeShzZWxlY3RvcilcbiAgICAvLyBJZiBhIFplcHRvIGNvbGxlY3Rpb24gaXMgZ2l2ZW4sIGp1c3QgcmV0dXJuIGl0XG4gICAgZWxzZSBpZiAoemVwdG8uaXNaKHNlbGVjdG9yKSkgcmV0dXJuIHNlbGVjdG9yXG4gICAgZWxzZSB7XG4gICAgICAvLyBub3JtYWxpemUgYXJyYXkgaWYgYW4gYXJyYXkgb2Ygbm9kZXMgaXMgZ2l2ZW5cbiAgICAgIGlmIChpc0FycmF5KHNlbGVjdG9yKSkgZG9tID0gY29tcGFjdChzZWxlY3RvcilcbiAgICAgIC8vIFdyYXAgRE9NIG5vZGVzLlxuICAgICAgZWxzZSBpZiAoaXNPYmplY3Qoc2VsZWN0b3IpKVxuICAgICAgICBkb20gPSBbc2VsZWN0b3JdLCBzZWxlY3RvciA9IG51bGxcbiAgICAgIC8vIElmIGl0J3MgYSBodG1sIGZyYWdtZW50LCBjcmVhdGUgbm9kZXMgZnJvbSBpdFxuICAgICAgZWxzZSBpZiAoZnJhZ21lbnRSRS50ZXN0KHNlbGVjdG9yKSlcbiAgICAgICAgZG9tID0gemVwdG8uZnJhZ21lbnQoc2VsZWN0b3IudHJpbSgpLCBSZWdFeHAuJDEsIGNvbnRleHQpLCBzZWxlY3RvciA9IG51bGxcbiAgICAgIC8vIElmIHRoZXJlJ3MgYSBjb250ZXh0LCBjcmVhdGUgYSBjb2xsZWN0aW9uIG9uIHRoYXQgY29udGV4dCBmaXJzdCwgYW5kIHNlbGVjdFxuICAgICAgLy8gbm9kZXMgZnJvbSB0aGVyZVxuICAgICAgZWxzZSBpZiAoY29udGV4dCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gJChjb250ZXh0KS5maW5kKHNlbGVjdG9yKVxuICAgICAgLy8gQW5kIGxhc3QgYnV0IG5vIGxlYXN0LCBpZiBpdCdzIGEgQ1NTIHNlbGVjdG9yLCB1c2UgaXQgdG8gc2VsZWN0IG5vZGVzLlxuICAgICAgZWxzZSBkb20gPSB6ZXB0by5xc2EoZG9jdW1lbnQsIHNlbGVjdG9yKVxuICAgIH1cbiAgICAvLyBjcmVhdGUgYSBuZXcgWmVwdG8gY29sbGVjdGlvbiBmcm9tIHRoZSBub2RlcyBmb3VuZFxuICAgIHJldHVybiB6ZXB0by5aKGRvbSwgc2VsZWN0b3IpXG4gIH1cblxuICAvLyBgJGAgd2lsbCBiZSB0aGUgYmFzZSBgWmVwdG9gIG9iamVjdC4gV2hlbiBjYWxsaW5nIHRoaXNcbiAgLy8gZnVuY3Rpb24ganVzdCBjYWxsIGAkLnplcHRvLmluaXQsIHdoaWNoIG1ha2VzIHRoZSBpbXBsZW1lbnRhdGlvblxuICAvLyBkZXRhaWxzIG9mIHNlbGVjdGluZyBub2RlcyBhbmQgY3JlYXRpbmcgWmVwdG8gY29sbGVjdGlvbnNcbiAgLy8gcGF0Y2hhYmxlIGluIHBsdWdpbnMuXG4gICQgPSBmdW5jdGlvbihzZWxlY3RvciwgY29udGV4dCl7XG4gICAgcmV0dXJuIHplcHRvLmluaXQoc2VsZWN0b3IsIGNvbnRleHQpXG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmQodGFyZ2V0LCBzb3VyY2UsIGRlZXApIHtcbiAgICBmb3IgKGtleSBpbiBzb3VyY2UpXG4gICAgICBpZiAoZGVlcCAmJiAoaXNQbGFpbk9iamVjdChzb3VyY2Vba2V5XSkgfHwgaXNBcnJheShzb3VyY2Vba2V5XSkpKSB7XG4gICAgICAgIGlmIChpc1BsYWluT2JqZWN0KHNvdXJjZVtrZXldKSAmJiAhaXNQbGFpbk9iamVjdCh0YXJnZXRba2V5XSkpXG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSB7fVxuICAgICAgICBpZiAoaXNBcnJheShzb3VyY2Vba2V5XSkgJiYgIWlzQXJyYXkodGFyZ2V0W2tleV0pKVxuICAgICAgICAgIHRhcmdldFtrZXldID0gW11cbiAgICAgICAgZXh0ZW5kKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSwgZGVlcClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHNvdXJjZVtrZXldICE9PSB1bmRlZmluZWQpIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgfVxuXG4gIC8vIENvcHkgYWxsIGJ1dCB1bmRlZmluZWQgcHJvcGVydGllcyBmcm9tIG9uZSBvciBtb3JlXG4gIC8vIG9iamVjdHMgdG8gdGhlIGB0YXJnZXRgIG9iamVjdC5cbiAgJC5leHRlbmQgPSBmdW5jdGlvbih0YXJnZXQpe1xuICAgIHZhciBkZWVwLCBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBkZWVwID0gdGFyZ2V0XG4gICAgICB0YXJnZXQgPSBhcmdzLnNoaWZ0KClcbiAgICB9XG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uKGFyZyl7IGV4dGVuZCh0YXJnZXQsIGFyZywgZGVlcCkgfSlcbiAgICByZXR1cm4gdGFyZ2V0XG4gIH1cblxuICAvLyBgJC56ZXB0by5xc2FgIGlzIFplcHRvJ3MgQ1NTIHNlbGVjdG9yIGltcGxlbWVudGF0aW9uIHdoaWNoXG4gIC8vIHVzZXMgYGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGxgIGFuZCBvcHRpbWl6ZXMgZm9yIHNvbWUgc3BlY2lhbCBjYXNlcywgbGlrZSBgI2lkYC5cbiAgLy8gVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRlbiBpbiBwbHVnaW5zLlxuICB6ZXB0by5xc2EgPSBmdW5jdGlvbihlbGVtZW50LCBzZWxlY3Rvcil7XG4gICAgdmFyIGZvdW5kLFxuICAgICAgICBtYXliZUlEID0gc2VsZWN0b3JbMF0gPT0gJyMnLFxuICAgICAgICBtYXliZUNsYXNzID0gIW1heWJlSUQgJiYgc2VsZWN0b3JbMF0gPT0gJy4nLFxuICAgICAgICBuYW1lT25seSA9IG1heWJlSUQgfHwgbWF5YmVDbGFzcyA/IHNlbGVjdG9yLnNsaWNlKDEpIDogc2VsZWN0b3IsIC8vIEVuc3VyZSB0aGF0IGEgMSBjaGFyIHRhZyBuYW1lIHN0aWxsIGdldHMgY2hlY2tlZFxuICAgICAgICBpc1NpbXBsZSA9IHNpbXBsZVNlbGVjdG9yUkUudGVzdChuYW1lT25seSlcbiAgICByZXR1cm4gKGlzRG9jdW1lbnQoZWxlbWVudCkgJiYgaXNTaW1wbGUgJiYgbWF5YmVJRCkgP1xuICAgICAgKCAoZm91bmQgPSBlbGVtZW50LmdldEVsZW1lbnRCeUlkKG5hbWVPbmx5KSkgPyBbZm91bmRdIDogW10gKSA6XG4gICAgICAoZWxlbWVudC5ub2RlVHlwZSAhPT0gMSAmJiBlbGVtZW50Lm5vZGVUeXBlICE9PSA5KSA/IFtdIDpcbiAgICAgIHNsaWNlLmNhbGwoXG4gICAgICAgIGlzU2ltcGxlICYmICFtYXliZUlEID9cbiAgICAgICAgICBtYXliZUNsYXNzID8gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKG5hbWVPbmx5KSA6IC8vIElmIGl0J3Mgc2ltcGxlLCBpdCBjb3VsZCBiZSBhIGNsYXNzXG4gICAgICAgICAgZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWxlY3RvcikgOiAvLyBPciBhIHRhZ1xuICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgLy8gT3IgaXQncyBub3Qgc2ltcGxlLCBhbmQgd2UgbmVlZCB0byBxdWVyeSBhbGxcbiAgICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbHRlcmVkKG5vZGVzLCBzZWxlY3Rvcikge1xuICAgIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gJChub2RlcykgOiAkKG5vZGVzKS5maWx0ZXIoc2VsZWN0b3IpXG4gIH1cblxuICAkLmNvbnRhaW5zID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zID9cbiAgICBmdW5jdGlvbihwYXJlbnQsIG5vZGUpIHtcbiAgICAgIHJldHVybiBwYXJlbnQgIT09IG5vZGUgJiYgcGFyZW50LmNvbnRhaW5zKG5vZGUpXG4gICAgfSA6XG4gICAgZnVuY3Rpb24ocGFyZW50LCBub2RlKSB7XG4gICAgICB3aGlsZSAobm9kZSAmJiAobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpXG4gICAgICAgIGlmIChub2RlID09PSBwYXJlbnQpIHJldHVybiB0cnVlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgZnVuY3Rpb24gZnVuY0FyZyhjb250ZXh0LCBhcmcsIGlkeCwgcGF5bG9hZCkge1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKGFyZykgPyBhcmcuY2FsbChjb250ZXh0LCBpZHgsIHBheWxvYWQpIDogYXJnXG4gIH1cblxuICBmdW5jdGlvbiBzZXRBdHRyaWJ1dGUobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9PSBudWxsID8gbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSkgOiBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSlcbiAgfVxuXG4gIC8vIGFjY2VzcyBjbGFzc05hbWUgcHJvcGVydHkgd2hpbGUgcmVzcGVjdGluZyBTVkdBbmltYXRlZFN0cmluZ1xuICBmdW5jdGlvbiBjbGFzc05hbWUobm9kZSwgdmFsdWUpe1xuICAgIHZhciBrbGFzcyA9IG5vZGUuY2xhc3NOYW1lLFxuICAgICAgICBzdmcgICA9IGtsYXNzICYmIGtsYXNzLmJhc2VWYWwgIT09IHVuZGVmaW5lZFxuXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiBzdmcgPyBrbGFzcy5iYXNlVmFsIDoga2xhc3NcbiAgICBzdmcgPyAoa2xhc3MuYmFzZVZhbCA9IHZhbHVlKSA6IChub2RlLmNsYXNzTmFtZSA9IHZhbHVlKVxuICB9XG5cbiAgLy8gXCJ0cnVlXCIgID0+IHRydWVcbiAgLy8gXCJmYWxzZVwiID0+IGZhbHNlXG4gIC8vIFwibnVsbFwiICA9PiBudWxsXG4gIC8vIFwiNDJcIiAgICA9PiA0MlxuICAvLyBcIjQyLjVcIiAgPT4gNDIuNVxuICAvLyBcIjA4XCIgICAgPT4gXCIwOFwiXG4gIC8vIEpTT04gICAgPT4gcGFyc2UgaWYgdmFsaWRcbiAgLy8gU3RyaW5nICA9PiBzZWxmXG4gIGZ1bmN0aW9uIGRlc2VyaWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICB2YXIgbnVtXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB2YWx1ZSA/XG4gICAgICAgIHZhbHVlID09IFwidHJ1ZVwiIHx8XG4gICAgICAgICggdmFsdWUgPT0gXCJmYWxzZVwiID8gZmFsc2UgOlxuICAgICAgICAgIHZhbHVlID09IFwibnVsbFwiID8gbnVsbCA6XG4gICAgICAgICAgIS9eMC8udGVzdCh2YWx1ZSkgJiYgIWlzTmFOKG51bSA9IE51bWJlcih2YWx1ZSkpID8gbnVtIDpcbiAgICAgICAgICAvXltcXFtcXHtdLy50ZXN0KHZhbHVlKSA/ICQucGFyc2VKU09OKHZhbHVlKSA6XG4gICAgICAgICAgdmFsdWUgKVxuICAgICAgICA6IHZhbHVlXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gIH1cblxuICAkLnR5cGUgPSB0eXBlXG4gICQuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb25cbiAgJC5pc1dpbmRvdyA9IGlzV2luZG93XG4gICQuaXNBcnJheSA9IGlzQXJyYXlcbiAgJC5pc1BsYWluT2JqZWN0ID0gaXNQbGFpbk9iamVjdFxuXG4gICQuaXNFbXB0eU9iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lXG4gICAgZm9yIChuYW1lIGluIG9iaikgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gICQuaW5BcnJheSA9IGZ1bmN0aW9uKGVsZW0sIGFycmF5LCBpKXtcbiAgICByZXR1cm4gZW1wdHlBcnJheS5pbmRleE9mLmNhbGwoYXJyYXksIGVsZW0sIGkpXG4gIH1cblxuICAkLmNhbWVsQ2FzZSA9IGNhbWVsaXplXG4gICQudHJpbSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIgPT0gbnVsbCA/IFwiXCIgOiBTdHJpbmcucHJvdG90eXBlLnRyaW0uY2FsbChzdHIpXG4gIH1cblxuICAvLyBwbHVnaW4gY29tcGF0aWJpbGl0eVxuICAkLnV1aWQgPSAwXG4gICQuc3VwcG9ydCA9IHsgfVxuICAkLmV4cHIgPSB7IH1cblxuICAkLm1hcCA9IGZ1bmN0aW9uKGVsZW1lbnRzLCBjYWxsYmFjayl7XG4gICAgdmFyIHZhbHVlLCB2YWx1ZXMgPSBbXSwgaSwga2V5XG4gICAgaWYgKGxpa2VBcnJheShlbGVtZW50cykpXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBjYWxsYmFjayhlbGVtZW50c1tpXSwgaSlcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHZhbHVlcy5wdXNoKHZhbHVlKVxuICAgICAgfVxuICAgIGVsc2VcbiAgICAgIGZvciAoa2V5IGluIGVsZW1lbnRzKSB7XG4gICAgICAgIHZhbHVlID0gY2FsbGJhY2soZWxlbWVudHNba2V5XSwga2V5KVxuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkgdmFsdWVzLnB1c2godmFsdWUpXG4gICAgICB9XG4gICAgcmV0dXJuIGZsYXR0ZW4odmFsdWVzKVxuICB9XG5cbiAgJC5lYWNoID0gZnVuY3Rpb24oZWxlbWVudHMsIGNhbGxiYWNrKXtcbiAgICB2YXIgaSwga2V5XG4gICAgaWYgKGxpa2VBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoZWxlbWVudHNbaV0sIGksIGVsZW1lbnRzW2ldKSA9PT0gZmFsc2UpIHJldHVybiBlbGVtZW50c1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGtleSBpbiBlbGVtZW50cylcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoZWxlbWVudHNba2V5XSwga2V5LCBlbGVtZW50c1trZXldKSA9PT0gZmFsc2UpIHJldHVybiBlbGVtZW50c1xuICAgIH1cblxuICAgIHJldHVybiBlbGVtZW50c1xuICB9XG5cbiAgJC5ncmVwID0gZnVuY3Rpb24oZWxlbWVudHMsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gZmlsdGVyLmNhbGwoZWxlbWVudHMsIGNhbGxiYWNrKVxuICB9XG5cbiAgaWYgKHdpbmRvdy5KU09OKSAkLnBhcnNlSlNPTiA9IEpTT04ucGFyc2VcblxuICAvLyBQb3B1bGF0ZSB0aGUgY2xhc3MydHlwZSBtYXBcbiAgJC5lYWNoKFwiQm9vbGVhbiBOdW1iZXIgU3RyaW5nIEZ1bmN0aW9uIEFycmF5IERhdGUgUmVnRXhwIE9iamVjdCBFcnJvclwiLnNwbGl0KFwiIFwiKSwgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgIGNsYXNzMnR5cGVbIFwiW29iamVjdCBcIiArIG5hbWUgKyBcIl1cIiBdID0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH0pXG5cbiAgLy8gRGVmaW5lIG1ldGhvZHMgdGhhdCB3aWxsIGJlIGF2YWlsYWJsZSBvbiBhbGxcbiAgLy8gWmVwdG8gY29sbGVjdGlvbnNcbiAgJC5mbiA9IHtcbiAgICAvLyBCZWNhdXNlIGEgY29sbGVjdGlvbiBhY3RzIGxpa2UgYW4gYXJyYXlcbiAgICAvLyBjb3B5IG92ZXIgdGhlc2UgdXNlZnVsIGFycmF5IGZ1bmN0aW9ucy5cbiAgICBmb3JFYWNoOiBlbXB0eUFycmF5LmZvckVhY2gsXG4gICAgcmVkdWNlOiBlbXB0eUFycmF5LnJlZHVjZSxcbiAgICBwdXNoOiBlbXB0eUFycmF5LnB1c2gsXG4gICAgc29ydDogZW1wdHlBcnJheS5zb3J0LFxuICAgIGluZGV4T2Y6IGVtcHR5QXJyYXkuaW5kZXhPZixcbiAgICBjb25jYXQ6IGVtcHR5QXJyYXkuY29uY2F0LFxuXG4gICAgLy8gYG1hcGAgYW5kIGBzbGljZWAgaW4gdGhlIGpRdWVyeSBBUEkgd29yayBkaWZmZXJlbnRseVxuICAgIC8vIGZyb20gdGhlaXIgYXJyYXkgY291bnRlcnBhcnRzXG4gICAgbWFwOiBmdW5jdGlvbihmbil7XG4gICAgICByZXR1cm4gJCgkLm1hcCh0aGlzLCBmdW5jdGlvbihlbCwgaSl7IHJldHVybiBmbi5jYWxsKGVsLCBpLCBlbCkgfSkpXG4gICAgfSxcbiAgICBzbGljZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAkKHNsaWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpXG4gICAgfSxcblxuICAgIHJlYWR5OiBmdW5jdGlvbihjYWxsYmFjayl7XG4gICAgICAvLyBuZWVkIHRvIGNoZWNrIGlmIGRvY3VtZW50LmJvZHkgZXhpc3RzIGZvciBJRSBhcyB0aGF0IGJyb3dzZXIgcmVwb3J0c1xuICAgICAgLy8gZG9jdW1lbnQgcmVhZHkgd2hlbiBpdCBoYXNuJ3QgeWV0IGNyZWF0ZWQgdGhlIGJvZHkgZWxlbWVudFxuICAgICAgaWYgKHJlYWR5UkUudGVzdChkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSBjYWxsYmFjaygkKVxuICAgICAgZWxzZSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXsgY2FsbGJhY2soJCkgfSwgZmFsc2UpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihpZHgpe1xuICAgICAgcmV0dXJuIGlkeCA9PT0gdW5kZWZpbmVkID8gc2xpY2UuY2FsbCh0aGlzKSA6IHRoaXNbaWR4ID49IDAgPyBpZHggOiBpZHggKyB0aGlzLmxlbmd0aF1cbiAgICB9LFxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLmdldCgpIH0sXG4gICAgc2l6ZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmxlbmd0aFxuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5wYXJlbnROb2RlICE9IG51bGwpXG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG4gICAgICB9KVxuICAgIH0sXG4gICAgZWFjaDogZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgICAgZW1wdHlBcnJheS5ldmVyeS5jYWxsKHRoaXMsIGZ1bmN0aW9uKGVsLCBpZHgpe1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChlbCwgaWR4LCBlbCkgIT09IGZhbHNlXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuICAgIGZpbHRlcjogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgaWYgKGlzRnVuY3Rpb24oc2VsZWN0b3IpKSByZXR1cm4gdGhpcy5ub3QodGhpcy5ub3Qoc2VsZWN0b3IpKVxuICAgICAgcmV0dXJuICQoZmlsdGVyLmNhbGwodGhpcywgZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgIHJldHVybiB6ZXB0by5tYXRjaGVzKGVsZW1lbnQsIHNlbGVjdG9yKVxuICAgICAgfSkpXG4gICAgfSxcbiAgICBhZGQ6IGZ1bmN0aW9uKHNlbGVjdG9yLGNvbnRleHQpe1xuICAgICAgcmV0dXJuICQodW5pcSh0aGlzLmNvbmNhdCgkKHNlbGVjdG9yLGNvbnRleHQpKSkpXG4gICAgfSxcbiAgICBpczogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoID4gMCAmJiB6ZXB0by5tYXRjaGVzKHRoaXNbMF0sIHNlbGVjdG9yKVxuICAgIH0sXG4gICAgbm90OiBmdW5jdGlvbihzZWxlY3Rvcil7XG4gICAgICB2YXIgbm9kZXM9W11cbiAgICAgIGlmIChpc0Z1bmN0aW9uKHNlbGVjdG9yKSAmJiBzZWxlY3Rvci5jYWxsICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpZHgpe1xuICAgICAgICAgIGlmICghc2VsZWN0b3IuY2FsbCh0aGlzLGlkeCkpIG5vZGVzLnB1c2godGhpcylcbiAgICAgICAgfSlcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZXhjbHVkZXMgPSB0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZycgPyB0aGlzLmZpbHRlcihzZWxlY3RvcikgOlxuICAgICAgICAgIChsaWtlQXJyYXkoc2VsZWN0b3IpICYmIGlzRnVuY3Rpb24oc2VsZWN0b3IuaXRlbSkpID8gc2xpY2UuY2FsbChzZWxlY3RvcikgOiAkKHNlbGVjdG9yKVxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgICAgIGlmIChleGNsdWRlcy5pbmRleE9mKGVsKSA8IDApIG5vZGVzLnB1c2goZWwpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gJChub2RlcylcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBpc09iamVjdChzZWxlY3RvcikgP1xuICAgICAgICAgICQuY29udGFpbnModGhpcywgc2VsZWN0b3IpIDpcbiAgICAgICAgICAkKHRoaXMpLmZpbmQoc2VsZWN0b3IpLnNpemUoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGVxOiBmdW5jdGlvbihpZHgpe1xuICAgICAgcmV0dXJuIGlkeCA9PT0gLTEgPyB0aGlzLnNsaWNlKGlkeCkgOiB0aGlzLnNsaWNlKGlkeCwgKyBpZHggKyAxKVxuICAgIH0sXG4gICAgZmlyc3Q6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZWwgPSB0aGlzWzBdXG4gICAgICByZXR1cm4gZWwgJiYgIWlzT2JqZWN0KGVsKSA/IGVsIDogJChlbClcbiAgICB9LFxuICAgIGxhc3Q6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZWwgPSB0aGlzW3RoaXMubGVuZ3RoIC0gMV1cbiAgICAgIHJldHVybiBlbCAmJiAhaXNPYmplY3QoZWwpID8gZWwgOiAkKGVsKVxuICAgIH0sXG4gICAgZmluZDogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgdmFyIHJlc3VsdCwgJHRoaXMgPSB0aGlzXG4gICAgICBpZiAoIXNlbGVjdG9yKSByZXN1bHQgPSBbXVxuICAgICAgZWxzZSBpZiAodHlwZW9mIHNlbGVjdG9yID09ICdvYmplY3QnKVxuICAgICAgICByZXN1bHQgPSAkKHNlbGVjdG9yKS5maWx0ZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICB2YXIgbm9kZSA9IHRoaXNcbiAgICAgICAgICByZXR1cm4gZW1wdHlBcnJheS5zb21lLmNhbGwoJHRoaXMsIGZ1bmN0aW9uKHBhcmVudCl7XG4gICAgICAgICAgICByZXR1cm4gJC5jb250YWlucyhwYXJlbnQsIG5vZGUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIGVsc2UgaWYgKHRoaXMubGVuZ3RoID09IDEpIHJlc3VsdCA9ICQoemVwdG8ucXNhKHRoaXNbMF0sIHNlbGVjdG9yKSlcbiAgICAgIGVsc2UgcmVzdWx0ID0gdGhpcy5tYXAoZnVuY3Rpb24oKXsgcmV0dXJuIHplcHRvLnFzYSh0aGlzLCBzZWxlY3RvcikgfSlcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LFxuICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uKHNlbGVjdG9yLCBjb250ZXh0KXtcbiAgICAgIHZhciBub2RlID0gdGhpc1swXSwgY29sbGVjdGlvbiA9IGZhbHNlXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09ICdvYmplY3QnKSBjb2xsZWN0aW9uID0gJChzZWxlY3RvcilcbiAgICAgIHdoaWxlIChub2RlICYmICEoY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24uaW5kZXhPZihub2RlKSA+PSAwIDogemVwdG8ubWF0Y2hlcyhub2RlLCBzZWxlY3RvcikpKVxuICAgICAgICBub2RlID0gbm9kZSAhPT0gY29udGV4dCAmJiAhaXNEb2N1bWVudChub2RlKSAmJiBub2RlLnBhcmVudE5vZGVcbiAgICAgIHJldHVybiAkKG5vZGUpXG4gICAgfSxcbiAgICBwYXJlbnRzOiBmdW5jdGlvbihzZWxlY3Rvcil7XG4gICAgICB2YXIgYW5jZXN0b3JzID0gW10sIG5vZGVzID0gdGhpc1xuICAgICAgd2hpbGUgKG5vZGVzLmxlbmd0aCA+IDApXG4gICAgICAgIG5vZGVzID0gJC5tYXAobm9kZXMsIGZ1bmN0aW9uKG5vZGUpe1xuICAgICAgICAgIGlmICgobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkgJiYgIWlzRG9jdW1lbnQobm9kZSkgJiYgYW5jZXN0b3JzLmluZGV4T2Yobm9kZSkgPCAwKSB7XG4gICAgICAgICAgICBhbmNlc3RvcnMucHVzaChub2RlKVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICByZXR1cm4gZmlsdGVyZWQoYW5jZXN0b3JzLCBzZWxlY3RvcilcbiAgICB9LFxuICAgIHBhcmVudDogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgcmV0dXJuIGZpbHRlcmVkKHVuaXEodGhpcy5wbHVjaygncGFyZW50Tm9kZScpKSwgc2VsZWN0b3IpXG4gICAgfSxcbiAgICBjaGlsZHJlbjogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgcmV0dXJuIGZpbHRlcmVkKHRoaXMubWFwKGZ1bmN0aW9uKCl7IHJldHVybiBjaGlsZHJlbih0aGlzKSB9KSwgc2VsZWN0b3IpXG4gICAgfSxcbiAgICBjb250ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKSB7IHJldHVybiBzbGljZS5jYWxsKHRoaXMuY2hpbGROb2RlcykgfSlcbiAgICB9LFxuICAgIHNpYmxpbmdzOiBmdW5jdGlvbihzZWxlY3Rvcil7XG4gICAgICByZXR1cm4gZmlsdGVyZWQodGhpcy5tYXAoZnVuY3Rpb24oaSwgZWwpe1xuICAgICAgICByZXR1cm4gZmlsdGVyLmNhbGwoY2hpbGRyZW4oZWwucGFyZW50Tm9kZSksIGZ1bmN0aW9uKGNoaWxkKXsgcmV0dXJuIGNoaWxkIT09ZWwgfSlcbiAgICAgIH0pLCBzZWxlY3RvcilcbiAgICB9LFxuICAgIGVtcHR5OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpeyB0aGlzLmlubmVySFRNTCA9ICcnIH0pXG4gICAgfSxcbiAgICAvLyBgcGx1Y2tgIGlzIGJvcnJvd2VkIGZyb20gUHJvdG90eXBlLmpzXG4gICAgcGx1Y2s6IGZ1bmN0aW9uKHByb3BlcnR5KXtcbiAgICAgIHJldHVybiAkLm1hcCh0aGlzLCBmdW5jdGlvbihlbCl7IHJldHVybiBlbFtwcm9wZXJ0eV0gfSlcbiAgICB9LFxuICAgIHNob3c6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9PSBcIm5vbmVcIiAmJiAodGhpcy5zdHlsZS5kaXNwbGF5ID0gJycpXG4gICAgICAgIGlmIChnZXRDb21wdXRlZFN0eWxlKHRoaXMsICcnKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZGlzcGxheVwiKSA9PSBcIm5vbmVcIilcbiAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBkZWZhdWx0RGlzcGxheSh0aGlzLm5vZGVOYW1lKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHJlcGxhY2VXaXRoOiBmdW5jdGlvbihuZXdDb250ZW50KXtcbiAgICAgIHJldHVybiB0aGlzLmJlZm9yZShuZXdDb250ZW50KS5yZW1vdmUoKVxuICAgIH0sXG4gICAgd3JhcDogZnVuY3Rpb24oc3RydWN0dXJlKXtcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jdGlvbihzdHJ1Y3R1cmUpXG4gICAgICBpZiAodGhpc1swXSAmJiAhZnVuYylcbiAgICAgICAgdmFyIGRvbSAgID0gJChzdHJ1Y3R1cmUpLmdldCgwKSxcbiAgICAgICAgICAgIGNsb25lID0gZG9tLnBhcmVudE5vZGUgfHwgdGhpcy5sZW5ndGggPiAxXG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaW5kZXgpe1xuICAgICAgICAkKHRoaXMpLndyYXBBbGwoXG4gICAgICAgICAgZnVuYyA/IHN0cnVjdHVyZS5jYWxsKHRoaXMsIGluZGV4KSA6XG4gICAgICAgICAgICBjbG9uZSA/IGRvbS5jbG9uZU5vZGUodHJ1ZSkgOiBkb21cbiAgICAgICAgKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHdyYXBBbGw6IGZ1bmN0aW9uKHN0cnVjdHVyZSl7XG4gICAgICBpZiAodGhpc1swXSkge1xuICAgICAgICAkKHRoaXNbMF0pLmJlZm9yZShzdHJ1Y3R1cmUgPSAkKHN0cnVjdHVyZSkpXG4gICAgICAgIHZhciBjaGlsZHJlblxuICAgICAgICAvLyBkcmlsbCBkb3duIHRvIHRoZSBpbm1vc3QgZWxlbWVudFxuICAgICAgICB3aGlsZSAoKGNoaWxkcmVuID0gc3RydWN0dXJlLmNoaWxkcmVuKCkpLmxlbmd0aCkgc3RydWN0dXJlID0gY2hpbGRyZW4uZmlyc3QoKVxuICAgICAgICAkKHN0cnVjdHVyZSkuYXBwZW5kKHRoaXMpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgd3JhcElubmVyOiBmdW5jdGlvbihzdHJ1Y3R1cmUpe1xuICAgICAgdmFyIGZ1bmMgPSBpc0Z1bmN0aW9uKHN0cnVjdHVyZSlcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaW5kZXgpe1xuICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksIGNvbnRlbnRzID0gc2VsZi5jb250ZW50cygpLFxuICAgICAgICAgICAgZG9tICA9IGZ1bmMgPyBzdHJ1Y3R1cmUuY2FsbCh0aGlzLCBpbmRleCkgOiBzdHJ1Y3R1cmVcbiAgICAgICAgY29udGVudHMubGVuZ3RoID8gY29udGVudHMud3JhcEFsbChkb20pIDogc2VsZi5hcHBlbmQoZG9tKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHVud3JhcDogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucGFyZW50KCkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAkKHRoaXMpLnJlcGxhY2VXaXRoKCQodGhpcykuY2hpbGRyZW4oKSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuY2xvbmVOb2RlKHRydWUpIH0pXG4gICAgfSxcbiAgICBoaWRlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIilcbiAgICB9LFxuICAgIHRvZ2dsZTogZnVuY3Rpb24oc2V0dGluZyl7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBlbCA9ICQodGhpcylcbiAgICAgICAgOyhzZXR0aW5nID09PSB1bmRlZmluZWQgPyBlbC5jc3MoXCJkaXNwbGF5XCIpID09IFwibm9uZVwiIDogc2V0dGluZykgPyBlbC5zaG93KCkgOiBlbC5oaWRlKClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBwcmV2OiBmdW5jdGlvbihzZWxlY3Rvcil7IHJldHVybiAkKHRoaXMucGx1Y2soJ3ByZXZpb3VzRWxlbWVudFNpYmxpbmcnKSkuZmlsdGVyKHNlbGVjdG9yIHx8ICcqJykgfSxcbiAgICBuZXh0OiBmdW5jdGlvbihzZWxlY3Rvcil7IHJldHVybiAkKHRoaXMucGx1Y2soJ25leHRFbGVtZW50U2libGluZycpKS5maWx0ZXIoc2VsZWN0b3IgfHwgJyonKSB9LFxuICAgIGh0bWw6IGZ1bmN0aW9uKGh0bWwpe1xuICAgICAgcmV0dXJuIDAgaW4gYXJndW1lbnRzID9cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGlkeCl7XG4gICAgICAgICAgdmFyIG9yaWdpbkh0bWwgPSB0aGlzLmlubmVySFRNTFxuICAgICAgICAgICQodGhpcykuZW1wdHkoKS5hcHBlbmQoIGZ1bmNBcmcodGhpcywgaHRtbCwgaWR4LCBvcmlnaW5IdG1sKSApXG4gICAgICAgIH0pIDpcbiAgICAgICAgKDAgaW4gdGhpcyA/IHRoaXNbMF0uaW5uZXJIVE1MIDogbnVsbClcbiAgICB9LFxuICAgIHRleHQ6IGZ1bmN0aW9uKHRleHQpe1xuICAgICAgcmV0dXJuIDAgaW4gYXJndW1lbnRzID9cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGlkeCl7XG4gICAgICAgICAgdmFyIG5ld1RleHQgPSBmdW5jQXJnKHRoaXMsIHRleHQsIGlkeCwgdGhpcy50ZXh0Q29udGVudClcbiAgICAgICAgICB0aGlzLnRleHRDb250ZW50ID0gbmV3VGV4dCA9PSBudWxsID8gJycgOiAnJytuZXdUZXh0XG4gICAgICAgIH0pIDpcbiAgICAgICAgKDAgaW4gdGhpcyA/IHRoaXNbMF0udGV4dENvbnRlbnQgOiBudWxsKVxuICAgIH0sXG4gICAgYXR0cjogZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xuICAgICAgdmFyIHJlc3VsdFxuICAgICAgcmV0dXJuICh0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJyAmJiAhKDEgaW4gYXJndW1lbnRzKSkgP1xuICAgICAgICAoIXRoaXMubGVuZ3RoIHx8IHRoaXNbMF0ubm9kZVR5cGUgIT09IDEgPyB1bmRlZmluZWQgOlxuICAgICAgICAgICghKHJlc3VsdCA9IHRoaXNbMF0uZ2V0QXR0cmlidXRlKG5hbWUpKSAmJiBuYW1lIGluIHRoaXNbMF0pID8gdGhpc1swXVtuYW1lXSA6IHJlc3VsdFxuICAgICAgICApIDpcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGlkeCl7XG4gICAgICAgICAgaWYgKHRoaXMubm9kZVR5cGUgIT09IDEpIHJldHVyblxuICAgICAgICAgIGlmIChpc09iamVjdChuYW1lKSkgZm9yIChrZXkgaW4gbmFtZSkgc2V0QXR0cmlidXRlKHRoaXMsIGtleSwgbmFtZVtrZXldKVxuICAgICAgICAgIGVsc2Ugc2V0QXR0cmlidXRlKHRoaXMsIG5hbWUsIGZ1bmNBcmcodGhpcywgdmFsdWUsIGlkeCwgdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSkpKVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgcmVtb3ZlQXR0cjogZnVuY3Rpb24obmFtZSl7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7IHRoaXMubm9kZVR5cGUgPT09IDEgJiYgc2V0QXR0cmlidXRlKHRoaXMsIG5hbWUpIH0pXG4gICAgfSxcbiAgICBwcm9wOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG4gICAgICBuYW1lID0gcHJvcE1hcFtuYW1lXSB8fCBuYW1lXG4gICAgICByZXR1cm4gKDEgaW4gYXJndW1lbnRzKSA/XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpZHgpe1xuICAgICAgICAgIHRoaXNbbmFtZV0gPSBmdW5jQXJnKHRoaXMsIHZhbHVlLCBpZHgsIHRoaXNbbmFtZV0pXG4gICAgICAgIH0pIDpcbiAgICAgICAgKHRoaXNbMF0gJiYgdGhpc1swXVtuYW1lXSlcbiAgICB9LFxuICAgIGRhdGE6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcbiAgICAgIHZhciBhdHRyTmFtZSA9ICdkYXRhLScgKyBuYW1lLnJlcGxhY2UoY2FwaXRhbFJFLCAnLSQxJykudG9Mb3dlckNhc2UoKVxuXG4gICAgICB2YXIgZGF0YSA9ICgxIGluIGFyZ3VtZW50cykgP1xuICAgICAgICB0aGlzLmF0dHIoYXR0ck5hbWUsIHZhbHVlKSA6XG4gICAgICAgIHRoaXMuYXR0cihhdHRyTmFtZSlcblxuICAgICAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkZXNlcmlhbGl6ZVZhbHVlKGRhdGEpIDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICB2YWw6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAwIGluIGFyZ3VtZW50cyA/XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpZHgpe1xuICAgICAgICAgIHRoaXMudmFsdWUgPSBmdW5jQXJnKHRoaXMsIHZhbHVlLCBpZHgsIHRoaXMudmFsdWUpXG4gICAgICAgIH0pIDpcbiAgICAgICAgKHRoaXNbMF0gJiYgKHRoaXNbMF0ubXVsdGlwbGUgP1xuICAgICAgICAgICAkKHRoaXNbMF0pLmZpbmQoJ29wdGlvbicpLmZpbHRlcihmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5zZWxlY3RlZCB9KS5wbHVjaygndmFsdWUnKSA6XG4gICAgICAgICAgIHRoaXNbMF0udmFsdWUpXG4gICAgICAgIClcbiAgICB9LFxuICAgIG9mZnNldDogZnVuY3Rpb24oY29vcmRpbmF0ZXMpe1xuICAgICAgaWYgKGNvb3JkaW5hdGVzKSByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGluZGV4KXtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGNvb3JkcyA9IGZ1bmNBcmcodGhpcywgY29vcmRpbmF0ZXMsIGluZGV4LCAkdGhpcy5vZmZzZXQoKSksXG4gICAgICAgICAgICBwYXJlbnRPZmZzZXQgPSAkdGhpcy5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKSxcbiAgICAgICAgICAgIHByb3BzID0ge1xuICAgICAgICAgICAgICB0b3A6ICBjb29yZHMudG9wICAtIHBhcmVudE9mZnNldC50b3AsXG4gICAgICAgICAgICAgIGxlZnQ6IGNvb3Jkcy5sZWZ0IC0gcGFyZW50T2Zmc2V0LmxlZnRcbiAgICAgICAgICAgIH1cblxuICAgICAgICBpZiAoJHRoaXMuY3NzKCdwb3NpdGlvbicpID09ICdzdGF0aWMnKSBwcm9wc1sncG9zaXRpb24nXSA9ICdyZWxhdGl2ZSdcbiAgICAgICAgJHRoaXMuY3NzKHByb3BzKVxuICAgICAgfSlcbiAgICAgIGlmICghdGhpcy5sZW5ndGgpIHJldHVybiBudWxsXG4gICAgICB2YXIgb2JqID0gdGhpc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogb2JqLmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQsXG4gICAgICAgIHRvcDogb2JqLnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgICAgd2lkdGg6IE1hdGgucm91bmQob2JqLndpZHRoKSxcbiAgICAgICAgaGVpZ2h0OiBNYXRoLnJvdW5kKG9iai5oZWlnaHQpXG4gICAgICB9XG4gICAgfSxcbiAgICBjc3M6IGZ1bmN0aW9uKHByb3BlcnR5LCB2YWx1ZSl7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzWzBdLCBjb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCAnJylcbiAgICAgICAgaWYoIWVsZW1lbnQpIHJldHVyblxuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5ID09ICdzdHJpbmcnKVxuICAgICAgICAgIHJldHVybiBlbGVtZW50LnN0eWxlW2NhbWVsaXplKHByb3BlcnR5KV0gfHwgY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KVxuICAgICAgICBlbHNlIGlmIChpc0FycmF5KHByb3BlcnR5KSkge1xuICAgICAgICAgIHZhciBwcm9wcyA9IHt9XG4gICAgICAgICAgJC5lYWNoKGlzQXJyYXkocHJvcGVydHkpID8gcHJvcGVydHk6IFtwcm9wZXJ0eV0sIGZ1bmN0aW9uKF8sIHByb3Ape1xuICAgICAgICAgICAgcHJvcHNbcHJvcF0gPSAoZWxlbWVudC5zdHlsZVtjYW1lbGl6ZShwcm9wKV0gfHwgY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIHByb3BzXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGNzcyA9ICcnXG4gICAgICBpZiAodHlwZShwcm9wZXJ0eSkgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMClcbiAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKXsgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShkYXNoZXJpemUocHJvcGVydHkpKSB9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY3NzID0gZGFzaGVyaXplKHByb3BlcnR5KSArIFwiOlwiICsgbWF5YmVBZGRQeChwcm9wZXJ0eSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGtleSBpbiBwcm9wZXJ0eSlcbiAgICAgICAgICBpZiAoIXByb3BlcnR5W2tleV0gJiYgcHJvcGVydHlba2V5XSAhPT0gMClcbiAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpeyB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KGRhc2hlcml6ZShrZXkpKSB9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNzcyArPSBkYXNoZXJpemUoa2V5KSArICc6JyArIG1heWJlQWRkUHgoa2V5LCBwcm9wZXJ0eVtrZXldKSArICc7J1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7IHRoaXMuc3R5bGUuY3NzVGV4dCArPSAnOycgKyBjc3MgfSlcbiAgICB9LFxuICAgIGluZGV4OiBmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgIHJldHVybiBlbGVtZW50ID8gdGhpcy5pbmRleE9mKCQoZWxlbWVudClbMF0pIDogdGhpcy5wYXJlbnQoKS5jaGlsZHJlbigpLmluZGV4T2YodGhpc1swXSlcbiAgICB9LFxuICAgIGhhc0NsYXNzOiBmdW5jdGlvbihuYW1lKXtcbiAgICAgIGlmICghbmFtZSkgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gZW1wdHlBcnJheS5zb21lLmNhbGwodGhpcywgZnVuY3Rpb24oZWwpe1xuICAgICAgICByZXR1cm4gdGhpcy50ZXN0KGNsYXNzTmFtZShlbCkpXG4gICAgICB9LCBjbGFzc1JFKG5hbWUpKVxuICAgIH0sXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgaWYgKCFuYW1lKSByZXR1cm4gdGhpc1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpZHgpe1xuICAgICAgICBjbGFzc0xpc3QgPSBbXVxuICAgICAgICB2YXIgY2xzID0gY2xhc3NOYW1lKHRoaXMpLCBuZXdOYW1lID0gZnVuY0FyZyh0aGlzLCBuYW1lLCBpZHgsIGNscylcbiAgICAgICAgbmV3TmFtZS5zcGxpdCgvXFxzKy9nKS5mb3JFYWNoKGZ1bmN0aW9uKGtsYXNzKXtcbiAgICAgICAgICBpZiAoISQodGhpcykuaGFzQ2xhc3Moa2xhc3MpKSBjbGFzc0xpc3QucHVzaChrbGFzcylcbiAgICAgICAgfSwgdGhpcylcbiAgICAgICAgY2xhc3NMaXN0Lmxlbmd0aCAmJiBjbGFzc05hbWUodGhpcywgY2xzICsgKGNscyA/IFwiIFwiIDogXCJcIikgKyBjbGFzc0xpc3Quam9pbihcIiBcIikpXG4gICAgICB9KVxuICAgIH0sXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpZHgpe1xuICAgICAgICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY2xhc3NOYW1lKHRoaXMsICcnKVxuICAgICAgICBjbGFzc0xpc3QgPSBjbGFzc05hbWUodGhpcylcbiAgICAgICAgZnVuY0FyZyh0aGlzLCBuYW1lLCBpZHgsIGNsYXNzTGlzdCkuc3BsaXQoL1xccysvZykuZm9yRWFjaChmdW5jdGlvbihrbGFzcyl7XG4gICAgICAgICAgY2xhc3NMaXN0ID0gY2xhc3NMaXN0LnJlcGxhY2UoY2xhc3NSRShrbGFzcyksIFwiIFwiKVxuICAgICAgICB9KVxuICAgICAgICBjbGFzc05hbWUodGhpcywgY2xhc3NMaXN0LnRyaW0oKSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24obmFtZSwgd2hlbil7XG4gICAgICBpZiAoIW5hbWUpIHJldHVybiB0aGlzXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGlkeCl7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksIG5hbWVzID0gZnVuY0FyZyh0aGlzLCBuYW1lLCBpZHgsIGNsYXNzTmFtZSh0aGlzKSlcbiAgICAgICAgbmFtZXMuc3BsaXQoL1xccysvZykuZm9yRWFjaChmdW5jdGlvbihrbGFzcyl7XG4gICAgICAgICAgKHdoZW4gPT09IHVuZGVmaW5lZCA/ICEkdGhpcy5oYXNDbGFzcyhrbGFzcykgOiB3aGVuKSA/XG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcyhrbGFzcykgOiAkdGhpcy5yZW1vdmVDbGFzcyhrbGFzcylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBzY3JvbGxUb3A6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmICghdGhpcy5sZW5ndGgpIHJldHVyblxuICAgICAgdmFyIGhhc1Njcm9sbFRvcCA9ICdzY3JvbGxUb3AnIGluIHRoaXNbMF1cbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gaGFzU2Nyb2xsVG9wID8gdGhpc1swXS5zY3JvbGxUb3AgOiB0aGlzWzBdLnBhZ2VZT2Zmc2V0XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGhhc1Njcm9sbFRvcCA/XG4gICAgICAgIGZ1bmN0aW9uKCl7IHRoaXMuc2Nyb2xsVG9wID0gdmFsdWUgfSA6XG4gICAgICAgIGZ1bmN0aW9uKCl7IHRoaXMuc2Nyb2xsVG8odGhpcy5zY3JvbGxYLCB2YWx1ZSkgfSlcbiAgICB9LFxuICAgIHNjcm9sbExlZnQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmICghdGhpcy5sZW5ndGgpIHJldHVyblxuICAgICAgdmFyIGhhc1Njcm9sbExlZnQgPSAnc2Nyb2xsTGVmdCcgaW4gdGhpc1swXVxuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiBoYXNTY3JvbGxMZWZ0ID8gdGhpc1swXS5zY3JvbGxMZWZ0IDogdGhpc1swXS5wYWdlWE9mZnNldFxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChoYXNTY3JvbGxMZWZ0ID9cbiAgICAgICAgZnVuY3Rpb24oKXsgdGhpcy5zY3JvbGxMZWZ0ID0gdmFsdWUgfSA6XG4gICAgICAgIGZ1bmN0aW9uKCl7IHRoaXMuc2Nyb2xsVG8odmFsdWUsIHRoaXMuc2Nyb2xsWSkgfSlcbiAgICB9LFxuICAgIHBvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gICAgICB2YXIgZWxlbSA9IHRoaXNbMF0sXG4gICAgICAgIC8vIEdldCAqcmVhbCogb2Zmc2V0UGFyZW50XG4gICAgICAgIG9mZnNldFBhcmVudCA9IHRoaXMub2Zmc2V0UGFyZW50KCksXG4gICAgICAgIC8vIEdldCBjb3JyZWN0IG9mZnNldHNcbiAgICAgICAgb2Zmc2V0ICAgICAgID0gdGhpcy5vZmZzZXQoKSxcbiAgICAgICAgcGFyZW50T2Zmc2V0ID0gcm9vdE5vZGVSRS50ZXN0KG9mZnNldFBhcmVudFswXS5ub2RlTmFtZSkgPyB7IHRvcDogMCwgbGVmdDogMCB9IDogb2Zmc2V0UGFyZW50Lm9mZnNldCgpXG5cbiAgICAgIC8vIFN1YnRyYWN0IGVsZW1lbnQgbWFyZ2luc1xuICAgICAgLy8gbm90ZTogd2hlbiBhbiBlbGVtZW50IGhhcyBtYXJnaW46IGF1dG8gdGhlIG9mZnNldExlZnQgYW5kIG1hcmdpbkxlZnRcbiAgICAgIC8vIGFyZSB0aGUgc2FtZSBpbiBTYWZhcmkgY2F1c2luZyBvZmZzZXQubGVmdCB0byBpbmNvcnJlY3RseSBiZSAwXG4gICAgICBvZmZzZXQudG9wICAtPSBwYXJzZUZsb2F0KCAkKGVsZW0pLmNzcygnbWFyZ2luLXRvcCcpICkgfHwgMFxuICAgICAgb2Zmc2V0LmxlZnQgLT0gcGFyc2VGbG9hdCggJChlbGVtKS5jc3MoJ21hcmdpbi1sZWZ0JykgKSB8fCAwXG5cbiAgICAgIC8vIEFkZCBvZmZzZXRQYXJlbnQgYm9yZGVyc1xuICAgICAgcGFyZW50T2Zmc2V0LnRvcCAgKz0gcGFyc2VGbG9hdCggJChvZmZzZXRQYXJlbnRbMF0pLmNzcygnYm9yZGVyLXRvcC13aWR0aCcpICkgfHwgMFxuICAgICAgcGFyZW50T2Zmc2V0LmxlZnQgKz0gcGFyc2VGbG9hdCggJChvZmZzZXRQYXJlbnRbMF0pLmNzcygnYm9yZGVyLWxlZnQtd2lkdGgnKSApIHx8IDBcblxuICAgICAgLy8gU3VidHJhY3QgdGhlIHR3byBvZmZzZXRzXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b3A6ICBvZmZzZXQudG9wICAtIHBhcmVudE9mZnNldC50b3AsXG4gICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0IC0gcGFyZW50T2Zmc2V0LmxlZnRcbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFBhcmVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMub2Zmc2V0UGFyZW50IHx8IGRvY3VtZW50LmJvZHlcbiAgICAgICAgd2hpbGUgKHBhcmVudCAmJiAhcm9vdE5vZGVSRS50ZXN0KHBhcmVudC5ub2RlTmFtZSkgJiYgJChwYXJlbnQpLmNzcyhcInBvc2l0aW9uXCIpID09IFwic3RhdGljXCIpXG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50Lm9mZnNldFBhcmVudFxuICAgICAgICByZXR1cm4gcGFyZW50XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIGZvciBub3dcbiAgJC5mbi5kZXRhY2ggPSAkLmZuLnJlbW92ZVxuXG4gIC8vIEdlbmVyYXRlIHRoZSBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBmdW5jdGlvbnNcbiAgO1snd2lkdGgnLCAnaGVpZ2h0J10uZm9yRWFjaChmdW5jdGlvbihkaW1lbnNpb24pe1xuICAgIHZhciBkaW1lbnNpb25Qcm9wZXJ0eSA9XG4gICAgICBkaW1lbnNpb24ucmVwbGFjZSgvLi8sIGZ1bmN0aW9uKG0peyByZXR1cm4gbVswXS50b1VwcGVyQ2FzZSgpIH0pXG5cbiAgICAkLmZuW2RpbWVuc2lvbl0gPSBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICB2YXIgb2Zmc2V0LCBlbCA9IHRoaXNbMF1cbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gaXNXaW5kb3coZWwpID8gZWxbJ2lubmVyJyArIGRpbWVuc2lvblByb3BlcnR5XSA6XG4gICAgICAgIGlzRG9jdW1lbnQoZWwpID8gZWwuZG9jdW1lbnRFbGVtZW50WydzY3JvbGwnICsgZGltZW5zaW9uUHJvcGVydHldIDpcbiAgICAgICAgKG9mZnNldCA9IHRoaXMub2Zmc2V0KCkpICYmIG9mZnNldFtkaW1lbnNpb25dXG4gICAgICBlbHNlIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaWR4KXtcbiAgICAgICAgZWwgPSAkKHRoaXMpXG4gICAgICAgIGVsLmNzcyhkaW1lbnNpb24sIGZ1bmNBcmcodGhpcywgdmFsdWUsIGlkeCwgZWxbZGltZW5zaW9uXSgpKSlcbiAgICAgIH0pXG4gICAgfVxuICB9KVxuXG4gIGZ1bmN0aW9uIHRyYXZlcnNlTm9kZShub2RlLCBmdW4pIHtcbiAgICBmdW4obm9kZSlcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdHJhdmVyc2VOb2RlKG5vZGUuY2hpbGROb2Rlc1tpXSwgZnVuKVxuICB9XG5cbiAgLy8gR2VuZXJhdGUgdGhlIGBhZnRlcmAsIGBwcmVwZW5kYCwgYGJlZm9yZWAsIGBhcHBlbmRgLFxuICAvLyBgaW5zZXJ0QWZ0ZXJgLCBgaW5zZXJ0QmVmb3JlYCwgYGFwcGVuZFRvYCwgYW5kIGBwcmVwZW5kVG9gIG1ldGhvZHMuXG4gIGFkamFjZW5jeU9wZXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKG9wZXJhdG9yLCBvcGVyYXRvckluZGV4KSB7XG4gICAgdmFyIGluc2lkZSA9IG9wZXJhdG9ySW5kZXggJSAyIC8vPT4gcHJlcGVuZCwgYXBwZW5kXG5cbiAgICAkLmZuW29wZXJhdG9yXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAvLyBhcmd1bWVudHMgY2FuIGJlIG5vZGVzLCBhcnJheXMgb2Ygbm9kZXMsIFplcHRvIG9iamVjdHMgYW5kIEhUTUwgc3RyaW5nc1xuICAgICAgdmFyIGFyZ1R5cGUsIG5vZGVzID0gJC5tYXAoYXJndW1lbnRzLCBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIGFyZ1R5cGUgPSB0eXBlKGFyZylcbiAgICAgICAgICAgIHJldHVybiBhcmdUeXBlID09IFwib2JqZWN0XCIgfHwgYXJnVHlwZSA9PSBcImFycmF5XCIgfHwgYXJnID09IG51bGwgP1xuICAgICAgICAgICAgICBhcmcgOiB6ZXB0by5mcmFnbWVudChhcmcpXG4gICAgICAgICAgfSksXG4gICAgICAgICAgcGFyZW50LCBjb3B5QnlDbG9uZSA9IHRoaXMubGVuZ3RoID4gMVxuICAgICAgaWYgKG5vZGVzLmxlbmd0aCA8IDEpIHJldHVybiB0aGlzXG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oXywgdGFyZ2V0KXtcbiAgICAgICAgcGFyZW50ID0gaW5zaWRlID8gdGFyZ2V0IDogdGFyZ2V0LnBhcmVudE5vZGVcblxuICAgICAgICAvLyBjb252ZXJ0IGFsbCBtZXRob2RzIHRvIGEgXCJiZWZvcmVcIiBvcGVyYXRpb25cbiAgICAgICAgdGFyZ2V0ID0gb3BlcmF0b3JJbmRleCA9PSAwID8gdGFyZ2V0Lm5leHRTaWJsaW5nIDpcbiAgICAgICAgICAgICAgICAgb3BlcmF0b3JJbmRleCA9PSAxID8gdGFyZ2V0LmZpcnN0Q2hpbGQgOlxuICAgICAgICAgICAgICAgICBvcGVyYXRvckluZGV4ID09IDIgPyB0YXJnZXQgOlxuICAgICAgICAgICAgICAgICBudWxsXG5cbiAgICAgICAgdmFyIHBhcmVudEluRG9jdW1lbnQgPSAkLmNvbnRhaW5zKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgcGFyZW50KVxuXG4gICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSl7XG4gICAgICAgICAgaWYgKGNvcHlCeUNsb25lKSBub2RlID0gbm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgICAgICBlbHNlIGlmICghcGFyZW50KSByZXR1cm4gJChub2RlKS5yZW1vdmUoKVxuXG4gICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShub2RlLCB0YXJnZXQpXG4gICAgICAgICAgaWYgKHBhcmVudEluRG9jdW1lbnQpIHRyYXZlcnNlTm9kZShub2RlLCBmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICBpZiAoZWwubm9kZU5hbWUgIT0gbnVsbCAmJiBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnU0NSSVBUJyAmJlxuICAgICAgICAgICAgICAgKCFlbC50eXBlIHx8IGVsLnR5cGUgPT09ICd0ZXh0L2phdmFzY3JpcHQnKSAmJiAhZWwuc3JjKVxuICAgICAgICAgICAgICB3aW5kb3dbJ2V2YWwnXS5jYWxsKHdpbmRvdywgZWwuaW5uZXJIVE1MKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIGFmdGVyICAgID0+IGluc2VydEFmdGVyXG4gICAgLy8gcHJlcGVuZCAgPT4gcHJlcGVuZFRvXG4gICAgLy8gYmVmb3JlICAgPT4gaW5zZXJ0QmVmb3JlXG4gICAgLy8gYXBwZW5kICAgPT4gYXBwZW5kVG9cbiAgICAkLmZuW2luc2lkZSA/IG9wZXJhdG9yKydUbycgOiAnaW5zZXJ0Jysob3BlcmF0b3JJbmRleCA/ICdCZWZvcmUnIDogJ0FmdGVyJyldID0gZnVuY3Rpb24oaHRtbCl7XG4gICAgICAkKGh0bWwpW29wZXJhdG9yXSh0aGlzKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH0pXG5cbiAgemVwdG8uWi5wcm90b3R5cGUgPSAkLmZuXG5cbiAgLy8gRXhwb3J0IGludGVybmFsIEFQSSBmdW5jdGlvbnMgaW4gdGhlIGAkLnplcHRvYCBuYW1lc3BhY2VcbiAgemVwdG8udW5pcSA9IHVuaXFcbiAgemVwdG8uZGVzZXJpYWxpemVWYWx1ZSA9IGRlc2VyaWFsaXplVmFsdWVcbiAgJC56ZXB0byA9IHplcHRvXG5cbiAgcmV0dXJuICRcbn0pKClcblxubW9kdWxlLmV4cG9ydHMgPSBaZXB0b1xuXG47KGZ1bmN0aW9uKCQpe1xuICB2YXIgX3ppZCA9IDEsIHVuZGVmaW5lZCxcbiAgICAgIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuICAgICAgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvbixcbiAgICAgIGlzU3RyaW5nID0gZnVuY3Rpb24ob2JqKXsgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ3N0cmluZycgfSxcbiAgICAgIGhhbmRsZXJzID0ge30sXG4gICAgICBzcGVjaWFsRXZlbnRzPXt9LFxuICAgICAgZm9jdXNpblN1cHBvcnRlZCA9ICdvbmZvY3VzaW4nIGluIHdpbmRvdyxcbiAgICAgIGZvY3VzID0geyBmb2N1czogJ2ZvY3VzaW4nLCBibHVyOiAnZm9jdXNvdXQnIH0sXG4gICAgICBob3ZlciA9IHsgbW91c2VlbnRlcjogJ21vdXNlb3ZlcicsIG1vdXNlbGVhdmU6ICdtb3VzZW91dCcgfVxuXG4gIHNwZWNpYWxFdmVudHMuY2xpY2sgPSBzcGVjaWFsRXZlbnRzLm1vdXNlZG93biA9IHNwZWNpYWxFdmVudHMubW91c2V1cCA9IHNwZWNpYWxFdmVudHMubW91c2Vtb3ZlID0gJ01vdXNlRXZlbnRzJ1xuXG4gIGZ1bmN0aW9uIHppZChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuX3ppZCB8fCAoZWxlbWVudC5femlkID0gX3ppZCsrKVxuICB9XG4gIGZ1bmN0aW9uIGZpbmRIYW5kbGVycyhlbGVtZW50LCBldmVudCwgZm4sIHNlbGVjdG9yKSB7XG4gICAgZXZlbnQgPSBwYXJzZShldmVudClcbiAgICBpZiAoZXZlbnQubnMpIHZhciBtYXRjaGVyID0gbWF0Y2hlckZvcihldmVudC5ucylcbiAgICByZXR1cm4gKGhhbmRsZXJzW3ppZChlbGVtZW50KV0gfHwgW10pLmZpbHRlcihmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICByZXR1cm4gaGFuZGxlclxuICAgICAgICAmJiAoIWV2ZW50LmUgIHx8IGhhbmRsZXIuZSA9PSBldmVudC5lKVxuICAgICAgICAmJiAoIWV2ZW50Lm5zIHx8IG1hdGNoZXIudGVzdChoYW5kbGVyLm5zKSlcbiAgICAgICAgJiYgKCFmbiAgICAgICB8fCB6aWQoaGFuZGxlci5mbikgPT09IHppZChmbikpXG4gICAgICAgICYmICghc2VsZWN0b3IgfHwgaGFuZGxlci5zZWwgPT0gc2VsZWN0b3IpXG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiBwYXJzZShldmVudCkge1xuICAgIHZhciBwYXJ0cyA9ICgnJyArIGV2ZW50KS5zcGxpdCgnLicpXG4gICAgcmV0dXJuIHtlOiBwYXJ0c1swXSwgbnM6IHBhcnRzLnNsaWNlKDEpLnNvcnQoKS5qb2luKCcgJyl9XG4gIH1cbiAgZnVuY3Rpb24gbWF0Y2hlckZvcihucykge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKCcoPzpefCApJyArIG5zLnJlcGxhY2UoJyAnLCAnIC4qID8nKSArICcoPzogfCQpJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50Q2FwdHVyZShoYW5kbGVyLCBjYXB0dXJlU2V0dGluZykge1xuICAgIHJldHVybiBoYW5kbGVyLmRlbCAmJlxuICAgICAgKCFmb2N1c2luU3VwcG9ydGVkICYmIChoYW5kbGVyLmUgaW4gZm9jdXMpKSB8fFxuICAgICAgISFjYXB0dXJlU2V0dGluZ1xuICB9XG5cbiAgZnVuY3Rpb24gcmVhbEV2ZW50KHR5cGUpIHtcbiAgICByZXR1cm4gaG92ZXJbdHlwZV0gfHwgKGZvY3VzaW5TdXBwb3J0ZWQgJiYgZm9jdXNbdHlwZV0pIHx8IHR5cGVcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZChlbGVtZW50LCBldmVudHMsIGZuLCBkYXRhLCBzZWxlY3RvciwgZGVsZWdhdG9yLCBjYXB0dXJlKXtcbiAgICB2YXIgaWQgPSB6aWQoZWxlbWVudCksIHNldCA9IChoYW5kbGVyc1tpZF0gfHwgKGhhbmRsZXJzW2lkXSA9IFtdKSlcbiAgICBldmVudHMuc3BsaXQoL1xccy8pLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgaWYgKGV2ZW50ID09ICdyZWFkeScpIHJldHVybiAkKGRvY3VtZW50KS5yZWFkeShmbilcbiAgICAgIHZhciBoYW5kbGVyICAgPSBwYXJzZShldmVudClcbiAgICAgIGhhbmRsZXIuZm4gICAgPSBmblxuICAgICAgaGFuZGxlci5zZWwgICA9IHNlbGVjdG9yXG4gICAgICAvLyBlbXVsYXRlIG1vdXNlZW50ZXIsIG1vdXNlbGVhdmVcbiAgICAgIGlmIChoYW5kbGVyLmUgaW4gaG92ZXIpIGZuID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciByZWxhdGVkID0gZS5yZWxhdGVkVGFyZ2V0XG4gICAgICAgIGlmICghcmVsYXRlZCB8fCAocmVsYXRlZCAhPT0gdGhpcyAmJiAhJC5jb250YWlucyh0aGlzLCByZWxhdGVkKSkpXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZXIuZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfVxuICAgICAgaGFuZGxlci5kZWwgICA9IGRlbGVnYXRvclxuICAgICAgdmFyIGNhbGxiYWNrICA9IGRlbGVnYXRvciB8fCBmblxuICAgICAgaGFuZGxlci5wcm94eSA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBlID0gY29tcGF0aWJsZShlKVxuICAgICAgICBpZiAoZS5pc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCgpKSByZXR1cm5cbiAgICAgICAgZS5kYXRhID0gZGF0YVxuICAgICAgICB2YXIgcmVzdWx0ID0gY2FsbGJhY2suYXBwbHkoZWxlbWVudCwgZS5fYXJncyA9PSB1bmRlZmluZWQgPyBbZV0gOiBbZV0uY29uY2F0KGUuX2FyZ3MpKVxuICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpLCBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH1cbiAgICAgIGhhbmRsZXIuaSA9IHNldC5sZW5ndGhcbiAgICAgIHNldC5wdXNoKGhhbmRsZXIpXG4gICAgICBpZiAoJ2FkZEV2ZW50TGlzdGVuZXInIGluIGVsZW1lbnQpXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihyZWFsRXZlbnQoaGFuZGxlci5lKSwgaGFuZGxlci5wcm94eSwgZXZlbnRDYXB0dXJlKGhhbmRsZXIsIGNhcHR1cmUpKVxuICAgIH0pXG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlKGVsZW1lbnQsIGV2ZW50cywgZm4sIHNlbGVjdG9yLCBjYXB0dXJlKXtcbiAgICB2YXIgaWQgPSB6aWQoZWxlbWVudClcbiAgICA7KGV2ZW50cyB8fCAnJykuc3BsaXQoL1xccy8pLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgZmluZEhhbmRsZXJzKGVsZW1lbnQsIGV2ZW50LCBmbiwgc2VsZWN0b3IpLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlcil7XG4gICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tpZF1baGFuZGxlci5pXVxuICAgICAgaWYgKCdyZW1vdmVFdmVudExpc3RlbmVyJyBpbiBlbGVtZW50KVxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIocmVhbEV2ZW50KGhhbmRsZXIuZSksIGhhbmRsZXIucHJveHksIGV2ZW50Q2FwdHVyZShoYW5kbGVyLCBjYXB0dXJlKSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gICQuZXZlbnQgPSB7IGFkZDogYWRkLCByZW1vdmU6IHJlbW92ZSB9XG5cbiAgJC5wcm94eSA9IGZ1bmN0aW9uKGZuLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MgPSAoMiBpbiBhcmd1bWVudHMpICYmIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKVxuICAgIGlmIChpc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgdmFyIHByb3h5Rm4gPSBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJncyA/IGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkgOiBhcmd1bWVudHMpIH1cbiAgICAgIHByb3h5Rm4uX3ppZCA9IHppZChmbilcbiAgICAgIHJldHVybiBwcm94eUZuXG4gICAgfSBlbHNlIGlmIChpc1N0cmluZyhjb250ZXh0KSkge1xuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgYXJncy51bnNoaWZ0KGZuW2NvbnRleHRdLCBmbilcbiAgICAgICAgcmV0dXJuICQucHJveHkuYXBwbHkobnVsbCwgYXJncylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkLnByb3h5KGZuW2NvbnRleHRdLCBmbilcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImV4cGVjdGVkIGZ1bmN0aW9uXCIpXG4gICAgfVxuICB9XG5cbiAgJC5mbi5iaW5kID0gZnVuY3Rpb24oZXZlbnQsIGRhdGEsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gdGhpcy5vbihldmVudCwgZGF0YSwgY2FsbGJhY2spXG4gIH1cbiAgJC5mbi51bmJpbmQgPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuICAgIHJldHVybiB0aGlzLm9mZihldmVudCwgY2FsbGJhY2spXG4gIH1cbiAgJC5mbi5vbmUgPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGRhdGEsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gdGhpcy5vbihldmVudCwgc2VsZWN0b3IsIGRhdGEsIGNhbGxiYWNrLCAxKVxuICB9XG5cbiAgdmFyIHJldHVyblRydWUgPSBmdW5jdGlvbigpe3JldHVybiB0cnVlfSxcbiAgICAgIHJldHVybkZhbHNlID0gZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9LFxuICAgICAgaWdub3JlUHJvcGVydGllcyA9IC9eKFtBLVpdfHJldHVyblZhbHVlJHxsYXllcltYWV0kKS8sXG4gICAgICBldmVudE1ldGhvZHMgPSB7XG4gICAgICAgIHByZXZlbnREZWZhdWx0OiAnaXNEZWZhdWx0UHJldmVudGVkJyxcbiAgICAgICAgc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uOiAnaXNJbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQnLFxuICAgICAgICBzdG9wUHJvcGFnYXRpb246ICdpc1Byb3BhZ2F0aW9uU3RvcHBlZCdcbiAgICAgIH1cblxuICBmdW5jdGlvbiBjb21wYXRpYmxlKGV2ZW50LCBzb3VyY2UpIHtcbiAgICBpZiAoc291cmNlIHx8ICFldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHNvdXJjZSB8fCAoc291cmNlID0gZXZlbnQpXG5cbiAgICAgICQuZWFjaChldmVudE1ldGhvZHMsIGZ1bmN0aW9uKG5hbWUsIHByZWRpY2F0ZSkge1xuICAgICAgICB2YXIgc291cmNlTWV0aG9kID0gc291cmNlW25hbWVdXG4gICAgICAgIGV2ZW50W25hbWVdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICB0aGlzW3ByZWRpY2F0ZV0gPSByZXR1cm5UcnVlXG4gICAgICAgICAgcmV0dXJuIHNvdXJjZU1ldGhvZCAmJiBzb3VyY2VNZXRob2QuYXBwbHkoc291cmNlLCBhcmd1bWVudHMpXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnRbcHJlZGljYXRlXSA9IHJldHVybkZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoc291cmNlLmRlZmF1bHRQcmV2ZW50ZWQgIT09IHVuZGVmaW5lZCA/IHNvdXJjZS5kZWZhdWx0UHJldmVudGVkIDpcbiAgICAgICAgICAncmV0dXJuVmFsdWUnIGluIHNvdXJjZSA/IHNvdXJjZS5yZXR1cm5WYWx1ZSA9PT0gZmFsc2UgOlxuICAgICAgICAgIHNvdXJjZS5nZXRQcmV2ZW50RGVmYXVsdCAmJiBzb3VyY2UuZ2V0UHJldmVudERlZmF1bHQoKSlcbiAgICAgICAgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkID0gcmV0dXJuVHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb3h5KGV2ZW50KSB7XG4gICAgdmFyIGtleSwgcHJveHkgPSB7IG9yaWdpbmFsRXZlbnQ6IGV2ZW50IH1cbiAgICBmb3IgKGtleSBpbiBldmVudClcbiAgICAgIGlmICghaWdub3JlUHJvcGVydGllcy50ZXN0KGtleSkgJiYgZXZlbnRba2V5XSAhPT0gdW5kZWZpbmVkKSBwcm94eVtrZXldID0gZXZlbnRba2V5XVxuXG4gICAgcmV0dXJuIGNvbXBhdGlibGUocHJveHksIGV2ZW50KVxuICB9XG5cbiAgJC5mbi5kZWxlZ2F0ZSA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBldmVudCwgY2FsbGJhY2spe1xuICAgIHJldHVybiB0aGlzLm9uKGV2ZW50LCBzZWxlY3RvciwgY2FsbGJhY2spXG4gIH1cbiAgJC5mbi51bmRlbGVnYXRlID0gZnVuY3Rpb24oc2VsZWN0b3IsIGV2ZW50LCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIHRoaXMub2ZmKGV2ZW50LCBzZWxlY3RvciwgY2FsbGJhY2spXG4gIH1cblxuICAkLmZuLmxpdmUgPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuICAgICQoZG9jdW1lbnQuYm9keSkuZGVsZWdhdGUodGhpcy5zZWxlY3RvciwgZXZlbnQsIGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgJC5mbi5kaWUgPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuICAgICQoZG9jdW1lbnQuYm9keSkudW5kZWxlZ2F0ZSh0aGlzLnNlbGVjdG9yLCBldmVudCwgY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gICQuZm4ub24gPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGRhdGEsIGNhbGxiYWNrLCBvbmUpe1xuICAgIHZhciBhdXRvUmVtb3ZlLCBkZWxlZ2F0b3IsICR0aGlzID0gdGhpc1xuICAgIGlmIChldmVudCAmJiAhaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICAkLmVhY2goZXZlbnQsIGZ1bmN0aW9uKHR5cGUsIGZuKXtcbiAgICAgICAgJHRoaXMub24odHlwZSwgc2VsZWN0b3IsIGRhdGEsIGZuLCBvbmUpXG4gICAgICB9KVxuICAgICAgcmV0dXJuICR0aGlzXG4gICAgfVxuXG4gICAgaWYgKCFpc1N0cmluZyhzZWxlY3RvcikgJiYgIWlzRnVuY3Rpb24oY2FsbGJhY2spICYmIGNhbGxiYWNrICE9PSBmYWxzZSlcbiAgICAgIGNhbGxiYWNrID0gZGF0YSwgZGF0YSA9IHNlbGVjdG9yLCBzZWxlY3RvciA9IHVuZGVmaW5lZFxuICAgIGlmIChpc0Z1bmN0aW9uKGRhdGEpIHx8IGRhdGEgPT09IGZhbHNlKVxuICAgICAgY2FsbGJhY2sgPSBkYXRhLCBkYXRhID0gdW5kZWZpbmVkXG5cbiAgICBpZiAoY2FsbGJhY2sgPT09IGZhbHNlKSBjYWxsYmFjayA9IHJldHVybkZhbHNlXG5cbiAgICByZXR1cm4gJHRoaXMuZWFjaChmdW5jdGlvbihfLCBlbGVtZW50KXtcbiAgICAgIGlmIChvbmUpIGF1dG9SZW1vdmUgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgcmVtb3ZlKGVsZW1lbnQsIGUudHlwZSwgY2FsbGJhY2spXG4gICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxlY3RvcikgZGVsZWdhdG9yID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciBldnQsIG1hdGNoID0gJChlLnRhcmdldCkuY2xvc2VzdChzZWxlY3RvciwgZWxlbWVudCkuZ2V0KDApXG4gICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaCAhPT0gZWxlbWVudCkge1xuICAgICAgICAgIGV2dCA9ICQuZXh0ZW5kKGNyZWF0ZVByb3h5KGUpLCB7Y3VycmVudFRhcmdldDogbWF0Y2gsIGxpdmVGaXJlZDogZWxlbWVudH0pXG4gICAgICAgICAgcmV0dXJuIChhdXRvUmVtb3ZlIHx8IGNhbGxiYWNrKS5hcHBseShtYXRjaCwgW2V2dF0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYWRkKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgZGF0YSwgc2VsZWN0b3IsIGRlbGVnYXRvciB8fCBhdXRvUmVtb3ZlKVxuICAgIH0pXG4gIH1cbiAgJC5mbi5vZmYgPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGNhbGxiYWNrKXtcbiAgICB2YXIgJHRoaXMgPSB0aGlzXG4gICAgaWYgKGV2ZW50ICYmICFpc1N0cmluZyhldmVudCkpIHtcbiAgICAgICQuZWFjaChldmVudCwgZnVuY3Rpb24odHlwZSwgZm4pe1xuICAgICAgICAkdGhpcy5vZmYodHlwZSwgc2VsZWN0b3IsIGZuKVxuICAgICAgfSlcbiAgICAgIHJldHVybiAkdGhpc1xuICAgIH1cblxuICAgIGlmICghaXNTdHJpbmcoc2VsZWN0b3IpICYmICFpc0Z1bmN0aW9uKGNhbGxiYWNrKSAmJiBjYWxsYmFjayAhPT0gZmFsc2UpXG4gICAgICBjYWxsYmFjayA9IHNlbGVjdG9yLCBzZWxlY3RvciA9IHVuZGVmaW5lZFxuXG4gICAgaWYgKGNhbGxiYWNrID09PSBmYWxzZSkgY2FsbGJhY2sgPSByZXR1cm5GYWxzZVxuXG4gICAgcmV0dXJuICR0aGlzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHJlbW92ZSh0aGlzLCBldmVudCwgY2FsbGJhY2ssIHNlbGVjdG9yKVxuICAgIH0pXG4gIH1cblxuICAkLmZuLnRyaWdnZXIgPSBmdW5jdGlvbihldmVudCwgYXJncyl7XG4gICAgZXZlbnQgPSAoaXNTdHJpbmcoZXZlbnQpIHx8ICQuaXNQbGFpbk9iamVjdChldmVudCkpID8gJC5FdmVudChldmVudCkgOiBjb21wYXRpYmxlKGV2ZW50KVxuICAgIGV2ZW50Ll9hcmdzID0gYXJnc1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIC8vIGl0ZW1zIGluIHRoZSBjb2xsZWN0aW9uIG1pZ2h0IG5vdCBiZSBET00gZWxlbWVudHNcbiAgICAgIGlmKCdkaXNwYXRjaEV2ZW50JyBpbiB0aGlzKSB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpXG4gICAgICBlbHNlICQodGhpcykudHJpZ2dlckhhbmRsZXIoZXZlbnQsIGFyZ3MpXG4gICAgfSlcbiAgfVxuXG4gIC8vIHRyaWdnZXJzIGV2ZW50IGhhbmRsZXJzIG9uIGN1cnJlbnQgZWxlbWVudCBqdXN0IGFzIGlmIGFuIGV2ZW50IG9jY3VycmVkLFxuICAvLyBkb2Vzbid0IHRyaWdnZXIgYW4gYWN0dWFsIGV2ZW50LCBkb2Vzbid0IGJ1YmJsZVxuICAkLmZuLnRyaWdnZXJIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQsIGFyZ3Mpe1xuICAgIHZhciBlLCByZXN1bHRcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgZWxlbWVudCl7XG4gICAgICBlID0gY3JlYXRlUHJveHkoaXNTdHJpbmcoZXZlbnQpID8gJC5FdmVudChldmVudCkgOiBldmVudClcbiAgICAgIGUuX2FyZ3MgPSBhcmdzXG4gICAgICBlLnRhcmdldCA9IGVsZW1lbnRcbiAgICAgICQuZWFjaChmaW5kSGFuZGxlcnMoZWxlbWVudCwgZXZlbnQudHlwZSB8fCBldmVudCksIGZ1bmN0aW9uKGksIGhhbmRsZXIpe1xuICAgICAgICByZXN1bHQgPSBoYW5kbGVyLnByb3h5KGUpXG4gICAgICAgIGlmIChlLmlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkKCkpIHJldHVybiBmYWxzZVxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8vIHNob3J0Y3V0IG1ldGhvZHMgZm9yIGAuYmluZChldmVudCwgZm4pYCBmb3IgZWFjaCBldmVudCB0eXBlXG4gIDsoJ2ZvY3VzaW4gZm9jdXNvdXQgbG9hZCByZXNpemUgc2Nyb2xsIHVubG9hZCBjbGljayBkYmxjbGljayAnK1xuICAnbW91c2Vkb3duIG1vdXNldXAgbW91c2Vtb3ZlIG1vdXNlb3ZlciBtb3VzZW91dCBtb3VzZWVudGVyIG1vdXNlbGVhdmUgJytcbiAgJ2NoYW5nZSBzZWxlY3Qga2V5ZG93biBrZXlwcmVzcyBrZXl1cCBlcnJvcicpLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICQuZm5bZXZlbnRdID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayA/XG4gICAgICAgIHRoaXMuYmluZChldmVudCwgY2FsbGJhY2spIDpcbiAgICAgICAgdGhpcy50cmlnZ2VyKGV2ZW50KVxuICAgIH1cbiAgfSlcblxuICA7Wydmb2N1cycsICdibHVyJ10uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgJC5mbltuYW1lXSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHRoaXMuYmluZChuYW1lLCBjYWxsYmFjaylcbiAgICAgIGVsc2UgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHRyeSB7IHRoaXNbbmFtZV0oKSB9XG4gICAgICAgIGNhdGNoKGUpIHt9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH0pXG5cbiAgJC5FdmVudCA9IGZ1bmN0aW9uKHR5cGUsIHByb3BzKSB7XG4gICAgaWYgKCFpc1N0cmluZyh0eXBlKSkgcHJvcHMgPSB0eXBlLCB0eXBlID0gcHJvcHMudHlwZVxuICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KHNwZWNpYWxFdmVudHNbdHlwZV0gfHwgJ0V2ZW50cycpLCBidWJibGVzID0gdHJ1ZVxuICAgIGlmIChwcm9wcykgZm9yICh2YXIgbmFtZSBpbiBwcm9wcykgKG5hbWUgPT0gJ2J1YmJsZXMnKSA/IChidWJibGVzID0gISFwcm9wc1tuYW1lXSkgOiAoZXZlbnRbbmFtZV0gPSBwcm9wc1tuYW1lXSlcbiAgICBldmVudC5pbml0RXZlbnQodHlwZSwgYnViYmxlcywgdHJ1ZSlcbiAgICByZXR1cm4gY29tcGF0aWJsZShldmVudClcbiAgfVxuXG59KShaZXB0bylcblxuOyhmdW5jdGlvbigkKXtcbiAgdmFyIGpzb25wSUQgPSAwLFxuICAgICAgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQsXG4gICAgICBrZXksXG4gICAgICBuYW1lLFxuICAgICAgcnNjcmlwdCA9IC88c2NyaXB0XFxiW148XSooPzooPyE8XFwvc2NyaXB0Pik8W148XSopKjxcXC9zY3JpcHQ+L2dpLFxuICAgICAgc2NyaXB0VHlwZVJFID0gL14oPzp0ZXh0fGFwcGxpY2F0aW9uKVxcL2phdmFzY3JpcHQvaSxcbiAgICAgIHhtbFR5cGVSRSA9IC9eKD86dGV4dHxhcHBsaWNhdGlvbilcXC94bWwvaSxcbiAgICAgIGpzb25UeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgaHRtbFR5cGUgPSAndGV4dC9odG1sJyxcbiAgICAgIGJsYW5rUkUgPSAvXlxccyokL1xuXG4gIC8vIHRyaWdnZXIgYSBjdXN0b20gZXZlbnQgYW5kIHJldHVybiBmYWxzZSBpZiBpdCB3YXMgY2FuY2VsbGVkXG4gIGZ1bmN0aW9uIHRyaWdnZXJBbmRSZXR1cm4oY29udGV4dCwgZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgdmFyIGV2ZW50ID0gJC5FdmVudChldmVudE5hbWUpXG4gICAgJChjb250ZXh0KS50cmlnZ2VyKGV2ZW50LCBkYXRhKVxuICAgIHJldHVybiAhZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKClcbiAgfVxuXG4gIC8vIHRyaWdnZXIgYW4gQWpheCBcImdsb2JhbFwiIGV2ZW50XG4gIGZ1bmN0aW9uIHRyaWdnZXJHbG9iYWwoc2V0dGluZ3MsIGNvbnRleHQsIGV2ZW50TmFtZSwgZGF0YSkge1xuICAgIGlmIChzZXR0aW5ncy5nbG9iYWwpIHJldHVybiB0cmlnZ2VyQW5kUmV0dXJuKGNvbnRleHQgfHwgZG9jdW1lbnQsIGV2ZW50TmFtZSwgZGF0YSlcbiAgfVxuXG4gIC8vIE51bWJlciBvZiBhY3RpdmUgQWpheCByZXF1ZXN0c1xuICAkLmFjdGl2ZSA9IDBcblxuICBmdW5jdGlvbiBhamF4U3RhcnQoc2V0dGluZ3MpIHtcbiAgICBpZiAoc2V0dGluZ3MuZ2xvYmFsICYmICQuYWN0aXZlKysgPT09IDApIHRyaWdnZXJHbG9iYWwoc2V0dGluZ3MsIG51bGwsICdhamF4U3RhcnQnKVxuICB9XG4gIGZ1bmN0aW9uIGFqYXhTdG9wKHNldHRpbmdzKSB7XG4gICAgaWYgKHNldHRpbmdzLmdsb2JhbCAmJiAhKC0tJC5hY3RpdmUpKSB0cmlnZ2VyR2xvYmFsKHNldHRpbmdzLCBudWxsLCAnYWpheFN0b3AnKVxuICB9XG5cbiAgLy8gdHJpZ2dlcnMgYW4gZXh0cmEgZ2xvYmFsIGV2ZW50IFwiYWpheEJlZm9yZVNlbmRcIiB0aGF0J3MgbGlrZSBcImFqYXhTZW5kXCIgYnV0IGNhbmNlbGFibGVcbiAgZnVuY3Rpb24gYWpheEJlZm9yZVNlbmQoeGhyLCBzZXR0aW5ncykge1xuICAgIHZhciBjb250ZXh0ID0gc2V0dGluZ3MuY29udGV4dFxuICAgIGlmIChzZXR0aW5ncy5iZWZvcmVTZW5kLmNhbGwoY29udGV4dCwgeGhyLCBzZXR0aW5ncykgPT09IGZhbHNlIHx8XG4gICAgICAgIHRyaWdnZXJHbG9iYWwoc2V0dGluZ3MsIGNvbnRleHQsICdhamF4QmVmb3JlU2VuZCcsIFt4aHIsIHNldHRpbmdzXSkgPT09IGZhbHNlKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICB0cmlnZ2VyR2xvYmFsKHNldHRpbmdzLCBjb250ZXh0LCAnYWpheFNlbmQnLCBbeGhyLCBzZXR0aW5nc10pXG4gIH1cbiAgZnVuY3Rpb24gYWpheFN1Y2Nlc3MoZGF0YSwgeGhyLCBzZXR0aW5ncywgZGVmZXJyZWQpIHtcbiAgICB2YXIgY29udGV4dCA9IHNldHRpbmdzLmNvbnRleHQsIHN0YXR1cyA9ICdzdWNjZXNzJ1xuICAgIHNldHRpbmdzLnN1Y2Nlc3MuY2FsbChjb250ZXh0LCBkYXRhLCBzdGF0dXMsIHhocilcbiAgICBpZiAoZGVmZXJyZWQpIGRlZmVycmVkLnJlc29sdmVXaXRoKGNvbnRleHQsIFtkYXRhLCBzdGF0dXMsIHhocl0pXG4gICAgdHJpZ2dlckdsb2JhbChzZXR0aW5ncywgY29udGV4dCwgJ2FqYXhTdWNjZXNzJywgW3hociwgc2V0dGluZ3MsIGRhdGFdKVxuICAgIGFqYXhDb21wbGV0ZShzdGF0dXMsIHhociwgc2V0dGluZ3MpXG4gIH1cbiAgLy8gdHlwZTogXCJ0aW1lb3V0XCIsIFwiZXJyb3JcIiwgXCJhYm9ydFwiLCBcInBhcnNlcmVycm9yXCJcbiAgZnVuY3Rpb24gYWpheEVycm9yKGVycm9yLCB0eXBlLCB4aHIsIHNldHRpbmdzLCBkZWZlcnJlZCkge1xuICAgIHZhciBjb250ZXh0ID0gc2V0dGluZ3MuY29udGV4dFxuICAgIHNldHRpbmdzLmVycm9yLmNhbGwoY29udGV4dCwgeGhyLCB0eXBlLCBlcnJvcilcbiAgICBpZiAoZGVmZXJyZWQpIGRlZmVycmVkLnJlamVjdFdpdGgoY29udGV4dCwgW3hociwgdHlwZSwgZXJyb3JdKVxuICAgIHRyaWdnZXJHbG9iYWwoc2V0dGluZ3MsIGNvbnRleHQsICdhamF4RXJyb3InLCBbeGhyLCBzZXR0aW5ncywgZXJyb3IgfHwgdHlwZV0pXG4gICAgYWpheENvbXBsZXRlKHR5cGUsIHhociwgc2V0dGluZ3MpXG4gIH1cbiAgLy8gc3RhdHVzOiBcInN1Y2Nlc3NcIiwgXCJub3Rtb2RpZmllZFwiLCBcImVycm9yXCIsIFwidGltZW91dFwiLCBcImFib3J0XCIsIFwicGFyc2VyZXJyb3JcIlxuICBmdW5jdGlvbiBhamF4Q29tcGxldGUoc3RhdHVzLCB4aHIsIHNldHRpbmdzKSB7XG4gICAgdmFyIGNvbnRleHQgPSBzZXR0aW5ncy5jb250ZXh0XG4gICAgc2V0dGluZ3MuY29tcGxldGUuY2FsbChjb250ZXh0LCB4aHIsIHN0YXR1cylcbiAgICB0cmlnZ2VyR2xvYmFsKHNldHRpbmdzLCBjb250ZXh0LCAnYWpheENvbXBsZXRlJywgW3hociwgc2V0dGluZ3NdKVxuICAgIGFqYXhTdG9wKHNldHRpbmdzKVxuICB9XG5cbiAgLy8gRW1wdHkgZnVuY3Rpb24sIHVzZWQgYXMgZGVmYXVsdCBjYWxsYmFja1xuICBmdW5jdGlvbiBlbXB0eSgpIHt9XG5cbiAgJC5hamF4SlNPTlAgPSBmdW5jdGlvbihvcHRpb25zLCBkZWZlcnJlZCl7XG4gICAgaWYgKCEoJ3R5cGUnIGluIG9wdGlvbnMpKSByZXR1cm4gJC5hamF4KG9wdGlvbnMpXG5cbiAgICB2YXIgX2NhbGxiYWNrTmFtZSA9IG9wdGlvbnMuanNvbnBDYWxsYmFjayxcbiAgICAgIGNhbGxiYWNrTmFtZSA9ICgkLmlzRnVuY3Rpb24oX2NhbGxiYWNrTmFtZSkgP1xuICAgICAgICBfY2FsbGJhY2tOYW1lKCkgOiBfY2FsbGJhY2tOYW1lKSB8fCAoJ2pzb25wJyArICgrK2pzb25wSUQpKSxcbiAgICAgIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLFxuICAgICAgb3JpZ2luYWxDYWxsYmFjayA9IHdpbmRvd1tjYWxsYmFja05hbWVdLFxuICAgICAgcmVzcG9uc2VEYXRhLFxuICAgICAgYWJvcnQgPSBmdW5jdGlvbihlcnJvclR5cGUpIHtcbiAgICAgICAgJChzY3JpcHQpLnRyaWdnZXJIYW5kbGVyKCdlcnJvcicsIGVycm9yVHlwZSB8fCAnYWJvcnQnKVxuICAgICAgfSxcbiAgICAgIHhociA9IHsgYWJvcnQ6IGFib3J0IH0sIGFib3J0VGltZW91dFxuXG4gICAgaWYgKGRlZmVycmVkKSBkZWZlcnJlZC5wcm9taXNlKHhocilcblxuICAgICQoc2NyaXB0KS5vbignbG9hZCBlcnJvcicsIGZ1bmN0aW9uKGUsIGVycm9yVHlwZSl7XG4gICAgICBjbGVhclRpbWVvdXQoYWJvcnRUaW1lb3V0KVxuICAgICAgJChzY3JpcHQpLm9mZigpLnJlbW92ZSgpXG5cbiAgICAgIGlmIChlLnR5cGUgPT0gJ2Vycm9yJyB8fCAhcmVzcG9uc2VEYXRhKSB7XG4gICAgICAgIGFqYXhFcnJvcihudWxsLCBlcnJvclR5cGUgfHwgJ2Vycm9yJywgeGhyLCBvcHRpb25zLCBkZWZlcnJlZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFqYXhTdWNjZXNzKHJlc3BvbnNlRGF0YVswXSwgeGhyLCBvcHRpb25zLCBkZWZlcnJlZClcbiAgICAgIH1cblxuICAgICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSBvcmlnaW5hbENhbGxiYWNrXG4gICAgICBpZiAocmVzcG9uc2VEYXRhICYmICQuaXNGdW5jdGlvbihvcmlnaW5hbENhbGxiYWNrKSlcbiAgICAgICAgb3JpZ2luYWxDYWxsYmFjayhyZXNwb25zZURhdGFbMF0pXG5cbiAgICAgIG9yaWdpbmFsQ2FsbGJhY2sgPSByZXNwb25zZURhdGEgPSB1bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaWYgKGFqYXhCZWZvcmVTZW5kKHhociwgb3B0aW9ucykgPT09IGZhbHNlKSB7XG4gICAgICBhYm9ydCgnYWJvcnQnKVxuICAgICAgcmV0dXJuIHhoclxuICAgIH1cblxuICAgIHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oKXtcbiAgICAgIHJlc3BvbnNlRGF0YSA9IGFyZ3VtZW50c1xuICAgIH1cblxuICAgIHNjcmlwdC5zcmMgPSBvcHRpb25zLnVybC5yZXBsYWNlKC9cXD8oLispPVxcPy8sICc/JDE9JyArIGNhbGxiYWNrTmFtZSlcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcblxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQgPiAwKSBhYm9ydFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBhYm9ydCgndGltZW91dCcpXG4gICAgfSwgb3B0aW9ucy50aW1lb3V0KVxuXG4gICAgcmV0dXJuIHhoclxuICB9XG5cbiAgJC5hamF4U2V0dGluZ3MgPSB7XG4gICAgLy8gRGVmYXVsdCB0eXBlIG9mIHJlcXVlc3RcbiAgICB0eXBlOiAnR0VUJyxcbiAgICAvLyBDYWxsYmFjayB0aGF0IGlzIGV4ZWN1dGVkIGJlZm9yZSByZXF1ZXN0XG4gICAgYmVmb3JlU2VuZDogZW1wdHksXG4gICAgLy8gQ2FsbGJhY2sgdGhhdCBpcyBleGVjdXRlZCBpZiB0aGUgcmVxdWVzdCBzdWNjZWVkc1xuICAgIHN1Y2Nlc3M6IGVtcHR5LFxuICAgIC8vIENhbGxiYWNrIHRoYXQgaXMgZXhlY3V0ZWQgdGhlIHRoZSBzZXJ2ZXIgZHJvcHMgZXJyb3JcbiAgICBlcnJvcjogZW1wdHksXG4gICAgLy8gQ2FsbGJhY2sgdGhhdCBpcyBleGVjdXRlZCBvbiByZXF1ZXN0IGNvbXBsZXRlIChib3RoOiBlcnJvciBhbmQgc3VjY2VzcylcbiAgICBjb21wbGV0ZTogZW1wdHksXG4gICAgLy8gVGhlIGNvbnRleHQgZm9yIHRoZSBjYWxsYmFja3NcbiAgICBjb250ZXh0OiBudWxsLFxuICAgIC8vIFdoZXRoZXIgdG8gdHJpZ2dlciBcImdsb2JhbFwiIEFqYXggZXZlbnRzXG4gICAgZ2xvYmFsOiB0cnVlLFxuICAgIC8vIFRyYW5zcG9ydFxuICAgIHhocjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICAgIH0sXG4gICAgLy8gTUlNRSB0eXBlcyBtYXBwaW5nXG4gICAgLy8gSUlTIHJldHVybnMgSmF2YXNjcmlwdCBhcyBcImFwcGxpY2F0aW9uL3gtamF2YXNjcmlwdFwiXG4gICAgYWNjZXB0czoge1xuICAgICAgc2NyaXB0OiAndGV4dC9qYXZhc2NyaXB0LCBhcHBsaWNhdGlvbi9qYXZhc2NyaXB0LCBhcHBsaWNhdGlvbi94LWphdmFzY3JpcHQnLFxuICAgICAganNvbjogICBqc29uVHlwZSxcbiAgICAgIHhtbDogICAgJ2FwcGxpY2F0aW9uL3htbCwgdGV4dC94bWwnLFxuICAgICAgaHRtbDogICBodG1sVHlwZSxcbiAgICAgIHRleHQ6ICAgJ3RleHQvcGxhaW4nXG4gICAgfSxcbiAgICAvLyBXaGV0aGVyIHRoZSByZXF1ZXN0IGlzIHRvIGFub3RoZXIgZG9tYWluXG4gICAgY3Jvc3NEb21haW46IGZhbHNlLFxuICAgIC8vIERlZmF1bHQgdGltZW91dFxuICAgIHRpbWVvdXQ6IDAsXG4gICAgLy8gV2hldGhlciBkYXRhIHNob3VsZCBiZSBzZXJpYWxpemVkIHRvIHN0cmluZ1xuICAgIHByb2Nlc3NEYXRhOiB0cnVlLFxuICAgIC8vIFdoZXRoZXIgdGhlIGJyb3dzZXIgc2hvdWxkIGJlIGFsbG93ZWQgdG8gY2FjaGUgR0VUIHJlc3BvbnNlc1xuICAgIGNhY2hlOiB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBtaW1lVG9EYXRhVHlwZShtaW1lKSB7XG4gICAgaWYgKG1pbWUpIG1pbWUgPSBtaW1lLnNwbGl0KCc7JywgMilbMF1cbiAgICByZXR1cm4gbWltZSAmJiAoIG1pbWUgPT0gaHRtbFR5cGUgPyAnaHRtbCcgOlxuICAgICAgbWltZSA9PSBqc29uVHlwZSA/ICdqc29uJyA6XG4gICAgICBzY3JpcHRUeXBlUkUudGVzdChtaW1lKSA/ICdzY3JpcHQnIDpcbiAgICAgIHhtbFR5cGVSRS50ZXN0KG1pbWUpICYmICd4bWwnICkgfHwgJ3RleHQnXG4gIH1cblxuICBmdW5jdGlvbiBhcHBlbmRRdWVyeSh1cmwsIHF1ZXJ5KSB7XG4gICAgaWYgKHF1ZXJ5ID09ICcnKSByZXR1cm4gdXJsXG4gICAgcmV0dXJuICh1cmwgKyAnJicgKyBxdWVyeSkucmVwbGFjZSgvWyY/XXsxLDJ9LywgJz8nKVxuICB9XG5cbiAgLy8gc2VyaWFsaXplIHBheWxvYWQgYW5kIGFwcGVuZCBpdCB0byB0aGUgVVJMIGZvciBHRVQgcmVxdWVzdHNcbiAgZnVuY3Rpb24gc2VyaWFsaXplRGF0YShvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMucHJvY2Vzc0RhdGEgJiYgb3B0aW9ucy5kYXRhICYmICQudHlwZShvcHRpb25zLmRhdGEpICE9IFwic3RyaW5nXCIpXG4gICAgICBvcHRpb25zLmRhdGEgPSAkLnBhcmFtKG9wdGlvbnMuZGF0YSwgb3B0aW9ucy50cmFkaXRpb25hbClcbiAgICBpZiAob3B0aW9ucy5kYXRhICYmICghb3B0aW9ucy50eXBlIHx8IG9wdGlvbnMudHlwZS50b1VwcGVyQ2FzZSgpID09ICdHRVQnKSlcbiAgICAgIG9wdGlvbnMudXJsID0gYXBwZW5kUXVlcnkob3B0aW9ucy51cmwsIG9wdGlvbnMuZGF0YSksIG9wdGlvbnMuZGF0YSA9IHVuZGVmaW5lZFxuICB9XG5cbiAgJC5hamF4ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sIG9wdGlvbnMgfHwge30pLFxuICAgICAgICBkZWZlcnJlZCA9ICQuRGVmZXJyZWQgJiYgJC5EZWZlcnJlZCgpXG4gICAgZm9yIChrZXkgaW4gJC5hamF4U2V0dGluZ3MpIGlmIChzZXR0aW5nc1trZXldID09PSB1bmRlZmluZWQpIHNldHRpbmdzW2tleV0gPSAkLmFqYXhTZXR0aW5nc1trZXldXG5cbiAgICBhamF4U3RhcnQoc2V0dGluZ3MpXG5cbiAgICBpZiAoIXNldHRpbmdzLmNyb3NzRG9tYWluKSBzZXR0aW5ncy5jcm9zc0RvbWFpbiA9IC9eKFtcXHctXSs6KT9cXC9cXC8oW15cXC9dKykvLnRlc3Qoc2V0dGluZ3MudXJsKSAmJlxuICAgICAgUmVnRXhwLiQyICE9IHdpbmRvdy5sb2NhdGlvbi5ob3N0XG5cbiAgICBpZiAoIXNldHRpbmdzLnVybCkgc2V0dGluZ3MudXJsID0gd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKClcbiAgICBzZXJpYWxpemVEYXRhKHNldHRpbmdzKVxuXG4gICAgdmFyIGRhdGFUeXBlID0gc2V0dGluZ3MuZGF0YVR5cGUsIGhhc1BsYWNlaG9sZGVyID0gL1xcPy4rPVxcPy8udGVzdChzZXR0aW5ncy51cmwpXG4gICAgaWYgKGhhc1BsYWNlaG9sZGVyKSBkYXRhVHlwZSA9ICdqc29ucCdcblxuICAgIGlmIChzZXR0aW5ncy5jYWNoZSA9PT0gZmFsc2UgfHwgKFxuICAgICAgICAgKCFvcHRpb25zIHx8IG9wdGlvbnMuY2FjaGUgIT09IHRydWUpICYmXG4gICAgICAgICAoJ3NjcmlwdCcgPT0gZGF0YVR5cGUgfHwgJ2pzb25wJyA9PSBkYXRhVHlwZSlcbiAgICAgICAgKSlcbiAgICAgIHNldHRpbmdzLnVybCA9IGFwcGVuZFF1ZXJ5KHNldHRpbmdzLnVybCwgJ189JyArIERhdGUubm93KCkpXG5cbiAgICBpZiAoJ2pzb25wJyA9PSBkYXRhVHlwZSkge1xuICAgICAgaWYgKCFoYXNQbGFjZWhvbGRlcilcbiAgICAgICAgc2V0dGluZ3MudXJsID0gYXBwZW5kUXVlcnkoc2V0dGluZ3MudXJsLFxuICAgICAgICAgIHNldHRpbmdzLmpzb25wID8gKHNldHRpbmdzLmpzb25wICsgJz0/JykgOiBzZXR0aW5ncy5qc29ucCA9PT0gZmFsc2UgPyAnJyA6ICdjYWxsYmFjaz0/JylcbiAgICAgIHJldHVybiAkLmFqYXhKU09OUChzZXR0aW5ncywgZGVmZXJyZWQpXG4gICAgfVxuXG4gICAgdmFyIG1pbWUgPSBzZXR0aW5ncy5hY2NlcHRzW2RhdGFUeXBlXSxcbiAgICAgICAgaGVhZGVycyA9IHsgfSxcbiAgICAgICAgc2V0SGVhZGVyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHsgaGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldID0gW25hbWUsIHZhbHVlXSB9LFxuICAgICAgICBwcm90b2NvbCA9IC9eKFtcXHctXSs6KVxcL1xcLy8udGVzdChzZXR0aW5ncy51cmwpID8gUmVnRXhwLiQxIDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sLFxuICAgICAgICB4aHIgPSBzZXR0aW5ncy54aHIoKSxcbiAgICAgICAgbmF0aXZlU2V0SGVhZGVyID0geGhyLnNldFJlcXVlc3RIZWFkZXIsXG4gICAgICAgIGFib3J0VGltZW91dFxuXG4gICAgaWYgKGRlZmVycmVkKSBkZWZlcnJlZC5wcm9taXNlKHhocilcblxuICAgIGlmICghc2V0dGluZ3MuY3Jvc3NEb21haW4pIHNldEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpXG4gICAgc2V0SGVhZGVyKCdBY2NlcHQnLCBtaW1lIHx8ICcqLyonKVxuICAgIGlmIChtaW1lID0gc2V0dGluZ3MubWltZVR5cGUgfHwgbWltZSkge1xuICAgICAgaWYgKG1pbWUuaW5kZXhPZignLCcpID4gLTEpIG1pbWUgPSBtaW1lLnNwbGl0KCcsJywgMilbMF1cbiAgICAgIHhoci5vdmVycmlkZU1pbWVUeXBlICYmIHhoci5vdmVycmlkZU1pbWVUeXBlKG1pbWUpXG4gICAgfVxuICAgIGlmIChzZXR0aW5ncy5jb250ZW50VHlwZSB8fCAoc2V0dGluZ3MuY29udGVudFR5cGUgIT09IGZhbHNlICYmIHNldHRpbmdzLmRhdGEgJiYgc2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpICE9ICdHRVQnKSlcbiAgICAgIHNldEhlYWRlcignQ29udGVudC1UeXBlJywgc2V0dGluZ3MuY29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpXG5cbiAgICBpZiAoc2V0dGluZ3MuaGVhZGVycykgZm9yIChuYW1lIGluIHNldHRpbmdzLmhlYWRlcnMpIHNldEhlYWRlcihuYW1lLCBzZXR0aW5ncy5oZWFkZXJzW25hbWVdKVxuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyID0gc2V0SGVhZGVyXG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eVxuICAgICAgICBjbGVhclRpbWVvdXQoYWJvcnRUaW1lb3V0KVxuICAgICAgICB2YXIgcmVzdWx0LCBlcnJvciA9IGZhbHNlXG4gICAgICAgIGlmICgoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgfHwgeGhyLnN0YXR1cyA9PSAzMDQgfHwgKHhoci5zdGF0dXMgPT0gMCAmJiBwcm90b2NvbCA9PSAnZmlsZTonKSkge1xuICAgICAgICAgIGRhdGFUeXBlID0gZGF0YVR5cGUgfHwgbWltZVRvRGF0YVR5cGUoc2V0dGluZ3MubWltZVR5cGUgfHwgeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKSlcbiAgICAgICAgICByZXN1bHQgPSB4aHIucmVzcG9uc2VUZXh0XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gaHR0cDovL3BlcmZlY3Rpb25raWxscy5jb20vZ2xvYmFsLWV2YWwtd2hhdC1hcmUtdGhlLW9wdGlvbnMvXG4gICAgICAgICAgICBpZiAoZGF0YVR5cGUgPT0gJ3NjcmlwdCcpICAgICgxLGV2YWwpKHJlc3VsdClcbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGFUeXBlID09ICd4bWwnKSAgcmVzdWx0ID0geGhyLnJlc3BvbnNlWE1MXG4gICAgICAgICAgICBlbHNlIGlmIChkYXRhVHlwZSA9PSAnanNvbicpIHJlc3VsdCA9IGJsYW5rUkUudGVzdChyZXN1bHQpID8gbnVsbCA6ICQucGFyc2VKU09OKHJlc3VsdClcbiAgICAgICAgICB9IGNhdGNoIChlKSB7IGVycm9yID0gZSB9XG5cbiAgICAgICAgICBpZiAoZXJyb3IpIGFqYXhFcnJvcihlcnJvciwgJ3BhcnNlcmVycm9yJywgeGhyLCBzZXR0aW5ncywgZGVmZXJyZWQpXG4gICAgICAgICAgZWxzZSBhamF4U3VjY2VzcyhyZXN1bHQsIHhociwgc2V0dGluZ3MsIGRlZmVycmVkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFqYXhFcnJvcih4aHIuc3RhdHVzVGV4dCB8fCBudWxsLCB4aHIuc3RhdHVzID8gJ2Vycm9yJyA6ICdhYm9ydCcsIHhociwgc2V0dGluZ3MsIGRlZmVycmVkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFqYXhCZWZvcmVTZW5kKHhociwgc2V0dGluZ3MpID09PSBmYWxzZSkge1xuICAgICAgeGhyLmFib3J0KClcbiAgICAgIGFqYXhFcnJvcihudWxsLCAnYWJvcnQnLCB4aHIsIHNldHRpbmdzLCBkZWZlcnJlZClcbiAgICAgIHJldHVybiB4aHJcbiAgICB9XG5cbiAgICBpZiAoc2V0dGluZ3MueGhyRmllbGRzKSBmb3IgKG5hbWUgaW4gc2V0dGluZ3MueGhyRmllbGRzKSB4aHJbbmFtZV0gPSBzZXR0aW5ncy54aHJGaWVsZHNbbmFtZV1cblxuICAgIHZhciBhc3luYyA9ICdhc3luYycgaW4gc2V0dGluZ3MgPyBzZXR0aW5ncy5hc3luYyA6IHRydWVcbiAgICB4aHIub3BlbihzZXR0aW5ncy50eXBlLCBzZXR0aW5ncy51cmwsIGFzeW5jLCBzZXR0aW5ncy51c2VybmFtZSwgc2V0dGluZ3MucGFzc3dvcmQpXG5cbiAgICBmb3IgKG5hbWUgaW4gaGVhZGVycykgbmF0aXZlU2V0SGVhZGVyLmFwcGx5KHhociwgaGVhZGVyc1tuYW1lXSlcblxuICAgIGlmIChzZXR0aW5ncy50aW1lb3V0ID4gMCkgYWJvcnRUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZW1wdHlcbiAgICAgICAgeGhyLmFib3J0KClcbiAgICAgICAgYWpheEVycm9yKG51bGwsICd0aW1lb3V0JywgeGhyLCBzZXR0aW5ncywgZGVmZXJyZWQpXG4gICAgICB9LCBzZXR0aW5ncy50aW1lb3V0KVxuXG4gICAgLy8gYXZvaWQgc2VuZGluZyBlbXB0eSBzdHJpbmcgKCMzMTkpXG4gICAgeGhyLnNlbmQoc2V0dGluZ3MuZGF0YSA/IHNldHRpbmdzLmRhdGEgOiBudWxsKVxuICAgIHJldHVybiB4aHJcbiAgfVxuXG4gIC8vIGhhbmRsZSBvcHRpb25hbCBkYXRhL3N1Y2Nlc3MgYXJndW1lbnRzXG4gIGZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzKHVybCwgZGF0YSwgc3VjY2VzcywgZGF0YVR5cGUpIHtcbiAgICBpZiAoJC5pc0Z1bmN0aW9uKGRhdGEpKSBkYXRhVHlwZSA9IHN1Y2Nlc3MsIHN1Y2Nlc3MgPSBkYXRhLCBkYXRhID0gdW5kZWZpbmVkXG4gICAgaWYgKCEkLmlzRnVuY3Rpb24oc3VjY2VzcykpIGRhdGFUeXBlID0gc3VjY2Vzcywgc3VjY2VzcyA9IHVuZGVmaW5lZFxuICAgIHJldHVybiB7XG4gICAgICB1cmw6IHVybFxuICAgICwgZGF0YTogZGF0YVxuICAgICwgc3VjY2Vzczogc3VjY2Vzc1xuICAgICwgZGF0YVR5cGU6IGRhdGFUeXBlXG4gICAgfVxuICB9XG5cbiAgJC5nZXQgPSBmdW5jdGlvbigvKiB1cmwsIGRhdGEsIHN1Y2Nlc3MsIGRhdGFUeXBlICovKXtcbiAgICByZXR1cm4gJC5hamF4KHBhcnNlQXJndW1lbnRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpXG4gIH1cblxuICAkLnBvc3QgPSBmdW5jdGlvbigvKiB1cmwsIGRhdGEsIHN1Y2Nlc3MsIGRhdGFUeXBlICovKXtcbiAgICB2YXIgb3B0aW9ucyA9IHBhcnNlQXJndW1lbnRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICBvcHRpb25zLnR5cGUgPSAnUE9TVCdcbiAgICByZXR1cm4gJC5hamF4KG9wdGlvbnMpXG4gIH1cblxuICAkLmdldEpTT04gPSBmdW5jdGlvbigvKiB1cmwsIGRhdGEsIHN1Y2Nlc3MgKi8pe1xuICAgIHZhciBvcHRpb25zID0gcGFyc2VBcmd1bWVudHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIG9wdGlvbnMuZGF0YVR5cGUgPSAnanNvbidcbiAgICByZXR1cm4gJC5hamF4KG9wdGlvbnMpXG4gIH1cblxuICAkLmZuLmxvYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIHN1Y2Nlc3Mpe1xuICAgIGlmICghdGhpcy5sZW5ndGgpIHJldHVybiB0aGlzXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBwYXJ0cyA9IHVybC5zcGxpdCgvXFxzLyksIHNlbGVjdG9yLFxuICAgICAgICBvcHRpb25zID0gcGFyc2VBcmd1bWVudHModXJsLCBkYXRhLCBzdWNjZXNzKSxcbiAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMSkgb3B0aW9ucy51cmwgPSBwYXJ0c1swXSwgc2VsZWN0b3IgPSBwYXJ0c1sxXVxuICAgIG9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNlbGYuaHRtbChzZWxlY3RvciA/XG4gICAgICAgICQoJzxkaXY+JykuaHRtbChyZXNwb25zZS5yZXBsYWNlKHJzY3JpcHQsIFwiXCIpKS5maW5kKHNlbGVjdG9yKVxuICAgICAgICA6IHJlc3BvbnNlKVxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJndW1lbnRzKVxuICAgIH1cbiAgICAkLmFqYXgob3B0aW9ucylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdmFyIGVzY2FwZSA9IGVuY29kZVVSSUNvbXBvbmVudFxuXG4gIGZ1bmN0aW9uIHNlcmlhbGl6ZShwYXJhbXMsIG9iaiwgdHJhZGl0aW9uYWwsIHNjb3BlKXtcbiAgICB2YXIgdHlwZSwgYXJyYXkgPSAkLmlzQXJyYXkob2JqKSwgaGFzaCA9ICQuaXNQbGFpbk9iamVjdChvYmopXG4gICAgJC5lYWNoKG9iaiwgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdHlwZSA9ICQudHlwZSh2YWx1ZSlcbiAgICAgIGlmIChzY29wZSkga2V5ID0gdHJhZGl0aW9uYWwgPyBzY29wZSA6XG4gICAgICAgIHNjb3BlICsgJ1snICsgKGhhc2ggfHwgdHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdhcnJheScgPyBrZXkgOiAnJykgKyAnXSdcbiAgICAgIC8vIGhhbmRsZSBkYXRhIGluIHNlcmlhbGl6ZUFycmF5KCkgZm9ybWF0XG4gICAgICBpZiAoIXNjb3BlICYmIGFycmF5KSBwYXJhbXMuYWRkKHZhbHVlLm5hbWUsIHZhbHVlLnZhbHVlKVxuICAgICAgLy8gcmVjdXJzZSBpbnRvIG5lc3RlZCBvYmplY3RzXG4gICAgICBlbHNlIGlmICh0eXBlID09IFwiYXJyYXlcIiB8fCAoIXRyYWRpdGlvbmFsICYmIHR5cGUgPT0gXCJvYmplY3RcIikpXG4gICAgICAgIHNlcmlhbGl6ZShwYXJhbXMsIHZhbHVlLCB0cmFkaXRpb25hbCwga2V5KVxuICAgICAgZWxzZSBwYXJhbXMuYWRkKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgfVxuXG4gICQucGFyYW0gPSBmdW5jdGlvbihvYmosIHRyYWRpdGlvbmFsKXtcbiAgICB2YXIgcGFyYW1zID0gW11cbiAgICBwYXJhbXMuYWRkID0gZnVuY3Rpb24oaywgdil7IHRoaXMucHVzaChlc2NhcGUoaykgKyAnPScgKyBlc2NhcGUodikpIH1cbiAgICBzZXJpYWxpemUocGFyYW1zLCBvYmosIHRyYWRpdGlvbmFsKVxuICAgIHJldHVybiBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpXG4gIH1cbn0pKFplcHRvKVxuXG47KGZ1bmN0aW9uKCQpe1xuICAkLmZuLnNlcmlhbGl6ZUFycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdLCBlbFxuICAgICQoW10uc2xpY2UuY2FsbCh0aGlzLmdldCgwKS5lbGVtZW50cykpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGVsID0gJCh0aGlzKVxuICAgICAgdmFyIHR5cGUgPSBlbC5hdHRyKCd0eXBlJylcbiAgICAgIGlmICh0aGlzLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT0gJ2ZpZWxkc2V0JyAmJlxuICAgICAgICAhdGhpcy5kaXNhYmxlZCAmJiB0eXBlICE9ICdzdWJtaXQnICYmIHR5cGUgIT0gJ3Jlc2V0JyAmJiB0eXBlICE9ICdidXR0b24nICYmXG4gICAgICAgICgodHlwZSAhPSAncmFkaW8nICYmIHR5cGUgIT0gJ2NoZWNrYm94JykgfHwgdGhpcy5jaGVja2VkKSlcbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIG5hbWU6IGVsLmF0dHIoJ25hbWUnKSxcbiAgICAgICAgICB2YWx1ZTogZWwudmFsKClcbiAgICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gICQuZm4uc2VyaWFsaXplID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVzdWx0ID0gW11cbiAgICB0aGlzLnNlcmlhbGl6ZUFycmF5KCkuZm9yRWFjaChmdW5jdGlvbihlbG0pe1xuICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGVsbS5uYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChlbG0udmFsdWUpKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKCcmJylcbiAgfVxuXG4gICQuZm4uc3VibWl0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBpZiAoY2FsbGJhY2spIHRoaXMuYmluZCgnc3VibWl0JywgY2FsbGJhY2spXG4gICAgZWxzZSBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIHZhciBldmVudCA9ICQuRXZlbnQoJ3N1Ym1pdCcpXG4gICAgICB0aGlzLmVxKDApLnRyaWdnZXIoZXZlbnQpXG4gICAgICBpZiAoIWV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB0aGlzLmdldCgwKS5zdWJtaXQoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0pKFplcHRvKVxuXG47KGZ1bmN0aW9uKCQpe1xuICAvLyBfX3Byb3RvX18gZG9lc24ndCBleGlzdCBvbiBJRTwxMSwgc28gcmVkZWZpbmVcbiAgLy8gdGhlIFogZnVuY3Rpb24gdG8gdXNlIG9iamVjdCBleHRlbnNpb24gaW5zdGVhZFxuICBpZiAoISgnX19wcm90b19fJyBpbiB7fSkpIHtcbiAgICAkLmV4dGVuZCgkLnplcHRvLCB7XG4gICAgICBaOiBmdW5jdGlvbihkb20sIHNlbGVjdG9yKXtcbiAgICAgICAgZG9tID0gZG9tIHx8IFtdXG4gICAgICAgICQuZXh0ZW5kKGRvbSwgJC5mbilcbiAgICAgICAgZG9tLnNlbGVjdG9yID0gc2VsZWN0b3IgfHwgJydcbiAgICAgICAgZG9tLl9fWiA9IHRydWVcbiAgICAgICAgcmV0dXJuIGRvbVxuICAgICAgfSxcbiAgICAgIC8vIHRoaXMgaXMgYSBrbHVkZ2UgYnV0IHdvcmtzXG4gICAgICBpc1o6IGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgICAgIHJldHVybiAkLnR5cGUob2JqZWN0KSA9PT0gJ2FycmF5JyAmJiAnX19aJyBpbiBvYmplY3RcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLy8gZ2V0Q29tcHV0ZWRTdHlsZSBzaG91bGRuJ3QgZnJlYWsgb3V0IHdoZW4gY2FsbGVkXG4gIC8vIHdpdGhvdXQgYSB2YWxpZCBlbGVtZW50IGFzIGFyZ3VtZW50XG4gIHRyeSB7XG4gICAgZ2V0Q29tcHV0ZWRTdHlsZSh1bmRlZmluZWQpXG4gIH0gY2F0Y2goZSkge1xuICAgIHZhciBuYXRpdmVHZXRDb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZTtcbiAgICB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA9IGZ1bmN0aW9uKGVsZW1lbnQpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZUdldENvbXB1dGVkU3R5bGUoZWxlbWVudClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfVxufSkoWmVwdG8pXG4iLCIvKiFcbiAqIFplcm9DbGlwYm9hcmRcbiAqIFRoZSBaZXJvQ2xpcGJvYXJkIGxpYnJhcnkgcHJvdmlkZXMgYW4gZWFzeSB3YXkgdG8gY29weSB0ZXh0IHRvIHRoZSBjbGlwYm9hcmQgdXNpbmcgYW4gaW52aXNpYmxlIEFkb2JlIEZsYXNoIG1vdmllIGFuZCBhIEphdmFTY3JpcHQgaW50ZXJmYWNlLlxuICogQ29weXJpZ2h0IChjKSAyMDE0IEpvbiBSb2hhbiwgSmFtZXMgTS4gR3JlZW5lXG4gKiBMaWNlbnNlZCBNSVRcbiAqIGh0dHA6Ly96ZXJvY2xpcGJvYXJkLm9yZy9cbiAqIHYyLjEuNlxuICovXG4oZnVuY3Rpb24od2luZG93LCB1bmRlZmluZWQpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIC8qKlxuICogU3RvcmUgcmVmZXJlbmNlcyB0byBjcml0aWNhbGx5IGltcG9ydGFudCBnbG9iYWwgZnVuY3Rpb25zIHRoYXQgbWF5IGJlXG4gKiBvdmVycmlkZGVuIG9uIGNlcnRhaW4gd2ViIHBhZ2VzLlxuICovXG4gIHZhciBfd2luZG93ID0gd2luZG93LCBfZG9jdW1lbnQgPSBfd2luZG93LmRvY3VtZW50LCBfbmF2aWdhdG9yID0gX3dpbmRvdy5uYXZpZ2F0b3IsIF9zZXRUaW1lb3V0ID0gX3dpbmRvdy5zZXRUaW1lb3V0LCBfZW5jb2RlVVJJQ29tcG9uZW50ID0gX3dpbmRvdy5lbmNvZGVVUklDb21wb25lbnQsIF9BY3RpdmVYT2JqZWN0ID0gX3dpbmRvdy5BY3RpdmVYT2JqZWN0LCBfRXJyb3IgPSBfd2luZG93LkVycm9yLCBfcGFyc2VJbnQgPSBfd2luZG93Lk51bWJlci5wYXJzZUludCB8fCBfd2luZG93LnBhcnNlSW50LCBfcGFyc2VGbG9hdCA9IF93aW5kb3cuTnVtYmVyLnBhcnNlRmxvYXQgfHwgX3dpbmRvdy5wYXJzZUZsb2F0LCBfaXNOYU4gPSBfd2luZG93Lk51bWJlci5pc05hTiB8fCBfd2luZG93LmlzTmFOLCBfcm91bmQgPSBfd2luZG93Lk1hdGgucm91bmQsIF9ub3cgPSBfd2luZG93LkRhdGUubm93LCBfa2V5cyA9IF93aW5kb3cuT2JqZWN0LmtleXMsIF9kZWZpbmVQcm9wZXJ0eSA9IF93aW5kb3cuT2JqZWN0LmRlZmluZVByb3BlcnR5LCBfaGFzT3duID0gX3dpbmRvdy5PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LCBfc2xpY2UgPSBfd2luZG93LkFycmF5LnByb3RvdHlwZS5zbGljZSwgX3Vud3JhcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bndyYXBwZXIgPSBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuIGVsO1xuICAgIH07XG4gICAgaWYgKHR5cGVvZiBfd2luZG93LndyYXAgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgX3dpbmRvdy51bndyYXAgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGRpdiA9IF9kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgdW53cmFwcGVkRGl2ID0gX3dpbmRvdy51bndyYXAoZGl2KTtcbiAgICAgICAgaWYgKGRpdi5ub2RlVHlwZSA9PT0gMSAmJiB1bndyYXBwZWREaXYgJiYgdW53cmFwcGVkRGl2Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgdW53cmFwcGVyID0gX3dpbmRvdy51bndyYXA7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICAgIHJldHVybiB1bndyYXBwZXI7XG4gIH0oKTtcbiAgLyoqXG4gKiBDb252ZXJ0IGFuIGBhcmd1bWVudHNgIG9iamVjdCBpbnRvIGFuIEFycmF5LlxuICpcbiAqIEByZXR1cm5zIFRoZSBhcmd1bWVudHMgYXMgYW4gQXJyYXlcbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9hcmdzID0gZnVuY3Rpb24oYXJndW1lbnRzT2JqKSB7XG4gICAgcmV0dXJuIF9zbGljZS5jYWxsKGFyZ3VtZW50c09iaiwgMCk7XG4gIH07XG4gIC8qKlxuICogU2hhbGxvdy1jb3B5IHRoZSBvd25lZCwgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIG9uZSBvYmplY3Qgb3ZlciB0byBhbm90aGVyLCBzaW1pbGFyIHRvIGpRdWVyeSdzIGAkLmV4dGVuZGAuXG4gKlxuICogQHJldHVybnMgVGhlIHRhcmdldCBvYmplY3QsIGF1Z21lbnRlZFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2V4dGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBsZW4sIGFyZywgcHJvcCwgc3JjLCBjb3B5LCBhcmdzID0gX2FyZ3MoYXJndW1lbnRzKSwgdGFyZ2V0ID0gYXJnc1swXSB8fCB7fTtcbiAgICBmb3IgKGkgPSAxLCBsZW4gPSBhcmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoKGFyZyA9IGFyZ3NbaV0pICE9IG51bGwpIHtcbiAgICAgICAgZm9yIChwcm9wIGluIGFyZykge1xuICAgICAgICAgIGlmIChfaGFzT3duLmNhbGwoYXJnLCBwcm9wKSkge1xuICAgICAgICAgICAgc3JjID0gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgICAgY29weSA9IGFyZ1twcm9wXTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT09IGNvcHkgJiYgY29weSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IGNvcHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH07XG4gIC8qKlxuICogUmV0dXJuIGEgZGVlcCBjb3B5IG9mIHRoZSBzb3VyY2Ugb2JqZWN0IG9yIGFycmF5LlxuICpcbiAqIEByZXR1cm5zIE9iamVjdCBvciBBcnJheVxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2RlZXBDb3B5ID0gZnVuY3Rpb24oc291cmNlKSB7XG4gICAgdmFyIGNvcHksIGksIGxlbiwgcHJvcDtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gXCJvYmplY3RcIiB8fCBzb3VyY2UgPT0gbnVsbCkge1xuICAgICAgY29weSA9IHNvdXJjZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2UubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICBjb3B5ID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBzb3VyY2UubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKF9oYXNPd24uY2FsbChzb3VyY2UsIGkpKSB7XG4gICAgICAgICAgY29weVtpXSA9IF9kZWVwQ29weShzb3VyY2VbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHkgPSB7fTtcbiAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKF9oYXNPd24uY2FsbChzb3VyY2UsIHByb3ApKSB7XG4gICAgICAgICAgY29weVtwcm9wXSA9IF9kZWVwQ29weShzb3VyY2VbcHJvcF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuICAvKipcbiAqIE1ha2VzIGEgc2hhbGxvdyBjb3B5IG9mIGBvYmpgIChsaWtlIGBfZXh0ZW5kYCkgYnV0IGZpbHRlcnMgaXRzIHByb3BlcnRpZXMgYmFzZWQgb24gYSBsaXN0IG9mIGBrZXlzYCB0byBrZWVwLlxuICogVGhlIGludmVyc2Ugb2YgYF9vbWl0YCwgbW9zdGx5LiBUaGUgYmlnIGRpZmZlcmVuY2UgaXMgdGhhdCB0aGVzZSBwcm9wZXJ0aWVzIGRvIE5PVCBuZWVkIHRvIGJlIGVudW1lcmFibGUgdG9cbiAqIGJlIGtlcHQuXG4gKlxuICogQHJldHVybnMgQSBuZXcgZmlsdGVyZWQgb2JqZWN0LlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX3BpY2sgPSBmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgbmV3T2JqID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmIChrZXlzW2ldIGluIG9iaikge1xuICAgICAgICBuZXdPYmpba2V5c1tpXV0gPSBvYmpba2V5c1tpXV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdPYmo7XG4gIH07XG4gIC8qKlxuICogTWFrZXMgYSBzaGFsbG93IGNvcHkgb2YgYG9iamAgKGxpa2UgYF9leHRlbmRgKSBidXQgZmlsdGVycyBpdHMgcHJvcGVydGllcyBiYXNlZCBvbiBhIGxpc3Qgb2YgYGtleXNgIHRvIG9taXQuXG4gKiBUaGUgaW52ZXJzZSBvZiBgX3BpY2tgLlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IGZpbHRlcmVkIG9iamVjdC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9vbWl0ID0gZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgICBpZiAoa2V5cy5pbmRleE9mKHByb3ApID09PSAtMSkge1xuICAgICAgICBuZXdPYmpbcHJvcF0gPSBvYmpbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdPYmo7XG4gIH07XG4gIC8qKlxuICogUmVtb3ZlIGFsbCBvd25lZCwgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGZyb20gYW4gb2JqZWN0LlxuICpcbiAqIEByZXR1cm5zIFRoZSBvcmlnaW5hbCBvYmplY3Qgd2l0aG91dCBpdHMgb3duZWQsIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9kZWxldGVPd25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaikge1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgaWYgKF9oYXNPd24uY2FsbChvYmosIHByb3ApKSB7XG4gICAgICAgICAgZGVsZXRlIG9ialtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuICAvKipcbiAqIERldGVybWluZSBpZiBhbiBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gYW5vdGhlciBlbGVtZW50LlxuICpcbiAqIEByZXR1cm5zIEJvb2xlYW5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jb250YWluZWRCeSA9IGZ1bmN0aW9uKGVsLCBhbmNlc3RvckVsKSB7XG4gICAgaWYgKGVsICYmIGVsLm5vZGVUeXBlID09PSAxICYmIGVsLm93bmVyRG9jdW1lbnQgJiYgYW5jZXN0b3JFbCAmJiAoYW5jZXN0b3JFbC5ub2RlVHlwZSA9PT0gMSAmJiBhbmNlc3RvckVsLm93bmVyRG9jdW1lbnQgJiYgYW5jZXN0b3JFbC5vd25lckRvY3VtZW50ID09PSBlbC5vd25lckRvY3VtZW50IHx8IGFuY2VzdG9yRWwubm9kZVR5cGUgPT09IDkgJiYgIWFuY2VzdG9yRWwub3duZXJEb2N1bWVudCAmJiBhbmNlc3RvckVsID09PSBlbC5vd25lckRvY3VtZW50KSkge1xuICAgICAgZG8ge1xuICAgICAgICBpZiAoZWwgPT09IGFuY2VzdG9yRWwpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICB9IHdoaWxlIChlbCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgLyoqXG4gKiBHZXQgdGhlIFVSTCBwYXRoJ3MgcGFyZW50IGRpcmVjdG9yeS5cbiAqXG4gKiBAcmV0dXJucyBTdHJpbmcgb3IgYHVuZGVmaW5lZGBcbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9nZXREaXJQYXRoT2ZVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgZGlyO1xuICAgIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiICYmIHVybCkge1xuICAgICAgZGlyID0gdXJsLnNwbGl0KFwiI1wiKVswXS5zcGxpdChcIj9cIilbMF07XG4gICAgICBkaXIgPSB1cmwuc2xpY2UoMCwgdXJsLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuICAgIH1cbiAgICByZXR1cm4gZGlyO1xuICB9O1xuICAvKipcbiAqIEdldCB0aGUgY3VycmVudCBzY3JpcHQncyBVUkwgYnkgdGhyb3dpbmcgYW4gYEVycm9yYCBhbmQgYW5hbHl6aW5nIGl0LlxuICpcbiAqIEByZXR1cm5zIFN0cmluZyBvciBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2dldEN1cnJlbnRTY3JpcHRVcmxGcm9tRXJyb3JTdGFjayA9IGZ1bmN0aW9uKHN0YWNrKSB7XG4gICAgdmFyIHVybCwgbWF0Y2hlcztcbiAgICBpZiAodHlwZW9mIHN0YWNrID09PSBcInN0cmluZ1wiICYmIHN0YWNrKSB7XG4gICAgICBtYXRjaGVzID0gc3RhY2subWF0Y2goL14oPzp8W146QF0qQHwuK1xcKUAoPz1odHRwW3NdP3xmaWxlKXwuKz9cXHMrKD86IGF0IHxAKSg/OlteOlxcKF0rICkqW1xcKF0/KSgoPzpodHRwW3NdP3xmaWxlKTpcXC9cXC9bXFwvXT8uKz9cXC9bXjpcXCldKj8pKD86OlxcZCspKD86OlxcZCspPy8pO1xuICAgICAgaWYgKG1hdGNoZXMgJiYgbWF0Y2hlc1sxXSkge1xuICAgICAgICB1cmwgPSBtYXRjaGVzWzFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF0Y2hlcyA9IHN0YWNrLm1hdGNoKC9cXClAKCg/Omh0dHBbc10/fGZpbGUpOlxcL1xcL1tcXC9dPy4rP1xcL1teOlxcKV0qPykoPzo6XFxkKykoPzo6XFxkKyk/Lyk7XG4gICAgICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXNbMV0pIHtcbiAgICAgICAgICB1cmwgPSBtYXRjaGVzWzFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG4gIH07XG4gIC8qKlxuICogR2V0IHRoZSBjdXJyZW50IHNjcmlwdCdzIFVSTCBieSB0aHJvd2luZyBhbiBgRXJyb3JgIGFuZCBhbmFseXppbmcgaXQuXG4gKlxuICogQHJldHVybnMgU3RyaW5nIG9yIGB1bmRlZmluZWRgXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZ2V0Q3VycmVudFNjcmlwdFVybEZyb21FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cmwsIGVycjtcbiAgICB0cnkge1xuICAgICAgdGhyb3cgbmV3IF9FcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVyciA9IGU7XG4gICAgfVxuICAgIGlmIChlcnIpIHtcbiAgICAgIHVybCA9IGVyci5zb3VyY2VVUkwgfHwgZXJyLmZpbGVOYW1lIHx8IF9nZXRDdXJyZW50U2NyaXB0VXJsRnJvbUVycm9yU3RhY2soZXJyLnN0YWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbiAgfTtcbiAgLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgc2NyaXB0J3MgVVJMLlxuICpcbiAqIEByZXR1cm5zIFN0cmluZyBvciBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2dldEN1cnJlbnRTY3JpcHRVcmwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIganNQYXRoLCBzY3JpcHRzLCBpO1xuICAgIGlmIChfZG9jdW1lbnQuY3VycmVudFNjcmlwdCAmJiAoanNQYXRoID0gX2RvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjKSkge1xuICAgICAgcmV0dXJuIGpzUGF0aDtcbiAgICB9XG4gICAgc2NyaXB0cyA9IF9kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcbiAgICBpZiAoc2NyaXB0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBzY3JpcHRzWzBdLnNyYyB8fCB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChcInJlYWR5U3RhdGVcIiBpbiBzY3JpcHRzWzBdKSB7XG4gICAgICBmb3IgKGkgPSBzY3JpcHRzLmxlbmd0aDsgaS0tOyApIHtcbiAgICAgICAgaWYgKHNjcmlwdHNbaV0ucmVhZHlTdGF0ZSA9PT0gXCJpbnRlcmFjdGl2ZVwiICYmIChqc1BhdGggPSBzY3JpcHRzW2ldLnNyYykpIHtcbiAgICAgICAgICByZXR1cm4ganNQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChfZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIgJiYgKGpzUGF0aCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmMpKSB7XG4gICAgICByZXR1cm4ganNQYXRoO1xuICAgIH1cbiAgICBpZiAoanNQYXRoID0gX2dldEN1cnJlbnRTY3JpcHRVcmxGcm9tRXJyb3IoKSkge1xuICAgICAgcmV0dXJuIGpzUGF0aDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcbiAgLyoqXG4gKiBHZXQgdGhlIHVuYW5pbW91cyBwYXJlbnQgZGlyZWN0b3J5IG9mIEFMTCBzY3JpcHQgdGFncy5cbiAqIElmIGFueSBzY3JpcHQgdGFncyBhcmUgZWl0aGVyIChhKSBpbmxpbmUgb3IgKGIpIGZyb20gZGlmZmVyaW5nIHBhcmVudFxuICogZGlyZWN0b3JpZXMsIHRoaXMgbWV0aG9kIG11c3QgcmV0dXJuIGB1bmRlZmluZWRgLlxuICpcbiAqIEByZXR1cm5zIFN0cmluZyBvciBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2dldFVuYW5pbW91c1NjcmlwdFBhcmVudERpciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBqc0RpciwganNQYXRoLCBzY3JpcHRzID0gX2RvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuICAgIGZvciAoaSA9IHNjcmlwdHMubGVuZ3RoOyBpLS07ICkge1xuICAgICAgaWYgKCEoanNQYXRoID0gc2NyaXB0c1tpXS5zcmMpKSB7XG4gICAgICAgIGpzRGlyID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBqc1BhdGggPSBfZ2V0RGlyUGF0aE9mVXJsKGpzUGF0aCk7XG4gICAgICBpZiAoanNEaXIgPT0gbnVsbCkge1xuICAgICAgICBqc0RpciA9IGpzUGF0aDtcbiAgICAgIH0gZWxzZSBpZiAoanNEaXIgIT09IGpzUGF0aCkge1xuICAgICAgICBqc0RpciA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ganNEaXIgfHwgdW5kZWZpbmVkO1xuICB9O1xuICAvKipcbiAqIEdldCB0aGUgcHJlc3VtZWQgbG9jYXRpb24gb2YgdGhlIFwiWmVyb0NsaXBib2FyZC5zd2ZcIiBmaWxlLCBiYXNlZCBvbiB0aGUgbG9jYXRpb25cbiAqIG9mIHRoZSBleGVjdXRpbmcgSmF2YVNjcmlwdCBmaWxlIChlLmcuIFwiWmVyb0NsaXBib2FyZC5qc1wiLCBldGMuKS5cbiAqXG4gKiBAcmV0dXJucyBTdHJpbmdcbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9nZXREZWZhdWx0U3dmUGF0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBqc0RpciA9IF9nZXREaXJQYXRoT2ZVcmwoX2dldEN1cnJlbnRTY3JpcHRVcmwoKSkgfHwgX2dldFVuYW5pbW91c1NjcmlwdFBhcmVudERpcigpIHx8IFwiXCI7XG4gICAgcmV0dXJuIGpzRGlyICsgXCJaZXJvQ2xpcGJvYXJkLnN3ZlwiO1xuICB9O1xuICAvKipcbiAqIEtlZXAgdHJhY2sgb2YgdGhlIHN0YXRlIG9mIHRoZSBGbGFzaCBvYmplY3QuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZmxhc2hTdGF0ZSA9IHtcbiAgICBicmlkZ2U6IG51bGwsXG4gICAgdmVyc2lvbjogXCIwLjAuMFwiLFxuICAgIHBsdWdpblR5cGU6IFwidW5rbm93blwiLFxuICAgIGRpc2FibGVkOiBudWxsLFxuICAgIG91dGRhdGVkOiBudWxsLFxuICAgIHVuYXZhaWxhYmxlOiBudWxsLFxuICAgIGRlYWN0aXZhdGVkOiBudWxsLFxuICAgIG92ZXJkdWU6IG51bGwsXG4gICAgcmVhZHk6IG51bGxcbiAgfTtcbiAgLyoqXG4gKiBUaGUgbWluaW11bSBGbGFzaCBQbGF5ZXIgdmVyc2lvbiByZXF1aXJlZCB0byB1c2UgWmVyb0NsaXBib2FyZCBjb21wbGV0ZWx5LlxuICogQHJlYWRvbmx5XG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfbWluaW11bUZsYXNoVmVyc2lvbiA9IFwiMTEuMC4wXCI7XG4gIC8qKlxuICogS2VlcCB0cmFjayBvZiBhbGwgZXZlbnQgbGlzdGVuZXIgcmVnaXN0cmF0aW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9oYW5kbGVycyA9IHt9O1xuICAvKipcbiAqIEtlZXAgdHJhY2sgb2YgdGhlIGN1cnJlbnRseSBhY3RpdmF0ZWQgZWxlbWVudC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jdXJyZW50RWxlbWVudDtcbiAgLyoqXG4gKiBLZWVwIHRyYWNrIG9mIHRoZSBlbGVtZW50IHRoYXQgd2FzIGFjdGl2YXRlZCB3aGVuIGEgYGNvcHlgIHByb2Nlc3Mgc3RhcnRlZC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jb3B5VGFyZ2V0O1xuICAvKipcbiAqIEtlZXAgdHJhY2sgb2YgZGF0YSBmb3IgdGhlIHBlbmRpbmcgY2xpcGJvYXJkIHRyYW5zYWN0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2NsaXBEYXRhID0ge307XG4gIC8qKlxuICogS2VlcCB0cmFjayBvZiBkYXRhIGZvcm1hdHMgZm9yIHRoZSBwZW5kaW5nIGNsaXBib2FyZCB0cmFuc2FjdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jbGlwRGF0YUZvcm1hdE1hcCA9IG51bGw7XG4gIC8qKlxuICogVGhlIGBtZXNzYWdlYCBzdG9yZSBmb3IgZXZlbnRzXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZXZlbnRNZXNzYWdlcyA9IHtcbiAgICByZWFkeTogXCJGbGFzaCBjb21tdW5pY2F0aW9uIGlzIGVzdGFibGlzaGVkXCIsXG4gICAgZXJyb3I6IHtcbiAgICAgIFwiZmxhc2gtZGlzYWJsZWRcIjogXCJGbGFzaCBpcyBkaXNhYmxlZCBvciBub3QgaW5zdGFsbGVkXCIsXG4gICAgICBcImZsYXNoLW91dGRhdGVkXCI6IFwiRmxhc2ggaXMgdG9vIG91dGRhdGVkIHRvIHN1cHBvcnQgWmVyb0NsaXBib2FyZFwiLFxuICAgICAgXCJmbGFzaC11bmF2YWlsYWJsZVwiOiBcIkZsYXNoIGlzIHVuYWJsZSB0byBjb21tdW5pY2F0ZSBiaWRpcmVjdGlvbmFsbHkgd2l0aCBKYXZhU2NyaXB0XCIsXG4gICAgICBcImZsYXNoLWRlYWN0aXZhdGVkXCI6IFwiRmxhc2ggaXMgdG9vIG91dGRhdGVkIGZvciB5b3VyIGJyb3dzZXIgYW5kL29yIGlzIGNvbmZpZ3VyZWQgYXMgY2xpY2stdG8tYWN0aXZhdGVcIixcbiAgICAgIFwiZmxhc2gtb3ZlcmR1ZVwiOiBcIkZsYXNoIGNvbW11bmljYXRpb24gd2FzIGVzdGFibGlzaGVkIGJ1dCBOT1Qgd2l0aGluIHRoZSBhY2NlcHRhYmxlIHRpbWUgbGltaXRcIlxuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBaZXJvQ2xpcGJvYXJkIGNvbmZpZ3VyYXRpb24gZGVmYXVsdHMgZm9yIHRoZSBDb3JlIG1vZHVsZS5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9nbG9iYWxDb25maWcgPSB7XG4gICAgc3dmUGF0aDogX2dldERlZmF1bHRTd2ZQYXRoKCksXG4gICAgdHJ1c3RlZERvbWFpbnM6IHdpbmRvdy5sb2NhdGlvbi5ob3N0ID8gWyB3aW5kb3cubG9jYXRpb24uaG9zdCBdIDogW10sXG4gICAgY2FjaGVCdXN0OiB0cnVlLFxuICAgIGZvcmNlRW5oYW5jZWRDbGlwYm9hcmQ6IGZhbHNlLFxuICAgIGZsYXNoTG9hZFRpbWVvdXQ6IDNlNCxcbiAgICBhdXRvQWN0aXZhdGU6IHRydWUsXG4gICAgYnViYmxlRXZlbnRzOiB0cnVlLFxuICAgIGNvbnRhaW5lcklkOiBcImdsb2JhbC16ZXJvY2xpcGJvYXJkLWh0bWwtYnJpZGdlXCIsXG4gICAgY29udGFpbmVyQ2xhc3M6IFwiZ2xvYmFsLXplcm9jbGlwYm9hcmQtY29udGFpbmVyXCIsXG4gICAgc3dmT2JqZWN0SWQ6IFwiZ2xvYmFsLXplcm9jbGlwYm9hcmQtZmxhc2gtYnJpZGdlXCIsXG4gICAgaG92ZXJDbGFzczogXCJ6ZXJvY2xpcGJvYXJkLWlzLWhvdmVyXCIsXG4gICAgYWN0aXZlQ2xhc3M6IFwiemVyb2NsaXBib2FyZC1pcy1hY3RpdmVcIixcbiAgICBmb3JjZUhhbmRDdXJzb3I6IGZhbHNlLFxuICAgIHRpdGxlOiBudWxsLFxuICAgIHpJbmRleDogOTk5OTk5OTk5XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuY29uZmlnYC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jb25maWcgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcIm9iamVjdFwiICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xuICAgICAgICBpZiAoX2hhc093bi5jYWxsKG9wdGlvbnMsIHByb3ApKSB7XG4gICAgICAgICAgaWYgKC9eKD86Zm9yY2VIYW5kQ3Vyc29yfHRpdGxlfHpJbmRleHxidWJibGVFdmVudHMpJC8udGVzdChwcm9wKSkge1xuICAgICAgICAgICAgX2dsb2JhbENvbmZpZ1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG4gICAgICAgICAgfSBlbHNlIGlmIChfZmxhc2hTdGF0ZS5icmlkZ2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHByb3AgPT09IFwiY29udGFpbmVySWRcIiB8fCBwcm9wID09PSBcInN3Zk9iamVjdElkXCIpIHtcbiAgICAgICAgICAgICAgaWYgKF9pc1ZhbGlkSHRtbDRJZChvcHRpb25zW3Byb3BdKSkge1xuICAgICAgICAgICAgICAgIF9nbG9iYWxDb25maWdbcHJvcF0gPSBvcHRpb25zW3Byb3BdO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBzcGVjaWZpZWQgYFwiICsgcHJvcCArIFwiYCB2YWx1ZSBpcyBub3QgdmFsaWQgYXMgYW4gSFRNTDQgRWxlbWVudCBJRFwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX2dsb2JhbENvbmZpZ1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIiAmJiBvcHRpb25zKSB7XG4gICAgICBpZiAoX2hhc093bi5jYWxsKF9nbG9iYWxDb25maWcsIG9wdGlvbnMpKSB7XG4gICAgICAgIHJldHVybiBfZ2xvYmFsQ29uZmlnW29wdGlvbnNdO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gX2RlZXBDb3B5KF9nbG9iYWxDb25maWcpO1xuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLnN0YXRlYC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9zdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBicm93c2VyOiBfcGljayhfbmF2aWdhdG9yLCBbIFwidXNlckFnZW50XCIsIFwicGxhdGZvcm1cIiwgXCJhcHBOYW1lXCIgXSksXG4gICAgICBmbGFzaDogX29taXQoX2ZsYXNoU3RhdGUsIFsgXCJicmlkZ2VcIiBdKSxcbiAgICAgIHplcm9jbGlwYm9hcmQ6IHtcbiAgICAgICAgdmVyc2lvbjogWmVyb0NsaXBib2FyZC52ZXJzaW9uLFxuICAgICAgICBjb25maWc6IFplcm9DbGlwYm9hcmQuY29uZmlnKClcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLmlzRmxhc2hVbnVzYWJsZWAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfaXNGbGFzaFVudXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICEhKF9mbGFzaFN0YXRlLmRpc2FibGVkIHx8IF9mbGFzaFN0YXRlLm91dGRhdGVkIHx8IF9mbGFzaFN0YXRlLnVuYXZhaWxhYmxlIHx8IF9mbGFzaFN0YXRlLmRlYWN0aXZhdGVkKTtcbiAgfTtcbiAgLyoqXG4gKiBUaGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiBgWmVyb0NsaXBib2FyZC5vbmAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfb24gPSBmdW5jdGlvbihldmVudFR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGksIGxlbiwgZXZlbnRzLCBhZGRlZCA9IHt9O1xuICAgIGlmICh0eXBlb2YgZXZlbnRUeXBlID09PSBcInN0cmluZ1wiICYmIGV2ZW50VHlwZSkge1xuICAgICAgZXZlbnRzID0gZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkuc3BsaXQoL1xccysvKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBldmVudFR5cGUgPT09IFwib2JqZWN0XCIgJiYgZXZlbnRUeXBlICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZm9yIChpIGluIGV2ZW50VHlwZSkge1xuICAgICAgICBpZiAoX2hhc093bi5jYWxsKGV2ZW50VHlwZSwgaSkgJiYgdHlwZW9mIGkgPT09IFwic3RyaW5nXCIgJiYgaSAmJiB0eXBlb2YgZXZlbnRUeXBlW2ldID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBaZXJvQ2xpcGJvYXJkLm9uKGksIGV2ZW50VHlwZVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50cyAmJiBldmVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBldmVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXZlbnRUeXBlID0gZXZlbnRzW2ldLnJlcGxhY2UoL15vbi8sIFwiXCIpO1xuICAgICAgICBhZGRlZFtldmVudFR5cGVdID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFfaGFuZGxlcnNbZXZlbnRUeXBlXSkge1xuICAgICAgICAgIF9oYW5kbGVyc1tldmVudFR5cGVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgX2hhbmRsZXJzW2V2ZW50VHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBpZiAoYWRkZWQucmVhZHkgJiYgX2ZsYXNoU3RhdGUucmVhZHkpIHtcbiAgICAgICAgWmVyb0NsaXBib2FyZC5lbWl0KHtcbiAgICAgICAgICB0eXBlOiBcInJlYWR5XCJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoYWRkZWQuZXJyb3IpIHtcbiAgICAgICAgdmFyIGVycm9yVHlwZXMgPSBbIFwiZGlzYWJsZWRcIiwgXCJvdXRkYXRlZFwiLCBcInVuYXZhaWxhYmxlXCIsIFwiZGVhY3RpdmF0ZWRcIiwgXCJvdmVyZHVlXCIgXTtcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gZXJyb3JUeXBlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmIChfZmxhc2hTdGF0ZVtlcnJvclR5cGVzW2ldXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgWmVyb0NsaXBib2FyZC5lbWl0KHtcbiAgICAgICAgICAgICAgdHlwZTogXCJlcnJvclwiLFxuICAgICAgICAgICAgICBuYW1lOiBcImZsYXNoLVwiICsgZXJyb3JUeXBlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFplcm9DbGlwYm9hcmQ7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQub2ZmYC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9vZmYgPSBmdW5jdGlvbihldmVudFR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGksIGxlbiwgZm91bmRJbmRleCwgZXZlbnRzLCBwZXJFdmVudEhhbmRsZXJzO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBldmVudHMgPSBfa2V5cyhfaGFuZGxlcnMpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV2ZW50VHlwZSA9PT0gXCJzdHJpbmdcIiAmJiBldmVudFR5cGUpIHtcbiAgICAgIGV2ZW50cyA9IGV2ZW50VHlwZS5zcGxpdCgvXFxzKy8pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV2ZW50VHlwZSA9PT0gXCJvYmplY3RcIiAmJiBldmVudFR5cGUgJiYgdHlwZW9mIGxpc3RlbmVyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBmb3IgKGkgaW4gZXZlbnRUeXBlKSB7XG4gICAgICAgIGlmIChfaGFzT3duLmNhbGwoZXZlbnRUeXBlLCBpKSAmJiB0eXBlb2YgaSA9PT0gXCJzdHJpbmdcIiAmJiBpICYmIHR5cGVvZiBldmVudFR5cGVbaV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIFplcm9DbGlwYm9hcmQub2ZmKGksIGV2ZW50VHlwZVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50cyAmJiBldmVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBldmVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXZlbnRUeXBlID0gZXZlbnRzW2ldLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXm9uLywgXCJcIik7XG4gICAgICAgIHBlckV2ZW50SGFuZGxlcnMgPSBfaGFuZGxlcnNbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKHBlckV2ZW50SGFuZGxlcnMgJiYgcGVyRXZlbnRIYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXggPSBwZXJFdmVudEhhbmRsZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgICAgICAgd2hpbGUgKGZvdW5kSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgIHBlckV2ZW50SGFuZGxlcnMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgICAgICAgICBmb3VuZEluZGV4ID0gcGVyRXZlbnRIYW5kbGVycy5pbmRleE9mKGxpc3RlbmVyLCBmb3VuZEluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVyRXZlbnRIYW5kbGVycy5sZW5ndGggPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gWmVyb0NsaXBib2FyZDtcbiAgfTtcbiAgLyoqXG4gKiBUaGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiBgWmVyb0NsaXBib2FyZC5oYW5kbGVyc2AuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfbGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnRUeXBlKSB7XG4gICAgdmFyIGNvcHk7XG4gICAgaWYgKHR5cGVvZiBldmVudFR5cGUgPT09IFwic3RyaW5nXCIgJiYgZXZlbnRUeXBlKSB7XG4gICAgICBjb3B5ID0gX2RlZXBDb3B5KF9oYW5kbGVyc1tldmVudFR5cGVdKSB8fCBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb3B5ID0gX2RlZXBDb3B5KF9oYW5kbGVycyk7XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLmVtaXRgLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2VtaXQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBldmVudENvcHksIHJldHVyblZhbCwgdG1wO1xuICAgIGV2ZW50ID0gX2NyZWF0ZUV2ZW50KGV2ZW50KTtcbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChfcHJlcHJvY2Vzc0V2ZW50KGV2ZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJyZWFkeVwiICYmIF9mbGFzaFN0YXRlLm92ZXJkdWUgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBaZXJvQ2xpcGJvYXJkLmVtaXQoe1xuICAgICAgICB0eXBlOiBcImVycm9yXCIsXG4gICAgICAgIG5hbWU6IFwiZmxhc2gtb3ZlcmR1ZVwiXG4gICAgICB9KTtcbiAgICB9XG4gICAgZXZlbnRDb3B5ID0gX2V4dGVuZCh7fSwgZXZlbnQpO1xuICAgIF9kaXNwYXRjaENhbGxiYWNrcy5jYWxsKHRoaXMsIGV2ZW50Q29weSk7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwiY29weVwiKSB7XG4gICAgICB0bXAgPSBfbWFwQ2xpcERhdGFUb0ZsYXNoKF9jbGlwRGF0YSk7XG4gICAgICByZXR1cm5WYWwgPSB0bXAuZGF0YTtcbiAgICAgIF9jbGlwRGF0YUZvcm1hdE1hcCA9IHRtcC5mb3JtYXRNYXA7XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5WYWw7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuY3JlYXRlYC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIF9mbGFzaFN0YXRlLnJlYWR5ICE9PSBcImJvb2xlYW5cIikge1xuICAgICAgX2ZsYXNoU3RhdGUucmVhZHkgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFaZXJvQ2xpcGJvYXJkLmlzRmxhc2hVbnVzYWJsZSgpICYmIF9mbGFzaFN0YXRlLmJyaWRnZSA9PT0gbnVsbCkge1xuICAgICAgdmFyIG1heFdhaXQgPSBfZ2xvYmFsQ29uZmlnLmZsYXNoTG9hZFRpbWVvdXQ7XG4gICAgICBpZiAodHlwZW9mIG1heFdhaXQgPT09IFwibnVtYmVyXCIgJiYgbWF4V2FpdCA+PSAwKSB7XG4gICAgICAgIF9zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgX2ZsYXNoU3RhdGUuZGVhY3RpdmF0ZWQgIT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICBfZmxhc2hTdGF0ZS5kZWFjdGl2YXRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChfZmxhc2hTdGF0ZS5kZWFjdGl2YXRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgWmVyb0NsaXBib2FyZC5lbWl0KHtcbiAgICAgICAgICAgICAgdHlwZTogXCJlcnJvclwiLFxuICAgICAgICAgICAgICBuYW1lOiBcImZsYXNoLWRlYWN0aXZhdGVkXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgbWF4V2FpdCk7XG4gICAgICB9XG4gICAgICBfZmxhc2hTdGF0ZS5vdmVyZHVlID0gZmFsc2U7XG4gICAgICBfZW1iZWRTd2YoKTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuZGVzdHJveWAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIFplcm9DbGlwYm9hcmQuY2xlYXJEYXRhKCk7XG4gICAgWmVyb0NsaXBib2FyZC5ibHVyKCk7XG4gICAgWmVyb0NsaXBib2FyZC5lbWl0KFwiZGVzdHJveVwiKTtcbiAgICBfdW5lbWJlZFN3ZigpO1xuICAgIFplcm9DbGlwYm9hcmQub2ZmKCk7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuc2V0RGF0YWAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfc2V0RGF0YSA9IGZ1bmN0aW9uKGZvcm1hdCwgZGF0YSkge1xuICAgIHZhciBkYXRhT2JqO1xuICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSBcIm9iamVjdFwiICYmIGZvcm1hdCAmJiB0eXBlb2YgZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZGF0YU9iaiA9IGZvcm1hdDtcbiAgICAgIFplcm9DbGlwYm9hcmQuY2xlYXJEYXRhKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZm9ybWF0ID09PSBcInN0cmluZ1wiICYmIGZvcm1hdCkge1xuICAgICAgZGF0YU9iaiA9IHt9O1xuICAgICAgZGF0YU9ialtmb3JtYXRdID0gZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciBkYXRhRm9ybWF0IGluIGRhdGFPYmopIHtcbiAgICAgIGlmICh0eXBlb2YgZGF0YUZvcm1hdCA9PT0gXCJzdHJpbmdcIiAmJiBkYXRhRm9ybWF0ICYmIF9oYXNPd24uY2FsbChkYXRhT2JqLCBkYXRhRm9ybWF0KSAmJiB0eXBlb2YgZGF0YU9ialtkYXRhRm9ybWF0XSA9PT0gXCJzdHJpbmdcIiAmJiBkYXRhT2JqW2RhdGFGb3JtYXRdKSB7XG4gICAgICAgIF9jbGlwRGF0YVtkYXRhRm9ybWF0XSA9IGRhdGFPYmpbZGF0YUZvcm1hdF07XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLmNsZWFyRGF0YWAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2xlYXJEYXRhID0gZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIF9kZWxldGVPd25Qcm9wZXJ0aWVzKF9jbGlwRGF0YSk7XG4gICAgICBfY2xpcERhdGFGb3JtYXRNYXAgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZvcm1hdCA9PT0gXCJzdHJpbmdcIiAmJiBfaGFzT3duLmNhbGwoX2NsaXBEYXRhLCBmb3JtYXQpKSB7XG4gICAgICBkZWxldGUgX2NsaXBEYXRhW2Zvcm1hdF07XG4gICAgfVxuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLmdldERhdGFgLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2dldERhdGEgPSBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcmV0dXJuIF9kZWVwQ29weShfY2xpcERhdGEpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZvcm1hdCA9PT0gXCJzdHJpbmdcIiAmJiBfaGFzT3duLmNhbGwoX2NsaXBEYXRhLCBmb3JtYXQpKSB7XG4gICAgICByZXR1cm4gX2NsaXBEYXRhW2Zvcm1hdF07XG4gICAgfVxuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLmZvY3VzYC9gWmVyb0NsaXBib2FyZC5hY3RpdmF0ZWAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZm9jdXMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgaWYgKCEoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlID09PSAxKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoX2N1cnJlbnRFbGVtZW50KSB7XG4gICAgICBfcmVtb3ZlQ2xhc3MoX2N1cnJlbnRFbGVtZW50LCBfZ2xvYmFsQ29uZmlnLmFjdGl2ZUNsYXNzKTtcbiAgICAgIGlmIChfY3VycmVudEVsZW1lbnQgIT09IGVsZW1lbnQpIHtcbiAgICAgICAgX3JlbW92ZUNsYXNzKF9jdXJyZW50RWxlbWVudCwgX2dsb2JhbENvbmZpZy5ob3ZlckNsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2N1cnJlbnRFbGVtZW50ID0gZWxlbWVudDtcbiAgICBfYWRkQ2xhc3MoZWxlbWVudCwgX2dsb2JhbENvbmZpZy5ob3ZlckNsYXNzKTtcbiAgICB2YXIgbmV3VGl0bGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcInRpdGxlXCIpIHx8IF9nbG9iYWxDb25maWcudGl0bGU7XG4gICAgaWYgKHR5cGVvZiBuZXdUaXRsZSA9PT0gXCJzdHJpbmdcIiAmJiBuZXdUaXRsZSkge1xuICAgICAgdmFyIGh0bWxCcmlkZ2UgPSBfZ2V0SHRtbEJyaWRnZShfZmxhc2hTdGF0ZS5icmlkZ2UpO1xuICAgICAgaWYgKGh0bWxCcmlkZ2UpIHtcbiAgICAgICAgaHRtbEJyaWRnZS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBuZXdUaXRsZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB1c2VIYW5kQ3Vyc29yID0gX2dsb2JhbENvbmZpZy5mb3JjZUhhbmRDdXJzb3IgPT09IHRydWUgfHwgX2dldFN0eWxlKGVsZW1lbnQsIFwiY3Vyc29yXCIpID09PSBcInBvaW50ZXJcIjtcbiAgICBfc2V0SGFuZEN1cnNvcih1c2VIYW5kQ3Vyc29yKTtcbiAgICBfcmVwb3NpdGlvbigpO1xuICB9O1xuICAvKipcbiAqIFRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIGBaZXJvQ2xpcGJvYXJkLmJsdXJgL2BaZXJvQ2xpcGJvYXJkLmRlYWN0aXZhdGVgLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2JsdXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaHRtbEJyaWRnZSA9IF9nZXRIdG1sQnJpZGdlKF9mbGFzaFN0YXRlLmJyaWRnZSk7XG4gICAgaWYgKGh0bWxCcmlkZ2UpIHtcbiAgICAgIGh0bWxCcmlkZ2UucmVtb3ZlQXR0cmlidXRlKFwidGl0bGVcIik7XG4gICAgICBodG1sQnJpZGdlLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgICAgaHRtbEJyaWRnZS5zdHlsZS50b3AgPSBcIi05OTk5cHhcIjtcbiAgICAgIGh0bWxCcmlkZ2Uuc3R5bGUud2lkdGggPSBcIjFweFwiO1xuICAgICAgaHRtbEJyaWRnZS5zdHlsZS50b3AgPSBcIjFweFwiO1xuICAgIH1cbiAgICBpZiAoX2N1cnJlbnRFbGVtZW50KSB7XG4gICAgICBfcmVtb3ZlQ2xhc3MoX2N1cnJlbnRFbGVtZW50LCBfZ2xvYmFsQ29uZmlnLmhvdmVyQ2xhc3MpO1xuICAgICAgX3JlbW92ZUNsYXNzKF9jdXJyZW50RWxlbWVudCwgX2dsb2JhbENvbmZpZy5hY3RpdmVDbGFzcyk7XG4gICAgICBfY3VycmVudEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBUaGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiBgWmVyb0NsaXBib2FyZC5hY3RpdmVFbGVtZW50YC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9hY3RpdmVFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF9jdXJyZW50RWxlbWVudCB8fCBudWxsO1xuICB9O1xuICAvKipcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYSB2YWxpZCBIVE1MNCBgSURgIG9yIGBOYW1lYCB0b2tlbi5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9pc1ZhbGlkSHRtbDRJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIiAmJiBpZCAmJiAvXltBLVphLXpdW0EtWmEtejAtOV86XFwtXFwuXSokLy50ZXN0KGlkKTtcbiAgfTtcbiAgLyoqXG4gKiBDcmVhdGUgb3IgdXBkYXRlIGFuIGBldmVudGAgb2JqZWN0LCBiYXNlZCBvbiB0aGUgYGV2ZW50VHlwZWAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY3JlYXRlRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBldmVudFR5cGU7XG4gICAgaWYgKHR5cGVvZiBldmVudCA9PT0gXCJzdHJpbmdcIiAmJiBldmVudCkge1xuICAgICAgZXZlbnRUeXBlID0gZXZlbnQ7XG4gICAgICBldmVudCA9IHt9O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV2ZW50ID09PSBcIm9iamVjdFwiICYmIGV2ZW50ICYmIHR5cGVvZiBldmVudC50eXBlID09PSBcInN0cmluZ1wiICYmIGV2ZW50LnR5cGUpIHtcbiAgICAgIGV2ZW50VHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgfVxuICAgIGlmICghZXZlbnRUeXBlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghZXZlbnQudGFyZ2V0ICYmIC9eKGNvcHl8YWZ0ZXJjb3B5fF9jbGljaykkLy50ZXN0KGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgZXZlbnQudGFyZ2V0ID0gX2NvcHlUYXJnZXQ7XG4gICAgfVxuICAgIF9leHRlbmQoZXZlbnQsIHtcbiAgICAgIHR5cGU6IGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpLFxuICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQgfHwgX2N1cnJlbnRFbGVtZW50IHx8IG51bGwsXG4gICAgICByZWxhdGVkVGFyZ2V0OiBldmVudC5yZWxhdGVkVGFyZ2V0IHx8IG51bGwsXG4gICAgICBjdXJyZW50VGFyZ2V0OiBfZmxhc2hTdGF0ZSAmJiBfZmxhc2hTdGF0ZS5icmlkZ2UgfHwgbnVsbCxcbiAgICAgIHRpbWVTdGFtcDogZXZlbnQudGltZVN0YW1wIHx8IF9ub3coKSB8fCBudWxsXG4gICAgfSk7XG4gICAgdmFyIG1zZyA9IF9ldmVudE1lc3NhZ2VzW2V2ZW50LnR5cGVdO1xuICAgIGlmIChldmVudC50eXBlID09PSBcImVycm9yXCIgJiYgZXZlbnQubmFtZSAmJiBtc2cpIHtcbiAgICAgIG1zZyA9IG1zZ1tldmVudC5uYW1lXTtcbiAgICB9XG4gICAgaWYgKG1zZykge1xuICAgICAgZXZlbnQubWVzc2FnZSA9IG1zZztcbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwicmVhZHlcIikge1xuICAgICAgX2V4dGVuZChldmVudCwge1xuICAgICAgICB0YXJnZXQ6IG51bGwsXG4gICAgICAgIHZlcnNpb246IF9mbGFzaFN0YXRlLnZlcnNpb25cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJlcnJvclwiKSB7XG4gICAgICBpZiAoL15mbGFzaC0oZGlzYWJsZWR8b3V0ZGF0ZWR8dW5hdmFpbGFibGV8ZGVhY3RpdmF0ZWR8b3ZlcmR1ZSkkLy50ZXN0KGV2ZW50Lm5hbWUpKSB7XG4gICAgICAgIF9leHRlbmQoZXZlbnQsIHtcbiAgICAgICAgICB0YXJnZXQ6IG51bGwsXG4gICAgICAgICAgbWluaW11bVZlcnNpb246IF9taW5pbXVtRmxhc2hWZXJzaW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKC9eZmxhc2gtKG91dGRhdGVkfHVuYXZhaWxhYmxlfGRlYWN0aXZhdGVkfG92ZXJkdWUpJC8udGVzdChldmVudC5uYW1lKSkge1xuICAgICAgICBfZXh0ZW5kKGV2ZW50LCB7XG4gICAgICAgICAgdmVyc2lvbjogX2ZsYXNoU3RhdGUudmVyc2lvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwiY29weVwiKSB7XG4gICAgICBldmVudC5jbGlwYm9hcmREYXRhID0ge1xuICAgICAgICBzZXREYXRhOiBaZXJvQ2xpcGJvYXJkLnNldERhdGEsXG4gICAgICAgIGNsZWFyRGF0YTogWmVyb0NsaXBib2FyZC5jbGVhckRhdGFcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChldmVudC50eXBlID09PSBcImFmdGVyY29weVwiKSB7XG4gICAgICBldmVudCA9IF9tYXBDbGlwUmVzdWx0c0Zyb21GbGFzaChldmVudCwgX2NsaXBEYXRhRm9ybWF0TWFwKTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LnRhcmdldCAmJiAhZXZlbnQucmVsYXRlZFRhcmdldCkge1xuICAgICAgZXZlbnQucmVsYXRlZFRhcmdldCA9IF9nZXRSZWxhdGVkVGFyZ2V0KGV2ZW50LnRhcmdldCk7XG4gICAgfVxuICAgIGV2ZW50ID0gX2FkZE1vdXNlRGF0YShldmVudCk7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9O1xuICAvKipcbiAqIEdldCBhIHJlbGF0ZWRUYXJnZXQgZnJvbSB0aGUgdGFyZ2V0J3MgYGRhdGEtY2xpcGJvYXJkLXRhcmdldGAgYXR0cmlidXRlXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZ2V0UmVsYXRlZFRhcmdldCA9IGZ1bmN0aW9uKHRhcmdldEVsKSB7XG4gICAgdmFyIHJlbGF0ZWRUYXJnZXRJZCA9IHRhcmdldEVsICYmIHRhcmdldEVsLmdldEF0dHJpYnV0ZSAmJiB0YXJnZXRFbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNsaXBib2FyZC10YXJnZXRcIik7XG4gICAgcmV0dXJuIHJlbGF0ZWRUYXJnZXRJZCA/IF9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChyZWxhdGVkVGFyZ2V0SWQpIDogbnVsbDtcbiAgfTtcbiAgLyoqXG4gKiBBZGQgZWxlbWVudCBhbmQgcG9zaXRpb24gZGF0YSB0byBgTW91c2VFdmVudGAgaW5zdGFuY2VzXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfYWRkTW91c2VEYXRhID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQgJiYgL15fKD86Y2xpY2t8bW91c2UoPzpvdmVyfG91dHxkb3dufHVwfG1vdmUpKSQvLnRlc3QoZXZlbnQudHlwZSkpIHtcbiAgICAgIHZhciBzcmNFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgdmFyIGZyb21FbGVtZW50ID0gZXZlbnQudHlwZSA9PT0gXCJfbW91c2VvdmVyXCIgJiYgZXZlbnQucmVsYXRlZFRhcmdldCA/IGV2ZW50LnJlbGF0ZWRUYXJnZXQgOiB1bmRlZmluZWQ7XG4gICAgICB2YXIgdG9FbGVtZW50ID0gZXZlbnQudHlwZSA9PT0gXCJfbW91c2VvdXRcIiAmJiBldmVudC5yZWxhdGVkVGFyZ2V0ID8gZXZlbnQucmVsYXRlZFRhcmdldCA6IHVuZGVmaW5lZDtcbiAgICAgIHZhciBwb3MgPSBfZ2V0RE9NT2JqZWN0UG9zaXRpb24oc3JjRWxlbWVudCk7XG4gICAgICB2YXIgc2NyZWVuTGVmdCA9IF93aW5kb3cuc2NyZWVuTGVmdCB8fCBfd2luZG93LnNjcmVlblggfHwgMDtcbiAgICAgIHZhciBzY3JlZW5Ub3AgPSBfd2luZG93LnNjcmVlblRvcCB8fCBfd2luZG93LnNjcmVlblkgfHwgMDtcbiAgICAgIHZhciBzY3JvbGxMZWZ0ID0gX2RvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCArIF9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgIHZhciBzY3JvbGxUb3AgPSBfZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyBfZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgIHZhciBwYWdlWCA9IHBvcy5sZWZ0ICsgKHR5cGVvZiBldmVudC5fc3RhZ2VYID09PSBcIm51bWJlclwiID8gZXZlbnQuX3N0YWdlWCA6IDApO1xuICAgICAgdmFyIHBhZ2VZID0gcG9zLnRvcCArICh0eXBlb2YgZXZlbnQuX3N0YWdlWSA9PT0gXCJudW1iZXJcIiA/IGV2ZW50Ll9zdGFnZVkgOiAwKTtcbiAgICAgIHZhciBjbGllbnRYID0gcGFnZVggLSBzY3JvbGxMZWZ0O1xuICAgICAgdmFyIGNsaWVudFkgPSBwYWdlWSAtIHNjcm9sbFRvcDtcbiAgICAgIHZhciBzY3JlZW5YID0gc2NyZWVuTGVmdCArIGNsaWVudFg7XG4gICAgICB2YXIgc2NyZWVuWSA9IHNjcmVlblRvcCArIGNsaWVudFk7XG4gICAgICB2YXIgbW92ZVggPSB0eXBlb2YgZXZlbnQubW92ZW1lbnRYID09PSBcIm51bWJlclwiID8gZXZlbnQubW92ZW1lbnRYIDogMDtcbiAgICAgIHZhciBtb3ZlWSA9IHR5cGVvZiBldmVudC5tb3ZlbWVudFkgPT09IFwibnVtYmVyXCIgPyBldmVudC5tb3ZlbWVudFkgOiAwO1xuICAgICAgZGVsZXRlIGV2ZW50Ll9zdGFnZVg7XG4gICAgICBkZWxldGUgZXZlbnQuX3N0YWdlWTtcbiAgICAgIF9leHRlbmQoZXZlbnQsIHtcbiAgICAgICAgc3JjRWxlbWVudDogc3JjRWxlbWVudCxcbiAgICAgICAgZnJvbUVsZW1lbnQ6IGZyb21FbGVtZW50LFxuICAgICAgICB0b0VsZW1lbnQ6IHRvRWxlbWVudCxcbiAgICAgICAgc2NyZWVuWDogc2NyZWVuWCxcbiAgICAgICAgc2NyZWVuWTogc2NyZWVuWSxcbiAgICAgICAgcGFnZVg6IHBhZ2VYLFxuICAgICAgICBwYWdlWTogcGFnZVksXG4gICAgICAgIGNsaWVudFg6IGNsaWVudFgsXG4gICAgICAgIGNsaWVudFk6IGNsaWVudFksXG4gICAgICAgIHg6IGNsaWVudFgsXG4gICAgICAgIHk6IGNsaWVudFksXG4gICAgICAgIG1vdmVtZW50WDogbW92ZVgsXG4gICAgICAgIG1vdmVtZW50WTogbW92ZVksXG4gICAgICAgIG9mZnNldFg6IDAsXG4gICAgICAgIG9mZnNldFk6IDAsXG4gICAgICAgIGxheWVyWDogMCxcbiAgICAgICAgbGF5ZXJZOiAwXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9O1xuICAvKipcbiAqIERldGVybWluZSBpZiBhbiBldmVudCdzIHJlZ2lzdGVyZWQgaGFuZGxlcnMgc2hvdWxkIGJlIGV4ZWN1dGUgc3luY2hyb25vdXNseSBvciBhc3luY2hyb25vdXNseS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9zaG91bGRQZXJmb3JtQXN5bmMgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBldmVudFR5cGUgPSBldmVudCAmJiB0eXBlb2YgZXZlbnQudHlwZSA9PT0gXCJzdHJpbmdcIiAmJiBldmVudC50eXBlIHx8IFwiXCI7XG4gICAgcmV0dXJuICEvXig/Oig/OmJlZm9yZSk/Y29weXxkZXN0cm95KSQvLnRlc3QoZXZlbnRUeXBlKTtcbiAgfTtcbiAgLyoqXG4gKiBDb250cm9sIGlmIGEgY2FsbGJhY2sgc2hvdWxkIGJlIGV4ZWN1dGVkIGFzeW5jaHJvbm91c2x5IG9yIG5vdC5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2Rpc3BhdGNoQ2FsbGJhY2sgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdzLCBhc3luYykge1xuICAgIGlmIChhc3luYykge1xuICAgICAgX3NldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICB9LCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICogSGFuZGxlIHRoZSBhY3R1YWwgZGlzcGF0Y2hpbmcgb2YgZXZlbnRzIHRvIGNsaWVudCBpbnN0YW5jZXMuXG4gKlxuICogQHJldHVybnMgYHVuZGVmaW5lZGBcbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9kaXNwYXRjaENhbGxiYWNrcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKCEodHlwZW9mIGV2ZW50ID09PSBcIm9iamVjdFwiICYmIGV2ZW50ICYmIGV2ZW50LnR5cGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBhc3luYyA9IF9zaG91bGRQZXJmb3JtQXN5bmMoZXZlbnQpO1xuICAgIHZhciB3aWxkY2FyZFR5cGVIYW5kbGVycyA9IF9oYW5kbGVyc1tcIipcIl0gfHwgW107XG4gICAgdmFyIHNwZWNpZmljVHlwZUhhbmRsZXJzID0gX2hhbmRsZXJzW2V2ZW50LnR5cGVdIHx8IFtdO1xuICAgIHZhciBoYW5kbGVycyA9IHdpbGRjYXJkVHlwZUhhbmRsZXJzLmNvbmNhdChzcGVjaWZpY1R5cGVIYW5kbGVycyk7XG4gICAgaWYgKGhhbmRsZXJzICYmIGhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgdmFyIGksIGxlbiwgZnVuYywgY29udGV4dCwgZXZlbnRDb3B5LCBvcmlnaW5hbENvbnRleHQgPSB0aGlzO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gaGFuZGxlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZnVuYyA9IGhhbmRsZXJzW2ldO1xuICAgICAgICBjb250ZXh0ID0gb3JpZ2luYWxDb250ZXh0O1xuICAgICAgICBpZiAodHlwZW9mIGZ1bmMgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIF93aW5kb3dbZnVuY10gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGZ1bmMgPSBfd2luZG93W2Z1bmNdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gXCJvYmplY3RcIiAmJiBmdW5jICYmIHR5cGVvZiBmdW5jLmhhbmRsZUV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBjb250ZXh0ID0gZnVuYztcbiAgICAgICAgICBmdW5jID0gZnVuYy5oYW5kbGVFdmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZ1bmMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGV2ZW50Q29weSA9IF9leHRlbmQoe30sIGV2ZW50KTtcbiAgICAgICAgICBfZGlzcGF0Y2hDYWxsYmFjayhmdW5jLCBjb250ZXh0LCBbIGV2ZW50Q29weSBdLCBhc3luYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxuICogUHJlcHJvY2VzcyBhbnkgc3BlY2lhbCBiZWhhdmlvcnMsIHJlYWN0aW9ucywgb3Igc3RhdGUgY2hhbmdlcyBhZnRlciByZWNlaXZpbmcgdGhpcyBldmVudC5cbiAqIEV4ZWN1dGVzIG9ubHkgb25jZSBwZXIgZXZlbnQgZW1pdHRlZCwgTk9UIG9uY2UgcGVyIGNsaWVudC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9wcmVwcm9jZXNzRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0IHx8IF9jdXJyZW50RWxlbWVudCB8fCBudWxsO1xuICAgIHZhciBzb3VyY2VJc1N3ZiA9IGV2ZW50Ll9zb3VyY2UgPT09IFwic3dmXCI7XG4gICAgZGVsZXRlIGV2ZW50Ll9zb3VyY2U7XG4gICAgdmFyIGZsYXNoRXJyb3JOYW1lcyA9IFsgXCJmbGFzaC1kaXNhYmxlZFwiLCBcImZsYXNoLW91dGRhdGVkXCIsIFwiZmxhc2gtdW5hdmFpbGFibGVcIiwgXCJmbGFzaC1kZWFjdGl2YXRlZFwiLCBcImZsYXNoLW92ZXJkdWVcIiBdO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgIGlmIChmbGFzaEVycm9yTmFtZXMuaW5kZXhPZihldmVudC5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgX2V4dGVuZChfZmxhc2hTdGF0ZSwge1xuICAgICAgICAgIGRpc2FibGVkOiBldmVudC5uYW1lID09PSBcImZsYXNoLWRpc2FibGVkXCIsXG4gICAgICAgICAgb3V0ZGF0ZWQ6IGV2ZW50Lm5hbWUgPT09IFwiZmxhc2gtb3V0ZGF0ZWRcIixcbiAgICAgICAgICB1bmF2YWlsYWJsZTogZXZlbnQubmFtZSA9PT0gXCJmbGFzaC11bmF2YWlsYWJsZVwiLFxuICAgICAgICAgIGRlYWN0aXZhdGVkOiBldmVudC5uYW1lID09PSBcImZsYXNoLWRlYWN0aXZhdGVkXCIsXG4gICAgICAgICAgb3ZlcmR1ZTogZXZlbnQubmFtZSA9PT0gXCJmbGFzaC1vdmVyZHVlXCIsXG4gICAgICAgICAgcmVhZHk6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcInJlYWR5XCI6XG4gICAgICB2YXIgd2FzRGVhY3RpdmF0ZWQgPSBfZmxhc2hTdGF0ZS5kZWFjdGl2YXRlZCA9PT0gdHJ1ZTtcbiAgICAgIF9leHRlbmQoX2ZsYXNoU3RhdGUsIHtcbiAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICBvdXRkYXRlZDogZmFsc2UsXG4gICAgICAgIHVuYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgZGVhY3RpdmF0ZWQ6IGZhbHNlLFxuICAgICAgICBvdmVyZHVlOiB3YXNEZWFjdGl2YXRlZCxcbiAgICAgICAgcmVhZHk6ICF3YXNEZWFjdGl2YXRlZFxuICAgICAgfSk7XG4gICAgICBicmVhaztcblxuICAgICBjYXNlIFwiYmVmb3JlY29weVwiOlxuICAgICAgX2NvcHlUYXJnZXQgPSBlbGVtZW50O1xuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcImNvcHlcIjpcbiAgICAgIHZhciB0ZXh0Q29udGVudCwgaHRtbENvbnRlbnQsIHRhcmdldEVsID0gZXZlbnQucmVsYXRlZFRhcmdldDtcbiAgICAgIGlmICghKF9jbGlwRGF0YVtcInRleHQvaHRtbFwiXSB8fCBfY2xpcERhdGFbXCJ0ZXh0L3BsYWluXCJdKSAmJiB0YXJnZXRFbCAmJiAoaHRtbENvbnRlbnQgPSB0YXJnZXRFbC52YWx1ZSB8fCB0YXJnZXRFbC5vdXRlckhUTUwgfHwgdGFyZ2V0RWwuaW5uZXJIVE1MKSAmJiAodGV4dENvbnRlbnQgPSB0YXJnZXRFbC52YWx1ZSB8fCB0YXJnZXRFbC50ZXh0Q29udGVudCB8fCB0YXJnZXRFbC5pbm5lclRleHQpKSB7XG4gICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuY2xlYXJEYXRhKCk7XG4gICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgdGV4dENvbnRlbnQpO1xuICAgICAgICBpZiAoaHRtbENvbnRlbnQgIT09IHRleHRDb250ZW50KSB7XG4gICAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKFwidGV4dC9odG1sXCIsIGh0bWxDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghX2NsaXBEYXRhW1widGV4dC9wbGFpblwiXSAmJiBldmVudC50YXJnZXQgJiYgKHRleHRDb250ZW50ID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtY2xpcGJvYXJkLXRleHRcIikpKSB7XG4gICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuY2xlYXJEYXRhKCk7XG4gICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgdGV4dENvbnRlbnQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcImFmdGVyY29weVwiOlxuICAgICAgWmVyb0NsaXBib2FyZC5jbGVhckRhdGEoKTtcbiAgICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQgIT09IF9zYWZlQWN0aXZlRWxlbWVudCgpICYmIGVsZW1lbnQuZm9jdXMpIHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcIl9tb3VzZW92ZXJcIjpcbiAgICAgIFplcm9DbGlwYm9hcmQuZm9jdXMoZWxlbWVudCk7XG4gICAgICBpZiAoX2dsb2JhbENvbmZpZy5idWJibGVFdmVudHMgPT09IHRydWUgJiYgc291cmNlSXNTd2YpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudCAhPT0gZXZlbnQucmVsYXRlZFRhcmdldCAmJiAhX2NvbnRhaW5lZEJ5KGV2ZW50LnJlbGF0ZWRUYXJnZXQsIGVsZW1lbnQpKSB7XG4gICAgICAgICAgX2ZpcmVNb3VzZUV2ZW50KF9leHRlbmQoe30sIGV2ZW50LCB7XG4gICAgICAgICAgICB0eXBlOiBcIm1vdXNlZW50ZXJcIixcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgX2ZpcmVNb3VzZUV2ZW50KF9leHRlbmQoe30sIGV2ZW50LCB7XG4gICAgICAgICAgdHlwZTogXCJtb3VzZW92ZXJcIlxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgICBjYXNlIFwiX21vdXNlb3V0XCI6XG4gICAgICBaZXJvQ2xpcGJvYXJkLmJsdXIoKTtcbiAgICAgIGlmIChfZ2xvYmFsQ29uZmlnLmJ1YmJsZUV2ZW50cyA9PT0gdHJ1ZSAmJiBzb3VyY2VJc1N3Zikge1xuICAgICAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50ICE9PSBldmVudC5yZWxhdGVkVGFyZ2V0ICYmICFfY29udGFpbmVkQnkoZXZlbnQucmVsYXRlZFRhcmdldCwgZWxlbWVudCkpIHtcbiAgICAgICAgICBfZmlyZU1vdXNlRXZlbnQoX2V4dGVuZCh7fSwgZXZlbnQsIHtcbiAgICAgICAgICAgIHR5cGU6IFwibW91c2VsZWF2ZVwiLFxuICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBfZmlyZU1vdXNlRXZlbnQoX2V4dGVuZCh7fSwgZXZlbnQsIHtcbiAgICAgICAgICB0eXBlOiBcIm1vdXNlb3V0XCJcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcIl9tb3VzZWRvd25cIjpcbiAgICAgIF9hZGRDbGFzcyhlbGVtZW50LCBfZ2xvYmFsQ29uZmlnLmFjdGl2ZUNsYXNzKTtcbiAgICAgIGlmIChfZ2xvYmFsQ29uZmlnLmJ1YmJsZUV2ZW50cyA9PT0gdHJ1ZSAmJiBzb3VyY2VJc1N3Zikge1xuICAgICAgICBfZmlyZU1vdXNlRXZlbnQoX2V4dGVuZCh7fSwgZXZlbnQsIHtcbiAgICAgICAgICB0eXBlOiBldmVudC50eXBlLnNsaWNlKDEpXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgIGNhc2UgXCJfbW91c2V1cFwiOlxuICAgICAgX3JlbW92ZUNsYXNzKGVsZW1lbnQsIF9nbG9iYWxDb25maWcuYWN0aXZlQ2xhc3MpO1xuICAgICAgaWYgKF9nbG9iYWxDb25maWcuYnViYmxlRXZlbnRzID09PSB0cnVlICYmIHNvdXJjZUlzU3dmKSB7XG4gICAgICAgIF9maXJlTW91c2VFdmVudChfZXh0ZW5kKHt9LCBldmVudCwge1xuICAgICAgICAgIHR5cGU6IGV2ZW50LnR5cGUuc2xpY2UoMSlcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcIl9jbGlja1wiOlxuICAgICAgX2NvcHlUYXJnZXQgPSBudWxsO1xuICAgICAgaWYgKF9nbG9iYWxDb25maWcuYnViYmxlRXZlbnRzID09PSB0cnVlICYmIHNvdXJjZUlzU3dmKSB7XG4gICAgICAgIF9maXJlTW91c2VFdmVudChfZXh0ZW5kKHt9LCBldmVudCwge1xuICAgICAgICAgIHR5cGU6IGV2ZW50LnR5cGUuc2xpY2UoMSlcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICAgY2FzZSBcIl9tb3VzZW1vdmVcIjpcbiAgICAgIGlmIChfZ2xvYmFsQ29uZmlnLmJ1YmJsZUV2ZW50cyA9PT0gdHJ1ZSAmJiBzb3VyY2VJc1N3Zikge1xuICAgICAgICBfZmlyZU1vdXNlRXZlbnQoX2V4dGVuZCh7fSwgZXZlbnQsIHtcbiAgICAgICAgICB0eXBlOiBldmVudC50eXBlLnNsaWNlKDEpXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoL15fKD86Y2xpY2t8bW91c2UoPzpvdmVyfG91dHxkb3dufHVwfG1vdmUpKSQvLnRlc3QoZXZlbnQudHlwZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBEaXNwYXRjaCBhIHN5bnRoZXRpYyBNb3VzZUV2ZW50LlxuICpcbiAqIEByZXR1cm5zIGB1bmRlZmluZWRgXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZmlyZU1vdXNlRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICghKGV2ZW50ICYmIHR5cGVvZiBldmVudC50eXBlID09PSBcInN0cmluZ1wiICYmIGV2ZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZSwgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IHx8IG51bGwsIGRvYyA9IHRhcmdldCAmJiB0YXJnZXQub3duZXJEb2N1bWVudCB8fCBfZG9jdW1lbnQsIGRlZmF1bHRzID0ge1xuICAgICAgdmlldzogZG9jLmRlZmF1bHRWaWV3IHx8IF93aW5kb3csXG4gICAgICBjYW5CdWJibGU6IHRydWUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgZGV0YWlsOiBldmVudC50eXBlID09PSBcImNsaWNrXCIgPyAxIDogMCxcbiAgICAgIGJ1dHRvbjogdHlwZW9mIGV2ZW50LndoaWNoID09PSBcIm51bWJlclwiID8gZXZlbnQud2hpY2ggLSAxIDogdHlwZW9mIGV2ZW50LmJ1dHRvbiA9PT0gXCJudW1iZXJcIiA/IGV2ZW50LmJ1dHRvbiA6IGRvYy5jcmVhdGVFdmVudCA/IDAgOiAxXG4gICAgfSwgYXJncyA9IF9leHRlbmQoZGVmYXVsdHMsIGV2ZW50KTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZG9jLmNyZWF0ZUV2ZW50ICYmIHRhcmdldC5kaXNwYXRjaEV2ZW50KSB7XG4gICAgICBhcmdzID0gWyBhcmdzLnR5cGUsIGFyZ3MuY2FuQnViYmxlLCBhcmdzLmNhbmNlbGFibGUsIGFyZ3MudmlldywgYXJncy5kZXRhaWwsIGFyZ3Muc2NyZWVuWCwgYXJncy5zY3JlZW5ZLCBhcmdzLmNsaWVudFgsIGFyZ3MuY2xpZW50WSwgYXJncy5jdHJsS2V5LCBhcmdzLmFsdEtleSwgYXJncy5zaGlmdEtleSwgYXJncy5tZXRhS2V5LCBhcmdzLmJ1dHRvbiwgYXJncy5yZWxhdGVkVGFyZ2V0IF07XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gICAgICBpZiAoZS5pbml0TW91c2VFdmVudCkge1xuICAgICAgICBlLmluaXRNb3VzZUV2ZW50LmFwcGx5KGUsIGFyZ3MpO1xuICAgICAgICBlLl9zb3VyY2UgPSBcImpzXCI7XG4gICAgICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBDcmVhdGUgdGhlIEhUTUwgYnJpZGdlIGVsZW1lbnQgdG8gZW1iZWQgdGhlIEZsYXNoIG9iamVjdCBpbnRvLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2NyZWF0ZUh0bWxCcmlkZ2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGFpbmVyID0gX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGFpbmVyLmlkID0gX2dsb2JhbENvbmZpZy5jb250YWluZXJJZDtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gX2dsb2JhbENvbmZpZy5jb250YWluZXJDbGFzcztcbiAgICBjb250YWluZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgY29udGFpbmVyLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgIGNvbnRhaW5lci5zdHlsZS50b3AgPSBcIi05OTk5cHhcIjtcbiAgICBjb250YWluZXIuc3R5bGUud2lkdGggPSBcIjFweFwiO1xuICAgIGNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBcIjFweFwiO1xuICAgIGNvbnRhaW5lci5zdHlsZS56SW5kZXggPSBcIlwiICsgX2dldFNhZmVaSW5kZXgoX2dsb2JhbENvbmZpZy56SW5kZXgpO1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH07XG4gIC8qKlxuICogR2V0IHRoZSBIVE1MIGVsZW1lbnQgY29udGFpbmVyIHRoYXQgd3JhcHMgdGhlIEZsYXNoIGJyaWRnZSBvYmplY3QvZWxlbWVudC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9nZXRIdG1sQnJpZGdlID0gZnVuY3Rpb24oZmxhc2hCcmlkZ2UpIHtcbiAgICB2YXIgaHRtbEJyaWRnZSA9IGZsYXNoQnJpZGdlICYmIGZsYXNoQnJpZGdlLnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKGh0bWxCcmlkZ2UgJiYgaHRtbEJyaWRnZS5ub2RlTmFtZSA9PT0gXCJPQkpFQ1RcIiAmJiBodG1sQnJpZGdlLnBhcmVudE5vZGUpIHtcbiAgICAgIGh0bWxCcmlkZ2UgPSBodG1sQnJpZGdlLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBodG1sQnJpZGdlIHx8IG51bGw7XG4gIH07XG4gIC8qKlxuICogQ3JlYXRlIHRoZSBTV0Ygb2JqZWN0LlxuICpcbiAqIEByZXR1cm5zIFRoZSBTV0Ygb2JqZWN0IHJlZmVyZW5jZS5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9lbWJlZFN3ZiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW4sIGZsYXNoQnJpZGdlID0gX2ZsYXNoU3RhdGUuYnJpZGdlLCBjb250YWluZXIgPSBfZ2V0SHRtbEJyaWRnZShmbGFzaEJyaWRnZSk7XG4gICAgaWYgKCFmbGFzaEJyaWRnZSkge1xuICAgICAgdmFyIGFsbG93U2NyaXB0QWNjZXNzID0gX2RldGVybWluZVNjcmlwdEFjY2Vzcyhfd2luZG93LmxvY2F0aW9uLmhvc3QsIF9nbG9iYWxDb25maWcpO1xuICAgICAgdmFyIGFsbG93TmV0d29ya2luZyA9IGFsbG93U2NyaXB0QWNjZXNzID09PSBcIm5ldmVyXCIgPyBcIm5vbmVcIiA6IFwiYWxsXCI7XG4gICAgICB2YXIgZmxhc2h2YXJzID0gX3ZhcnMoX2dsb2JhbENvbmZpZyk7XG4gICAgICB2YXIgc3dmVXJsID0gX2dsb2JhbENvbmZpZy5zd2ZQYXRoICsgX2NhY2hlQnVzdChfZ2xvYmFsQ29uZmlnLnN3ZlBhdGgsIF9nbG9iYWxDb25maWcpO1xuICAgICAgY29udGFpbmVyID0gX2NyZWF0ZUh0bWxCcmlkZ2UoKTtcbiAgICAgIHZhciBkaXZUb0JlUmVwbGFjZWQgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXZUb0JlUmVwbGFjZWQpO1xuICAgICAgX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICAgIHZhciB0bXBEaXYgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHZhciBvbGRJRSA9IF9mbGFzaFN0YXRlLnBsdWdpblR5cGUgPT09IFwiYWN0aXZleFwiO1xuICAgICAgdG1wRGl2LmlubmVySFRNTCA9ICc8b2JqZWN0IGlkPVwiJyArIF9nbG9iYWxDb25maWcuc3dmT2JqZWN0SWQgKyAnXCIgbmFtZT1cIicgKyBfZ2xvYmFsQ29uZmlnLnN3Zk9iamVjdElkICsgJ1wiICcgKyAnd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiICcgKyAob2xkSUUgPyAnY2xhc3NpZD1cImNsc2lkOmQyN2NkYjZlLWFlNmQtMTFjZi05NmI4LTQ0NDU1MzU0MDAwMFwiJyA6ICd0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiBkYXRhPVwiJyArIHN3ZlVybCArICdcIicpICsgXCI+XCIgKyAob2xkSUUgPyAnPHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJyArIHN3ZlVybCArICdcIi8+JyA6IFwiXCIpICsgJzxwYXJhbSBuYW1lPVwiYWxsb3dTY3JpcHRBY2Nlc3NcIiB2YWx1ZT1cIicgKyBhbGxvd1NjcmlwdEFjY2VzcyArICdcIi8+JyArICc8cGFyYW0gbmFtZT1cImFsbG93TmV0d29ya2luZ1wiIHZhbHVlPVwiJyArIGFsbG93TmV0d29ya2luZyArICdcIi8+JyArICc8cGFyYW0gbmFtZT1cIm1lbnVcIiB2YWx1ZT1cImZhbHNlXCIvPicgKyAnPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIi8+JyArICc8cGFyYW0gbmFtZT1cImZsYXNodmFyc1wiIHZhbHVlPVwiJyArIGZsYXNodmFycyArICdcIi8+JyArIFwiPC9vYmplY3Q+XCI7XG4gICAgICBmbGFzaEJyaWRnZSA9IHRtcERpdi5maXJzdENoaWxkO1xuICAgICAgdG1wRGl2ID0gbnVsbDtcbiAgICAgIF91bndyYXAoZmxhc2hCcmlkZ2UpLlplcm9DbGlwYm9hcmQgPSBaZXJvQ2xpcGJvYXJkO1xuICAgICAgY29udGFpbmVyLnJlcGxhY2VDaGlsZChmbGFzaEJyaWRnZSwgZGl2VG9CZVJlcGxhY2VkKTtcbiAgICB9XG4gICAgaWYgKCFmbGFzaEJyaWRnZSkge1xuICAgICAgZmxhc2hCcmlkZ2UgPSBfZG9jdW1lbnRbX2dsb2JhbENvbmZpZy5zd2ZPYmplY3RJZF07XG4gICAgICBpZiAoZmxhc2hCcmlkZ2UgJiYgKGxlbiA9IGZsYXNoQnJpZGdlLmxlbmd0aCkpIHtcbiAgICAgICAgZmxhc2hCcmlkZ2UgPSBmbGFzaEJyaWRnZVtsZW4gLSAxXTtcbiAgICAgIH1cbiAgICAgIGlmICghZmxhc2hCcmlkZ2UgJiYgY29udGFpbmVyKSB7XG4gICAgICAgIGZsYXNoQnJpZGdlID0gY29udGFpbmVyLmZpcnN0Q2hpbGQ7XG4gICAgICB9XG4gICAgfVxuICAgIF9mbGFzaFN0YXRlLmJyaWRnZSA9IGZsYXNoQnJpZGdlIHx8IG51bGw7XG4gICAgcmV0dXJuIGZsYXNoQnJpZGdlO1xuICB9O1xuICAvKipcbiAqIERlc3Ryb3kgdGhlIFNXRiBvYmplY3QuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfdW5lbWJlZFN3ZiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmbGFzaEJyaWRnZSA9IF9mbGFzaFN0YXRlLmJyaWRnZTtcbiAgICBpZiAoZmxhc2hCcmlkZ2UpIHtcbiAgICAgIHZhciBodG1sQnJpZGdlID0gX2dldEh0bWxCcmlkZ2UoZmxhc2hCcmlkZ2UpO1xuICAgICAgaWYgKGh0bWxCcmlkZ2UpIHtcbiAgICAgICAgaWYgKF9mbGFzaFN0YXRlLnBsdWdpblR5cGUgPT09IFwiYWN0aXZleFwiICYmIFwicmVhZHlTdGF0ZVwiIGluIGZsYXNoQnJpZGdlKSB7XG4gICAgICAgICAgZmxhc2hCcmlkZ2Uuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIChmdW5jdGlvbiByZW1vdmVTd2ZGcm9tSUUoKSB7XG4gICAgICAgICAgICBpZiAoZmxhc2hCcmlkZ2UucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGZsYXNoQnJpZGdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmbGFzaEJyaWRnZVtwcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICBmbGFzaEJyaWRnZVtwcm9wXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChmbGFzaEJyaWRnZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgZmxhc2hCcmlkZ2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmbGFzaEJyaWRnZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGh0bWxCcmlkZ2UucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIGh0bWxCcmlkZ2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChodG1sQnJpZGdlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX3NldFRpbWVvdXQocmVtb3ZlU3dmRnJvbUlFLCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZmxhc2hCcmlkZ2UucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgZmxhc2hCcmlkZ2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmbGFzaEJyaWRnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChodG1sQnJpZGdlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGh0bWxCcmlkZ2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChodG1sQnJpZGdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9mbGFzaFN0YXRlLnJlYWR5ID0gbnVsbDtcbiAgICAgIF9mbGFzaFN0YXRlLmJyaWRnZSA9IG51bGw7XG4gICAgICBfZmxhc2hTdGF0ZS5kZWFjdGl2YXRlZCA9IG51bGw7XG4gICAgfVxuICB9O1xuICAvKipcbiAqIE1hcCB0aGUgZGF0YSBmb3JtYXQgbmFtZXMgb2YgdGhlIFwiY2xpcERhdGFcIiB0byBGbGFzaC1mcmllbmRseSBuYW1lcy5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyB0cmFuc2Zvcm1lZCBvYmplY3QuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfbWFwQ2xpcERhdGFUb0ZsYXNoID0gZnVuY3Rpb24oY2xpcERhdGEpIHtcbiAgICB2YXIgbmV3Q2xpcERhdGEgPSB7fSwgZm9ybWF0TWFwID0ge307XG4gICAgaWYgKCEodHlwZW9mIGNsaXBEYXRhID09PSBcIm9iamVjdFwiICYmIGNsaXBEYXRhKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciBkYXRhRm9ybWF0IGluIGNsaXBEYXRhKSB7XG4gICAgICBpZiAoZGF0YUZvcm1hdCAmJiBfaGFzT3duLmNhbGwoY2xpcERhdGEsIGRhdGFGb3JtYXQpICYmIHR5cGVvZiBjbGlwRGF0YVtkYXRhRm9ybWF0XSA9PT0gXCJzdHJpbmdcIiAmJiBjbGlwRGF0YVtkYXRhRm9ybWF0XSkge1xuICAgICAgICBzd2l0Y2ggKGRhdGFGb3JtYXQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgY2FzZSBcInRleHQvcGxhaW5cIjpcbiAgICAgICAgIGNhc2UgXCJ0ZXh0XCI6XG4gICAgICAgICBjYXNlIFwiYWlyOnRleHRcIjpcbiAgICAgICAgIGNhc2UgXCJmbGFzaDp0ZXh0XCI6XG4gICAgICAgICAgbmV3Q2xpcERhdGEudGV4dCA9IGNsaXBEYXRhW2RhdGFGb3JtYXRdO1xuICAgICAgICAgIGZvcm1hdE1hcC50ZXh0ID0gZGF0YUZvcm1hdDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgY2FzZSBcInRleHQvaHRtbFwiOlxuICAgICAgICAgY2FzZSBcImh0bWxcIjpcbiAgICAgICAgIGNhc2UgXCJhaXI6aHRtbFwiOlxuICAgICAgICAgY2FzZSBcImZsYXNoOmh0bWxcIjpcbiAgICAgICAgICBuZXdDbGlwRGF0YS5odG1sID0gY2xpcERhdGFbZGF0YUZvcm1hdF07XG4gICAgICAgICAgZm9ybWF0TWFwLmh0bWwgPSBkYXRhRm9ybWF0O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICBjYXNlIFwiYXBwbGljYXRpb24vcnRmXCI6XG4gICAgICAgICBjYXNlIFwidGV4dC9ydGZcIjpcbiAgICAgICAgIGNhc2UgXCJydGZcIjpcbiAgICAgICAgIGNhc2UgXCJyaWNodGV4dFwiOlxuICAgICAgICAgY2FzZSBcImFpcjpydGZcIjpcbiAgICAgICAgIGNhc2UgXCJmbGFzaDpydGZcIjpcbiAgICAgICAgICBuZXdDbGlwRGF0YS5ydGYgPSBjbGlwRGF0YVtkYXRhRm9ybWF0XTtcbiAgICAgICAgICBmb3JtYXRNYXAucnRmID0gZGF0YUZvcm1hdDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogbmV3Q2xpcERhdGEsXG4gICAgICBmb3JtYXRNYXA6IGZvcm1hdE1hcFxuICAgIH07XG4gIH07XG4gIC8qKlxuICogTWFwIHRoZSBkYXRhIGZvcm1hdCBuYW1lcyBmcm9tIEZsYXNoLWZyaWVuZGx5IG5hbWVzIGJhY2sgdG8gdGhlaXIgb3JpZ2luYWwgXCJjbGlwRGF0YVwiIG5hbWVzICh2aWEgYSBmb3JtYXQgbWFwcGluZykuXG4gKlxuICogQHJldHVybnMgQSBuZXcgdHJhbnNmb3JtZWQgb2JqZWN0LlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX21hcENsaXBSZXN1bHRzRnJvbUZsYXNoID0gZnVuY3Rpb24oY2xpcFJlc3VsdHMsIGZvcm1hdE1hcCkge1xuICAgIGlmICghKHR5cGVvZiBjbGlwUmVzdWx0cyA9PT0gXCJvYmplY3RcIiAmJiBjbGlwUmVzdWx0cyAmJiB0eXBlb2YgZm9ybWF0TWFwID09PSBcIm9iamVjdFwiICYmIGZvcm1hdE1hcCkpIHtcbiAgICAgIHJldHVybiBjbGlwUmVzdWx0cztcbiAgICB9XG4gICAgdmFyIG5ld1Jlc3VsdHMgPSB7fTtcbiAgICBmb3IgKHZhciBwcm9wIGluIGNsaXBSZXN1bHRzKSB7XG4gICAgICBpZiAoX2hhc093bi5jYWxsKGNsaXBSZXN1bHRzLCBwcm9wKSkge1xuICAgICAgICBpZiAocHJvcCAhPT0gXCJzdWNjZXNzXCIgJiYgcHJvcCAhPT0gXCJkYXRhXCIpIHtcbiAgICAgICAgICBuZXdSZXN1bHRzW3Byb3BdID0gY2xpcFJlc3VsdHNbcHJvcF07XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbmV3UmVzdWx0c1twcm9wXSA9IHt9O1xuICAgICAgICB2YXIgdG1wSGFzaCA9IGNsaXBSZXN1bHRzW3Byb3BdO1xuICAgICAgICBmb3IgKHZhciBkYXRhRm9ybWF0IGluIHRtcEhhc2gpIHtcbiAgICAgICAgICBpZiAoZGF0YUZvcm1hdCAmJiBfaGFzT3duLmNhbGwodG1wSGFzaCwgZGF0YUZvcm1hdCkgJiYgX2hhc093bi5jYWxsKGZvcm1hdE1hcCwgZGF0YUZvcm1hdCkpIHtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHNbcHJvcF1bZm9ybWF0TWFwW2RhdGFGb3JtYXRdXSA9IHRtcEhhc2hbZGF0YUZvcm1hdF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdSZXN1bHRzO1xuICB9O1xuICAvKipcbiAqIFdpbGwgbG9vayBhdCBhIHBhdGgsIGFuZCB3aWxsIGNyZWF0ZSBhIFwiP25vQ2FjaGU9e3RpbWV9XCIgb3IgXCImbm9DYWNoZT17dGltZX1cIlxuICogcXVlcnkgcGFyYW0gc3RyaW5nIHRvIHJldHVybi4gRG9lcyBOT1QgYXBwZW5kIHRoYXQgc3RyaW5nIHRvIHRoZSBvcmlnaW5hbCBwYXRoLlxuICogVGhpcyBpcyB1c2VmdWwgYmVjYXVzZSBFeHRlcm5hbEludGVyZmFjZSBvZnRlbiBicmVha3Mgd2hlbiBhIEZsYXNoIFNXRiBpcyBjYWNoZWQuXG4gKlxuICogQHJldHVybnMgVGhlIGBub0NhY2hlYCBxdWVyeSBwYXJhbSB3aXRoIG5lY2Vzc2FyeSBcIj9cIi9cIiZcIiBwcmVmaXguXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2FjaGVCdXN0ID0gZnVuY3Rpb24ocGF0aCwgb3B0aW9ucykge1xuICAgIHZhciBjYWNoZUJ1c3QgPSBvcHRpb25zID09IG51bGwgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmNhY2hlQnVzdCA9PT0gdHJ1ZTtcbiAgICBpZiAoY2FjaGVCdXN0KSB7XG4gICAgICByZXR1cm4gKHBhdGguaW5kZXhPZihcIj9cIikgPT09IC0xID8gXCI/XCIgOiBcIiZcIikgKyBcIm5vQ2FjaGU9XCIgKyBfbm93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBDcmVhdGVzIGEgcXVlcnkgc3RyaW5nIGZvciB0aGUgRmxhc2hWYXJzIHBhcmFtLlxuICogRG9lcyBOT1QgaW5jbHVkZSB0aGUgY2FjaGUtYnVzdGluZyBxdWVyeSBwYXJhbS5cbiAqXG4gKiBAcmV0dXJucyBGbGFzaFZhcnMgcXVlcnkgc3RyaW5nXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfdmFycyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgaSwgbGVuLCBkb21haW4sIGRvbWFpbnMsIHN0ciA9IFwiXCIsIHRydXN0ZWRPcmlnaW5zRXhwYW5kZWQgPSBbXTtcbiAgICBpZiAob3B0aW9ucy50cnVzdGVkRG9tYWlucykge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRydXN0ZWREb21haW5zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGRvbWFpbnMgPSBbIG9wdGlvbnMudHJ1c3RlZERvbWFpbnMgXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMudHJ1c3RlZERvbWFpbnMgPT09IFwib2JqZWN0XCIgJiYgXCJsZW5ndGhcIiBpbiBvcHRpb25zLnRydXN0ZWREb21haW5zKSB7XG4gICAgICAgIGRvbWFpbnMgPSBvcHRpb25zLnRydXN0ZWREb21haW5zO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9tYWlucyAmJiBkb21haW5zLmxlbmd0aCkge1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZG9tYWlucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoX2hhc093bi5jYWxsKGRvbWFpbnMsIGkpICYmIGRvbWFpbnNbaV0gJiYgdHlwZW9mIGRvbWFpbnNbaV0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBkb21haW4gPSBfZXh0cmFjdERvbWFpbihkb21haW5zW2ldKTtcbiAgICAgICAgICBpZiAoIWRvbWFpbikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkb21haW4gPT09IFwiKlwiKSB7XG4gICAgICAgICAgICB0cnVzdGVkT3JpZ2luc0V4cGFuZGVkLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICB0cnVzdGVkT3JpZ2luc0V4cGFuZGVkLnB1c2goZG9tYWluKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0cnVzdGVkT3JpZ2luc0V4cGFuZGVkLnB1c2guYXBwbHkodHJ1c3RlZE9yaWdpbnNFeHBhbmRlZCwgWyBkb21haW4sIFwiLy9cIiArIGRvbWFpbiwgX3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGRvbWFpbiBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHJ1c3RlZE9yaWdpbnNFeHBhbmRlZC5sZW5ndGgpIHtcbiAgICAgIHN0ciArPSBcInRydXN0ZWRPcmlnaW5zPVwiICsgX2VuY29kZVVSSUNvbXBvbmVudCh0cnVzdGVkT3JpZ2luc0V4cGFuZGVkLmpvaW4oXCIsXCIpKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZm9yY2VFbmhhbmNlZENsaXBib2FyZCA9PT0gdHJ1ZSkge1xuICAgICAgc3RyICs9IChzdHIgPyBcIiZcIiA6IFwiXCIpICsgXCJmb3JjZUVuaGFuY2VkQ2xpcGJvYXJkPXRydWVcIjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnN3Zk9iamVjdElkID09PSBcInN0cmluZ1wiICYmIG9wdGlvbnMuc3dmT2JqZWN0SWQpIHtcbiAgICAgIHN0ciArPSAoc3RyID8gXCImXCIgOiBcIlwiKSArIFwic3dmT2JqZWN0SWQ9XCIgKyBfZW5jb2RlVVJJQ29tcG9uZW50KG9wdGlvbnMuc3dmT2JqZWN0SWQpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuICAvKipcbiAqIEV4dHJhY3QgdGhlIGRvbWFpbiAoZS5nLiBcImdpdGh1Yi5jb21cIikgZnJvbSBhbiBvcmlnaW4gKGUuZy4gXCJodHRwczovL2dpdGh1Yi5jb21cIikgb3JcbiAqIFVSTCAoZS5nLiBcImh0dHBzOi8vZ2l0aHViLmNvbS96ZXJvY2xpcGJvYXJkL3plcm9jbGlwYm9hcmQvXCIpLlxuICpcbiAqIEByZXR1cm5zIHRoZSBkb21haW5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9leHRyYWN0RG9tYWluID0gZnVuY3Rpb24ob3JpZ2luT3JVcmwpIHtcbiAgICBpZiAob3JpZ2luT3JVcmwgPT0gbnVsbCB8fCBvcmlnaW5PclVybCA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG9yaWdpbk9yVXJsID0gb3JpZ2luT3JVcmwucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIik7XG4gICAgaWYgKG9yaWdpbk9yVXJsID09PSBcIlwiKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHByb3RvY29sSW5kZXggPSBvcmlnaW5PclVybC5pbmRleE9mKFwiLy9cIik7XG4gICAgb3JpZ2luT3JVcmwgPSBwcm90b2NvbEluZGV4ID09PSAtMSA/IG9yaWdpbk9yVXJsIDogb3JpZ2luT3JVcmwuc2xpY2UocHJvdG9jb2xJbmRleCArIDIpO1xuICAgIHZhciBwYXRoSW5kZXggPSBvcmlnaW5PclVybC5pbmRleE9mKFwiL1wiKTtcbiAgICBvcmlnaW5PclVybCA9IHBhdGhJbmRleCA9PT0gLTEgPyBvcmlnaW5PclVybCA6IHByb3RvY29sSW5kZXggPT09IC0xIHx8IHBhdGhJbmRleCA9PT0gMCA/IG51bGwgOiBvcmlnaW5PclVybC5zbGljZSgwLCBwYXRoSW5kZXgpO1xuICAgIGlmIChvcmlnaW5PclVybCAmJiBvcmlnaW5PclVybC5zbGljZSgtNCkudG9Mb3dlckNhc2UoKSA9PT0gXCIuc3dmXCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb3JpZ2luT3JVcmwgfHwgbnVsbDtcbiAgfTtcbiAgLyoqXG4gKiBTZXQgYGFsbG93U2NyaXB0QWNjZXNzYCBiYXNlZCBvbiBgdHJ1c3RlZERvbWFpbnNgIGFuZCBgd2luZG93LmxvY2F0aW9uLmhvc3RgIHZzLiBgc3dmUGF0aGAuXG4gKlxuICogQHJldHVybnMgVGhlIGFwcHJvcHJpYXRlIHNjcmlwdCBhY2Nlc3MgbGV2ZWwuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZGV0ZXJtaW5lU2NyaXB0QWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF9leHRyYWN0QWxsRG9tYWlucyA9IGZ1bmN0aW9uKG9yaWdpbnMpIHtcbiAgICAgIHZhciBpLCBsZW4sIHRtcCwgcmVzdWx0c0FycmF5ID0gW107XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgb3JpZ2lucyA9IFsgb3JpZ2lucyBdO1xuICAgICAgfVxuICAgICAgaWYgKCEodHlwZW9mIG9yaWdpbnMgPT09IFwib2JqZWN0XCIgJiYgb3JpZ2lucyAmJiB0eXBlb2Ygb3JpZ2lucy5sZW5ndGggPT09IFwibnVtYmVyXCIpKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzQXJyYXk7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBvcmlnaW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChfaGFzT3duLmNhbGwob3JpZ2lucywgaSkgJiYgKHRtcCA9IF9leHRyYWN0RG9tYWluKG9yaWdpbnNbaV0pKSkge1xuICAgICAgICAgIGlmICh0bXAgPT09IFwiKlwiKSB7XG4gICAgICAgICAgICByZXN1bHRzQXJyYXkubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHJlc3VsdHNBcnJheS5wdXNoKFwiKlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzdWx0c0FycmF5LmluZGV4T2YodG1wKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdHNBcnJheS5wdXNoKHRtcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0c0FycmF5O1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN1cnJlbnREb21haW4sIGNvbmZpZ09wdGlvbnMpIHtcbiAgICAgIHZhciBzd2ZEb21haW4gPSBfZXh0cmFjdERvbWFpbihjb25maWdPcHRpb25zLnN3ZlBhdGgpO1xuICAgICAgaWYgKHN3ZkRvbWFpbiA9PT0gbnVsbCkge1xuICAgICAgICBzd2ZEb21haW4gPSBjdXJyZW50RG9tYWluO1xuICAgICAgfVxuICAgICAgdmFyIHRydXN0ZWREb21haW5zID0gX2V4dHJhY3RBbGxEb21haW5zKGNvbmZpZ09wdGlvbnMudHJ1c3RlZERvbWFpbnMpO1xuICAgICAgdmFyIGxlbiA9IHRydXN0ZWREb21haW5zLmxlbmd0aDtcbiAgICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIGlmIChsZW4gPT09IDEgJiYgdHJ1c3RlZERvbWFpbnNbMF0gPT09IFwiKlwiKSB7XG4gICAgICAgICAgcmV0dXJuIFwiYWx3YXlzXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRydXN0ZWREb21haW5zLmluZGV4T2YoY3VycmVudERvbWFpbikgIT09IC0xKSB7XG4gICAgICAgICAgaWYgKGxlbiA9PT0gMSAmJiBjdXJyZW50RG9tYWluID09PSBzd2ZEb21haW4pIHtcbiAgICAgICAgICAgIHJldHVybiBcInNhbWVEb21haW5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFwiYWx3YXlzXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcIm5ldmVyXCI7XG4gICAgfTtcbiAgfSgpO1xuICAvKipcbiAqIEdldCB0aGUgY3VycmVudGx5IGFjdGl2ZS9mb2N1c2VkIERPTSBlbGVtZW50LlxuICpcbiAqIEByZXR1cm5zIHRoZSBjdXJyZW50bHkgYWN0aXZlL2ZvY3VzZWQgZWxlbWVudCwgb3IgYG51bGxgXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfc2FmZUFjdGl2ZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIF9kb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuICAvKipcbiAqIEFkZCBhIGNsYXNzIHRvIGFuIGVsZW1lbnQsIGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGl0LlxuICpcbiAqIEByZXR1cm5zIFRoZSBlbGVtZW50LCB3aXRoIGl0cyBuZXcgY2xhc3MgYWRkZWQuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfYWRkQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZSkge1xuICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50Lm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHZhbHVlKSkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBjbGFzc05hbWVzID0gKHZhbHVlIHx8IFwiXCIpLnNwbGl0KC9cXHMrLyk7XG4gICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gXCIgXCIgKyBlbGVtZW50LmNsYXNzTmFtZSArIFwiIFwiLCBzZXRDbGFzcyA9IGVsZW1lbnQuY2xhc3NOYW1lO1xuICAgICAgICAgIGZvciAodmFyIGMgPSAwLCBjbCA9IGNsYXNzTmFtZXMubGVuZ3RoOyBjIDwgY2w7IGMrKykge1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKFwiIFwiICsgY2xhc3NOYW1lc1tjXSArIFwiIFwiKSA8IDApIHtcbiAgICAgICAgICAgICAgc2V0Q2xhc3MgKz0gXCIgXCIgKyBjbGFzc05hbWVzW2NdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IHNldENsYXNzLnJlcGxhY2UoL15cXHMrfFxccyskL2csIFwiXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xuICB9O1xuICAvKipcbiAqIFJlbW92ZSBhIGNsYXNzIGZyb20gYW4gZWxlbWVudCwgaWYgaXQgaGFzIGl0LlxuICpcbiAqIEByZXR1cm5zIFRoZSBlbGVtZW50LCB3aXRoIGl0cyBjbGFzcyByZW1vdmVkLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX3JlbW92ZUNsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgdmFsdWUpIHtcbiAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHZhbHVlKSkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUpIHtcbiAgICAgIHZhciBjbGFzc05hbWVzID0gdmFsdWUuc3BsaXQoL1xccysvKTtcbiAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxICYmIGVsZW1lbnQuY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSAoXCIgXCIgKyBlbGVtZW50LmNsYXNzTmFtZSArIFwiIFwiKS5yZXBsYWNlKC9bXFxuXFx0XS9nLCBcIiBcIik7XG4gICAgICAgIGZvciAodmFyIGMgPSAwLCBjbCA9IGNsYXNzTmFtZXMubGVuZ3RoOyBjIDwgY2w7IGMrKykge1xuICAgICAgICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKFwiIFwiICsgY2xhc3NOYW1lc1tjXSArIFwiIFwiLCBcIiBcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xuICB9O1xuICAvKipcbiAqIEF0dGVtcHQgdG8gaW50ZXJwcmV0IHRoZSBlbGVtZW50J3MgQ1NTIHN0eWxpbmcuIElmIGBwcm9wYCBpcyBgXCJjdXJzb3JcImAsXG4gKiB0aGVuIHdlIGFzc3VtZSB0aGF0IGl0IHNob3VsZCBiZSBhIGhhbmQgKFwicG9pbnRlclwiKSBjdXJzb3IgaWYgdGhlIGVsZW1lbnRcbiAqIGlzIGFuIGFuY2hvciBlbGVtZW50IChcImFcIiB0YWcpLlxuICpcbiAqIEByZXR1cm5zIFRoZSBjb21wdXRlZCBzdHlsZSBwcm9wZXJ0eS5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9nZXRTdHlsZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIHZhbHVlID0gX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApO1xuICAgIGlmIChwcm9wID09PSBcImN1cnNvclwiKSB7XG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlID09PSBcImF1dG9cIikge1xuICAgICAgICBpZiAoZWwubm9kZU5hbWUgPT09IFwiQVwiKSB7XG4gICAgICAgICAgcmV0dXJuIFwicG9pbnRlclwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbiAgLyoqXG4gKiBHZXQgdGhlIHpvb20gZmFjdG9yIG9mIHRoZSBicm93c2VyLiBBbHdheXMgcmV0dXJucyBgMS4wYCwgZXhjZXB0IGF0XG4gKiBub24tZGVmYXVsdCB6b29tIGxldmVscyBpbiBJRTw4IGFuZCBzb21lIG9sZGVyIHZlcnNpb25zIG9mIFdlYktpdC5cbiAqXG4gKiBAcmV0dXJucyBGbG9hdGluZyB1bml0IHBlcmNlbnRhZ2Ugb2YgdGhlIHpvb20gZmFjdG9yIChlLmcuIDE1MCUgPSBgMS41YCkuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZ2V0Wm9vbUZhY3RvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZWN0LCBwaHlzaWNhbFdpZHRoLCBsb2dpY2FsV2lkdGgsIHpvb21GYWN0b3IgPSAxO1xuICAgIGlmICh0eXBlb2YgX2RvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJlY3QgPSBfZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHBoeXNpY2FsV2lkdGggPSByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0O1xuICAgICAgbG9naWNhbFdpZHRoID0gX2RvY3VtZW50LmJvZHkub2Zmc2V0V2lkdGg7XG4gICAgICB6b29tRmFjdG9yID0gX3JvdW5kKHBoeXNpY2FsV2lkdGggLyBsb2dpY2FsV2lkdGggKiAxMDApIC8gMTAwO1xuICAgIH1cbiAgICByZXR1cm4gem9vbUZhY3RvcjtcbiAgfTtcbiAgLyoqXG4gKiBHZXQgdGhlIERPTSBwb3NpdGlvbmluZyBpbmZvIG9mIGFuIGVsZW1lbnQuXG4gKlxuICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQncyBwb3NpdGlvbiwgd2lkdGgsIGFuZCBoZWlnaHQuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfZ2V0RE9NT2JqZWN0UG9zaXRpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5mbyA9IHtcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH07XG4gICAgaWYgKG9iai5nZXRCb3VuZGluZ0NsaWVudFJlY3QpIHtcbiAgICAgIHZhciByZWN0ID0gb2JqLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIHBhZ2VYT2Zmc2V0LCBwYWdlWU9mZnNldCwgem9vbUZhY3RvcjtcbiAgICAgIGlmIChcInBhZ2VYT2Zmc2V0XCIgaW4gX3dpbmRvdyAmJiBcInBhZ2VZT2Zmc2V0XCIgaW4gX3dpbmRvdykge1xuICAgICAgICBwYWdlWE9mZnNldCA9IF93aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgICAgIHBhZ2VZT2Zmc2V0ID0gX3dpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHpvb21GYWN0b3IgPSBfZ2V0Wm9vbUZhY3RvcigpO1xuICAgICAgICBwYWdlWE9mZnNldCA9IF9yb3VuZChfZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgLyB6b29tRmFjdG9yKTtcbiAgICAgICAgcGFnZVlPZmZzZXQgPSBfcm91bmQoX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgLyB6b29tRmFjdG9yKTtcbiAgICAgIH1cbiAgICAgIHZhciBsZWZ0Qm9yZGVyV2lkdGggPSBfZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudExlZnQgfHwgMDtcbiAgICAgIHZhciB0b3BCb3JkZXJXaWR0aCA9IF9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50VG9wIHx8IDA7XG4gICAgICBpbmZvLmxlZnQgPSByZWN0LmxlZnQgKyBwYWdlWE9mZnNldCAtIGxlZnRCb3JkZXJXaWR0aDtcbiAgICAgIGluZm8udG9wID0gcmVjdC50b3AgKyBwYWdlWU9mZnNldCAtIHRvcEJvcmRlcldpZHRoO1xuICAgICAgaW5mby53aWR0aCA9IFwid2lkdGhcIiBpbiByZWN0ID8gcmVjdC53aWR0aCA6IHJlY3QucmlnaHQgLSByZWN0LmxlZnQ7XG4gICAgICBpbmZvLmhlaWdodCA9IFwiaGVpZ2h0XCIgaW4gcmVjdCA/IHJlY3QuaGVpZ2h0IDogcmVjdC5ib3R0b20gLSByZWN0LnRvcDtcbiAgICB9XG4gICAgcmV0dXJuIGluZm87XG4gIH07XG4gIC8qKlxuICogUmVwb3NpdGlvbiB0aGUgRmxhc2ggb2JqZWN0IHRvIGNvdmVyIHRoZSBjdXJyZW50bHkgYWN0aXZhdGVkIGVsZW1lbnQuXG4gKlxuICogQHJldHVybnMgYHVuZGVmaW5lZGBcbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9yZXBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGh0bWxCcmlkZ2U7XG4gICAgaWYgKF9jdXJyZW50RWxlbWVudCAmJiAoaHRtbEJyaWRnZSA9IF9nZXRIdG1sQnJpZGdlKF9mbGFzaFN0YXRlLmJyaWRnZSkpKSB7XG4gICAgICB2YXIgcG9zID0gX2dldERPTU9iamVjdFBvc2l0aW9uKF9jdXJyZW50RWxlbWVudCk7XG4gICAgICBfZXh0ZW5kKGh0bWxCcmlkZ2Uuc3R5bGUsIHtcbiAgICAgICAgd2lkdGg6IHBvcy53aWR0aCArIFwicHhcIixcbiAgICAgICAgaGVpZ2h0OiBwb3MuaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICB0b3A6IHBvcy50b3AgKyBcInB4XCIsXG4gICAgICAgIGxlZnQ6IHBvcy5sZWZ0ICsgXCJweFwiLFxuICAgICAgICB6SW5kZXg6IFwiXCIgKyBfZ2V0U2FmZVpJbmRleChfZ2xvYmFsQ29uZmlnLnpJbmRleClcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBTZW5kcyBhIHNpZ25hbCB0byB0aGUgRmxhc2ggb2JqZWN0IHRvIGRpc3BsYXkgdGhlIGhhbmQgY3Vyc29yIGlmIGB0cnVlYC5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX3NldEhhbmRDdXJzb3IgPSBmdW5jdGlvbihlbmFibGVkKSB7XG4gICAgaWYgKF9mbGFzaFN0YXRlLnJlYWR5ID09PSB0cnVlKSB7XG4gICAgICBpZiAoX2ZsYXNoU3RhdGUuYnJpZGdlICYmIHR5cGVvZiBfZmxhc2hTdGF0ZS5icmlkZ2Uuc2V0SGFuZEN1cnNvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIF9mbGFzaFN0YXRlLmJyaWRnZS5zZXRIYW5kQ3Vyc29yKGVuYWJsZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2ZsYXNoU3RhdGUucmVhZHkgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8qKlxuICogR2V0IGEgc2FmZSB2YWx1ZSBmb3IgYHpJbmRleGBcbiAqXG4gKiBAcmV0dXJucyBhbiBpbnRlZ2VyLCBvciBcImF1dG9cIlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2dldFNhZmVaSW5kZXggPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoL14oPzphdXRvfGluaGVyaXQpJC8udGVzdCh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICB2YXIgekluZGV4O1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmICFfaXNOYU4odmFsKSkge1xuICAgICAgekluZGV4ID0gdmFsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgekluZGV4ID0gX2dldFNhZmVaSW5kZXgoX3BhcnNlSW50KHZhbCwgMTApKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB6SW5kZXggPT09IFwibnVtYmVyXCIgPyB6SW5kZXggOiBcImF1dG9cIjtcbiAgfTtcbiAgLyoqXG4gKiBEZXRlY3QgdGhlIEZsYXNoIFBsYXllciBzdGF0dXMsIHZlcnNpb24sIGFuZCBwbHVnaW4gdHlwZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2RvY3R5cGUtbWlycm9yL3dpa2kvQXJ0aWNsZURldGVjdEZsYXNoI1RoZV9jb2RlfVxuICogQHNlZSB7QGxpbmsgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjg2NjA2MC9kZXRlY3RpbmctcGVwcGVyLXBwYXBpLWZsYXNoLXdpdGgtamF2YXNjcmlwdH1cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2RldGVjdEZsYXNoU3VwcG9ydCA9IGZ1bmN0aW9uKEFjdGl2ZVhPYmplY3QpIHtcbiAgICB2YXIgcGx1Z2luLCBheCwgbWltZVR5cGUsIGhhc0ZsYXNoID0gZmFsc2UsIGlzQWN0aXZlWCA9IGZhbHNlLCBpc1BQQVBJID0gZmFsc2UsIGZsYXNoVmVyc2lvbiA9IFwiXCI7XG4gICAgLyoqXG4gICAqIERlcml2ZWQgZnJvbSBBcHBsZSdzIHN1Z2dlc3RlZCBzbmlmZmVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzYyBlLmcuIFwiU2hvY2t3YXZlIEZsYXNoIDcuMCByNjFcIlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBcIjcuMC42MVwiXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAgIGZ1bmN0aW9uIHBhcnNlRmxhc2hWZXJzaW9uKGRlc2MpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gZGVzYy5tYXRjaCgvW1xcZF0rL2cpO1xuICAgICAgbWF0Y2hlcy5sZW5ndGggPSAzO1xuICAgICAgcmV0dXJuIG1hdGNoZXMuam9pbihcIi5cIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzUGVwcGVyRmxhc2goZmxhc2hQbGF5ZXJGaWxlTmFtZSkge1xuICAgICAgcmV0dXJuICEhZmxhc2hQbGF5ZXJGaWxlTmFtZSAmJiAoZmxhc2hQbGF5ZXJGaWxlTmFtZSA9IGZsYXNoUGxheWVyRmlsZU5hbWUudG9Mb3dlckNhc2UoKSkgJiYgKC9eKHBlcGZsYXNocGxheWVyXFwuZGxsfGxpYnBlcGZsYXNocGxheWVyXFwuc298cGVwcGVyZmxhc2hwbGF5ZXJcXC5wbHVnaW4pJC8udGVzdChmbGFzaFBsYXllckZpbGVOYW1lKSB8fCBmbGFzaFBsYXllckZpbGVOYW1lLnNsaWNlKC0xMykgPT09IFwiY2hyb21lLnBsdWdpblwiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5zcGVjdFBsdWdpbihwbHVnaW4pIHtcbiAgICAgIGlmIChwbHVnaW4pIHtcbiAgICAgICAgaGFzRmxhc2ggPSB0cnVlO1xuICAgICAgICBpZiAocGx1Z2luLnZlcnNpb24pIHtcbiAgICAgICAgICBmbGFzaFZlcnNpb24gPSBwYXJzZUZsYXNoVmVyc2lvbihwbHVnaW4udmVyc2lvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmbGFzaFZlcnNpb24gJiYgcGx1Z2luLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgZmxhc2hWZXJzaW9uID0gcGFyc2VGbGFzaFZlcnNpb24ocGx1Z2luLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGx1Z2luLmZpbGVuYW1lKSB7XG4gICAgICAgICAgaXNQUEFQSSA9IGlzUGVwcGVyRmxhc2gocGx1Z2luLmZpbGVuYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoX25hdmlnYXRvci5wbHVnaW5zICYmIF9uYXZpZ2F0b3IucGx1Z2lucy5sZW5ndGgpIHtcbiAgICAgIHBsdWdpbiA9IF9uYXZpZ2F0b3IucGx1Z2luc1tcIlNob2Nrd2F2ZSBGbGFzaFwiXTtcbiAgICAgIGluc3BlY3RQbHVnaW4ocGx1Z2luKTtcbiAgICAgIGlmIChfbmF2aWdhdG9yLnBsdWdpbnNbXCJTaG9ja3dhdmUgRmxhc2ggMi4wXCJdKSB7XG4gICAgICAgIGhhc0ZsYXNoID0gdHJ1ZTtcbiAgICAgICAgZmxhc2hWZXJzaW9uID0gXCIyLjAuMC4xMVwiO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX25hdmlnYXRvci5taW1lVHlwZXMgJiYgX25hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoKSB7XG4gICAgICBtaW1lVHlwZSA9IF9uYXZpZ2F0b3IubWltZVR5cGVzW1wiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIl07XG4gICAgICBwbHVnaW4gPSBtaW1lVHlwZSAmJiBtaW1lVHlwZS5lbmFibGVkUGx1Z2luO1xuICAgICAgaW5zcGVjdFBsdWdpbihwbHVnaW4pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIEFjdGl2ZVhPYmplY3QgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlzQWN0aXZlWCA9IHRydWU7XG4gICAgICB0cnkge1xuICAgICAgICBheCA9IG5ldyBBY3RpdmVYT2JqZWN0KFwiU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2guN1wiKTtcbiAgICAgICAgaGFzRmxhc2ggPSB0cnVlO1xuICAgICAgICBmbGFzaFZlcnNpb24gPSBwYXJzZUZsYXNoVmVyc2lvbihheC5HZXRWYXJpYWJsZShcIiR2ZXJzaW9uXCIpKTtcbiAgICAgIH0gY2F0Y2ggKGUxKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXggPSBuZXcgQWN0aXZlWE9iamVjdChcIlNob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoLjZcIik7XG4gICAgICAgICAgaGFzRmxhc2ggPSB0cnVlO1xuICAgICAgICAgIGZsYXNoVmVyc2lvbiA9IFwiNi4wLjIxXCI7XG4gICAgICAgIH0gY2F0Y2ggKGUyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF4ID0gbmV3IEFjdGl2ZVhPYmplY3QoXCJTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaFwiKTtcbiAgICAgICAgICAgIGhhc0ZsYXNoID0gdHJ1ZTtcbiAgICAgICAgICAgIGZsYXNoVmVyc2lvbiA9IHBhcnNlRmxhc2hWZXJzaW9uKGF4LkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIikpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUzKSB7XG4gICAgICAgICAgICBpc0FjdGl2ZVggPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgX2ZsYXNoU3RhdGUuZGlzYWJsZWQgPSBoYXNGbGFzaCAhPT0gdHJ1ZTtcbiAgICBfZmxhc2hTdGF0ZS5vdXRkYXRlZCA9IGZsYXNoVmVyc2lvbiAmJiBfcGFyc2VGbG9hdChmbGFzaFZlcnNpb24pIDwgX3BhcnNlRmxvYXQoX21pbmltdW1GbGFzaFZlcnNpb24pO1xuICAgIF9mbGFzaFN0YXRlLnZlcnNpb24gPSBmbGFzaFZlcnNpb24gfHwgXCIwLjAuMFwiO1xuICAgIF9mbGFzaFN0YXRlLnBsdWdpblR5cGUgPSBpc1BQQVBJID8gXCJwZXBwZXJcIiA6IGlzQWN0aXZlWCA/IFwiYWN0aXZleFwiIDogaGFzRmxhc2ggPyBcIm5ldHNjYXBlXCIgOiBcInVua25vd25cIjtcbiAgfTtcbiAgLyoqXG4gKiBJbnZva2UgdGhlIEZsYXNoIGRldGVjdGlvbiBhbGdvcml0aG1zIGltbWVkaWF0ZWx5IHVwb24gaW5jbHVzaW9uIHNvIHdlJ3JlIG5vdCB3YWl0aW5nIGxhdGVyLlxuICovXG4gIF9kZXRlY3RGbGFzaFN1cHBvcnQoX0FjdGl2ZVhPYmplY3QpO1xuICAvKipcbiAqIEEgc2hlbGwgY29uc3RydWN0b3IgZm9yIGBaZXJvQ2xpcGJvYXJkYCBjbGllbnQgaW5zdGFuY2VzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG4gIHZhciBaZXJvQ2xpcGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFplcm9DbGlwYm9hcmQpKSB7XG4gICAgICByZXR1cm4gbmV3IFplcm9DbGlwYm9hcmQoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBaZXJvQ2xpcGJvYXJkLl9jcmVhdGVDbGllbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgWmVyb0NsaXBib2FyZC5fY3JlYXRlQ2xpZW50LmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gKiBUaGUgWmVyb0NsaXBib2FyZCBsaWJyYXJ5J3MgdmVyc2lvbiBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQHJlYWRvbmx5XG4gKiBAcHJvcGVydHkge3N0cmluZ31cbiAqL1xuICBfZGVmaW5lUHJvcGVydHkoWmVyb0NsaXBib2FyZCwgXCJ2ZXJzaW9uXCIsIHtcbiAgICB2YWx1ZTogXCIyLjEuNlwiLFxuICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXG4gKiBVcGRhdGUgb3IgZ2V0IGEgY29weSBvZiB0aGUgWmVyb0NsaXBib2FyZCBnbG9iYWwgY29uZmlndXJhdGlvbi5cbiAqIFJldHVybnMgYSBjb3B5IG9mIHRoZSBjdXJyZW50L3VwZGF0ZWQgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBPYmplY3RcbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLmNvbmZpZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfY29uZmlnLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIERpYWdub3N0aWMgbWV0aG9kIHRoYXQgZGVzY3JpYmVzIHRoZSBzdGF0ZSBvZiB0aGUgYnJvd3NlciwgRmxhc2ggUGxheWVyLCBhbmQgWmVyb0NsaXBib2FyZC5cbiAqXG4gKiBAcmV0dXJucyBPYmplY3RcbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF9zdGF0ZS5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBDaGVjayBpZiBGbGFzaCBpcyB1bnVzYWJsZSBmb3IgYW55IHJlYXNvbjogZGlzYWJsZWQsIG91dGRhdGVkLCBkZWFjdGl2YXRlZCwgZXRjLlxuICpcbiAqIEByZXR1cm5zIEJvb2xlYW5cbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLmlzRmxhc2hVbnVzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfaXNGbGFzaFVudXNhYmxlLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIFJlZ2lzdGVyIGFuIGV2ZW50IGxpc3RlbmVyLlxuICpcbiAqIEByZXR1cm5zIGBaZXJvQ2xpcGJvYXJkYFxuICogQHN0YXRpY1xuICovXG4gIFplcm9DbGlwYm9hcmQub24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX29uLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIFVucmVnaXN0ZXIgYW4gZXZlbnQgbGlzdGVuZXIuXG4gKiBJZiBubyBgbGlzdGVuZXJgIGZ1bmN0aW9uL29iamVjdCBpcyBwcm92aWRlZCwgaXQgd2lsbCB1bnJlZ2lzdGVyIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBwcm92aWRlZCBgZXZlbnRUeXBlYC5cbiAqIElmIG5vIGBldmVudFR5cGVgIGlzIHByb3ZpZGVkLCBpdCB3aWxsIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgZXZlcnkgZXZlbnQgdHlwZS5cbiAqXG4gKiBAcmV0dXJucyBgWmVyb0NsaXBib2FyZGBcbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLm9mZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfb2ZmLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIFJldHJpZXZlIGV2ZW50IGxpc3RlbmVycyBmb3IgYW4gYGV2ZW50VHlwZWAuXG4gKiBJZiBubyBgZXZlbnRUeXBlYCBpcyBwcm92aWRlZCwgaXQgd2lsbCByZXRyaWV2ZSBhbGwgbGlzdGVuZXJzIGZvciBldmVyeSBldmVudCB0eXBlLlxuICpcbiAqIEByZXR1cm5zIGFycmF5IG9mIGxpc3RlbmVycyBmb3IgdGhlIGBldmVudFR5cGVgOyBpZiBubyBgZXZlbnRUeXBlYCwgdGhlbiBhIG1hcC9oYXNoIG9iamVjdCBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBldmVudCB0eXBlczsgb3IgYG51bGxgXG4gKi9cbiAgWmVyb0NsaXBib2FyZC5oYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfbGlzdGVuZXJzLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIEV2ZW50IGVtaXNzaW9uIHJlY2VpdmVyIGZyb20gdGhlIEZsYXNoIG9iamVjdCwgZm9yd2FyZGluZyB0byBhbnkgcmVnaXN0ZXJlZCBKYXZhU2NyaXB0IGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyBGb3IgdGhlIFwiY29weVwiIGV2ZW50LCByZXR1cm5zIHRoZSBGbGFzaC1mcmllbmRseSBcImNsaXBEYXRhXCIgb2JqZWN0OyBvdGhlcndpc2UgYHVuZGVmaW5lZGAuXG4gKiBAc3RhdGljXG4gKi9cbiAgWmVyb0NsaXBib2FyZC5lbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF9lbWl0LmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIENyZWF0ZSBhbmQgZW1iZWQgdGhlIEZsYXNoIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJucyBUaGUgRmxhc2ggb2JqZWN0XG4gKiBAc3RhdGljXG4gKi9cbiAgWmVyb0NsaXBib2FyZC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX2NyZWF0ZS5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBTZWxmLWRlc3RydWN0IGFuZCBjbGVhbiB1cCBldmVyeXRoaW5nLCBpbmNsdWRpbmcgdGhlIGVtYmVkZGVkIEZsYXNoIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHN0YXRpY1xuICovXG4gIFplcm9DbGlwYm9hcmQuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfZGVzdHJveS5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBTZXQgdGhlIHBlbmRpbmcgZGF0YSBmb3IgY2xpcGJvYXJkIGluamVjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHN0YXRpY1xuICovXG4gIFplcm9DbGlwYm9hcmQuc2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfc2V0RGF0YS5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBDbGVhciB0aGUgcGVuZGluZyBkYXRhIGZvciBjbGlwYm9hcmQgaW5qZWN0aW9uLlxuICogSWYgbm8gYGZvcm1hdGAgaXMgcHJvdmlkZWQsIGFsbCBwZW5kaW5nIGRhdGEgZm9ybWF0cyB3aWxsIGJlIGNsZWFyZWQuXG4gKlxuICogQHJldHVybnMgYHVuZGVmaW5lZGBcbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLmNsZWFyRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfY2xlYXJEYXRhLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIEdldCBhIGNvcHkgb2YgdGhlIHBlbmRpbmcgZGF0YSBmb3IgY2xpcGJvYXJkIGluamVjdGlvbi5cbiAqIElmIG5vIGBmb3JtYXRgIGlzIHByb3ZpZGVkLCBhIGNvcHkgb2YgQUxMIHBlbmRpbmcgZGF0YSBmb3JtYXRzIHdpbGwgYmUgcmV0dXJuZWQuXG4gKlxuICogQHJldHVybnMgYFN0cmluZ2Agb3IgYE9iamVjdGBcbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLmdldERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX2dldERhdGEuYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gIH07XG4gIC8qKlxuICogU2V0cyB0aGUgY3VycmVudCBIVE1MIG9iamVjdCB0aGF0IHRoZSBGbGFzaCBvYmplY3Qgc2hvdWxkIG92ZXJsYXkuIFRoaXMgd2lsbCBwdXQgdGhlIGdsb2JhbFxuICogRmxhc2ggb2JqZWN0IG9uIHRvcCBvZiB0aGUgY3VycmVudCBlbGVtZW50OyBkZXBlbmRpbmcgb24gdGhlIHNldHVwLCB0aGlzIG1heSBhbHNvIHNldCB0aGVcbiAqIHBlbmRpbmcgY2xpcGJvYXJkIHRleHQgZGF0YSBhcyB3ZWxsIGFzIHRoZSBGbGFzaCBvYmplY3QncyB3cmFwcGluZyBlbGVtZW50J3MgdGl0bGUgYXR0cmlidXRlXG4gKiBiYXNlZCBvbiB0aGUgdW5kZXJseWluZyBIVE1MIGVsZW1lbnQgYW5kIFplcm9DbGlwYm9hcmQgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHN0YXRpY1xuICovXG4gIFplcm9DbGlwYm9hcmQuZm9jdXMgPSBaZXJvQ2xpcGJvYXJkLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF9mb2N1cy5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBVbi1vdmVybGF5cyB0aGUgRmxhc2ggb2JqZWN0LiBUaGlzIHdpbGwgcHV0IHRoZSBnbG9iYWwgRmxhc2ggb2JqZWN0IG9mZi1zY3JlZW47IGRlcGVuZGluZyBvblxuICogdGhlIHNldHVwLCB0aGlzIG1heSBhbHNvIHVuc2V0IHRoZSBGbGFzaCBvYmplY3QncyB3cmFwcGluZyBlbGVtZW50J3MgdGl0bGUgYXR0cmlidXRlIGJhc2VkIG9uXG4gKiB0aGUgdW5kZXJseWluZyBIVE1MIGVsZW1lbnQgYW5kIFplcm9DbGlwYm9hcmQgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHN0YXRpY1xuICovXG4gIFplcm9DbGlwYm9hcmQuYmx1ciA9IFplcm9DbGlwYm9hcmQuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfYmx1ci5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50bHkgZm9jdXNlZC9cImFjdGl2YXRlZFwiIEhUTUwgZWxlbWVudCB0aGF0IHRoZSBGbGFzaCBvYmplY3QgaXMgd3JhcHBpbmcuXG4gKlxuICogQHJldHVybnMgYEhUTUxFbGVtZW50YCBvciBgbnVsbGBcbiAqIEBzdGF0aWNcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLmFjdGl2ZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX2FjdGl2ZUVsZW1lbnQuYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gIH07XG4gIC8qKlxuICogS2VlcCB0cmFjayBvZiB0aGUgWmVyb0NsaXBib2FyZCBjbGllbnQgaW5zdGFuY2UgY291bnRlci5cbiAqL1xuICB2YXIgX2NsaWVudElkQ291bnRlciA9IDA7XG4gIC8qKlxuICogS2VlcCB0cmFjayBvZiB0aGUgc3RhdGUgb2YgdGhlIGNsaWVudCBpbnN0YW5jZXMuXG4gKlxuICogRW50cnkgc3RydWN0dXJlOlxuICogICBfY2xpZW50TWV0YVtjbGllbnQuaWRdID0ge1xuICogICAgIGluc3RhbmNlOiBjbGllbnQsXG4gKiAgICAgZWxlbWVudHM6IFtdLFxuICogICAgIGhhbmRsZXJzOiB7fVxuICogICB9O1xuICovXG4gIHZhciBfY2xpZW50TWV0YSA9IHt9O1xuICAvKipcbiAqIEtlZXAgdHJhY2sgb2YgdGhlIFplcm9DbGlwYm9hcmQgY2xpcHBlZCBlbGVtZW50cyBjb3VudGVyLlxuICovXG4gIHZhciBfZWxlbWVudElkQ291bnRlciA9IDA7XG4gIC8qKlxuICogS2VlcCB0cmFjayBvZiB0aGUgc3RhdGUgb2YgdGhlIGNsaXBwZWQgZWxlbWVudCByZWxhdGlvbnNoaXBzIHRvIGNsaWVudHMuXG4gKlxuICogRW50cnkgc3RydWN0dXJlOlxuICogICBfZWxlbWVudE1ldGFbZWxlbWVudC56Y0NsaXBwaW5nSWRdID0gW2NsaWVudDEuaWQsIGNsaWVudDIuaWRdO1xuICovXG4gIHZhciBfZWxlbWVudE1ldGEgPSB7fTtcbiAgLyoqXG4gKiBLZWVwIHRyYWNrIG9mIHRoZSBzdGF0ZSBvZiB0aGUgbW91c2UgZXZlbnQgaGFuZGxlcnMgZm9yIGNsaXBwZWQgZWxlbWVudHMuXG4gKlxuICogRW50cnkgc3RydWN0dXJlOlxuICogICBfbW91c2VIYW5kbGVyc1tlbGVtZW50LnpjQ2xpcHBpbmdJZF0gPSB7XG4gKiAgICAgbW91c2VvdmVyOiAgZnVuY3Rpb24oZXZlbnQpIHt9LFxuICogICAgIG1vdXNlb3V0OiAgIGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAqICAgICBtb3VzZWVudGVyOiBmdW5jdGlvbihldmVudCkge30sXG4gKiAgICAgbW91c2VsZWF2ZTogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICogICAgIG1vdXNlbW92ZTogIGZ1bmN0aW9uKGV2ZW50KSB7fVxuICogICB9O1xuICovXG4gIHZhciBfbW91c2VIYW5kbGVycyA9IHt9O1xuICAvKipcbiAqIEV4dGVuZGluZyB0aGUgWmVyb0NsaXBib2FyZCBjb25maWd1cmF0aW9uIGRlZmF1bHRzIGZvciB0aGUgQ2xpZW50IG1vZHVsZS5cbiAqL1xuICBfZXh0ZW5kKF9nbG9iYWxDb25maWcsIHtcbiAgICBhdXRvQWN0aXZhdGU6IHRydWVcbiAgfSk7XG4gIC8qKlxuICogVGhlIHJlYWwgY29uc3RydWN0b3IgZm9yIGBaZXJvQ2xpcGJvYXJkYCBjbGllbnQgaW5zdGFuY2VzLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2NsaWVudENvbnN0cnVjdG9yID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICB2YXIgY2xpZW50ID0gdGhpcztcbiAgICBjbGllbnQuaWQgPSBcIlwiICsgX2NsaWVudElkQ291bnRlcisrO1xuICAgIF9jbGllbnRNZXRhW2NsaWVudC5pZF0gPSB7XG4gICAgICBpbnN0YW5jZTogY2xpZW50LFxuICAgICAgZWxlbWVudHM6IFtdLFxuICAgICAgaGFuZGxlcnM6IHt9XG4gICAgfTtcbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGNsaWVudC5jbGlwKGVsZW1lbnRzKTtcbiAgICB9XG4gICAgWmVyb0NsaXBib2FyZC5vbihcIipcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHJldHVybiBjbGllbnQuZW1pdChldmVudCk7XG4gICAgfSk7XG4gICAgWmVyb0NsaXBib2FyZC5vbihcImRlc3Ryb3lcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBjbGllbnQuZGVzdHJveSgpO1xuICAgIH0pO1xuICAgIFplcm9DbGlwYm9hcmQuY3JlYXRlKCk7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuQ2xpZW50LnByb3RvdHlwZS5vbmAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2xpZW50T24gPSBmdW5jdGlvbihldmVudFR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGksIGxlbiwgZXZlbnRzLCBhZGRlZCA9IHt9LCBoYW5kbGVycyA9IF9jbGllbnRNZXRhW3RoaXMuaWRdICYmIF9jbGllbnRNZXRhW3RoaXMuaWRdLmhhbmRsZXJzO1xuICAgIGlmICh0eXBlb2YgZXZlbnRUeXBlID09PSBcInN0cmluZ1wiICYmIGV2ZW50VHlwZSkge1xuICAgICAgZXZlbnRzID0gZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkuc3BsaXQoL1xccysvKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBldmVudFR5cGUgPT09IFwib2JqZWN0XCIgJiYgZXZlbnRUeXBlICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZm9yIChpIGluIGV2ZW50VHlwZSkge1xuICAgICAgICBpZiAoX2hhc093bi5jYWxsKGV2ZW50VHlwZSwgaSkgJiYgdHlwZW9mIGkgPT09IFwic3RyaW5nXCIgJiYgaSAmJiB0eXBlb2YgZXZlbnRUeXBlW2ldID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0aGlzLm9uKGksIGV2ZW50VHlwZVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50cyAmJiBldmVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBldmVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXZlbnRUeXBlID0gZXZlbnRzW2ldLnJlcGxhY2UoL15vbi8sIFwiXCIpO1xuICAgICAgICBhZGRlZFtldmVudFR5cGVdID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFoYW5kbGVyc1tldmVudFR5cGVdKSB7XG4gICAgICAgICAgaGFuZGxlcnNbZXZlbnRUeXBlXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzW2V2ZW50VHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBpZiAoYWRkZWQucmVhZHkgJiYgX2ZsYXNoU3RhdGUucmVhZHkpIHtcbiAgICAgICAgdGhpcy5lbWl0KHtcbiAgICAgICAgICB0eXBlOiBcInJlYWR5XCIsXG4gICAgICAgICAgY2xpZW50OiB0aGlzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGFkZGVkLmVycm9yKSB7XG4gICAgICAgIHZhciBlcnJvclR5cGVzID0gWyBcImRpc2FibGVkXCIsIFwib3V0ZGF0ZWRcIiwgXCJ1bmF2YWlsYWJsZVwiLCBcImRlYWN0aXZhdGVkXCIsIFwib3ZlcmR1ZVwiIF07XG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGVycm9yVHlwZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBpZiAoX2ZsYXNoU3RhdGVbZXJyb3JUeXBlc1tpXV0pIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCh7XG4gICAgICAgICAgICAgIHR5cGU6IFwiZXJyb3JcIixcbiAgICAgICAgICAgICAgbmFtZTogXCJmbGFzaC1cIiArIGVycm9yVHlwZXNbaV0sXG4gICAgICAgICAgICAgIGNsaWVudDogdGhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuQ2xpZW50LnByb3RvdHlwZS5vZmZgLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2NsaWVudE9mZiA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcbiAgICB2YXIgaSwgbGVuLCBmb3VuZEluZGV4LCBldmVudHMsIHBlckV2ZW50SGFuZGxlcnMsIGhhbmRsZXJzID0gX2NsaWVudE1ldGFbdGhpcy5pZF0gJiYgX2NsaWVudE1ldGFbdGhpcy5pZF0uaGFuZGxlcnM7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGV2ZW50cyA9IF9rZXlzKGhhbmRsZXJzKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBldmVudFR5cGUgPT09IFwic3RyaW5nXCIgJiYgZXZlbnRUeXBlKSB7XG4gICAgICBldmVudHMgPSBldmVudFR5cGUuc3BsaXQoL1xccysvKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBldmVudFR5cGUgPT09IFwib2JqZWN0XCIgJiYgZXZlbnRUeXBlICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZm9yIChpIGluIGV2ZW50VHlwZSkge1xuICAgICAgICBpZiAoX2hhc093bi5jYWxsKGV2ZW50VHlwZSwgaSkgJiYgdHlwZW9mIGkgPT09IFwic3RyaW5nXCIgJiYgaSAmJiB0eXBlb2YgZXZlbnRUeXBlW2ldID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0aGlzLm9mZihpLCBldmVudFR5cGVbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChldmVudHMgJiYgZXZlbnRzLmxlbmd0aCkge1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGV2ZW50VHlwZSA9IGV2ZW50c1tpXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL15vbi8sIFwiXCIpO1xuICAgICAgICBwZXJFdmVudEhhbmRsZXJzID0gaGFuZGxlcnNbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKHBlckV2ZW50SGFuZGxlcnMgJiYgcGVyRXZlbnRIYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXggPSBwZXJFdmVudEhhbmRsZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgICAgICAgd2hpbGUgKGZvdW5kSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgIHBlckV2ZW50SGFuZGxlcnMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgICAgICAgICBmb3VuZEluZGV4ID0gcGVyRXZlbnRIYW5kbGVycy5pbmRleE9mKGxpc3RlbmVyLCBmb3VuZEluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVyRXZlbnRIYW5kbGVycy5sZW5ndGggPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXG4gKiBUaGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiBgWmVyb0NsaXBib2FyZC5DbGllbnQucHJvdG90eXBlLmhhbmRsZXJzYC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jbGllbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudFR5cGUpIHtcbiAgICB2YXIgY29weSA9IG51bGwsIGhhbmRsZXJzID0gX2NsaWVudE1ldGFbdGhpcy5pZF0gJiYgX2NsaWVudE1ldGFbdGhpcy5pZF0uaGFuZGxlcnM7XG4gICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICBpZiAodHlwZW9mIGV2ZW50VHlwZSA9PT0gXCJzdHJpbmdcIiAmJiBldmVudFR5cGUpIHtcbiAgICAgICAgY29weSA9IGhhbmRsZXJzW2V2ZW50VHlwZV0gPyBoYW5kbGVyc1tldmVudFR5cGVdLnNsaWNlKDApIDogW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb3B5ID0gX2RlZXBDb3B5KGhhbmRsZXJzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuQ2xpZW50LnByb3RvdHlwZS5lbWl0YC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jbGllbnRFbWl0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoX2NsaWVudFNob3VsZEVtaXQuY2FsbCh0aGlzLCBldmVudCkpIHtcbiAgICAgIGlmICh0eXBlb2YgZXZlbnQgPT09IFwib2JqZWN0XCIgJiYgZXZlbnQgJiYgdHlwZW9mIGV2ZW50LnR5cGUgPT09IFwic3RyaW5nXCIgJiYgZXZlbnQudHlwZSkge1xuICAgICAgICBldmVudCA9IF9leHRlbmQoe30sIGV2ZW50KTtcbiAgICAgIH1cbiAgICAgIHZhciBldmVudENvcHkgPSBfZXh0ZW5kKHt9LCBfY3JlYXRlRXZlbnQoZXZlbnQpLCB7XG4gICAgICAgIGNsaWVudDogdGhpc1xuICAgICAgfSk7XG4gICAgICBfY2xpZW50RGlzcGF0Y2hDYWxsYmFja3MuY2FsbCh0aGlzLCBldmVudENvcHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXG4gKiBUaGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiBgWmVyb0NsaXBib2FyZC5DbGllbnQucHJvdG90eXBlLmNsaXBgLlxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX2NsaWVudENsaXAgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIGVsZW1lbnRzID0gX3ByZXBDbGlwKGVsZW1lbnRzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoX2hhc093bi5jYWxsKGVsZW1lbnRzLCBpKSAmJiBlbGVtZW50c1tpXSAmJiBlbGVtZW50c1tpXS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICBpZiAoIWVsZW1lbnRzW2ldLnpjQ2xpcHBpbmdJZCkge1xuICAgICAgICAgIGVsZW1lbnRzW2ldLnpjQ2xpcHBpbmdJZCA9IFwiemNDbGlwcGluZ0lkX1wiICsgX2VsZW1lbnRJZENvdW50ZXIrKztcbiAgICAgICAgICBfZWxlbWVudE1ldGFbZWxlbWVudHNbaV0uemNDbGlwcGluZ0lkXSA9IFsgdGhpcy5pZCBdO1xuICAgICAgICAgIGlmIChfZ2xvYmFsQ29uZmlnLmF1dG9BY3RpdmF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgX2FkZE1vdXNlSGFuZGxlcnMoZWxlbWVudHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfZWxlbWVudE1ldGFbZWxlbWVudHNbaV0uemNDbGlwcGluZ0lkXS5pbmRleE9mKHRoaXMuaWQpID09PSAtMSkge1xuICAgICAgICAgIF9lbGVtZW50TWV0YVtlbGVtZW50c1tpXS56Y0NsaXBwaW5nSWRdLnB1c2godGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNsaXBwZWRFbGVtZW50cyA9IF9jbGllbnRNZXRhW3RoaXMuaWRdICYmIF9jbGllbnRNZXRhW3RoaXMuaWRdLmVsZW1lbnRzO1xuICAgICAgICBpZiAoY2xpcHBlZEVsZW1lbnRzLmluZGV4T2YoZWxlbWVudHNbaV0pID09PSAtMSkge1xuICAgICAgICAgIGNsaXBwZWRFbGVtZW50cy5wdXNoKGVsZW1lbnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXG4gKiBUaGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiBgWmVyb0NsaXBib2FyZC5DbGllbnQucHJvdG90eXBlLnVuY2xpcGAuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2xpZW50VW5jbGlwID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICB2YXIgbWV0YSA9IF9jbGllbnRNZXRhW3RoaXMuaWRdO1xuICAgIGlmICghbWV0YSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBjbGlwcGVkRWxlbWVudHMgPSBtZXRhLmVsZW1lbnRzO1xuICAgIHZhciBhcnJheUluZGV4O1xuICAgIGlmICh0eXBlb2YgZWxlbWVudHMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGVsZW1lbnRzID0gY2xpcHBlZEVsZW1lbnRzLnNsaWNlKDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50cyA9IF9wcmVwQ2xpcChlbGVtZW50cyk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBlbGVtZW50cy5sZW5ndGg7IGktLTsgKSB7XG4gICAgICBpZiAoX2hhc093bi5jYWxsKGVsZW1lbnRzLCBpKSAmJiBlbGVtZW50c1tpXSAmJiBlbGVtZW50c1tpXS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICBhcnJheUluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKChhcnJheUluZGV4ID0gY2xpcHBlZEVsZW1lbnRzLmluZGV4T2YoZWxlbWVudHNbaV0sIGFycmF5SW5kZXgpKSAhPT0gLTEpIHtcbiAgICAgICAgICBjbGlwcGVkRWxlbWVudHMuc3BsaWNlKGFycmF5SW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjbGllbnRJZHMgPSBfZWxlbWVudE1ldGFbZWxlbWVudHNbaV0uemNDbGlwcGluZ0lkXTtcbiAgICAgICAgaWYgKGNsaWVudElkcykge1xuICAgICAgICAgIGFycmF5SW5kZXggPSAwO1xuICAgICAgICAgIHdoaWxlICgoYXJyYXlJbmRleCA9IGNsaWVudElkcy5pbmRleE9mKHRoaXMuaWQsIGFycmF5SW5kZXgpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNsaWVudElkcy5zcGxpY2UoYXJyYXlJbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjbGllbnRJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoX2dsb2JhbENvbmZpZy5hdXRvQWN0aXZhdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgX3JlbW92ZU1vdXNlSGFuZGxlcnMoZWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIGVsZW1lbnRzW2ldLnpjQ2xpcHBpbmdJZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuQ2xpZW50LnByb3RvdHlwZS5lbGVtZW50c2AuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2xpZW50RWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWV0YSA9IF9jbGllbnRNZXRhW3RoaXMuaWRdO1xuICAgIHJldHVybiBtZXRhICYmIG1ldGEuZWxlbWVudHMgPyBtZXRhLmVsZW1lbnRzLnNsaWNlKDApIDogW107XG4gIH07XG4gIC8qKlxuICogVGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgYFplcm9DbGlwYm9hcmQuQ2xpZW50LnByb3RvdHlwZS5kZXN0cm95YC5cbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9jbGllbnREZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy51bmNsaXAoKTtcbiAgICB0aGlzLm9mZigpO1xuICAgIGRlbGV0ZSBfY2xpZW50TWV0YVt0aGlzLmlkXTtcbiAgfTtcbiAgLyoqXG4gKiBJbnNwZWN0IGFuIEV2ZW50IHRvIHNlZSBpZiB0aGUgQ2xpZW50IChgdGhpc2ApIHNob3VsZCBob25vciBpdCBmb3IgZW1pc3Npb24uXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2xpZW50U2hvdWxkRW1pdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKCEoZXZlbnQgJiYgZXZlbnQudHlwZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LmNsaWVudCAmJiBldmVudC5jbGllbnQgIT09IHRoaXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGNsaXBwZWRFbHMgPSBfY2xpZW50TWV0YVt0aGlzLmlkXSAmJiBfY2xpZW50TWV0YVt0aGlzLmlkXS5lbGVtZW50cztcbiAgICB2YXIgaGFzQ2xpcHBlZEVscyA9ICEhY2xpcHBlZEVscyAmJiBjbGlwcGVkRWxzLmxlbmd0aCA+IDA7XG4gICAgdmFyIGdvb2RUYXJnZXQgPSAhZXZlbnQudGFyZ2V0IHx8IGhhc0NsaXBwZWRFbHMgJiYgY2xpcHBlZEVscy5pbmRleE9mKGV2ZW50LnRhcmdldCkgIT09IC0xO1xuICAgIHZhciBnb29kUmVsVGFyZ2V0ID0gZXZlbnQucmVsYXRlZFRhcmdldCAmJiBoYXNDbGlwcGVkRWxzICYmIGNsaXBwZWRFbHMuaW5kZXhPZihldmVudC5yZWxhdGVkVGFyZ2V0KSAhPT0gLTE7XG4gICAgdmFyIGdvb2RDbGllbnQgPSBldmVudC5jbGllbnQgJiYgZXZlbnQuY2xpZW50ID09PSB0aGlzO1xuICAgIGlmICghKGdvb2RUYXJnZXQgfHwgZ29vZFJlbFRhcmdldCB8fCBnb29kQ2xpZW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLyoqXG4gKiBIYW5kbGUgdGhlIGFjdHVhbCBkaXNwYXRjaGluZyBvZiBldmVudHMgdG8gYSBjbGllbnQgaW5zdGFuY2UuXG4gKlxuICogQHJldHVybnMgYHRoaXNgXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfY2xpZW50RGlzcGF0Y2hDYWxsYmFja3MgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICghKHR5cGVvZiBldmVudCA9PT0gXCJvYmplY3RcIiAmJiBldmVudCAmJiBldmVudC50eXBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYXN5bmMgPSBfc2hvdWxkUGVyZm9ybUFzeW5jKGV2ZW50KTtcbiAgICB2YXIgd2lsZGNhcmRUeXBlSGFuZGxlcnMgPSBfY2xpZW50TWV0YVt0aGlzLmlkXSAmJiBfY2xpZW50TWV0YVt0aGlzLmlkXS5oYW5kbGVyc1tcIipcIl0gfHwgW107XG4gICAgdmFyIHNwZWNpZmljVHlwZUhhbmRsZXJzID0gX2NsaWVudE1ldGFbdGhpcy5pZF0gJiYgX2NsaWVudE1ldGFbdGhpcy5pZF0uaGFuZGxlcnNbZXZlbnQudHlwZV0gfHwgW107XG4gICAgdmFyIGhhbmRsZXJzID0gd2lsZGNhcmRUeXBlSGFuZGxlcnMuY29uY2F0KHNwZWNpZmljVHlwZUhhbmRsZXJzKTtcbiAgICBpZiAoaGFuZGxlcnMgJiYgaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICB2YXIgaSwgbGVuLCBmdW5jLCBjb250ZXh0LCBldmVudENvcHksIG9yaWdpbmFsQ29udGV4dCA9IHRoaXM7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBmdW5jID0gaGFuZGxlcnNbaV07XG4gICAgICAgIGNvbnRleHQgPSBvcmlnaW5hbENvbnRleHQ7XG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgX3dpbmRvd1tmdW5jXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgZnVuYyA9IF93aW5kb3dbZnVuY107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmdW5jID09PSBcIm9iamVjdFwiICYmIGZ1bmMgJiYgdHlwZW9mIGZ1bmMuaGFuZGxlRXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGNvbnRleHQgPSBmdW5jO1xuICAgICAgICAgIGZ1bmMgPSBmdW5jLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgZXZlbnRDb3B5ID0gX2V4dGVuZCh7fSwgZXZlbnQpO1xuICAgICAgICAgIF9kaXNwYXRjaENhbGxiYWNrKGZ1bmMsIGNvbnRleHQsIFsgZXZlbnRDb3B5IF0sIGFzeW5jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXG4gKiBQcmVwYXJlcyB0aGUgZWxlbWVudHMgZm9yIGNsaXBwaW5nL3VuY2xpcHBpbmcuXG4gKlxuICogQHJldHVybnMgQW4gQXJyYXkgb2YgZWxlbWVudHMuXG4gKiBAcHJpdmF0ZVxuICovXG4gIHZhciBfcHJlcENsaXAgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudHMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGVsZW1lbnRzID0gW107XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgZWxlbWVudHMubGVuZ3RoICE9PSBcIm51bWJlclwiID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHM7XG4gIH07XG4gIC8qKlxuICogQWRkIGEgYG1vdXNlb3ZlcmAgaGFuZGxlciBmdW5jdGlvbiBmb3IgYSBjbGlwcGVkIGVsZW1lbnQuXG4gKlxuICogQHJldHVybnMgYHVuZGVmaW5lZGBcbiAqIEBwcml2YXRlXG4gKi9cbiAgdmFyIF9hZGRNb3VzZUhhbmRsZXJzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGlmICghKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIF9zdXBwcmVzc01vdXNlRXZlbnRzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmICghKGV2ZW50IHx8IChldmVudCA9IF93aW5kb3cuZXZlbnQpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQuX3NvdXJjZSAhPT0gXCJqc1wiKSB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgICAgZGVsZXRlIGV2ZW50Ll9zb3VyY2U7XG4gICAgfTtcbiAgICB2YXIgX2VsZW1lbnRNb3VzZU92ZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKCEoZXZlbnQgfHwgKGV2ZW50ID0gX3dpbmRvdy5ldmVudCkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIF9zdXBwcmVzc01vdXNlRXZlbnRzKGV2ZW50KTtcbiAgICAgIFplcm9DbGlwYm9hcmQuZm9jdXMoZWxlbWVudCk7XG4gICAgfTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgX2VsZW1lbnRNb3VzZU92ZXIsIGZhbHNlKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBfc3VwcHJlc3NNb3VzZUV2ZW50cywgZmFsc2UpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgX3N1cHByZXNzTW91c2VFdmVudHMsIGZhbHNlKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIF9zdXBwcmVzc01vdXNlRXZlbnRzLCBmYWxzZSk7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIF9zdXBwcmVzc01vdXNlRXZlbnRzLCBmYWxzZSk7XG4gICAgX21vdXNlSGFuZGxlcnNbZWxlbWVudC56Y0NsaXBwaW5nSWRdID0ge1xuICAgICAgbW91c2VvdmVyOiBfZWxlbWVudE1vdXNlT3ZlcixcbiAgICAgIG1vdXNlb3V0OiBfc3VwcHJlc3NNb3VzZUV2ZW50cyxcbiAgICAgIG1vdXNlZW50ZXI6IF9zdXBwcmVzc01vdXNlRXZlbnRzLFxuICAgICAgbW91c2VsZWF2ZTogX3N1cHByZXNzTW91c2VFdmVudHMsXG4gICAgICBtb3VzZW1vdmU6IF9zdXBwcmVzc01vdXNlRXZlbnRzXG4gICAgfTtcbiAgfTtcbiAgLyoqXG4gKiBSZW1vdmUgYSBgbW91c2VvdmVyYCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBhIGNsaXBwZWQgZWxlbWVudC5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICogQHByaXZhdGVcbiAqL1xuICB2YXIgX3JlbW92ZU1vdXNlSGFuZGxlcnMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgaWYgKCEoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlID09PSAxKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbW91c2VIYW5kbGVycyA9IF9tb3VzZUhhbmRsZXJzW2VsZW1lbnQuemNDbGlwcGluZ0lkXTtcbiAgICBpZiAoISh0eXBlb2YgbW91c2VIYW5kbGVycyA9PT0gXCJvYmplY3RcIiAmJiBtb3VzZUhhbmRsZXJzKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIga2V5LCB2YWwsIG1vdXNlRXZlbnRzID0gWyBcIm1vdmVcIiwgXCJsZWF2ZVwiLCBcImVudGVyXCIsIFwib3V0XCIsIFwib3ZlclwiIF07XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdXNlRXZlbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBrZXkgPSBcIm1vdXNlXCIgKyBtb3VzZUV2ZW50c1tpXTtcbiAgICAgIHZhbCA9IG1vdXNlSGFuZGxlcnNba2V5XTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGtleSwgdmFsLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGRlbGV0ZSBfbW91c2VIYW5kbGVyc1tlbGVtZW50LnpjQ2xpcHBpbmdJZF07XG4gIH07XG4gIC8qKlxuICogQ3JlYXRlcyBhIG5ldyBaZXJvQ2xpcGJvYXJkIGNsaWVudCBpbnN0YW5jZS5cbiAqIE9wdGlvbmFsbHksIGF1dG8tYGNsaXBgIGFuIGVsZW1lbnQgb3IgY29sbGVjdGlvbiBvZiBlbGVtZW50cy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLl9jcmVhdGVDbGllbnQgPSBmdW5jdGlvbigpIHtcbiAgICBfY2xpZW50Q29uc3RydWN0b3IuYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gIH07XG4gIC8qKlxuICogUmVnaXN0ZXIgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGNsaWVudC5cbiAqXG4gKiBAcmV0dXJucyBgdGhpc2BcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfY2xpZW50T24uYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gIH07XG4gIC8qKlxuICogVW5yZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGZyb20gdGhlIGNsaWVudC5cbiAqIElmIG5vIGBsaXN0ZW5lcmAgZnVuY3Rpb24vb2JqZWN0IGlzIHByb3ZpZGVkLCBpdCB3aWxsIHVucmVnaXN0ZXIgYWxsIGhhbmRsZXJzIGZvciB0aGUgcHJvdmlkZWQgYGV2ZW50VHlwZWAuXG4gKiBJZiBubyBgZXZlbnRUeXBlYCBpcyBwcm92aWRlZCwgaXQgd2lsbCB1bnJlZ2lzdGVyIGFsbCBoYW5kbGVycyBmb3IgZXZlcnkgZXZlbnQgdHlwZS5cbiAqXG4gKiBAcmV0dXJucyBgdGhpc2BcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX2NsaWVudE9mZi5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBSZXRyaWV2ZSBldmVudCBsaXN0ZW5lcnMgZm9yIGFuIGBldmVudFR5cGVgIGZyb20gdGhlIGNsaWVudC5cbiAqIElmIG5vIGBldmVudFR5cGVgIGlzIHByb3ZpZGVkLCBpdCB3aWxsIHJldHJpZXZlIGFsbCBsaXN0ZW5lcnMgZm9yIGV2ZXJ5IGV2ZW50IHR5cGUuXG4gKlxuICogQHJldHVybnMgYXJyYXkgb2YgbGlzdGVuZXJzIGZvciB0aGUgYGV2ZW50VHlwZWA7IGlmIG5vIGBldmVudFR5cGVgLCB0aGVuIGEgbWFwL2hhc2ggb2JqZWN0IG9mIGxpc3RlbmVycyBmb3IgYWxsIGV2ZW50IHR5cGVzOyBvciBgbnVsbGBcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5oYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfY2xpZW50TGlzdGVuZXJzLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIEV2ZW50IGVtaXNzaW9uIHJlY2VpdmVyIGZyb20gdGhlIEZsYXNoIG9iamVjdCBmb3IgdGhpcyBjbGllbnQncyByZWdpc3RlcmVkIEphdmFTY3JpcHQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEByZXR1cm5zIEZvciB0aGUgXCJjb3B5XCIgZXZlbnQsIHJldHVybnMgdGhlIEZsYXNoLWZyaWVuZGx5IFwiY2xpcERhdGFcIiBvYmplY3Q7IG90aGVyd2lzZSBgdW5kZWZpbmVkYC5cbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF9jbGllbnRFbWl0LmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIFJlZ2lzdGVyIGNsaXBib2FyZCBhY3Rpb25zIGZvciBuZXcgZWxlbWVudChzKSB0byB0aGUgY2xpZW50LlxuICpcbiAqIEByZXR1cm5zIGB0aGlzYFxuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLmNsaXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX2NsaWVudENsaXAuYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gIH07XG4gIC8qKlxuICogVW5yZWdpc3RlciB0aGUgY2xpcGJvYXJkIGFjdGlvbnMgb2YgcHJldmlvdXNseSByZWdpc3RlcmVkIGVsZW1lbnQocykgb24gdGhlIHBhZ2UuXG4gKiBJZiBubyBlbGVtZW50cyBhcmUgcHJvdmlkZWQsIEFMTCByZWdpc3RlcmVkIGVsZW1lbnRzIHdpbGwgYmUgdW5yZWdpc3RlcmVkLlxuICpcbiAqIEByZXR1cm5zIGB0aGlzYFxuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLnVuY2xpcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfY2xpZW50VW5jbGlwLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuICAvKipcbiAqIEdldCBhbGwgb2YgdGhlIGVsZW1lbnRzIHRvIHdoaWNoIHRoaXMgY2xpZW50IGlzIGNsaXBwZWQuXG4gKlxuICogQHJldHVybnMgYXJyYXkgb2YgY2xpcHBlZCBlbGVtZW50c1xuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLmVsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF9jbGllbnRFbGVtZW50cy5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgLyoqXG4gKiBTZWxmLWRlc3RydWN0IGFuZCBjbGVhbiB1cCBldmVyeXRoaW5nIGZvciBhIHNpbmdsZSBjbGllbnQuXG4gKiBUaGlzIHdpbGwgTk9UIGRlc3Ryb3kgdGhlIGVtYmVkZGVkIEZsYXNoIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJucyBgdW5kZWZpbmVkYFxuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX2NsaWVudERlc3Ryb3kuYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gIH07XG4gIC8qKlxuICogU3RvcmVzIHRoZSBwZW5kaW5nIHBsYWluIHRleHQgdG8gaW5qZWN0IGludG8gdGhlIGNsaXBib2FyZC5cbiAqXG4gKiBAcmV0dXJucyBgdGhpc2BcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5zZXRUZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICAgIFplcm9DbGlwYm9hcmQuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgdGV4dCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxuICogU3RvcmVzIHRoZSBwZW5kaW5nIEhUTUwgdGV4dCB0byBpbmplY3QgaW50byB0aGUgY2xpcGJvYXJkLlxuICpcbiAqIEByZXR1cm5zIGB0aGlzYFxuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLnNldEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgWmVyb0NsaXBib2FyZC5zZXREYXRhKFwidGV4dC9odG1sXCIsIGh0bWwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcbiAqIFN0b3JlcyB0aGUgcGVuZGluZyByaWNoIHRleHQgKFJURikgdG8gaW5qZWN0IGludG8gdGhlIGNsaXBib2FyZC5cbiAqXG4gKiBAcmV0dXJucyBgdGhpc2BcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5zZXRSaWNoVGV4dCA9IGZ1bmN0aW9uKHJpY2hUZXh0KSB7XG4gICAgWmVyb0NsaXBib2FyZC5zZXREYXRhKFwiYXBwbGljYXRpb24vcnRmXCIsIHJpY2hUZXh0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXG4gKiBTdG9yZXMgdGhlIHBlbmRpbmcgZGF0YSB0byBpbmplY3QgaW50byB0aGUgY2xpcGJvYXJkLlxuICpcbiAqIEByZXR1cm5zIGB0aGlzYFxuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICBaZXJvQ2xpcGJvYXJkLnNldERhdGEuYXBwbHkodGhpcywgX2FyZ3MoYXJndW1lbnRzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxuICogQ2xlYXJzIHRoZSBwZW5kaW5nIGRhdGEgdG8gaW5qZWN0IGludG8gdGhlIGNsaXBib2FyZC5cbiAqIElmIG5vIGBmb3JtYXRgIGlzIHByb3ZpZGVkLCBhbGwgcGVuZGluZyBkYXRhIGZvcm1hdHMgd2lsbCBiZSBjbGVhcmVkLlxuICpcbiAqIEByZXR1cm5zIGB0aGlzYFxuICovXG4gIFplcm9DbGlwYm9hcmQucHJvdG90eXBlLmNsZWFyRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIFplcm9DbGlwYm9hcmQuY2xlYXJEYXRhLmFwcGx5KHRoaXMsIF9hcmdzKGFyZ3VtZW50cykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcbiAqIEdldHMgYSBjb3B5IG9mIHRoZSBwZW5kaW5nIGRhdGEgdG8gaW5qZWN0IGludG8gdGhlIGNsaXBib2FyZC5cbiAqIElmIG5vIGBmb3JtYXRgIGlzIHByb3ZpZGVkLCBhIGNvcHkgb2YgQUxMIHBlbmRpbmcgZGF0YSBmb3JtYXRzIHdpbGwgYmUgcmV0dXJuZWQuXG4gKlxuICogQHJldHVybnMgYFN0cmluZ2Agb3IgYE9iamVjdGBcbiAqL1xuICBaZXJvQ2xpcGJvYXJkLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFplcm9DbGlwYm9hcmQuZ2V0RGF0YS5hcHBseSh0aGlzLCBfYXJncyhhcmd1bWVudHMpKTtcbiAgfTtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFplcm9DbGlwYm9hcmQ7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBaZXJvQ2xpcGJvYXJkO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5aZXJvQ2xpcGJvYXJkID0gWmVyb0NsaXBib2FyZDtcbiAgfVxufSkoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8IHdpbmRvdztcbn0oKSk7IiwiJCAgICAgICAgICAgICAgID0gcmVxdWlyZSAnemVwdG9qcydcbl8gICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5CYWNrYm9uZSAgICAgICAgPSByZXF1aXJlICdiYWNrYm9uZSdcbkJhY2tib25lLiQgICAgICA9ICRcbnplcm9jbGlwYm9hcmQgICA9IHJlcXVpcmUgJ3plcm9jbGlwYm9hcmQnXG5mbGF2b3JzICAgICAgICAgPSByZXF1aXJlICcuL2ZsYXZvcnMuY29mZmVlJ1xuQ29tYm9rZXlzICAgICAgID0gcmVxdWlyZSAnY29tYm9rZXlzJ1xuTG9yZW1DbGlwYm9hcmQgID0gcmVxdWlyZSAnLi9jbGlwYm9hcmQuY29mZmVlJ1xueyByZW5kZXIsIHAsIHJhdywgYnIsIHRleHQsIGxpLCB1bCwgYSB9ID0gcmVxdWlyZSAndGVhY3VwJ1xuXG56ZXJvY2xpcGJvYXJkLmNvbmZpZyggeyBzd2ZQYXRoOiBcInN3Zi9aZXJvQ2xpcGJvYXJkLnN3ZlwiIH0gKVxuXG5jbGFzcyBBcHBWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGV2ZW50czpcbiAgICBcImNsaWNrIC5qcy1zZWxlY3QtZmxhdm9yIGFcIjogXCJzZWxlY3RGbGF2b3JcIlxuICAgIFwiY2xpY2sgLmpzLXNlbGVjdC1wYXJhZ3JhcGhzIGFcIjogXCJzZWxlY3ROdW1QYXJhZ3JhcGhzXCJcbiAgICBcImNsaWNrIC5qcy1zZWxlY3QtZm9ybWF0IGFcIjogXCJzZWxlY3RGb3JtYXRcIlxuICAgIFwiY2xpY2sgLmpzLWNvcHktdG8tY2xpcGJvYXJkXCI6IFwiY2FuY2VsXCJcbiAgICBcImNsaWNrIC5qcy1vcGVuLXN0YXRlbWVudFwiOiBcIm9wZW5TdGF0ZW1lbnRcIlxuICAgIFwiY2xpY2sgLmpzLWNsb3NlLXN0YXRlbWVudFwiOiBcImNsb3NlU3RhdGVtZW50XCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmTG9hZGVkU3RhdGVtZW50ID0gZmFsc2VcbiAgICBAbG9yZW1DbGlwYm9hcmQgPSBuZXcgTG9yZW1DbGlwYm9hcmQoKVxuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIFwiY2hhbmdlXCIsIEByZW5kZXJJcHN1bVxuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIFwiY2hhbmdlOmZsYXZvclwiLCBAcmVuZGVyRmxhdm9yc1xuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIFwiY2hhbmdlOnBhcmFncmFwaHNcIiwgQHJlbmRlck51bVBhcmFncmFwaHNcbiAgICBAbGlzdGVuVG8gQG1vZGVsLCBcImNoYW5nZTpmb3JtYXRcIiwgQHJlbmRlckZvcm1hdHNcblxuICByZW5kZXI6IC0+XG4gICAgQHNldEVsZW1lbnQgJChcIi5qcy1hcHBcIikgIyA6KFxuXG4gICAgQHJlbmRlckZsYXZvcnMoKVxuICAgIEByZW5kZXJOdW1QYXJhZ3JhcGhzKClcbiAgICBAcmVuZGVyRm9ybWF0cygpXG4gICAgQHJlbmRlcklwc3VtKClcblxuXG4gICAgIyBaZXJvQ2xpcGJvYXJkIHN0dWZmXG5cbiAgICBAemVyb0NsaXBib2FyZENsaWVudCA9IG5ldyB6ZXJvY2xpcGJvYXJkKEAkKFwiLmpzLWNvcHktdG8tY2xpcGJvYXJkXCIpKVxuXG4gICAgQHplcm9DbGlwYm9hcmRDbGllbnQub24gXCJlcnJvclwiLCAoZSkgPT5cbiAgICAgIEAkKFwiLmpzLWNvcHktdG8tY2xpcGJvYXJkXCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpXG5cbiAgICBAemVyb0NsaXBib2FyZENsaWVudC5vbiBcInJlYWR5XCIsIChlKSA9PlxuICAgICAgQCQoXCIuanMtY29weS10by1jbGlwYm9hcmRcIikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIilcblxuICAgIEB6ZXJvQ2xpcGJvYXJkQ2xpZW50Lm9uIFwiY29weVwiLCAoZSkgPT5cbiAgICAgIGNsaXBib2FyZCA9IGUuY2xpcGJvYXJkRGF0YVxuICAgICAgY2xpcGJvYXJkLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIEBsb3JlbUNsaXBib2FyZC52YWx1ZSlcblxuICAgIEB6ZXJvQ2xpcGJvYXJkQ2xpZW50Lm9uIFwiYWZ0ZXJjb3B5XCIsID0+XG4gICAgICBAZmxhc2hDb3BpZWRTdGF0ZSgpXG5cbiAgICBpZiAhL01hY3xpUG9kfGlQaG9uZXxpUGFkLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSlcbiAgICAgIEAkKFwiLmpzLW1ldGEta2V5LXR5cGVcIikudGV4dCAnQ3RybCdcblxuICAgIF8uZGVmZXIgPT5cbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIilcblxuXG4gICAgIyBTaG9ydGN1dHMgYy9vIENvbWJva2V5c1xuXG4gICAgY29tYm9rZXlzID0gbmV3IENvbWJva2V5cyhkb2N1bWVudClcblxuICAgIGNvbWJva2V5cy5iaW5kIFwiMVwiLCA9PiBAbW9kZWwuc2V0UGFyYWdyYXBocyhcIjFcIilcbiAgICBjb21ib2tleXMuYmluZCBcIjJcIiwgPT4gQG1vZGVsLnNldFBhcmFncmFwaHMoXCIyXCIpXG4gICAgY29tYm9rZXlzLmJpbmQgXCIzXCIsID0+IEBtb2RlbC5zZXRQYXJhZ3JhcGhzKFwiM1wiKVxuICAgIGNvbWJva2V5cy5iaW5kIFwiNFwiLCA9PiBAbW9kZWwuc2V0UGFyYWdyYXBocyhcIjRcIilcbiAgICBjb21ib2tleXMuYmluZCBcIjVcIiwgPT4gQG1vZGVsLnNldFBhcmFncmFwaHMoXCI1XCIpXG4gICAgY29tYm9rZXlzLmJpbmQgXCI2XCIsID0+IEBtb2RlbC5zZXRQYXJhZ3JhcGhzKFwiNlwiKVxuICAgIGNvbWJva2V5cy5iaW5kIFwiN1wiLCA9PiBAbW9kZWwuc2V0UGFyYWdyYXBocyhcIjdcIilcbiAgICBjb21ib2tleXMuYmluZCBcIjhcIiwgPT4gQG1vZGVsLnNldFBhcmFncmFwaHMoXCI4XCIpXG5cbiAgICBjb21ib2tleXMuYmluZCBcInRcIiwgPT4gQG1vZGVsLnNldEZvcm1hdChcIlRleHRcIilcbiAgICBjb21ib2tleXMuYmluZCBcImhcIiwgPT4gQG1vZGVsLnNldEZvcm1hdChcIkhUTUxcIilcbiAgICBjb21ib2tleXMuYmluZCBcImpcIiwgPT4gQG1vZGVsLnNldEZvcm1hdChcIkpTT05cIilcblxuICAgIGNvbWJva2V5cy5iaW5kIFwiZXNjXCIsID0+IEBjbG9zZVN0YXRlbWVudCgpXG5cbiAgICBAXG5cbiAgcmVuZGVyRmxhdm9yczogLT5cbiAgICBzZWxlY3RlZEZsYXZvciA9IEBtb2RlbC5nZXQoXCJmbGF2b3JcIilcblxuICAgIGdldEF0dHJzID0gKGZsYXZvcikgLT5cbiAgICAgIGNsYXNzZXMgPSBcIm1ldGEtY29udHJvbC1vcHRpb25zLWl0ZW0tbGlua1wiXG4gICAgICBpZiBmbGF2b3IgPT0gc2VsZWN0ZWRGbGF2b3JcbiAgICAgICAgY2xhc3NlcyArPSBcIiBpcy1jdXJyZW50XCJcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJocmVmXCI6IFwiI1wiXG4gICAgICAgIFwiZGF0YS1mbGF2b3JcIjogZmxhdm9yXG4gICAgICAgIFwiY2xhc3NcIjogY2xhc3Nlc1xuICAgICAgfVxuXG4gICAgaHRtbCA9IHJlbmRlciAtPlxuICAgICAgZm9yIGZsYXZvciBvZiBmbGF2b3JzXG4gICAgICAgIGxpICcubWV0YS1jb250cm9sLW9wdGlvbnMtaXRlbScsIC0+XG4gICAgICAgICAgYSBnZXRBdHRycyhmbGF2b3IpLCAtPlxuICAgICAgICAgICAgdGV4dCBmbGF2b3JcblxuICAgIEAkKFwiLmpzLWxpc3QtZmxhdm9yc1wiKS5odG1sIGh0bWxcblxuICAgIEBcblxuICByZW5kZXJOdW1QYXJhZ3JhcGhzOiAtPlxuICAgIHBhcmFncmFwaHNSYW5nZSA9IFsxLi44XVxuICAgIHNlbGVjdGVkTnVtUGFyYWdyYXBocyA9IE51bWJlciBAbW9kZWwuZ2V0KFwicGFyYWdyYXBoc1wiKVxuXG4gICAgZ2V0QXR0cnMgPSAobnVtUGFyYSkgLT5cbiAgICAgIGNsYXNzZXMgPSBcIm1ldGEtY29udHJvbC1vcHRpb25zLWl0ZW0tbGlua1wiXG4gICAgICBpZiBudW1QYXJhID09IHNlbGVjdGVkTnVtUGFyYWdyYXBoc1xuICAgICAgICBjbGFzc2VzICs9IFwiIGlzLWN1cnJlbnRcIlxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBcImhyZWZcIjogXCIjXCJcbiAgICAgICAgXCJkYXRhLXBhcmFncmFwaHNcIjogbnVtUGFyYVxuICAgICAgICBcImNsYXNzXCI6IGNsYXNzZXNcbiAgICAgIH1cblxuICAgIGh0bWwgPSByZW5kZXIgLT5cbiAgICAgIGZvciBudW1QYXJhIGluIHBhcmFncmFwaHNSYW5nZVxuICAgICAgICBsaSAnLm1ldGEtY29udHJvbC1vcHRpb25zLWl0ZW0nLCAtPlxuICAgICAgICAgIGEgZ2V0QXR0cnMobnVtUGFyYSksIC0+XG4gICAgICAgICAgICB0ZXh0IG51bVBhcmFcblxuICAgIEAkKFwiLmpzLWxpc3QtcGFyYWdyYXBoc1wiKS5odG1sIGh0bWxcblxuICAgIEBcblxuICByZW5kZXJGb3JtYXRzOiAtPlxuICAgIGZvcm1hdHMgPSBbXCJUZXh0XCIsIFwiSFRNTFwiLCBcIkpTT05cIl1cbiAgICBzZWxlY3RlZEZvcm1hdCA9IEBtb2RlbC5nZXQoXCJmb3JtYXRcIilcblxuICAgIGdldEF0dHJzID0gKGZvcm1hdCkgLT5cbiAgICAgIGNsYXNzZXMgPSBcIm1ldGEtY29udHJvbC1vcHRpb25zLWl0ZW0tbGlua1wiXG4gICAgICBpZiBmb3JtYXQgPT0gc2VsZWN0ZWRGb3JtYXRcbiAgICAgICAgY2xhc3NlcyArPSBcIiBpcy1jdXJyZW50XCJcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJocmVmXCI6IFwiI1wiXG4gICAgICAgIFwiZGF0YS1mb3JtYXRcIjogZm9ybWF0XG4gICAgICAgIFwiY2xhc3NcIjogY2xhc3Nlc1xuICAgICAgfVxuXG4gICAgaHRtbCA9IHJlbmRlciAtPlxuICAgICAgZm9yIGZvcm1hdCBpbiBmb3JtYXRzXG4gICAgICAgIGxpICcubWV0YS1jb250cm9sLW9wdGlvbnMtaXRlbScsIC0+XG4gICAgICAgICAgYSBnZXRBdHRycyhmb3JtYXQpLCAtPlxuICAgICAgICAgICAgdGV4dCBmb3JtYXRcblxuICAgIEAkKFwiLmpzLWxpc3QtZm9ybWF0c1wiKS5odG1sIGh0bWxcblxuICAgIEBcblxuICByZW5kZXJJcHN1bTogLT5cbiAgICAkaXBzdW0gPSAkKFwiLmpzLXJlbmRlci1pcHN1bVwiKVxuICAgIGZvcm1hdCA9IEBtb2RlbC5nZXQoXCJmb3JtYXRcIilcbiAgICBudW1QYXJhZ3JhcGhzID0gQG1vZGVsLmdldChcInBhcmFncmFwaHNcIilcbiAgICBwYXJhZ3JhcGhzID0gKEBnZW5lcmF0ZVBhcmFncmFwaCgpIGZvciBwYXJhIGluIFsxLi5udW1QYXJhZ3JhcGhzXSlcblxuICAgIHN3aXRjaCBmb3JtYXRcblxuICAgICAgd2hlbiBcIkhUTUxcIlxuICAgICAgICBodG1sID0gcmVuZGVyIC0+XG4gICAgICAgICAgZm9yIHBhcmEgaW4gcGFyYWdyYXBoc1xuICAgICAgICAgICAgcCBcIjxwPiN7cGFyYX08L3A+XCJcblxuICAgICAgICBjbGlwYm9hcmQgPSByZW5kZXIgLT5cbiAgICAgICAgICBmb3IgcGFyYSBpbiBwYXJhZ3JhcGhzXG4gICAgICAgICAgICByYXcgXCI8cD4je3BhcmF9PC9wPlxcblxcblwiXG5cbiAgICAgIHdoZW4gXCJKU09OXCJcbiAgICAgICAgcGFyYWdyYXBocyA9IChcIlxcXCIje3BhcmF9XFxcIlwiIGZvciBwYXJhIGluIHBhcmFncmFwaHMpXG4gICAgICAgIGpvaW5lZFBhcmFncmFwaHMgPSBwYXJhZ3JhcGhzLmpvaW4oXCIsXCIpXG5cbiAgICAgICAgaHRtbCA9IHJlbmRlciAtPlxuICAgICAgICAgIHRleHQgXCJbXCJcbiAgICAgICAgICB0ZXh0IHBhcmFncmFwaHNcbiAgICAgICAgICB0ZXh0IFwiXVwiXG5cbiAgICAgICAgY2xpcGJvYXJkID0gcmVuZGVyIC0+XG4gICAgICAgICAgdGV4dCBcIltcIlxuICAgICAgICAgIHJhdyBwYXJhZ3JhcGhzXG4gICAgICAgICAgdGV4dCBcIl1cIlxuXG4gICAgICBlbHNlICMgXCJUZXh0XCIsIHRoZSBkZWZhdWx0XG4gICAgICAgIGh0bWwgPSByZW5kZXIgLT5cbiAgICAgICAgICBmb3IgcGFyYSBpbiBwYXJhZ3JhcGhzXG4gICAgICAgICAgICBwIHBhcmFcblxuICAgICAgICBjbGlwYm9hcmQgPSByZW5kZXIgLT5cbiAgICAgICAgICBmb3IgcGFyYSBpbiBwYXJhZ3JhcGhzXG4gICAgICAgICAgICByYXcgXCIje3BhcmF9XFxuXFxuXCJcblxuICAgICRpcHN1bS5odG1sIGh0bWxcblxuICAgIEBsb3JlbUNsaXBib2FyZC5zZXQgY2xpcGJvYXJkXG5cbiAgICBAXG5cbiAgZ2VuZXJhdGVTZW50ZW5jZTogLT5cbiAgICAjIFRoZSBzZW50ZW5jZSBzaG91bGQgYmUgc29tZWh3ZXJlIGJldHdlZW4gNiBhbmQgMTAgd29yZHMgb3IgcGhyYXNlc1xuICAgIGxlbmd0aFJhbmdlID0gWzYuLjEwXVxuICAgIGxlbmd0aCA9IF8uc2FtcGxlIGxlbmd0aFJhbmdlXG4gICAgZmxhdm9yID0gQG1vZGVsLmdldChcImZsYXZvclwiKVxuICAgIHdvcmRBcnJheSA9IF8uc2FtcGxlIGZsYXZvcnNbZmxhdm9yXSwgbGVuZ3RoXG4gICAgcmF3U2VudGVuY2UgPSB3b3JkQXJyYXkuam9pbihcIiBcIilcbiAgICAjIFVwcGVyY2FzZSBmaXJzdCBsZXR0ZXIgYW5kIGFkZCBhIHBlcmlvZC5cbiAgICBzZW50ZW5jZSA9IHJhd1NlbnRlbmNlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcmF3U2VudGVuY2Uuc2xpY2UoMSkgKyBcIi5cIlxuXG4gIGdlbmVyYXRlUGFyYWdyYXBoOiAtPlxuICAgICMgVGhlIHBhcmFncmFwaCBzaG91bGQgYmUgc29tZWh3ZXJlIGJldHdlZW4gNCBhbmQgMTAgc2VudGVuY2VzLlxuICAgIGxlbmd0aFJhbmdlID0gWzQuLjhdXG4gICAgbGVuZ3RoID0gXy5zYW1wbGUgbGVuZ3RoUmFuZ2VcbiAgICBwYXJhZ3JhcGggPSAoQGdlbmVyYXRlU2VudGVuY2UoKSBmb3IgcyBpbiBbMC4ubGVuZ3RoXSkuam9pbihcIiBcIilcblxuICBzZWxlY3RGbGF2b3I6IChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIHZhbHVlID0gJChlLnRhcmdldCkuYXR0cihcImRhdGEtZmxhdm9yXCIpXG4gICAgQG1vZGVsLnNldEZsYXZvcih2YWx1ZSlcbiAgICBmYWxzZVxuXG4gIHNlbGVjdE51bVBhcmFncmFwaHM6IChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIHZhbHVlID0gJChlLnRhcmdldCkuYXR0cihcImRhdGEtcGFyYWdyYXBoc1wiKVxuICAgIEBtb2RlbC5zZXRQYXJhZ3JhcGhzKHZhbHVlKVxuICAgIGZhbHNlXG5cbiAgc2VsZWN0Rm9ybWF0OiAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB2YWx1ZSA9ICQoZS50YXJnZXQpLmF0dHIoXCJkYXRhLWZvcm1hdFwiKVxuICAgIEBtb2RlbC5zZXRGb3JtYXQodmFsdWUpXG4gICAgZmFsc2VcblxuICBmbGFzaENvcGllZFN0YXRlOiAtPlxuICAgICRjb3B5QnRuID0gQCQoXCIuanMtY29weS10by1jbGlwYm9hcmRcIilcbiAgICBvcmlnaW5hbFRleHQgPSAkY29weUJ0bi5odG1sKClcbiAgICAkY29weUJ0bi50ZXh0IFwiQ29waWVkIVwiXG4gICAgc2V0VGltZW91dCA9PlxuICAgICAgJGNvcHlCdG4uaHRtbCBvcmlnaW5hbFRleHRcbiAgICAsIDIwMDBcblxuICBvcGVuU3RhdGVtZW50OiAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGlmICFAZkxvYWRlZFN0YXRlbWVudFxuICAgICAgJC5nZXQgXCIvc3RhdGVtZW50Lmh0bWxcIiwgKGRhdGEpID0+XG4gICAgICAgIEBmTG9hZGVkU3RhdGVtZW50ID0gdHJ1ZVxuICAgICAgICBAJChcIi5qcy1zdGF0ZW1lbnRcIikuaHRtbCBkYXRhXG5cbiAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcImlzLXNob3duLXN0YXRlbWVudFwiKVxuXG4gICAgZmFsc2VcblxuICBjbG9zZVN0YXRlbWVudDogKGUpIC0+XG4gICAgZT8ucHJldmVudERlZmF1bHQoKVxuICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwiaXMtc2hvd24tc3RhdGVtZW50XCIpXG4gICAgZmFsc2VcblxuICBjYW5jZWw6IChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGZhbHNlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3XG4iLCIkID0gcmVxdWlyZSAnemVwdG9qcydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuXG5pc1Zpc2libGVJbnB1dCA9IChlbGVtKSAtPlxuICBlbGVtID0gJChlbGVtKVxuICByZXR1cm4gISEoZWxlbS53aWR0aCgpIHx8IGVsZW0uaGVpZ2h0KCkpICYmIGVsZW0uY3NzKFwiZGlzcGxheVwiKSAhPSBcIm5vbmVcIlxuXG5jbGFzcyBMb3JlbUNsaXBib2FyZFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAdmFsdWUgPSBcIlwiXG5cbiAgICAkKGRvY3VtZW50KS5rZXlkb3duIChlKSA9PlxuXG4gICAgICAjIE9ubHkgZG8gdGhpcyBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byBiZSBwdXQgb24gdGhlIGNsaXBib2FyZCwgYW5kIGl0XG4gICAgICAjIGxvb2tzIGxpa2UgdGhleSdyZSBzdGFydGluZyBhIGNvcHkgc2hvcnRjdXRcbiAgICAgIGlmICFAdmFsdWUgfHwgIShlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KVxuICAgICAgICByZXR1cm5cblxuICAgICAgIyBkdW0gY29weSBwYXN0YSBub24tRFJZIHdheSB0byBkbyBBcHBWaWV3OjpmbGFzaENvcGllZFN0YXRlXG4gICAgICBpZiBlLmtleUNvZGUgPT0gNjdcbiAgICAgICAgJGNvcHlCdG4gPSAkKFwiLmpzLWNvcHktdG8tY2xpcGJvYXJkXCIpXG4gICAgICAgIG9yaWdpbmFsSHRtbCA9ICRjb3B5QnRuLmh0bWwoKVxuICAgICAgICAkY29weUJ0blxuICAgICAgICAudGV4dCBcIkNvcGllZCFcIlxuICAgICAgICAuYWRkQ2xhc3MoXCJpcy1mb2N1c1wiKVxuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgJGNvcHlCdG5cbiAgICAgICAgICAuaHRtbCBvcmlnaW5hbEh0bWxcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoXCJpcy1mb2N1c1wiKVxuICAgICAgICAsIDIwMDBcblxuICAgICAgZWxlbSA9ICQoZS50YXJnZXQpXG4gICAgICBpZiBlbGVtLmlzKFwiaW5wdXQsdGV4dGFyZWFcIilcbiAgICAgICAgaWYgaXNWaXNpYmxlSW5wdXQoZWxlbSlcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgIyBBYm9ydCBpZiBpdCBsb29rcyBsaWtlIHRoZXkndmUgc2VsZWN0ZWQgc29tZSB0ZXh0IChtYXliZSB0aGV5J3JlIHRyeWluZ1xuICAgICAgIyB0byBjb3B5IG91dCBhIGJpdCBvZiB0aGUgZGVzY3JpcHRpb24gb3Igc29tZXRoaW5nKVxuICAgICAgaWYgd2luZG93LmdldFNlbGVjdGlvbj8oKT8udG9TdHJpbmcoKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgZG9jdW1lbnQuc2VsZWN0aW9uPy5jcmVhdGVSYW5nZSgpLnRleHRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgJGNsaXBib2FyZENvbnRhaW5lciA9ICQoXCIuanMtbG9yZW0tY2xpcGJvYXJkXCIpXG4gICAgICAgICRjbGlwYm9hcmRDb250YWluZXIuZW1wdHkoKS5zaG93KClcbiAgICAgICAgQCRjbGlwYm9hcmRJbnB1dCA9ICQoXCI8dGV4dGFyZWEgY2xhc3M9J2xvcmVtLWNsaXBib2FyZC1pbnB1dCBqcy1sb3JlbS1jbGlwYm9hcmQtaW5wdXQnPjwvdGV4dGFyZWE+XCIpXG4gICAgICAgIC52YWwoQHZhbHVlKVxuICAgICAgICAuYXBwZW5kVG8oJGNsaXBib2FyZENvbnRhaW5lcilcbiAgICAgICAgLmZvY3VzKClcbiAgICAgICAgIyBubyBzZWxlY3QoKSBpbiB6ZXB0by4gwq9cXF8o44OEKV8vwq9cbiAgICAgICAgQCRjbGlwYm9hcmRJbnB1dFswXS5zZWxlY3QoKVxuXG5cbiAgICAkKGRvY3VtZW50KS5rZXl1cCAoZSkgLT5cblxuICAgICAgaWYgJChlLnRhcmdldCkuaXMoXCIuanMtbG9yZW0tY2xpcGJvYXJkLWlucHV0XCIpXG4gICAgICAgICQoXCIuanMtbG9yZW0tY2xpcGJvYXJkXCIpLmVtcHR5KCkuaGlkZSgpXG5cbiAgc2V0OiAoQHZhbHVlKSAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IExvcmVtQ2xpcGJvYXJkXG4iLCJmbGF2b3JzID1cbiAgXCJMb3JlbSBJcHN1bVwiOiBbXG4gICAgJ2xvcmVtJ1xuICAgICdpcHN1bSdcbiAgICAnZG9sb3InXG4gICAgJ3NpdCdcbiAgICAnYW1ldCdcbiAgICAnY29uc2VjdGV0dXInXG4gICAgJ2FkaXBpc2NpbmcnXG4gICAgJ2VsaXQnXG4gICAgJ3F1aXNxdWUnXG4gICAgJ2FjJ1xuICAgICdzZW1wZXInXG4gICAgJ25pc2knXG4gICAgJ2hlbmRyZXJpdCdcbiAgICAnbmVxdWUnXG4gICAgJ2FsaXF1ZXQnXG4gICAgJ2JpYmVuZHVtJ1xuICAgICdzZW0nXG4gICAgJ2xhY3VzJ1xuICAgICdtb2xlc3RpZSdcbiAgICAnYW50ZSdcbiAgICAncG9ydGEnXG4gICAgJ21ldHVzJ1xuICAgICdhJ1xuICAgICd0b3J0b3InXG4gICAgJ2FlbmVhbidcbiAgICAnZmFjaWxpc2lzJ1xuICAgICd2ZW5lbmF0aXMnXG4gICAgJ251bmMnXG4gICAgJ2luJ1xuICAgICdsYWNpbmlhJ1xuICAgICdtb2xsaXMnXG4gICAgJ2VnZXQnXG4gICAgJ3BoYXNlbGx1cydcbiAgICAndmFyaXVzJ1xuICAgICdhdWd1ZSdcbiAgICAnbnVsbGEnXG4gICAgJ2ZhdWNpYnVzJ1xuICAgICdtb3JiaSdcbiAgICAncGxhY2VyYXQnXG4gICAgJ3VsbGFtY29ycGVyJ1xuICAgICdyaXN1cydcbiAgICAnZXQnXG4gICAgJ3Job25jdXMnXG4gICAgJ2VyYXQnXG4gICAgJ2VmZmljaXR1cidcbiAgICAndXQnXG4gICAgJ2V1J1xuICAgICdlcm9zJ1xuICAgICdjb252YWxsaXMnXG4gICAgJ3RlbGx1cydcbiAgICAnc3VzY2lwaXQnXG4gICAgJ2RpZ25pc3NpbSdcbiAgICAnZW5pbSdcbiAgICAndml2ZXJyYSdcbiAgICAnc29sbGljaXR1ZGluJ1xuICAgICdsZW8nXG4gICAgJ3R1cnBpcydcbiAgICAndmVzdGlidWx1bSdcbiAgICAnZnJpbmdpbGxhJ1xuICAgICdmdXNjZSdcbiAgICAncHVydXMnXG4gICAgJ2ZldWdpYXQnXG4gICAgJ3V0J1xuICAgICduZWMnXG4gICAgJ2xvYm9ydGlzJ1xuICAgICdsZWN0dXMnXG4gICAgJ3Z1bHB1dGF0ZSdcbiAgICAnaWQnXG4gICAgJ2ludGVnZXInXG4gICAgJ29ybmFyZSdcbiAgICAnZXgnXG4gICAgJ3BlbGxlbnRlc3F1ZSdcbiAgICAnZHVpcydcbiAgICAncXVpcydcbiAgICAncGVsbGVudGVzcXVlJ1xuICAgICd2ZWwnXG4gICAgJ2RpYW0nXG4gICAgJ2Nvbmd1ZSdcbiAgICAnY29uc2VxdWF0J1xuICAgICduYW0nXG4gICAgJ2NvbW1vZG8nXG4gICAgJ25vbidcbiAgICAncG9ydHRpdG9yJ1xuICAgICdlZ2VzdGFzJ1xuICAgICdtYXR0aXMnXG4gICAgJ3VybmEnXG4gICAgJ2F1Y3RvcidcbiAgICAnZHVpJ1xuICAgICdqdXN0bydcbiAgICAndm9sdXRwYXQnXG4gICAgJ29kaW8nXG4gICAgJ2V1aXNtb2QnXG4gICAgJ3B1bHZpbmFyJ1xuICAgICdzZWQnXG4gICAgJ25pYmgnXG4gICAgJ21hdXJpcydcbiAgICAndmVsaXQnXG4gICAgJ2FsaXF1YW0nXG4gICAgJ21heGltdXMnXG4gICAgJ2xvcmVtJ1xuICAgICdjb25kaW1lbnR1bSdcbiAgICAnZG9uZWMnXG4gICAgJ3F1YW0nXG4gICAgJ3J1dHJ1bSdcbiAgICAncHJhZXNlbnQnXG4gICAgJ2VsZW1lbnR1bSdcbiAgICAnc2NlbGVyaXNxdWUnXG4gICAgJ3ZpdGFlJ1xuICAgICdudWxsYW0nXG4gICAgJ2N1cnN1cydcbiAgICAndGVtcHVzJ1xuICAgICdwcm9pbidcbiAgICAnaW1wZXJkaWV0J1xuICAgICdvcmNpJ1xuICAgICdpbnRlcmR1bSdcbiAgICAnYXQnXG4gICAgJ2RpY3R1bSdcbiAgICAnaWFjdWxpcydcbiAgICAnbnVsbGEnXG4gICAgJ3NlZCdcbiAgICAnYmxhbmRpdCdcbiAgICAnY3JhcydcbiAgICAnZ3JhdmlkYSdcbiAgICAnbnVuYydcbiAgICAnZXN0J1xuICAgICdkYXBpYnVzJ1xuICAgICdtYWduYSdcbiAgICAnbHVjdHVzJ1xuICAgICdtYXNzYSdcbiAgICAnbGFvcmVldCdcbiAgICAndml2YW11cydcbiAgICAndGluY2lkdW50J1xuICAgICdlbGVpZmVuZCdcbiAgICAnc3VzcGVuZGlzc2UnXG4gICAgJ2xpZ3VsYSdcbiAgICAnbGliZXJvJ1xuICAgICdmaW5pYnVzJ1xuICAgICdwcmV0aXVtJ1xuICAgICdhY2N1bXNhbidcbiAgICAnZmVybWVudHVtJ1xuICAgICd0cmlzdGlxdWUnXG4gICAgJ3BoYXJldHJhJ1xuICAgICdtaSdcbiAgICAnY3VyYWJpdHVyJ1xuICAgICdoYWJpdGFudCdcbiAgICAnbW9yYmknXG4gICAgJ3NlbmVjdHVzJ1xuICAgICduZXR1cydcbiAgICAnbWFsZXN1YWRhJ1xuICAgICdmYW1lcydcbiAgICAnZmVsaXMnXG4gICAgJ2luJ1xuICAgICdzYXBpZW4nXG4gICAgJ3NvZGFsZXMnXG4gICAgJ2FyY3UnXG4gIF1cbiAgXCJUcmVsbG9cIjogW1xuICAgIFwiY2FyZFwiXG4gICAgXCJib2FyZFwiXG4gICAgXCJsaXN0c1wiXG4gICAgXCJsaXN0IG9mIGxpc3RzXCJcbiAgICBcImF0IGEgZ2xhbmNlXCJcbiAgICBcIlRyZWxsb1wiXG4gICAgXCJUYWNvXCJcbiAgICBcImNoZWNrbGlzdHNcIlxuICAgIFwiQ2hvcml6b1wiXG4gICAgXCJUcmVsbG8gR29sZFwiXG4gICAgXCJCdXNpbmVzcyBDbGFzc1wiXG4gICAgXCJ2aXN1YWxcIlxuICAgIFwiZnJlZVwiXG4gICAgXCJhdHRhY2htZW50XCJcbiAgICBcImRyYWcgYW5kIGRyb3BcIlxuICAgIFwiZHVlIGRhdGVzXCJcbiAgICBcIm1lbWJlcnNcIlxuICAgIFwib3JnYW5pemF0aW9uXCJcbiAgICBcImxpc3RcIlxuICAgIFwid2l0aCBhbnlvbmVcIlxuICAgIFwiYW55dGhpbmdcIlxuICAgIFwidGVhbVwiXG4gICAgXCJmYW1pbHkgYW5kIGZyaWVuZHNcIlxuICAgIFwibGFiZWxcIlxuICAgIFwiZmxleGlibGVcIlxuICAgIFwicHJvamVjdFwiXG4gICAgXCJyZWFsIHRpbWVcIlxuICAgIFwic2ltcGxlXCJcbiAgICBcInBvd2VyLXVwc1wiXG4gICAgXCJjb21tZW50XCJcbiAgICBcIm5vdGlmaWNhdGlvbnNcIlxuICAgIFwiZG9uZVwiXG4gICAgXCJlYXN5XCJcbiAgICBcIm9yZ2FuaXplXCJcbiAgICBcInN0aWNrZXJzXCJcbiAgXVxuICBcIlNrYXRlXCI6IFtcbiAgICBcIlRvbnkgSGF3a1wiXG4gICAgXCJCb2IgQnVybnF1aXN0XCJcbiAgICBcIlN0ZXZlIENhYmFsbGVyb1wiXG4gICAgXCJSdW5lIEdsaWZiZXJnXCJcbiAgICBcIkVsaXNzYSBTdGVhbWVyXCJcbiAgICBcIkdlb2ZmIFJvd2xleVwiXG4gICAgXCJCdWNreSBMYXNla1wiXG4gICAgXCJLYXJlZW0gQ2FtcGJlbGxcIlxuICAgIFwiUm9kbmV5IE11bGxlblwiXG4gICAgXCJUaHJhc2hlclwiXG4gICAgXCJWYW5zXCJcbiAgICBcIjE4MFwiXG4gICAgXCIzNjBcIlxuICAgIFwiNTQwXCJcbiAgICBcIjcyMFwiXG4gICAgXCI5MDBcIlxuICAgIFwiMTA4MFwiXG4gICAgXCJoYWxmLXBpcGVcIlxuICAgIFwiZnVsbCBwaXBlXCJcbiAgICBcImRvd25oaWxsXCJcbiAgICBcInNrYXRlIG9yIGRpZVwiXG4gICAgXCJ0cnVja3NcIlxuICAgIFwiUy5LLkEuVC5FLlwiXG4gICAgXCI1MC01MFwiXG4gICAgXCJib25lbGVzc1wiXG4gICAgXCJub3NlIHNsaWRlXCJcbiAgICBcIm5vc2VncmluZFwiXG4gICAgXCJzdG9rZWRcIlxuICAgIFwicmFkXCJcbiAgICBcImdvb2Z5LWZvb3RlZFwiXG4gICAgXCJjcm9va2VkIGdyaW5kXCJcbiAgICBcImZha2llXCJcbiAgICBcInB1bXBcIlxuICAgIFwib2xsaWVcIlxuICAgIFwibm9sbGllXCJcbiAgICBcInRhaWxcIlxuICAgIFwiZ3JpbmRcIlxuICAgIFwiYmFpbFwiXG4gICAgXCJmYWlsXCJcbiAgICBcImduYXJseVwiXG4gICAgXCJtYW51YWxcIlxuICAgIFwic3BpbmVcIlxuICAgIFwibGlwXCJcbiAgICBcInJhaWxzXCJcbiAgICBcImFpcndhbGtcIlxuICAgIFwic2hvdmVpdFwiXG4gICAgXCJoZWVsIGZsaXBcIlxuICAgIFwibWluaSByYW1wXCJcbiAgICBcImxpZW4gYWlyXCJcbiAgICBcInZhcmlhbFwiXG4gICAgXCJtZXRob2QgYWlyXCJcbiAgICBcImZyaWdpZCBhaXJcIlxuICAgIFwia2lja2ZsaXBcIlxuICAgIFwiTWNUd2lzdFwiXG4gICAgXCJkcm9wIGluXCJcbiAgICBcImJvZHkgdmFyaWFsXCJcbiAgXVxuICBcIkhvZG9yXCI6IFtcbiAgICBcImhvZG9yXCJcbiAgICBcImhvZG9yXCJcbiAgICBcImhvZG9yXCJcbiAgICBcImhvZG9yXCJcbiAgICBcImhvZG9yXCJcbiAgICBcImhvZG9yXCJcbiAgICBcIkhPRE9SXCJcbiAgICBcIkhvZG9yXCJcbiAgXVxuICBcIlJlZGFjdGVkXCI6IFtcbiAgICBcIuKWiFwiXG4gICAgXCLilohcIlxuICAgIFwi4paI4paIXCJcbiAgICBcIuKWiOKWiFwiXG4gICAgXCLilojilohcIlxuICAgIFwi4paI4paI4paIXCJcbiAgICBcIuKWiOKWiOKWiOKWiFwiXG4gICAgXCLilojilojilojilohcIlxuICAgIFwi4paI4paI4paI4paIXCJcbiAgICBcIuKWiOKWiOKWiOKWiOKWiFwiXG4gICAgXCLilojilojilojilojilojilohcIlxuICAgIFwi4paI4paI4paI4paI4paI4paI4paI4paIXCJcbiAgXVxuICBcIkhhWHNTb1JcIjogW1xuICAgIFwiPHA+XCJcbiAgICBcIjxCPmhheG9yejwvQj5cIlxuICAgIFwiPHNjcmlwdD5hbGVydCgnMTMzNycpPC9zY3JpcHQ+XCJcbiAgICBcIjwvcD5cIlxuICAgIFwiPC9odG1sPlwiXG4gICAgXCI8aW1nIHNyYz0nLycgd2lkdGg9JzUwMCcgaGVpZ2h0PSczMDAnPlwiXG4gIF1cblxubW9kdWxlLmV4cG9ydHMgPSBmbGF2b3JzXG4iLCJCYWNrYm9uZSA9IHJlcXVpcmUgJ2JhY2tib25lJ1xuXG5jbGFzcyBMb3JlbU1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcbiAgZGVmYXVsdHM6IC0+XG4gICAgbHMgPSBKU09OLnBhcnNlIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzZXR0aW5ncycpXG4gICAge1xuICAgICAgZmxhdm9yOiBscz9bXCJmbGF2b3JcIl0gPyBcIkxvcmVtIElwc3VtXCJcbiAgICAgIHBhcmFncmFwaHM6IGxzP1tcInBhcmFncmFwaHNcIl0gPyAzXG4gICAgICBmb3JtYXQ6IGxzP1tcImZvcm1hdFwiXSA/IFwiVGV4dFwiXG4gICAgfVxuXG4gIHNldDogLT5cbiAgICBzdXBlclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkoQGF0dHJpYnV0ZXMpKVxuXG4gIHNldEZsYXZvcjogKHZhbHVlKSAtPlxuICAgIEBzZXQoe2ZsYXZvcjogdmFsdWV9KVxuXG4gIHNldFBhcmFncmFwaHM6ICh2YWx1ZSkgLT5cbiAgICBAc2V0KHtwYXJhZ3JhcGhzOiB2YWx1ZX0pXG5cbiAgc2V0Rm9ybWF0OiAodmFsdWUpIC0+XG4gICAgQHNldCh7Zm9ybWF0OiB2YWx1ZX0pXG5cbm1vZHVsZS5leHBvcnRzID0gTG9yZW1Nb2RlbFxuIl19
