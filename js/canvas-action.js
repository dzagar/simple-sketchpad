//GLOBALS
var currentColour = "black"; //Default to black
var currentMode = "Select"; //Default to select mode
var currentAction = ""; //Default to no action
var selectedObjIndex = -1;
var currentPath;
var copiedPath;
var complPaths = [];
var incPaths = [];

//SET COLOUR
$("#colourPicker").on('input', function(){
	console.log('entered colour picker event: ' + $(this).val());
	$("#currentColour").css("color", $(this).val());
});

//CHOSE SELECT MODE
$(".mode").click(function(){
	currentMode = $(this).get('id');

});





