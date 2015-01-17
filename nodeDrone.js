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

function deleteOldPictures() {
    var dir = directory + "/dronepics/";
    var counter = 0;
    var file = dir + "tmppic_" + counter + ".png";

    try {
        while(true) {
            file = dir + "tmppic_" + counter + ".png";
            print("File " + file);
            fs.unlinkSync(file, function(err) {
                if(err)
                    print(err);
                else
                    print("Successfully deleted: " + file);
                counter++;
            });
        }
    } catch (err) {
        //print("Couldn't delete " + file);
        //print(err);
    }
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
            process.exit();
        }

    });    
}

//clean up pictures from previous run
deleteOldPictures();

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
        client.land();
        process.exit();
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
        print("Processing new image");


        /*cv.readImage("jason.png", function(err, im) {
            if(err) 
                throw err;
            if(im.width() < 1 || im.height < 1)
                throw new Error("Incorrect image size");

            im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
                if(err)
                    throw err;

                for(var i = 0; i < faces.length; i++) {
                    var face = faces[i];
                    im.ellipse(face.x + face.width / 2, face.y + face.height / 2, face.width / 2, face.height / 2);
                    filename = directory + "/dronepics/tmppic_" + imgCounter + ".png";
                    im.save(filename);
                    print("Saved image " + imgCounter);
                    imgCounter = imgCounter + 1;
                }
            });
        });*/




        cv.readImage(lastPng, function(err, im) {
            var opts = {};
            im.detectObject(cv.FACE_CASCADE, opts, function(err, faces) {
                var face, biggestFace;

                print("Found " + faces.length + " faces");

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

var faceProcessInterval = setInterval(detectFaces, 1000);





















