// Week 10 predict-the-checker item pc9. Predict the outcome before you reveal the recorded result.
package PredictPc9 {
	private import ISQ::*;
	private import SI::*;
	part def ChargingSystems { attribute chargeTimeToDispatch : DurationValue; }
	requirement def ChargeTimeRequirement {
		subject chargingSystem : ChargingSystems;
		attribute maxChargeTime : DurationValue;
		require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
	}
	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' : ChargeTimeRequirement {
		attribute :>> maxChargeTime = 20 [min];
	}
	part aeroLink {
		part <'PHY-003'> chargingSystems : ChargingSystems { attribute :>> chargeTimeToDispatch = 18 [min]; }
	}
	satisfy ChargeTimeRequirement by aeroLink.'PHY-003';
}
