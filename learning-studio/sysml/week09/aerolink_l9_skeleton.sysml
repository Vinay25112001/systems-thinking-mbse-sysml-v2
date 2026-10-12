// Week 9 worked example (c): an L9 model skeleton (model v0.1) for AeroLink, adapted from the instructor reference
// skeleton sysml/reference/aerolink_v01_skeleton.sysml. It keeps the nine L9 packages, declares one example each of
// ENT, EXT, STK, CON, MGO, NEED, CAP and SCN (the other Part I kinds follow in L10-L12), and gives the eight PHY
// elements part definitions and usages with ISQ/SI-typed attributes. Course IDs are short names written as quoted
// (unrestricted) names, <'PHY-001'>. Definitions declare attributes; AeroLink's configuration values and current
// estimates are bound in the usages under aeroLink, so another configuration (e.g. ALT-004) is another usage.
// FICTIONAL VALUES (teaching values from the AeroLink Data Sheet and the instructor baseline): 16 h operating day,
// 6 vertiports (3 hubs, 3 spokes), 12 aircraft, 4 seats, 150 km/h cruise, 12 chargers (6 high-power at hubs),
// current estimates 63.5 dB(A) pad-edge noise (TPM-002) and 18 min charge to dispatch (TPM-001). The grid
// connection limit (TBD-02, U-002) is declared and deliberately left without a value.
package 'AeroLink L9 Model' {
	doc /* AeroLink Urban Mobility, team model v0.1 (L9 skeleton). All values FICTIONAL (teaching values). */
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	package Context {
		doc /* ENT and EXT: the system of interest and its external systems. */
		part def <'ENT-001'> AeroLinkEnterprise {
			attribute operatingDay : DurationValue;
			attribute vertiportCount : Natural;
		}
		part def AirNavigationServiceProvider;
		part def ElectricUtilityGrid;
		part aeroLinkContext {
			ref part systemOfInterest :> Physical::aeroLink;
			part <'EXT-001'> ansp : AirNavigationServiceProvider;
			part <'EXT-002'> utilityGrid : ElectricUtilityGrid;
		}
	}

	package Stakeholders {
		doc /* STK as part definitions; CON as concerns. */
		part def <'STK-005'> 'Vertiport Operators';
		concern <'CON-006'> 'Pad throughput and charging capacity' {
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder vertiportOperators : 'STK-005';
		}
	}

	package Needs {
		doc /* MGO and NEED as requirements; CAP as action definitions. */
		requirement <'MGO-004'> 'Goal: grow capacity in step with demand' {
			doc /* Capacity is added when and where demand needs it, without stranding capital in idle aircraft or chargers. Level: goal. */
			subject enterprise : Context::AeroLinkEnterprise;
		}
		requirement <'NEED-004'> 'Pads not limited by turnaround' {
			doc /* Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder vertiportOperators : Stakeholders::'STK-005';
			frame Stakeholders::'CON-006';
		}
		action def <'CAP-003'> 'Fleet charging management';
	}

	package Requirements {
		doc /* REQ-STK and REQ-SYS: populated in L10 (model v0.2). */
	}

	package Logical {
		doc /* FN, LOG and AI: populated in L10 (model v0.2). */
	}

	package Physical {
		doc /* PHY part definitions, and the physical architecture usage aeroLink (the system of interest). */
		part def EVTOLAircraft {
			attribute seats : Natural;
			attribute cruiseSpeed : SpeedValue;
			attribute padEdgeNoise : SoundPressureLevelValue;
		}
		part def VertiportNetwork {
			attribute sites : Natural;
			attribute hubs : Natural;
			attribute spokes : Natural;
			attribute hubTurnaroundTime : DurationValue;
		}
		part def ChargingSystems {
			attribute installed : Natural;
			attribute highPowerAtHubs : Natural;
			attribute connectionLimit : PowerValue { doc /* TBD-02, pending U-002. */ }
			attribute chargeTimeToDispatch : DurationValue;
		}
		part def OperationsCenter {
			attribute hotStandby : Boolean;
			attribute operatingDay : DurationValue;
		}
		part def MaintenanceFacility {
			attribute batteryWorkshop : Boolean;
			attribute faultReportToFlagTime : DurationValue;
		}
		part def CommunicationsInfrastructure {
			attribute messageLatency : DurationValue;
		}
		part def PassengerBookingPlatform {
			attribute maxPartySize : Natural;
			attribute requestToQuoteTime : DurationValue;
		}
		part def PadFireDetectionSystem {
			attribute alarmTransmissionTime : DurationValue;
		}
		part aeroLink : Context::AeroLinkEnterprise {
			doc /* AeroLink's CP3 baseline configuration (ALT-001). Values and current estimates are bound here, not in the definitions. */
			attribute :>> operatingDay = 16 [h];
			attribute :>> vertiportCount = 6;
			part <'PHY-001'> aircraft : EVTOLAircraft[12] {
				attribute :>> seats = 4;
				attribute :>> cruiseSpeed = 150 [km/h];
				attribute :>> padEdgeNoise = 63.5 [dB] { doc /* A-weighted LAmax, current estimate (TPM-002). */ }
			}
			part <'PHY-002'> vertiports : VertiportNetwork {
				attribute :>> sites = 6;
				attribute :>> hubs = 3;
				attribute :>> spokes = 3;
			}
			part <'PHY-003'> chargingSystems : ChargingSystems {
				attribute :>> installed = 12;
				attribute :>> highPowerAtHubs = 6;
				attribute :>> chargeTimeToDispatch = 18 [min] { doc /* Current estimate (TPM-001). */ }
			}
			part <'PHY-004'> operationsCenter : OperationsCenter {
				attribute :>> hotStandby = true;
				attribute :>> operatingDay = 16 [h];
			}
			part <'PHY-005'> maintenanceFacility : MaintenanceFacility {
				attribute :>> batteryWorkshop = true;
			}
			part <'PHY-006'> communications : CommunicationsInfrastructure;
			part <'PHY-007'> bookingPlatform : PassengerBookingPlatform {
				attribute :>> maxPartySize = 4;
			}
			part <'PHY-008'> padFireDetection : PadFireDetectionSystem;
		}
	}

	package Behavior {
		doc /* SCN as use cases; action flows and states from L11. */
		use case <'SCN-003'> 'Aircraft Charging' {
			subject enterprise : Context::AeroLinkEnterprise;
			actor vertiportOperators : Stakeholders::'STK-005';
		}
	}

	package Verification {
		doc /* VER as verification cases: from L12. */
	}

	package AROU {
		doc /* A, R, O and U as metadata: from L12. */
	}
}
