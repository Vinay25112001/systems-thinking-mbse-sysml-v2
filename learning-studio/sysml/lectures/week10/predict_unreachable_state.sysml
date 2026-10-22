// Week 10 predict item: a pump whose maintenance state no transition enters (FICTIONAL).
package 'W10 Unreachable State' {
	attribute def StartPump;
	attribute def StopPump;
	state def PumpStates {
		first start then idle;
		state idle;
		accept StartPump then running;
		state running;
		accept StopPump then idle;
		state maintenance;
	}
}
