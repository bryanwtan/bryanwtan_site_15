var twil_api = require('./keys.json')
    , account_sid = twil_api.twilio.account_sid
    , auth_token = twil_api.twilio.auth_token
    , twilio = require('twilio')(account_sid, auth_token)
    , qs = require('querystring')
    , exports = module.exports = {};

// Twilio Credentials
exports.send_this_message = function(req) {
    console.log(req);
    twilio.messages.create({
        body: '.\n' + req,
        to: "+14846633783",
        from: "+14842001550",
    }, function(err, message) {
        if (!err) { console.log('text to', message.to, message.body); }
    });
};

exports.resp_to_sms = function(req, res){
    // respond with a TwiML XML document
    var body = '';
    req.on('data', function(data) {
        body += data;
        if (body.length > 1e6) { request.connection.destroy(); }
    });
    req.on('end', function() {
        var post = qs.parse(body);
        console.log('\n', post.From, ': ', post.Body);

        // render the TwiML document using "toString"
        res.writeHead(200, { 'Content-Type':'text/xml' });
        res.end();
    });
};
