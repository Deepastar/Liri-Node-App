require("dotenv").config();
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var Request = require('request');
var fs = require("fs");


var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);
var twitterClient = new Twitter(keys.twitter);

if(process.argv.length < 3 || process.argv.length > 4){
    console.log("Invalid number of Parameters: " + process.argv.length);
    process.exit();
}

var commandTxt = "Command: " + process.argv.join(" ");
writeToLog(commandTxt);

runCommand(process.argv[2], process.argv[3]);


/**
 * Function gets the command line arguments and calls the appropriate functions to excute 
 */
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
        default: var errmsg = "Invalid Parameter: " + command + "\n";
        console.log(errmsg);
        writeToLog(errmsg);
        break;
    }
}

/**
 * Function to access Twitter account and get the latest tweets.
 */
function getTweets() {
    var params = { user_id: "Deepa689" };
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error && response.statusCode === 200) {
            writeToLog("--------------------------------------------")
            for (var i = 0; i < tweets.length; i++) {
                console.log(tweets[i].text);
                writeToLog(tweets[i].text);
            }
            writeToLog("--------------------------------------------")
        }
    });
}

/**
 * Function to get the movie that is being searched from the omdb.
 */
function getMovies(movieName) {
    if(!movieName || movieName === ""){
        movieName = "Mr. Nobody";
        console.log("If you haven't watched 'Mr. Nobody,' then you should: http://www.imdb.com/title/tt0485947/");
        console.log("It's on Netflix!");
        
    }
    var requestQueryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + keys.omdb.id;

    Request(requestQueryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var movieMsg = "Title: " + JSON.parse(body).Title + "\n";
            movieMsg = movieMsg + "Release Year: " + JSON.parse(body).Year + "\n";
            movieMsg = movieMsg + "Imdb Rating: " + JSON.parse(body).imdbRating + "\n";
            movieMsg = movieMsg + "Rotten Tomatoes Rating: " + JSON.parse(body).tomatoRating + "\n";
            movieMsg = movieMsg + "Country: " + JSON.parse(body).Country + "\n";
            movieMsg = movieMsg + "Language: " + JSON.parse(body).Language + "\n";
            movieMsg = movieMsg + "Actors: " + JSON.parse(body).Actors + "\n";
            movieMsg = movieMsg + "Plot: " + JSON.parse(body).Plot + "\n";

            writeToLog(movieMsg);
            console.log(movieMsg);
        }
    });
}

/**
 * Function to access the Spotify account and search for the given track.
 */
function getMusic(trackName) {
    if(!trackName || trackName === ""){
        trackName = "track:The+Sign";
    }
    spotify.search({ type: 'track', query: trackName, limit: 10 }, function (err, data) {

        if (err) {
            writeToLog("Error occured: " + err.message);
            return console.log('Error occurred: ' + err.message);
            
        }

        for (var i = 0; i < data.tracks.items.length; i++) {
            var albumData = data.tracks.items[i];

            console.log("Track Name: " + albumData.name);
            writeToLog("Track Name: " + albumData.name);
            console.log("Album Name: " + albumData.album.name);
            writeToLog("Album Name: " + albumData.album.name);

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

            writeToLog("Artist: " + artistName);
            writeToLog("Release Date: " + albumData.album.release_date);
            writeToLog("Duration: " + parseInt((albumData.duration_ms / 1000) / 60) + "m " + parseInt((albumData.duration_ms / 1000) % 60) + "s");
            writeToLog("Preview URL: " + albumData.preview_url);

            console.log("---------------------------------------------------");
            writeToLog("---------------------------------------------------");
        }
    });
}

/**
 * Function to read the random.txt and excute the command in it.
 */
function readFromFile() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(data);
        }
        var dataArr = data.split(",");
        runCommand(dataArr[0], dataArr[1]);
    });
}

function writeToLog(errmsg){
    errmsg = errmsg.concat("\n");
    fs.appendFile("log.txt", errmsg, function(err){
        if(err){
            console.log(err.message);
            throw err;
        }
    });
}
