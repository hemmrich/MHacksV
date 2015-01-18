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
RNG rng(12345);


void detectAndDisplay(Mat frame) {
    vector<Rect> faces;
    Mat frame_gray = frame;
    Mat croppedImage;

    cout << "image chans : " << frame.channels() << endl;
    //cvtColor(frame, frame_gray, CV_BGR2GRAY);
    equalizeHist(frame_gray, frame_gray);

    //Detect face
    face_cascade.detectMultiScale(frame_gray, faces, 1.1, 2, 0 | CV_HAAR_SCALE_IMAGE, Size(30,30));
    for(int i = 0; i < faces.size(); i++) {
        Point center(faces[i].x + faces[i].width * 0.5, faces[i].y + faces[i].height * 0.5);
        ellipse(frame, center, Size(faces[i].width * 0.5, faces[i].height * 0.5), 0, 0, 360, Scalar(255, 0, 255), 4, 8, 0);

        // Transform it into the C++ cv::Mat format
        Mat cropped(frame); 

        cout << "i = " << i << endl;
        cout << "faces[i].x: " << faces[i].x << endl;
        cout << "faces[i].y: " << faces[i].y << endl;
        cout << "faces[i].width: " << faces[i].width << endl;
        cout << "faces[i].height: " << faces[i].height << endl;

        //top left point is (x, y)
        Point topLeft(faces[i].x, faces[i].y);
        Point bottomRight(faces[i].x + faces[i].width, faces[i].y + faces[i].height);
        Rect ROI(topLeft, bottomRight);

        Mat croppedImage = cropped(ROI);

        imshow("Preview", croppedImage);
    }
    getchar();
}


int main(int argc, char** argv) {
    string filename(argv[1]);

    CvCapture* cap;
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