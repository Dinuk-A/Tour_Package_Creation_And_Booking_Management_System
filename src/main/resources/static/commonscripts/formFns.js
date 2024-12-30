//+++++++ fns to populate data into form elements +++++++++

// fill and display <option> inside <select> elements of forms (data recieved from databases)
const fillDataIntoDynamicDropDowns = (tagId, msg, dataContainer, displayingPropertyName, selectedValue) => {

    tagId.innerHTML = "";

    //create the first option (a msg to notify users)
    if (msg != "") {
        const firstOption = document.createElement('option');
        firstOption.innerText = msg;
        firstOption.value = "";
        firstOption.selected = true;
        firstOption.disabled = true;
        tagId.appendChild(firstOption);
    }

    //create other options (actual selectable values)
    dataContainer.forEach((element) => {
        const selectableOption = document.createElement('option');
        selectableOption.innerText = element[displayingPropertyName];
        selectableOption.value = JSON.stringify(element);

        //next part will only needed in form refills(when editing) or when a value given to selected by default
        //while going through all the data list and if this given value is found, select it(that option) by default
        if (selectedValue != "") {
            if (selectedValue == element[displayingPropertyName]) {
                selectableOption.selected = true;

                //for testing
                console.log('match found' + selectedValue + selectableOption.innerText);
            }
        }

        tagId.appendChild(selectableOption);

    })

}

//fill and display 2 values into the same <option>
const fillTwoValuesIntoDynamicDropDown = (tagId, msg, dataContainer, displayingPropertyName1, displayingPropertyName2, selectedValue) => {

    tagId.innerHTML = "";

    if (msg != "") {
        const firstOption = document.createElement('option');
        firstOption.innerText = msg;
        firstOption.value = "";
        firstOption.selected = true;
        firstOption.disabled = true;
    }

    dataContainer.forEach((element) => {
        const selectableOption = document.createElement('option');
        selectableOption.innerText = element[displayingPropertyName1] + "  " + element[displayingPropertyName2];
        selectableOption.value = JSON.stringify(element);

        if (selectedValue != "") {
            if (selectedValue == element[displayingPropertyName1] || selectedValue == element[displayingPropertyName2]) {
                selectableOption.selected = true;
            }
        }

        tagId.appendChild(selectableOption);

    })

}

//fill data into a datalist
const fillDataIntoDynamicDataList = (datalistId, dataContainer, displayingPropertyName) => {

    datalistId.innerHTML = "";

    for (const element of dataContainer) {
        const option = document.createElement('option');
        option.value = element[displayingPropertyName];
        datalistId.appendChild(option);
    }

}

// ++++++++++++ fns to control data selection ++++++++++

//restrict choosing future dates (maximum choosing date is today)
const disableChoosingFutureDate = (calenderTagId) => {
    let now = new Date();
    let todayDate = (now.toISOString().split('T'))[0];
    calenderTagId.max = todayDate;
}


// ++++++++++++++ fns to validate user inputted data ++++++++++++

//validate text inputs
const inputValidatorText = (inputTagId, pattern, object, property) => {

    const regXP = new RegExp(pattern);
    const currentValue = inputTagId.value

    //run all this only if a value is entered
    if (currentValue != "") {

        if (regXP.test(currentValue)) {
            inputTagId.style.border = "2px solid lime";
            window[object][property] = currentValue;
        } else {
            inputTagId.style.border = "2px solid red";
            window[object][property] = null;
        }

        //run this if no value is entered
    } else {
        window[object][property] = null;

        //if this field is marked as required turn to red, else default colour
        if (inputTagId.required) {
            inputTagId.style.border = "2px solid red";
        } else {
            inputTagId.style.border = "2px solid #ced4da";
        }
    }
}

//validate selected options (dynamic select tags)
const validateDynamicSelectVals = (selectTagId, object, property) => {

    const selectedValue = selectTagId.value;

    if (selectedValue != "") {
        selectTagId.style.border = "2px solid lime";
        window[object][property] = JSON.parse(selectedValue);
    } else {
        selectTagId.style.border = "2px solid red";
        window[object][property] = null;
    }

}

//validate selected options (static select tags)
const validateStaticSelectVals = (selectTagId, object, property) => {

    const selectedValue = selectTagId.value;

    if (selectedValue != "") {
        selectTagId.style.border = "2px solid lime";
        window[object][property] = selectedValue;
    } else {
        selectTagId.style.border = "2px solid red";
        window[object][property] = null;
    }

}

//datalist validation