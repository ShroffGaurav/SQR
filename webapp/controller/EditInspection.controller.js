sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	'com/sapZSQRMBWA/Personalization/PersoServiceEdit',
	'sap/m/MessageBox',
	'sap/m/TablePersoController',
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"com/sapZSQRMBWA/util/formatter"
], function(Controller, JSONModel, Filter, PersoServiceEdit, MessageBox, TablePersoController, UploadCollectionParameter, MessageToast,
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
				persoService: PersoServiceEdit
			}).activate();
		},
		onHandleRouteMatched: function(oEvent) {
			this.getView().getModel().setDeferredGroups(["deferredGroup", "changes"]);

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

				if (this.sContext) {
					this.getView().bindObject(oPath);
				}
			}
			busyIndicator.destroy();
		},
		onDialogCancelButton: function(oEvent) {
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		//Save pressed on Edit Finding button
		onDialogSubmitButton: function(oEvent) {
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var oFinding = this._oDialog.getBindingContext().getObject();
			var Inspection = oFinding.InspectionId;
			var FindingId = oFinding.Id;
			var Status = oFinding.StatusId;
			var Findings = oFinding.Findings;
			var RiskCategory = oFinding.SupplierRiskCategory;
			var Containment = oFinding.ShortTermContainment;


			var Payload = {};
			Payload.StatusId = Status;
			Payload.Findings = Findings;
			Payload.SupplierRiskCategory = RiskCategory;
			Payload.ShortTermContainment = Containment;

			//Updating a Finding
			var requestURLStatusUpdate = "/Findings(InspectionId='" + Inspection + "',Id='" + FindingId + "')";
			this.getOwnerComponent().getModel().update(requestURLStatusUpdate, Payload, {
				success: function(data, response) {
					MessageToast.show("Successfully updated the Finding");
					busyIndicator.close();
					this._oDialog.destroy();
					this._oDialog = undefined;
				}.bind(this),
				error: function(error) {
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
					busyIndicator.close();
					this._oDialog.destroy();
					this._oDialog = undefined;
				}.bind(this)

			});
			this.getView().getModel().refresh();
		},

		//New Ispection button pressed
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

		//Save pressed on 'Create Finding' pop-up
		onAddDialogSubmitButton: function(oEvent) {
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var count = 0;
			var iKey;
			var oFile;

			var array = {
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
				"QualityCategoryInput": (this.getView().byId("QualityCategoryInput").getValue() === null ? "" : this.getView().byId(
					"QualityCategoryInput").getValue()),
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
						FileName: oFile.name,
						mime_type: oFile.type,
						CreatedAt: new Date(),
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
				Payload.QualityCategory = array.QualityCategoryInput;

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
					error: function(error) {
						MessageBox.error(JSON.parse(error.responseText).error.message.value);
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
			this.getOwnerComponent().getRouter().navTo("ListView", {});

		},
		onAllInspectionPress: function() {

			this.getOwnerComponent().getRouter().navTo("ListView", {});

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

					MessageToast.show("Successfully saved the Inspection");

					busyIndicator.close();
				}.bind(this),
				error: function(err) {
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
					busyIndicator.close();
				}.bind(this)

			});

		},

		//Delete pressed on the Finding row
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

									MessageToast.show("Successfully deleted the Finding");
									//Refresh the inspection screen
									this.getView().getModel().refresh();

								}.bind(this),

								error: function(err) {
									MessageBox.error(JSON.parse(err.responseText).error.message.value);

								}.bind(this)

							});
						}

					}.bind(this)
				}
			);

		},
		onTableEditPress: function(oEvent) {
			this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.EditFinding", this);
			this._oDialog.setContentHeight("60%");
			this._oDialog.setContentWidth("90%");
			this._oDialog.setModel(this.getView().getModel());
			this._oDialog.setBindingContext(oEvent.getSource().getParent().getBindingContext());

			var sPath = oEvent.getSource().getParent().getBindingContext().sPath;
			var editVisibilityModel = new JSONModel();
			var Status = oEvent.getSource().getParent().getBindingContext().getObject().StatusId;

			if (Status === "4") {
				editVisibilityModel.setData({
					visible: false,
					"uploadUrl": window.location.origin + (this.getView().getModel().sServiceUrl + sPath) + "/Attachments"
				});
			} else {
				editVisibilityModel.setData({
					visible: true,
					"uploadUrl": window.location.origin + (this.getView().getModel().sServiceUrl + sPath) + "/Attachments"
				});
			}
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
				this.getView().byId("QualityCategoryInput").setValue("");
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
				this.getView().byId("QualityCategoryInput").setValue("");
				this.getView().byId("RiskCategorySelect").setSelectedKey("");
			} else {
				this.getView().byId("questionSelect").getBinding("items").filter([]);
			}
		},
		onQuestionChange: function(oEvent) {
			var QualityCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().quality_category;
			var RiskCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().default_risk_category;
			this.getView().byId("QualityCategoryInput").setValue(QualityCategory);
			this.getView().byId("RiskCategorySelect").setSelectedKey(RiskCategory);
		},
		onPersoButtonPressed: function(oEvent) {
			this._oTPC.openDialog();
		},
		onTablePersoRefresh: function() {
			PersoServiceEdit.resetPersData();
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
			this.getView().getModel("AttachmentDisplayModel").refresh();
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
			// Header . Send File Name as Slug
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
		onFileDeleted: function(oEvent) {
			var FileId = oEvent.getParameters("documentId").documentId;
			var FindingId = oEvent.getParameters().item.getCustomData()[1].getValue();
			var requestURLStatusUpdate = "/Attachments(FindingId='" + FindingId + "',Id='" + encodeURI(FileId) + "')";
			this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
				success: function(data, response) {
					MessageToast.show("Successfully deleted the attachment");
				}.bind(this),
				error: function(err) {
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
				}.bind(this)
			});
		}

	});

});