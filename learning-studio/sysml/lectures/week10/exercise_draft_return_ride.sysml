// Week 10 applied exercise, task 5: the draft students review (FICTIONAL bike-share case). The course checker accepts
// it; it contains defects only a reviewer can find.
package 'W10 Exercise Draft' {
	private import ScalarValues::*;
	action def ReturnRide {
		attribute dockFull : Boolean;
		first start;
		then action arriveAtStation;
		then fork;
			then dockBike;
			then findNextStation;
		action dockBike;
		then done;
		action findNextStation;
		then done;
	}
	attribute def BikeDocked;
	attribute def BikeRemoved;
	state def DockStates {
		first start then empty;
		state empty;
		accept BikeDocked then available;
		state available;
		accept BikeRemoved then empty;
		state outOfService;
	}
}
