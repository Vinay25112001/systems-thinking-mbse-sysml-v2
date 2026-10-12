// Week 10 worked example (c): satisfy and allocate side by side on the charging thread.
// Adapted from the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml: REQ-SYS-001,
// REQ-SYS-006, FN-006, FN-007, FN-009, LOG-002, PHY-003, PHY-004, their perform, satisfy and allocation lines) and
// the SysML v2 training material, release 2026-08: requirement satisfaction (S10 sl.91), allocation (sl.106).
// Semantics of satisfy: SysML v2.1 Beta 2 (S06) 7.21.4. Course link types realised as in the reference:
// LOG performs FN = perform; REQ/FN/LOG allocated-to = allocation ... allocate; PHY/LOG satisfies REQ = satisfy.
// All values FICTIONAL.
package AeroLinkSatisfyAllocate {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	package Logical {
		action <'FN-006'> 'Charge aircraft';
		action <'FN-007'> 'Control vertiport charging power';
		action <'FN-009'> 'Manage fleet availability';
		part def FleetManagement { attribute fleetAvailability : Real; }
		part logicalArchitecture {
			part <'LOG-002'> fleetManagement : FleetManagement {
				perform Logical::'FN-006';
				perform Logical::'FN-007';
				perform Logical::'FN-009';
			}
		}
	}

	package Physical {
		part def ChargingSystems { attribute chargeTimeToDispatch : DurationValue; }
		part def OperationsCenter;
		part aeroLink {
			part <'PHY-003'> chargingSystems : ChargingSystems {
				attribute :>> chargeTimeToDispatch = 18 [min]; // current estimate (TPM-001, FICTIONAL)
			}
			part <'PHY-004'> operationsCenter : OperationsCenter;
		}
	}

	package Requirements {
		requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
			doc /* The charging system shall charge an aircraft from any landing state of charge at or above the
			     * 20 % reserve to the dispatch threshold within 20 min. */
			subject chargingSystem : Physical::ChargingSystems;
			attribute maxChargeTime : DurationValue = 20 [min];
			require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
		}
		requirement <'REQ-SYS-006'> 'Fleet availability' {
			doc /* The fleet shall achieve an availability of at least 90 % of scheduled aircraft-hours in each
			     * calendar month. */
			subject fleet : Logical::FleetManagement;
			attribute minAvailability : Real = 0.90;
			require constraint { fleet.fleetAvailability >= minAvailability }
		}
	}

	package Traceability {
		// satisfy: asserts that the requirement is satisfied when its subject is bound to the design element.
		satisfy Requirements::'REQ-SYS-001' by Physical::aeroLink.'PHY-003';
		satisfy Requirements::'REQ-SYS-006' by Logical::logicalArchitecture.'LOG-002';
		// allocate: responsibility for realising the source is assigned to the target.
		allocation 'REQ-SYS-001 allocated-to FN-006' allocate Requirements::'REQ-SYS-001' to Logical::'FN-006';
		allocation 'FN-006 allocated-to PHY-003' allocate Logical::'FN-006' to Physical::aeroLink.'PHY-003';
		allocation 'FN-007 allocated-to PHY-003' allocate Logical::'FN-007' to Physical::aeroLink.'PHY-003';
		allocation 'FN-009 allocated-to PHY-004' allocate Logical::'FN-009' to Physical::aeroLink.'PHY-004';
		allocation 'LOG-002 allocated-to PHY-003' allocate Logical::logicalArchitecture.'LOG-002' to Physical::aeroLink.'PHY-003';
		allocation 'LOG-002 allocated-to PHY-004' allocate Logical::logicalArchitecture.'LOG-002' to Physical::aeroLink.'PHY-004';
	}
}
