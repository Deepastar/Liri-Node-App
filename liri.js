require("dotenv").config();
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var Request = require('request');
var fs = require("fs");


var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);
var twitterClient = new Twitter(keys.twitter);

runCommand(process.argv[2], process.argv[3]);

function runCommand(command, commandArg){
    switch (command) {
        case "my-tweets": getTweets();
            break;
        case "movie-this":
            var movieName = commandArg;
            getMovies(movieName);
            break;
        case "spotify-this-song": 
            var songName = commandArg;
            getMusic(songName);
            break;
        case "do-what-it-says": readFromFile();
            break;
    }
}


function getTweets() {
    var params = { user_id: "Deepa689" };
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error && response.statusCode === 200) {
            for (var i = 0; i < tweets.length; i++) {
                console.log(tweets[i].text);
            }
        }
    });
}

function getMovies(movieName) {
    if(!movieName || movieName === ""){
        movieName = "Mr. Nobody";
        console.log("If you haven't watched 'Mr. Nobody,' then you should: http://www.imdb.com/title/tt0485947/");
        console.log("It's on Netflix!");
        
    }
    var requestQueryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + keys.omdb.id;

    Request(requestQueryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("Imdb Rating: " + JSON.parse(body).imdbRating);
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).tomatoRating);
            console.log("Country: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Actors: " + JSON.parse(body).Actors);
            console.log("Plot: " + JSON.parse(body).Plot);
        }
    });
}

function getMusic(trackName) {
    if(!trackName || trackName === ""){
        trackName = "track:The+Sign";
    }
    spotify.search({ type: 'track', query: trackName, limit: 10 }, function (err, data) {

        if (err) {
            return console.log('Error occurred: ' + err);
        }

        for (var i = 0; i < data.tracks.items.length; i++) {
            var albumData = data.tracks.items[i];

            console.log("Track Name: " + albumData.name);
            console.log("Album Name: " + albumData.album.name);
            var artistName = "";
            for (var j = 0; j < albumData.artists.length; j++) {
                if(j != 0)
                    artistName = artistName.concat(", ");
                artistName = artistName.concat(albumData.artists[j].name);
            }
            console.log("Artist: " + artistName);
            console.log("Release Date: " + albumData.album.release_date);
            console.log("Duration: " + parseInt((albumData.duration_ms / 1000) / 60) + "m " + parseInt((albumData.duration_ms / 1000) % 60) + "s");
            console.log("Preview URL: " + albumData.preview_url);
            console.log("---------------------------------------------------");
        }
    });
}

function readFromFile() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(data);
        }
        var dataArr = data.split(",");
        runCommand(dataArr[0], dataArr[1]);
    });
}
