//GLOBALS
var currentColour = "black"; //Default to black
var currentMode = "Select"; //Default to select mode
var currentAction = ""; //Default to no action
var currentShape;
var selectedObjIndex = -1;
var currentPath;
var pathCopy;
var complPaths = [];
var incPaths = [];
var textMode;
var textAction;
var textColour;

$(document).ready(function(){
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
	if (currentMode === "Select"){
		selectedObjIndex++;
		if (complPaths[selectedObjIndex-1]){
			complPaths[selectedObjIndex-1].selected= false;
		}
		if (complPaths[selectedObjIndex]){
			complPaths[selectedObjIndex].selected = true;
		} else {
			selectedObjIndex = 0;
			if (complPaths[selectedObjIndex]){
				complPaths[selectedObjIndex].selected = true;
			}
		}
	} else {
		if (complPaths[selectedObjIndex]) complPaths[selectedObjIndex].selected = false;
	}
});

//CHOSE ACTION
$(".action").click(function(){
	currentAction = $(this).attr('id');
	switch(currentAction){
		case "Save":
			break;
		case "Load":
			break;
		case "Undo":
			if (currentMode === "Select"){

			}
			var incPath = complPaths.pop();
			if (incPath){
				incPath.visible = false;
				incPaths.push(incPath.clone());
			}
			break;
		case "Redo":
			var complPath = incPaths.pop();
			if (complPath){
				complPaths.push(complPath);
				complPath.visible = true;
			}
			break;
		case "Delete":
			break;
		case "Clear":
			break;
		case "Cut":
			if (complPaths[selectedObjIndex]){
				pathCopy = complPaths[selectedObjIndex].pop();
				pathCopy.visible = false;
				pathCopy.selected = false;
			}
			break;
		case "Copy":
			if (complPaths[selectedObjIndex]){
				pathCopy = complPaths[selectedObjIndex].clone();
				pathCopy.visible = false;
				pathCopy.selected = false;
			}
			break;
		case "Paste":
			if(pathCopy){
				if (complPaths[selectedObjIndex]){
					complPaths[selectedObjIndex].selected = false;
				}
				var pathPaste = pathCopy.clone();
				pathPaste.selected = true;
				pathPaste.position = new Point(view.center);
				pathPaste.visible = true;
				complPaths.push(pathPaste);
				selectedObjIndex = complPaths.length - 1;
			}
			break;
		case "Group":
			break;
		case "Ungroup":
			break;
	}
	textAction.innerText = "Last Action: " + currentAction;
});

function onMouseDown(event){
	if (currentMode === "Select" && complPaths[selectedObjIndex]){
		complPaths[selectedObjIndex].position = event.point;
	} else if (currentMode === "FreeLine"){
		incPaths = [];
		currentPath = new Path();
		currentPath.strokeColor = currentColour;
		currentPath.add(event.point);
	} else {
		incPaths = [];
		currentPath = new Path();
		currentPath.strokeColor = currentColour;
	}
}

function onMouseDrag(event){
	if (currentMode === "Select" && complPaths[selectedObjIndex]){
		complPaths[selectedObjIndex].position = event.point;
	} else {
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
				break;
			case "Ellipse":
				currentPath.remove();
				break;
			case "Circle":
				currentPath.remove();
				break;
			case "Polygon":
				currentPath.remove();
				break;
		}
	}
}

function onMouseUp(event){
	if(currentMode != "Select"){
		complPaths.push(currentPath);
	}
}



