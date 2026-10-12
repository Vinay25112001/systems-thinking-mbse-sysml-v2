// Week 10 predict-the-checker item pc2. Predict the outcome before you reveal the recorded result.
package PredictPc2 {
	private import ISQ::*;
	private import SI::*;
	item def ElectricalEnergy { attribute power : PowerValue; }
	item def PadLoads { attribute landingLoad : ForceValue; }
	port def ChargingPort { out item energy : ElectricalEnergy; }
	port def AircraftPadPort { out item loads : PadLoads; }
	interface def AircraftChargerPower { end chargerSide : ChargingPort; end aircraftSide : ~ChargingPort; }
	part def EVTOLAircraft { port chargeInlet : ~ChargingPort; port padPort : AircraftPadPort; }
	part def ChargingSystems { port chargerOutlet : ChargingPort; }
	part aeroLink {
		part <'PHY-001'> aircraft : EVTOLAircraft[12];
		part <'PHY-003'> chargingSystems : ChargingSystems;
		interface <'IF-005'> aircraftChargerPower : AircraftChargerPower connect 'PHY-003'.chargerOutlet to 'PHY-001'.padPort;
	}
}
