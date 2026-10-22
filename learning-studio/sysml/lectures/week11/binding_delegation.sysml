// Week 11, Session 2 (FICTIONAL): a binding connector delegates the outer port's feature to the part inside that
// produces it, as in the training deck's fuel-tank example (slide 24). The binding asserts equal values; it moves nothing.
package BindingDelegation {
	item def Oxygen;
	port def OxygenPort {
		out item oxygen : Oxygen;
	}
	part def Regulator {
		out item regulatedOxygen : Oxygen;
	}
	part def Manifold {
		port toWard : OxygenPort;
		part regulator : Regulator;
		bind toWard.oxygen = regulator.regulatedOxygen;
	}
}
