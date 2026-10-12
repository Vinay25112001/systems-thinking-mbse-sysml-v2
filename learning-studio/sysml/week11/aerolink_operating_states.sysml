// Week 11 worked examples (b) and (c): the aircraft operating states, and the links from behaviour to structure.
// Adapted from the instructor reference model sysml/reference/aerolink_v03_behavior.sysml (Behavior::
// AircraftOperatingStates; perform in the LOG parts; exhibit in PHY-001), reduced so that the file is
// self-contained. The initial state uses the current form "first start then ..." (S10 sl.48, changed 2026-03).
package 'AeroLink W11 Operating States' {
	private import ScalarValues::*;
	package Logical {
		action <'FN-005'> 'Fly passenger trip';
		action <'FN-006'> 'Charge aircraft';
		action <'FN-008'> 'Assess aircraft health';
		part def FlightOperations;
		part def FleetManagement;
		part def MaintenanceManagement;
		part logicalArchitecture {
			part <'LOG-001'> flightOperations : FlightOperations { perform Logical::'FN-005'; }
			part <'LOG-002'> fleetManagement : FleetManagement { perform Logical::'FN-006'; }
			part <'LOG-003'> maintenanceManagement : MaintenanceManagement { perform Logical::'FN-008'; }
		}
	}
	package Behavior {
		attribute def ChargerConnected;
		attribute def DispatchThresholdReached;
		attribute def DispatchRelease;
		attribute def LandedOnPad;
		attribute def NoGoFaultReported;
		attribute def CellOverTemperature;
		attribute def ReturnedToService;
		state def AircraftOperatingStates {
			doc /* Operating states of one eVTOL aircraft over a turnaround cycle (SCN-002, SCN-003, SCN-004). */
			attribute noGoFaultOpen : Boolean;
			first start then onPad;
			state onPad { doc /* On a vertiport pad after landing; passengers deplane. */ }
			state charging { doc /* Connected to a charger (IF-005). */ do Logical::'FN-006'; }
			state dispatchReady { doc /* Charged to the dispatch threshold with no open no-go fault. */ }
			state inFlight { do Logical::'FN-005'; }
			state outOfService { doc /* Withheld from dispatch (SCN-004). */ entry Logical::'FN-008'; }
			transition connectCharger first onPad accept ChargerConnected then charging;
			transition chargeComplete first charging accept DispatchThresholdReached then dispatchReady;
			transition dispatch first dispatchReady accept DispatchRelease if not noGoFaultOpen then inFlight;
			transition land first inFlight accept LandedOnPad then onPad;
			transition overTemperature first charging accept CellOverTemperature then outOfService;
			transition faultBeforeDispatch first dispatchReady accept NoGoFaultReported then outOfService;
			transition faultOnPad first onPad accept NoGoFaultReported then outOfService;
			transition returnToService first outOfService accept ReturnedToService then onPad;
		}
		state aircraftOperatingStates : AircraftOperatingStates;
	}
	package Physical {
		part def EVTOLAircraft;
		part def AeroLinkEnterprise;
		part aeroLink : AeroLinkEnterprise {
			part <'PHY-001'> aircraft : EVTOLAircraft[12] {
				exhibit Behavior::aircraftOperatingStates;
			}
		}
	}
}
