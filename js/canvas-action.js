//GLOBALS
var canvas;
var savedDrawing;
var currentColour = "#000000"; //Default to black
var currentMode = "Select"; //Default to select mode
var currentAction = "None"; //Default to no action
var currentShape;
var selectedObjIndex = -1;
var currentPath;
var pathCopy;
var complPaths = [];
var incPaths = [];
var drawingStates = [];
var stuffChanged = true;
var numUndos = 0;
var textMode;
var textAction;
var textColour;
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};

$(document).ready(function(){
	canvas = paper.project;
	updateCanvas();
	textMode = document.getElementById("modeText");
	textMode.innerText = "Current Mode: " + currentMode;
	textAction = document.getElementById("actionText");
	textAction.innerText = "Last Action: " + currentAction;
	textColour = document.getElementById("colourText");
	textColour.innerText = "Colour: " + currentColour;
});

//SET COLOUR
$("#colourPicker").on('input', function(){
	currentColour = $(this).val();
	textColour.innerText = "Colour: " + currentColour;
	$("#currentColour").css("color", $(this).val());
});

//CHOSE MODE
$(".mode").click(function(){
	currentMode = $(this).attr('id');
	textMode.innerText = "Current Mode: " + currentMode;
	if (currentMode === "Polygon"){
		currentPath = new Path();
		$(".navbar-default .navbar-nav .applyPolygon > a").css("display", "block");
	} else {
		$(".navbar-default .navbar-nav .applyPolygon > a").css("display", "none");
	}
});

//CHOSE ACTION
$(".action").click(function(){
	currentAction = $(this).attr('id');
	switch(currentAction){
		case "Save":
			var currentDrawing = canvas.exportJSON();
			savedDrawing = currentDrawing;
			alert('Your drawing has been saved.');
			break;
		case "Load":
			if (confirm('You are loading a saved drawing. Your current work will be lost.')){
				canvas.clear();
				canvas.importJSON(savedDrawing);
				alert('Your drawing has been loaded from the last Save.');
			}
			break;
		case "Undo":
			if (numUndos < drawingStates.length){
				console.log('undo');
				canvas.clear();
				canvas.importJSON(drawingStates[drawingStates.length-1-numUndos-1]);
				numUndos++;
			}
			break;
		case "Redo":
			if (numUndos > 0){
				console.log('redo');
				canvas.clear();
				canvas.importJSON(drawingStates[drawingStates.length-1-numUndos+1]);
				numUndos--;
			}
			break;
		case "Delete":
			break;
		case "Clear":
			if (confirm('You are clearing the drawing space. Your current work will be lost.')){
				canvas.clear();
			}
			break;
		case "Cut":
			if (currentPath){
				pathCopy = currentPath;
				pathCopy.visible = false;
				pathCopy.selected = false;
			}
			break;
		case "Copy":
			if (currentPath){
				pathCopy = currentPath.clone();
				pathCopy.visible = false;
				pathCopy.selected = false;
			}
			break;
		case "Paste":
			if(pathCopy){
				if (currentPath){
					currentPath.selected = false;
				}
				var pathPaste = pathCopy.clone();
				pathPaste.selected = true;
				pathPaste.position = new Point(view.center);
				pathPaste.visible = true;
			}
			break;
		case "Group":
			break;
		case "Ungroup":
			break;
	}
	textAction.innerText = "Last Action: " + currentAction;
});

$(".applyPolygon").click(function(){
	if (confirm('Do you want your polygon to be closed?')){
		currentPath.closed = true;
	}
	currentPath.strokeColor = currentColour;
	currentPath.selected = false;
	currentPath = new Path();
	updateCanvas();
});

function onMouseDown(event){
	if (currentMode === "Select"){
		currentPath.selected = false;
		var hitResult = canvas.hitTest(event.point, hitOptions);
		if (!hitResult)
                return;
        if (hitResult) {
            currentPath = hitResult.item;
            currentPath.selected = true;
        }
	} else if (currentMode === "FreeLine"){
		currentPath = new Path();
		currentPath.strokeColor = currentColour;
		currentPath.add(event.point);
	}else if (currentMode === "Polygon"){
		currentPath.selected = true;
		currentPath.strokeColor = "white";
		currentPath.add(event.point);
	}else{
		currentPath = new Path();
		currentPath.strokeColor = currentColour;
	}
}

function onMouseDrag(event){
	if (currentMode === "Select"){
		if (currentPath) {
            currentPath.position += event.delta;
            stuffChanged = true;
        }
	} else {
		stuffChanged = true;
		switch(currentMode){
			case "FreeLine":
				currentPath.add(event.point);
				break;
			case "StrLine":
				currentPath.remove();
				currentPath = new Path();
				currentPath.strokeColor = currentColour;
				currentPath.add(event.downPoint);
				currentPath.add(event.point);
				break;
			case "Rect":
				currentPath.remove();
				currentPath = new Path.Rectangle(new Point(event.downPoint), new Point(event.point));
				currentPath.strokeColor = currentColour;
				break;
			case "Square":
				currentPath.remove();
				deltaX = event.point.y - event.downPoint.y;
				currentPath = new Path.Rectangle(event.downPoint.x, event.downPoint.y, deltaX, deltaX);
				currentPath.strokeColor = currentColour;
				break;
			case "Ellipse":
				currentPath.remove();
				var rect = new Rectangle(new Point(event.downPoint), new Point(event.point));
				currentPath = new Path.Ellipse(rect);
				currentPath.strokeColor = currentColour;
				break;
			case "Circle":
				currentPath.remove();
				deltaX = event.point.y - event.downPoint.y;
				var square = new Rectangle(event.downPoint.x, event.downPoint.y, deltaX, deltaX);
				currentPath = new Path.Ellipse(square);
				currentPath.strokeColor = currentColour;
				break;

		}
	}
}

function onMouseUp(event){
	if (stuffChanged === true && currentMode != "Polygon"){
		updateCanvas();
	}
}

function updateCanvas(){
	var newDrawing = canvas.exportJSON();
	drawingStates.push(newDrawing);
}

