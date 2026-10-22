// Week 10 predict item: a state definition with two initial states (FICTIONAL). Course reasoning: a non-parallel state
// with substates has exactly one active substate after entry, and each initial succession names a state entered after
// entry, so this model asks for two at once.
package 'W10 Two Initial States' {
	attribute def DoorOpened;
	state def DoorStates {
		first start then closed;
		first start then open;
		state closed;
		accept DoorOpened then open;
		state open;
	}
}
