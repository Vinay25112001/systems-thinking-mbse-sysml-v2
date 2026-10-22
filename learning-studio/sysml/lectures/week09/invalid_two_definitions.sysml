// Week 9 checker calibration listing (fails by design): one requirement usage typed by two requirement definitions.
package TwoDefinitions {
	requirement def ScanTimeLimit;
	requirement def AvailabilityLimit;
	requirement <'K-5'> 'Kiosk service level' : ScanTimeLimit, AvailabilityLimit;
}
