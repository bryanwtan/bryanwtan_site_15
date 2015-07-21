// npm modules installed
var server = require('http').createServer(handler)
    , static_serve = require('node-static')
    , io = require('socket.io')(server)
    , twiliojs = require('./twilio.js')
    // , githubjs = require('./github.js')
    , facebookjs = require('./facebook.js')
    // static file request handling
    , file = new static_serve.Server('./public');

const port = process.env.PORT || 3000;
server.listen(port, function(req, res){
    console.log('\nListening at PORT:', port);
});

function handler(req, res) {
    if (req.method == 'POST' && req.url === '/twiml'){
        twiliojs.resp_to_sms(req, res);
    } else {
        req.on('end', function () { // all in public folder
            file.serve(req, res);
            console.log('serving', req.url);
        }).resume();
    }
}

//-------------------------------------------------------------------------
// socket request handling
io.on('connection', function(socket) {
    socket.emit('initial', 'io: connected');
    // socket.emit('favorites', fav);

    socket.on('scroll_hit_bottom', function(data) {
        twiliojs.send_this_message( data );
    });

});
