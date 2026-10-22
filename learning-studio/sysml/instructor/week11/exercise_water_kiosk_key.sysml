// Week 11 applied exercise: instructor key (NOT for students; never bundled into the app). Rural water-kiosk case
// (FICTIONAL). Task 1: the physical elements and components as parts with their IDs. Task 2: the pump-to-tank interface
// with one port definition, the conjugate on the tank end, a flow and the interface usage. Task 3: the logical element
// allocated to the pump station with the nested allocation of its function. Task 4 (the draft's two defects, corrected
// here): the payment link's second end and the money service's port use the conjugate; the sales flow runs from the
// kiosk to the app. Task 5: the satisfy claim with its design value and basis; the interface requirement allocated to its
// interface and to the function that realizes it. Marking notes are in the assessment rubric
// (src/content/week11Assessment.ts); any equivalent model that keeps the meaning earns full marks.
// Required core and extension (Week 11 review m3; faculty item): what a student can produce in the 50 minutes is the
// REQUIRED CORE below: the part definitions as one-line declarations, the part usages with IDs and nested components
// (task 1), WaterPort, WaterLine and IF-001 (task 2), the allocation with its nested allocation (task 3), and the satisfy
// with its design value and the two requirement allocations (task 5). Task 4 is answered in prose; the corrected
// payment and sales interfaces, IF-002 to IF-004, the Logical package and the requirement texts are the EXTENSION: given
// so the key is a complete checked model, never expected in the 50 minutes and never marked down when absent.
package 'W11 Exercise Water Kiosk Key' {
	private import ScalarValues::*;
	item def Water;
	item def PaymentRequest;
	item def PaymentConfirmation;
	item def SalesRecords;
	// EXTENSION: context the tasks give in the table (not written by students)
	package Logical {
		action <'FN-001'> 'Pump water' {
			out water : Water;
		}
		action <'FN-002'> 'Sell water';
		action <'FN-003'> 'Record sales' {
			out salesRecords : SalesRecords;
		}
		part def 'Water supply';
		part def 'Sales';
		part logicalArchitecture {
			part <'LOG-001'> waterSupply : 'Water supply' {
				perform Logical::'FN-001';
			}
			part <'LOG-002'> sales : 'Sales' {
				perform Logical::'FN-002';
				perform Logical::'FN-003';
			}
		}
	}
	// EXTENSION: the requirement texts are given; REQUIRED CORE only the attribute the satisfy claim binds (task 5)
	package Requirements {
		requirement <'REQ-SYS-001'> 'Tank capacity' {
			doc /* The storage tank shall hold at least 5000 L of treated water. */
			subject storageTank : Physical::'Storage tank';
			attribute minCapacityLitres : Real = 5000.0;
			require constraint { storageTank.capacityLitres >= minCapacityLitres }
		}
		requirement <'REQ-SYS-002'> 'Daily sales upload' {
			doc /* The kiosk shall send each day's sales records to the operations app over IF-002 within 1 h of closing. */
			subject salesLink : Physical::SalesLink;
		}
	}
	package Physical {
		// REQUIRED CORE (task 1): one-line part definitions
		part def 'Solar pump station';
		part def 'Solar array';
		part def 'Submersible pump';
		part def 'Storage tank' {
			attribute capacityLitres : Real;
		}
		part def 'Kiosk dispenser';
		part def 'Operations app';
		part def 'Mobile money service';
		// REQUIRED CORE (task 2)
		port def WaterPort {
			out item water : Water;
		}
		// EXTENSION (task 4 corrections, answered in prose; and IF-002, IF-003)
		port def PaymentPort {
			out item paymentRequest : PaymentRequest;
			in item paymentConfirmation : PaymentConfirmation;
		}
		port def SalesPort {
			out item salesRecords : SalesRecords;
		}
		interface def WaterLine {
			end port pumpSide : WaterPort;
			end port tankSide : ~WaterPort;
			flow pumpSide.water to tankSide.water;
		}
		interface def PaymentLink {
			end port kioskSide : PaymentPort;
			end port moneySide : ~PaymentPort;
			flow kioskSide.paymentRequest to moneySide.paymentRequest;
			flow moneySide.paymentConfirmation to kioskSide.paymentConfirmation;
		}
		interface def SalesLink {
			end port kioskSide : SalesPort;
			end port appSide : ~SalesPort;
			flow kioskSide.salesRecords to appSide.salesRecords;
		}
		// REQUIRED CORE (tasks 1, 2, 3): elements, components, the IF-001 ports and usage; the other ports are EXTENSION
		part physicalArchitecture {
			// EXTENSION
			ref part mobileMoneyService : 'Mobile money service' {
				port toKiosk : ~PaymentPort;
			}
			part <'PHY-001'> solarPumpStation : 'Solar pump station' {
				part <'CMP-001'> solarArray : 'Solar array';
				part <'CMP-002'> submersiblePump : 'Submersible pump';
				port toTank : WaterPort;
				perform Logical::'FN-001';
			}
			part <'PHY-002'> storageTank : 'Storage tank' {
				attribute :>> capacityLitres = 6000.0;
				port fromPump : ~WaterPort;
			}
			part <'PHY-003'> kioskDispenser : 'Kiosk dispenser' {
				port toMobileMoney : PaymentPort;
				port toApp : SalesPort;
				perform Logical::'FN-002';
				perform Logical::'FN-003';
			}
			part <'PHY-004'> operationsApp : 'Operations app' {
				port fromKiosk : ~SalesPort;
			}
			interface <'IF-001'> waterLine : WaterLine connect solarPumpStation.toTank to storageTank.fromPump;
			// EXTENSION: IF-002 to IF-004
			interface <'IF-002'> salesLink : SalesLink connect kioskDispenser.toApp to operationsApp.fromKiosk;
			interface <'IF-003'> paymentLink : PaymentLink connect kioskDispenser.toMobileMoney to mobileMoneyService.toKiosk;
			connection <'IF-004'> maintenanceAgreement connect operationsApp to solarPumpStation {
				doc /* Organizational interface: the pump supplier's maintenance agreement. Nothing flows. */
			}
		}
		// REQUIRED CORE (task 3)
		allocate Logical::logicalArchitecture.waterSupply to physicalArchitecture.solarPumpStation {
			allocate Logical::logicalArchitecture.waterSupply.'FN-001' to physicalArchitecture.solarPumpStation.'FN-001';
		}
		// REQUIRED CORE (task 5)
		allocate Requirements::'REQ-SYS-002' to physicalArchitecture.salesLink;
		allocate Requirements::'REQ-SYS-002' to Logical::'FN-003';
		satisfy Requirements::'REQ-SYS-001' by physicalArchitecture.storageTank { doc /* Basis: the tank supplier's data sheet gives 6000 L usable volume. */ }
	}
}
