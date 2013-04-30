var path = require('path')
  , WsEventMgr;

WsEventMgr = function (options) {
  this.options = options || {};
  this.options.registerEventName = this.options.registerEventName || 'wsem:register';
  this.options.unregisterEventName = this.options.unregisterEventName || 'wsem:unregister';
  this.options.clientScriptUrl = this.options.clientScriptUrl || '/wsem.js';
  this.sockets = {};
  this.clientRegistrations = [];
  this.registrationListeners = [];
};

WsEventMgr.Client = function () {
  return require('./wsem-client').WsEventMgr;
};

WsEventMgr.prototype.start = function (server, connectCallback, disconnectCallback) {
  var that, register, unregister;
  that = this;
  register = function (socketId, event) {
    var index;
    if (!that.clientRegistrations[event]) {
      that.clientRegistrations[event] = [];
    }
    index = that.clientRegistrations[event].indexOf(socketId);
    if (index === -1) {
      that.clientRegistrations[event].push(socketId);
      if (that.registrationListeners[event]) {
        that.registrationListeners[event].forEach(function (listener) {
          listener(that.clientRegistrations[event]);
        });
      }
    }
  };
  unregister = function (socketId, event) {
    var index;
    index = that.clientRegistrations[event].indexOf(socketId);
    if (index !== -1) {
      that.clientRegistrations[event].splice(index, 1);
      if (that.registrationListeners[event]) {
        that.registrationListeners[event].forEach(function (listener) {
          listener(that.clientRegistrations[event]);
        });
      }
    }
  };
  that.server = server;
  that.server.on('connection', function (socket) {
    that.sockets[socket.id] = socket;
    socket.on(that.options.registerEventName, function (event) {
      register(socket.id, event);
    });
    socket.on(that.options.unregisterEventName, function (event) {
      unregister(socket.id, event);
    });
    socket.on('disconnect', function () {
      var index, event;
      for (event in that.clientRegistrations) {
        unregister(socket.id, event);
      }
      delete that.sockets[socket.id];
      disconnectCallback && disconnectCallback();
    });
    connectCallback && connectCallback(socket);
  });
};

WsEventMgr.prototype.addListener = function (event, listener) {
  if (!this.registrationListeners[event]) {
    this.registrationListeners[event] = [];
  }
  this.registrationListeners[event].push(listener);
};

WsEventMgr.prototype.removeListener = function (event, listener) {
  var index;
  if (!this.registrationListeners[event]) {
    return false;
  }
  index = this.registrationListeners[event].indexOf(listener);
  if (index == -1) {
    return false;
  }
  this.registrationListeners[event].splice(index);
  return true;
};

WsEventMgr.prototype.on = function (event, callback) {
  this.server.on(event, callback);
};

WsEventMgr.prototype.emit = function (event, data) {
  var i, registeredSockets, socket;
  registeredSockets = this.clientRegistrations[event];
  if (!registeredSockets) return;
  for (i = 0; i < registeredSockets.length; i++) {
    socket = this.sockets[registeredSockets[i]];
    if (socket) {
      socket.emit(event, data);
    }
  }
};

WsEventMgr.prototype.hasClientRegistration = function (event) {
  return this.clientRegistrations[event] && this.clientRegistrations[event].length;
};

WsEventMgr.prototype.expressMiddleware = function () {
  var that = this;
  return function (req, res, next) {
    if ('GET' === req.method && that.options.clientScriptUrl === req.url) {
      res.charset = 'utf-8';
      res.sendfile(path.join(__dirname, 'wsem-client.js'));
    } else {
      next();
    }
  }
};

module.exports = WsEventMgr;