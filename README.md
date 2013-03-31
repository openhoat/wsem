## What's wsem?

  Web Socket Event Manager is a simple module to manage events between web socket clients with nodejs.

  Its goal is to make web sockets apps clients synchronization easier.

  It is based on expressjs and socket.io.

## Usage

1- Create and start http and web sockets servers as usual :

  On server side : /app.js

    var http = require('http')
      , express = require('express')
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
    // Create http server and start
    httpServer = http.createServer(app);
    httpServer.listen(3000);

    // Web socket server start
    ioServer = io.listen(httpServer);
    ...

2- Then start wsem and play with events !

    // Wsem start
    wsem.start(ioServer);
    // Hello stream example : send a 'hello' event with 'world' data every 3 seconds to registered clients
    setInterval(function(){
      wsem.emit('hello', 'world!');
    }, 3000);

  On client side : /static/scripts/app.js

    var socket, wsem;
    // Web socket connect
    socket = io.connect(window.location.origin);
    // Wsem creation
    wsem = new WsEventMgr(socket);
    // 'hello' event registration
    wsem.on('hello', function (data) {
      console.log('data :', data);
    });

## Shared todo list example :

  On the server side : /app.js

    // Wsem start
    wsem.start(ioServer, function (socket) {
      // When a 'todo' is received from a client, we send it to all clients registered for that wsem event
      // The registration process is managed in wsem, so that the code remains simple
      socket.on('todo', function (todo) {
        wsem.emit('todo', todo);
      });
    });

  On the client side : /static/scripts/app.js

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
    // We send a todo to the server
    wsem.emit('todo', 'buy a bottle of milk');
    ...
    // Stop event registration
    wsem.end('todo', addTodo);
    ...

## Api doc

- WsEventMgr([options]) :
    Constructor with optionnal parameters
    - options :
        - registerEventName : name of the 'register' web socket event (default : 'register')
        - unregisterEventName : name of the 'unregister' web socket event (default : 'unregister')
        - clientScriptUrl : url of the client side script to declare in html page (default : '/wsem.js')


- WsEventMgr.start(server, [connectCallback], [disconnectCallback]) :
    Start the wsem middleware instance
    - server : socket.io server
    - connectCallback : function to call when a new socket is created
    - disconnectCallback : function to call when a socket is disconnected


- WsEventMgr.addListener(event, listener) :
    Add a listener for the specified event name.
    - event : event name
    - listener : callback function
        - params : client registrations list for the specified event


- WsEventMgr.removeListener(event, listener) :
    Remove a listener for the specified event name, with same parameters as addListener.


- WsEventMgr.on(event, callback) :
    Register a callback for event listening.
        - event : event name
        - callback : function to call with data


- WsEventMgr.emit(event, data) :
    Send an event to registered clients
        - event : event name
        - data : any object to send


- WsEventMgr.hasClientRegistration(event) :
    Returns true if at least one client is registered for this event, else false.


- WsEventMgr.expressMiddleware :
    Function to use with Expressjs to route the client side wsem script


## Demo

  - [wsem-demo sources](https://github.com/openhoat/wsem-demo)
  - [live site](http://wsem-openhoat.rhcloud.com/)

Enjoy !
