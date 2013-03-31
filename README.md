## What's wsem?

  Web Socket Event Manager is a simple module to manage events between web socket clients with nodejs.

  Its goal is to make web sockets apps clients synchronization easier.

  It is based on expressjs and socket.io.

## Features

TODO

## Usage

  On the server side (/app.js), simply code a basic web sockets app with express and socket.io :

    var express = require('express')
       , io = require('socket.io')
       , WsEventMgr = require('wsem')
       , httpServer, ioServer, app, wsem;

    app = express();
    ...
    wsem = new WsEventMgr();
    /*
       options = {
         registerEventName: 'register',     // event name to use to register a wsem event
         unregisterEventName: 'unregister', // event name to use to unregister a wsem event
         clientScriptUrl: '/wsem.js'        // wsem client side script location
       };
       new WsEventMgr(options)
    */
    ...
    app.configure('all', function () {
      ...
      app.use(wsem.expressMiddleware()); // Middleware to serve the client side wsem script
      ...
    }
    ...
    httpServer = http.createServer(app);
    // Http server creation
    httpServer = http.createServer(app);
    // Http server start
    httpServer.listen(3000);

    // Web socket server start
    ioServer = io.listen(httpServer);

    // Wsem start
    wsem.start(ioServer, function (socket) {
      // When a 'todo' is received from a client, we send it to all clients registered for that wsem event
      socket.on('todo', function (todo) {
        verbose && console.log('new todo :', todo);
        wsem.emit('todo', todo);
      });
    });

  On the client side (/static/scripts/app.js) :

    var socket, wsem;

    function addTodo(todo) {
      // Update your page with todo data, using your favourite framework (angular, backbone, jquery, ...)
    }

    // Web socket connect
    socket = io.connect(window.location.origin);
    // Wsem creation
    wsem = new WsEventMgr(socket);
    // Todo event registration
    wsem.on('todo', addTodo);
    // We send a todo to server
    wsem.emit('todo', 'buy a bottle of milk');
    ...
    // Stop event registration
    wsem.end('todo', addTodo);
    ...

## Demo

  - [wsem-demo sources](https://github.com/openhoat/wsem-demo)
  - [live site](http://wsem-openhoat.rhcloud.com/)

Enjoy !
