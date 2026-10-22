// Week 11 calibration (FICTIONAL): the flow runs from the outlet's in item to the supply's out item, against the
// directions of both ports. The checker accepts the file with no message.
package FlowWrongDirection {
	item def Oxygen;
	port def OxygenPort {
		out item oxygen : Oxygen;
	}
	interface def OxygenLine {
		end port supply : OxygenPort;
		end port outlet : ~OxygenPort;
		flow outlet.oxygen to supply.oxygen;
	}
}
