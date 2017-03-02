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
function calculate(event){
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
    event.preventDefault(); // no form action redirect
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