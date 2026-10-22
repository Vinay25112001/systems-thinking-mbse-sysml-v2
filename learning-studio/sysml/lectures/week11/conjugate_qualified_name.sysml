// Week 11 (FICTIONAL): the two correct ways to type a port by the conjugate of 'Oxygen port'. The shorthand puts the
// tilde outside the quotes; the conjugate's actual name, '~Oxygen port', is declared inside 'Oxygen port' and resolves
// when qualified. Both ports have the same type. The checker accepts the file with no message.
package ConjugateQualified {
	item def Oxygen;
	port def 'Oxygen port' {
		out item oxygen : Oxygen;
	}
	part def WardOutlet {
		port fromManifold : ~'Oxygen port';
	}
	part def SpareOutlet {
		port fromManifold : 'Oxygen port'::'~Oxygen port';
	}
}
