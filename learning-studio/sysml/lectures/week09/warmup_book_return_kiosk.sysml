// Week 9 warm-up listing: three declarations about a library's book-return kiosk (unseen context, FICTIONAL). All
// three are accepted by the course checker; only one of them says something the model can evaluate about the kiosk.
package BookReturn {
	private import ISQ::*;
	private import SI::*;

	part def LibraryService {
		attribute openingHours : DurationValue;
	}
	part def ReturnKiosk {
		attribute scanTime : DurationValue;
	}

	requirement <'K-1'> 'Fast returns' {
		doc /* The kiosk shall scan a returned book within 3 s. */
	}

	requirement <'K-2'> 'Fast scanning' {
		doc /* The kiosk shall scan a returned book within 3 s. */
		subject service : LibraryService;
		attribute maxScanTime : DurationValue = 3 [s];
		require constraint { service.openingHours >= maxScanTime }
	}

	requirement <'K-3'> 'Scan time' {
		doc /* The kiosk shall scan a returned book within 3 s. */
		subject kiosk : ReturnKiosk;
		attribute maxScanTime : DurationValue = 3 [s];
		require constraint { kiosk.scanTime <= maxScanTime }
	}
}
