sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"com/sapZSQRMBWA/util/formatter",
	"sap/m/MessageBox"
], function(jquery, Component, Controller, JSONModel, UploadCollectionParameter, MessageToast, formatter, MessageBox) {
	"use strict";
	return Controller.extend("com.sapZSQRMBWA.controller.ListView", {
		formatter: formatter,
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("ListView").attachPatternMatched(this.onHandleRouteMatched, this);
			this.getView().byId("inspectionTable").getTable().setSelectionMode(sap.ui.table.SelectionMode.None);
		},
		onHandleRouteMatched: function(oEvent) {
			// this.getView().byId("inspectionTable").getTable().getModel().refresh();
			this.getView().byId("inspectionTable").rebindTable();

		},
		onBeforeRebindTableExtension: function(oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");
			//initially sort the table finding id descending
			if (!oBindingParams.sorter.length) {
				oBindingParams.sorter.push(new sap.ui.model.Sorter("id", true));
			}
		},
		getMyComponent: function() {
			var sComponentId = Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		onBeforeRendering: function() {
			// var oStartupParameters = this.getMyComponent().getComponentData().startupParameters;
			// var oVal = {};
			// oVal.StatusId = "1";
			// this.getView().byId("smartFilterBar").setFilterData(oVal);
		},
		onSmartTableEdit: function(oEvent) {
			if (!this._oDialogEdit) {
				this._oDialogEdit = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.EditFinding", this);

				this._oDialogEdit.setModel(this.getView().getModel());
				this._oDialogEdit.setContentHeight("60%");
				this._oDialogEdit.setContentWidth("90%");
				this.getView().addDependent(this._oDialogEdit);
			}

			var InspectionId = oEvent.getSource().getParent().getBindingContext().getObject().inspection_id;
			var Findingid = oEvent.getSource().getParent().getBindingContext().getObject().id;
			this._oDialogEdit.setTitle("Edit Finding(" + Findingid + ")");
			var readRequestURL = "/Findings(InspectionId='" + InspectionId + "',Id='" + Findingid + "')";

			var editVisibilityModel = new JSONModel({
				"uploadUrl": window.location.origin + (this._oDialogEdit.getModel().sServiceUrl + readRequestURL) + "/Attachments"
			});
			
			this._oDialogEdit.bindElement(readRequestURL, {"expand": "Attachments"});
			this._oDialogEdit.setModel(editVisibilityModel, "editVisibilityModel");
			this._oDialogEdit.open();
		},
		onNewInspectionPress: function(oEvent) {
			var sPath = "";
			this.getOwnerComponent().getRouter().getTargetHandler().setCloseDialogs(false);
			this.getOwnerComponent().getRouter().navTo("AddInspection", {
				context: sPath
			}, false);
		},
		onDialogCancelButton: function(oEvent) {
			this._oDialogEdit.destroy();
			this._oDialogEdit = undefined;
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
				success: function(data, response) {
					MessageToast.show("Successfully updated the Finding");
					busyIndicator.close();
					this._oDialogEdit.destroy();
					this._oDialogEdit = undefined;

					//Refresh smart table
					this.getView().byId("inspectionTable").rebindTable();
				}.bind(this),
				error: function(error) {
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
					busyIndicator.close();
					this._oDialogEdit.destroy();
					this._oDialogEdit = undefined;
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

		/////// Upload Collection Code ///////
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

		onFileDeleted: function(oEvent) {
			var FileId = oEvent.getParameters("documentId").documentId;
			var FindingId = oEvent.getParameters().item.getCustomData()[1].getValue();
			var requestURLStatusUpdate = "/Attachments(FindingId='" + FindingId + "',Id='" + encodeURI(FileId) + "')";

			this.getOwnerComponent().getModel().remove(requestURLStatusUpdate, {
				success: function(data, response) {
					MessageToast.show("Attachment Deleted");
				}.bind(this),
				error: function(error) {
					MessageBox.error(JSON.parse(error.responseText).error.message.value);
				}.bind(this)
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