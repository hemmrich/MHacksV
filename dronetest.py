import libardrone
import time

print "Making drone object"
drone = libardrone.ARDrone()

print "Taking off.."
drone.takeoff()
time.sleep(8)
print "Landing"
drone.land()
drone.halt()