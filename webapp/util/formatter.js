sap.ui.define([
	"sap/ui/model/type/Currency",
	"sap/ui/core/IconPool"
], function(Currency, IconPool) {
	"use strict";

	return {

		attachmentIcon: function(sMimeType) {
			return IconPool.getIconForMimeType(sMimeType);
		}

	};

});