#include <opencv2/opencv.hpp>
#include <vector>
#include <iostream>
#include <sstream>

using namespace cv;
using namespace std;
const string DIRECTORY = "/Users/Max/Desktop/GitHub/MHacksV/";
const string RECOGNIZER = DIRECTORY + "createEigenFaceRecognizer.xml";

Ptr<FaceRecognizer> fr;

void init() {
    fr = createEigenFaceRecognizer();

    //check if a save file exists
    if(FILE *file = fopen(RECOGNIZER.c_str(), "r")) {
        fclose(file);
        fr->load(RECOGNIZER);
        cout << "Loaded Eigen Face Recognizer from file!" << endl;
        return;
    }

    vector<Mat> images;
    vector<int> labels;
    int counter = 1;


    for(int i = 1; i <= 7; i++) {
        stringstream ss; ss << i;
        string pic = DIRECTORY + "training_pics/yes/jason" + ss.str() + "_cropped.png";
        cout << "Loading Jason pic " << pic << endl;
        images.push_back(imread(pic, CV_LOAD_IMAGE_GRAYSCALE));
        labels.push_back(0);
    }

    for(int i = 1; i <= 11; i++) {
        stringstream ss; ss << i;
        string pic = DIRECTORY + "training_pics/no/no" + ss.str() + ".png";
        cout << "Loading non pic " << pic << endl;

        Mat m = imread(pic, 1);
        Mat m2;
        cvtColor(m, m2, CV_BGR2GRAY);
        images.push_back(m2);
        //images.push_back(imread(pic, CV_LOAD_IMAGE_GRAYSCALE));
        labels.push_back(counter);
        counter++;
    }

    fr->train(images, labels); 
    fr->save(RECOGNIZER);
}

bool foundFace(const Mat& img) {
    //Mat img = imread(filename, CV_LOAD_IMAGE_GRAYSCALE);
    int prediction = -1;
    double confidence = 0.0;
    //imshow("Preview", img);

    fr->predict(img, prediction, confidence);

    cout << "prediction: " << prediction << ", confidence: " << confidence << endl;

    if(prediction == 0) // && confidence > 50.0)
        return true;
}

Mat cropToSize(string filename, int centerX, int centerY, int dimensionX, int dimensionY) {
    Mat img = imread(filename, CV_LOAD_IMAGE_GRAYSCALE);

    try {
        Point topLeft((centerX - dimensionX / 2), (centerY - dimensionY / 2));
        Point bottomRight((centerX + dimensionX / 2), (centerY + dimensionY / 2));

        Rect faceRekt;
        faceRekt.x = centerX - dimensionX / 2;
        faceRekt.y = centerY - dimensionY / 2;
        faceRekt.width = dimensionX;
        faceRekt.height = dimensionY;


        if(centerX - dimensionX / 2 < 0)
            centerX = 0;
        if(centerY - dimensionY / 2 < 0)
            centerY = 0;
        if(centerX + dimensionX > img.cols)
            centerX = img.cols - dimensionX;
        if(centerY + dimensionY > img.rows)
            centerY = img.rows - dimensionY;


        Mat croppedImage;

        croppedImage = img(faceRekt).clone();
        return croppedImage;
    } catch (Exception e) {     
    }
}



int main(int argc, char** argv) {

    init();

    string filename(argv[1]);

    istringstream ss(argv[2]);
    istringstream ss2(argv[3]);

    int centerX = -1, centerY = -1;

    if (ss >> centerX && ss2 >> centerY) {
        Mat cropped = cropToSize(filename, centerX, centerY, 200, 200); //crop to 200 by 200

        bool found = foundFace(cropped);

    if(found)
        cout << "FOUND!" << endl;
    else
        cout << "Nope" << endl;
    }

    

    return 0;
}