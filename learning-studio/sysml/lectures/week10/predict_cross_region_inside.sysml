// Week 10 predict item: an aircraft with two concurrent regions, operational and health, and a transition from a state
// in one region to a state in the other, written inside the operational region (FICTIONAL). A reviewer must catch it:
// the substates of a parallel state run concurrently, and no transition is allowed between them.
package 'W10 Cross-Region Transition' {
	attribute def LandedOnPad;
	attribute def FaultReported;
	state def AircraftStates;
	state aircraftStates : AircraftStates parallel {
		state operational {
			first start then onPad;
			state onPad;
			state inFlight;
			accept LandedOnPad then onPad;
			transition faultInFlight first inFlight accept FaultReported then aircraftStates.health.degraded;
		}
		state health {
			first start then fit;
			state fit;
			state degraded;
		}
	}
}
