// Week 10 worked example (a): a requirement definition used as a template, three requirement usages with
// subject, doc text, required constraint and the course ID as short name, and a requirement group.
// Adapted from the instructor reference model (sysml/reference/aerolink_v02_req_structure.sysml: REQ-SYS-005,
// REQ-SYS-008, REQ-SYS-009 and the part defs that own the measured attributes) and the SysML v2 training
// material, release 2026-08 (S10 sl.86-90). Template pattern: SysML v2.1 Beta 2 (S06) 7.21.1 (MaximumMass).
// The reference model writes each requirement without a definition; this listing factors out the shared
// "latency within a limit" constraint. Requirement text and values are the reference ones. FICTIONAL values.
package AeroLinkLatencyRequirements {
	private import ISQ::*;
	private import SI::*;

	part def Scheduling { attribute assignmentLatencyP99 : DurationValue; }
	part def MaintenanceManagement { attribute noGoFlagLatency : DurationValue; }
	part def PadFireDetectionSystem { attribute alarmTransmissionTime : DurationValue; }

	requirement def LatencyLimit {
		doc /* The measured latency shall be less than or equal to the latency limit. */
		attribute latency : DurationValue;
		attribute latencyLimit : DurationValue;
		require constraint { latency <= latencyLimit }
	}

	requirement <'REQ-SYS-005'> 'Aircraft assignment time' : LatencyLimit {
		doc /* The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride
		     * requests within 60 s of confirmation. */
		subject scheduling : Scheduling;
		attribute :>> latency = scheduling.assignmentLatencyP99;
		attribute :>> latencyLimit = 60 [s];
	}

	requirement <'REQ-SYS-008'> 'No-go fault flag time' : LatencyLimit {
		doc /* The maintenance management function shall mark an aircraft unavailable for dispatch within 2 min
		     * of a no-go fault being reported. */
		subject maintenanceManagement : MaintenanceManagement;
		attribute :>> latency = maintenanceManagement.noGoFlagLatency;
		attribute :>> latencyLimit = 2 [min];
	}

	requirement <'REQ-SYS-009'> 'Fire alarm transmission' : LatencyLimit {
		doc /* The vertiport fire detection system shall transmit a battery-fire alarm to the emergency services
		     * dispatch centre within 30 s of detection. */
		subject fireDetection : PadFireDetectionSystem;
		attribute :>> latency = fireDetection.alarmTransmissionTime;
		attribute :>> latencyLimit = 30 [s];
	}

	requirement latencyRequirements {
		doc /* Requirement group (by reference) of the three latency requirements, for organisation. Each member
		     * declares its own subject and the group declares none. No single element conforms to all three
		     * subjects, so this group is never satisfied as a whole: satisfy its members. */
		require 'REQ-SYS-005';
		require 'REQ-SYS-008';
		require 'REQ-SYS-009';
	}
}
