// Week 13 worked example (c): a model fragment that the checker accepts but that is inconsistent.
// A team applied the change "REQ-SYS-001: 20 min -> 18 min" (worked example b) to the requirement's value only.
// Adapted from the instructor reference model (sysml/reference/aerolink_v04_full.sysml: Physical::ChargingSystems,
// Requirements::'REQ-SYS-001', Requirements::'REQ-STK-005', Measures::'TPM-001'). This fragment is SEEDED WITH
// DEFECTS for review practice; it is not a model to copy. The answer key lists them; the lesson's table says which one
// the checker reports (as a warning) and which only a reviewer can find. All values FICTIONAL (teaching values).
package AeroLinkSeededInconsistency {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	package Physical {
		part def ChargingSystems {
			attribute ratedPower : PowerValue;
			attribute <'MOP-002'> chargeTimeToDispatch : DurationValue;
		}
		part hubChargers : ChargingSystems {
			attribute :>> ratedPower = 400 [kW * h];
			attribute :>> chargeTimeToDispatch = 18 [min];
		}
	}

	package Requirements {
		requirement <'REQ-STK-005'> 'Hub turnaround time' {
			doc /* The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad (5 min of pad work plus the charge). */
			subject chargingSystem : Physical::ChargingSystems;
			attribute maxTurnaround : DurationValue = 25 [min];
			attribute padWorkTime : DurationValue = 5 [s];
			require constraint { padWorkTime + chargingSystem.chargeTimeToDispatch <= maxTurnaround }
		}
		requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
			doc /* The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min. */
			subject chargingSystem : Physical::ChargingSystems;
			attribute maxChargeTime : DurationValue = 18 [min];
			require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
		}
		requirement <'REQ-SYS-001'> 'Charger connection within 2 min' {
			doc /* Added during the same change: the charging system shall complete connection and handshake within 2 min of the aircraft's rotor stop. */
			subject chargingSystem : Physical::ChargingSystems;
		}
	}

	package Measures {
		attribute <'TPM-001'> 'Charge time to dispatch threshold' {
			attribute threshold : DurationValue = 20 [min];
			attribute currentEstimate : DurationValue = 18 [min];
			attribute margin : DurationValue = 2 [min];
		}
	}

	satisfy Requirements::'REQ-STK-005' by Physical::hubChargers;
	satisfy Requirements::'REQ-SYS-001' by Physical::hubChargers;
}
