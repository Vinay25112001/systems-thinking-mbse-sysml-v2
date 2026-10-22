// Week 11, Session 1 driving question (FICTIONAL): a hospital oxygen supply. Both ports are typed by the same port
// definition, so both offer oxygen out and neither takes it in. The checker accepts the file with no message.
package OxygenSupplyTwoPorts {
	item def Oxygen;
	port def OxygenPort {
		out item oxygen : Oxygen;
	}
	interface def OxygenLine {
		end port supply : OxygenPort;
		end port outlet : OxygenPort;
		flow supply.oxygen to outlet.oxygen;
	}
	part def Manifold {
		port toWard : OxygenPort;
	}
	part def WardOutlet {
		port fromManifold : OxygenPort;
	}
	part hospitalSupply {
		part manifold : Manifold;
		part wardOutlet : WardOutlet;
		interface line : OxygenLine connect manifold.toWard to wardOutlet.fromManifold;
	}
}
// The corrected version: the outlet end and the outlet's port use the conjugate, so the oxygen that goes out of the
// manifold's port comes in at the outlet's port.
package OxygenSupplyConjugated {
	item def Oxygen;
	port def OxygenPort {
		out item oxygen : Oxygen;
	}
	interface def OxygenLine {
		end port supply : OxygenPort;
		end port outlet : ~OxygenPort;
		flow supply.oxygen to outlet.oxygen;
	}
	part def Manifold {
		port toWard : OxygenPort;
	}
	part def WardOutlet {
		port fromManifold : ~OxygenPort;
	}
	part hospitalSupply {
		part manifold : Manifold;
		part wardOutlet : WardOutlet;
		interface line : OxygenLine connect manifold.toWard to wardOutlet.fromManifold;
	}
}
