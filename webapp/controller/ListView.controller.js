sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"com/sapZSQRMBWA/util/formatter",
	"sap/m/MessageBox",
	"sap/ui/generic/app/navigation/service/NavigationHandler",
	"sap/ui/generic/app/navigation/service/SelectionVariant",
	"sap/ui/core/Fragment"
], function(jquery, Component, Controller, JSONModel, UploadCollectionParameter, MessageToast, formatter, MessageBox, NavigationHandler,
	SelectionVariant, Fragment) {
	"use strict";
	return Controller.extend("com.sapZSQRMBWA.controller.ListView", {
		formatter: formatter,
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("ListView").attachPatternMatched(this.onHandleRouteMatched, this);
			this.getView().byId("inspectionTable").getTable().setSelectionMode(sap.ui.table.SelectionMode.None);

			//Dialog for editing a Finding
			this._oDialogEdit = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.EditFinding", this);

			this.getView().addDependent(this._oDialogEdit);
			this._oDialogEdit.setContentHeight("60%");
			this._oDialogEdit.setContentWidth("90%");

			//For controlling the editable fields
			this.editVisibilityModel = new JSONModel();
			this._oDialogEdit.setModel(this.editVisibilityModel, "editVisibilityModel");
		},

		onHandleRouteMatched: function(oEvent) {
			this.getView().byId("inspectionTable").rebindTable();
		},

		onBeforeRebindTableExtension: function(oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");
			//initially sort the table finding id descending
			if (!oBindingParams.sorter.length) {
				oBindingParams.sorter.push(new sap.ui.model.Sorter("id", true));
			}
		},

		clearButtonWasPressed: function() {
			this.getView().byId("inspectionTable").rebindTable();
		},

		setNavigationParameters: function() {
			var oNavigationHandler = new NavigationHandler(this); //Note: This will not work in WebIDE
			var oParseNavigationPromise = oNavigationHandler.parseNavigation();
			var oSmartFilter = this.getView().byId("smartFilterBar");

			oParseNavigationPromise.done(function(oAppData, oStartupParameters, sNavType) {
				if (sNavType !== "xAppState") {
					//If this was a direct load of the app, without navigation
					var oToday = new Date();
					var o90DayesEarlier = new Date();
					o90DayesEarlier.setDate(o90DayesEarlier.getDate() - 90);
					var oDefaultFilter = {
						InspectionDate: {
							ranges: [{
								value2: oToday,
								value1: o90DayesEarlier
							}]
						}
					};
					oSmartFilter.setFilterData(oDefaultFilter);
					return;
				}
				oSmartFilter.setDataSuiteFormat(oAppData.selectionVariant, true); //true ensures that existing filters are overwritten
			});
		},

		//Edit pressed on the Finding row
		onSmartTableEdit: function(oEvent) {
			var InspectionId = oEvent.getSource().getParent().getBindingContext().getObject().inspection_id;
			var Findingid = oEvent.getSource().getParent().getBindingContext().getObject().id;
			this._oDialogEdit.setTitle("Edit Finding(" + Findingid + ")");
			var readRequestURL = "/Findings(InspectionId='" + InspectionId + "',Id='" + Findingid + "')";

			this.editVisibilityModel.setData({
				"uploadUrl": window.location.origin + (this._oDialogEdit.getModel().sServiceUrl + readRequestURL) + "/Attachments"
			});

			this.getView().setBusy(true);
			this._oDialogEdit.bindElement({
				path: readRequestURL,
				events: {
					dataReceived: function(rData) {
						this.getView().setBusy(false);
					}.bind(this),
					change: function(rData) {
						this.getView().setBusy(false);
					}.bind(this)
				}
			});

			this._oDialogEdit.open();
		},

		//New Inspection icon pressed
		onNewInspectionPress: function(oEvent) {

			//If the Table was maximised, minimise it first
			this.getView().byId("inspectionTable")._toggleFullScreen(false);

			//Navigate to New Inspection screen
			var sPath = "";
			this.getOwnerComponent().getRouter().getTargetHandler().setCloseDialogs(false);
			this.getOwnerComponent().getRouter().navTo("AddInspection", {
				context: sPath
			}, false);
		},

		onDialogCancelButton: function(oEvent) {
			this._oDialogEdit.close();
		},

		//Save pressed on edit finding screen
		onDialogSubmitButton: function(oEvent) {
			var busyIndicator = new sap.m.BusyDialog();
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

			//Update the Finding
			var requestURLStatusUpdate = "/Findings(InspectionId='" + Inspection + "',Id='" + FindingId + "')";
			this.getOwnerComponent().getModel().update(requestURLStatusUpdate, Payload, {
				success: function(data, response) {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("findingUpdateSuccess"));
					busyIndicator.close();
					this._oDialogEdit.close();

					//Refresh smart table
					this.getView().byId("inspectionTable").rebindTable();
				}.bind(this),
				error: function(error) {
					busyIndicator.close();
					//If error code is 500, then message is in XML. Otherwise in JSON
					if (error.statusCode === 500) {
						var sMessage = error.responseText.split("<message xml:lang=\"en\">")[1].split("</message>")[0];
						MessageBox.error(sMessage);
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value);
					}
					this._oDialogEdit.close();
				}.bind(this)
			});
		},

		onInspectionPress: function(oEvent) {
			var InspectionId = oEvent.getSource().getText();
			var sPath = "Inspections('" + InspectionId + "')";
			this.getOwnerComponent().getRouter().navTo("InspectionView", {
				context: sPath
			}, false);
		},

		onSmartTableSelectionChange: function(oEvent) {
			var context = oEvent.getParameters().rowContext.getObject();
			oEvent.getSource().getParent().getParent().getParent().getModel("FindingModel").setData(context);
		},

		//Upload Collection 
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

		//Once the upload is complete, refresh the attachment list
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
			// HTTP Header Slug should have the full filename
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onFileDeleted: function(oEvent) {
			var FileId = oEvent.getParameters("documentId").documentId;
			var FindingId = oEvent.getSource().getBindingContext().getObject().Id;
			var requestURLStatusUpdate = "/Attachments(FindingId='" + FindingId + "',Id='" + encodeURI(FileId) + "')";

			this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
				success: function() {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("attachmentDeleted"));
					Fragment.byId(this.getView().getId(), "editAttachmentsId").rerender();
				}.bind(this),
				error: function(error) {
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
				}
			});
		},

		onIconTabBarChange: function(oEvent) {
			var SelectedKey = oEvent.getParameters().selectedKey;
			if (SelectedKey === "2") {
				oEvent.getSource().getParent().getParent().getBeginButton().setVisible(false);
			} else {
				oEvent.getSource().getParent().getParent().getBeginButton().setVisible(true);
			}
		}
	});
});