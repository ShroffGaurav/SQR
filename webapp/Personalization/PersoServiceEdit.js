sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
		"use strict";

		// Very simple page-context personalization
		// persistence service, not for productive use!
		var DemoPersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "PersoApp-EditInspectionTable-FindingId",
					order: 0,
					text: "Finding id",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Subject",
					order: 1,
					text: "Subject",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Category",
					order: 3,
					text: "Category",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Question",
					order: 4,
					text: "Question",
					visible: false
				}, {
					id: "PersoApp-EditInspectionTable-Score",
					order: 5,
					text: "Score",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Status",
					order: 6,
					text: "Status",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Findings",
					order: 7,
					text: "Findings",
					visible: false
				},
				{
					id: "PersoApp-EditInspectionTable-Location",
					order: 8,
					text: "Inspection Location",
					visible: true
				},
				{
					id: "PersoApp-EditInspectionTable-Edit",
					order: 9,
					text: "Edit",
					visible: true
				},
					{
					id: "PersoApp-EditInspectionTable-Delete",
					order: 10,
					text: "Delete",
					visible: true
				}]
			},

			getPersData: function() {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function(oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			resetPersData: function() {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns: [{
					id: "PersoApp-EditInspectionTable-FindingId",
					order: 0,
					text: "Finding id",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Subject",
					order: 1,
					text: "Subject",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Category",
					order: 3,
					text: "Category",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Question",
					order: 4,
					text: "Question",
					visible: false
				}, {
					id: "PersoApp-EditInspectionTable-Score",
					order: 5,
					text: "Score",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Status",
					order: 6,
					text: "Status",
					visible: true
				}, {
					id: "PersoApp-EditInspectionTable-Findings",
					order: 7,
					text: "Findings",
					visible: false
				},
				{
					id: "PersoApp-EditInspectionTable-Location",
					order: 8,
					text: "Inspection Location",
					visible: true
				},
				{
					id: "PersoApp-EditInspectionTable-Edit",
					order: 9,
					text: "Edit",
					visible: true
				},
					{
					id: "PersoApp-EditInspectionTable-Delete",
					order: 10,
					text: "Delete",
					visible: true
				}]
				};

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//		this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			},

			//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
			//to 'Weight (Important!)', but will leave all other column names as they are.
			getCaption: function(oColumn) {
				if (oColumn.getHeader() && oColumn.getHeader().getText) {
					if (oColumn.getHeader().getText() === "Weight") {
						return "Weight (Important!)";
					}
				}
				return null;
			},

			getGroup: function(oColumn) {
				if (oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
					return "Primary Group";
				}
				return "Secondary Group";
			}
		};

		return DemoPersoService;

	}, /* bExport= */ true);