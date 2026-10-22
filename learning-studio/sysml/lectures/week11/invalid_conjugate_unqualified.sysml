// Week 11 calibration (FICTIONAL): the conjugate's actual name, '~Oxygen port', used without qualification. The name
// is declared inside 'Oxygen port' (every port definition declares its conjugate there), so here it does not resolve.
package ConjugateUnqualified {
	item def Oxygen;
	port def 'Oxygen port' {
		out item oxygen : Oxygen;
	}
	part def WardOutlet {
		port fromManifold : '~Oxygen port';
	}
}
