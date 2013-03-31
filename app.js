var path = require('path')
  , http = require('http')
  , express = require('express')
  , io = require('socket.io')
  , WsEventMgr = require('./lib/ws-event-mgr')
  , util = require('./lib/util')
  , baseDir, httpServer, ioServer, app, intervalId;

baseDir = __dirname;

app = express();

//app.set('env', 'development');
app.set('env', 'production');

app.configure('all', function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(baseDir, '/views'));
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({
    once: true,
    src: path.join(baseDir, '/less'),
    dest: path.join(baseDir, 'public', 'css'),
    prefix: '/css',
    compress: true,
    debug: 'development' === app.get('env')
  }));
  app.use(express.static(path.join(baseDir, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get('/ws-event-mgr.js', require('./lib/ws-event-mgr-middleware'));
app.get('/', function (req, res) {
  res.render('index');
});

httpServer = http.createServer(app);
httpServer.listen(app.get('port'), function () {
  console.log('Express server listening on port %s', app.get('port'));
});

ioServer = io.listen(httpServer, { log: 'development' === app.get('env') });

wsem = new WsEventMgr(ioServer);
wsem.start();

wsem.addListener('time', function () {
  if (wsem.hasClientRegistration('time')) {
    if (!intervalId) {
      console.log('starting time streaming');
      intervalId = setInterval(function () {
        var currentTime = util.dateFormat(new Date(), '%H:%M:%S');
        console.log('sending current time');
        wsem.emit('time', currentTime);
      }, 1000);
    }
  } else {
    console.log('stopping time streaming');
    clearInterval(intervalId);
    intervalId = null;
  }
});