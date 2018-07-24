sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	'com/sapZSQRMBWA/Personalization/PersoService',
	'sap/m/MessageBox',
	'sap/m/TablePersoController',
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"com/sapZSQRMBWA/util/formatter"
], function(Controller, JSONModel, Filter, PersoService, MessageBox, TablePersoController, UploadCollectionParameter, MessageToast,
	formatter) {
	"use strict";

	return Controller.extend("com.sapZSQRMBWA.controller.EditInspection", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sapZSQRMBWA.view.NewInspection
		 */
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("InspectionView").attachPatternMatched(this.onHandleRouteMatched, this);
			this.getOwnerComponent().getModel().setSizeLimit(1000);
			var oModel = new JSONModel({
				Attachment: []
			});
			this.getView().setModel(oModel, "AttachmentDisplayModel");
			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.byId("EditInspectionTable"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "PersoApp",
				persoService: PersoService
			}).activate();
		},
		onHandleRouteMatched: function(oEvent) {
			this.addFindingArr = [];
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var oParams = {
				"expand": "Findings,Findings/Attachments"
			};
			if (this.getView().getModel().getData()) {
				this.getView().getModel().setData(null);
			}

			if (oEvent.getParameter("arguments").context) {
				this.sContext = oEvent.getParameter("arguments").context;
				var oPath = {
					path: "/" + encodeURI(this.sContext),
					parameters: oParams
				};
				// var oContext = this.getView().getModel().createBindingContext(oPath);
				if (this.sContext) {
					// this.getView().setBindingContext(oContext);
					// oPath = {
					// 	path: "/" + encodeURI(this.sContext),
					// 	parameters: oParams
					// };

					this.getView().bindObject(oPath);
					// this.getView().getModel().updateBindings();
					// this.getView().getModel().updateBindings();
					// this.getView().getModel().refresh();
				}
			}
			busyIndicator.destroy();

		},
		onDialogCancelButton: function(oEvent) {

			this._oDialog.destroy();
			this._oDialog = undefined;
		},
		onDialogSubmitButton: function(oEvent) {
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var Inspection = oEvent.getSource().getCustomData()[0].getValue();
			var FindingId = oEvent.getSource().getCustomData()[1].getValue();
			var Status = this.getView().byId("StatusSelect").getSelectedKey();
			var Findings = this.getView().byId("InspectionFindingsText").getValue();
			var RiskCategory = this.getView().byId("RiskCategoryInput").getValue();
			var Containment = this.getView().byId("ContainmentInput").getValue();

			var Payload = {};
			Payload.StatusId = Status;
			Payload.Findings = Findings;
			Payload.SupplierRiskCategory = RiskCategory;
			Payload.ShortTermContainment = Containment;

			//UserStatusSet
			var requestURLStatusUpdate = "/Findings(InspectionId='" + Inspection + "',Id='" + FindingId + "')";
			this.getOwnerComponent().getModel().update(requestURLStatusUpdate, Payload, {
				// method: "PUT",
				success: function(data, response) {
					MessageToast.show("Action Complete");
					//this.getView().getModel().refresh();
					//this.getView().getModel().refresh();
					busyIndicator.close();
					this._oDialog.destroy();
					this._oDialog = undefined;
				}.bind(this),
				error: function() {
					MessageToast.show("Error in Post service");
					busyIndicator.close();
					this._oDialog.destroy();
					this._oDialog = undefined;
				}.bind(this)

			});

		},
		onAddDialogPress: function(oEvent) {

			var supplier = this.getView().getBindingContext().getObject().SupplierId;
			if (!this._oDialogAdd) {
				this._oDialogAdd = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.AddFinding", this);
				this._oDialogAdd.setModel(this.getView().getModel());
				this._oDialogAdd.setContentHeight("60%");
				this._oDialogAdd.setContentWidth("90%");
			}
			var Length = this.getView().getModel("AttachmentDisplayModel").getProperty("/Attachment").length;
			this.getView().getModel("AttachmentDisplayModel").getProperty("/Attachment").splice(0, Length);
			this._oDialogAdd.getContent()[0].getItems()[0].getItems()[0].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[
				0].setValue(supplier);
			this._oDialogAdd.setModel(this.getView().getModel("AttachmentDisplayModel"), "AttachmentDisplayModel");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogAdd);
			this._oDialogAdd.open();
		},
		onAddDialogSubmitButton: function(oEvent) {
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var count = 0;
			// if (this.getView().byId("oFileUploader").oFileUpload) {
			// 	var aFiles = this.getView().byId("oFileUploader").oFileUpload.files;
			// }
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
			var aFiles = this.getView().getModel("AttachmentDisplayModel").getData().Attachment;
			if (aFiles) {
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
							this.getView().byId("Locationfrag").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'RiskCategorySelect':
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
					}
				} else {
					this.getView().byId("iconTabBarAdd").setSelectedKey("1");
					busyIndicator.close();
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
							this.getView().byId("Locationfrag").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'RiskCategorySelect':
							this.getView().byId("RiskCategorySelect").setValueState(sap.ui.core.ValueState.Error);
							break;
					}

				}
			}.bind(this));

			if (count === 8) {
				var InspectionId = this.getView().getBindingContext().getObject().Id;
				var Payload = {};
				var Spath;
				var UploadURL;
				Payload.SubjectId = array.subject_id;
				Payload.CategoryId = array.category_id;
				Payload.QuestionId = array.question_id;
				Payload.ScoreId = array.Score_id;
				Payload.StatusId = array.Status_id;
				Payload.Findings = array.findings;
				Payload.Location = array.location;
				Payload.SupplierRiskCategory = array.RiskCategorySelect_id;
				Payload.ShortTermContainment = array.ShortTermContainment;
				Payload.SupplierCasualFactor = array.CasualFactor;
				Payload.QualityCategory = array.QualityCategorySelect;

				var requestURLStatusUpdate = "/Inspections('" + InspectionId + "')/Findings";
				this.getOwnerComponent().getModel().create(requestURLStatusUpdate, Payload, {
					// method: "PUT",
					success: function(data, response) {
						MessageToast.show("Successfully created the Finding :" + data.Id);
						Spath = "/Findings(InspectionId='" + data.InspectionId + "',Id='" + data.Id + "')";
						UploadURL = window.location.origin + (this.getView().getModel().sServiceUrl + Spath) + "/Attachments";
						var oData = array.Attachments;
						this._uploadAttachments(UploadURL, oData);
						//this.getView().getModel().refresh();
						//this.getView().getModel().updateBindings();
						busyIndicator.close();
						this._oDialogAdd.destroy();
						this._oDialogAdd = undefined;
					}.bind(this),
					error: function() {
						MessageToast.show("Error in Post service");
						busyIndicator.close();
						this._oDialogAdd.destroy();
						this._oDialogAdd = undefined;
					}.bind(this)

				});
				this.getView().getModel().refresh();
			}
		},
		onAddDialogCancelButton: function() {
			this._oDialogAdd.destroy();
			this._oDialogAdd = undefined;
		},
		dialogAfterclose: function(oEvent) {
			this._oDialogAdd.destroy();
			this._oDialogAdd = undefined;
		},
		onNavBack: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("ListView", {

			});
		},
		onAllInspectionPress: function() {
			this.getOwnerComponent().getRouter().navTo("ListView", {

			});
		},
		onSaveInspectionPress: function(oEvent) {
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var otherContacts = this.getView().byId("headerOtherContacts").getValue();
			var InspectionId = this.getView().getBindingContext().getObject().Id;
			var Payload = {};
			Payload.OtherContacts = otherContacts;
			var requestURLStatusUpdate = "/Inspections('" + InspectionId + "')";

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			this.getOwnerComponent().getModel().update(requestURLStatusUpdate, Payload, {
				success: function(data, response) {
					MessageToast.show("Action Complete");
					//this.getView().getModel().refresh();
				//	this.getView().getModel().refresh();
					this.getOwnerComponent().getRouter().navTo("ListView", {

					});
					busyIndicator.close();
				}.bind(this),
				error: function() {
					MessageToast.show("Error in Post service");
					busyIndicator.close();
				}.bind(this)

			});

		},

		onDeletePress: function(oEvent) {
			//var deleteRecord = oEvent.getSource().getBindingContext().getObject();
			var Status = oEvent.getSource().getParent().getBindingContext().getObject().StatusId;
			var InspectionId = oEvent.getSource().getParent().getBindingContext().getObject().StatusId;
			var FindingId = oEvent.getSource().getParent().getBindingContext().getObject().Id;

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"Are you sure you want to Delete this Finding ?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						if (sAction === "OK") {
							var requestURLStatusUpdate = "/Findings(InspectionId='" + InspectionId + "',Id='" + FindingId + "')";
							this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
								success: function(data, response) {
									MessageToast.show("Finding Deleted");
								//	this.getView().getModel().refresh();
								}.bind(this),
								error: function() {
									MessageToast.show("Error in Delete service");
								}.bind(this)

							});
						} else {
							MessageToast.show("Action Cancelled.");

						}

					}.bind(this)
				}
			);

		},
		onTableEditPress: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.EditFinding", this);
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.setContentHeight("60%");
				this._oDialog.setContentWidth("90%");
				this.getView().addDependent(this._oDialog);
			}
			var oPath;
			var Spath = oEvent.getSource().getParent().getBindingContext().sPath;
			var editVisibilityModel = new JSONModel();
			oPath = {
				path: Spath,
				parameters: {}
			};
			this._oDialog.getContent()[0].getItems()[0].getAggregation("_header").getItems()[1].getContent()[0].bindObject(oPath);
			var Findingid = oEvent.getSource().getParent().getBindingContext().getObject().Id;
			this._oDialog.setTitle("Edit Finding("+ Findingid +")");
			var inspectionid = oEvent.getSource().getParent().getBindingContext().getObject().InspectionId;
			var Subject = oEvent.getSource().getParent().getBindingContext().getObject().Subject;
			var Category = oEvent.getSource().getParent().getBindingContext().getObject().Category;
			var Question = oEvent.getSource().getParent().getBindingContext().getObject().Question;
			var Score = oEvent.getSource().getParent().getBindingContext().getObject().Score;
			var Status = oEvent.getSource().getParent().getBindingContext().getObject().StatusId;
			var Finding = oEvent.getSource().getParent().getBindingContext().getObject().Findings;
			var InspectionLocation = oEvent.getSource().getParent().getBindingContext().getObject().Location;
			var ShortTermContainment = oEvent.getSource().getParent().getBindingContext().getObject("ShortTermContainment");
			var SupplerRiskCategory = oEvent.getSource().getParent().getBindingContext().getObject("SupplerRiskCategory");
			var SupplierCasualFactor = oEvent.getSource().getParent().getBindingContext().getObject("SupplierCasualFactor");
			var QualityCategory = oEvent.getSource().getParent().getBindingContext().getObject("QualityCategory");
			var SupplierId = oEvent.getSource().getParent().getBindingContext().getObject("SupplierId");
			var SupplierName = oEvent.getSource().getParent().getBindingContext().getObject("SupplierName");
			var Data = {
				"Findingid": Findingid,
				"InspectionId": inspectionid,
				"Subject": Subject,
				"Category": Category,
				"Question": Question,
				"Score": Score,
				"Status": Status,
				"Finding": Finding,
				"SupplierId": SupplierName + "(" + SupplierId + ")",
				"QualityCategory": QualityCategory,
				"InspectionLocation": InspectionLocation,
				"ShortTermContainment": ShortTermContainment,
				"SupplerRiskCategory": SupplerRiskCategory,
				"SupplierCasualFactor": SupplierCasualFactor,
				"uploadUrl": window.location.origin + (this.getView().getModel().sServiceUrl + Spath) + "/Attachments"
			};
			var SelectedValueHelp = new JSONModel();
			SelectedValueHelp.setData(Data);
			if (Status === "4") {
				editVisibilityModel.setData({
					visible: false
				});
			} else {
				editVisibilityModel.setData({
					visible: true
				});
			}
			this._oDialog.setModel(SelectedValueHelp, "SelectedValueHelp");
			this._oDialog.setModel(editVisibilityModel, "editVisibilityModel");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
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
			var oFilter = new Filter("category_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
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
		onPersoButtonPressed: function(oEvent) {
			this._oTPC.openDialog();
		},
		onTablePersoRefresh: function() {
			PersoService.resetPersData();
			this._oTPC.refresh();
		},

		onTableGrouping: function(oEvent) {
			this._oTPC.setHasGrouping(oEvent.getSource().getSelected());
		},
		/// UploadCollection Code 

		_uploadAttachments: function(Url, aAttachments) {
			var aDeferreds = [];
			// var sKey = this.oDataModel.createKey("PRs", {
			// 	PRNumber: sPRNumber
			// });
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

			this.getView().getModel("AttachmentDisplayModel").getProperty("/Attachment").push(oEvent.getParameters().files[0]);
		//	this.getView().getModel("AttachmentDisplayModel").refresh();

		},
		onChange: function(oEvent) {
			var oModel = this.getView().getModel();
			oModel.refreshSecurityToken();
			var oHeaders = oModel.oHeaders;
			var sToken = oHeaders['x-csrf-token'];
			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: sToken
			});

			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onUploadComplete: function(oEvent) {
		//	this.getView().getModel().refresh();
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			var oUploadCollection = oEvent.getSource();
			for (var i = 0; i < oUploadCollection.getItems().length; i++) {
				if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
					oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
					break;
				}
			}
			 oUploadCollection.getBinding("items").refresh();
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},
		onIconTabBarChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedKey;
			if (SelectedKey === "2") {
				oEvent.getSource().getParent().getParent().getBeginButton().setVisible(false);
			} else {
				oEvent.getSource().getParent().getParent().getBeginButton().setVisible(true);
			}
		},
		onFileDeleted: function(oEvent) {
				var FileId = oEvent.getParameters("documentId").documentId;
				var FindingId = oEvent.getParameters().item.getCustomData()[1].getValue();
				var requestURLStatusUpdate = "/Attachments(FindingId='" + FindingId + "',Id='" + encodeURI(FileId) + "')";

				this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
					success: function(data, response) {
						MessageToast.show("Attachment Deleted");
						//	this.getView().getModel().refresh();
					}.bind(this),
					error: function() {
						MessageToast.show("Error in Delete service");
					}.bind(this)

				});

			}

	});

});