sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(jquery, Component, Controller, JSONModel) {
	"use strict";
	return Controller.extend("com.sapZSQRMBWA.controller.View1", {
		onInit: function() {

			this.getView().byId("inspectionTable").getTable().setSelectionMode(sap.ui.table.SelectionMode.None);
			
			

		},
		getMyComponent: function() {
			var sComponentId = Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		onBeforeRendering: function() {
			// var oStartupParameters = this.getMyComponent().getComponentData().startupParameters;
			var oVal = {};
			oVal.StatusId = "01";
			this.getView().byId("smartFilterBar").setFilterData(oVal);
		},
		onSmartTableEdit: function(oEvent) {
			if (!this._oDialogEdit) {
				this._oDialogEdit = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.EditFinding", this);
				this._oDialogEdit.setModel(this.getView().getModel());
				this._oDialogEdit.setContentHeight("60%");
				this._oDialogEdit.setContentWidth("90%");
				this.getView().addDependent(this._oDialogEdit);
			}
			var InspectionId = oEvent.getSource().getParent().getBindingContext().getObject().inspection_id;
			var Findingid = oEvent.getSource().getParent().getBindingContext().getObject().id;
			var oPath;
			var Spath = "/Findings(InspectionId='"+ InspectionId +"',Id='"+ Findingid+"')/Attachments";

			oPath = {
				path: "ZSQRMBWA>" + Spath,
				parameters: {}
			};
			this.getView().getModel("ZSQRMBWA").updateBindings();
			
			
			// var sPath = "Inspections('" + InspectionId + "')";
			// var oParams = {
			// 	"expand": "Findings,Findings/Attachments"
			// };
			// var	oPath = {
			// 			path: "ZSQRMBWA>/" + encodeURI(sPath),
			// 			parameters: oParams
			// 		};

			// 		this._oDialogEdit.bindObject(oPath);
			// 		this.getView().getModel("ZSQRMBWA").updateBindings();
	
		//	var Findingid = oEvent.getSource().getParent().getBindingContext().getObject().id;
			var Subject = oEvent.getSource().getParent().getBindingContext().getObject().Subject;
			var Category = oEvent.getSource().getParent().getBindingContext().getObject().Category;
			var Question = oEvent.getSource().getParent().getBindingContext().getObject().question_content;
			var Score = oEvent.getSource().getParent().getBindingContext().getObject().Score;
			var Status = oEvent.getSource().getParent().getBindingContext().getObject().Status;
			//var Finding = oEvent.getSource().getParent().getBindingContext().getObject().Findings;
			var InspectionLocation = oEvent.getSource().getParent().getBindingContext().getObject().Location;
			var ShortTermContainment = oEvent.getSource().getParent().getBindingContext().getObject("short_term_containment");
			var SupplerRiskCategory = oEvent.getSource().getParent().getBindingContext().getObject("supplier_risk_category");
			var SupplierCasualFactor = oEvent.getSource().getParent().getBindingContext().getObject("supplier_casual_factor");
				var Data = {
			//	"supplier":supplier,
				"Findingid": Findingid,
				"Subject": Subject,
				"Category": Category,
				"Question": Question,
				"Score": Score,
				"Status": Status,
				// "Finding": Finding,
				 "InspectionLocation": InspectionLocation,
				"ShortTermContainment": ShortTermContainment,
				"SupplerRiskCategory": SupplerRiskCategory,
				"SupplierCasualFactor": SupplierCasualFactor,
				// "uploadUrl": window.location.origin + (this.getView().getModel("ZSQRMBWA").sServiceUrl + Spath) + "/Attachments"
			};
			var SelectedValueHelp = new JSONModel();
			SelectedValueHelp.setData(Data);
			this._oDialogEdit.setModel(SelectedValueHelp, "SelectedValueHelp");
			this._oDialogEdit.getContent()[0].getItems()[0].getAggregation("_header").getItems()[1].getContent()[0].bindObject(oPath);
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialogEdit.open();

		},
		onNewInspectionPress: function(oEvent) {
			var InspectionId = oEvent.getSource().getText();
			var sPath = "Inspections('')";
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				context: sPath
			}, false);
		},
		onDialogCancelButton: function(oEvent) {
			this._oDialogEdit.destroy();
			this._oDialogEdit = undefined;
		},
		onDialogSubmitButton: function(oEvent) {
			this._oDialogEdit.destroy();
			this._oDialogEdit = undefined;
		},
		onInspectionPress: function(oEvent) {
			var InspectionId = oEvent.getSource().getText();
			var sPath = "Inspections('" + InspectionId + "')";
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				context: sPath
			}, false);
		},
		onSmartTableSelectionChange: function(oEvent) {
			var context = oEvent.getParameters().rowContext.getObject();
			oEvent.getSource().getParent().getParent().getParent().getModel("FindingModel").setData(context);
		}
	});
});