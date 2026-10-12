// Self-test (expected: PASS). Syntax follows the SysML v2 Release 2026-08
// training examples "32. Requirements/Requirement Definitions.sysml",
// "Requirement Usages.sysml" and "Requirement Satisfaction.sysml".
package SelfTestValidMinimal {
	private import ISQ::*;
	private import SI::*;

	part def Drone {
		attribute mass : MassValue;
		attribute maxSpeed : SpeedValue;
	}

	requirement def MassLimit {
		doc /* The drone mass shall not exceed the required mass. */
		subject drone : Drone;
		attribute massReqd : MassValue;
		require constraint { drone.mass <= massReqd }
	}

	requirement droneMassLimit : MassLimit {
		subject drone : Drone;
		attribute :>> massReqd = 2[kg];
	}

	part survey : Drone {
		attribute :>> mass = 1.5[kg];
	}

	part 'Design Context' {
		ref surveyDesign :> survey;
		satisfy droneMassLimit by surveyDesign;
	}
}
