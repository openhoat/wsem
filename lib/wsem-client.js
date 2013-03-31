WsEventMgr = function (socket) {
  this.socket = socket;
};

WsEventMgr.prototype.emit = function (args) {
  var argumentsArray = Array.prototype.slice.apply(arguments);
  this.socket.emit.apply(this.socket, argumentsArray);
};

WsEventMgr.prototype.on = function(name, callback) {
  this.emit('register', name);
  this.socket.on(name, callback);
};

WsEventMgr.prototype.end = function(name, callback) {
  this.emit('unregister', name);
  this.socket.removeListener(name, callback);
};
