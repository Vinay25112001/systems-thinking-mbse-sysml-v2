// Week 9 "predict the checker" item pc1. Predict PASS or FAIL, and the message, before you reveal the recorded result.
package PredictPc1 {
	part def ChargingSystems;
	part aeroLink {
		part <'PHY-003'> chargingSystems : ChargingSystems;
	}
	part hubCharging :> aeroLink.PHY-003;
}
