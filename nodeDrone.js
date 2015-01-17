var arDrone = require('ar-drone');
var sleep = require('sleep');
var prompt = require('prompt');
var http = require('http');
var fs = require('fs');
var cv = require('opencv');

prompt.start();

var client  = arDrone.createClient();
client.disableEmergency();

function print(string) {
    process.stdout.write(string.toString());
    process.stdout.write("\n");
}


process.stdout.write("Enter command for AR Drone (t, l, h, or q): ");

process.stdin.on('data', function (chunk) {
    chunk = chunk.toString().trim();
    process.stdout.write("chunk = " + chunk + "\n");

    if(chunk === "t") {
        print("Taking off!");
        client.takeoff();
    }
    else if(chunk === "l") {
        print("Landing...");
        client.land();
    }
    else if(chunk == 'h') {
        print("Hovering");
        client.stop();
    }
    else if(chunk == 'q') {
        print("Quitting");
        client.land();
        process.exit();
    }
    process.stdout.write("Enter command for AR Drone (t, l, h, or q): ");
});

var pngStream = client.getPngStream();
var lastPng;

var imgCounter = 0;

pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
        lastPng = pngBuffer;

        filename = "/Users/Max/Desktop/GitHub/MHacksV/tmppic_" + imgCounter + ".png";
        //imgCounter = imgCounter + 1;

        fs.writeFile(filename, lastPng, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        }); 
});

