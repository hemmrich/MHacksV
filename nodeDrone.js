var arDrone = require('ar-drone');
var sleep = require('sleep');
//var prompt = require('prompt');
var http = require('http');
var fs = require('fs');
var cv = require('opencv');
var keypress = require('keypress');

//prompt.start();

var client  = arDrone.createClient();
client.disableEmergency();

function print(string) {
    process.stdout.write(string.toString());
    process.stdout.write("\n");
}

//makes react immediately to button press
//process.stdin.setRawMode(true);

keypress(process.stdin);

process.stdout.write("Hello\n");

//listening for key presses...
process.stdin.on('keypress', function (ch, key) {
if(key){
  //print(key.name);
  switch(key.name){
    case 't': 
      print("Taking off!");
      client.takeoff();
      process.stdin.setRawMode(true);
      break;
    case 'space':
      print("Hovering");
      client.stop();
      break;
    case 'm':
      print("Landing...");
      client.stop();
      client.land();
      process.stdin.setRawMode(false);
      break;
    case 'w':
      print("Up");
      client.up(.3);
      break;
    case 's':
      print("Down");
      client.down(.3);
      break;
    case 'a':
      print("Rotate Left");
      client.counterClockwise(.3);
      break;
    case 'd':
      print("Rotate Right");
      client.clockwise(.3);
      break;
    case 'i':
      print("Forward");
      client.front(.3);
      break;
    case 'k':
      print("Backward");
      client.back(.3);
      break;
    case 'j':
      print("left");
      client.left(.3);
      break;
    case 'l':
      print("Right");
      client.right(.3);
      break;
    case 'q':
      print("quitting");
      client.stop();
      client.land(function(){ process.exit() });
      break;
  }
}
});

/*var pngStream = client.getPngStream();
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
});*/

