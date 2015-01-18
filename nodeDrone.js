var arDrone = require('ar-drone');
var sleep = require('sleep');
var http = require('http');
var fs = require('fs');
var cv = require('opencv');
var child = require('child_process');
var path = require('path');

var directory = "/Users/Max/Desktop/GitHub/MHacksV"; //get this programmatically later
var result = "";
var lastPng;
var prevCenterX = -1, prevCenterY = -1;
var faceCentered = false;


function print(string) {
    process.stdout.write(string.toString());
    process.stdout.write("\n");
}

//function executeFacialRecognition(filename, face_centerX, face_centerY) {
function executeFacialRecognition(filename, facex, facewidth, facey, faceheight) {

    var cmd = path.join(__dirname, "faceRecognizer");
    var args = [filename, facex, facewidth, facey, faceheight];
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

//FLAGS
var flying = false;
var setHeight = false;
var viewLog = false;
var startRotate = false;
var stopRotate = false;
var findPerson = false;
var targetPerson = false;

var desiredHeight = 1.6;

function takingOff() {
    print("taking off!");
    client.takeoff(function() {
        setHeight = true;
        flying = true;
    });
}

function foundFace() {
    return true;
}

function getFaceLocation() {
    if(lastPng && prevCenterX != -1 && prevCenterY != -1) {
        faceCentered = false;

        var imgWidth = 640;
        var imgHeight = 360;

        int colSection = -1;
        int rowSection = -1;

        //left column
        if(prevCenterX >= 0 && prevCenterX < 210) {
            colSection = 0;
        }
        //middle col
        else if(prevCenterX >= 210 && prevCenterX < 430) {
            colSection = 1;
        }
        //right col
        else if(prevCenterX >= 430 && prevCenterX < imgWidth) {
            colSection = 2;
        }

        //top row
        if(prevCenterY >= 0 && prevCenterY < 120) {
            rowSection = 0;
        }
        //middle row
        else if(prevCenterY >= 120 && prevCenterY < 240) {
            rowSection = 1;
        }
        //bottom row
        else if(prevCenterY >= 240 && prevCenterY < 360) {
            rowSection = 2;
        }


        if(rowSection == 0 && colSection == 0) return 1;
        if(rowSection == 0 && colSection == 1) return 2;
        if(rowSection == 0 && colSection == 2) return 3;
        if(rowSection == 1 && colSection == 0) return 8;
        if(rowSection == 1 && colSection == 1)  {
            faceCentered = true;
            return 9;
        }
        if(rowSection == 1 && colSection == 2) return 4;
        if(rowSection == 2 && colSection == 0) return 7;
        if(rowSection == 2 && colSection == 1) return 6;
        if(rowSection == 2 && colSection == 2) return 5;
    }
    faceCentered = true;
    return 9;
}

function faceInCenter() {
    return faceCentered;
}

//Allow user to control drone's flight
process.stdout.write("Enter command for AR Drone (t, l, h, or q): ");
process.stdin.on('data', function (chunk) {
    chunk = chunk.toString().trim();
    process.stdout.write("chunk = " + chunk + "\n");

    if(chunk === "t") {
        print("Taking off!");
        //client.takeoff(function() { flying = true; });
        takingOff();
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
    else if(chunk == "log") {
        print("Toggling log");
        if(viewLog) viewLog = false;
        else viewLog = true;
    }
    else if(chunk == "height") {
      print("Adjusting height");
      if(setHeight) setHeight = false;
      else setHeight = true;
    }
    else if(chunk == "scan") {
      print("Scanning for Fucking Criminals...");
      startRotate = true;
    }
    else if(chunk == "find") {
      print("Finding Fucking Criminals...");
      findPerson = true;
      takeOff();
    }
    process.stdout.write("Enter command for AR Drone (t, l, h, or q): ");
});


client.on('navdata', function(data){
  if(viewLog) {
    if(data.demo){
      console.log(data.demo.rotation);
      console.log('frontBackDegrees: ' + data.demo.frontBackDegrees);
      console.log('leftRightDegrees: ' + data.demo.leftRightDegrees);
      console.log('clockwiseDegrees: ' + data.demo.clockwiseDegrees);
    }
    //console.log(data);
  }

  //Hovering at desired height
  if(setHeight){
    if(data.demo){
      var currentHeight = data.demo.altitude;
      if(currentHeight < desiredHeight - 0.05){
        print("Going Up: " + currentHeight);
        client.up(.2);
      }else if(currentHeight > desiredHeight + 0.05){
        print("Going Down: " + currentHeight);
        client.down(.2);
      }else{
        print("Reached Desired Height");
        setHeight = false;
        client.stop();
        if(findPerson) startRotate = true;
      }
    }
  }

  if(startRotate){
    client.clockwise(0.2);
    if(foundFace() && findPerson){
      client.stop();
      startRotate = false;
      targetPerson = true;
    }
    if(stopRotate){
      client.stop();
      startRotate = false;
      stopRotate = false;
    }
  }

  if(targetPerson){
    if(faceInCenter()){
      client.stop();
    }else{
      switch(getFaceLocation()){
        case 1:
          client.stop();
          print("1");
          client.counterClockwise(.1);
          client.up(.2);
          sleep.sleep(500);
          break;
        case 2:
          client.stop();
          print("2");
          client.up(.2);
          sleep.sleep(500);
          break;
        case 3:
          client.stop();
          print("3");
          client.clockwise(.1);
          client.up(.2);
          sleep.sleep(500);
          break;
        case 4:
          client.stop();
          print("4");
          client.clockwise(.1);
          sleep.sleep(500);
          break;
        case 5:
          client.stop();
          print("5");
          client.down(.2);
          client.clockwise(.1);
          sleep.sleep(500);
          break;
        case 6:
          client.stop();
          print("6");
          client.down(.2);
          sleep.sleep(500);
          break;
        case 7:
          client.stop();
          print("7");
          client.counterClockwise(.1);
          client.down(.2);
          sleep.sleep(500);
          break;
        case 8:
          client.stop();
          print("8");
          client.counterClockwise(.1);
          sleep.sleep(500);
          break;
        case 9:
          print("9");
          client.stop();
          break;
      }
    }
  }
});


//Save images from AR Drone's front facing camera
var pngStream = client.getPngStream();
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
                               Math.abs(prevCenterY - face.centerY) < 75) { // &&) { 
                               //flying == true) {
                                counter++;

                                if(counter >= 3) {
                                    im.ellipse(face.centerX, face.centerY, face.width / 2, face.height / 2);

                                    filename = directory + "/dronepics/tmppic_" + imgCounter + ".png";
                                    im.save(filename);
                                    print("SAVED AN IMAGE!!!!!");
                                    imgCounter++;

                                    executeFacialRecognition(filename, face.x, face.width, face.y, face.height);
                                    //executeFacialRecognition(filename, face.centerX, face.centerY);
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

















