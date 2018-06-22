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
			// //var InspectionId = oEvent.getSource().getText();
		
		
			// var oModel = new JSONModel();
			// oModel.setData("");
			// this.getView().setModel(oModel, "FindingModel");
			
			
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

		// 	var Findingid = oEvent.getSource().getParent().getBindingContext().getObject("id");
		// 	var Subject = oEvent.getSource().getParent().getBindingContext().getObject("Subject");
		// 	var Category = oEvent.getSource().getParent().getBindingContext().getObject("Category");
		// 	var Question = oEvent.getSource().getParent().getBindingContext().getObject("question_content");
		// 	var Score = oEvent.getSource().getParent().getBindingContext().getObject("Score");
		// 	var Status =  oEvent.getSource().getParent().getBindingContext().getObject("Status");
		// //	var Finding = oEvent.getSource().getParent().getBindingContext("ZSQRMBWA").getObject().Findings;
		// //	var InspectionLocation = oEvent.getSource().getParent().getBindingContext().getObject("location");
		// //	var ShortTermContainment = oEvent.getSource().getParent().getBindingContext("ZSQRMBWA").getObject("ShortTermContainment");
		// //	var SupplerRiskCategory = oEvent.getSource().getParent().getBindingContext("ZSQRMBWA").getObject("SupplerRiskCategory");
		// //	var SupplierCasualFactor = oEvent.getSource().getParent().getBindingContext("ZSQRMBWA").getObject("SupplierCasualFactor");
		// 	var Data = {
		// 		"Findingid": Findingid,
		// 		"Subject": Subject,
		// 		"Category": Category,
		// 		"Question": Question,
		// 		"Score": Score,
		// 		"Status": Status,
		// 	//	"Finding": Finding,
		// 	//	"InspectionLocation": InspectionLocation,
		// 	//	"ShortTermContainment":ShortTermContainment,
		// 	//	"SupplerRiskCategory":SupplerRiskCategory,
		// 	//	"SupplierCasualFactor":SupplierCasualFactor
		// 	};
		// 	var SelectedValueHelp = new JSONModel();
		// 	SelectedValueHelp.setData(Data);
		// 	if (!this._oDialog) {
		// 		this._oDialog = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.EditFinding", this);
		// 		this._oDialog.setModel(this.getView().getModel());
		// 		this._oDialog.setContentHeight("60%");
		// 		this._oDialog.setContentWidth("90%");
		// 		this.getView().addDependent(this._oDialog);
		// 	}
		// 	this._oDialog.setModel(SelectedValueHelp, "SelectedValueHelp");
		// 	var oPath;
		// 	var Spath = oEvent.getSource().getParent().getBindingContext("ZSQRMBWA").sPath;

		// 	oPath = {
		// 		path: "ZSQRMBWA>" + Spath,
		// 		parameters: {}
		// 	};
		// 	this._oDialog.getContent()[0].getItems()[0].getAggregation("_header").getItems()[1].getContent()[0].bindObject(oPath);

		// 	// toggle compact style
		// 	jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		// 	this._oDialog.open();
			
			var DialogModel = new JSONModel();
			var oData = oEvent.getSource().getBindingContext().getObject();
			DialogModel.setData(oData);
			this.getView().setModel(DialogModel, "DialogModel");
			if (!this._oDialogEdit) {
				this._oDialogEdit = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.EditFinding", this);
				this._oDialogEdit.setModel(this.getView().getModel());
				this._oDialogEdit.setContentHeight("60%");
				this._oDialogEdit.setContentWidth("90%");
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogEdit);
			this._oDialogEdit.open();
		},
		onNewInspectionPress: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				NavFilters: "Button"
			});
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
		var sPath = "Inspections('"+InspectionId+"')";
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				context: sPath
			},false);
		},
		onSmartTableSelectionChange: function(oEvent) {
			var context = oEvent.getParameters().rowContext.getObject();
			oEvent.getSource().getParent().getParent().getParent().getModel("FindingModel").setData(context);
		}
	});
});