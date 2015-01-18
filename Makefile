rec: faceRecognizer.o
		@g++ faceRecognizer.o -lopencv_calib3d -lopencv_contrib -lopencv_core -lopencv_features2d -lopencv_flann -lopencv_highgui -lopencv_imgproc -lopencv_legacy -lopencv_ml -lopencv_objdetect -lopencv_photo -lopencv_stitching -lopencv_ts -lopencv_video -lopencv_videostab -o faceRecognizer

faceRecognizer.o: faceRecognizer.cpp
		@g++ -c faceRecognizer.cpp

crop: cropFaces.o
		@g++ cropFaces.o -lopencv_calib3d -lopencv_contrib -lopencv_core -lopencv_features2d -lopencv_flann -lopencv_highgui -lopencv_imgproc -lopencv_legacy -lopencv_ml -lopencv_objdetect -lopencv_photo -lopencv_stitching -lopencv_ts -lopencv_video -lopencv_videostab -o cropFaces

cropFaces.o: cropFaces.cpp
		@g++ -c cropFaces.cpp

