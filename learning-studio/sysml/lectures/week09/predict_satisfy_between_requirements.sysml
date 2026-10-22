// Week 9 predict-the-checker listing: satisfy written between two requirements "to show the trace". FICTIONAL values.
package PredictSatisfy {
	private import ISQ::*;
	private import SI::*;

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

	satisfy 'REQ-SYS-001' by 'REQ-STK-005';
}
