define([
    "dojo/_base/declare",
    "plugins/layer_selector/main",
    "dojo/text!./layers.json"],
    function (declare,
              LayerSelectorPlugin,
              layerSourcesJson) {
        return declare(LayerSelectorPlugin, {
            toolbarName: "Fisheries",
            fullName: "Configure and control layers to be overlayed on the base map.",
			infoGraphic: "plugins/fisheries/fishproduction.jpg",

            getLayersJson: function() {
                return layerSourcesJson;
            }
        });
    }
);
