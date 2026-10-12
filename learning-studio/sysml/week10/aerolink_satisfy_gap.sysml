// Week 10 worked example (d): recording satisfy gaps instead of asserting what the model cannot support.
// WHAT-IF VARIANT of the instructor reference design (not the reference): the charger supplier's estimate rises to
// 24 min (the Week 9 what-if), and a team whose CP3 architecture has no fire-detection element (no PHY-008).
// Requirements, IDs and text are the reference ones (sysml/reference/aerolink_v02_req_structure.sysml).
// Status and issue annotations use the standard library ModelingMetadata (StatusInfo, Issue), as the reference
// model does for TBDs. Course convention (Week 10): a satisfy gap is no satisfy usage plus an @Issue whose text
// starts "SATISFY GAP" and names the candidate, the evidence, the action and the owner. All values FICTIONAL.
package AeroLinkSatisfyGaps {
	private import ISQ::*;
	private import SI::*;
	private import ModelingMetadata::*;

	part def ChargingSystems { attribute chargeTimeToDispatch : DurationValue; }
	part def PadFireDetectionSystem { attribute alarmTransmissionTime : DurationValue; }

	part aeroLink {
		part <'PHY-003'> chargingSystems : ChargingSystems {
			attribute :>> chargeTimeToDispatch = 24 [min]; // WHAT-IF supplier estimate (FICTIONAL)
		}
		// No PHY-008 in this team's architecture.
	}

	requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
		doc /* The charging system shall charge an aircraft from any landing state of charge at or above the
		     * 20 % reserve to the dispatch threshold within 20 min. */
		subject chargingSystem : ChargingSystems;
		attribute maxChargeTime : DurationValue = 20 [min];
		require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
		@StatusInfo { status = StatusKind::open; owner = "Fleet energy lead"; }
		@Issue { text = "SATISFY GAP: candidate PHY-003 (charging systems). Evidence: supplier estimate 24 min > 20 min (TPM-001). Not asserted. Action: re-plan charger power or reopen REQ-STK-005 with the stakeholder (R-001). Owner: fleet energy lead."; }
	}

	requirement <'REQ-SYS-009'> 'Fire alarm transmission' {
		doc /* The vertiport fire detection system shall transmit a battery-fire alarm to the emergency services
		     * dispatch centre within 30 s of detection. */
		subject fireDetection : PadFireDetectionSystem;
		attribute maxTransmissionTime : DurationValue = 30 [s];
		require constraint { fireDetection.alarmTransmissionTime <= maxTransmissionTime }
		@StatusInfo { status = StatusKind::open; owner = "Vertiport safety lead"; }
		@Issue { text = "SATISFY GAP: no design element of type PadFireDetectionSystem in the architecture. Not asserted. Action: add PHY-008 and IF-007 at CP4 or record the decision. Owner: vertiport safety lead."; }
	}
}
