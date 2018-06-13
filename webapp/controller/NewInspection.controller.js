sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function(Controller, JSONModel,Filter) {
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
			var headerModel = new JSONModel();
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
			var HeaderData = {
					"Supplier": "1001553",
				};
			headerModel.setData(HeaderData);
		//	this.getView().getModel().setProperty("/headerData",HeaderData);
		//	this.getView().setModel(oModel);
			this.getView().setModel(headerModel, "headerModel");
			this.getView().setModel(selectModdel, "selectModdel");
			this.getView().byId("addInspectionTable").setModel(oModel);
		},
		onDialogPress: function(oEvent) {
				var supplier = this.getView().getModel("headerModel").getData().Supplier;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this.getView().getId(),"com.sapZSQRMBWA.fragments.AddFinding", this);
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue(supplier);
				this._oDialog.setContentHeight("60%");
				this._oDialog.setContentWidth("90%");
			}


			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();

		},
		onDialogCancelButton: function(oEvent) {

		this._oDialog.destroy(); 
		    this._oDialog = undefined;
		},
		onDialogSubmitButton: function(oEvent) {

		this._oDialog.destroy(); 
		    this._oDialog = undefined;
		},
		dialogAfterclose: function(oEvent) {
			this._oDialog.destroy(); 
		    this._oDialog = undefined;
		},
		onNavBack: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("View1", {

			});
		},
		onAllInspectionPress: function() {
			this.getOwnerComponent().getRouter().navTo("View1", {

			});
		},
		onDeletePress: function(oEvent) {
			var deleteRecord = oEvent.getSource().getBindingContext().getObject();
			var oData = this.getView().getModel().getData();
			for (var i = 0; i < oData.length; i++) {
				if (oData[i] === deleteRecord) {
					//	pop this._data.Products[i] 
					oData.splice(i, 1); //removing 1 record from i th index.
					this.getView().getModel().refresh();
					break; //quit the loop
				}
			}
		},
		onTableEditPress: function(oEvent) {
			var supplier = this.getView().getModel("headerModel").getData().Supplier;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.AddFinding", this);
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.setTitle("Edit Finding");
				this._oDialog.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue(supplier);
				this._oDialog.setContentHeight("60%");
				this._oDialog.setContentWidth("90%");
			}

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		onSubjectChange:function(oEvent){
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("subject_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
			this.getView().byId("CategorySelect").getBinding("items").filter([oFilter]);	
			} else {
			this.getView().byId("CategorySelect").getBinding("items").filter([]);
			}
			
		},
		onCategoryChange:function(oEvent){
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("QUALITY_CATEGORY", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
			this.getView().byId("questionSelect").getBinding("items").filter([oFilter]);	
			} else {
			this.getView().byId("questionSelect").getBinding("items").filter([]);
			}	
		}

	});

});