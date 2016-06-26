var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/twitter_db';
// Use connect method to connect to the Server 

var findDocuments = function(db, name, callback) {
	var collection = db.collection(name);
	//var query = {created_at:{ $gte:"Wed Jun 15 00:00:00 +000 2016",$lt:"Wed Jun 15 23:59:00 +000 2016"}};
	var query = {coordinates:{$ne:null},limit:800}
	collection.find(query).toArray(function(err, docs) {
		if (err) {
			callback(err,{})
		}else{
			console.log("Found the following records");
			callback(null,docs);
		}
  	})
}

app.use(express.static('./public'));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

var parseTweets = function(docs){
	var locations = []
	for(index in docs){
		tweet = docs[index];
		if(tweet.coordinates){
			var location = {};
			location.lng = tweet.coordinates.coordinates[0];
			location.lat = tweet.coordinates.coordinates[1];
			locations.push(location);
		}
	}
	return locations;
}

app.get('/getTweets', function (req, res) {
	MongoClient.connect(url, function(err, db) {
  		console.log("Connected correctly to server");
  		findDocuments(db,"france_dataset",function(err,docs){
  			if(err){ 
  				res.json({});
  			}else{
  				console.log("Test tw france is done");
  				tweets = parseTweets(docs);
  				res.json(tweets);
  			}
  			db.close();
  		})
	});
});

var server = app.listen(4000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

