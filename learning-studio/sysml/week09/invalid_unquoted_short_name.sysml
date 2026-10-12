// Week 9 teaching listing (INTENTIONALLY INVALID): one short name breaks the quoting rule for course IDs.
// The reference implementation must reject this file. Compare with aerolink_l9_skeleton.sysml.
package AeroLinkPhysicalDraft {
	private import ISQ::*;
	private import SI::*;

	part def EVTOLAircraft {
		attribute cruiseSpeed : SpeedValue = 150 [km/h];
	}
	part def ChargingSystems {
		attribute chargeTimeToDispatch : DurationValue;
	}
	part aeroLink {
		part <'PHY-001'> aircraft : EVTOLAircraft[12];
		part <PHY-003> chargingSystems : ChargingSystems;
	}
}
