import Quartz, time, sys
n=int(sys.argv[1]); d=int(sys.argv[2]) if len(sys.argv)>2 else -10
for _ in range(n):
    e = Quartz.CGEventCreateScrollWheelEvent(None, Quartz.kCGScrollEventUnitLine, 1, d)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, e); time.sleep(0.03)
