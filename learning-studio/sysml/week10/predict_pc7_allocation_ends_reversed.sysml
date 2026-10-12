// Week 10 predict-the-checker item pc7. Predict the outcome before you reveal the recorded result.
package PredictPc7 {
	part def LogicalElement;
	part def PhysicalElement;
	part def FleetManagement :> LogicalElement;
	part def ChargingSystems :> PhysicalElement;
	allocation def LogicalToPhysical {
		end logical : LogicalElement;
		end physical : PhysicalElement;
	}
	part logicalArchitecture { part <'LOG-002'> fleetManagement : FleetManagement; }
	part aeroLink { part <'PHY-003'> chargingSystems : ChargingSystems; }
	allocation 'LOG-002 allocated-to PHY-003' : LogicalToPhysical
		allocate aeroLink.'PHY-003' to logicalArchitecture.'LOG-002';
}
