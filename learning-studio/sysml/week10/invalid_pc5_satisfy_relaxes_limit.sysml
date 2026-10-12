// Week 10 predict-the-checker item pc5. Predict the outcome before you reveal the recorded result.
package PredictPc5 {
	private import ISQ::*;
	private import SI::*;
	item def ElectricalEnergy { attribute power : PowerValue; }
	port def ChargingPort { out item energy : ElectricalEnergy; }
	part def ChargingSystems {
		attribute chargeTimeToDispatch : DurationValue;
		port chargerOutlet : ChargingPort;
	}
	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
		subject chargingSystem : ChargingSystems;
		attribute maxChargeTime : DurationValue = 20 [min];
		require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
	}
	part aeroLink {
		part <'PHY-003'> chargingSystems : ChargingSystems { attribute :>> chargeTimeToDispatch = 24 [min]; }
	}
	satisfy 'REQ-SYS-001' by aeroLink.'PHY-003' {
		attribute :>> maxChargeTime = 25 [min];
	}
}
