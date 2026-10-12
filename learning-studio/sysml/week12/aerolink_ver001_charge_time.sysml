// Week 12 worked example (b): VER-001 as a SysML v2 verification case for REQ-SYS-001.
// Adapted from the instructor reference model (sysml/reference/aerolink_v04_full.sysml: Physical::ChargingSystems,
// Requirements::'REQ-SYS-001', Verification::'VER-001') and the SysML v2 training material, release 2026-08:
// verification case definitions and usages (S10 sl.96-98). Semantics: SysML v2.1 Beta 2 (S06) 7.24.
// Changes from the reference: REQ-SYS-001 takes the measured value as an in parameter, asserted equal to the
// subject's MOP-002 feature, and the verdict calls the requirement in PassIf (the S10 sl.96-97 pattern), so the
// comparison is written once, in the requirement; the procedure is a verification definition and VER-001 is a usage
// of it (S10 sl.98); the planned sample size is bound in the usage; the error verdict is computed from a recorded flag.
// All values FICTIONAL (teaching values, not real-world data).
package AeroLinkVerificationCase {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;
	private import VerificationCases::*;

	package Physical {
		part def ChargingSystems {
			attribute <'MOP-002'> chargeTimeToDispatch : DurationValue;
		}
	}

	package Requirements {
		requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
			doc /* The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min. */
			subject chargingSystem : Physical::ChargingSystems;
			in chargeTimeActual : DurationValue;
			attribute maxChargeTime : DurationValue = 20 [min];
			require constraint { chargeTimeActual == chargingSystem.chargeTimeToDispatch and chargeTimeActual <= maxChargeTime }
		}
	}

	package Verification {
		verification def ChargeTimeTest {
			doc /* Timed charges of a charger under test, each started from the 20 % reserve, checked against REQ-SYS-001. */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject testCharger : Physical::ChargingSystems;
			objective {
				doc /* Show that the charger restores an aircraft from the 20 % reserve to the dispatch threshold within the required time. */
				verify Requirements::'REQ-SYS-001';
			}
			attribute plannedCharges : Natural;
			// Recorded results, bound when the test has been run.
			attribute procedureFollowed : Boolean;
			attribute validCharges : Natural;
			attribute maxMeasuredChargeTime : DurationValue;
			return verdict : VerdictKind =
				if not procedureFollowed ? VerdictKind::error
				else if validCharges < plannedCharges ? VerdictKind::inconclusive
				else PassIf(Requirements::'REQ-SYS-001'(chargingSystem = testCharger, chargeTimeActual = maxMeasuredChargeTime));
		}

		part hubChargerUnderTest : Physical::ChargingSystems;

		verification <'VER-001'> 'Turnaround charge-time test' : ChargeTimeTest {
			doc /* Level: system. Environment: hub vertiport, ambient 0-35 C, aircraft connected over IF-005. Success criterion: all 30 charges from 20 % (+0/-1 %) state of charge reach the dispatch threshold in <= 20.0 min. */
			subject testCharger :> hubChargerUnderTest;
			attribute :>> plannedCharges = 30;
		}
	}
}
