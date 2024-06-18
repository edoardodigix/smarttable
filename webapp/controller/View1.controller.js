sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
],
function(Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("edotests.controller.View1", {
        onInit: function() {
			this.oModel = new JSONModel();
			this.oModel.loadData(sap.ui.require.toUrl("edotests/data/fruitmodel.json")).then( (resolve, reject) => {
				this.getView().setModel(this.oModel);
				//Converti le stringhe nel modello json in degli oggetti Date
				this.getView().getModel().getData().CatalogoFrutta.forEach(row => {row.Scadenza = new Date(row.Scadenza)});
				resolve();
			});
			this.oFilterBar = this.getView().byId("filterbar");
			this.oTable = this.getView().byId("table");
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
		}
	});
});
