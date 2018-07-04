sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast"
], function(jquery, Component, Controller, JSONModel, UploadCollectionParameter, MessageToast) {
	"use strict";
	return Controller.extend("com.sapZSQRMBWA.controller.ListView", {
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("ListView").attachPatternMatched(this.onHandleRouteMatched, this);
			this.getView().byId("inspectionTable").getTable().setSelectionMode(sap.ui.table.SelectionMode.None);

		},
		onHandleRouteMatched: function(oEvent) {
			this.getView().byId("inspectionTable").getTable().getModel().refresh();
		},
		getMyComponent: function() {
			var sComponentId = Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		onBeforeRendering: function() {
			// var oStartupParameters = this.getMyComponent().getComponentData().startupParameters;
			var oVal = {};
			oVal.StatusId = "1";
			this.getView().byId("smartFilterBar").setFilterData(oVal);
		},
		onSmartTableEdit: function(oEvent) {
			if (!this._oDialogEdit) {
				this._oDialogEdit = sap.ui.xmlfragment(this.getView().getId(), "com.sapZSQRMBWA.fragments.EditFinding", this);
				this._oDialogEdit.setModel(this.getView().getModel());
				this._oDialogEdit.setContentHeight("60%");
				this._oDialogEdit.setContentWidth("90%");
				this.getView().addDependent(this._oDialogEdit);
			}
			var editVisibilityModel = new JSONModel();
			var SelectedValueHelp = new JSONModel();
			var InspectionId = oEvent.getSource().getParent().getBindingContext().getObject().inspection_id;
			var Findingid = oEvent.getSource().getParent().getBindingContext().getObject().id;
			var oPath;
			var Spath = "Findings(InspectionId='" + InspectionId + "',Id='" + Findingid + "')";
			var busyIndicator = new sap.m.BusyDialog();
			busyIndicator.setBusyIndicatorDelay(0);
			busyIndicator.open();
			//this._oDialogEdit.setModel(this.getView().getModel("ZSQRMBWA"), "ZSQRMBWA");

			var oParams = {
				"expand": "Attachments"
			};

			oPath = {
				path: Spath,
				parameters: oParams
			};

			var oFilters = [
				new sap.ui.model.Filter("InspectionId", sap.ui.model.FilterOperator.EQ, InspectionId),
				new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, Findingid)
			];

			var readRequestURL = "/Findings(InspectionId='" + InspectionId + "',Id='" + Findingid + "')";
			this.getOwnerComponent().getModel().read(readRequestURL, {
				urlParameters: {
					$expand: "Attachments"
				},
				async: false,
				success: function(oData) {
					var Data = {
						"Findingid": oData.Id,
						"InspectionId":oData.InspectionId,
						"Subject": oData.Subject,
						"Category": oData.Category,
						"Question": oData.Question,
						"Score": oData.Score,
						"Status": oData.StatusId,
						"Finding": oData.Findings,
						"InspectionLocation": oData.InspectionLocation,
						"ShortTermContainment": oData.ShortTermContainment,
						"SupplerRiskCategory": oData.SupplerRiskCategory,
						"SupplierCasualFactor": oData.SupplierCasualFactor,
						"SupplierId": oData.SupplierName + "(" + oData.SupplierId + ")",
						"QualityCategory": oData.QualityCategory,
						"uploadUrl": window.location.origin + (this._oDialogEdit.getModel().sServiceUrl + readRequestURL) + "/Attachments"
					};
					SelectedValueHelp.setData(Data);
					if (oData.StatusId === "4") {
						editVisibilityModel.setData({
							visible: false
						});
					} else {
						editVisibilityModel.setData({
							visible: true
						});
					}
					busyIndicator.close();
				}.bind(this),
				error: function(Error) {
					busyIndicator.close();
					MessageToast.show("Error in Backend service");
				}
			});

			this._oDialogEdit.getContent()[0].getItems()[0].getAggregation("_header").getItems()[1].getContent()[0].bindObject(oPath);
			this._oDialogEdit.setModel(SelectedValueHelp, "SelectedValueHelp");
			this._oDialogEdit.setModel(editVisibilityModel, "editVisibilityModel");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialogEdit.open();

		},
		onNewInspectionPress: function(oEvent) {
			//var InspectionId = oEvent.getSource().getText();
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
				// method: "PUT",
				success: function(data, response) {
					MessageToast.show("Action Complete");
					busyIndicator.close();
					this._oDialogEdit.destroy();
					this._oDialogEdit = undefined;
				}.bind(this),
				error: function() {
					MessageToast.show("Error in Post service");
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
			this.getView().getModel().refresh();
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			var oUploadCollection = oEvent.getSource();
			for (var i = 0; i < oUploadCollection.getItems().length; i++) {
				if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
					oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
					break;
				}
			}
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
		}
	});
});