// Week 9 "predict the checker" item pc7. Predict PASS or FAIL, and the message, before you reveal the recorded result.
package PredictPc7 {
	private import ScalarValues::*;
	attribute def ReadinessAssessment {
		attribute trl : Natural;
	}
	part def HighPowerCharger {
		part readiness : ReadinessAssessment;
	}
}
