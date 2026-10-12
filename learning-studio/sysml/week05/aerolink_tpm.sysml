// Week 5 micro-lab 1, listing 2 (read-only). A technical performance measure written as typed attributes.
// This is a course teaching representation: SysML v2 has no built-in MOE, MOP or TPM construct.
// Syntax follows the SysML v2 training material, release 2026-08: attribute definitions (S10 sl.9),
// short names (sl.87), redefinition (sl.12), bound values with units (sl.89), ISQ and SI (sl.167-168).
// "objective" is a reserved word in SysML v2 (case objectives), so the feature is named objectiveValue.
// All values are FICTIONAL (instructor reference TPM-001).
package AeroLinkMeasures {
	private import ISQ::*;
	private import SI::*;

	attribute def LowerIsBetterTimeMeasure {
		doc /* Margin against the threshold for a measure where a lower value is better. */
		attribute threshold : DurationValue;
		attribute objectiveValue : DurationValue;
		attribute currentEstimate : DurationValue;
		attribute margin : DurationValue = threshold - currentEstimate;
	}

	part def ChargingSystem {
		attribute <'TPM-001'> chargeTimeToDispatch : LowerIsBetterTimeMeasure;
	}

	part hubChargingSystem : ChargingSystem {
		attribute redefines chargeTimeToDispatch {
			attribute redefines threshold = 20 [min];
			attribute redefines objectiveValue = 15 [min];
			attribute redefines currentEstimate = 18 [min];
		}
	}
}
