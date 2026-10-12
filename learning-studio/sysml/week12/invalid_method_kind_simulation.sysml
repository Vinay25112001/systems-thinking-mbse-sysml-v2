// Week 12 teaching listing (intentionally invalid): a team records VER-003, the landing-energy reserve analysis, as
// a "simulation" because SEBoK lists simulation among verification techniques (R23a p.637, p.639). The SysML v2
// library enumeration VerificationMethodKind has four values only: inspect, analyze, demo and test (S06 p.175-176).
// Expected result: the checker rejects line 34 (VerificationMethodKind::simulation does not resolve).
// The fix: kind = VerificationMethodKind::analyze, and say in the doc that the analysis is a simulation.
// Adapted from the instructor reference model (sysml/reference/aerolink_v04_full.sysml: Verification::'VER-003').
// All values FICTIONAL (teaching values, not real-world data).
package AeroLinkMethodKind {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;
	private import VerificationCases::*;

	package Logical {
		part def FlightOperations {
			attribute <'MOP-005'> plannedLandingEnergyFraction : Real;
		}
	}

	package Requirements {
		requirement <'REQ-SYS-003'> 'Planned landing energy reserve' {
			doc /* The flight planning function shall plan every flight so that the aircraft lands with at least 20 % of its usable battery energy remaining. */
			subject flightPlanning : Logical::FlightOperations;
			in fractionActual : Real;
			attribute minLandingEnergyFraction : Real = 0.20;
			require constraint { fractionActual == flightPlanning.plannedLandingEnergyFraction and fractionActual >= minLandingEnergyFraction }
		}
	}

	package Verification {
		verification <'VER-003'> 'Landing energy reserve analysis' {
			doc /* Energy simulation over all vertiport pairs, headwinds to the planning limit and end-of-life battery capacity. */
			@VerificationMethod {
				kind = VerificationMethodKind::simulation;
			}
			subject flightPlanningModel : Logical::FlightOperations;
			objective {
				verify Requirements::'REQ-SYS-003';
			}
			attribute energyModelValidated : Boolean;
			attribute minPlannedLandingEnergy : Real;
			return verdict : VerdictKind = if not energyModelValidated ? VerdictKind::inconclusive else PassIf(Requirements::'REQ-SYS-003'(flightPlanning = flightPlanningModel, fractionActual = minPlannedLandingEnergy));
		}
	}
}
