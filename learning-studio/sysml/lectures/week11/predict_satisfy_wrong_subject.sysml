// Week 11, Session 2 predict item (FICTIONAL): a satisfy claim whose satisfying part is not of the requirement's
// subject type. The checker accepts the file with one warning.
package SatisfyWrongSubject {
	private import ScalarValues::*;
	part def Compressor {
		attribute deliveryPressureBar : Real;
	}
	part def StorageTank {
		attribute capacityLitres : Real;
	}
	requirement def <'REQ-SYS-101'> DeliveryPressure {
		doc /* The compressor shall deliver air at no less than 7 bar. */
		subject compressor : Compressor;
		require constraint { compressor.deliveryPressureBar >= 7.0 }
	}
	part workshopAir {
		part compressor : Compressor {
			attribute :>> deliveryPressureBar = 8.0;
		}
		part tank : StorageTank;
	}
	requirement deliveryPressure : DeliveryPressure;
	satisfy deliveryPressure by workshopAir.tank;
}
