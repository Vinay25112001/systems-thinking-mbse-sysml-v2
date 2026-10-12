// Week 9 "predict the checker" item pc2. Predict PASS or FAIL, and the message, before you reveal the recorded result.
package PredictPc2 {
	part def OperationsCenter;
	part def MaintenanceFacility;
	part aeroLink {
		part <'PHY-004'> operationsCenter : OperationsCenter;
		part <'PHY-004'> maintenanceFacility : MaintenanceFacility;
	}
}
