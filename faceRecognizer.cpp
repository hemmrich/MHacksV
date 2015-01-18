#include <opencv2/opencv.hpp>
#include <vector>
#include <iostream>
#include <sstream>

using namespace cv;
using namespace std;
const string DIRECTORY = "/Users/Max/Desktop/GitHub/MHacksV/";

Ptr<FaceRecognizer> fr;

void init() {
    fr = createEigenFaceRecognizer();
    vector<Mat> images;
    vector<int> labels;


    for(int i = 1; i <= 19; i++) {
        stringstream ss; ss << i;
        string pic = DIRECTORY + "training_pics/jason" + ss.str() + ".png";
        images.push_back(imread(pic, CV_LOAD_IMAGE_GRAYSCALE));
        labels.push_back(1);
    }

    fr->train(images, labels); 
}

bool foundFace(string filename) {
    Mat img = imread(filename, CV_LOAD_IMAGE_GRAYSCALE);
    int prediction = -1;
    double confidence = 0.0;
    imshow("Preview", img);

    fr->predict(img, prediction, confidence);

    cout << "prediction: " << prediction << ", confidence: " << confidence << endl;

    if(prediction == 1) // && confidence > 50.0)
        return true;
    return false;
}



int main(int argc, char** argv) {


    init();

    string filename(argv[1]);

    bool found = foundFace(filename);

    if(found)
        cout << "FOUND!" << endl;
    else
        cout << "Nope" << endl;

    return 0;
}