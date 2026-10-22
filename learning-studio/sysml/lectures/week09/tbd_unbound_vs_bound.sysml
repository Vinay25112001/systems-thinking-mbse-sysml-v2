// Week 9 teaching listing: a limit that is still to be decided (AeroLink REQ-SYS-010, TBD-02, FICTIONAL). Unbound keeps
// the limit without a value, as model v0.2 does; Bound ties the limit to the value configured in the charging system,
// so the requirement reads "the configured limit". Both are accepted by the checker; only the second says what is meant.
package GridLimit {
	private import ISQ::*;
	private import SI::*;
	private import ModelingMetadata::*;

	part def Chargers {
		attribute combinedChargerPower : PowerValue;
		attribute configuredConnectionLimit : PowerValue;
	}

	package Unbound {
		requirement <'REQ-SYS-010'> 'Vertiport charging power limit' {
			doc /* The charging system shall limit the combined power of all chargers at a vertiport to the
			 * configured connection limit (TBD-02 kW). */
			subject chargers : Chargers;
			attribute maxCombinedChargerPower : PowerValue;
			require constraint { chargers.combinedChargerPower <= maxCombinedChargerPower }
			@StatusInfo { status = StatusKind::tbd; owner = "Vertiport Infrastructure Manager"; }
		}
	}

	package Bound {
		requirement <'REQ-SYS-010'> 'Vertiport charging power limit' {
			doc /* The charging system shall limit the combined power of all chargers at a vertiport to the
			 * configured connection limit (TBD-02 kW). */
			subject chargers : Chargers;
			attribute maxCombinedChargerPower : PowerValue = chargers.configuredConnectionLimit;
			require constraint { chargers.combinedChargerPower <= maxCombinedChargerPower }
			@StatusInfo { status = StatusKind::tbd; owner = "Vertiport Infrastructure Manager"; }
		}
	}
}
