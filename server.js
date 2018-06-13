var express = require("express"),
    request = require('request'),
    util = require('util'),
    fs = require("fs"),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
    path = __dirname + "/LogFile.txt",
    crypto = require('crypto'),
    bodyParser = require('body-parser'),
    request = require('request');
var https = require('https');
https.createServer(app).listen(4433);
server.listen(8081);
var rawBodySaver = function (req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Challenger Notification service is UP........\n');
});
app.on('error', function (err) {
    fs.writeFile(path, error, function (err) {
        if (err) return console.log(err);
        console.log(error + ' > LogFile.txt');
    });
    return res.json({ status: '400', message: "message :error" });
});
app.post('/subscribe', function(req, res) {
var requestBody=JSON.parse(req.rawBody);
//WriteLog(util.inspect(req, { showHidden: true, depth: null }));
    if (requestBody.Type === 'SubscriptionConfirmation') {
        https.get(requestBody.SubscribeURL, function (res) {
          // You have confirmed your endpoint subscription
        });
    }
});
app.post('/ChallengerNotification',function(req,res){
 var requestBody=JSON.parse(req.rawBody);
    //WriteLog(req.rawBody);
   if (requestBody.Type === 'SubscriptionConfirmation') {
      //WriteLog(requestBody.SubscribeURL);
	  https.get(requestBody.SubscribeURL, function (res) {
            // You have confirmed your endpoint subscription
		    //WriteLog("confirmed");
		    res.on("data", function(chunk) {
            //WriteLog("BODY: " + chunk);
            });
        });	
    }
	
	if(requestBody.Type === 'Notification'){
	 //WriteLog(requestBody.Type+""+requestBody.Message);
	 var messageBody=JSON.parse(requestBody.Message);
	 //WriteLog(messageBody.userId);
     io.sockets.emit(messageBody.userId.toLowerCase(), messageBody.message);
     //WriteLog('server push notification at ' + new Date());
	 res.json({success : "Delivered Successfully", status : 200});
	}
	
	//WriteLog(requestBody.Type);	
 
});

app.post('/api/PushNotifiication', function (req, res) {
    app.on('error', function (error) {
        //WriteLog(error);
        return res.json({ status: '400', message: "message :error" });
    });
    io.sockets.emit(req.body.Message.userId, req.body.Message.message);
    if (io.sockets.connected) {
        //WriteLog('server push notification at '+new Date());
        //res.json({ status: '200', message: "message " + req.body.Message.message + " recieved at " + Date() });
    }
    else {
        WriteLog('server not able to push notification at ' + new Date());
        res.json({ status: '404', message: "not connected" });}
   
});
// io.sockets.on("connection", function (socket) {
//     var data = "Server is connected with clinet id :" + socket.id;
//     WriteLog(data);
//     socket.on('connect_error', function () {
//         WriteLog('Connection Failed at '+new Date()+'with clinet id '+socket.id);
//             });
//     socket.on('PushMessageResponse', function (msg) {
//             });
//     socket.on('disconnect', function () {
//         WriteLog('clint id '+socket.id+' disconnected at '+new Date());
//           });
//     socket.on('reconnecting', function (nextRetry) {
//         WriteLog('trying to reconnect at '+new Date()+' with client id '+socket.id);
//           });
//     socket.on('reconnect_failed', function () {
//         WriteLog('Reconnect failed at '+new Date()+' with client id '+socket.id);
//            });
//     socket.on('connect_failed', function () {
//         WriteLog('Connection Failed at '+new Date()+' with client id '+socket.id);
//           });
//    });


// function WriteLog(data) {
//     if (fs.exists(path)) {
//         fs.writeFile(path, data, function (err) {
//             if (err) return console.log(err);
//             console.log(data + ' > LogFile.txt');
//         });
//     }
//     else {
//         fs.appendFile(path, "\r\n" + data, function (err) {
//             if (err) return console.log(err);
//             console.log(data + ' > LogFile.txt');
//         });
//     }

// }


