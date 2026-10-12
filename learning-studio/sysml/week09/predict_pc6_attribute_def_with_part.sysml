// Week 9 "predict the checker" item pc6. Predict PASS or FAIL, and the message, before you reveal the recorded result.
package PredictPc6 {
	private import ScalarValues::*;
	part def Charger;
	attribute def ChargerStatus {
		attribute available : Boolean;
		part charger : Charger;
	}
}
