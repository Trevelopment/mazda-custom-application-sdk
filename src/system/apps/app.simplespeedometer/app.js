CustomApplicationsHandler.register("app.simplespeedometer", new CustomApplication({

 require: {
 	css: ['app.css']
 },

 settings: {
  title: 'My simple Speedometer',
  statusbar: true
 },

 created: function() {
   var label = $("<div/>").append("0").appendTo(this.canvas);
   
   this.subscribe(VehicleData.vehicle.speed, function(speed) {
     label.html(speed); 
   });
 },

}));