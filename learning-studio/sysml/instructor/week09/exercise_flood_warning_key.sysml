// Week 9 applied exercise, instructor key (never shown to students before grading). Unseen case: a coastal
// flood-warning service (FICTIONAL). Tasks 1-3 and the graduate task 5 modeled; task 4 (diagnosis and rewrite) and the
// written explanations are in the marking notes below. Accepted by the course checker.
//
// Marking notes, task 4 (diagnosis and rewrite):
// - REQ-STK-003 names a solution (the county's SMS gateway) where an outcome is needed. Accept EITHER classification
//   when the reason matches the definition used: requirement validation (the requirement does not carry the intent of
//   NEED-001, an early enough warning, and replaces it with a means), or requirement verification (it breaches the
//   design-free, implementation-free characteristic taught in Weeks 2 and 9). Rewrite: an outcome, for example the
//   share of residents reached and the lead time, with no named channel.
// - REQ-SYS-003 leaves its condition unstated (tested on calm days only). Expected classification: requirement
//   verification - the condition is missing, so the requirement is not verifiable as written (this is not system
//   verification, which would test a design against it). Rewrite: state the wind condition, for example winds up to
//   10 m/s, as an assumption or as a reference condition (task 5).
package FloodWarningKey {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;
	private import RequirementDerivation::*;

	part def <'ENT-001'> FloodWarningService {
		attribute residentsWarned60MinBeforeFloodingPercent : Real;
	}
	part def <'STK-001'> CoastalResidents;
	part def GaugeStation {
		attribute reportingInterval : DurationValue;
	}
	part def SirenController {
		attribute activationDelay : DurationValue;
	}
	part def Weather {
		attribute windSpeed : SpeedValue;
	}

	concern <'CON-001'> 'Warning in time to move belongings' {
		subject service : FloodWarningService;
		stakeholder residents : CoastalResidents;
	}

	// Task 1: the need, framing the concern it answers, and the stakeholder requirement derived from it.
	requirement <'NEED-001'> 'Early warning of flooding' {
		doc /* Coastal residents need the flood-warning service to warn them early enough to move people and
		 * belongings to safety before water reaches their street. */
		subject service : FloodWarningService;
		stakeholder residents : CoastalResidents;
		frame 'CON-001';
	}
	requirement <'REQ-STK-001'> 'Residents warned before flooding' {
		doc /* The service shall warn at least 95 % of residents in a flood zone at least 60 min before water
		 * reaches their street. */
		subject service : FloodWarningService;
		attribute minWarnedPercent : Real = 95;
		require constraint { service.residentsWarned60MinBeforeFloodingPercent >= minWarnedPercent }
	}

	// Task 2: two system requirements as usages of one requirement definition.
	requirement def DurationUpperLimit {
		attribute measured : DurationValue;
		attribute limit : DurationValue;
		require constraint { measured <= limit }
	}
	requirement <'REQ-SYS-001'> 'Gauge reporting interval' : DurationUpperLimit {
		doc /* Each river gauge station shall report the water level at intervals of no more than 5 min. */
		subject gauge : GaugeStation;
		attribute :>> measured = gauge.reportingInterval;
		attribute :>> limit = 5 [min];
	}
	requirement <'REQ-SYS-002'> 'Siren activation delay' : DurationUpperLimit {
		doc /* The siren controller shall sound the sirens of a flood zone within 2 min of a warning decision. */
		subject sirens : SirenController;
		attribute :>> measured = sirens.activationDelay;
		attribute :>> limit = 2 [min];
	}

	// Task 3: the two derivation connections.
	#derivation connection 'REQ-STK-001 derives from NEED-001' {
		end #original ::> 'NEED-001';
		end #derive ::> 'REQ-STK-001';
	}
	#derivation connection 'REQ-SYS-002 derives from REQ-STK-001' {
		end #original ::> 'REQ-STK-001';
		end #derive ::> 'REQ-SYS-002';
	}

	// Task 5 (graduate): "audible at 100 m in winds up to 10 m/s" as a gate (an assumption about the weather actor).
	// Key point: the gate makes the requirement say nothing above 10 m/s; the reference reading would instead require
	// audibility measured under 10 m/s conditions. Either is accepted with the matching statement of what satisfy claims.
	requirement <'REQ-SYS-003'> 'Siren audible at 100 m' {
		doc /* The siren controller shall drive each siren so that it is audible 100 m away in winds up to 10 m/s. */
		subject sirens : SirenController;
		actor weather : Weather;
		assume constraint calmEnough { weather.windSpeed <= 10 [m/s] }
		require constraint audible { doc /* Audible at 100 m (measured by the hearing test of the marking notes). */ }
	}
}
