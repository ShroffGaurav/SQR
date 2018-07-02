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
			this.getOwnerComponent().getRouter().getRoute("AddInspection").attachPatternMatched(this.onHandleRouteMatched, this);
			var CurrentDate = new Date();
			var oModel = new sap.ui.model.json.JSONModel({
				currentMonth: CurrentDate
			});
			var AttachmentModel = new sap.ui.model.json.JSONModel({
				Attachments:[]
			});
			this.getView().setModel(AttachmentModel,"AttachmentModel");
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function() {
					this.onSupplierDialog();
				}.bind(this)
			}, oView);
			this.getView().setModel(oModel, "DateModel");
		},
		onHandleRouteMatched: function(oEvent) {
			this.arr = [];
			if (this.getView().getModel("ZSQRMBWA").getData()) {
				this.getView().getModel("ZSQRMBWA").setData(null);
			}
			if (this.getView().getModel().getData()) {
				this.getView().getModel().setData(null);
			}
		},

		onSupplierDialog: function() {
			if (!this.supplierDialog) {
				this.supplierDialog = new sap.m.Dialog({
					title: 'Supplier Input',
					content: [new sap.m.Label({
							text: "Supplier:"
						}),
						new sap.m.Input({
							value: "",
							showValueHelp: true
						})
					],
					beginButton: new sap.m.Button({
						text: 'Save',
						press: function() {
							var oInput = this.supplierDialog.getContent()[1];
							if (oInput.getValue() !== "") {
								oInput.setValueState(sap.ui.core.ValueState.None);
								this.getView().byId("SupplierID").setValue(oInput.getValue());
								this.supplierDialog.close();
							} else {
								oInput.setValueState(sap.ui.core.ValueState.Error);
							}
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.supplierDialog);
			}

			this.supplierDialog.open();
		},
		onSaveInspectionPress: function(oEvent) {
			//	var oModel = new JSONModel();
			var TableData = this.getView().byId("addInspectionTable").getModel().getData();
			var InspectionDate = this.getView().byId("InspectionDate").getDateValue();
			var Inspection = {
				"InspectionBy": this.getView().byId("InspectionBy").getValue(),
				"SupplierId": this.getView().byId("SupplierID").getValue(),
				"InspectionDate": InspectionDate,
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
				success: function(data, responsee) {
					MessageToast.show("New Inspection Id No:" + data.Id);
					var Spath;
					var UploadURL;
					//this.getOwnerComponent().getRouter().navTo("View1", {});
					jQuery.each(data.Findings.results, function(index, value) {
						Spath = "/Findings(InspectionId='" + data.Id + "',Id='" + data.Findings.results[index].Id + "')";
						UploadURL = window.location.origin + (this.getView().getModel("ZSQRMBWA").sServiceUrl + Spath) + "/Attachments";
						var oData = this.getView().byId("addInspectionTable").getModel().getData()[index].Attachments;
						this._uploadAttachments(UploadURL,oData);
					}.bind(this));
					this.getOwnerComponent().getRouter().navTo("View1", {});
				}.bind(this),
				error: function() {
					MessageToast.show("Error in UserStatusSet service");
				}

			});

		},
		onDialogPress: function(oEvent) {
			var supplier = this.getView().byId("SupplierID").getValue();
			if (!this._oDialogAdd) {
				this._oDialogAdd = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.AddFinding", this);
				this._oDialogAdd.setModel(this.getView().getModel());
				//this._oDialogAdd.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[
				//	0].setValue(supplier);
				this._oDialogAdd.setContentHeight("60%");
				this._oDialogAdd.setContentWidth("90%");
			}
			this._oDialogAdd.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[
				0].setValue(supplier);
			this._oDialogAdd.setModel(this.getView().getModel("ZSQRMBWA"), "ZSQRMBWA");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogAdd);
			this._oDialogAdd.open();

		},

		onAddDialogSubmitButton: function(oEvent) {
			var oModel = new JSONModel();
			var count = 0;
			var aFiles = this.getView().byId("oFileUploader").oFileUpload.files;
			var iKey;
			var oFile;

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
				"CasualFactor": this.getView().byId("CasualFactor").getValue(),
				"Attachments": []
			};
			var aAttachments = array.Attachments;
			for (iKey = 0; iKey < aFiles.length; iKey++) {
				oFile = aFiles[iKey];
				aAttachments.push({
					PRNumber: "",
					FileName: oFile.name,
					mime_type: oFile.type,
					CreatedAt: new Date(),
				//	CreatedByName: sName,
					FileSize: oFile.size,
					file: oFile
				});
			}


			jQuery.each(array, function(index, value) {
				if (value !== null && value !== "") {
					switch (index) {
						case 'subject':
							this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'category':
							this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'question':
							this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'Score':
							this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'Status':
							this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'findings':
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'location':
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'RiskCategorySelect':
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
					}
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

			if (count === 8) {
				this.arr.push(array);
				oModel.setData(this.arr);
				//oModel.getProperty("/data").push(arr);
				this.getView().byId("addInspectionTable").setModel(oModel);
				this._oDialogAdd.close();
				//	this._oDialogAdd = undefined;
			}
		},
		onAddDialogCancelButton: function(oEvent) {
			this._oDialogAdd.close();
			//this._oDialogAdd = undefined;
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

		/// UploadCollection Code 
		
		_uploadAttachments: function(Url, aAttachments) {
			 var aDeferreds = [];
			// var sKey = this.oDataModel.createKey("PRs", {
			// 	PRNumber: sPRNumber
			// });
			 var sUploadURL = Url;
			var sToken = this.getView().getModel("ZSQRMBWA").getSecurityToken();

			aAttachments.forEach(function(oAttachment) {
				var sFileName;
				var sFileType;

				if (!oAttachment.Id && oAttachment.file && oAttachment.PRNumber !== "delete") {
					sFileName = oAttachment.file.name;
					sFileType = sFileName.split(".").pop();
					aDeferreds.push(jQuery.ajax({
						url: sUploadURL,
						cache: false,
						processData: false,
						contentType: false,
						data: oAttachment.file,
						type: "POST",
						beforeSend: function(oXhr) {
							oXhr.setRequestHeader("accept", "application/json");
							oXhr.setRequestHeader("X-CSRF-Token", sToken);
							oXhr.setRequestHeader("slug", sFileName);
							if (sFileType === "msg") {
								oXhr.setRequestHeader("Content-Type", "application/vnd.ms-outlook");
							} else {
								oXhr.setRequestHeader("Content-Type", oAttachment.file.type);
							}
						}
					}));
				}
			});

			return jQuery.when.apply(jQuery, aDeferreds);
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
			this.getOwnerComponent().getRouter().navTo("View1", {});
		},

	});

});