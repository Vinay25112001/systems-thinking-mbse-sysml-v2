// Week 10 calibration (intentionally invalid): a transition whose guard is written before its trigger. The textual
// notation puts the trigger (accept) first, then the guard (if), then the effect (do), then the target (FICTIONAL).
package 'W10 Guard Before Trigger' {
	private import ScalarValues::*;
	attribute def DispatchRelease;
	state def AircraftStates {
		attribute noGoFaultOpen : Boolean;
		first start then dispatchReady;
		state dispatchReady;
		transition dispatch first dispatchReady if not noGoFaultOpen accept DispatchRelease then inFlight;
		state inFlight;
	}
}
