// Week 9 predict-the-checker listing: a derivation connection whose ends are swapped (the system requirement is
// written as the original and the stakeholder requirement as the derived one). FICTIONAL values.
package PredictDerivation {
	private import ISQ::*;
	private import SI::*;
	private import RequirementDerivation::*;

	part def Service { attribute turnaroundTime : DurationValue; }
	part def Chargers { attribute chargeTimeToDispatch : DurationValue; }

	requirement <'REQ-STK-005'> 'Hub turnaround time' {
		subject service : Service;
		attribute maxTurnaround : DurationValue = 25 [min];
		require constraint { service.turnaroundTime <= maxTurnaround }
	}
	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
		subject chargers : Chargers;
		attribute maxChargeTime : DurationValue = 20 [min];
		require constraint { chargers.chargeTimeToDispatch <= maxChargeTime }
	}

	#derivation connection 'swapped ends' {
		end #original ::> 'REQ-SYS-001';
		end #derive ::> 'REQ-STK-005';
	}
}
