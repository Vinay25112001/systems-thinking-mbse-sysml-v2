// Week 10 predict item (intentionally invalid): a decision whose branch declares its target action in place. Adapted
// from SCN-002 step 3, the air traffic service's decision on the flight intent (FICTIONAL). Find the line the checker
// rejects, and say why.
package 'W10 Target Declared' {
	private import ScalarValues::*;
	action def MissionStart {
		attribute intentAccepted : Boolean;
		first start;
		then action fileFlightIntent;
		then decide intentCheck;
			if intentAccepted then action boardParty;
			else holdAndRefile;
		action holdAndRefile;
		then done;
	}
}
