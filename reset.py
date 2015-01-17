import libardrone
import sys

drone = libardrone.ARDrone()

drone.reset()
print("reset complete.")
drone.halt()
sys.exit()
