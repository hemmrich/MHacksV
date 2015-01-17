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
        //detectFaces();

        /*filename = "/Users/Max/Desktop/GitHub/MHacksV/tmppic_" + imgCounter + ".png";
        //imgCounter = imgCounter + 1;

        fs.writeFile(filename, lastPng, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        }); */
    });



//Facial recognition
var processingImage = false;
var detectFaces = function() {
    if(!processingImage && lastPng) {
        processingImage = true;
        print("Processing new image");

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
                    filename = "/Users/Max/Desktop/GitHub/MHacksV/tmppic_" + imgCounter + ".png";
                    im.save(filename);
                    print("Saved image " + imgCounter);
                    imgCounter = imgCounter + 1;
                }

                processingImage = false;

            });
        });
    }
}

var faceProcessInterval = setInterval(detectFaces, 500);





















