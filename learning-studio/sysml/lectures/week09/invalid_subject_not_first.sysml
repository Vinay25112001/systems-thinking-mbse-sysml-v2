// Week 9 checker calibration listing (fails by design): an actor parameter declared before the subject.
package SubjectFirst {
	part def Kiosk;
	part def Patron;
	requirement <'K-4'> 'Return without help' {
		actor patron : Patron;
		subject kiosk : Kiosk;
	}
}
