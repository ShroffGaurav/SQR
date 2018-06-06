sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.NewInspection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sapZSQRMBWA.view.NewInspection
		 */
		onInit: function() {
		},
		onDialogPress: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.AddFinding", this);
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.setContentHeight("60%");
				this._oDialog.setContentWidth("90%");
			}
			

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();

			},
			onDialogCancelButton:function(oEvent){
					this._oDialog.close();
			},
			onDialogSubmitButton:function(oEvent){
					this._oDialog.close();
			},
			onNavBack:function(oEvent){
					this.getOwnerComponent().getRouter().navTo("View1",{
	
			});
			},
			onAllInspectionPress:function(){
				this.getOwnerComponent().getRouter().navTo("View1",{
	
			});	
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.sapZSQRMBWA.view.NewInspection
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.sapZSQRMBWA.view.NewInspection
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.sapZSQRMBWA.view.NewInspection
		 */
		//	onExit: function() {
		//
		//	}

	});

});