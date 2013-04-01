WsEventMgr = function (socket, options) {
  this.socket = socket;
  this.options = options || {};
  this.options.registerEventName = this.options.registerEventName || 'wsem:register';
  this.options.unregisterEventName = this.options.unregisterEventName || 'wsem:unregister';
};

WsEventMgr.prototype.emit = function (args) {
  var argumentsArray = Array.prototype.slice.apply(arguments);
  this.socket.emit.apply(this.socket, argumentsArray);
};

WsEventMgr.prototype.on = function(event, callback) {
  this.emit(this.options.registerEventName, event);
  this.socket.on(event, callback);
};

WsEventMgr.prototype.end = function(event, callback) {
  this.emit(this.options.unregisterEventName, event);
  this.socket.removeListener(event, callback);
};
