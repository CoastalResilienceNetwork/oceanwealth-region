define([
    "dojo/_base/declare",
    "plugins/layer_selector/main",
    "dojo/text!./layers.json"],
    function (declare,
              LayerSelectorPlugin,
              layerSourcesJson) {
        return declare(LayerSelectorPlugin, {
            toolbarName: "Blue Carbon",
            fullName: "Configure and control layers to be overlayed on the base map.",
			infoGraphic: "<div><img src= 'plugins/blue_carbon/BlueCarbon_InfoGraph.png'/></div>",

            getLayersJson: function() {
                return layerSourcesJson;
            }
        });
    }
);
