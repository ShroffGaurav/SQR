sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.NewInspection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sapZSQRMBWA.view.NewInspection
		 */
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("InspectionView").attachPatternMatched(this.onHandleRouteMatched, this);

		},
		onHandleRouteMatched: function(oEvent) {
			var Source = oEvent.getParameter("arguments").NavFilters;
			var arr = [];
			var oModel = new JSONModel();
			var selectModdel = new JSONModel();
			if (Source === "Button") {
				this.getView().byId("oButtonAddFinding").setVisible(true);
			

				oModel.setData("");
			} else if (Source === "Link") {
				this.getView().byId("oButtonAddFinding").setVisible(false);
	
				var array = {
					"finding_id": "10053",
					"subject_id": "test",
					"category_id": "ELE",
					"question_id": "Under 3rd party certification?",
					"Score": "0 - Exceeds Requirements",
					"Status": "In-Progress",
					"findings": "Lean/ 5S / Safety",
					"location": "Chicago"
				};
				var array1 = {
					"finding_id": "10054",
					"subject_id": "test",
					"category_id": "ELE",
					"question_id": "Under 3rd party certification?",
					"Score": "0 - Exceeds Requirements",
					"Status": "In-Progress",
					"findings": "Lean/ 5S / Safety",
					"location": "Chicago"
				};
				arr.push(array);
				arr.push(array1);
				oModel.setData(arr);

			}

			this.getView().setModel(oModel);
			this.getView().setModel(selectModdel, "selectModdel");
			this.getView().byId("addInspectionTable").setModel(oModel);
		},
		onDialogPress: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.AddFinding", this);

				this._oDialog.setContentHeight("60%");
				this._oDialog.setContentWidth("90%");
			}
			this._oDialog.setModel("");

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();

		},
		onDialogCancelButton: function(oEvent) {

			this._oDialog.close();
		},
		onDialogSubmitButton: function(oEvent) {

			this._oDialog.close();
		},
		onNavBack: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("View1", {

			});
		},
		onAllInspectionPress: function() {
			this.getOwnerComponent().getRouter().navTo("View1", {

			});
		},
		onSelectionChange: function(oEvent) {
			this.getView().getModel("selectModdel").setData(oEvent.getParameters().listItem.getBindingContext().getObject());

		},
		onDeletePress: function(oEvent) {
		var deleteRecord = oEvent.getSource().getBindingContext().getObject();
		var oData= this.getView().getModel().getData();
		for(var i=0 ; i < oData.length;i++){
			if(oData[i] === deleteRecord )
					{
					//	pop this._data.Products[i] 
						oData.splice(i,1); //removing 1 record from i th index.
						this.getView().getModel().refresh();
						break;//quit the loop
					}
		}
		},
		onTableEditPress:function(oEvent){
			var oModel = new JSONModel();
				if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.AddFinding", this);

				this._oDialog.setContentHeight("60%");
				this._oDialog.setContentWidth("90%");
			}
			oModel.setData(oEvent.getSource().getBindingContext().getObject());
			//this.getView().setModel(oModel);
			this._oDialog.setModel(oModel);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();	
		}

	});

});