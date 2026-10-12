// Week 6 micro-lab 2, teaching listing (INTENTIONALLY INVALID). Find the error before reading the answer.
// The reference implementation must reject this file. Compare with aerolink_charging.sysml.
package AeroLinkSpokeCharger {
	private import ISQ::*;
	private import SI::*;

	abstract part def Charger {
		attribute ratedPower : PowerValue;
		attribute chargeTimeToDispatch : DurationValue;
	}

	part def StandardCharger :> Charger;

	part spokeCharger : StandardCharger {
		attribute redefines ratedPower = 150 [kW];
		attribute redefines usableEnergy = 160 [kW * h];
	}
}
