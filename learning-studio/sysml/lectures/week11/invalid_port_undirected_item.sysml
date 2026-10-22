// Week 11, Session 1 predict item (FICTIONAL): a port definition whose item has no direction.
package UndirectedPortItem {
	item def Oxygen;
	port def OxygenPort {
		item oxygen : Oxygen;
	}
	part def Manifold {
		port toWard : OxygenPort;
	}
}
