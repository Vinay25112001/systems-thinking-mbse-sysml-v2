// Week 11 applied exercise, task 4: the draft students review (FICTIONAL water-kiosk case). The course checker accepts
// it; it contains defects only a reviewer can find.
package 'W11 Exercise Draft' {
	item def PaymentRequest;
	item def PaymentConfirmation;
	item def SalesRecords;
	port def PaymentPort {
		out item paymentRequest : PaymentRequest;
		in item paymentConfirmation : PaymentConfirmation;
	}
	port def SalesPort {
		out item salesRecords : SalesRecords;
	}
	interface def PaymentLink {
		end port kioskSide : PaymentPort;
		end port moneySide : PaymentPort;
	}
	interface def SalesLink {
		end port kioskSide : SalesPort;
		end port appSide : ~SalesPort;
		flow appSide.salesRecords to kioskSide.salesRecords;
	}
	part def KioskDispenser {
		port toMobileMoney : PaymentPort;
		port toApp : SalesPort;
	}
	part def MobileMoneyService {
		port toKiosk : PaymentPort;
	}
	part def OperationsApp {
		port fromKiosk : ~SalesPort;
	}
}
