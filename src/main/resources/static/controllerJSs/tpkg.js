window.addEventListener('load', () => {

    buildTpkgTable();
    refreshTpkgForm();
    refreshAddiCostForm()

});

//global var to store id of the table
let sharedTableId = "mainTableTpkg";

//declared globally because needed for filterings
let allItineraryTemplates = [];

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshTpkgForm();
        }
    });
});


//to create and refresh content in main table
const buildTpkgTable = async () => {
    try {
        const tpkgs = await ajaxGetReq("/tpkg/all");

        const tableColumnInfo = [
            { displayType: 'function', displayingPropertyOrFn: showTpkgType, colHeadName: 'Type' },
            { displayType: 'text', displayingPropertyOrFn: 'pkgcode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'pkgtitle', colHeadName: 'Title' },
            { displayType: 'function', displayingPropertyOrFn: showTpkgStatus, colHeadName: 'Status' }
        ]

        createTable(tableTpkgHolderDiv, sharedTableId, tpkgs, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build table:", error);
    }
}

//to support fill main table
const showTpkgType = (tpkgObj) => {
    if (!tpkgObj.is_custompkg) {
        return "Template"
    } else {
        return "For Website"
    }
}

//to support fill main table
const showTpkgStatus = (tpkgObj) => {

    if (tpkgObj.deleted_tpkg == null || tpkgObj.deleted_tpkg == false) {
        if (tpkgObj.tpkg_status == "Draft") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Draft
                </p>`;
        } else if (tpkgObj.tpkg_status == "Confirmed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #3498db; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Confirmed
                </p>`;
        } else if (tpkgObj.tpkg_status == "Completed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Completed
                </p>`;
        }
    } else if (tpkgObj.deleted_tpkg != null && tpkgObj.deleted_tpkg == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
}

//to ready the main form 
const refreshTpkgForm = async () => {

    tpkg = new Object();
    tpkg.dayplans = new Array();
    document.getElementById('formTpkg').reset();

    //ajax's to fill days/templates
    try {
        const vehiTypes = await ajaxGetReq("/vehitypes/all");
        fillDataIntoDynamicSelects(tpkgVehitype, 'Select Vehicle Type', vehiTypes, 'vehi_type_name', 'name');

        const districts = await ajaxGetReq("district/all");
        fillDataIntoDynamicSelects(dpTemplateStartDistrictInTpkg, 'Please Select District', districts, 'name');

        //this will be only fetched yet,later will be filtered by districts
        allItineraryTemplates = await ajaxGetReq("dayplan/onlytemplatedays");

    } catch (error) {
        console.error("Failed to fetch form data:", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputPkgTitle',
        'inputPkgCode',
        'tpStartDateInput',
        'tpDescription',
        'tpkgLocalAdultCount',
        'tpkgLocalChildCount',
        'tpkgForeignAdultCount',
        'tpkgForeignChildCount',
        'tpkgVehitype',
        'tpNote',
        'tpSelectStatus'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    document.getElementById('tpkgLocalAdultCount').value = 0;
    document.getElementById('tpkgLocalChildCount').value = 0;
    document.getElementById('tpkgForeignAdultCount').value = 0;
    document.getElementById('tpkgForeignChildCount').value = 0;

    const radioIdsToReset = [
        'customTP',
        'forWebSite',
        'yathraVehiCB',
        'rentalVehiCB',
        'yathraDriverCB',
        'rentalDriverCB',
        'guideYesCB',
        'guideNoCB',
        'yathraGuideCB',
        'rentalGuideCB'
    ];

    radioIdsToReset.forEach(id => {
        const radio = document.getElementById(id);
        if (radio) {
            radio.checked = false;
            radio.disabled = false;
        }
    });

}

//set status auto
const setTpkgStatus = () => {
    const tpkgStatusSelectElement = document.getElementById('tpSelectStatus');
    tpkg.tpkg_status = "Draft";
    tpkgStatusSelectElement.value = "Draft";
    tpkgStatusSelectElement.style.border = "2px solid lime";
    tpkgStatusSelectElement.children[2].classList.add('d-none');
    tpkgStatusSelectElement.children[3].classList.add('d-none');
    tpkgStatusSelectElement.children[4].classList.add('d-none');
    tpkgStatusSelectElement.children[5].classList.add('d-none');
}

//for first 2 radio buttons
const changesTpkgCustomOrTemp = () => {
    //if a custom package
    if (customTP.checked) {

        tpkg.is_custompkg = true;

        // hide
        tpDescRow.classList.add('d-none');
        imagesFieldset.classList.add('d-none');

        //change step name
        document.getElementById('tpkgStep3-tab').innerText = "Preferences"

        // show again (if previously for website selected)
        startDateCol.classList.remove('d-none');
        preferencesFieldset.classList.remove('d-none');
        document.getElementById('tpkgStep4-tab').parentElement.classList.remove('d-none');

        //unbind if previously binded values are exist
        tpkg.web_discription = null;
        tpkg.img1 = null;
        tpkg.img2 = null;
        tpkg.img3 = null;

        //refresh border colours + remove frontend values
        tpDescription.style.border = "1px solid #ced4da";

        //calcTotalDayCount();


        //if a package is for show in website
    } else if (forWebSite.checked) {

        tpkg.is_custompkg = false;

        // unhide
        tpDescRow.classList.remove('d-none');
        imagesFieldset.classList.remove('d-none');

        //change step name
        document.getElementById('tpkgStep3-tab').innerText = "Images"

        // hide
        startDateCol.classList.add('d-none');
        preferencesFieldset.classList.add('d-none');
        document.getElementById('tpkgStep4-tab').parentElement.classList.add('d-none');

        //unbind if previously binded values are exist
        tpkg.tourstartdate = null;
        tpkg.tourenddate = null;
        tpkg.localadultcount = null;
        tpkg.localchildcount = null;
        tpkg.foreignadultcount = null;
        tpkg.foreignchildcount = null;

        // Array of input field IDs to reset
        const inputTagsIds = [

            'tpStartDateInput',
            'tpDescription',
            'tpkgLocalAdultCount',
            'tpkgLocalChildCount',
            'tpkgForeignAdultCount',
            'tpkgForeignChildCount',
            'tpkgVehitype',
            'tpSelectStatus'

        ];

        //clear out any previous styles
        inputTagsIds.forEach((fieldID) => {
            const field = document.getElementById(fieldID);
            if (field) {
                field.style.border = "1px solid #ced4da";
                field.value = '';
            }
        });

        document.getElementById('tpkgLocalAdultCount').value = 0;
        document.getElementById('tpkgLocalChildCount').value = 0;
        document.getElementById('tpkgForeignAdultCount').value = 0;
        document.getElementById('tpkgForeignChildCount').value = 0;

    }
}

//adults counts must be >0 in order to fill the child counts
const enableChildCountInputs = () => {
    if (parseInt(tpkgLocalAdultCount.value) > 0 || parseInt(tpkgForeignAdultCount.value) > 0) {
        tpkgLocalChildCount.disabled = false;
        tpkgForeignChildCount.disabled = false;

        //autofocus test
        // tpkgLocalChildCount.focus();

    } else {
        tpkgLocalChildCount.disabled = true;
        tpkgForeignChildCount.disabled = true;
        tpkg.localchildcount = 0;
        tpkg.foreignchildcount = 0;

    }
}

// to calculate total travellers
const updateTotalTravellers = () => {
    const localAdult = parseInt(document.getElementById('tpkgLocalAdultCount').value) || 0;
    const localChild = parseInt(document.getElementById('tpkgLocalChildCount').value) || 0;
    const foreignAdult = parseInt(document.getElementById('tpkgForeignAdultCount').value) || 0;
    const foreignChild = parseInt(document.getElementById('tpkgForeignChildCount').value) || 0;

    const total = localAdult + localChild + foreignAdult + foreignChild;

    document.getElementById('tpkgTotalTravellers').value = total;
}

//not used 💥
const filterDayPlanTemplatesByDistrict = () => {
    const rawValue = document.getElementById('dpTemplateStartDistrictInTpkg').value;
    const selectedDistrict = JSON.parse(rawValue);

    const filteredTemplates = allItineraryTemplates.filter(dp =>
        dp.start_district_id && dp.start_district_id.id === selectedDistrict.id
    );

    displayFilteredTemplates(filteredTemplates);
}

//not used 💥
const displayFilteredTemplates = (templates) => {
    const container = document.getElementById('availableDayTemplatesContainer');
    container.innerHTML = ''; // Clear previous results

    if (templates.length === 0) {
        container.innerHTML = '<p class="text-muted">No templates found for this district.</p>';
        return;
    }

    templates.forEach(dp => {
        const div = document.createElement('div');
        div.className = 'border p-2 mb-2 rounded bg-light';

        // Title row
        const titleDiv = document.createElement('div');
        titleDiv.className = 'fw-bold';
        titleDiv.textContent = dp.title || 'Untitled';

        // Bottom row with code and button
        const bottomRow = document.createElement('div');
        bottomRow.className = 'd-flex justify-content-between align-items-center';

        const codeText = document.createElement('small');
        codeText.className = 'text-muted';
        codeText.textContent = dp.dayplancode;

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-outline-primary';
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => openDayPlanModal(dp.dayplancode, dp.title || 'Untitled');

        bottomRow.appendChild(codeText);
        bottomRow.appendChild(viewBtn);

        // Append to main card
        div.appendChild(titleDiv);
        div.appendChild(bottomRow);

        container.appendChild(div);
    });

}

//this will be needed to change the functionality and text of a button , based on the type of middle day
let midDayType = null; // "template" or "existing"

// to reset data in dynamic selects
const resetSelectElements = (selectElement, defaultText = "Please Select") => {
    selectElement.disabled = false;
    selectElement.innerHTML = '';
    const defaultOption = document.createElement("option");
    defaultOption.text = defaultText;
    defaultOption.value = "";
    selectElement.add(defaultOption);
}

// to load templates 
const loadTemplates = async (selectElementId) => {

    if (tpkg.sd_dayplan_id?.id == null || tpkg.sd_dayplan_id == undefined) {
        showFirstDayBtn.disabled = true;
    }

    if (tpkg.ed_dayplan_id?.id == null || tpkg.ed_dayplan_id == undefined) {
        showFinalDayBtn.disabled = true;
    }

    try {
        const onlyTemplates = await ajaxGetReq("/dayplan/onlytemplatedays");
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyTemplates, "daytitle");
        midDayType = "template";
    } catch (error) {
        console.error("Error loading templates:", error);
    }
};

// to load existing first days
const loadExistingFDs = async (selectElementId) => {

    showFirstDayBtn.disabled = true;

    try {
        const onlyFirstDays = await ajaxGetReq("/dayplan/onlyfirstdays");
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyFirstDays, "daytitle");
        midDayType = "existing";
    } catch (error) {
        console.error("Error loading existing days:", error);
    }
};

// to load existing mid days
const loadExistingMDs = async (selectElementId) => {

    try {
        const onlyMidDays = await ajaxGetReq("/dayplan/onlymiddays");
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyMidDays, "daytitle");
        midDayType = "existing";
    } catch (error) {
        console.error("Error loading existing days:", error);
    }
};

// to load existing last days
const loadExistingLDs = async (selectElementId) => {

    showFinalDayBtn.disabled = true;

    try {
        const onlyLastDays = await ajaxGetReq("/dayplan/onlylastdays");
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyLastDays, "daytitle");
        midDayType = "existing";
    } catch (error) {
        console.error("Error loading existing days:", error);
    }
};

//show selected day plan's info on a model
const showDayPlanDetails = (selectElementId) => {

    // Clear previous details
    document.getElementById('dpInfoInTpkgIsTemplate').innerText = '';
    document.getElementById('tempInfoDisRow').classList.add('d-none');

    document.getElementById('dpInfoInTpkgCode').innerText = '';
    document.getElementById('dpInfoInTpkgTitle').innerText = '';
    document.getElementById('dpInfoInTpkgStartLocation').innerText = '';
    document.getElementById('dpInfoInTpkgDropPoint').innerText = '';
    document.getElementById('dpInfoInTpkgLunchPlace').innerText = '';
    document.getElementById('dpInfoInTpkgNote').innerText = '';
    document.getElementById('dpInfoInTpkgPlaces').innerHTML = '';

    // Get the selected option value
    const selectedOption = document.getElementById(selectElementId).value;

    //parse the selected option to get the day plan info
    const selectedDayPlan = JSON.parse(selectedOption);

    console.log(selectedDayPlan);

    // Show template info if it's a template
    if (selectedDayPlan.is_template) {
        document.getElementById('tempInfoDisRow').classList.remove('d-none');
        document.getElementById('dpInfoInTpkgIsTemplate').innerText = 'This Is A Template Itinerary';
    } else {
        document.getElementById('tempInfoDisRow').classList.add('d-none');
        document.getElementById('dpInfoInTpkgIsTemplate').innerText = '';
    }

    // Set basic fields
    document.getElementById('dpInfoInTpkgCode').innerText = selectedDayPlan.dayplancode || 'N/A';
    document.getElementById('dpInfoInTpkgTitle').innerText = selectedDayPlan.daytitle || 'N/A';

    document.getElementById('dpInfoInTpkgStartLocation').innerText =
        selectedDayPlan.pickuppoint || (selectedDayPlan.pickup_stay_id && selectedDayPlan.pickup_stay_id.name) || 'N/A';

    document.getElementById('dpInfoInTpkgLunchPlace').innerText =
        selectedDayPlan.lunchplace_id?.name || (selectedDayPlan.is_takepackedlunch ? 'Take Packed Lunch' : 'N/A');

    document.getElementById('dpInfoInTpkgDropPoint').innerText =
        selectedDayPlan.drop_stay_id?.name || selectedDayPlan.droppoint || 'N/A';

    // Set visiting places
    const placesElement = document.getElementById('dpInfoInTpkgPlaces');
    if (Array.isArray(selectedDayPlan.vplaces) && selectedDayPlan.vplaces.length > 0) {
        const placeItems = selectedDayPlan.vplaces.map((place, index) =>
            `<li>${index + 1}. ${place.name}</li>`
        );
        placesElement.innerHTML = placeItems.join('');
    } else {
        placesElement.innerHTML = '<li>N/A</li>';
    }

    // Set additional notes
    document.getElementById('dpInfoInTpkgNote').innerText = selectedDayPlan.note || 'N/A';

    // Get reference to the Edit button
    const editBtn = document.getElementById('dayPlanInfoEditBtn');

    // Update button based on global midDayType
    if (midDayType === null) {
        editBtn.disabled = true;
        editBtn.textContent = 'Edit';
    } else if (midDayType === 'template') {
        editBtn.disabled = false;
        editBtn.textContent = 'Edit Template';
    } else if (midDayType === 'existing') {
        editBtn.disabled = false;
        editBtn.textContent = 'Save As New';
    }

    //open modal
    const modal = new bootstrap.Modal(document.getElementById('dayPlanModal'));
    modal.show();

}

//this will be needed for create dyamic IDs in mid days
let midDayCounter = 1;

const generateNormalDayPlanSelectSections = () => {

    const container = document.getElementById('tpkgMidDaysSelectSection');

    const selectId = `tpkgMidDaySelect${midDayCounter}`;
    const btnId = `showMidDayBtn${midDayCounter}`;
    const actionRowId = `midDayActionBtnsRow${midDayCounter}`;

    // Outer container
    const outerDiv = document.createElement('div');
    outerDiv.className = 'col-12 mt-0';

    // Row
    const row = document.createElement('div');
    row.className = 'row border border-secondary rounded p-3 mb-3 bg-white shadow-sm';

    // Row 1: Day selector
    const selectorRow = document.createElement('div');
    selectorRow.className = 'col-12 d-flex align-items-center';

    const labelCol = document.createElement('div');
    labelCol.className = 'col-2';
    const label = document.createElement('label');
    label.htmlFor = selectId;
    label.className = 'form-label';
    label.textContent = `Middle Day ${midDayCounter} :`;
    labelCol.appendChild(label);

    const selectCol = document.createElement('div');
    selectCol.className = 'col-7';
    const select = document.createElement('select');
    select.id = selectId;
    select.disabled = true;
    select.className = 'form-control form-select';
    select.onchange = function () {

        const selectedValue = JSON.parse(this.value);
        console.log("Selected DayPlan:", selectedValue);

        const selectedDayNum = this.parentNode.parentNode.children[0].children[0].innerText.split(" ")[2];
        console.log("Selected Day Number:", selectedDayNum);
        const index = parseInt(selectedDayNum) - 1;

        let isDuplicate = tpkg.dayplans.some(dp => dp.id === selectedValue.id);

        if (isDuplicate) {
            alert("This DayPlan has already been selected!");
            this.value = "";
            this.style.border = "2px solid red";

            document.getElementById(btnId).disabled = false;
            document.getElementById(`midDayDeleteBtn${currentIndex}`).disabled = false;

        } else {
            this.style.border = "2px solid lime";

            // Ensure tpkg.dayplans is initialized(uncomment this if insertions didnt work)
            //some arrays cant insert elements for specific indexes if its empty
            //while (tpkg.dayplans.length <= index) {
            //    tpkg.dayplans.push(null);
            //}

            tpkg.dayplans[index] = selectedValue;
            console.log("Updated tpkg.dayplans:", tpkg.dayplans);

            document.getElementById(btnId).disabled = false;
            //document.getElementById(`midDayDeleteBtn${midDayCounter}`).disabled = false;
            document.getElementById(`midDayDeleteBtn${currentIndex}`).disabled = false;
        }

    };

    selectCol.appendChild(select);

    const btnCol = document.createElement('div');
    btnCol.className = 'col-3 d-flex justify-content-end gap-2';
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.id = btnId;
    viewBtn.disabled = true;
    viewBtn.className = 'btn btn-all';
    viewBtn.textContent = 'View';
    viewBtn.onclick = () => {
        showDayPlanDetails(selectId);
    };
    btnCol.appendChild(viewBtn);

    //will be needed for delete button
    const currentIndex = midDayCounter;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-outline-danger btn-sm';
    deleteBtn.innerText = "Delete";
    deleteBtn.id = `midDayDeleteBtn${midDayCounter}`;
    deleteBtn.onclick = () => {
        deleteMidDay(currentIndex);
    };
    btnCol.appendChild(deleteBtn);

    // Assemble selector row
    selectorRow.appendChild(labelCol);
    selectorRow.appendChild(selectCol);
    selectorRow.appendChild(btnCol);

    // Row 2: Action buttons
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'col-12 mt-3';
    actionsWrapper.id = actionRowId;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex flex-wrap gap-2';

    const createBtn = document.createElement('button');
    createBtn.className = 'btn btn-outline-success btn-sm';
    createBtn.innerHTML = `<i class="bi bi-plus-circle me-1"></i> Create New`;

    const templateBtn = document.createElement('button');
    templateBtn.className = 'btn btn-outline-primary btn-sm';
    templateBtn.onclick = () => {
        loadTemplates(select);
    };
    templateBtn.innerHTML = `<i class="bi bi-pencil-square me-1"></i> Use Template`;

    const existingBtn = document.createElement('button');
    existingBtn.className = 'btn btn-outline-secondary btn-sm';
    existingBtn.onclick = () => {
        loadExistingMDs(select);
    };
    existingBtn.innerHTML = `<i class="bi bi-archive me-1"></i> Use Existing`;

    // Assemble buttons
    btnGroup.appendChild(createBtn);
    btnGroup.appendChild(templateBtn);
    btnGroup.appendChild(existingBtn);

    actionsWrapper.appendChild(btnGroup);

    // Final assembly
    row.appendChild(selectorRow);
    row.appendChild(actionsWrapper);
    outerDiv.appendChild(row);
    container.appendChild(outerDiv);

    midDayCounter++;
}

// Function to delete a new mid-day select section
const deleteMidDay = (index) => {

    const select = document.getElementById(`tpkgMidDaySelect${index}`);

    // Remove from tpkg.dayplans if a valid plan was selected
    if (select && select.value && select.value.trim() !== "") {
        try {
            const deletedDayPlan = JSON.parse(select.value);
            tpkg.dayplans = tpkg.dayplans.filter(dp => dp && dp.id !== deletedDayPlan.id);
        } catch (err) {
            console.warn("Invalid JSON in select value, skipping removal from tpkg.dayplans");
        }
    }

    // Remove from DOM
    const row = select.closest('.row').parentElement;
    row.remove();

    // Shift remaining selects and update IDs/texts
    for (let i = index + 1; i < midDayCounter; i++) {
        const oldSelect = document.getElementById(`tpkgMidDaySelect${i}`);
        if (!oldSelect) continue;

        const oldRow = oldSelect.closest('.row').parentElement;
        const newIndex = i - 1;

        oldSelect.id = `tpkgMidDaySelect${newIndex}`;
        oldRow.querySelector('label').textContent = `Middle Day ${newIndex} :`;
        oldRow.querySelector('label').setAttribute('for', `tpkgMidDaySelect${newIndex}`);
        oldRow.querySelector('button.btn-all').id = `showMidDayBtn${newIndex}`;
        oldRow.querySelector('div.col-12.mt-3').id = `midDayActionBtnsRow${newIndex}`;
        oldRow.querySelector(`#midDayDeleteBtn${i}`).id = `midDayDeleteBtn${newIndex}`;
    }

    midDayCounter--;
};

//check errors before adding
const checkTpkgFormErrors = () => {

    let errors = "";

    if (tpkg.daytitle == null) {
        errors += "Title cannot be empty \n";
    }

    if (tpkg.is_custompkg == null) {
        errors += " Please select the type of package \n";
    }

    if (tpkg.sd_dayplan_id == null) {
        errors += " Please select the first day plan \n";
    }

    if (tpkg.ed_dayplan_id == null) {
        errors += " Please select the Last day plan \n";
    }

    if ((tpkg.localadultcount == null || tpkg.localadultcount < 0) && (tpkg.foreignadultcount == null || tpkg.foreignadultcount < 0)) {
        errors += "At least one adult count must be greater than 0 \n";
    }

    if (tpkg.tpkg_status == null) {
        errors += "Please select the status of the package \n";
    }

    if (tpkg.is_custompkg && tpkg.tourstartdate == null) {
        errors += "Please select the start date of the tour \n";
    }

    if (!tpkg.is_custompkg && (tpkg.web_discription == null || tpkg.web_discription == "")) {
        errors += "Please enter the description for the website \n";
    }

    if (!tpkg.is_custompkg && (tpkg.img1 == null || tpkg.img1 == "")) {
        errors += "Please upload the first image for the website \n";
    }

    if (!tpkg.is_custompkg && (tpkg.img2 == null || tpkg.img2 == "")) {
        errors += "Please upload the second image for the website \n";
    }

    if (!tpkg.is_custompkg && (tpkg.img3 == null || tpkg.img3 == "")) {
        errors += "Please upload the third image for the website \n";
    }

    return errors;


}






//######### additional costs related codes 

const refreshAddiCostForm = () => {

    addiCostList = new Array(); 
    addiCost = new Object();

    document.getElementById('additionalCostForm').reset();

    const inputTagsIds = [
        'additionalCostName',
        'additionalCostAmount',
        'additionalCostNote'
    ]
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });


}

//check errors in additional costs form
const checkAddiCostFormErrors = () => {

    let errors = "";

    if (addiCost.costname == null || addiCost.costname.trim() === "") {
        errors += "Cost Name cannot be empty \n";
    }

    if (addiCost.amount == null || addiCost.amount <= 0) {
        errors += "Please enter a valid amount greater than 0 \n";
    }

    return errors;
}

//for additional costs table 
let addCostIdCounter = 1;
let editingRowData = null;

//add a new additional cost to the table
const addNewAddCostOri = () => {

    const nameInput = document.getElementById('additionalCostName')
    const amountInput = document.getElementById('additionalCostAmount')
    const noteInput = document.getElementById('additionalCostNote')

    const name = nameInput.value
    const amount = amountInput.value
    const note = noteInput.value

    if (!name || !amount) {
        alert("Please enter both Cost Name and Amount.");
        return;
    }

    // Create new row
    const tbody = document.getElementById('additionalCostTableBody');
    const row = document.createElement('tr');

    // ID cell
    const idCell = document.createElement('td');
    idCell.innerText = addCostIdCounter++;
    row.appendChild(idCell);

    // Cost Name cell
    const nameCell = document.createElement('td');
    nameCell.innerText = name;
    row.appendChild(nameCell);

    // Amount cell
    const amountCell = document.createElement('td');
    amountCell.innerText = `LKR ${parseFloat(amount).toFixed(2)}`;
    row.appendChild(amountCell);

    // Action cell
    const actionCell = document.createElement('td');
    actionCell.className = 'text-center';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group btn-group-sm';

    // View button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-outline-primary';
    viewBtn.innerText = 'View';
    viewBtn.onclick = function () {
        alert(`Note: ${note || 'No note provided'}`);
    };
    btnGroup.appendChild(viewBtn);

    // Edit button (placeholder)
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline-secondary';
    editBtn.innerText = 'Edit';
    editBtn.onclick = function () {
        editingRowData = {
            rowElement: row,
            costName: name,
            amount: amount,
            note: note
        };
        refillAdditionalCostForm();
    };
    btnGroup.appendChild(editBtn);

    // Delete button (placeholder)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger';
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = function () {
        row.remove();
    };
    btnGroup.appendChild(deleteBtn);

    actionCell.appendChild(btnGroup);
    row.appendChild(actionCell);

    tbody.appendChild(row);

    // Reset the form
    //document.getElementById('additionalCostForm').reset();
    nameInput.style.border = "1px solid #ced4da";
    amountInput.style.border = "1px solid #ced4da";
    noteInput.style.border = "1px solid #ced4da";

    nameInput.value = '';
    amountInput.value = '';
    noteInput.value = '';
}

const addNewAddCost = () => {

    const errors = checkAddiCostFormErrors();
    if (errors) {
        alert(errors);
        return;
    }
    
    const name = addiCost.costname.trim();
    const amount = parseFloat(addiCost.amount);
    const note = addiCost.note?.trim() || '';

    // Create new row
    const tbody = document.getElementById('additionalCostTableBody');
    const row = document.createElement('tr');

    // ID cell
    const idCell = document.createElement('td');
    idCell.innerText = addCostIdCounter++;
    row.appendChild(idCell);

    // Cost Name cell
    const nameCell = document.createElement('td');
    nameCell.innerText = name;
    row.appendChild(nameCell);

    // Amount cell
    const amountCell = document.createElement('td');
    amountCell.innerText = `LKR ${amount.toFixed(2)}`;
    row.appendChild(amountCell);

    // Action cell
    const actionCell = document.createElement('td');
    actionCell.className = 'text-center';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group btn-group-sm';

    // View button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-outline-primary';
    viewBtn.innerText = 'View';
    viewBtn.onclick = function () {
        alert(`Note: ${note || 'No note provided'}`);
    };
    btnGroup.appendChild(viewBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline-secondary';
    editBtn.innerText = 'Edit';
    editBtn.onclick = function () {
        editingRowData = {
            rowElement: row,
            costName: name,
            amount: amount,
            note: note
        };
        refillAdditionalCostForm();
    };
    btnGroup.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger';
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = function () {
        row.remove();
    };
    btnGroup.appendChild(deleteBtn);

    actionCell.appendChild(btnGroup);
    row.appendChild(actionCell);

    tbody.appendChild(row);

    // Reset the form object and input fields
    addiCost.costname = '';
    addiCost.amount = '';
    addiCost.note = '';

    document.getElementById('additionalCostName').value = '';
    document.getElementById('additionalCostAmount').value = '';
    document.getElementById('additionalCostNote').value = '';

    // Reset styles if needed
    document.getElementById('additionalCostName').style.border = "1px solid #ced4da";
    document.getElementById('additionalCostAmount').style.border = "1px solid #ced4da";
    document.getElementById('additionalCostNote').style.border = "1px solid #ced4da";
};


//refill the addi cost form to edit
const refillAdditionalCostForm = () => {
    // Populate form fields
    document.getElementById('additionalCostName').value = editingRowData.costName;
    document.getElementById('additionalCostAmount').value = editingRowData.amount;
    document.getElementById('additionalCostNote').value = editingRowData.note || '';

    // Show Update button, hide Add button
    //document.getElementById('addCostAddBtn').style.display = 'none';
    //document.getElementById('addCostUpdateBtn').style.display = 'inline-block';
}

//edit and update a row on additional costs table
const updateAddCostOri = () => {

    const updatedName = document.getElementById('additionalCostName').value;
    const updatedAmount = document.getElementById('additionalCostAmount').value;
    const updatedNote = document.getElementById('additionalCostNote').value;

    // Update the row in the table
    const cells = editingRowData.rowElement.children;
    cells[1].innerText = updatedName;
    cells[2].innerText = `LKR ${parseFloat(updatedAmount).toFixed(2)}`;

    // Update the "View" button note handler
    const viewBtn = editingRowData.rowElement.querySelector('button.btn-outline-primary');
    viewBtn.onclick = () => {
        alert(`Note: ${updatedNote || 'No note provided'}`);
    };

    // Update the editBtn with the new data
    const editBtn = editingRowData.rowElement.querySelector('button.btn-outline-secondary');
    editBtn.onclick = () => {
        editingRowData = {
            rowElement: editingRowData.rowElement,
            costName: updatedName,
            amount: updatedAmount,
            note: updatedNote
        };
        refillAdditionalCostForm();
    };

    document.getElementById('addCostAddBtn').style.display = 'inline-block';
    document.getElementById('addCostUpdateBtn').style.display = 'none';
    editingRowData = null;

};

const updateAddCost = () => {
    
    // Update the table row with the values from addiCost object
    const cells = editingRowData.rowElement.children;
    cells[1].innerText = addiCost.costname;
    cells[2].innerText = `LKR ${parseFloat(addiCost.amount).toFixed(2)}`;

    // Update the "View" button note handler
    const viewBtn = editingRowData.rowElement.querySelector('button.btn-outline-primary');
    viewBtn.onclick = () => {
        alert(`Note: ${addiCost.note || 'No note provided'}`);
    };

    // Update the editBtn with the new data
    const editBtn = editingRowData.rowElement.querySelector('button.btn-outline-secondary');
    editBtn.onclick = () => {
        editingRowData = {
            rowElement: editingRowData.rowElement,
            costName: addiCost.costname,
            amount: addiCost.amount,
            note: addiCost.note
        };
        refillAdditionalCostForm();
    };

    // Reset UI buttons and clear editing state
    document.getElementById('addCostAddBtn').style.display = 'inline-block';
    document.getElementById('addCostUpdateBtn').style.display = 'none';
    editingRowData = null;
};


//update the total additional cost
const updateTotalAmount = () => {
    let total = 0;
    additionalCosts.forEach(item => {
        total += Number(item.amount);
    });
    document.getElementById("additionalCostTotalAmount").textContent = total.toFixed(2);
}








