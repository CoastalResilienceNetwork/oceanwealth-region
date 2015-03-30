
define([
    "dojo/_base/declare",
    "plugins/layer_selector/main",
    "dojo/text!./layers.json"],
    function (declare,
              LayerSelectorPlugin,
              layerSourcesJson) {
        return declare(LayerSelectorPlugin, {
            toolbarName: "Flood & Sea Level Rise",
            fullName: "Visualize inundation scenarios from coastal and riverine flooding, storms and sea level rise",
			infoGraphic: "plugins/flood_slr/slr_flooding_c.jpg",

            getLayersJson: function() {
                return layerSourcesJson;
            }
        });
    }
);
