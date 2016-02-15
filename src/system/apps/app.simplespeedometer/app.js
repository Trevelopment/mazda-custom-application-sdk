CustomApplicationsHandler.register("app.simplespeedometer", new CustomApplication({

 require: {
 	css: ['app.css']
 },

 settings: {
  title: 'Simple Speedometer',
  statusbar: true
 },

 regions: {
 	na: {
 		unit: 'MPH',
 		transform: DataTransform.toMPH,
 	},

 	eu: {
 		unit: 'KM/H',
 		transform: false
 	}
 },

 created: function() {

   // set label
   var label = $("<div/>").append("0").appendTo(this.canvas);
   
   this.subscribe(VehicleData.vehicle.speed, function(speed) {

   		if(this.regions[this.getRegion()].transform) {
   			speed = this.regions[this.getRegion()].transform(speed);
   		}

     	label.html(speed); 

   }.bind(this));

   this.span = $("<span/>").append("MPH").appendTo(this.canvas);

 },

 onRegionChange: function(region) {
 	this.span.html(this.regions[region].unit);
 }

}));