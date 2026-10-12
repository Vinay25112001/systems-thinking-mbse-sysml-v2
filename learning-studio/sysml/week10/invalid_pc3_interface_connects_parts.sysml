// Week 10 predict-the-checker item pc3. Predict the outcome before you reveal the recorded result.
package PredictPc3 {
	private import ISQ::*;
	private import SI::*;
	item def ElectricalEnergy { attribute power : PowerValue; }
	port def ChargingPort { out item energy : ElectricalEnergy; }
	interface def AircraftChargerPower { end chargerSide : ChargingPort; end aircraftSide : ~ChargingPort; }
	part def EVTOLAircraft { port chargeInlet : ~ChargingPort; }
	part def ChargingSystems { port chargerOutlet : ChargingPort; }
	part aeroLink {
		part <'PHY-001'> aircraft : EVTOLAircraft[12];
		part <'PHY-003'> chargingSystems : ChargingSystems;
		interface <'IF-005'> aircraftChargerPower : AircraftChargerPower connect 'PHY-003' to 'PHY-001';
	}
}
