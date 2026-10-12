// Week 8 micro-lab 3, listing 1 (read-only): a requirement with a subject and a required constraint, and a satisfy.
// Adapted from the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml: REQ-SYS-001,
// PHY-003 and its satisfy) and the SysML v2 training material, release 2026-08 (S10 sl.86-91).
// Semantics of satisfy: SysML v2.1 Beta 2 (S06) 7.21.4, p.168. All values are FICTIONAL teaching values.
package AeroLinkChargingRequirement {
	private import ISQ::*;
	private import SI::*;

	part def ChargingSystems {
		doc /* The type of PHY-003: the chargers at the vertiports. */
		attribute chargeTimeToDispatch : DurationValue;
	}

	part aeroLink {
		part <'PHY-003'> chargingSystems : ChargingSystems {
			attribute :>> chargeTimeToDispatch = 18 [min]; // current estimate, TPM-001 (FICTIONAL)
		}
	}

	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
		doc /* The charging system shall charge an aircraft from any landing state of charge at or
		     * above the 20 % reserve to the dispatch threshold within 20 min. */
		subject chargingSystem : ChargingSystems;
		attribute maxChargeTime : DurationValue = 20 [min];
		require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
	}

	satisfy 'REQ-SYS-001' by aeroLink.'PHY-003';
}
