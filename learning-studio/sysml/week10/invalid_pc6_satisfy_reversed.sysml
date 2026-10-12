// Week 10 predict-the-checker item pc6. Predict the outcome before you reveal the recorded result.
package PredictPc6 {
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
		part <'PHY-003'> chargingSystems : ChargingSystems { attribute :>> chargeTimeToDispatch = 18 [min]; }
	}
	satisfy aeroLink.'PHY-003' by 'REQ-SYS-001';
}
