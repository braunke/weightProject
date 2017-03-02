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
var plateDrawingConfigurations = {
    '55': {
        color: '#66f',
        textColor: 'black',
        text: '55',
        thickness: 20,
        radius: 60
    },
    '45': {
        color: '#f66',
        textColor: 'black',
        text: '45',
        thickness: 20,
        radius: 60
    },
    '35': {
        color: '#ff6',
        textColor: 'black',
        text: '35',
        thickness: 15,
        radius: 60
    },
    '25': {
        color: '#6f6',
        textColor: 'black',
        text: '25',
        thickness: 15,
        radius: 60
    },
    '15': {
        color: '#555',
        textColor: 'white',
        text: '15',
        thickness: 15,
        radius: 60
    },
    '10': {
        color: '#555',
        textColor: 'white',
        text: '10',
        thickness: 15,
        radius: 60
    },
    '5': {
        color: '#666',
        textColor: 'white',
        text: '5',
        thickness: 10,
        radius: 40
    },
    '2.5': {
        color: '#666',
        textColor: 'white',
        text: '2.5',
        thickness: 10,
        radius: 30
    },
    '1': {
        color: '#fff',
        textColor: 'black',
        text: '1',
        thickness: 10,
        radius: 20
    },
    '0.5': {
        color: '#66f',
        textColor: 'black',
        text: '0.5',
        thickness: 10,
        radius: 18
    },
};
function draw() {
    var canvas = $('canvas')[0];
    var context = canvas.getContext('2d');
    context.fillStyle="white";
    context.fillRect(0,0,canvas.width,canvas.height);
    drawBar(canvas, context, '#ccc', 20, 6);
    var platesToUse = [55, 45, 35, 25, 15, 10, 5, 2.5, 1, 0.5];
    var xStart = 100;
    for (var i = 0; i < platesToUse.length; i++) {
        var plateDrawingConfiguration = plateDrawingConfigurations[platesToUse[i]];
        drawPlate(canvas, context, xStart, plateDrawingConfiguration);
        xStart += plateDrawingConfiguration.thickness;
    }
}
function calculate(event){
    event.preventDefault(); // no form action redirect
    clearErrorStates();
    var targetWeight = getTargetWeight(); //user input weight
    var barWeight = getBarWeight(); //user input guy or girl bar weight

    if (isValid(targetWeight, barWeight)) {
        //plates available
        var availablePlates = getAvailablePlates();

        var plateWeightNeeded = getPlateWeightNeeded(targetWeight, barWeight);
        var plateList = getNeededPlates(plateWeightNeeded, availablePlates);
        console.log(plateList);
    }
    draw();
}
function getNeededPlates(plateWeightNeeded, availablePlates) {
    var plateList = [];

    // sort highest to lowest
    availablePlates = availablePlates.sort(function(a, b) {return a < b;});

    while (plateWeightNeeded != 0) {
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
        if (!plateAdded) {
            plateList.push('Add change plates that equal to ' + plateWeightNeeded);
            plateWeightNeeded = 0;
        }
    }
    return plateList;
}