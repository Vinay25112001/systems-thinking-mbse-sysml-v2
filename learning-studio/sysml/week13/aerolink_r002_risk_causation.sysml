// Week 13 worked example (d): R-002 as library risk metadata, and its cause-effect chain as causation connections.
// Adapted from the instructor reference model (sysml/reference/aerolink_v04_full.sysml: metadata <'R-002'>, which uses
// the course's CourseRisk :> Risk with the 5 x 5 rating) and the SysML v2 training material, release 2026-08: risk and
// modelling metadata (S10 sl.147-148) and the cause-and-effect domain library (S10 sl.158-159).
// Changes from the reference: only the library Risk metadata is used (the 5 x 5 likelihood and consequence stay in the
// reference's CourseRisk); totalRisk carries the reference's values (probability 0.6 and impact 0.8, i.e. likelihood 3
// and consequence 4 divided by 5, a course mapping, not a library rule); the R-002 condition-if-then statement is
// modelled as two causation connections between occurrences. All values FICTIONAL (teaching values).
package AeroLinkRiskCausation {
	private import ScalarValues::*;
	private import RiskMetadata::*;
	private import ModelingMetadata::*;
	private import CauseAndEffect::*;

	part def FlightOperations {
		attribute <'MOP-005'> plannedLandingEnergyFraction : Real;
	}
	part flightOperations : FlightOperations;

	requirement <'REQ-SYS-003'> 'Planned landing energy reserve' {
		subject flightPlanning : FlightOperations;
		attribute minLandingEnergyFraction : Real = 0.20;
		require constraint { flightPlanning.plannedLandingEnergyFraction >= minLandingEnergyFraction }
	}
	attribute <'TPM-003'> landingReserveMargin : Real;

	metadata <'R-002'> 'Battery capacity fade under fast charging' : Risk about 'REQ-SYS-003', 'TPM-003', flightOperations {
		totalRisk = new RiskLevel(probability = 0.6, impact = 0.8);
	}

	occurrence def Situation;
	#cause occurrence capacityFade : Situation {
		doc /* Usable pack capacity fades by more than 10 % before the planned pack replacement (fade rate known only from assumed supplier data, A-004). */
	}
	occurrence reserveShortfall : Situation {
		doc /* The planned landing energy on the 25 km design trip falls below 20 % of usable energy (REQ-SYS-003 cannot be held). */
	}
	#effect occurrence flightsShortened : Situation {
		doc /* Flights are shortened or cancelled to protect the reserve. */
	}

	#causation connection fadeToShortfall connect capacityFade to reserveShortfall {
		metadata CausationMetadata { isNecessary = false; isSufficient = true; }
	}
	#causation connection shortfallToShortenedFlights connect reserveShortfall to flightsShortened;

	metadata StatusInfo about fadeToShortfall { status = StatusKind::tbc; owner = "Fleet Engineering Lead"; }
}
