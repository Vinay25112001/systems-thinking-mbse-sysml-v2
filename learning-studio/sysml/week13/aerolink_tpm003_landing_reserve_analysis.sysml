// Week 13 worked example (a): an analysis case that computes TPM-003 (landing energy reserve) and compares it with REQ-SYS-003.
// Adapted from the instructor reference model (sysml/reference/aerolink_v04_full.sysml: Logical::FlightOperations with
// MOP-005, Requirements::'REQ-SYS-003', Measures::'TPM-003') and the SysML v2 training material, release 2026-08:
// analysis case definitions and usages (S10 sl.92-94). Changes from the reference: the TPM-003 estimate is computed by
// an analysis case instead of being written as a number, and the margin is an expression instead of a stored value.
// The energy inputs (120 kWh usable at beginning of life, 92 % retained at end of life, 400 kW for 6 min of terminal
// phases, 270 kW for 10 min of cruise) are NEW FICTIONAL teaching values chosen so that the result reproduces the
// reference estimate of 23 %; they are not aircraft data. The checker does not evaluate any of the expressions.
package AeroLinkLandingReserveAnalysis {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	package Logical {
		part def FlightOperations {
			attribute <'MOP-005'> plannedLandingEnergyFraction : Real;
		}
	}

	package Requirements {
		requirement <'REQ-SYS-003'> 'Planned landing energy reserve' {
			doc /* The flight planning function shall plan every flight so that the aircraft lands with at least 20 % of its usable battery energy remaining. */
			subject flightPlanning : Logical::FlightOperations;
			attribute minLandingEnergyFraction : Real = 0.20;
			require constraint { flightPlanning.plannedLandingEnergyFraction >= minLandingEnergyFraction }
		}
	}

	package Analysis {
		calc def TripEnergy {
			in terminalPower : PowerValue;
			in terminalTime : DurationValue;
			in cruisePower : PowerValue;
			in cruiseTime : DurationValue;
			return energy : EnergyValue = terminalPower * terminalTime + cruisePower * cruiseTime;
		}
		calc def LandingEnergyFraction {
			in usableEnergy : EnergyValue;
			in tripEnergy : EnergyValue;
			return fraction : Real = (usableEnergy - tripEnergy) / usableEnergy;
		}
		analysis def LandingReserveAnalysis {
			subject flightPlanning : Logical::FlightOperations;
			objective landingReserveObjective {
				doc /* Determine whether the planned landing energy on the 25 km design trip, at end-of-life usable energy, meets the minimum landing fraction. */
				assume constraint { capacityRetainedEOL > 0.0 and capacityRetainedEOL <= 1.0 }
				require constraint { landingFraction >= minimumFraction }
			}
			in attribute minimumFraction : Real;
			in attribute usableEnergyBOL : EnergyValue;
			in attribute capacityRetainedEOL : Real;
			in attribute terminalPower : PowerValue;
			in attribute terminalTime : DurationValue;
			in attribute cruisePower : PowerValue;
			in attribute cruiseTime : DurationValue;
			attribute usableEnergyEOL : EnergyValue = usableEnergyBOL * capacityRetainedEOL;
			calc tripEnergy : TripEnergy {
				in terminalPower = LandingReserveAnalysis::terminalPower;
				in terminalTime = LandingReserveAnalysis::terminalTime;
				in cruisePower = LandingReserveAnalysis::cruisePower;
				in cruiseTime = LandingReserveAnalysis::cruiseTime;
			}
			return landingFraction : Real = LandingEnergyFraction(usableEnergyEOL, tripEnergy.energy);
		}
	}

	part landingReserveContext {
		part flightOperations : Logical::FlightOperations {
			attribute :>> plannedLandingEnergyFraction = designTripAnalysis.landingFraction;
		}
		analysis designTripAnalysis : Analysis::LandingReserveAnalysis {
			subject flightPlanning = flightOperations;
			in minimumFraction = Requirements::'REQ-SYS-003'.minLandingEnergyFraction;
			in usableEnergyBOL = 120 [kW * h];
			in capacityRetainedEOL = 0.92;
			in terminalPower = 400 [kW];
			in terminalTime = 6 [min];
			in cruisePower = 270 [kW];
			in cruiseTime = 10 [min];
		}
		attribute <'TPM-003'> landingReserveMargin : Real = designTripAnalysis.landingFraction - Requirements::'REQ-SYS-003'.minLandingEnergyFraction;
		satisfy Requirements::'REQ-SYS-003' by flightOperations;
	}
}
