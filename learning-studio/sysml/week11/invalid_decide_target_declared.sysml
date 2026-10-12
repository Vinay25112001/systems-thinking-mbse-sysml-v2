// Week 11 teaching listing (intentionally invalid): a decision whose branch declares its target action inline.
// Adapted from SCN-002 step 3 (the ANSP's decision on the flight intent). Find the line the checker rejects.
package 'AeroLink W11 Invalid Decision' {
	private import ScalarValues::*;
	action def MissionStart {
		attribute flightIntentAccepted : Boolean;
		first start;
		then action fileFlightIntent;
		then decide intentCheck;
			if flightIntentAccepted then action boardPassengers;
			else holdAndRefile;
		action holdAndRefile;
		then done;
	}
}
