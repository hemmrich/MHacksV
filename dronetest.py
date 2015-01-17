import libardrone
import time
import sys
import cv2
import numpy

print "Making drone object"
drone = libardrone.ARDrone()

commands = ["t", "l", "h", "q", 
            "takeoff", "land", "hover", "left", "right", "up", "down", "forward", 
            "backward", "quit", "reset"]
print "Commands: " + str(commands)

imgFilename = "tmpimg.png"

try:
    while True:
        input = raw_input("Enter a command: ")
        cv2.destroyAllWindows()

        if input == "takeoff" or input == "t":
            print "TAKEOFF"
            drone.takeoff()
            drone.hover()
            continue
        elif input == "land" or input == "l":
            print "LAND"
            drone.land()
            continue
        elif input == "hover" or input == "h":
            print "HOVER"
            drone.hover()
            continue
        elif input == "left":
            print "LEFT"
            drone.turn_left()
            continue
        elif input == "right":
            print "RIGHT"
            drone.turn_right()
            continue
        elif input == "up":
            print "UP"
            drone.move_up()
            continue
        elif input == "down":
            print "DOWN"
            drone.move_down()
            continue
        elif input == "forward":
            print "FORWARD"
            drone.move_forward()
            continue
        elif input == "backward":
            print "BACKWARD"
            drone.move_backward()
            continue

        elif input == "image":
            image = drone.get_image()
            print image

        elif input == "reset":
            print "RESET"
            drone.reset()
        elif input == "quit" or input == "q":
            print "QUIT"
            drone.land()
            drone.halt()
            sys.exit()
        else:
            print "Command not found - this shouldn't print"


finally:
    drone.land()
    drone.halt()

drone.land()
drone.halt()