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
], function(jquery,Controller, MessageToast, JSONModel,ObjectMarker,UploadCollectionParameter,MobileLibrary,FileSizeFormat,Device) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.View1", {

		onInit: function() {
			
			this.getView().byId("inspectionTable").getTable().setSelectionMode(sap.ui.table.SelectionMode.Single);
		//	this.getView().byId("inspectionTable").getTable().attachRowSelectionChange(this.onSmartTableSelectionChange);
			var oModel = new JSONModel();
			oModel.setData("");
			this.getView().setModel(oModel,"FindingModel");
			//selectionChange="onSmartTableSelectionChange"
		},
		onAfterRendering:function(){
		
			
		},
		onNewInspectionPress: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				NavFilters: "Button"
			});

		},
		onEditPress: function(oEvent) {
			var oData = [];
			var SelectedIndex = this.getView().byId("inspectionTable").getTable().getSelectedIndex();
				
			if (SelectedIndex !== -1) {
				if (!this._oDialogEdit) {
					this._oDialogEdit = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.EditFinding", this);
					this._oDialogEdit.setModel(this.getView().getModel("FindingModel"));
					this._oDialogEdit.setContentHeight("60%");
					this._oDialogEdit.setContentWidth("90%");
				}
				
				// toggle compact style
				
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogEdit);
				this._oDialogEdit.open();

			} else {
				MessageToast.show("Please select a Row to Edit");
			}
			this.getView().byId("inspectionTable").getTable().clearSelection();
		},
		onDialogCancelButton: function(oEvent) {
			this._oDialogEdit.close();
		},
		onDialogSubmitButton: function(oEvent) {
			this._oDialogEdit.close();
		},
		onInspectionPress:function(oEvent){
		var InspectionId = oEvent.getSource().getText();
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				NavFilters: "Link"
			});
		},
		onSmartTableSelectionChange:function(oEvent){
		var context = oEvent.getParameters().rowContext.getObject();
		oEvent.getSource().getParent().getParent().getParent().getModel("FindingModel").setData(context);
		},
		onDataReceived:function(){
			var table = this.getView().byId("inspectionTable").getTable();
			table.getColumns().forEach(function(column) {
				if(column.getTooltip() === "Score" || column.getTooltip() === "Finding Text"){
					column.setWidth("15rem");
				}else{
					column.setWidth("6.5rem");
				}
					
				// if (!column.data("p13nData").columnIndex) {
				// 	var columnHeadertext = column.getLabel().getText();
				// 	column.getLabel().destroy();
				// 	column.setLabel(new sap.m.Text({
				// 		text: columnHeadertext,
				// 		wrapping: true
				// 	})); //setting the type of label to Text to achieve wrapping
				

			
		});
		}

	});
});