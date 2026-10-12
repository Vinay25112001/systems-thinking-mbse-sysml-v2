// Week 10 teaching listing (INTENTIONALLY INVALID). One line types a port wrongly. Find it before the commentary.
// The course-designated checker must reject this file. Compare with aerolink_ports_interfaces.sysml.
package AeroLinkChargeSessionDraft {
	private import ISQ::*;
	private import ScalarValues::*;

	item def <'INFO-003'> 'Maintenance Data' {
		attribute noGoFaultOpen : Boolean;
		attribute chargedEnergy : EnergyValue;
	}
	part def ChargingSystems {
		port sessionDataOut : 'INFO-003';
	}
}
