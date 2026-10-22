// Week 11 calibration (FICTIONAL): an interface definition whose ends are parts, not ports.
package InterfacePartEnds {
	part def Manifold;
	part def WardOutlet;
	interface def OxygenLine {
		end part supply : Manifold;
		end part outlet : WardOutlet;
	}
}
