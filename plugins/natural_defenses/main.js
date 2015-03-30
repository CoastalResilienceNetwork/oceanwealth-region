require({
    // Specify library locations.
    packages: [
        {
            name: "jquery",
            location: "//ajax.googleapis.com/ajax/libs/jquery/1.9.0",
            main: "jquery.min"
        }
    ]
});

app = {}

define([
	"dojo/_base/declare",
	"framework/PluginBase",
	'plugins/natural_defenses/ConstrainedMoveable',
	'plugins/natural_defenses/jquery-ui-1.11.0/jquery-ui',
		
	"esri/request",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/layers/ImageParameters",
	"esri/layers/ArcGISImageServiceLayer",
	"esri/layers/ImageServiceParameters",
	"esri/layers/RasterFunction",
	"esri/tasks/ImageServiceIdentifyTask",
	"esri/tasks/ImageServiceIdentifyParameters",
	"esri/tasks/IdentifyParameters",
	"esri/tasks/IdentifyTask",
	"esri/tasks/QueryTask",
	"esri/tasks/query",
	"esri/graphicsUtils",
	"esri/geometry/Extent", 
	"esri/SpatialReference",
		
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/layers/FeatureLayer",
	"dojo/_base/Color",
	
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/DropDownMenu", 
	"dijit/MenuItem",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer",
	"dijit/form/HorizontalSlider",
	"dojox/form/RangeSlider",
	"dijit/form/HorizontalRule",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/TextBox",
	"dijit/form/Select",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/dom-geometry",
		
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/domReady!",
	"dojo/on",
	"dojo/query",
	"dojo/parser",
	"dojo/NodeList-traverse",
        
	"dojo/text!./naturaldefenses.json"
],
function (declare, 
	PluginBase,
	ConstrainedMoveable,
	ui,	
	ESRIRequest,
	ArcGISDynamicMapServiceLayer,
	ImageParameters,
	ArcGISImageServiceLayer,
	ImageServiceParameters,
	RasterFunction,
	ImageServiceIdentifyTask,
	ImageServiceIdentifyParameters,
	IdentifyParameters,
	IdentifyTask,
	QueryTask,
	esriQuery,
	graphicsUtils,
	Extent, 
	SpatialReference,
	SimpleLineSymbol,
	SimpleFillSymbol,
	SimpleMarkerSymbol,
	FeatureLayer,
	Color,
	Button,
	DropDownButton, 
	DropDownMenu, 
	MenuItem,
	ContentPane,
	TabContainer,
	HorizontalSlider,
	RangeSlider,
	HorizontalRule,
	CheckBox,
	RadioButton,
	Textbox,
	Select,
	dom,
	domClass,
	domStyle,
	win,
	domConstruct,
	domAttr,
	domGeom,
	array,
	lang,
	domReady,
	on,
	dojoquery,
	parser,
	domNodeTraverse,
	explorer
){
	return declare(PluginBase, {
		toolbarName: "Natural Defense Projects",
        toolbarType: "sidebar",
		showServiceLayersInLegend: true,
        allowIdentifyWhenActive: false,
		_hasactivated: false,
		infoGraphic: "plugins/natural_defenses/cd_info.jpg",
		height: 300,
        activate: function () { 
			if (this.currentLayer != undefined)  {
				this.currentLayer.setVisibility(true);
			}
			if ((this._hasactivated == false) && (this.explorerObject.regions.length == 1)) {
				this.changeGeography(this.explorerObject.regions[0], true);
			};
			this._hasactivated = true;
			this.render();
		},
        
		deactivate: function () { 
			
		},
			   
		hibernate: function () { 
			if (this.currentLayer != undefined)  {
				this.currentLayer.setVisibility(false);
			}
			if (this.flClick != undefined) {
				this.flClick.clear();
			}
			if (this.flHover != undefined) {
				this.flHover.clear();
			}
			if (this.sliderpane != undefined) { 
				this.sliderpane.destroy();
				this.map.removeLayer(this.currentLayer)
			}
			if (this.tabarea != undefined) {
				//domStyle.set(this.tabarea.domNode, 'display', '')
				this.tabarea.destroy();
			}
			if (this.buttonpane != undefined) { 
				this.buttonpane.destroy();
			}	
			//domStyle.set(this.textnode, "display", "");
			this._hasactivated = false;
			this.explorerObject = dojo.eval("[" + explorer + "]")[0];
			$('.dijitContentPane').css("margin-top","0px");
		},
			   
		render: function() {
			
		},		
				
		resize: function(w, h) {
			cdg = domGeom.position(this.container);
			if (cdg.h == 0) {
				this.sph = this.height - 112 
			} 
			else {
				this.sph = cdg.h-73;
			}
			domStyle.set(this.sliderpane.domNode, "height", this.sph + "px");
		},
			   
		initialize: function (frameworkParameters) {
				
			declare.safeMixin(this, frameworkParameters);
			domClass.add(this.container, "claro");
			this.explorerObject = dojo.eval("[" + explorer + "]")[0];
			
			con = dom.byId('plugins/natural_defenses-0');
			domStyle.set(con, "width", "310px");
			domStyle.set(con, "height", "300px");
			
			con1 = dom.byId('plugins/natural_defenses-1');
			if (con1 != undefined){
				domStyle.set(con1, "width", "310px");
				domStyle.set(con1, "height", "300px");
			}
			
			if (this.explorerObject.betweenGroups == undefined) {
				this.explorerObject.betweenGroups = "+";
			}
			
			pslidernode = domConstruct.create("span", { id: "big", innerHTML: "<span style='padding:0px;'> </span>" });
			dom.byId(this.container).appendChild(pslidernode); 
				
			nslidernode = domConstruct.create("span");
			dom.byId(this.container).appendChild(nslidernode); 
			
			this.refreshnode = domConstruct.create("span", {style: "display:none"});
			
			domClass.add(this.refreshnode, "plugin-report-spinner");

			dom.byId(this.container).appendChild(this.refreshnode);
					
			a = dojoquery(this.container).parent();
					
			this.infoarea = new ContentPane({
				style:"z-index:10000; !important;position:absolute !important;left:310px !important;top:0px !important;width:350px !important;background-color:#FFF !important;padding:10px !important;border-style:solid;border-width:4px;border-color:#444;border-radius:5px;display: none",
				innerHTML: "<div class='infoareacloser' style='float:right !important'><a href='#'>✖</a></div><div class='infoareacontent' style='padding-top:5px'>no content yet</div>"
			});
					
			dom.byId(a[0]).appendChild(this.infoarea.domNode)
					
			ina = dojoquery(this.infoarea.domNode).children(".infoareacloser");
			this.infoAreaCloser = ina[0];

			inac = dojoquery(this.infoarea.domNode).children(".infoareacontent");
			this.infoareacontent = inac[0];

			on(this.infoAreaCloser, "click", lang.hitch(this,function(e){
				domStyle.set(this.infoarea.domNode, 'display', 'none');
			}));	
		},
				
		changeGeography: function(geography, zoomto) {
			if (zoomto == undefined) {
				zoomto = true;
			}
			  		   
			this.geography = geography;
			     
			if (this.sliderpane != undefined) { 
				this.sliderpane.destroy();
				this.map.removeLayer(this.currentLayer)
			}
					
			this.sliderpane = new ContentPane({});
					
			dom.byId(this.container).appendChild(this.sliderpane.domNode);
			
			//tab container
			mymap = dom.byId(this.map.id);
			a = dojoquery(mymap).parent();
			this.b = makeid();
			console.log(this.b)	
			
			this.tabarea = new ContentPane({
			  id: this.b,
			  style:"display:none; z-index:8; position:absolute; right:105px; top:60px; width:430px; background-color:#FFF; border-style:solid; border-width:4px; border-color:#444; border-radius:5px;",
			  innerHTML: "<div class='tabareacloser' style='float:right !important;'><a href='#' style='color:#cecfce'>✖</a></div><div id='" + this.sliderpane.id + "tabHeader' style='background-color:#424542; color:#fff; height:28px; font-size:1em; font-weight:bold; padding:8px 0px 0px 10px; cursor:move;'>Identify Results</div>" +	
			             "<div id='" + this.sliderpane.id + "tabs' class='tabdiv'>" +
						  "<ul>" +
							"<li><a href='#" + this.sliderpane.id + "tabs-1'>Overview</a></li>" +
							"<li><a href='#" + this.sliderpane.id + "tabs-2'>Effectiveness</a></li>" +
							"<li><a href='#" + this.sliderpane.id + "tabs-3'>Site Characteristics</a></li>" +
							"<li><a href='#" + this.sliderpane.id + "tabs-4'>Project Details</a></li>" +
						  "</ul>" +
						  "<div id='" + this.sliderpane.id + "tabs-1'>" +
							"<p>First</p>" +
						  "</div>" +
						  "<div id='" + this.sliderpane.id + "tabs-2'>" +
							"<p>Second</p>" +
						  "</div>" +
						  "<div id='" + this.sliderpane.id + "tabs-3'>" +
							"<p>Third</p>" +
						  "</div>" +
						  "<div id='" + this.sliderpane.id + "tabs-4'>" +
							"<p>Third</p>" +
						  "</div>" +
						"</div>" 	
			});
					
			dom.byId(a[0]).appendChild(this.tabarea.domNode)
			
			ta = dojoquery(this.tabarea.domNode).children(".tabareacloser");
				this.tabareacloser = ta[0];

			tac = dojoquery(this.tabarea.domNode).children(".tabareacontent");
			this.tabareacontent = tac[0];
								
			on(this.tabareacloser, "click", lang.hitch(this,function(e){
				domStyle.set(this.tabarea.domNode, 'display', 'none');
				this.flClick.clear();
			}));
			
			$( '#' + this.sliderpane.id + 'tabs' ).tabs();
			
			var p = new ConstrainedMoveable(
				dom.byId(this.tabarea.id), {
				handle: dom.byId(this.sliderpane.id + "tabHeader"),	
				within: true
			});
			
			/*this.buttonpane = new ContentPane({
				style:"border-top-style:groove !important; height:50px;overflow: hidden !important;background-color:#F3F3F3 !important;padding:2px !important;"
			});*/
				
			this.buttonpane = new ContentPane({
				style:"border-top-style:groove !important; height:40px; overflow: hidden !important; padding:2px !important;"
			});				
			dom.byId(this.container).appendChild(this.buttonpane.domNode);
			
			var projectDesc = this.explorerObject.projectDesc
			if (projectDesc != undefined) {
				pdButton = new Button({
					label: "Project Description",
					style:  "float:left !important; margin-top:7px;",
					onClick: function(){
						window.open(projectDesc)
					}
				});
				this.buttonpane.domNode.appendChild(pdButton.domNode);
			}
			var methods = this.explorerObject.methods
			if (methods != undefined) {
				methodsButton = new Button({
					label: "Supplementary Info",
					style:  "float:left !important; margin-top:7px;",
					onClick: function(){window.open(methods)}
				});
				this.buttonpane.domNode.appendChild(methodsButton.domNode);
			}
			
			//domStyle.set(this.buttonpane.domNode, 'display', 'none');
			
			if (this.explorerObject.globalText != undefined) {
				explainText = domConstruct.create("div", {style:"margin-top:-5px;margin-bottom:10px", innerHTML: this.explorerObject.globalText});
				this.sliderpane.domNode.appendChild(explainText);
			}
			
			array.forEach(geography.items, lang.hitch(this,function(entry, i){
				if (entry.type == "header") {
					nslidernodeheader = domConstruct.create("div", {style:"margin-top:10px;margin-bottom:5px", innerHTML: "<b>" + entry.text + ":</b>"});
					this.sliderpane.domNode.appendChild(nslidernodeheader);	
				} 
				if (entry.type == "headerh") {
					nslidernodeheader = domConstruct.create("div", {id: this.sliderpane.id + entry.type, style:"display:none;margin-top:10px;margin-bottom:5px", innerHTML: "<b>" + entry.text + ":</b>"});
					this.sliderpane.domNode.appendChild(nslidernodeheader);	
				} 
				if (entry.type == "text") {
					nslidernodeheader = domConstruct.create("div", {style:"margin-top:5px;margin-bottom:7px", innerHTML: entry.text});
					this.sliderpane.domNode.appendChild(nslidernodeheader);	
				} 
				if (entry.type == "select") {
					maindiv = domConstruct.create("div", {id: this.sliderpane.id + entry.type, style:"margin-top:10px; margin-bottom:10px;", innerHTML: "<b>" + entry.header + "</b>"});
					this.sliderpane.domNode.appendChild(maindiv);
					
					spacer = domConstruct.create("div", {style:"height:5px"});
					maindiv.appendChild(spacer);
					
					fieldSelect = domConstruct.create("div", {id: this.sliderpane.id + entry.name, style:"margin-top:10px;margin-bottom:10px"});
					maindiv.appendChild(fieldSelect);
							
					this.select = new Select({
						name: entry.name,
						style: "width: 135px",
						options: [
							{ label: entry.options[0].label, value: entry.options[0].value, selected: entry.options[0].selected, disabled: entry.options[0].disabled },
							{ label: entry.options[1].label, value: entry.options[1].value },
							{ label: entry.options[2].label, value: entry.options[2].value },
							{ label: entry.options[3].label, value: entry.options[3].value },
							{ label: entry.options[4].label, value: entry.options[4].value }
						],
						onChange: lang.hitch(this,function(e) {
							this.fieldSelected(e);
						})
					}, fieldSelect);
					
					equals = domConstruct.create("div", {style:"display:inline; margin-top:10px; margin-bottom:10px;", innerHTML: " = "});
					maindiv.appendChild(equals);
					
					attSelect = domConstruct.create("div", {id: this.sliderpane.id + entry.name1, style:"display:inline; margin-top:10px;margin-bottom:10px"});
					maindiv.appendChild(attSelect);
							
					this.select1 = new Select({
						name: entry.name1,
						style: "width: 120px",
						options: [
							{ label: entry.options1[0].label, value: entry.options1[0].value, selected: entry.options1[0].selected, disabled: entry.options1[0].disabled }
						],
						onChange: lang.hitch(this,function(e) {
							this.attributeSelected(e);
						})
					}, attSelect);
				}
				if (entry.type == "select1") {
					maindiv = domConstruct.create("div", {id: this.sliderpane.id + entry.type, style:"margin-top:10px; margin-bottom:10px;", innerHTML: "<b>" + entry.header + "</b>"});
					this.sliderpane.domNode.appendChild(maindiv);
					
					spacer = domConstruct.create("div", {style:"height:5px"});
					maindiv.appendChild(spacer);
					
					fieldSelect = domConstruct.create("div", {id: this.sliderpane.id + entry.name, style:"margin-top:10px;margin-bottom:10px"});
					maindiv.appendChild(fieldSelect);
							
					this.select = new Select({
						name: entry.name,
						style: "width: 135px",
						options: [
							{ label: entry.options[0].label, value: entry.options[0].value, selected: entry.options[0].selected, disabled: entry.options[0].disabled },
							{ label: entry.options[1].label, value: entry.options[1].value },
							{ label: entry.options[2].label, value: entry.options[2].value },
							{ label: entry.options[3].label, value: entry.options[3].value },
							{ label: entry.options[4].label, value: entry.options[4].value }
						],
						onChange: lang.hitch(this,function(e) {
							this.symbologySelected(e);
						})
					}, fieldSelect);
					
					btnHolder = domConstruct.create("div", {style:"display:inline; margin-top:10px;margin-bottom:10px"});
					maindiv.appendChild(btnHolder);
					
					this.showAllButton = new Button({
						label: "Show All",
						style:  "margin-left:40px",
						onClick: lang.hitch(this,function(){
							this.showAll();
						})
					}, btnHolder);
				}	
				if (entry.type == "featureLayer"){
					// Create feature layer for display
					this.flClick = new FeatureLayer(entry.url, {
						mode: esri.layers.FeatureLayer.MODE_SELECTION,
						outFields: entry.outfields
					});
					// Create feature layer for display
					this.flHover = new FeatureLayer(entry.url1, {
						mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
						outFields: entry.outfields
					});					
					// set feature layer symbology
					var pntSym0 = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15,
								   new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
								   new Color([255,0,0]), 3),
								   new Color([0,255,0,0]));
					this.flClick.setSelectionSymbol(pntSym0);				
					// add feature layer to map
					this.map.addLayer(this.flClick);	
					this.map.addLayer(this.flHover);	
					// select feature layer from map click
					dojo.connect(this.map, "onClick", lang.hitch(this,function(evt){ 
						this.flClick.clear();
						this.findFPUs(evt);						
					}));	
					// call function to capture and display selected feature layer attributes
					dojo.connect(this.flClick, "onSelectionComplete", lang.hitch(this,function(features){
						this.showAttributes(features);
					}));
					dojo.connect(this.flHover, "onMouseOver", lang.hitch(this,function(e){
						this.map.setMapCursor("pointer");
					}));
					dojo.connect(this.flHover, "onMouseOut", lang.hitch(this,function(e){
						this.map.setMapCursor("default");
					}));
				}
				
				if (entry.type == "iden") {
					maindiv = domConstruct.create("div", {id: this.sliderpane.id + entry.type, style:" display:none; margin-top:5px; margin-bottom:10px;", innerHTML: "<b>Identify Results</b>"});
					this.sliderpane.domNode.appendChild(maindiv);
				}	
			}));
			this.defSet = "no";
			this.layerNum = 5;
			this.imageParameters = new ImageParameters();
			this.layerDefs = [];
			this.vis = [5];
			this.imageParameters.layerIds = this.vis;
			this.imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
			this.currentLayer = new ArcGISDynamicMapServiceLayer(geography.url, {opacity:1, "imageParameters": this.imageParameters});
			this.map.addLayer(this.currentLayer,3);
		
			this.resize();
		},

		fieldSelected: function(e){
			this.vis = [];
			this.vis.push(this.layerNum)
			this.currentLayer.setVisibleLayers(this.vis);
			this.layerDefs = [];
			this.currentLayer.setLayerDefinitions(this.layerDefs);
			this.flHover.setDefinitionExpression(this.flHover.defaultDefinitionExpression);
			
			this.hlField = e;
			select = dijit.byId(this.sliderpane.id + "attSelect");
			select.removeOption([0,1,2,3,4,5,6,7,8,9,10]);
			if (e == "Habitat"){
				this.field = e;
				habOption = [
					{label: "Attribute", value: "none", selected: false, disabled: "disabled"},
					{label: "Coastal Dunes", value: "Coastal Dunes", selected: false},
					{label: "Coral Reefs", value: "Coral Reefs", selected: false},
					{label: "Mangroves", value: "Mangroves", selected: false},
					{label: "Oyster Reefs", value: "Oyster Reefs", selected: false},
					{label: "Reed (Freshwater)", value: "Reed (Freshwater)", selected: false},
					{label: "Salt-marsh", value: "Salt-marsh", selected: false},
					{label: "Seagrass", value: "Seagrass", selected: false},
					{label: "Wetlands", value: "Wetlands", selected: false},
					{label: "Willow", value: "Willow", selected: false}
				];
				select.addOption(habOption);	
			}
			if (e == "ProjectObjective"){
				this.field = e;
				prjOption = [
					{label: "Attribute", value: "none", selected: false, disabled: "disabled"},
					{label: "Erosion Mitigation", value: "Erosion Mitigation", selected: false},
					{label: "Flood Defense", value: "Flood Defense", selected: false},
					{label: "Wave Attenuation", value: "Wave Attenuation", selected: false}
				];
				select.addOption(prjOption);	
			}
			if (e == "Classification"){
				this.field = e;
				habOption = [
					{label: "Attribute", value: "none", selected: false, disabled: "disabled"},
					{label: "Bay", value: "Bay", selected: false},
					{label: "Estuary", value: "Estuary", selected: false},
					{label: "Lagoon", value: "Lagoon", selected: false},
					{label: "Open Coast", value: "Open Coast", selected: false},
					{label: "River", value: "River", selected: false}
				];
				select.addOption(habOption);	
			}
			if (e == "SiteExposure"){
				this.field = e;
				habOption = [
					{label: "Attribute", value: "none", selected: false, disabled: "disabled"},
					{label: "Low", value: "Low", selected: false},
					{label: "Moderate", value: "Moderate", selected: false},
					{label: "High", value: "High", selected: false},
					{label: "Very High", value: "Very High", selected: false}
				];
				select.addOption(habOption);	
			}
		//	$('#' + this.sliderpane.id + "select2").slideDown();
		},
		
		attributeSelected: function(e){
			this.exp = this.field + "='" + e + "'";
			this.flHover.setDefinitionExpression(this.exp);
			this.layerDefs[this.layerNum] = this.exp;
			this.currentLayer.setLayerDefinitions(this.layerDefs);
			this.vis = [];
			this.vis.push(this.layerNum)
			this.currentLayer.setVisibleLayers(this.vis);
			this.defSet = "yes";
		},
		
		symbologySelected: function(e){
			this.layerNum = e;
			if (this.defSet == "yes"){
				this.layerDefs[this.layerNum] = this.exp;
				this.currentLayer.setLayerDefinitions(this.layerDefs);
			}
			this.vis = [];
			this.vis.push(this.layerNum)
			this.currentLayer.setVisibleLayers(this.vis);
		},
		
		showAll: function(){
			//this.layerNum = 5;
			this.defSet = "no";
			this.vis = [];
			this.vis.push(this.layerNum)
			this.currentLayer.setVisibleLayers(this.vis);
			this.layerDefs = [];
			this.currentLayer.setLayerDefinitions(this.layerDefs);
			this.flHover.setDefinitionExpression(this.flHover.defaultDefinitionExpression);
			attselect = dijit.byId(this.sliderpane.id + "attSelect");
			attselect.removeOption([0,1,2,3,4,5,6,7,8,9,10]);
			attselect.addOption([{label: "Attribute", value: "none", selected: false, disabled: "disabled"}])
			fldselect = dijit.byId(this.sliderpane.id + "fieldSelect");
			fldselect.removeOption([0,1,2,3,4]);
			fldOption = [
				{label: "Field", value: "none", selected: false, disabled: "disabled"},
				{label: "Habitat", value: "Habitat", selected: false},
				{label: "Project Objective", value: "ProjectObjective", selected: false},
				{label: "Coastal Classification", value: "Classification", selected: false},
				{label: "Site Exposure", value: "SiteExposure", selected: false}
			];
			fldselect.addOption(fldOption);			
		},
		
		findFPUs: function(evt){
			var selectionQuery = new esriQuery();
			var tol = this.map.extent.getWidth()/this.map.width * 4;
			var x = evt.mapPoint.x;
			var y = evt.mapPoint.y;
			var queryExtent = new esri.geometry.Extent(x-tol,y-tol,x+tol,y+tol,evt.mapPoint.spatialReference);
			selectionQuery.geometry = queryExtent;
			selectionQuery.outfields = [ "*" ];
			this.flClick.selectFeatures(selectionQuery,esri.layers.FeatureLayer.SELECTION_NEW);
		},
		
		showAttributes: function(features){
			atts = features[0].attributes;
			this.tab1 = "<b>Habitat:</b> " + atts.Habitat + "<br>" +
					"<b>Coastal Classification:</b> " + atts.Classification + "<br>" +
					"<b>Country:</b> " + atts.Country + "<br>" +
					"<b>Location:</b> " + atts.Location + "<br>"
			this.tab2 = "<b>Engineering Effectiveness:</b> " + atts.EngineeringEffectiveness + "<br>" +
					"<b>Estimated Cost Effectiveness:</b> " + atts.EstimatedCostEffectiveness + "<br>" 
			this.tab3 = "<b>Site Exposure:</b> " + atts.SiteExposure + "<br>" +
					"<b>Mean Annual Significant Wave Height (m):</b> " + atts.MeanAnnualSignificantWaveHeight + "<br>" +
					"<b>Tidal Range:</b> " + atts.TidalRange + "<br>" +
					"<b>Engineering Structure Present:</b> " + atts.EngineeringStructurePresent + "<br>" + 
					"<b>Minimum Habitat Width (m):</b> " + atts.MinimumMeasured_AssumedHabitatWidth + "<br>" + 
					"<b>Species:</b> " + atts.Species + "<br>"
			console.log(atts.Links_2)
			if (atts.Links_2 == "NA"){
				this.tab4 = 	"<b>Project Objective:</b> " + atts.ProjectObjective + "<br>" +
					"<b>Project Title:</b> " + atts.ProjectTitle + "<br>" +
					"<b>Project Type:</b> " + atts.ProjectType + "<br>" +
					"<b>Sources-References:</b> " + atts.Sources_References + "<br>" + 
					"<b>Links:</b> <a style='color:#0000ff;' target='_blank' href='" + atts.Links + "'>Click for more info</a><br>"
			}else{
				this.tab4 = 	"<b>Project Objective:</b> " + atts.ProjectObjective + "<br>" +
					"<b>Project Title:</b> " + atts.ProjectTitle + "<br>" +
					"<b>Project Type:</b> " + atts.ProjectType + "<br>" +
					"<b>Sources-References:</b> " + atts.Sources_References + "<br>" + 
					"<b>Links:</b> <a style='color:#0000ff;'target='_blank' href='" + atts.Links + "'>Click for more info</a>, " +
					"<a style='color:#0000ff;' target='_blank' href='" + atts.Links_2 + "'>Click for additional info</a><br>"
			}
			$('#' + this.sliderpane.id + 'tabs-1').html(this.tab1)
			$('#' + this.sliderpane.id + 'tabs-2').html(this.tab2)
			$('#' + this.sliderpane.id + 'tabs-3').html(this.tab3)
			$('#' + this.sliderpane.id + 'tabs-4').html(this.tab4)

			domStyle.set(this.tabarea.domNode, 'display', '');
		},
		
		getState: function () { 
			state = this.geography;
			return state
		},
				
		setState: function (state) { 
		},
    });
});
function clearSelect(){
	$('.mapselect').slideUp();
	app.sel = "no";
	this.flClick.clear();
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
