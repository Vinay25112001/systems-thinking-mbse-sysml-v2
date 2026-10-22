// Week 11, Session 2 (FICTIONAL): an interface requirement written with the interface definition as its subject,
// allocated to the interface usage and to the function that realizes it, as the lab tool writes one for a team.
package InterfaceRequirement {
	item def <'INFO-021'> 'Low-pressure alarm';
	port def 'Alarm link port' {
		out item lowPressureAlarm : 'INFO-021';
	}
	interface def 'Alarm link' {
		end port manifold : 'Alarm link port';
		end port nursesStation : ~'Alarm link port';
		flow manifold.lowPressureAlarm to nursesStation.lowPressureAlarm;
	}
	action <'FN-031'> 'Raise low-pressure alarm' {
		out lowPressureAlarm : 'INFO-021';
	}
	part def Manifold {
		port toNurses : 'Alarm link port';
		perform 'FN-031';
	}
	part def NursesStation {
		port fromManifold : ~'Alarm link port';
	}
	part ward {
		part <'PHY-021'> manifold : Manifold;
		part <'PHY-022'> nursesStation : NursesStation;
		interface <'IF-021'> alarmLink : 'Alarm link' connect manifold.toNurses to nursesStation.fromManifold;
	}
	requirement <'REQ-SYS-121'> 'Low-pressure alarm delivery' {
		doc /* The manifold shall deliver each low-pressure alarm to the nurses station over IF-021 within 5 s. */
		subject alarmLink : 'Alarm link';
	}
	allocate 'REQ-SYS-121' to ward.alarmLink;
	allocate 'REQ-SYS-121' to 'FN-031';
}
