WsEventMgr = function (socket) {
  this.socket = socket;
};

WsEventMgr.prototype.emit = function (args) {
  var argumentsArray = Array.prototype.slice.apply(arguments);
  this.socket.emit.apply(this.socket, argumentsArray);
};

WsEventMgr.prototype.on = function(event, callback) {
  this.emit('register', event);
  this.socket.on(event, callback);
};

WsEventMgr.prototype.end = function(event, callback) {
  this.emit('unregister', event);
  this.socket.removeListener(event, callback);
};
