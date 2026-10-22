// Week 9 teaching listing: "in still air" read two ways (AeroLink REQ-SYS-007, FICTIONAL). GateReading models the
// condition as an assumption about the weather actor; ReferenceReading keeps it with the quantity, as the course
// recommends here. The 0.5 m/s still-air tolerance is a FICTIONAL teaching value. Both are accepted by the checker.
package StillAir {
	private import ISQ::*;
	private import SI::*;

	part def Aircraft {
		attribute designTripBlockTime : DurationValue;
		attribute stillAirDesignTripBlockTime : DurationValue;
	}
	part def Weather {
		attribute windSpeed : SpeedValue;
	}

	package GateReading {
		requirement <'REQ-SYS-007'> 'Block time for the design trip' {
			doc /* The eVTOL aircraft shall complete a 25 km vertiport-to-vertiport trip within 16 min block time
			 * in still air. */
			subject aircraft : Aircraft;
			actor weather : Weather;
			attribute maxBlockTime : DurationValue = 16 [min];
			assume constraint stillAir { weather.windSpeed <= 0.5 [m/s] }
			require constraint withinBlockTime { aircraft.designTripBlockTime <= maxBlockTime }
		}
	}

	package ReferenceReading {
		requirement <'REQ-SYS-007'> 'Block time for the design trip' {
			doc /* The eVTOL aircraft shall complete a 25 km vertiport-to-vertiport trip within 16 min block time
			 * in still air. Measured block times are corrected to still air before they are compared. */
			subject aircraft : Aircraft;
			attribute maxBlockTime : DurationValue = 16 [min];
			require constraint { aircraft.stillAirDesignTripBlockTime <= maxBlockTime }
		}
	}
}
