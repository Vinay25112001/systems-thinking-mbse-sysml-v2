// Week 10 worked example (b): port definitions, conjugate ports, two interface definitions and two interface
// usages with connect: IF-005 (aircraft <-> charger power, physical) and IF-010 (charger <-> operations centre
// data, information), with the INFO-003 item flow carried by IF-010.
// Adapted from the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml: ChargingPort,
// MaintenanceDataPort, AircraftChargerPower, ChargeSessionDataLink, IF-005, IF-010 and the INFO-003 flow) and the
// SysML v2 training material, release 2026-08: ports (S10 sl.20), conjugation (sl.21), interfaces (sl.22),
// flows (sl.27) and flows in interfaces (sl.28). The flow inside AircraftChargerPower is an addition to the
// reference. All values FICTIONAL.
package AeroLinkChargingInterfaces {
	private import ISQ::*;
	private import ScalarValues::*;

	item def ElectricalEnergy {
		attribute energy : EnergyValue;
		attribute power : PowerValue;
	}
	item def <'INFO-003'> 'Maintenance Data' {
		doc /* Fault reports, deferrals, work orders, release-to-service records and battery charge-session data. */
		attribute noGoFaultOpen : Boolean;
		attribute chargedEnergy : EnergyValue;
	}

	// Port definitions: the direction is written from the producing side; the consuming side uses ~.
	port def ChargingPort { out item energy : ElectricalEnergy; }
	port def MaintenanceDataPort { out item maintenanceData : 'INFO-003'; }

	interface def AircraftChargerPower {
		end chargerSide : ChargingPort;
		end aircraftSide : ~ChargingPort;
		flow chargerSide.energy to aircraftSide.energy;
	}
	interface def ChargeSessionDataLink {
		end chargerSide : MaintenanceDataPort;
		end operationsSide : ~MaintenanceDataPort;
	}

	part def EVTOLAircraft { port chargeInlet : ~ChargingPort; }
	part def ChargingSystems {
		port chargerOutlet : ChargingPort;
		port sessionDataOut : MaintenanceDataPort;
	}
	part def OperationsCenter { port chargeSessionIn : ~MaintenanceDataPort; }

	part aeroLink {
		part <'PHY-001'> aircraft : EVTOLAircraft[12];
		part <'PHY-003'> chargingSystems : ChargingSystems;
		part <'PHY-004'> operationsCenter : OperationsCenter;

		interface <'IF-005'> aircraftChargerPower : AircraftChargerPower
			connect chargerSide ::> 'PHY-003'.chargerOutlet to aircraftSide ::> 'PHY-001'.chargeInlet {
			doc /* Aircraft <-> charger power (physical): DC charging power and battery-management handshake. */
		}
		interface <'IF-010'> chargerOperationsCentreData : ChargeSessionDataLink
			connect 'PHY-003'.sessionDataOut to 'PHY-004'.chargeSessionIn {
			doc /* Charger <-> operations centre data (information): charge-session records and charge-complete
			     * status, over the ground network (PHY-006). Carries: INFO-003. */
		}
		flow 'PHY-003 flows-to INFO-003 flows-to PHY-004' of 'INFO-003'
			from 'PHY-003'.sessionDataOut.maintenanceData to 'PHY-004'.chargeSessionIn.maintenanceData;
	}
}
