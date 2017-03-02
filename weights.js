function getBarWeight(){
    var selectedBarRadioButton = document.querySelector('input[name="barType"]:checked');
    var barWeight = 0;
    if (selectedBarRadioButton) {
        barWeight = selectedBarRadioButton.value;
    }
    return parseFloat(barWeight);
}
function getTargetWeight(){
    var targetWeightInput = document.querySelector('input[name="targetWeight"]');
    var targetWeight = 0;
    if (targetWeightInput) {
        targetWeight = targetWeightInput.value || 0;
    }
    return parseFloat(targetWeight);
}
//calculates how much more weight needed from adding plates
function getPlateWeightNeeded(targetWeight, barWeight) {
    return (targetWeight - barWeight) / 2;
}
//calculates how much more weight needed from adding plates
function getAvailablePlates() {
    var availableWeightsInputs = document.querySelectorAll('input[name="availablePlates"]:checked');
    var availableWeights = [];
    for (var i = 0; i < availableWeightsInputs.length; i++) {
        availableWeights.push(parseFloat(availableWeightsInputs[i].value));
    }
    return availableWeights;
}
function clearErrorStates() {
    $('.has-error').removeClass('has-error');
    $('.hide').removeClass('hide');
    $('.help-block').hide();
}
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
function drawBarEnd(canvas, context, color, xStart, horizontalPadding, barThickness) {
    var yStart = (canvas.height - barThickness) / 2;
    var width = canvas.width - (xStart + horizontalPadding);
    var height = barThickness;
    context.fillStyle = 'black';
    context.fillRect(xStart, yStart - 1, width, height + 2);
    context.fillStyle = color;
    context.fillRect(xStart, yStart, width, height);
}
function drawPlate(canvas, context, xStart, plateDrawingConfiguration) {
    var outlineColor = 'black';
    var color = plateDrawingConfiguration.color;
    var textColor = plateDrawingConfiguration.textColor;
    var text = plateDrawingConfiguration.text;
    var plateThickness = plateDrawingConfiguration.thickness;
    var plateRadius = plateDrawingConfiguration.radius;

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
    $('#canvasWrapper').show();
    var canvas = $('canvas')[0];
    var context = canvas.getContext('2d');
    context.fillStyle="white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawBar(canvas, context, '#ccc', 20, 6);
    var xStart = canvas.width - 100;
    for (var i = 0; i < plateList.length; i++) {
        var plateDrawingConfiguration = plateDrawingConfigurations[plateList[i]];
        xStart -= plateDrawingConfiguration.thickness;
    }
    for (var i = 0; i < plateList.length; i++) {
        var plateDrawingConfiguration = plateDrawingConfigurations[plateList[i]];
        drawPlate(canvas, context, xStart, plateDrawingConfiguration);
        xStart += plateDrawingConfiguration.thickness;
    }
    drawBarEnd(canvas, context, '#ccc', xStart, 20, 14);
}
function addChangePlateText(targetWeight, remainingWeight) {
    $('#changePlatesText').show();
    $('#plateTotal').text(targetWeight - remainingWeight * 2);
    $('#weightRemaining').text(remainingWeight);
}
function calculate(event){
    event.preventDefault(); // no form action redirect
    clearErrorStates();


    var targetWeight = getTargetWeight(); //user input weight
    var barWeight = getBarWeight(); //user input guy or girl bar weight

    if (isValid(targetWeight, barWeight)) {
        //plates available
        var availablePlates = getAvailablePlates();
        $('#changePlatesText').hide();
        var plateWeightNeeded = getPlateWeightNeeded(targetWeight, barWeight);
        var neededPlates = getNeededPlates(plateWeightNeeded, availablePlates);
        if (neededPlates.remainingWeight) {
            addChangePlateText(targetWeight, neededPlates.remainingWeight);
        }
        draw(neededPlates.plateList);
    }

}
function getNeededPlates(plateWeightNeeded, availablePlates) {
    var plateList = [];

    // sort highest to lowest
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
    return {
        remainingWeight: plateWeightNeeded,
        plateList: plateList
    };
}