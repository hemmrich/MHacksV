#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <cstdio>

using namespace std;
using namespace cv;

 /** Global variables */
String directory = "/Users/Max/Desktop/GitHub/MHacksV/data/";
String face_cascade_name = "haarcascade_frontalface_alt.xml";
String eyes_cascade_name = "haarcascade_eye_tree_eyeglasses.xml";
CascadeClassifier face_cascade;
CascadeClassifier eyes_cascade;
string window_name = "Capture - Face detection";
string filename = "";
RNG rng(12345);

bool rectContainsPoint(const Rect& rect, const Point& point) {

    if(point.x < (rect.x + rect.width * 0.5) && point.x > (rect.x - rect.width * 0.5) &&
       point.y < (rect.y + rect.height * 0.5) && point.y > (rect.y - rect.height * 0.5))
        return true;
    return false;
}

void detectAndDisplay(const Mat& frame) {
    cout <<"D&D" << endl;
    vector<Rect> faces;
    Mat frame_gray = frame;
    Mat croppedImage;

    int dimensionX = 200; //200x200 image, so +/- 100 px from center
    int dimensionY = 200;

    //cvtColor(frame, frame_gray, CV_BGR2GRAY);
    equalizeHist(frame_gray, frame_gray);

    //Detect face
    face_cascade.detectMultiScale(frame_gray, faces, 1.1, 2, 0 | CV_HAAR_SCALE_IMAGE, Size(30,30));
    for(int i = 0; i < faces.size(); i++) {
        Point face_center(faces[i].x + faces[i].width * 0.5, faces[i].y + faces[i].height * 0.5);
        //ellipse(frame, face_center, Size(faces[i].width * 0.5, faces[i].height * 0.5), 0, 0, 360, Scalar(255, 0, 255), 4, 8, 0);

        cout << "Looking at face " << i << endl;

        //Crop image
        Rect faceRekt;
        faceRekt.x = face_center.x - dimensionX / 2;
        faceRekt.y = face_center.y - dimensionY / 2;
        faceRekt.width = dimensionX;
        faceRekt.height = dimensionY;
        Mat croppedImage;

        croppedImage = frame(faceRekt).clone();

        imshow("Preview", frame);
        getchar();

        //Find eyes in each face to ensure that it's actually a face (and not a soap dispenser -_-)
        Mat faceROI = frame_gray(faces[i]);
        vector<Rect> eyes;

        eyes_cascade.detectMultiScale(faceROI, eyes, 1.1, 2, 0 | CV_HAAR_SCALE_IMAGE, Size(30, 30));
        for(int j = 0; j < eyes.size(); j++) {
            Point eye_center(faces[i].x + eyes[j].x + eyes[j].width * 0.5,
                         faces[i].y + eyes[j].y + eyes[j].height * 0.5);

            int radius = cvRound((eyes[j].width + eyes[j].height) * 0.25);
            //circle(frame, eye_center, radius, Scalar(255, 0, 0), 4, 8, 0);

            //ROI IS (PROBABLY) AN ACTUAL FACE!!!!!!!!!!!!!!!
            if(rectContainsPoint(faceRekt, eye_center)) {
                filename = filename.substr(0, filename.size() - 4); //remove .png
                filename += "_cropped.png";
                imwrite(filename.c_str(), croppedImage);
            }           
        }
    }
    imshow("Preview", frame);
    getchar();
}


int main(int argc, char** argv) {
    filename = argv[1];
    Mat frame;

    //Load cascades (using both face and eyes)
    if(!face_cascade.load(directory + face_cascade_name))
        cout << "Error loading face cascade" << endl;
    if(!eyes_cascade.load(directory + eyes_cascade_name))
        cout << "Error loading eyes cascade" << endl;


    //Open image and apply classifiers
    frame = imread(filename, 0);
    if(!frame.empty())
        detectAndDisplay(frame);
    else
        cout << "Frame empty!!" << endl;        

    return 0;
}