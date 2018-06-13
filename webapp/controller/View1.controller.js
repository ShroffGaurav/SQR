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
			var oModel = new JSONModel();
			oModel.setData("");
			this.getView().setModel(oModel, "FindingModel");
		},
		getMyComponent: function() {
			"use strict";
			var sComponentId = Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		onBeforeRendering: function() {
			var oStartupParameters = this.getMyComponent().getComponentData().startupParameters;
		},
		onSmartTableEdit: function(oEvent) {
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
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				NavFilters: "Link"
			});
		},
		onSmartTableSelectionChange: function(oEvent) {
			var context = oEvent.getParameters().rowContext.getObject();
			oEvent.getSource().getParent().getParent().getParent().getModel("FindingModel").setData(context);
		}
	});
});