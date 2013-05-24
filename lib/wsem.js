var path = require('path')
  , WsEventMgr;

WsEventMgr = function (options) {
  var that = this;

  that.options = options || {};
  that.options.registerEventName = that.options.registerEventName || 'wsem:register';
  that.options.unregisterEventName = that.options.unregisterEventName || 'wsem:unregister';
  that.options.clientScriptUrl = that.options.clientScriptUrl || '/wsem.js';
  that.sockets = {};
  that.clientRegistrations = [];
  that.registrationListeners = [];

  that.start = function (server, connectCallback, disconnectCallback) {
    var register, unregister;
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
        var event;
        for (event in that.clientRegistrations) {
          unregister(socket.id, event);
        }
        delete that.sockets[socket.id];
        disconnectCallback && disconnectCallback();
      });
      connectCallback && connectCallback(socket);
    });
  };

  that.addListener = function (event, listener) {
    if (!that.registrationListeners[event]) {
      that.registrationListeners[event] = [];
    }
    that.registrationListeners[event].push(listener);
  };

  that.removeListener = function (event, listener) {
    var index;
    if (!that.registrationListeners[event]) {
      return false;
    }
    index = that.registrationListeners[event].indexOf(listener);
    if (index == -1) {
      return false;
    }
    that.registrationListeners[event].splice(index);
    return true;
  };

  that.on = function (event, callback) {
    that.server.on(event, callback);
  };

  that.emit = function (event, data) {
    var i, registeredSockets, socket;
    registeredSockets = that.clientRegistrations[event];
    if (!registeredSockets) return;
    for (i = 0; i < registeredSockets.length; i++) {
      socket = that.sockets[registeredSockets[i]];
      if (socket) {
        socket.emit(event, data);
      }
    }
  };

  that.hasClientRegistration = function (event) {
    return that.clientRegistrations[event] && that.clientRegistrations[event].length;
  };

  that.expressMiddleware = function () {
    return function (req, res, next) {
      if ('GET' === req.method && that.options.clientScriptUrl === req.url) {
        res.charset = 'utf-8';
        res.sendfile(path.join(__dirname, 'wsem-client.js'));
      } else {
        next();
      }
    }
  };
};

WsEventMgr.Client = function () {
  return require('./wsem-client').WsEventMgr;
};

module.exports = WsEventMgr;