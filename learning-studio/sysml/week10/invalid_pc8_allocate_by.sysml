// Week 10 predict-the-checker item pc8. Predict the outcome before you reveal the recorded result.
package PredictPc8 {
	part def ChargingSystems;
	action <'FN-006'> 'Charge aircraft';
	part aeroLink { part <'PHY-003'> chargingSystems : ChargingSystems; }
	allocation 'FN-006 allocated-to PHY-003' allocate 'FN-006' by aeroLink.'PHY-003';
}
