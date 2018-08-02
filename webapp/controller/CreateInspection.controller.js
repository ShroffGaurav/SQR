sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"com/sapZSQRMBWA/Personalization/PersoServiceAdd",
	"sap/m/MessageBox",
	"sap/m/TablePersoController",
	"sap/m/MessageToast",
	"com/sapZSQRMBWA/util/formatter",
	"sap/ui/core/ListItem",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message"
], function(Controller, JSONModel, Filter, PersoServiceAdd, MessageBox, TablePersoController, MessageToast,
	formatter, ListItem, ControlMessageProcessor, Message) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.CreateInspection", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sapZSQRMBWA.view.CreateInspection
		 */
		onInit: function() {

			this.getOwnerComponent().getRouter().getRoute("AddInspection").attachPatternMatched(this.onHandleRouteMatched, this);
			// this.getOwnerComponent().getModel().setSizeLimit(1000);
			if (sap.ushell.Container) {
				this.CurrentUser = sap.ushell.Container.getUser().getId();
			}

			//Model for the New Inspection
			var oInspectionModel = new JSONModel();
			this.getView().setModel(oInspectionModel, "inspectionModel");

			//Model for new Finding
			this.oNewFindingModel = new JSONModel();

			//Ensure that 'Choose a Supplier' dialog comes when this view opens
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function() {
					this.onSupplierDialog();
				}.bind(this)
			}, oView);

			//Personalization option for Finding table inside the Inspection screen
			this._oTPCCreate = new TablePersoController({
				table: this.byId("addInspectionTable"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "PersoAppAdd",
				persoService: PersoServiceAdd
			}).activate();

			//Pop-up for new Finding
			this._oDialogAdd = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.NewInspectionNewFinding", this);
			// this._oDialogAdd = sap.ui.xmlfragment("com.sapZSQRMBWA.fragments.NewInspectionNewFinding", this);
			this.getView().addDependent(this._oDialogAdd);
			this._oDialogAdd.setContentHeight("60%");
			this._oDialogAdd.setContentWidth("90%");
			this._oDialogAdd.setModel(this.oNewFindingModel, "NewFindingModel");

			//Pop-Up for Update the new Finding
			this._oDialogUpdate = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.NewInspectionUpdateFinding", this);
			this.getView().addDependent(this._oDialogUpdate);
			this._oDialogUpdate.setContentHeight("60%");
			this._oDialogUpdate.setContentWidth("90%");

		},

		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var oFilter;
			if (sTerm) {
				oFilter = new Filter({
					filters: [new Filter("Name", sap.ui.model.FilterOperator.Contains, sTerm),
						new Filter("userId", sap.ui.model.FilterOperator.Contains, sTerm)
					],
					and: false
				});
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
		},

		onHandleRouteMatched: function(oEvent) {
			this.arr = [];
			// if (this.getView().getModel().getData()) {
			// 	this.getView().getModel().setData(null);
			// }
			// if (this.getView().getModel().getData()) {
			// 	this.getView().getModel().setData(null);
			// }
			// if (this.getView().byId("addInspectionTable").getModel()) {
			// 	this.getView().byId("addInspectionTable").setModel(null);
			// }
			//Clear JSON models if filled earlier
			// this.getView().getModel("AttachmentDisplayModel").setData({
			// 	Attachment: []
			// });
			// this.getView().getModel("HeaderModel").setData(null);
			this.getView().getModel("inspectionModel").setData(null);
		},

		onSupplierDialog: function() {
			if (!this.supplierDialog) {
				this.supplierDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.Supplier", this);
				this.supplierDialog.setModel(this.getView().getModel());
			}
			// clear the old search filter
			this.supplierDialog.getBinding("items").filter([]);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.supplierDialog);
			this.supplierDialog.open();
		},
		handleSupplierSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("name1", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		HandleLiveSupplierSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oNameFilter = new Filter("name1", sap.ui.model.FilterOperator.Contains, sValue);
			var oIdFilter = new Filter("lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var oTotalFilter = new Filter({
				filters: [oNameFilter, oIdFilter],
				and: false
			}); //Or Filter between ID and name
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oTotalFilter);
		},

		//A supplier was selected in the pop-up
		handleSupplierClose: function(oEvent) {
			var oContext = oEvent.getParameter("selectedItem").getBindingContext();
			if (oContext) {
				var oInspection = oContext.getObject();
				oInspection.InspectionBy = this.CurrentUser;
				oInspection.InspectionDate = new Date();
				this.getView().getModel("inspectionModel").setData(oInspection);
			} else {
				this.getOwnerComponent().getRouter().navTo("ListView", {});
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleSupplierCloseNavigate: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("ListView");
		},
		onSaveInspectionPress: function(oEvent) {
			//	var oModel = new JSONModel();
			var TableData = this.getView().byId("addInspectionTable").getModel().getData();
			var InspectionDate = this.getView().byId("InspectionDate").getDateValue();
			var InspectionBy = this.getView().byId("InspectionBy").getValue();
			if (InspectionBy !== null && InspectionBy !== "" && InspectionDate !== null) {
				this.getView().byId("InspectionBy").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("InspectionDate").setValueState(sap.ui.core.ValueState.None);
				var Inspection = {
					"InspectionBy": this.getView().byId("InspectionBy").getValue(),
					"SupplierId": this.getView().byId("SupplierID").getValue(),
					"InspectionDate": InspectionDate,
					"OtherContacts": this.getView().byId("OtherContacts").getValue(),
					"Findings": []
				};
				jQuery.each(TableData, function(index, value) {
					var Findings = {
						"SubjectId": value.subject_id,
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
						"QualityCategory": value.QualityCategoryInput
					};
					Inspection.Findings[index] = Findings;
				}.bind(this));

				var requestURLStatusUpdate = "/Inspections";
				this.getOwnerComponent().getModel().create(requestURLStatusUpdate, Inspection, {
					success: function(data, responsee) {
						var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.success(
							"Created a new Inspection with Id: " + data.Id, {
								styleClass: bCompact ? "sapUiSizeCompact" : "",
								onClose: function(sAction) {
									this.getOwnerComponent().getRouter().navTo("ListView", {});
								}.bind(this)
							}
						);

						var Spath;
						var UploadURL;
						jQuery.each(data.Findings.results, function(index, value) {
							Spath = "/Findings(InspectionId='" + data.Id + "',Id='" + data.Findings.results[index].Id + "')";
							UploadURL = window.location.origin + (this.getView().getModel().sServiceUrl + Spath) + "/Attachments";
							var oData = this.getView().byId("addInspectionTable").getModel().getData()[index].Attachments;
							this._uploadAttachments(UploadURL, oData);
						}.bind(this));
					}.bind(this),
					error: function(error) {
						MessageBox.error(JSON.parse(error.responseText).error.message.value);
					}
				});
			} else {
				if (this.getView().byId("InspectionBy").getValue() === "") {
					this.getView().byId("InspectionBy").setValueState(sap.ui.core.ValueState.Error);
				}

				if (this.getView().byId("InspectionDate").getValue() === "") {
					this.getView().byId("InspectionDate").setValueState(sap.ui.core.ValueState.Error);
				}
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("enterMandatoryFields"));
			}
		},
		removeErrorStateInput: function(evt){
			if (evt.getSource().getValue() !== ""){
			evt.getSource().setValueState(sap.ui.core.ValueState.None);}
		},
		//New Finding icon pressed
		onNewFindingPress: function(oEvent) {
			var oInspectionModel = this.getView().getModel("inspectionModel");

			//Create a new empty Finding and add it to the model and assign to the dialog
			var oFinding = {
				"SupplierId": oInspectionModel.getProperty("/lifnr"),
				"SubjectId": "",
				"CategoryId": "",
				"QuestionId": "",
				"ScoreId": "",
				"StatusId": "",
				"Findings": "",
				"Location": "",
				"SupplierRiskCategory": "",
				"ShortTermContainment": "",
				"SupplierCasualFactor": "",
				"QualityCategory": "",
				"Attachments": []
			};

			//Set initial data to the model
			this.oNewFindingModel.setData(oFinding);
			this._oDialogAdd.open();
		},

		//Save pressed on Edit Pop-Up
		onUpdateDialogSubmitButton: function(oEvent) {
			var count = 0;
			var iKey;
			var oFile;

			var oFindingData = this.oNewFindingModel.getData();
			for (var property in oFindingData) {

				if (oFindingData[property] !== null && oFindingData[property] !== "") {
					switch (property) {
						case "SubjectId":
							this.getView().byId("SubjectSelectUpdate").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Subject = this.getView().byId("SubjectSelectUpdate").getSelectedItem().getText();
							count++;
							break;
						case "CategoryId":
							this.getView().byId("CategorySelectUpdate").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Category = this.getView().byId("CategorySelectUpdate").getSelectedItem().getText();
							count++;
							break;
						case "QuestionId":
							this.getView().byId("questionSelectUpdate").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Question = this.getView().byId("questionSelectUpdate").getSelectedItem().getText();
							count++;
							break;
						case "ScoreId":
							this.getView().byId("ScoreSelectUpdate").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Score = this.getView().byId("ScoreSelectUpdate").getSelectedItem().getText();
							count++;
							break;
						case "StatusId":
							this.getView().byId("StatusSelectUpdate").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Status = this.getView().byId("StatusSelectUpdate").getSelectedItem().getText();
							count++;
							break;
						case "Findings":
							this.getView().byId("findingTextUpdate").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case "Location":
							this.getView().byId("LocationfragUpdate").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case "SupplierRiskCategory":
							this.getView().byId("RiskCategorySelectUpdate").setValueState(sap.ui.core.ValueState.None);
							// oFindingData.Subject = this.getView().byId("RiskCategorySelect").getSelectedItem().getText();
							count++;
							break;
					}
				} else {
					//Show the form, show the errors
					this.getView().byId("iconTabBarAddUpdate").setSelectedKey("1");
					switch (property) {
						case "SubjectId":
							this.getView().byId("SubjectSelectUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "CategoryId":
							this.getView().byId("CategorySelectUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "QuestionId":
							this.getView().byId("questionSelectUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "ScoreId":
							this.getView().byId("ScoreSelectUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "StatusId":
							this.getView().byId("StatusSelectUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "Findings":
							this.getView().byId("findingTextUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "Location":
							this.getView().byId("LocationfragUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "SupplierRiskCategory":
							this.getView().byId("RiskCategorySelectUpdate").setValueState(sap.ui.core.ValueState.Error);
							break;
					}
				}
			}
			if (count === 8) {
				//If all mandatory fields are entered, only then close the pop-up
				this._oDialogUpdate.close();
			}
		},

		//Save pressed on new Finding Pop-up
		onAddDialogSubmitButton: function(oEvent) {
			var count = 0;
			var iKey;
			var oFile;

			var oFindingData = this.oNewFindingModel.getData();
			for (var property in oFindingData) {

				if (oFindingData[property] !== null && oFindingData[property] !== "") {
					switch (property) {
						case "SubjectId":
							this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Subject = this.getView().byId("SubjectSelect").getSelectedItem().getText();
							count++;
							break;
						case "CategoryId":
							this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Category = this.getView().byId("CategorySelect").getSelectedItem().getText();
							count++;
							break;
						case "QuestionId":
							this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Question = this.getView().byId("questionSelect").getSelectedItem().getText();
							count++;
							break;
						case "ScoreId":
							this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Score = this.getView().byId("ScoreSelect").getSelectedItem().getText();
							count++;
							break;
						case "StatusId":
							this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.None);
							oFindingData.Status = this.getView().byId("StatusSelect").getSelectedItem().getText();
							count++;
							break;
						case "Findings":
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case "Location":
							this.getView().byId("Locationfrag").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case "SupplierRiskCategory":
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.None);
							// oFindingData.Subject = this.getView().byId("RiskCategorySelect").getSelectedItem().getText();
							count++;
							break;
					}
				} else {
					//Show the form, show the errors
					this.getView().byId("iconTabBarAdd").setSelectedKey("1");
					switch (property) {
						case "SubjectId":
							this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "CategoryId":
							this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "QuestionId":
							this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "ScoreId":
							this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "StatusId":
							this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "Findings":
							this.getView().byId("findingText").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "Location":
							this.getView().byId("Locationfrag").setValueState(sap.ui.core.ValueState.Error);
							break;
						case "SupplierRiskCategory":
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.Error);
							break;
					}
				}
			}

			if (count === 8) {

				//Add the finding to the inspection model
				var aFindings = this.getView().getModel("inspectionModel").getData().Findings;
				if (aFindings === undefined) {
					aFindings = [];
				}
				aFindings.push(oFindingData);
				this.getView().getModel("inspectionModel").setProperty("/Findings", aFindings);

				this._oDialogAdd.close();
			} else {

			}
		},
		onAddDialogCancelButton: function(oEvent) {
			this._oDialogAdd.close();
		},
		onUpdateDialogCancelButton: function(oEvent) {
			this._oDialogUpdate.close();
		},
		onSubjectChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("subject_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
				oEvent.getSource().getParent().getParent().getFormElements()[2].getFields()[0].getBinding("items").filter([oFilter]);
				// this.getView().byId("CategorySelect").getBinding("items").filter([oFilter]);
				if (oEvent.getSource().getParent().getParent().getFormElements()[2].getFields()[0].getId().endsWith("CategorySelect")) {
					this.getView().byId("CategorySelectUpdate").getBinding("items").filter([oFilter]);
				}
				oEvent.getSource().getParent().getParent().getFormElements()[2].getFields()[0].setSelectedKey(""); //Category Select
				oEvent.getSource().getParent().getParent().getFormElements()[3].getFields()[0].setSelectedKey(""); //Question Select
				oEvent.getSource().getParent().getParent().getFormElements()[5].getFields()[0].setValue(""); //Quality Category 
				oEvent.getSource().getParent().getParent().getParent().getFormContainers()[1].getFormElements()[2].getFields()[0].setSelectedKey(
					""); //Supplier Risk Category
				// this.getView().byId("CategorySelect").setSelectedKey("");
				// this.getView().byId("questionSelect").setSelectedKey("");
				// this.getView().byId("QualityCategoryInput").setValue("");
				// this.getView().byId("RiskCategorySelect").setSelectedKey("");
			} else {
				this.getView().byId("CategorySelect").getBinding("items").filter([]);
			}
		},
		onCategoryChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("category_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
				oEvent.getSource().getParent().getParent().getFormElements()[3].getFields()[0].getBinding("items").filter([oFilter]);
				if (oEvent.getSource().getParent().getParent().getFormElements()[3].getFields()[0].getId().endsWith("questionSelect")) {
					this.getView().byId("questionSelectUpdate").getBinding("items").filter([oFilter]);
				}
				oEvent.getSource().getParent().getParent().getFormElements()[3].getFields()[0].setSelectedKey(""); //Question Select
				oEvent.getSource().getParent().getParent().getFormElements()[5].getFields()[0].setValue(""); //Quality Category 
				oEvent.getSource().getParent().getParent().getParent().getFormContainers()[1].getFormElements()[2].getFields()[0].setSelectedKey(
					""); //Supplier Risk Category

				// this.getView().byId("questionSelect").getBinding("items").filter([oFilter]);
				// this.getView().byId("questionSelectUpdate").getBinding("items").filter([oFilter]);
				// this.getView().byId("questionSelect").setSelectedKey("");
				// this.getView().byId("QualityCategoryInput").setValue("");
				// this.getView().byId("RiskCategorySelect").setSelectedKey("");
			} else {
				this.getView().byId("questionSelect").getBinding("items").filter([]);
			}
		},
		onQuestionChange: function(oEvent) {
			var QualityCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().quality_category;
			var RiskCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().default_risk_category;
			// this.getView().byId("QualityCategoryInput").setValue(QualityCategory);
			// this.getView().byId("RiskCategorySelect").setSelectedKey(RiskCategory);
			oEvent.getSource().getParent().getParent().getFormElements()[5].getFields()[0].setValue(QualityCategory); //Quality Category 
			oEvent.getSource().getParent().getParent().getParent().getFormContainers()[1].getFormElements()[2].getFields()[0].setSelectedKey(
				RiskCategory);
		},
		onTableDeletePress: function(oEvent) {
			var oTable = this.getView().byId("addInspectionTable");
			var path = oEvent.getSource().getParent().getBindingContext().sPath;
			// var idx = parseInt(path.substring(path.lastIndexOf("/") + 1));
			oTable.getModel().getData().splice(parseInt(path.substring(1)), 1);
			oTable.removeItem(oEvent.getParameter("listItem"));
			oTable.getModel().refresh();
		},
		onTableEditPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getParent().getBindingContext("inspectionModel");
			this._oDialogUpdate.setBindingContext(oBindingContext, "inspectionModel");
			//Show the first tab when opened
			this.getView().byId("iconTabBarUpdate").setSelectedKey("1");
			this._oDialogUpdate.open();
		},

		onDialogCancelButton: function(oEvent) {
			this._oDialog.destroy();
			this._oDialog = undefined;
		},
		onDialogSubmitButton: function(oEvent) {
			var oData = this.getView().byId("addInspectionTable").getModel().getData();
			var rowIndex = this._oDialog.getModel("SelectedValueHelp").getData().rowIndex;

			if (this.getView().byId("oFileUploaderNewInspectionEdit").oFileUpload) {
				var aFiles = this.getView().byId("oFileUploaderNewInspectionEdit").getModel("AttachmentDisplayModel").getData().Attachment;
			}

			var count = 0;
			var iKey;
			var oFile;
			var DataArray = oData;
			rowIndex = rowIndex.split("/");
			rowIndex = rowIndex[1];

			if (this.getView().byId("SubjectSelect").getSelectedItem().getKey() !== null && this.getView().byId("SubjectSelect").getSelectedItem()
				.getKey() !== "") {
				this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("SubjectSelect").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("CategorySelect").getSelectedItem().getKey() !== null && this.getView().byId("CategorySelect").getSelectedItem()
				.getKey() !== "") {
				this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("CategorySelect").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("questionSelect").getSelectedItem().getKey() !== null && this.getView().byId("questionSelect").getSelectedItem()
				.getKey() !== "") {
				this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("questionSelect").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("ScoreSelect").getSelectedItem().getKey() !== null && this.getView().byId("ScoreSelect").getSelectedItem().getKey() !==
				"") {
				this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("ScoreSelect").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("StatusSelect").getSelectedItem().getKey() !== null && this.getView().byId("StatusSelect").getSelectedItem()
				.getKey() !== "") {
				this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("StatusSelect").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("InspectionFindingsText").getValue() !== "") {
				this.getView().byId("InspectionFindingsText").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("InspectionFindingsText").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("InspectionLocation").getValue() !== "") {
				this.getView().byId("InspectionLocation").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("InspectionLocation").setValueState(sap.ui.core.ValueState.Error);
			}

			if (this.getView().byId("RiskCategorySelect").getSelectedItem().getKey() !== null && this.getView().byId("RiskCategorySelect").getSelectedItem()
				.getKey() !== "") {
				this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.None);
				count++;
			} else {
				this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.Error);
			}

			if (count === 8) {
				DataArray[rowIndex].QualityCategoryInput = "";
				DataArray[rowIndex].RiskCategorySelect = this.getView().byId("RiskCategorySelect").getSelectedItem().getText();
				DataArray[rowIndex].RiskCategorySelect_id = this.getView().byId("RiskCategorySelect").getSelectedItem().getKey();
				DataArray[rowIndex].Score = this.getView().byId("ScoreSelect").getSelectedItem().getText();
				DataArray[rowIndex].Score_id = this.getView().byId("ScoreSelect").getSelectedItem().getKey();
				DataArray[rowIndex].ShortTermContainment = this.getView().byId("ContainmentInput").getValue();
				DataArray[rowIndex].Status = this.getView().byId("StatusSelect").getSelectedItem().getText();
				DataArray[rowIndex].Status_id = this.getView().byId("StatusSelect").getSelectedItem().getKey();
				DataArray[rowIndex].category = this.getView().byId("CategorySelect").getSelectedItem().getText();
				DataArray[rowIndex].category_id = this.getView().byId("CategorySelect").getSelectedItem().getKey();
				DataArray[rowIndex].findings = this.getView().byId("InspectionFindingsText").getValue();
				DataArray[rowIndex].location = this.getView().byId("InspectionLocation").getValue();
				DataArray[rowIndex].question = this.getView().byId("questionSelect").getSelectedItem().getText();
				DataArray[rowIndex].question_id = this.getView().byId("questionSelect").getSelectedItem().getKey();
				DataArray[rowIndex].subject = this.getView().byId("SubjectSelect").getSelectedItem().getText();
				DataArray[rowIndex].subject_id = this.getView().byId("SubjectSelect").getSelectedItem().getKey();

				if (aFiles) {
					var aAttachments = DataArray[rowIndex].Attachments;
					for (iKey = 0; iKey < aFiles.length; iKey++) {
						oFile = aFiles[iKey];
						aAttachments.push({
							PRNumber: "",
							FileName: oFile.name,
							mime_type: oFile.type,
							CreatedAt: new Date(),
							FileSize: oFile.size,
							file: oFile
						});
					}
				}
				this.getView().byId("addInspectionTable").getModel().setData(DataArray);
				this.getView().byId("addInspectionTable").getModel().refresh();

				this._oDialog.destroy();
				this._oDialog = undefined;
			}
		},

		/// UploadCollection Code 
		_uploadAttachments: function(Url, aAttachments) {
			var aDeferreds = [];
			var sUploadURL = Url;
			var sToken = this.getView().getModel().getSecurityToken();

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

		onFileUploaderChangePress: function(oEvent) {
			var oUploadedFile = oEvent.getParameters().files[0];
			this.oNewFindingModel.getData().Attachments.push(oUploadedFile);
			//Force to show the uploaded document
			this.oNewFindingModel.refresh();
		},

		onFileUploaderChangePressUpdate: function(oEvent) {
			var oUploadedFile = oEvent.getParameters().files[0];
			this.oNewFindingModel.getData().Attachments.push(oUploadedFile);
			//Refresh the model to show the new uploads
			this.getView().getModel("inspectionModel").refresh();
		},

		onDeletePressAdd: function(oEvent) {
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("AttachmentDisplayModel").getPath();
			sPath = sPath.split("/");
			sPath = sPath[2];
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			var oData = oEvent.getSource().getModel("AttachmentDisplayModel").getData();

			// send a delete request to the odata service
			oData.Attachment.splice(sPath, 1);
			oList.getModel("AttachmentDisplayModel").refresh();
		},

		handleDelete: function(oEvent) {
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("AttachmentDisplayModel").getPath();
			var rowIndex = this._oDialog.getModel("SelectedValueHelp").getData().rowIndex;
			rowIndex = rowIndex.split("/");
			rowIndex = rowIndex[1];
			sPath = sPath.split("/");
			sPath = sPath[2];
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			var oTableData = this.getView().byId("addInspectionTable").getModel().getData();
			var oData = oEvent.getSource().getModel("AttachmentDisplayModel").getData();

			// send a delete request to the odata service
			oData.Attachment.splice(sPath, 1);
			oTableData[rowIndex].Attachments.splice(sPath, 1);
			oList.getModel("AttachmentDisplayModel").refresh();
		},

		// Table Personalization 
		onPersoButtonPressed: function(oEvent) {
			this._oTPCCreate.openDialog();
		},
		onTablePersoRefresh: function() {
			PersoServiceAdd.resetPersData();
			this._oTPCCreate.refresh();
		},

		onTableGrouping: function(oEvent) {
			this._oTPCCreate.setHasGrouping(oEvent.getSource().getSelected());
		},

		onBeforeRendering: function() {
			if (sap.ushell.Container) {
				this.getView().byId("InspectionBy").setValue(sap.ushell.Container.getUser().getId());
			}
		},

		onNavBack: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.alert(
				"You will lose the entered information. Do you want to exit this screen ?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						if (sAction === "OK") {
							this.getOwnerComponent().getRouter().navTo("ListView", {});
						}
					}.bind(this)
				}
			);
		}
	});

});