// Week 12 worked example (c): an MOE and an MOP in the model, the requirements that constrain them, the
// verification case that tests the MOP, and the course's measures links. REQ-SYS-005 takes the measured value as an
// in parameter asserted equal to MOP-001, and VER-005 calls the requirement in PassIf (S10 sl.96-97).
// Adapted from the instructor reference model (sysml/reference/aerolink_v04_full.sysml: Context::AeroLinkEnterprise
// 'MOE-001', Logical::Scheduling 'MOP-001', 'REQ-STK-001', 'REQ-SYS-005', 'VER-005' and the #measures dependencies).
// Library: ParametersOfInterestMetadata (#moe, #mop; S10 sl.149). The library marks an attribute as an MOE or an MOP
// but does not say what it measures, so the course records "measures" as a dependency tagged #measures (lab plan C.2
// rule 4; sysml/reference/README.md section 5).
// All values FICTIONAL (teaching values, not real-world data).
package AeroLinkMeasures {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;
	private import ParametersOfInterestMetadata::*;
	private import VerificationCases::*;

	metadata def <measures> MeasuresLink {
		doc /* measures: the client measure (MOE, MOP or TPM attribute) measures the supplier. */
		:> annotatedElement : SysML::Dependency;
	}

	package Context {
		part def AeroLinkEnterprise {
			#moe attribute <'MOE-001'> passengerWaitP90 : DurationValue {
				doc /* Passenger wait (90th percentile): monthly 90th-percentile time from ride confirmation to boarding, all vertiports. Lower is better; threshold 15 min (REQ-STK-001). */
			}
		}
	}

	package Logical {
		part def Scheduling {
			#mop attribute <'MOP-001'> assignmentLatencyP99 : DurationValue {
				doc /* Aircraft assignment latency: time from ride confirmation to aircraft assignment (99th percentile). Lower is better; threshold 60 s (REQ-SYS-005). */
			}
		}
	}

	package Requirements {
		requirement <'REQ-STK-001'> 'Passenger wait to board' {
			doc /* The AeroLink service shall board at least 90 % of passengers in each calendar month within 15 min of their ride confirmation. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute maxWaitP90 : DurationValue = 15 [min];
			require constraint { enterprise.passengerWaitP90 <= maxWaitP90 }
		}
		requirement <'REQ-SYS-005'> 'Aircraft assignment time' {
			doc /* The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation. */
			subject scheduling : Logical::Scheduling;
			in latencyActual : DurationValue;
			attribute maxAssignmentLatency : DurationValue = 60 [s];
			require constraint { latencyActual == scheduling.assignmentLatencyP99 and latencyActual <= maxAssignmentLatency }
		}
	}

	package Verification {
		verification <'VER-005'> 'Aircraft assignment latency test' {
			doc /* Level: subsystem. Environment: operations platform with a replayed peak-hour request profile. Success criterion: 99th percentile of 200 assignments <= 60 s. */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject scheduler : Logical::Scheduling;
			objective {
				doc /* Show that confirmed requests are assigned a dispatch-ready aircraft within 60 s. */
				verify Requirements::'REQ-SYS-005';
			}
			attribute assignmentsMade : Natural;
			attribute measuredLatencyP99 : DurationValue;
			return verdict : VerdictKind = if assignmentsMade < 200 ? VerdictKind::inconclusive else PassIf(Requirements::'REQ-SYS-005'(scheduling = scheduler, latencyActual = measuredLatencyP99));
		}
	}

	package Traceability {
		// REQ-STK-001 reads MOE-001 directly in its constraint; in the reference baseline MOE-001 measures NEED-001,
		// CAP-001 and MGO-005 (not repeated here).
		#measures dependency 'MOP-001 measures REQ-SYS-005' from Logical::Scheduling::'MOP-001' to Requirements::'REQ-SYS-005';
		#measures dependency 'MOP-001 measures MOE-001' from Logical::Scheduling::'MOP-001' to Context::AeroLinkEnterprise::'MOE-001';
	}
}
