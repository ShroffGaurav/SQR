sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/ObjectMarker",
	"sap/m/UploadCollectionParameter",
	"sap/m/library",
	"sap/ui/core/format/FileSizeFormat",
	"sap/ui/Device"
], function(jquery, Controller, MessageToast, JSONModel, ObjectMarker, UploadCollectionParameter, MobileLibrary, FileSizeFormat, Device) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.View1", {

		onInit: function() {

			this.getView().byId("inspectionTable").getTable().setSelectionMode(sap.ui.table.SelectionMode.Single);
			//	this.getView().byId("inspectionTable").getTable().attachRowSelectionChange(this.onSmartTableSelectionChange);
			var oModel = new JSONModel();
			oModel.setData("");
			this.getView().setModel(oModel, "FindingModel");
			//selectionChange="onSmartTableSelectionChange"
		},
		onAfterRendering: function() {

		},
		onSmartTableEdit: function(oEvent) {
			var DialogModel = new JSONModel();
			var oData = oEvent.getSource().getBindingContext().getObject();
			DialogModel.setData(oData);

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
			this._oDialogEdit.close();
		},
		onDialogSubmitButton: function(oEvent) {
			this._oDialogEdit.close();
		},
		onInspectionPress: function(oEvent) {
			var InspectionId = oEvent.getSource().getText();
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				NavFilters: "Link"
			});
		},
		onSmartTableSelectionChange: function(oEvent) {
			var context = oEvent.getParameters().rowContext.getObject();
			oEvent.getSource().getParent().getParent().getParent().getModel("FindingModel").setData(context);
		},

	});
});