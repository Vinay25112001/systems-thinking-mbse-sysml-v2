// Week 10, include on AeroLink (FICTIONAL; proposed teaching content, instructor to confirm): a containing use case that
// includes Aircraft Charging and then the Passenger Transport Mission. Each included use case declares the subject first
// and has its actors bound explicitly.
package 'W10 Turnaround Include' {
	part def AeroLinkEnterprise;
	part def Passengers;
	part def VertiportOperators;
	use case def 'Aircraft Charging' {
		subject enterprise : AeroLinkEnterprise;
		actor operator : VertiportOperators;
	}
	use case def 'Passenger Transport Mission' {
		subject enterprise : AeroLinkEnterprise;
		actor passenger : Passengers;
		actor operator : VertiportOperators;
	}
	use case 'operate turnaround cycle' {
		subject enterprise : AeroLinkEnterprise;
		actor passenger : Passengers;
		actor operator : VertiportOperators;
		objective { doc /* An arrived aircraft charged and the next party flown. */ }
		first start;
		then include use case charging : 'Aircraft Charging' {
			subject enterprise;
			actor :>> operator = 'operate turnaround cycle'::operator;
		}
		then include use case mission : 'Passenger Transport Mission' {
			subject enterprise;
			actor :>> passenger = 'operate turnaround cycle'::passenger;
			actor :>> operator = 'operate turnaround cycle'::operator;
		}
		then done;
	}
}
