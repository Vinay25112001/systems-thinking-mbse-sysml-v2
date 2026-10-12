// Week 10 lesson listing: a requirement with an actor, an assumed constraint and a required constraint.
// Adapted from the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml: REQ-SYS-007 and
// EVTOLAircraft) and the SysML v2 training material, release 2026-08 (S10 sl.87, 89). Actor parameters and
// assumed constraints: SysML v2.1 Beta 2 (S06) 7.21.1-7.21.2. The reference states "in still air" only in the doc
// text; this listing shows the GATE reading, an explicit assumption about the weather actor, so that its semantics
// can be examined (the lesson contrasts it with the reference-condition reading). Still air is taken as a wind
// speed of at most 0.5 m/s, a FICTIONAL tolerance, not an exact equality on a measured quantity. All values FICTIONAL.
package AeroLinkBlockTimeRequirement {
	private import ISQ::*;
	private import SI::*;

	part def EVTOLAircraft {
		attribute designTripBlockTime : DurationValue;
	}
	part def WeatherSystem {
		doc /* The type of EXT-003 Weather: the conditions the aircraft flies in. */
		attribute windSpeed : SpeedValue;
	}

	requirement <'REQ-SYS-007'> 'Block time for the design trip' {
		doc /* The eVTOL aircraft shall complete a 25 km vertiport-to-vertiport trip within 16 min block time
		     * in still air. */
		subject aircraft : EVTOLAircraft;
		actor weather : WeatherSystem;
		attribute designTripDistance : LengthValue = 25 [km];
		attribute maxBlockTime : DurationValue = 16 [min];
		assume constraint stillAir {
			doc /* The trip is flown in still air (wind speed at most 0.5 m/s, FICTIONAL tolerance). */
			weather.windSpeed <= 0.5 [m/s]
		}
		require constraint withinBlockTime { aircraft.designTripBlockTime <= maxBlockTime }
	}
}
