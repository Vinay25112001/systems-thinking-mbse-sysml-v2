// Week 11 calibration (FICTIONAL): the interface definition's second end is typed by the conjugate, but the port it
// connects at the outlet is typed by the plain port definition. The definition's conjugate end does not make the
// outlet's port match: both connected ports still offer the oxygen out. The checker accepts the file with no message.
package ConjugateEndUnprotected {
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
		port fromManifold : OxygenPort;
	}
	part hospitalSupply {
		part manifold : Manifold;
		part wardOutlet : WardOutlet;
		interface line : OxygenLine connect manifold.toWard to wardOutlet.fromManifold;
	}
}
