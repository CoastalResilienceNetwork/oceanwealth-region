define([
    "dojo/_base/declare",
    "plugins/layer_selector/main",
    "dojo/text!./layers.json"],
    function (declare,
              LayerSelectorPlugin,
              layerSourcesJson) {
        return declare(LayerSelectorPlugin, {
            toolbarName: "Natural Coastal Protection",
            fullName: "Configure and control layers to be overlayed on the base map.",
			infoGraphic: "plugins/natural_coastal_protection/coastalprotection.jpg",

            getLayersJson: function() {
                return layerSourcesJson;
            }
        });
    }
);