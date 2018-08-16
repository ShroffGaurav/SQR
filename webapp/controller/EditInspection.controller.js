sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"com/sapZSQRMBWA/Personalization/PersoServiceEdit",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	'sap/m/TablePersoController',
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"com/sapZSQRMBWA/util/formatter",
	"sap/ui/core/Fragment"
], function(Controller, JSONModel, Filter, PersoServiceEdit, MessageBox, BusyDialog, TablePersoController, UploadCollectionParameter, MessageToast,
	formatter, Fragment) {
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
			
			//Dialog to edit a Finding
			this._oDialogEdit = sap.ui.xmlfragment("editFramgmentId", "com.sapZSQRMBWA.fragments.EditFinding", this);
			this._oDialogEdit.setContentHeight("60%");
			this._oDialogEdit.setContentWidth("90%");
			this.getView().addDependent(this._oDialogEdit);
			
			//Dialog to create a Finding
			this._oDialogAdd = sap.ui.xmlfragment("addFragmentId", "com.sapZSQRMBWA.fragments.AddFinding", this);
			this._oDialogAdd.setContentHeight("60%");
			this._oDialogAdd.setContentWidth("90%");
			this.getView().addDependent(this._oDialogAdd);
		},
		
		onHandleRouteMatched: function(oEvent) {
			this.getView().getModel().setDeferredGroups(["deferredGroup", "changes"]);

			this.addFindingArr = [];
			var busyIndicator = new BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();

			if (this.getView().getModel().getData()) {
				this.getView().getModel().setData(null);
			}

			if (oEvent.getParameter("arguments").context) {
				this.sContext = oEvent.getParameter("arguments").context;
				var oPath = {
					path: "/" + encodeURI(this.sContext)
				};

				if (this.sContext) {
					this.getView().bindObject(oPath);
				}
			}
			busyIndicator.destroy();
		},
		onDialogCancelButton: function(oEvent) {
			this._oDialogEdit.close();
		},

		//Save pressed on Edit Finding button
		onDialogSubmitButton: function(oEvent) {
			var busyIndicator = new BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var oFinding = this._oDialogEdit.getBindingContext().getObject();
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
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("findingUpdateSuccess"));
					busyIndicator.close();
					this._oDialogEdit.close();
				}.bind(this),
				error: function(error) {
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
					busyIndicator.close();
					this._oDialogEdit.close();
				}.bind(this)

			});
			//this.getView().getModel().refresh();
		},

		//New Finding button pressed
		onAddDialogPress: function(oEvent) {
			//Ensure Info tab is selected.
			this._oDialogAdd.setBindingContext(oEvent.getSource().getParent().getBindingContext());
			
			var supplier = this.getView().getBindingContext().getObject().SupplierId;
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
			var busyIndicator = new BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var count = 0;
			var iKey;
			var oFile;

			var array = {
				"subject": (Fragment.byId("addFragmentId", "SubjectSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "SubjectSelect").getSelectedItem()
					.getText()),					
				"subject_id": (Fragment.byId("addFragmentId", "SubjectSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "SubjectSelect").getSelectedItem()
					.getKey()),
				"category": (Fragment.byId("addFragmentId", "CategorySelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "CategorySelect").getSelectedItem()
					.getText()),
				"category_id": (Fragment.byId("addFragmentId", "CategorySelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "CategorySelect").getSelectedItem()
					.getKey()),
				"question": (Fragment.byId("addFragmentId", "questionSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "questionSelect").getSelectedItem()
					.getText()),
				"question_id": (Fragment.byId("addFragmentId", "questionSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "questionSelect").getSelectedItem()
					.getKey()),
				"Score": (Fragment.byId("addFragmentId", "ScoreSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "ScoreSelect").getSelectedItem()
					.getText()),
				"Score_id": (Fragment.byId("addFragmentId", "ScoreSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "ScoreSelect").getSelectedItem()
					.getKey()),
				"Status": (Fragment.byId("addFragmentId", "StatusSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "StatusSelect").getSelectedItem()
					.getText()),
				"Status_id": (Fragment.byId("addFragmentId", "StatusSelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", "StatusSelect").getSelectedItem()
					.getKey()),
				"findings": Fragment.byId("addFragmentId", "findingText").getValue(),
				"location": Fragment.byId("addFragmentId", "Locationfrag").getValue(),
				"RiskCategorySelect": (Fragment.byId("addFragmentId", "RiskCategorySelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", 
						"RiskCategorySelect").getSelectedItem()
					.getText()),
				"RiskCategorySelect_id": (Fragment.byId("addFragmentId", "RiskCategorySelect").getSelectedItem() === null ? "" : Fragment.byId("addFragmentId", 
						"RiskCategorySelect").getSelectedItem()
					.getKey()),
				"QualityCategoryInput": (Fragment.byId("addFragmentId", "QualityCategoryInput").getValue() === null ? "" : Fragment.byId("addFragmentId", 
					"QualityCategoryInput").getValue()),
				"ShortTermContainment": Fragment.byId("addFragmentId", "ShortTermContainment").getValue(),
				"CasualFactor": Fragment.byId("addFragmentId", "CasualFactor").getValue(),
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
							Fragment.byId("addFragmentId", "SubjectSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'category':
							Fragment.byId("addFragmentId", "CategorySelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'question':
							Fragment.byId("addFragmentId", "questionSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'Score':
							Fragment.byId("addFragmentId", "ScoreSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'Status':
							Fragment.byId("addFragmentId", "StatusSelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'findings':
							Fragment.byId("addFragmentId", "findingText").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'location':
							Fragment.byId("addFragmentId", "Locationfrag").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
						case 'RiskCategorySelect':
							Fragment.byId("addFragmentId", "RiskCategorySelect").setValueState(sap.ui.core.ValueState.None);
							count++;
							break;
					}
				} else {
					Fragment.byId("addFragmentId", "iconTabBarAdd").setSelectedKey("1");
					busyIndicator.close();
					switch (index) {
						case 'subject':
							Fragment.byId("addFragmentId", "SubjectSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'category':
							Fragment.byId("addFragmentId", "CategorySelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'question':
							Fragment.byId("addFragmentId", "questionSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'Score':
							Fragment.byId("addFragmentId", "ScoreSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'Status':
							Fragment.byId("addFragmentId", "StatusSelect").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'findings':
							Fragment.byId("addFragmentId", "findingText").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'location':
							Fragment.byId("addFragmentId", "Locationfrag").setValueState(sap.ui.core.ValueState.Error);
							break;
						case 'RiskCategorySelect':
							Fragment.byId("addFragmentId", "RiskCategorySelect").setValueState(sap.ui.core.ValueState.Error);
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
					success: function(data, response) {
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("findingCreateSuccess") + data.Id);
						Spath = "/Findings(InspectionId='" + data.InspectionId + "',Id='" + data.Id + "')";
						UploadURL = window.location.origin + (this.getView().getModel().sServiceUrl + Spath) + "/Attachments";
						var oData = array.Attachments;
						this._uploadAttachments(UploadURL, oData);
						busyIndicator.close();
						this._oDialogAdd.close();
					}.bind(this),
					error: function(error) {
						MessageBox.error(JSON.parse(error.responseText).error.message.value);
						busyIndicator.close();
						this._oDialogAdd.close();
					}.bind(this)
				});
			//	this.getView().getModel().refresh();
			}
		},
		
		onAddDialogCancelButton: function() {
			this._oDialogAdd.close();
		},
		
		dialogAfterclose: function(oEvent) {
			this._oDialogAdd.close();
		},
		
		onNavBack: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("ListView", {});
		},
		
		onAllInspectionPress: function() {
			this.getOwnerComponent().getRouter().navTo("ListView", {});
		},
		
		onSaveInspectionPress: function(oEvent) {
			var busyIndicator = new BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			var otherContacts = this.getView().byId("headerOtherContacts").getValue();
			var InspectionId = this.getView().getBindingContext().getObject().Id;
			var Payload = {};
			Payload.OtherContacts = otherContacts;
			var requestURLStatusUpdate = "/Inspections('" + InspectionId + "')";

			this.getOwnerComponent().getModel().update(requestURLStatusUpdate, Payload, {
				success: function(data, response) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("updateInspectionSuccess"));
					busyIndicator.close();
				}.bind(this),
				error: function(err) {
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
					busyIndicator.close();
				}
			});
		},

		//Delete pressed on the Finding row
		onDeletePress: function(oEvent) {
			var InspectionId = oEvent.getSource().getParent().getBindingContext().getObject().StatusId;
			var FindingId = oEvent.getSource().getParent().getBindingContext().getObject().Id;

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				this.getView().getModel("i18n").getResourceBundle().getText("deleteConfirm"), {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						if (sAction === "OK") {
							var requestURLStatusUpdate = "/Findings(InspectionId='" + InspectionId + "',Id='" + FindingId + "')";
							this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
								success: function(data, response) {
									MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("deleteSuccess"));
									//Refresh the inspection screen
									//this.getView().getModel().refresh();
								}.bind(this),
								error: function(err) {
									MessageBox.error(JSON.parse(err.responseText).error.message.value);
								}
							});
						}
					}.bind(this)
				}
			);
		},
		
		//Edit pressed against a Finding row
		onTableEditPress: function(oEvent) {
			this._oDialogEdit.setBindingContext(oEvent.getSource().getParent().getBindingContext());
			
			//Info tab as the selected tab
			this._oDialogEdit.getContent()[0].getItems()[0].setSelectedKey("1");
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
			this._oDialogEdit.setModel(editVisibilityModel, "editVisibilityModel");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogEdit);
			this._oDialogEdit.open();
		},
		
		onSubjectChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("subject_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
				Fragment.byId("addFragmentId", "CategorySelect").getBinding("items").filter([oFilter]);
				Fragment.byId("addFragmentId", "CategorySelect").setSelectedKey("");
				Fragment.byId("addFragmentId", "questionSelect").setSelectedKey("");
				Fragment.byId("addFragmentId", "QualityCategoryInput").setValue("");
				Fragment.byId("addFragmentId", "RiskCategorySelect").setSelectedKey("");
			} else {
				Fragment.byId("addFragmentId", "CategorySelect").getBinding("items").filter([]);
			}
		},
		
		onCategoryChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedItem.getKey();
			var oFilter = new Filter("category_id", sap.ui.model.FilterOperator.EQ, SelectedKey);
			if (SelectedKey !== "" || SelectedKey !== null) {
				Fragment.byId("addFragmentId", "questionSelect").getBinding("items").filter([oFilter]);
				Fragment.byId("addFragmentId", "questionSelect").setSelectedKey("");
				Fragment.byId("addFragmentId", "QualityCategoryInput").setValue("");
				Fragment.byId("addFragmentId", "RiskCategorySelect").setSelectedKey("");
			} else {
				Fragment.byId("addFragmentId", "questionSelect").getBinding("items").filter([]);
			}
		},
		
		onQuestionChange: function(oEvent) {
			var QualityCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().quality_category;
			var RiskCategory = oEvent.getParameters().selectedItem.getBindingContext().getObject().default_risk_category;
			Fragment.byId("addFragmentId", "QualityCategoryInput").setValue(QualityCategory);
			Fragment.byId("addFragmentId", "RiskCategorySelect").setSelectedKey(RiskCategory);
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
			var sToken = oHeaders["x-csrf-token"];
			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: sToken
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onUploadComplete: function(oEvent) {
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
		
		//Delete pressed against the attachment
		onFileDeleted: function(oEvent) {
			var FileId = oEvent.getParameters("documentId").documentId;
			var FindingId = oEvent.getSource().getBindingContext().getObject().Id;
			var requestURLStatusUpdate = "/Attachments(FindingId='" + FindingId + "',Id='" + encodeURI(FileId) + "')";
			this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
				success: function(data, response) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("deleteAttachmentSuccess"));
				}.bind(this),
				error: function(err) {
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
				}.bind(this)
			});
		}
	});
});