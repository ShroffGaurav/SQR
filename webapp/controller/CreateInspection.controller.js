sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	'com/sapZSQRMBWA/Personalization/PersoService',
	'sap/m/MessageBox',
	'sap/m/TablePersoController',
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast"
], function(Controller, JSONModel, Filter, PersoService, MessageBox, TablePersoController, UploadCollectionParameter, MessageToast) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.CreateInspection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sapZSQRMBWA.view.CreateInspection
		 */
		onInit: function() {
			var CurrentDate = new Date();
			var oModel = new sap.ui.model.json.JSONModel({
				currentMonth: CurrentDate
			});
			this.getView().setModel(oModel, "DateModel");
		},
		onSaveInspectionPress: function(oEvent) {
		//	var oModel = new JSONModel();
			var TableData = this.getView().byId("addInspectionTable").getModel().getData();
			var InspectionDate = this.getView().byId("InspectionDate").getDateValue();
			var Inspection = {
				"InspectionBy": this.getView().byId("InspectionBy").getValue(),
				"SupplierId": this.getView().byId("SupplierID").getValue(),
				"InspectionDate":InspectionDate,
				"OtherContacts": this.getView().byId("OtherContacts").getValue(),
				"Findings": []
			};
			jQuery.each(TableData, function(index, value) {
				var Findings = {
					"SubjectId": value.Status_id,
					"CategoryId": value.category_id,
					"QuestionId": value.question_id,
					"ScoreId": value.Score_id,
					"StatusId": value.Status_id,
					"Findings": value.findings,
					"Location": value.location,
					"SupplierRiskCategory": value.RiskCategorySelect_id,
					"ShortTermContainment": value.ShortTermContainment,
					"SupplierCasualFactor": value.CasualFactor,
					"SupplierId": this.getView().byId("SupplierID").getValue(),
					"QualityCategory": value.QualityCategorySelect
				};
				Inspection.Findings[index] = Findings;
			}.bind(this));
			// oModel.setData(Inspection);

			var requestURLStatusUpdate = "/Inspections";
			this.getOwnerComponent().getModel("ZSQRMBWA").create(requestURLStatusUpdate, Inspection, {
				success: function(dataa, responsee) {
					MessageToast.show("New Inspection Id No:" + responsee.data.Id);
				}.bind(this),
				error: function() {
					MessageToast.show("Error in UserStatusSet service");
					//	reject();
				}

			});

		},
		onDialogPress: function(oEvent) {
			//	var supplier = this.getView().byId("HeaderSupplierId").getValue();
			if (!this._oDialogAdd) {
				this._oDialogAdd = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.AddFinding", this);
				this._oDialogAdd.setModel(this.getView().getModel());
				//this._oDialogAdd.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[
				//	0].setValue(supplier);
				this._oDialogAdd.setContentHeight("60%");
				this._oDialogAdd.setContentWidth("90%");
			}
			//	this._oDialogAdd.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[
			//		0].setValue(supplier);
			this._oDialogAdd.setModel(this.getView().getModel("ZSQRMBWA"), "ZSQRMBWA");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogAdd);
			this._oDialogAdd.open();

		},

		onAddDialogSubmitButton: function(oEvent) {

			var oModel = new JSONModel();
			var arr = [];
			var count = 0;
			var array = {
				//"finding_id": "10053",
				"subject": (this.getView().byId("SubjectSelect").getSelectedItem() === null ? "" : this.getView().byId("SubjectSelect").getSelectedItem()
					.getText()),
				"subject_id": (this.getView().byId("SubjectSelect").getSelectedItem() === null ? "" : this.getView().byId("SubjectSelect").getSelectedItem()
					.getKey()),
				"category": (this.getView().byId("CategorySelect").getSelectedItem() === null ? "" : this.getView().byId("CategorySelect").getSelectedItem()
					.getText()),
				"category_id": (this.getView().byId("CategorySelect").getSelectedItem() === null ? "" : this.getView().byId("CategorySelect").getSelectedItem()
					.getKey()),
				"question": (this.getView().byId("questionSelect").getSelectedItem() === null ? "" : this.getView().byId("questionSelect").getSelectedItem()
					.getText()),
				"question_id": (this.getView().byId("questionSelect").getSelectedItem() === null ? "" : this.getView().byId("questionSelect").getSelectedItem()
					.getKey()),
				"Score": (this.getView().byId("ScoreSelect").getSelectedItem() === null ? "" : this.getView().byId("ScoreSelect").getSelectedItem()
					.getText()),
				"Score_id": (this.getView().byId("ScoreSelect").getSelectedItem() === null ? "" : this.getView().byId("ScoreSelect").getSelectedItem()
					.getKey()),
				"Status": (this.getView().byId("StatusSelect").getSelectedItem() === null ? "" : this.getView().byId("StatusSelect").getSelectedItem()
					.getText()),
				"Status_id": (this.getView().byId("StatusSelect").getSelectedItem() === null ? "" : this.getView().byId("StatusSelect").getSelectedItem()
					.getKey()),
				"findings": this.getView().byId("findingText").getValue(),
				"location": this.getView().byId("Locationfrag").getValue(),
				"RiskCategorySelect": (this.getView().byId("RiskCategorySelect").getSelectedItem() === null ? "" : this.getView().byId(
						"RiskCategorySelect").getSelectedItem()
					.getText()),
				"RiskCategorySelect_id": (this.getView().byId("RiskCategorySelect").getSelectedItem() === null ? "" : this.getView().byId(
						"RiskCategorySelect").getSelectedItem()
					.getKey()),
				"QualityCategorySelect": (this.getView().byId("QualityCategorySelect").getSelectedItem() === null ? "" : this.getView().byId(
						"QualityCategorySelect").getSelectedItem()
					.getText()),
				"ShortTermContainment": this.getView().byId("ShortTermContainment").getValue(),
				"CasualFactor": this.getView().byId("CasualFactor").getValue()
			};

			jQuery.each(array, function(index, value) {
				if (value !== null && value !== "") {
					switch (index) {
						case 'subject':
							this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'category':
							this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'question':
							this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'Score':
							this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'Status':
							this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'findings':
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'location':
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.None);
							break;
						case 'RiskCategorySelect':
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.None);
							break;
					}

					count++;
				} else {
					switch (index) {
						case 'subject':
							this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'category':
							this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'question':
							this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'Score':
							this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'Status':
							this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'findings':
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'location':
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'RiskCategorySelect':
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.Error);
							break;
					}
				}
			}.bind(this));

			if (count === 17) {
				arr.push(array);
				//oModel.push(arr);
				oModel.getProperty("/data").push(arr);
				this.getView().byId("addInspectionTable").setModel(oModel);
				this._oDialogAdd.destroy();
				this._oDialogAdd = undefined;
			}
		},
		onAddDialogCancelButton: function(oEvent) {
			this._oDialogAdd.destroy();
			this._oDialogAdd = undefined;
		},
		onSubjectChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("subject_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
				this.getView().byId("CategorySelect").getBinding("items").filter([oFilter]);
				this.getView().byId("CategorySelect").setSelectedKey("");
				this.getView().byId("questionSelect").setSelectedKey("");
				this.getView().byId("QualityCategorySelect").setSelectedKey("");
				this.getView().byId("RiskCategorySelect").setSelectedKey("");

			} else {
				this.getView().byId("CategorySelect").getBinding("items").filter([]);
			}

		},
		onCategoryChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("CATEGORY_ID", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
				this.getView().byId("questionSelect").getBinding("items").filter([oFilter]);
				this.getView().byId("questionSelect").setSelectedKey("");
				this.getView().byId("QualityCategorySelect").setSelectedKey("");
				this.getView().byId("RiskCategorySelect").setSelectedKey("");
			} else {
				this.getView().byId("questionSelect").getBinding("items").filter([]);
			}
		},
		onQuestionChange: function(oEvent) {
			var QualityCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().QUALITY_CATEGORY;
			var RiskCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().DEFAULT_RISK_CATEGORY;
			this.getView().byId("QualityCategorySelect").setSelectedKey(QualityCategory);
			this.getView().byId("RiskCategorySelect").setSelectedKey(RiskCategory);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.sapZSQRMBWA.view.CreateInspection
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.sapZSQRMBWA.view.CreateInspection
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.sapZSQRMBWA.view.CreateInspection
		 */
		//	onExit: function() {
		//
		//	}
		onNavBack: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("View1", {

			});
		},

	});

});