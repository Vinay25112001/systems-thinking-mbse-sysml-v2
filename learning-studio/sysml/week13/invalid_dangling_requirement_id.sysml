// Week 13 teaching listing (intentionally invalid): a dangling reference left by an incomplete change.
// During the change "REQ-SYS-001: 20 min -> 18 min" a team decided to issue a new ID, REQ-SYS-011, for the changed
// requirement (the course never reuses IDs), renamed the requirement, and forgot the satisfy that still names the old
// ID. The checker rejects line 23: the short name no longer resolves. This is the one kind of inconsistency in this
// week's examples that the checker does report. All values FICTIONAL (teaching values).
package AeroLinkDanglingReference {
	private import ISQ::*;
	private import SI::*;

	part def ChargingSystems {
		attribute <'MOP-002'> chargeTimeToDispatch : DurationValue;
	}
	part hubChargers : ChargingSystems {
		attribute :>> chargeTimeToDispatch = 18 [min];
	}

	requirement <'REQ-SYS-011'> 'Charge to dispatch threshold in 18 min' {
		subject chargingSystem : ChargingSystems;
		attribute maxChargeTime : DurationValue = 18 [min];
		require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
	}

	satisfy 'REQ-SYS-001' by hubChargers;
}
