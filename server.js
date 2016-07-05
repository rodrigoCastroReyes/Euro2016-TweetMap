var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var url = 'mongodb://localhost:27017/twitter_db';
mongoose.connect(url);
var Schema = mongoose.Schema;
var tweetSchema = new Schema({
	text: String
},{ collection : 'france_timelines_euro2016' });
tweetSchema.plugin(mongoosePaginate);

var TwModel = mongoose.model('Tweet', tweetSchema);
// Use connect method to connect to the Server 
app.use(express.static('./public'));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

app.get('/getStades',function(req,res){
	var content = jsonfile.readFileSync('./public/stades.json');
	console.log(content)
	res.json(content);
});


var parseTweets = function(docs){
	var locations = []
	for(index in docs){
		tweet = docs[index] //.toJSON()
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
	/*var query = TwSchema.find({
		'created_at': { 
			'$lt' : 'Thu Jun 16 23:59:00 +0000 2016', 
			'$gte' : 'Thu Jun 16 20:00:00 +0000 2016'
		},
		'coordinates':{
			$ne:null
		}
	})*/
	/*var query = TwSchema.find({
		'created_at': { 
			'$lt' : 'Wed Jun 15 17:00:00 +0000 2016', 
			'$gte' : 'Wed Jun 15 15:00:00 +0000 2016'
		},
		'coordinates':{
			$ne:null
		}
	})*/
	var query = TwModel.find({
		'coordinates':{
			$ne:null
		}
	}).limit(10000);
  	query.exec(function(err, docs) {
  		if (err) throw err;
  		console.log("Test tw france is done");
  		//console.log(docs);
	  	tweets = parseTweets(docs);
  		res.json(tweets);
	});
});

app.get('/getTweetsPerPage/:page', function (req, res) {
	var page = req.params.page;
	console.log(page);
	var options = {
    	lean: true,
    	page: page,
    	limit: 2000
	};
	TwModel.paginate({ 'coordinates': { $ne: null } },options)
	.then(function(result) {
		var newpage;
		var docs = result.docs;
		tweets = parseTweets(docs);
		if (tweets.length > 0){
			newpage = parseInt(result.page) + 1;
		}else{
			newpage = -1;
		}
		res.json({ 'tweets': tweets , 'page': newpage });
	});
});

var server = app.listen(4050, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Heatmap Application listening at http://%s:%s', host, port);
});

