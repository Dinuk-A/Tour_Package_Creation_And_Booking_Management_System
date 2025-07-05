//+++++++ fns to populate data into form elements +++++++++

// fill and display <option> inside <select> elements of forms (data recieved from databases)
const fillDataIntoDynamicSelectsOri = (tagId, msg, dataContainer, displayingPropertyName, selectedValue) => {

    tagId.innerHTML = "";

    //create the first option (a msg to notify users)
    if (msg != "") {
        const firstOption = document.createElement('option');
        firstOption.innerText = msg;
        firstOption.value = "";
        //firstOption.selected = true;
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

            }
        }

        tagId.appendChild(selectableOption);

    })

}

//new
const fillDataIntoDynamicSelects = (tagId, msg, dataContainer, displayingPropertyName, selectedValue) => {
    tagId.innerHTML = "";

    let foundMatch = false;

    // Create the first placeholder option
    if (msg !== "") {
        const firstOption = document.createElement('option');
        firstOption.innerText = msg;
        firstOption.value = "";
        firstOption.selected = true;
        firstOption.disabled = true;
        tagId.appendChild(firstOption);
    }

    // Create other options
    dataContainer.forEach((element) => {
        const selectableOption = document.createElement('option');
        selectableOption.innerText = element[displayingPropertyName];
        selectableOption.value = JSON.stringify(element);

        if (selectedValue && selectedValue === element[displayingPropertyName]) {
            foundMatch = true;
        }

        tagId.appendChild(selectableOption);
    });

    // ✅ set the selected value on the <select> itself
    if (foundMatch) {
        const matchedOption = [...tagId.options].find(opt => opt.text === selectedValue);
        if (matchedOption) {
            tagId.value = matchedOption.value;
        }
    }
};


//fill and display 2 values into the same <option>
const fillMultDataIntoDynamicSelects = (tagId, msg, dataContainer, displayingPropertyName1, displayingPropertyName2, selectedValue) => {

    tagId.innerHTML = "";

    if (msg != "") {
        const firstOption = document.createElement('option');
        firstOption.innerText = msg;
        firstOption.value = "";
        firstOption.selected = true;
        firstOption.disabled = true;
        tagId.appendChild(firstOption);
    }

    dataContainer.forEach((element) => {
        const selectableOption = document.createElement('option');
        selectableOption.innerText = element[displayingPropertyName1] + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + element[displayingPropertyName2];
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
const disableFutureDate = (calenderTagId) => {
    let now = new Date();
    let todayDate = (now.toISOString().split('T'))[0];
    calenderTagId.max = todayDate;
}


// ++++++++++++++ fns to validate user inputted data ++++++++++++

//validate text inputs
const inputValidatorText = (inputTagId, pattern, object, property) => {

    //define a pattern
    const regXP = new RegExp(pattern);

    //get the current value of the input field
    const currentValue = inputTagId.value

    //run all this only if there is a value entered
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
const dynamicSelectValidator = (selectTagId, object, property) => {

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
const staticSelectValidator = (selectTagId, object, property) => {

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
const dataListValidator = (fieldId, dataListName, object, property, displayProperty) => {

    const fieldValue = fieldId.value;

    if (fieldValue !== "") {
        let dataList = window[dataListName];
        let existIndex = -1;
        for (const index in dataList) {
            if (fieldValue == dataList[index][displayProperty]) {
                existIndex = index
                break;
            }
        }
        if (existIndex != -1) {
            window[object][property] = dataList[existIndex];
            fieldId.style.border = '2px solid lime';
        } else {
            fieldId.style.border = '2px solid red';
            window[object][property] = null
        }
    } else {
        fieldId.style.border = '2px solid red';
        window[object][property] = null
    }
}