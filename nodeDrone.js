var arDrone = require('ar-drone');
var sleep = require('sleep');
var prompt = require('prompt');
var http = require('http');
var fs = require('fs');
var cv = require('opencv');
var child = require('child_process');
var path = require('path');

var directory = "/Users/Max/Desktop/GitHub/MHacksV"; //get this programmatically later
var result = "";


function print(string) {
    process.stdout.write(string.toString());
    process.stdout.write("\n");
}

function executeFacialRecognition(filename) {

    var cmd = path.join(__dirname, "faceRecognizer");
    var args = [filename];
    var tracker = child.spawn(cmd, args);

    tracker.stdout.setEncoding('utf8');
    tracker.stderr.setEncoding('utf8');
    tracker.stdout.on('data', function(data) {
        result += data.toString();
    });
    tracker.stderr.on('data', function(data) {
        result += data.toString();
    });
    tracker.on('close', function(code) {
        print(result);

        if(result.indexOf("FOUND!") > -1) {
            print("FOUND FACE!!!!!");
            client.stop();
            client.land( function() { process.exit() });
        }

    });    
}

// Start getting user input to control drone
prompt.start();

var client  = arDrone.createClient();
client.disableEmergency();

//Allow user to control drone's flight
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
        client.land( function() { process.exit() });
        client.land( function() { process.exit() });
        client.land( function() { process.exit() });
    }
    else if(chunk == "left") {
        print("Left");
        client.left(0.3);
    }
    else if(chunk == "right") {
        print("Right");
        client.right(0.3);
    }
    else if(chunk == "rotl") {
        print("Rotate left");
        client.counterClockwise(0.5);
    }
    else if(chunk == "rotr") {
        print("Rotate right");
        client.clockwise(0.5);
    }
    else if(chunk == "forward") {
        print("Forward");
        client.front(0.3);
    }
    else if(chunk == "backward") {
        print("Backward");
        client.back(0.3);
    }
    else if(chunk == "up") {
        print("Up");
        client.up(0.3);
    }
    else if(chunk == "down") {
        print("Down");
        client.down(0.3);
    }
    process.stdout.write("Enter command for AR Drone (t, l, h, or q): ");
});


//Save images from AR Drone's front facing camera
var pngStream = client.getPngStream();
var lastPng;
var imgCounter = 0;

pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
        lastPng = pngBuffer;
    });


//Facial recognition
var processingImage = false;
var detectFaces = function() {
    if(!processingImage && lastPng) {
        processingImage = true;

        cv.readImage(lastPng, function(err, im) {

            var opts = {scale: 2};
            im.detectObject(cv.FACE_CASCADE, opts, function(err, faces) {
                var face, biggestFace;

                //print("Found " + faces.length + " faces");

                for(var i = 0; i < faces.length; i++) {
                    face = faces[i];
                    if(!biggestFace || biggestFace.width < face.width)
                        biggestFace = face;
                }

                if(biggestFace) {
                    face = biggestFace;

                    //var window = new cv.NamedWindow("Preview", "400x400");
                    //window.show(face);

                    print(face.x + face.y + face.height + face.width + im.height() + im.width());

                    face.centerX = face.x + face.width * 0.5;
                    face.centerY = face.y + face.height * 0.5;

                    var centerX = im.width() * 0.5;
                    var centerY = im.width() * 0.5;

                    im.ellipse(face.centerX, face.centerY, face.width / 2, face.height / 2);
                    filename = directory + "/dronepics/tmppic_" + imgCounter + ".png";
                    im.save(filename);
                    print("Saved image " + filename);
                    imgCounter++;

                    executeFacialRecognition(filename);
                }

                processingImage = false;

            });
        });
    }
}

var faceProcessInterval = setInterval(detectFaces, 1500);





















