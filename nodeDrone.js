var arDrone = require('ar-drone');
var sleep = require('sleep');
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

function executeFacialRecognition(filename, face_centerX, face_centerY) {

    var cmd = path.join(__dirname, "faceRecognizer");
    var args = [filename, face_centerX, face_centerY];
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
            //client.stop();
            //client.land( function() { process.exit() });
        }
    });    
}

// Start getting user input to control drone
var client  = arDrone.createClient();
client.disableEmergency();

var flying = false;

//Allow user to control drone's flight
process.stdout.write("Enter command for AR Drone (t, l, h, or q): ");
process.stdin.on('data', function (chunk) {
    chunk = chunk.toString().trim();
    process.stdout.write("chunk = " + chunk + "\n");

    if(chunk === "t") {
        print("Taking off!");
        client.takeoff(function() { flying = true; });
    }
    else if(chunk === "l") {
        print("Landing...");
        client.land(function() { flying = false; });
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
var tmpCounter = 0;
var location = "/Users/Max/Desktop/GitHub/MHacksV/tmp/";

pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
        lastPng = pngBuffer;
    });


//Facial recognition
var processingImage = false;
var prevCenterX = -1, prevCenterY = -1;
var counter = 0;
var detectFaces = function() {
    if(!processingImage && lastPng) {
        processingImage = true;

        cv.readImage(lastPng, function(err, im) {

            var opts = {scale: 1.1, neighbors: 2};
            var cascade = cv.FACE_CASCADE;
            cascade = "/Users/Max/Desktop/GitHub/MHacksV/node_modules/opencv/data/haarcascade_frontalface_alt_tree.xml";
            //cascade = "/Users/Max/Downloads/HS.xml";
            im.detectObject(cascade, opts, function(err, bodies) {
                for(var i = 0; i < bodies.length; i++) {
                    //im.ellipse(bodies[i].x + bodies[i].width * 0.5, bodies[i].y + bodies[i].height * 0.5, bodies[i].width / 2, bodies[i].height / 2);
                }

                cascade2 = "/Users/Max/Desktop/GitHub/MHacksV/node_modules/opencv/data/haarcascade_frontalface_default.xml";
                im.detectObject(cascade2, opts, function(err, faces) {
                    var face, biggestFace;

                    for(var i = 0; i < faces.length; i++) {
                        face = faces[i];
                        if(!biggestFace || biggestFace.width < face.width)
                            biggestFace = face;
                    }


                    if(biggestFace) {

                        face = biggestFace;
                        print(face.x + face.y + face.height + face.width + im.height() + im.width());

                        face.centerX = face.x + face.width * 0.5;
                        face.centerY = face.y + face.height * 0.5;


                        if(prevCenterY == -1 && prevCenterX == -1) {
                            prevCenterX = face.centerX;
                            prevCenterY = face.centerY;
                        } else {
                            if(Math.abs(prevCenterX - face.centerX) < 125 &&
                               Math.abs(prevCenterY - face.centerY) < 75  && 
                               flying == true) {
                                counter++;

                                if(counter >= 3) {
                                    im.ellipse(face.centerX, face.centerY, face.width / 2, face.height / 2);

                                    filename = directory + "/dronepics/tmppic_" + imgCounter + ".png";
                                    im.save(filename);
                                    print("SAVED AN IMAGE!!!!!");
                                    imgCounter++;

                                    executeFacialRecognition(filename, face.centerX, face.centerY);
                                }                                
                            }
                            else
                                counter = 0;

                            prevCenterX = face.centerX;
                            prevCenterY = face.centerY;
                        }




                        /*im.ellipse(face.centerX, face.centerY, face.width / 2, face.height / 2);
                        filename = directory + "/dronepics/tmppic_" + imgCounter + ".png";
                        im.save(filename);
                        print("Saved image " + filename);
                        imgCounter++;

                        executeFacialRecognition(filename, face.centerX, face.centerY);*/
                    }

                    processingImage = false;
                });             
            });
        });
    }
}

var faceProcessInterval = setInterval(detectFaces, 250);
print("Starting face detection...");

















