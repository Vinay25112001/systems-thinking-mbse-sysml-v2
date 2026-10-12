// Week 10 INSTRUCTOR ANSWER KEY for the graduate task (not shown in the student lesson): REQ-SYS-001 with the
// arriving aircraft as an actor, an assumed constraint on its arrival state of charge, a required constraint whose
// charge time DEPENDS on that arrival state, and a satisfy that binds the actor to one arriving aircraft.
// Requirement text and values: the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml).
// Additions for this key (not in the reference): EVTOLAircraft::arrivalStateOfCharge, ChargingSystems::
// dispatchThreshold and ::fullChargeTime (a constant-rate idealisation of the charge curve), and the ref part
// arrivingAircraft. Semantics: SysML v2.1 Beta 2 (S06) 7.21 (assumed and required constraints, actors, satisfy).
// All values FICTIONAL.
package AeroLinkChargeAssumption {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	part def EVTOLAircraft {
		attribute arrivalStateOfCharge : Real; // fraction of usable energy on arrival, 0..1
	}
	part def ChargingSystems {
		attribute dispatchThreshold : Real; // state of charge at which an aircraft is dispatch-ready, 0..1
		attribute fullChargeTime : DurationValue; // time to add the whole usable energy (0 to 1) at the rated rate
	}

	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
		doc /* The charging system shall charge an aircraft from any landing state of charge at or above the
		     * 20 % reserve to the dispatch threshold within 20 min. */
		subject chargingSystem : ChargingSystems;
		actor aircraft : EVTOLAircraft;
		attribute reserveFraction : Real = 0.20;
		attribute maxChargeTime : DurationValue = 20 [min];
		assume constraint arrivalAtOrAboveReserve {
			doc /* The aircraft arrives with at least the planned 20 % reserve (REQ-SYS-003). */
			aircraft.arrivalStateOfCharge >= reserveFraction
		}
		require constraint chargeWithinLimit {
			doc /* The charge time for THIS arrival: the energy still missing to the dispatch threshold, at the
			     * charger's rated rate, is at most maxChargeTime. */
			(chargingSystem.dispatchThreshold - aircraft.arrivalStateOfCharge) * chargingSystem.fullChargeTime <= maxChargeTime
		}
	}

	part aeroLink {
		part <'PHY-001'> aircraft : EVTOLAircraft[12];
		ref part arrivingAircraft : EVTOLAircraft[1] :> 'PHY-001'; // the one aircraft on the charger, one of the fleet
		part <'PHY-003'> chargingSystems : ChargingSystems {
			attribute :>> dispatchThreshold = 0.80; // FICTIONAL
			attribute :>> fullChargeTime = 30 [min]; // FICTIONAL: (0.80 - 0.20) x 30 min = 18 min, the TPM-001 estimate
		}
	}

	satisfy 'REQ-SYS-001' by aeroLink.'PHY-003' {
		actor :>> aircraft = aeroLink.arrivingAircraft;
	}
}
