// Week 8 micro-lab 3, teaching listing (INTENTIONALLY INVALID). Find the error before reading the commentary.
// The reference implementation must reject this file. Compare with aerolink_charge_requirement.sysml.
package AeroLinkChargingRequirementDraft {
	private import ISQ::*;
	private import SI::*;

	part def EVTOLAircraft {
		attribute padEdgeNoise : SoundPressureLevelValue;
	}
	part def ChargingSystems {
		attribute chargeTimeToDispatch : DurationValue;
	}

	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
		subject aircraft : EVTOLAircraft;
		attribute maxChargeTime : DurationValue = 20 [min];
		require constraint { aircraft.chargeTimeToDispatch <= maxChargeTime }
	}
}
