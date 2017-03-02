//this gets the bar choice from the user, found info on query selectors from W3schools
function getBarWeight(){
    var selectedBarRadioButton = document.querySelector('input[name="barType"]:checked');
    var barWeight = 0;
    if (selectedBarRadioButton) {
        barWeight = selectedBarRadioButton.value;
    }
    //turns bar weight into floating number
    return parseFloat(barWeight);
}
//this gets the target weight the user enters
function getTargetWeight(){
    var targetWeightInput = document.querySelector('input[name="targetWeight"]');
    var targetWeight = 0;
    if (targetWeightInput) {
        targetWeight = targetWeightInput.value;
    }
    return parseFloat(targetWeight);
}
//calculates how much more weight needed from adding plates, divided by two since I am just calculating the plates for one side
function getPlateWeightNeeded(targetWeight, barWeight) {
    return (targetWeight - barWeight) / 2;
}
//checks which plate choices were picked and puts them into a list
function getAvailablePlates() {
    var availableWeightsInputs = document.querySelectorAll('input[name="availablePlates"]:checked');
    var availableWeights = [];
    for (var i = 0; i < availableWeightsInputs.length; i++) {
        availableWeights.push(parseFloat(availableWeightsInputs[i].value));
    }
    return availableWeights;
}
//clears the error messages if the user fixes input mistakes
function clearErrorStates() {
    $('.has-error').removeClass('has-error');
    $('.hide').removeClass('hide');
    $('.help-block').hide();
}
//function to check if user inputs are correct
function isValid(targetWeight, barWeight) {
    var valid = true;
    if (!barWeight) {
        $('#barTypeFormGroup').addClass('has-error');
        $('#barTypeRequiredMessage').show();
        valid = false;
    }
    if (!targetWeight) {
        $('#targetWeightFormGroup').addClass('has-error');
        $('#targetWeightRequiredMessage').show();
        valid = false;
    } else if (targetWeight < barWeight) {
        $('#targetWeightFormGroup').addClass('has-error');
        $('#minimumTargetWeightMessage').show();
        valid = false;
    }
    return valid;
}
//function that draws the bar onto the canvas
function drawBar(canvas, context, color, horizontalPadding, barThickness) {
    var xStart = horizontalPadding;
    var yStart = (canvas.height - barThickness) / 2;
    var width = canvas.width - (horizontalPadding * 2);
    var height = barThickness;
    context.fillStyle = 'black';
    context.fillRect(xStart, yStart - 1, width, height + 2);
    context.fillStyle = color;
    context.fillRect(xStart, yStart, width, height);
}
//function that creates the thicker bar ends
function drawBarEnd(canvas, context, color, xStart, horizontalPadding, barThickness) {
    var yStart = (canvas.height - barThickness) / 2;
    var width = canvas.width - (xStart + horizontalPadding);
    var height = barThickness;
    context.fillStyle = 'black';
    context.fillRect(xStart, yStart - 1, width, height + 2);
    context.fillStyle = color;
    context.fillRect(xStart, yStart, width, height);
}
//function to draw plates, each plate has its own configurations that are pulled from a seperate file
function drawPlate(canvas, context, xStart, plateDrawingConfiguration) {
    var outlineColor = 'black';
    var color = plateDrawingConfiguration.color;
    var textColor = plateDrawingConfiguration.textColor;
    var text = plateDrawingConfiguration.text;
    var plateThickness = plateDrawingConfiguration.thickness;
    var plateRadius = plateDrawingConfiguration.radius;
    //I used two circles and a rectangle to create each plate
    context.fillStyle = color;
    context.beginPath();
    context.arc(xStart, canvas.height / 2, plateRadius, 0, 2*Math.PI);
    context.stroke();
    context.fill();

    context.fillStyle = outlineColor;
    context.fillRect(xStart, (canvas.height / 2) - plateRadius - 1, plateThickness, (plateRadius * 2) + 2);
    context.fillStyle = color;
    context.fillRect(xStart, (canvas.height / 2) - plateRadius, plateThickness, plateRadius * 2);

    context.fillStyle = color;
    context.beginPath();
    context.arc(xStart + plateThickness, canvas.height / 2, plateRadius, 0, 2*Math.PI);
    context.stroke();
    context.fill();

    context.fillStyle = textColor;
    context.fillText(text, xStart + 2 - plateRadius, canvas.height / 2);
}

function draw(plateList) {
    //creates canvas and calls the draw methods
    //used some code from w3schools to create canvas
    $('#canvasWrapper').show();
    var canvas = $('canvas')[0];
    var context = canvas.getContext('2d');
    context.fillStyle="white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawBar(canvas, context, '#ccc', 20, 6);
    var xStart = canvas.width - 100;
    //draws the plates in the list, as its draws plates the x start is moved over as new plates are added so they are not ontop of each other

    for (var i = 0; i < plateList.length; i++) {
        var plateDrawingConfiguration = plateDrawingConfigurations[plateList[i]];
        drawPlate(canvas, context, xStart, plateDrawingConfiguration);
        xStart += plateDrawingConfiguration.thickness;
    }
    //draws bar end on top of plates, uses xStart so it doesn't cover all the plates
    drawBarEnd(canvas, context, '#ccc', xStart, 20, 14);
}
//if the math doesn't work out evenly this function is called to show text about what the user has to do to reach target weight
//note-change plates are what smaller plates like .5lb, 1lb or even smaller are refered to as
function addChangePlateText(targetWeight, remainingWeight) {
    $('#changePlatesText').show();
    $('#plateTotal').text(targetWeight - remainingWeight * 2);
    $('#weightRemaining').text(remainingWeight);
}
function calculate(event){
    event.preventDefault(); // no form action redirect
    clearErrorStates();


    var targetWeight = getTargetWeight(); //user input weight
    var barWeight = getBarWeight(); //user input mens or womens bar weight

    if (isValid(targetWeight, barWeight)) {
        //plates available
        var availablePlates = getAvailablePlates();
        $('#changePlatesText').hide();
        var plateWeightNeeded = getPlateWeightNeeded(targetWeight, barWeight);
        var neededPlates = getNeededPlates(plateWeightNeeded, availablePlates);
        //if there is remaining weights the addchangeplatetext is called and takes in target weight and remainign weight
        if (neededPlates.remainingWeight) {
            addChangePlateText(targetWeight, neededPlates.remainingWeight);
        }
        //calls the function to draw the plates and sends the platelist to it
        draw(neededPlates.plateList);
    }

}
//function that calculates how many and what kind of plates are needed and puts them into a list
//sorted from ighest to lowest
function getNeededPlates(plateWeightNeeded, availablePlates) {
    var plateList = [];
    availablePlates = availablePlates.sort(function(a, b) {return a < b;});
    var plateAdded = true;
    while (plateAdded) {
        var plateAdded = false;
        for (i = 0; i < availablePlates.length; i++) {
            var plate = availablePlates[i];
            if (plateWeightNeeded >= plate) {
                plateWeightNeeded -= plate;
                plateList.push(plate);
                plateAdded = true;
                break;
            }
        }
    }
    //returns the plate list and any left over weight
    //stackoverflow had some info on how to return two bits of info with the return statement
    return {
        remainingWeight: plateWeightNeeded,
        plateList: plateList
    };
}