// Week 11 calibration (FICTIONAL): a connection that names nested ports with :: instead of dot notation.
package QualifiedNotDot {
	item def Oxygen;
	port def OxygenPort {
		out item oxygen : Oxygen;
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
		interface hospitalSupply::manifold::toWard to hospitalSupply::wardOutlet::fromManifold;
	}
}
