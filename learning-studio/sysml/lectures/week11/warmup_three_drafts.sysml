// Week 11, Session 2 warm-up (FICTIONAL): three drafts of the coolant connection between a pump and an engine block.
// Each draft passes the checker with no message; only one says that coolant moves from the pump to the engine.
package DraftOneFlow {
	item def Coolant;
	port def CoolantPort {
		out item coolant : Coolant;
	}
	interface def CoolantLine {
		end port pumpSide : CoolantPort;
		end port engineSide : ~CoolantPort;
		flow pumpSide.coolant to engineSide.coolant;
	}
}
package DraftTwoReversed {
	item def Coolant;
	port def CoolantPort {
		out item coolant : Coolant;
	}
	interface def CoolantLine {
		end port pumpSide : CoolantPort;
		end port engineSide : ~CoolantPort;
		flow engineSide.coolant to pumpSide.coolant;
	}
}
package DraftThreeBinding {
	item def Coolant;
	part def Pump {
		out item coolantOut : Coolant;
	}
	part def EngineBlock {
		in item coolantIn : Coolant;
	}
	part coolingLoop {
		part pump : Pump;
		part engineBlock : EngineBlock;
		bind pump.coolantOut = engineBlock.coolantIn;
	}
}
