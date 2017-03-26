//GLOBALS
var canvas;
var savedDrawing;
var currentColour = "#000000"; //Default to black
var currentMode = "Select"; //Default to select mode
var currentAction = "None"; //Default to no action
var currentPath;
var pathCopy;
var drawingStates = [];
var undoStates = [];
var stuffChanged = true;
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
	$('#paperCanvas').css("cursor", "move");
});

//SET COLOUR
$("#colourPicker").on('input', function(){
	currentColour = $(this).val();
	textColour.innerText = "Colour: " + currentColour;
	$("#currentColour").css("color", $(this).val());
});

//CHOSE MODE
$(".mode").click(function(){
	$("#"+currentMode).removeClass("activeMode");
	if (currentPath && currentMode === "Polygon"){
		currentPath.remove();
	} else if (currentPath){
		currentPath.selected = false;
	}
	currentMode = $(this).attr('id');
	textMode.innerText = "Current Mode: " + currentMode;
	$("#"+currentMode).addClass("activeMode")
	if (currentMode != "Select"){
		$('#paperCanvas').css("cursor", "crosshair");
		$("#Cut").addClass("disabled");
		$("#Cut").css("pointer-events", "none");
		$("#Copy").addClass("disabled");
		$("#Copy").css("pointer-events", "none");
		$("#Paste").addClass("disabled");
		$("#Paste").css("pointer-events", "none");
	} else {
		$('#paperCanvas').css("cursor", "move");
		$("#Cut").removeClass("disabled");
		$("#Cut").css("pointer-events", "auto");
		$("#Copy").removeClass("disabled");
		$("#Copy").css("pointer-events", "auto");
		$("#Paste").removeClass("disabled");
		$("#Paste").css("pointer-events", "auto");
	}
	if (currentMode === "Polygon"){
		currentPath = new Path();
		$(".navbar-default .nav-sidebar .applyPolygon > a").css("display", "block");
	} else {
		$(".navbar-default .nav-sidebar .applyPolygon > a").css("display", "none");
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
			var undoState = drawingStates.pop();
			undoStates.push(undoState);
			canvas.clear();
			canvas.importJSON(drawingStates[drawingStates.length-1]);
			break;
		case "Redo":
			if (undoStates.length > 0){
				var redoState = undoStates.pop();
				drawingStates.push(redoState);
				canvas.clear();
				canvas.importJSON(drawingStates[drawingStates.length-1]);
			}
			break;
		case "Delete":
			currentPath.remove();
			updateCanvas();
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
		if(currentPath){
			currentPath.selected = false;
		}
		var hitResult = canvas.hitTest(event.point, hitOptions);
		if (!hitResult)
                return;
        if (hitResult) {
            currentPath = hitResult.item;
            currentPath.selected = true;
        }
	} else if (currentMode === "FreeLine"){
		undoStates = [];
		currentPath = new Path();
		currentPath.strokeColor = currentColour;
		currentPath.add(event.point);
	}else if (currentMode === "Polygon"){
		undoStates = [];
		currentPath.selected = true;
		currentPath.strokeColor = "white";
		currentPath.add(event.point);
	}else{
		undoStates = [];
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
	stuffChanged = false;
}

function updateCanvas(){
	if (currentPath) currentPath.selected = false;
	var newDrawing = canvas.exportJSON();
	drawingStates.push(newDrawing);
}

