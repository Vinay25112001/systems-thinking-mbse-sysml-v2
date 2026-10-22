// Week 9 AI-review demonstration set (FICTIONAL, proposed, instructor to confirm): six draft requirements written in the
// AeroLink style, four of them with a seeded quality defect. All six are accepted by the course checker, which is the
// point: the defects are in what the requirements say, not in the syntax. DRAFT IDs are teaching IDs, not Phase I IDs.
package ReviewSet {
	private import ISQ::*;
	private import SI::*;

	part def Scheduling { attribute assignmentLatencyP99 : DurationValue; }
	part def Aircraft { attribute climbNoise : SoundPressureLevelValue; }
	part def Booking {
		attribute quoteTime : DurationValue;
		attribute receiptDelay : DurationValue;
	}
	part def Chargers { attribute chargeTimeToDispatch : DurationValue; }

	requirement <'DRAFT-01'> 'Quick quote' {
		doc /* The booking function shall show a fare quote promptly after the passenger enters a trip. */
		subject booking : Booking;
		attribute maxQuoteTime : DurationValue = 5 [s];
		require constraint { booking.quoteTime <= maxQuoteTime }
	}
	requirement <'DRAFT-02'> 'Assignment latency' {
		doc /* The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed
		 * ride requests within 90 s of confirmation. */
		subject scheduling : Scheduling;
		attribute maxAssignmentLatency : DurationValue = 90 [s];
		require constraint { scheduling.assignmentLatencyP99 <= maxAssignmentLatency }
	}
	requirement <'DRAFT-03'> 'Climb-out noise' {
		doc /* The eVTOL aircraft shall produce no more than 70 dBA LAmax at the pad edge during climb-out
		 * on the published vertiport procedures. */
		subject aircraft : Aircraft;
		attribute maxClimbNoise : SoundPressureLevelValue = 70 [dB];
		require constraint { aircraft.climbNoise <= maxClimbNoise }
	}
	requirement <'DRAFT-04'> 'Charge time' {
		doc /* The charging system shall charge an aircraft to the dispatch threshold within 20 min. */
		subject chargers : Chargers;
		attribute maxChargeTime : DurationValue = 20 [min];
		require constraint { chargers.chargeTimeToDispatch <= maxChargeTime }
	}
	requirement <'DRAFT-05'> 'Trip receipt' {
		doc /* The booking function shall send each passenger a receipt for the trip within 10 min of landing
		 * at the destination vertiport. */
		subject booking : Booking;
		attribute maxReceiptDelay : DurationValue = 10 [min];
		require constraint { booking.receiptDelay <= maxReceiptDelay }
	}
	requirement <'DRAFT-06'> 'Quote shown before payment' {
		doc /* The booking function shall show the fare quote before it asks the passenger for payment. */
		subject booking : Booking;
	}
}
