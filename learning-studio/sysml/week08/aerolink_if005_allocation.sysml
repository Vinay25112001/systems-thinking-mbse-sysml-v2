// Week 8 micro-lab 3, listing 2 (read-only): the worked chain FN-006 -> LOG-002 -> PHY-003 and interface IF-005.
// Adapted from the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml: ChargingPort,
// AircraftChargerPower, IF-005, perform and allocation) and the SysML v2 training material, release 2026-08:
// ports and conjugation (S10 sl.20-21), interfaces (sl.22). Course link types are realised as in the reference:
// LOG performs FN = perform; FN/LOG allocated-to PHY = allocation ... allocate. All values are FICTIONAL.
package AeroLinkChargingInterface {
	private import ISQ::*;

	item def ElectricalEnergy {
		attribute energy : EnergyValue;
		attribute power : PowerValue;
	}
	port def ChargingPort {
		out item energy : ElectricalEnergy;
	}
	interface def AircraftChargerPower {
		end chargerSide : ChargingPort;
		end aircraftSide : ~ChargingPort;
	}
	part def EVTOLAircraft {
		port chargeInlet : ~ChargingPort;
	}
	part def ChargingSystems {
		port chargerOutlet : ChargingPort;
	}
	part def FleetManagement;

	action <'FN-006'> 'Charge aircraft';

	part logicalArchitecture {
		part <'LOG-002'> fleetManagement : FleetManagement {
			perform 'FN-006';
		}
	}

	part aeroLink {
		part <'PHY-001'> aircraft : EVTOLAircraft[12];
		part <'PHY-003'> chargingSystems : ChargingSystems;
		interface <'IF-005'> aircraftChargerPower : AircraftChargerPower
			connect 'PHY-003'.chargerOutlet to 'PHY-001'.chargeInlet;
	}

	allocation 'FN-006 allocated-to PHY-003' allocate 'FN-006' to aeroLink.'PHY-003';
	allocation 'LOG-002 allocated-to PHY-003' allocate logicalArchitecture.'LOG-002' to aeroLink.'PHY-003';
}
