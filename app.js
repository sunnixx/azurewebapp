var port = process.env.PORT || 80;
var FBAUTH = "kw972AVYMSZuDOafUSGV9BhtzojoBcFfh31hw4g4";
var FBPATH = "https://simpledatastore.firebaseio.com/";
/////////
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();


var root = new Firebase(FBPATH);
root.authWithCustomToken(FBAUTH,function (error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
  }
});


app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

    console.log("IP: "+ip + "\tPath: "+req.originalUrl);
    
    next();
});


app.get("/", function(req,res,next){
	//console.log("/");
	res.send({
        status: "200",
        msg: "OK",
        timestamp: new Date().getTime(),
        description:"This is a simple data store. Stores any JSON based data on your chosen path.",
        examples:"Visit /examples"
    });
});

app.get("/examples",function(req,res){
	res.sendfile(__dirname + '/examples.html');
});

app.get("/*", getData);

function getData(req,res){
	var path = req.params[0];

	if (path.indexOf('.')!=-1){ //dots are not allowed in paths
		res.send({err:"path contains invalid character(s)."});
		
	}
	else{
		console.log("fbpath",FBPATH + path);
		var FBpath = new Firebase(FBPATH + path);
		FBpath.once("value",function(snapshot){
			if (snapshot.val()) 
				res.send(snapshot.val());
			else
				res.send({});

		})
	}	
}

app.post("/*",jsonParser,saveData);

function saveData(req,res){
	var path = req.params[0];
	console.log(path,req.body);
	if (path.indexOf('.')!=-1){ //dots are not allowed in paths
		res.send({err:"path contains invalid character(s)."});
	}
	else{
		res.send(req.body);
		var FBpath = new Firebase(FBPATH + path);
		FBpath.set(req.body); 
	}
	
}

var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);

});