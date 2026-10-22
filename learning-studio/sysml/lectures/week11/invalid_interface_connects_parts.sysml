// Week 11 calibration (FICTIONAL): an interface usage that connects two parts instead of their ports.
package InterfaceConnectsParts {
	item def Oxygen;
	port def OxygenPort {
		out item oxygen : Oxygen;
	}
	interface def OxygenLine {
		end port supply : OxygenPort;
		end port outlet : ~OxygenPort;
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
		interface line : OxygenLine connect manifold to wardOutlet;
	}
}
