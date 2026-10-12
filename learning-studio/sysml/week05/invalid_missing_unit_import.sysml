// Week 5 micro-lab 1, teaching listing (INTENTIONALLY INVALID). Find the error before reading the answer.
// The reference implementation must reject this file. Compare with aerolink_fleet.sysml.
package AeroLinkChargerFragment {
	private import ISQ::*;

	part def Charger {
		attribute chargeTimeToDispatch : DurationValue;
	}

	part hubCharger : Charger {
		attribute redefines chargeTimeToDispatch = 20 [min];
	}
}
