// Week 10 Session 2 warm-up: three drafts of the SCN-003 branch "both hub chargers are occupied" (FICTIONAL). All three
// pass the course checker. Only one says what the ConOps says: the aircraft either queues or is connected, never both.
package 'W10 Warm-up Branches' {
	private import ScalarValues::*;
	package DraftA {
		action def ChargerCheck {
			first start;
			then action arrive;
			then fork;
				then queueForCharger;
				then connectCharger;
			action queueForCharger;
			then done;
			action connectCharger;
			then done;
		}
	}
	package DraftB {
		action def ChargerCheck {
			attribute chargersOccupied : Boolean;
			attribute chargerFree : Boolean;
			first start;
			then action arrive;
			then decide;
				if chargersOccupied then queueForCharger;
				if chargerFree then connectCharger;
			action queueForCharger;
			then done;
			action connectCharger;
			then done;
		}
	}
	package DraftC {
		action def ChargerCheck {
			attribute chargersOccupied : Boolean;
			first start;
			then action arrive;
			then merge waitForCharger;
			then decide;
				if chargersOccupied then queueForCharger;
				else connectCharger;
			action queueForCharger;
			then waitForCharger;
			action connectCharger;
			then done;
		}
	}
}
