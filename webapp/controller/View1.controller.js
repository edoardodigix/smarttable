sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/p13n/Engine',
	'sap/m/p13n/MetadataHelper',
	'sap/m/p13n/SelectionController',
	'sap/m/p13n/SortController',
	'sap/m/p13n/GroupController',
	'sap/m/table/ColumnWidthController'

],
function(Controller, JSONModel, Filter, FilterOperator, Engine, MetadataHelper, SelectionController, SortController, GroupController, ColumnWidthController) {
    "use strict";

    return Controller.extend("edotests.controller.View1", {
        onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(sap.ui.require.toUrl("edotests/data/fruitmodel.json")).then( () => {
				this.getView().setModel(this.oModel);
				//Converti le stringhe nel modello json in degli oggetti Date
				this.getView().getModel().getData().CatalogoFrutta.forEach(row => { row.Scadenza = new Date(row.Scadenza); });
			});
			this.oFilterBar = this.getView().byId("filterbar");
			this.oTable = this.getView().byId("table");

			this.oMetadataHelper = new MetadataHelper([{
					key: "id-col",
					label: "ID",
					path: "ID"
				},
				{
					key: "nome-col",
					label: "Nome",
					path: "Nome"
				},
				{
					key: "origine-col",
					label: "Origine",
					path: "Origine"
				},
				{
					key: "scadenza-col",
					label: "Scadenza",
					path: "Scadenza"
				}
			]);

			this._mIntialWidth = {
				"firstName_col": "11rem",
				"lastName_col": "11rem",
				"city_col": "11rem",
				"size_col": "11rem"
			};

			Engine.getInstance().register(this.oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Columns: new SelectionController({
						targetAggregation: "columns",
						control: this.oTable
					}),
					Sorter: new SortController({
						control: this.oTable
					}),
					Groups: new GroupController({
						control: this.oTable
					}),
					ColumnWidth: new ColumnWidthController({
						control: this.oTable
					})
				}
			});

			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},

		handleStateChange: function(oEvt) {
			const oTable = this.byId("persoTable");
			const oState = oEvt.getParameter("state");

			if (!oState) {
				return;
			}

			oTable.getColumns().forEach(function(oColumn) {

				const sKey = this._getKey(oColumn);
				const sColumnWidth = oState.ColumnWidth[sKey];

				oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

				oColumn.setVisible(false);
				oColumn.setSortOrder(CoreLibrary.SortOrder.None);
			}.bind(this));

			oState.Columns.forEach(function(oProp, iIndex) {
				const oCol = this.byId(oProp.key);
				oCol.setVisible(true);

				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);
			}.bind(this));

			const aSorter = [];
			oState.Sorter.forEach(function(oSorter) {
				const oColumn = this.byId(oSorter.key);
				/** @deprecated As of version 1.120 */
				oColumn.setSorted(true);
				oColumn.setSortOrder(oSorter.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending);
				aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
			}.bind(this));
			oTable.getBinding("rows").sort(aSorter);
		},

		onSearch: function () {
			var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
				if (oFilterGroupItem.getGroupName() === 'MultiComboBox') {
				// Gestione dei filtri ComboBox
					var oControl = oFilterGroupItem.getControl(),
						aSelectedKeys = oControl.getSelectedKeys(),
						aFilters = aSelectedKeys.map(function (sSelectedKey) {
							return new Filter({
								path: oFilterGroupItem.getName(),
								operator: FilterOperator.Contains,
								value1: sSelectedKey
							});
						});
					if (aSelectedKeys.length > 0) {
						aResult.push(new Filter({
							filters: aFilters,
							and: false
						}));
					}
				} else {
				// Gestione dei filtri DateRangeSelection
					var oControl = oFilterGroupItem.getControl(),
						aSelectedDates = [oControl.getDateValue(), oControl.getSecondDateValue()],
						oFilter = new Filter({
							path: oFilterGroupItem.getName(),
							operator: FilterOperator.BT,
							value1: aSelectedDates[0],
							value2: aSelectedDates[1]
						});
					if (!aSelectedDates[0] == false) {
						aResult.push(oFilter)
					}
				}
				return aResult;
			}, []);

			this.oTable.getBinding("rows").filter(aTableFilters);
		},

		openColumnSelection: function (oEvt) {
			const oTable = this.byId("table");

			Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		}
	});
});
