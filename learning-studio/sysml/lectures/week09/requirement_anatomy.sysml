// Week 9 teaching listing: the anatomy of a requirement (no domain names). A requirement definition with a subject,
// an attribute and a required constraint, and one requirement usage that binds the limit. Course listing; the pattern
// follows the requirement examples of the SysML v2 specification (7.21) and training deck (slides 86-89).
package RequirementAnatomy {
	private import ISQ::*;
	private import SI::*;

	part def Device {
		attribute responseTime : DurationValue;
	}

	requirement def <'R-1'> ResponseTimeLimit {
		doc /* The device shall respond within the response-time limit. */
		subject device : Device;
		attribute limit : DurationValue;
		require constraint { device.responseTime <= limit }
	}

	requirement <'R-1.1'> quickResponse : ResponseTimeLimit {
		doc /* The device shall respond within 2 s. */
		attribute :>> limit = 2 [s];
	}
}
