// Week 10 calibration: a state definition with no initial state (FICTIONAL). Nothing says which state the door is in
// after entry.
package 'W10 No Initial State' {
	attribute def DoorOpened;
	attribute def DoorClosed;
	state def DoorStates {
		state closed;
		accept DoorOpened then open;
		state open;
		accept DoorClosed then closed;
	}
}
