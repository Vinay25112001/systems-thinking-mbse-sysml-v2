// Week 9 teaching listing: the driving question. Two teams write the same AeroLink system requirement (FICTIONAL).
// Team A writes the statement only; Team B adds a subject, a limit and a required constraint. Both are accepted by the
// course checker: the difference is what the model can say, not whether the file is valid.
package DrivingQuestion {
	private import ISQ::*;
	private import SI::*;

	part def Chargers {
		attribute chargeTimeToDispatch : DurationValue;
	}

	package TeamA {
		requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
			doc /* The charging system shall charge an aircraft from any landing state of charge at or above
			 * the 20 % reserve to the dispatch threshold within 20 min. */
		}
	}

	package TeamB {
		requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
			doc /* The charging system shall charge an aircraft from any landing state of charge at or above
			 * the 20 % reserve to the dispatch threshold within 20 min. */
			subject chargers : Chargers;
			attribute maxChargeTime : DurationValue = 20 [min];
			require constraint { chargers.chargeTimeToDispatch <= maxChargeTime }
		}
	}
}
