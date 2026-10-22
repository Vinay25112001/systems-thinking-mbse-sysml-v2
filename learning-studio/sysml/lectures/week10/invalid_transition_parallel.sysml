// Week 10 calibration (intentionally invalid): a transition written directly in a parallel state, even though both of
// its ends are in the same region (FICTIONAL). The checker rejects any transition the parallel state itself owns; it
// does not look at whether the transition crosses regions (see predict_cross_region_inside.sysml, which passes).
package 'W10 Parallel State Owns a Transition' {
	attribute def LandedOnPad;
	attribute def TakeOffCleared;
	state def AircraftStates;
	state aircraftStates : AircraftStates parallel {
		state operational {
			first start then onPad;
			state onPad;
			state inFlight;
			accept LandedOnPad then onPad;
		}
		state health {
			first start then fit;
			state fit;
			state degraded;
		}
		transition takeOff first operational.onPad accept TakeOffCleared then operational.inFlight;
	}
}
