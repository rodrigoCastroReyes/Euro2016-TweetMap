var express = require('express');
var app = express();

var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/twitter_db';
mongoose.connect(url);
var Schema = mongoose.Schema;
var tweetSchema = new Schema({
	text: String
},{ collection : 'france_dataset' });
var TwSchema = mongoose.model('Tweet', tweetSchema);

// Use connect method to connect to the Server 

app.use(express.static('./public'));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

var parseTweets = function(docs){
	var locations = []
	for(index in docs){
		tweet = docs[index].toJSON()
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
	var query = TwSchema.find({coordinates:{$ne:null}});
  	query.exec(function(err, docs) {
  		if (err) throw err;
  		console.log("Test tw france is done");
	  	tweets = parseTweets(docs);
  		res.json(tweets);
	});
});

var server = app.listen(4000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Heatmap Application listening at http://%s:%s', host, port);
});

