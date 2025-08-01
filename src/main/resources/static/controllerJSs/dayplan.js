window.addEventListener('load', () => {

    buildDayPlanTable();
    refreshDayPlanForm();
    refreshDistrictFilter();

});

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//globally available
let allStays = [];
let allProvinces = [];
let allDistricts = [];
let allActiveInqsInDp = [];
let dayplans = [];

//global var to store id of the table
let sharedTableId = "mainTableDayPlan";

//global vars to store pickup point's geo coords
let pickupPointGCoords = '';
let dropoffPointGCoords = '';

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const tableDayPlanHolderDivElement = document.getElementById('tableDayPlanHolderDiv');
    if (!tableDayPlanHolderDivElement) {
        return;
    }

    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            document.getElementById('dayTypeMsgForTemplate').classList.add("d-none");
            document.getElementById('pickupMsgForTemplate').classList.add("d-none");
            document.getElementById('noLunchMsgForTemplate').classList.add("d-none");
            document.getElementById('dpCodeRow').classList.add("d-none");
            refreshDayPlanForm();
        }
    });
});

//to create and refresh content in main dayplan table
const buildDayPlanTable = async () => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const tableDayPlanHolderDivElement = document.getElementById('tableDayPlanHolderDiv');
    if (!tableDayPlanHolderDivElement) {
        return;
    }

    try {
        dayplans = await ajaxGetReq("/dayplan/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'dayplancode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'daytitle', colHeadName: 'Title' },
            { displayType: 'function', displayingPropertyOrFn: showDayType, colHeadName: 'Type' },
            { displayType: 'function', displayingPropertyOrFn: showDayPlanStatus, colHeadName: 'Status' }
        ]

        createTable(tableDayPlanHolderDiv, sharedTableId, dayplans, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable({
            destroy: true, // Allows re-initialization
            searching: false, // Remove the search bar
            info: false, // Show entries count
            pageLength: 10, // Number of rows per page
            ordering: false,// Remove up and down arrows
            lengthChange: false // Disable ability to change the number of rows
            // dom: 't', // Just show the table (t) with no other controls
        });

    } catch (error) {
        console.error("Failed to build day plan table:", error);
    }

}

//fill districts in filter
const refreshDistrictFilter = async () => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const tableDayPlanHolderDivElement = document.getElementById('tableDayPlanHolderDiv');
    if (!tableDayPlanHolderDivElement) {
        return;
    }

    let districts = [];

    try {
        districts = await ajaxGetReq("/district/all");
        let allDistrictsObj = {
            id: -10,
            name: "All Districts",
            province_id: 99
        };

        districts.unshift(allDistrictsObj);
        fillDataIntoDynamicSelects(dayDistrictFilter, 'Please Select The District', districts, 'name');

    } catch (error) {
        console.error("Error fetching districts for filter:", error);
    }

}

//filter by both day type and district
const applyDayTableFilter = () => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const tableDayPlanHolderDivElement = document.getElementById('tableDayPlanHolderDiv');
    if (!tableDayPlanHolderDivElement) {
        return;
    }

    const selectedDayType = document.getElementById('daytypeFilter').value;

    const selectedDistrictRaw = document.getElementById('dayDistrictFilter').value;
    let selectedDistrict = null;

    if (selectedDistrictRaw && selectedDistrictRaw !== '') {
        try {
            selectedDistrict = JSON.parse(selectedDistrictRaw);
        } catch (e) {
            console.warn("Invalid district filter JSON. Ignoring district filter.");
        }
    }

    let filteredDays = dayplans.filter(day => {
        let isTypeMatch = true;
        let isDistrictMatch = true;

        // Match by day type
        if (selectedDayType && selectedDayType !== "All") {
            const dayType = day.dayplancode.slice(0, 2);
            //or dayplancode.substring(0,2)
            isTypeMatch = dayType === selectedDayType;
        }

        // Match by district (if set)
        if (selectedDistrict && selectedDistrict.id !== -10) {
            isDistrictMatch = day.start_district_id?.id === selectedDistrict.id;
        }

        return isTypeMatch && isDistrictMatch;
    });

    $(sharedTableId).empty();

    if ($.fn.DataTable.isDataTable(sharedTableId)) {
        $(sharedTableId).DataTable().clear().destroy();
    }

    const tableColumnInfo = [
        { displayType: 'text', displayingPropertyOrFn: 'dayplancode', colHeadName: 'Code' },
        { displayType: 'text', displayingPropertyOrFn: 'daytitle', colHeadName: 'Title' },
        { displayType: 'function', displayingPropertyOrFn: showDayType, colHeadName: 'Type' },
        { displayType: 'function', displayingPropertyOrFn: showDayPlanStatus, colHeadName: 'Status' }
    ];

    createTable(tableDayPlanHolderDiv, sharedTableId, filteredDays, tableColumnInfo);

    setTimeout(() => {
        $(`#${sharedTableId}`).DataTable({
            searching: false,
            info: false,
            pageLength: 10,
            ordering: false,
            lengthChange: false
        });
    }, 100);
};

//reset
function resetDayPlanFilters() {
    document.getElementById('daytypeFilter').value = '';
    document.getElementById('dayDistrictFilter').value = '';
    applyDayTableFilter();
}

//to support fill main table
const showDayType = (dpObj) => {
    if (dpObj.is_template) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #9b59b6; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Template
            </p>`;
    } else {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #16a085; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Custom
            </p>`;
    }
};

//to support fill main table
const showDayPlanStatus = (dpObj) => {

    if (dpObj.deleted_dp == null || dpObj.deleted_dp == false) {
        if (dpObj.dp_status == "Draft") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Draft
                </p>`;
        } else if (dpObj.dp_status == "Confirmed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #3498db; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Confirmed
                </p>`;
        } else if (dpObj.dp_status == "Completed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Completed
                </p>`;
        } else if (dpObj.dp_status == "Finalized") {
            return `
                    <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                       style="background-color: #145A32; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                       Finalized
                    </p>`;
        }
    } else if (dpObj.deleted_dp != null && dpObj.deleted_dp == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
}

//to reset and ready the main form 
const refreshDayPlanForm = async () => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const dpFormElement = document.getElementById('formDayPlan');
    if (!dpFormElement) {
        return;
    }

    dayplan = new Object();
    dayplan.vplaces = new Array();

    try {
        allStays = await ajaxGetReq('/stay/all');
        allProvinces = await ajaxGetReq("/province/all");
        allDistricts = await ajaxGetReq("/district/all");
    } catch (error) {
        console.error('failed to fetch provinces,districts and stays')
    }
  
    document.getElementById('formDayPlan').reset();

    document.getElementById('dayTypeMsgForTemplate').classList.add("d-none");
    document.getElementById('pickupMsgForTemplate').classList.add("d-none");
    document.getElementById('noLunchMsgForTemplate').classList.add("d-none");

    try {
        //const allProvinces = await ajaxGetReq("/province/all");

        fillDataIntoDynamicSelects(selectVPProv, 'Please Select The Province', allProvinces, 'name');
        fillDataIntoDynamicSelects(selectLPProv, 'Please Select The Province', allProvinces, 'name');
        fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name');
        fillDataIntoDynamicSelects(pickupProvinceSelect, 'Please Select The Province', allProvinces, 'name');

    } catch (error) {
        console.error("Failed to fetch Provinces : ", error);
    }

    //get the logged user's emp id to filter inquiries assigned to him
    const loggedEmpId = document.getElementById('loggedUserEmpIdSectionId').textContent;
    console.log(loggedEmpId);

    // refresh based inq field active inquiries of the logged user
    try {
        allActiveInqs = await ajaxGetReq("/inq/personal/active?empid=" + loggedEmpId);
        fillMultDataIntoDynamicSelects(dpBasedInq, 'Please select based inquiry', allActiveInqs, 'inqcode', 'clientname');
        dpBasedInq.disabled = true;
    } catch (error) {
        console.error("Failed to fetch inquiries for assigned user:", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'dpTitle',
        'dpBasedInq',
        'selectDPStartProv',
        'selectDPStartDist',
        'selectVPProv',
        'selectVPDist',
        'selectLPProv',
        'selectLPDist',
        'selectDPLunch',
        'dropOffProvinceSelect',
        'dropOffDistrictSelect',
        'dropOffAccommodationSelect',
        'altStay1Select',
        'altStay2Select',
        'pickupProvinceSelect',
        'pickupDistrictSelect',
        'pickupAccommodationSelect',
        'airportSelect',
        'manualLocationPickup',
        'geoCoords',
        'airportSelectDropOff',
        'manualLocationDropOff',
        'geoCoordsDropOff',
        'dpTotalCostForToday',
        'dpNote',
        'allVPs',
        'selectedVPs',
        'dpSelectStatus',
        'dpTotalKMcount',
        'dpTotalLocalAdultTktCost',
        'dpTotalLocalChildTktCost',
        'dpTotalForeignAdultTktCost',
        'dpTotalForeignChildTktCost',
        'dpTotalVehiParkingCost'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            //field.value = '';
            if ('value' in field) {
                field.value = '';
            } else {
                field.textContent = 'LKR 0.00';
            }
        }
    });

    const radioIdsToReset = [
        'dpTemplate',
        'dpNotTemplate',
        'firstDayCB',
        'middleDayCB',
        'lastDayCB',
        'generalPickupCB',
        'accommodationsPickupCB',
        'manualPickupCB',
        'packedLunchYes',
        'packedLunchNo',
        'generalDropOffCB',
        'accommodationsDropOffCB',
        'manualDropOffCB'

    ];

    radioIdsToReset.forEach(id => {
        const radio = document.getElementById(id);
        if (radio) {
            radio.checked = false;
            radio.disabled = false;
        }
    });

    //disable back these radios
    const radioIdsOfDayTypes = [
        'firstDayCB',
        'middleDayCB',
        'lastDayCB'
    ];

    radioIdsOfDayTypes.forEach((radioId) => {
        const radioCB = document.getElementById(radioId);
        if (radioCB) {
            radioCB.disabled = false;
        }
    });

    //must target label for the radio buttons to change cursor style
    radioIdsOfDayTypes.forEach((radioId) => {
        const radioLabel = document.querySelector(`label[for="${radioId}"]`);
        if (radioLabel) {
            radioLabel.style.cursor = "pointer";
        }
    });

    // show EMPTY district selects, before filtered by province
    emptyArray = [];
    //fillDataIntoDynamicSelects(selectDPStartDist, 'Select The Province First', districts, 'name');
    fillDataIntoDynamicSelects(selectVPDist, 'Select The Province First', emptyArray, 'name');
    fillDataIntoDynamicSelects(selectLPDist, 'Select The Province First', emptyArray, 'name');
    fillDataIntoDynamicSelects(dropOffDistrictSelect, 'Select The Province First', emptyArray, 'name');
    fillDataIntoDynamicSelects(pickupDistrictSelect, 'Select The Province First', emptyArray, 'name');

    //show EMPTY accomadation selects, before filtered by district
    fillDataIntoDynamicSelects(dropOffAccommodationSelect, 'Select The District First', emptyArray, 'name');
    fillDataIntoDynamicSelects(altStay1Select, 'Select The District First', emptyArray, 'name');
    fillDataIntoDynamicSelects(altStay2Select, 'Select The District First', emptyArray, 'name');
    fillDataIntoDynamicSelects(pickupAccommodationSelect, 'Select The District First', emptyArray, 'name');

    //show EMPTY lunch selects, before filtered by district
    fillDataIntoDynamicSelects(selectDPLunch, 'select the District first', emptyArray, 'name')

    //show EMPTY visiting places selects, before filtered by district
    fillDataIntoDynamicSelects(allVPs, 'select the District first', emptyArray, 'name');

    //show EMPTY selected visiting places selects
    fillDataIntoDynamicSelects(selectedVPs, 'Selected Places', emptyArray, 'name');

    dpUpdateBtn.disabled = true;
    dpUpdateBtn.style.cursor = "not-allowed";

    dpAddBtn.disabled = false;
    dpAddBtn.style.cursor = "pointer";

    dpResetBtn.classList.remove("d-none");

    setDayPlanStatus();
}

//to select the pickup type(general,accomodations,stays)
const selectPickupType = (radio) => {

    const selected = radio.value;

    const generalDiv = document.getElementById('generalPickupOptions');
    const accomDiv = document.getElementById('accommodationPickupOptions');
    const manualDiv = document.getElementById('manualPickupOptions');

    // Hide all first
    generalDiv.style.display = 'none';
    accomDiv.style.display = 'none';
    manualDiv.style.display = 'none';

    // Show the selected section
    if (selected === 'GENERAL') {
        generalDiv.style.display = 'block';
    } else if (selected === 'ACCOMMODATIONS') {
        accomDiv.style.display = 'block';
    } else if (selected === 'MANUAL') {
        manualDiv.style.display = 'block';
    }
}

//to select the dropoff type(general,accomodations,stays)
const selectDropOffType = (radio) => {

    const selected = radio.value;

    const generalDiv = document.getElementById('generalDropOffOptions');
    const accomDiv = document.getElementById('accommodationDropOffOptions');
    const manualDiv = document.getElementById('manualDropOffOptions');

    // Hide all first
    generalDiv.style.display = 'none';
    accomDiv.style.display = 'none';
    manualDiv.style.display = 'none';

    // Show the selected section
    if (selected === 'GENERAL') {
        generalDiv.style.display = 'block';
    } else if (selected === 'ACCOMMODATIONS') {
        accomDiv.style.display = 'block';
    } else if (selected === 'MANUAL') {
        manualDiv.style.display = 'block';
    }

    dayplan.drop_stay_id = null;
}

//when general cb is selected in pickup options
const clearOtherInputsGenPickup = () => {

    const inputTagsIds = [
        'pickupProvinceSelect',
        'pickupDistrictSelect',
        'pickupAccommodationSelect',
        'manualLocationPickup',
        'geoCoords',
        'dpTotalKMcount'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dayplan.pickuppoint = null;
    dayplan.pickup_stay_id = null;
    dayplan.pick_manual_gcoords = null;
    pickupPointGCoords = '';
    document.getElementById('dpTotalKMcount').style.border = "1px solid #ced4da";
    dayplan.totalkmcount = null;
    document.getElementById('pickupDistrictSelect').disabled = true;
    document.getElementById('pickupAccommodationSelect').disabled = true;

}

//when manual stay is selected in pickup options 
const clearOtherInputsStayPickup = () => {

    console.log("clearOtherInputsStayPickup called");

    const inputTagsIds = [
        'manualLocationPickup',
        'geoCoords',
        'airportSelect',
        'dpTotalKMcount'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dayplan.pickuppoint = null;
    dayplan.pickup_stay_id = null;
    dayplan.pick_manual_gcoords = null;
    pickupPointGCoords = '';
    document.getElementById('dpTotalKMcount').style.border = "1px solid #ced4da";
    dayplan.totalkmcount = null;
}

//when manual cb is selected in pickup options
const clearOtherInputsManualPickup = () => {

    const inputTagsIds = [
        'pickupProvinceSelect',
        'pickupDistrictSelect',
        'pickupAccommodationSelect',
        'airportSelect',
        'dpTotalKMcount'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dayplan.pickuppoint = null;
    dayplan.pickup_stay_id = null;
    dayplan.pick_manual_gcoords = null;
    pickupPointGCoords = '';
    document.getElementById('dpTotalKMcount').style.border = "1px solid #ced4da";
    dayplan.totalkmcount = null;
    document.getElementById('pickupDistrictSelect').disabled = true;
    document.getElementById('pickupAccommodationSelect').disabled = true;
}

//when general cb is selected in dropoff options
const clearOtherInputsGenDropOff = () => {

    const inputTagsIds = [
        'dropOffProvinceSelect',
        'dropOffDistrictSelect',
        'dropOffAccommodationSelect',
        'altStay1Select',
        'altStay2Select',
        'manualLocationDropOff',
        'geoCoordsDropOff',
        'dpTotalKMcount'
    ];

    // Clear out any previous styles and values
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dayplan.droppoint = null;
    dayplan.drop_stay_id = null;
    dayplan.alt_stay_1_id = null;
    dayplan.alt_stay_2_id = null;
    dayplan.drop_manual_gcoords = null;
    dropoffPointGCoords = '';
    document.getElementById('dpTotalKMcount').style.border = "1px solid #ced4da";
    dayplan.totalkmcount = null;
    document.getElementById('dropOffDistrictSelect').disabled = true;
    document.getElementById('dropOffAccommodationSelect').disabled = true;
    document.getElementById('altStay1Select').disabled = true;
    document.getElementById('altStay2Select').disabled = true;
}

//when manual stay is selected in dropoff options
const clearOtherInputsStayDropOff = () => {

    const inputTagsIds = [
        'manualLocationDropOff',
        'geoCoordsDropOff',
        'airportSelectDropOff',
        'dpTotalKMcount'
    ];

    // clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dayplan.droppoint = null;
    dayplan.drop_stay_id = null;
    dayplan.drop_manual_gcoords = null;
    dropoffPointGCoords = '';
    document.getElementById('dpTotalKMcount').style.border = "1px solid #ced4da";
    dayplan.totalkmcount = null;
}



//when manual cb is selected in dropoff options
const clearOtherInputsManualDropOff = () => {

    const inputTagsIds = [
        'dropOffProvinceSelect',
        'dropOffDistrictSelect',
        'dropOffAccommodationSelect',
        'altStay1Select',
        'altStay2Select',
        'airportSelectDropOff',
        'dpTotalKMcount'
    ];

    // clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dayplan.droppoint = null;
    dayplan.drop_stay_id = null;
    dayplan.alt_stay_1_id = null;
    dayplan.alt_stay_2_id = null;
    dayplan.drop_manual_gcoords = null;
    dropoffPointGCoords = '';
    document.getElementById('dpTotalKMcount').style.border = "1px solid #ced4da";
    dayplan.totalkmcount = null;
    document.getElementById('dropOffDistrictSelect').disabled = true;
    document.getElementById('dropOffAccommodationSelect').disabled = true;
    document.getElementById('altStay1Select').disabled = true;
    document.getElementById('altStay2Select').disabled = true;
}

//first , mid or last selection
const handleDayTypeFMLSelection = () => {

    const fdRadio = document.getElementById('firstDayCB');
    const mdRadio = document.getElementById('middleDayCB');
    const ldRadio = document.getElementById('lastDayCB');

    // Store current selection
    const selectedType = fdRadio.checked ? 'FD' : mdRadio.checked ? 'MD' : ldRadio.checked ? 'LD' : null;

    const hasPickupOrDrop =
        dayplan.pickuppoint != null ||
        dayplan.pickup_stay_id != null ||
        dayplan.droppoint != null ||
        dayplan.drop_stay_id != null ||
        pickupPointGCoords !== '' ||
        dropoffPointGCoords !== '';

    if (hasPickupOrDrop) {
        const userConfirm = confirm("Changing the day type will reset pickup/drop-off details. Do you want to continue?");
        if (userConfirm) {
            refreshDayPlanForm();

            setTimeout(() => {
                if (selectedType === 'FD') {
                    fdRadio.checked = true;
                    selectDayType(fdRadio);
                } else if (selectedType === 'MD') {
                    mdRadio.checked = true;
                    selectDayType(mdRadio);
                } else if (selectedType === 'LD') {
                    ldRadio.checked = true;
                    selectDayType(ldRadio);
                }
            }, 50);
        }
    } else {
        if (selectedType === 'FD') {
            selectDayType(fdRadio);
        } else if (selectedType === 'MD') {
            selectDayType(mdRadio);
        } else if (selectedType === 'LD') {
            selectDayType(ldRadio);
        }
    }

    //enable title field
    document.getElementById('dpTitle').disabled = false;

};

//to select day type (FD,MD,LD)
const selectDayType = (feild) => {
    dayplan.dayplancode = feild.value;

    const cbAirPortPickup = document.getElementById('generalPickupCB');
    const selectAirPortPickup = document.getElementById('airportSelect');
    const cbAirPortDropOff = document.getElementById('generalDropOffCB');
    const selectAirPortDropOff = document.getElementById('airportSelectDropOff');

    if (dayplan.dayplancode == "MD") {

        cbAirPortPickup.checked = false;
        cbAirPortPickup.disabled = true;
        cbAirPortPickup.style.cursor = "not-allowed";
        selectAirPortPickup.value = "";
        selectAirPortPickup.style.border = '1px solid #ced4da';
        dayplan.pickuppoint = null;
        pickupPointGCoords = '';

        cbAirPortDropOff.checked = false;
        cbAirPortDropOff.disabled = true;
        cbAirPortDropOff.style.cursor = "not-allowed";
        selectAirPortDropOff.value = "";
        selectAirPortDropOff.style.border = '1px solid #ced4da';
        dayplan.droppoint = null;
        dropoffPointGCoords = '';

    } else if (dayplan.dayplancode == "FD") {

        cbAirPortPickup.disabled = false;
        cbAirPortDropOff.disabled = true;
        cbAirPortPickup.style.cursor = "pointer";
        cbAirPortDropOff.style.cursor = "not-allowed";

        //reset the airport select elements
        selectAirPortPickup.value = "";
        selectAirPortPickup.style.border = '1px solid #ced4da';
        dayplan.pickuppoint = null;
        pickupPointGCoords = '';

        selectAirPortDropOff.value = "";
        selectAirPortDropOff.style.border = '1px solid #ced4da';
        dayplan.droppoint = null;
        dropoffPointGCoords = '';

    } else if (dayplan.dayplancode == "LD") {

        cbAirPortPickup.disabled = true;
        cbAirPortPickup.style.cursor = "not-allowed";

        cbAirPortDropOff.disabled = false;
        cbAirPortDropOff.style.cursor = "pointer";

        //reset the airport select elements
        selectAirPortPickup.value = "";
        selectAirPortPickup.style.border = '1px solid #ced4da';
        dayplan.pickuppoint = null;
        pickupPointGCoords = '';

    }

    else if (dayplan.dayplancode == "TP") {

        cbAirPortPickup.disabled = false;
        cbAirPortPickup.style.cursor = "pointer";

        selectAirPortPickup.value = "";
        selectAirPortPickup.style.border = '1px solid #ced4da';
        dayplan.pickuppoint = null;
        pickupPointGCoords = '';

        //selectAirPortDropOff.value = "";
        //selectAirPortDropOff.style.border = '1px solid #ced4da';
        //dayplan.droppoint = null;
        //dropoffPointGCoords = '';

    }
}

//handle values when the day type radio is selected
//const handleDayTypeRadio = (fieldId) => {
//    dayplan.is_template = fieldId.value;
//}

const handleDayPlanTypeSelection = () => {

    const isTemp = document.getElementById('dpTemplate');
    const isCust = document.getElementById('dpNotTemplate');

    // track which option was selected BEFORE reset
    const selectedMethod = isTemp.checked ? 'template' : isCust.checked ? 'custom' : null;

    if (dayplan.pickuppoint != null || dayplan.pickup_stay_id != null || dayplan.lunchplace_id != null || dayplan.is_takepackedlunch != null) {
        const userConfirm = confirm("Changing the Day Type will reset all current data. Do you want to continue?");
        if (userConfirm) {
            refreshDayPlanForm();

            setTimeout(() => {
                if (selectedMethod === 'template') {
                    isTemp.checked = true;
                } else if (selectedMethod === 'custom') {
                    isCust.checked = true;
                }

                changesBasedDPType();
            }, 50);

        }
    } else {
        changesBasedDPType();
    }
}


//mulin template dila, data fill karala, passe custom karana eka awulak na 
//mulin custom dila. data fill karala passe template dunnoth data wadiy+awul

//handle changes based on dp type(Template or not)
const changesBasedDPType = () => {

    const titleInput = document.getElementById('dpTitle');

    if (dpTemplate.checked) {
        //template day
        dayplan.is_template = true;
        titleInput.disabled = false;

        dpBasedInq.disabled = true;
        dpBasedInq.value = "";
        dpBasedInq.style.border = '1px solid #ced4da';

        //show these messages 
        document.getElementById('dayTypeMsgForTemplate').classList.remove("d-none");
        document.getElementById('pickupMsgForTemplate').classList.remove("d-none");
        document.getElementById('noLunchMsgForTemplate').classList.remove("d-none");

        //disable these radios
        const radioIds = [
            'firstDayCB',
            'middleDayCB',
            'lastDayCB',
            'generalPickupCB',
            'accommodationsPickupCB',
            'manualPickupCB',
            'packedLunchYes',
            'packedLunchNo'
        ];

        radioIds.forEach((radioId) => {
            const radioCB = document.getElementById(radioId);
            if (radioCB) {
                radioCB.disabled = true;
                radioCB.checked = false;
            }
        });

        //must target label for the radio buttons to change cursor style
        radioIds.forEach((radioId) => {
            const radioLabel = document.querySelector(`label[for="${radioId}"]`);
            if (radioLabel) {
                radioLabel.style.cursor = "not-allowed";
            }
        });

        //remove border, remove input value, remove dp attribute value, global var
        dayplan.pickuppoint = null;
        //dayplan.totalkmcount = null;
        dayplan.is_takepackedlunch = null;
        dayplan.lunchplace_id = null;

        dayplan.dp_basedinq = null;

        const lunchProv = document.getElementById('selectLPProv');
        const lunchDist = document.getElementById('selectLPDist');
        const lunchHotel = document.getElementById('selectDPLunch');

        lunchProv.disabled = true;
        lunchProv.style.border = '1px solid #ced4da';
        lunchDist.disabled = true;
        lunchDist.style.border = '1px solid #ced4da';
        lunchHotel.disabled = true;
        lunchHotel.style.border = '1px solid #ced4da';
        lunchHotel.value = "";

        lunchProv.options[0].disabled = false;
        lunchProv.selectedIndex = 0;
        lunchProv.options[0].disabled = true;

        lunchDist.options[0].disabled = false;
        lunchDist.selectedIndex = 0;
        lunchDist.options[0].disabled = true;

        lunchHotel.options[0].disabled = false;
        lunchHotel.selectedIndex = 0;
        lunchHotel.options[0].disabled = true;

        document.getElementById('generalPickupOptions').classList.add("d-none");
        document.getElementById('airportSelect').value = "";
        document.getElementById('airportSelect').style.border = '1px solid #ced4da';

        document.getElementById('accommodationPickupOptions').classList.add("d-none");
        document.getElementById('pickupProvinceSelect').value = "";
        document.getElementById('pickupProvinceSelect').style.border = '1px solid #ced4da';
        document.getElementById('pickupDistrictSelect').value = "";
        document.getElementById('pickupDistrictSelect').style.border = '1px solid #ced4da';
        document.getElementById('pickupAccommodationSelect').value = "";
        document.getElementById('pickupAccommodationSelect').style.border = '1px solid #ced4da';

        document.getElementById('manualPickupOptions').classList.add("d-none");
        document.getElementById('manualLocationPickup').value = "";
        document.getElementById('geoCoords').style.border = '1px solid #ced4da';
        document.getElementById('manualLocationPickup').value = "";
        document.getElementById('geoCoords').style.border = '1px solid #ced4da';

        document.getElementById('calcDistanceRow').classList.add("d-none");
        document.getElementById('dpTotalKMcount').value = "";
        document.getElementById('dpTotalKMcount').style.border = '1px solid #ced4da';

        //set this default value (this will be needed when creating the day plan code)
        dayplan.dayplancode = "TP";

        setDayPlanStatus();

    } else if (dpNotTemplate.checked) {
        //custom day

        dayplan.is_template = false;
        dpBasedInq.disabled = false;     

        titleInput.disabled = true;
        titleInput.value = "";
        titleInput.style.border = '1px solid #ced4da';

        //hide these messages 
        document.getElementById('dayTypeMsgForTemplate').classList.add("d-none");
        document.getElementById('pickupMsgForTemplate').classList.add("d-none");
        document.getElementById('noLunchMsgForTemplate').classList.add("d-none");

        //enable back these radios
        const radioIds = [
            'firstDayCB',
            'middleDayCB',
            'lastDayCB',
            'generalPickupCB',
            'accommodationsPickupCB',
            'manualPickupCB',
            'packedLunchYes',
            'packedLunchNo'
        ];

        radioIds.forEach((radioId) => {
            const radioCB = document.getElementById(radioId);
            if (radioCB) {
                radioCB.disabled = false;
            }
        });

        //must target label for the radio buttons to change cursor style
        radioIds.forEach((radioId) => {
            const radioLabel = document.querySelector(`label[for="${radioId}"]`);
            if (radioLabel) {
                radioLabel.style.cursor = "pointer";
            }
        });

        //remove border, remove input value, remove dp attribute value, global var
        dayplan.dayplancode = null;
        dayplan.totalkmcount = null;
        dayplan.pickuppoint = null;

        document.getElementById('generalPickupOptions').classList.remove("d-none");
        document.getElementById('accommodationPickupOptions').classList.remove("d-none");
        document.getElementById('manualPickupOptions').classList.remove("d-none");
        document.getElementById('calcDistanceRow').classList.remove("d-none");

        document.getElementById('selectLPProv').disabled = false;

        setDayPlanStatus();
    }
}

//set day plan status when loading
const setDayPlanStatus = () => {

    const dyPlanStatusSelectElement = document.getElementById('dpSelectStatus');

    dayplan.dp_status = "Draft";
    dyPlanStatusSelectElement.value = "Draft";
    dyPlanStatusSelectElement.style.border = "2px solid lime";
    dyPlanStatusSelectElement.children[3].classList.add('d-none');
    dyPlanStatusSelectElement.children[4].classList.add('d-none');
    dyPlanStatusSelectElement.children[5].classList.add('d-none');

}

//to pass gcoords of airport pickup points
const airportSelectionPickup = () => {

    const airportSelectElement = document.getElementById('airportSelect');
    const option = airportSelectElement.options[airportSelectElement.selectedIndex];
    const data = JSON.parse(option.dataset.location);
    const airportGeocoords = data.geo;
    pickupPointGCoords = airportGeocoords;

    console.log("G: " + airportGeocoords);
    console.log("Global Var pickupPointGCoords: " + pickupPointGCoords);

    //dayplan.pick_manual_gcoords = airportGeocoords;

    dayplan.pickup_stay_id = null;

    dayplan.pickuppoint = data.name;
    airportSelectElement.style.border = '2px solid lime';

}

//to pass gcoords of airport dropoff points
const airportSelectionDropOff = () => {

    const airportSelectElement = document.getElementById('airportSelectDropOff');
    const option = airportSelectElement.options[airportSelectElement.selectedIndex];
    const data = JSON.parse(option.dataset.location);
    const airportGeocoords = data.geo;
    dropoffPointGCoords = airportGeocoords;

    console.log("G: " + airportGeocoords);
    console.log("Global Var dropoffPointGCoords: " + dropoffPointGCoords);

    dayplan.droppoint = data.name;
    airportSelectElement.style.border = '2px solid lime';
}

//to pass gcoords of stay pickup points
const passStayGCoords = () => {

    pickupPointGCoords = '';
    const pickupStaySelect = document.getElementById('pickupAccommodationSelect');
    const selectedStayString = pickupStaySelect.value;
    const selectedStay = JSON.parse(selectedStayString);
    pickupPointGCoords = selectedStay.gcoords;
    console.log("Global Var pickupPointGCoords: " + pickupPointGCoords);

    dayplan.pick_manual_gcoords = null;
    dynamicSelectValidator(pickupStaySelect, 'dayplan', 'pickup_stay_id');
    pickupStaySelect.style.border = '2px solid lime';

}

//to pass gcoords of stay dropoff points
const passStayGCoordsDropOff = () => {

    dropoffPointGCoords = '';
    const dropOffStaySelect = document.getElementById('dropOffAccommodationSelect');
    const selectedStayString = dropOffStaySelect.value;
    const selectedStay = JSON.parse(selectedStayString);
    dropoffPointGCoords = selectedStay.gcoords;
    console.log("Global Var dropoffPointGCoords: " + dropoffPointGCoords);

    dayplan.drop_manual_gcoords = null;
    dropOffStaySelect.style.border = '2px solid lime';
}

//to pass gcoords of manual pickup points
const passManualGeoCoords = () => {

    //first remove previous value
    pickupPointGCoords = '';

    const input = document.getElementById("geoCoords");
    const value = input.value.trim();

    //[optional -][1-2 digits][optional decimal], [optional -][1-3 digits][optional decimal]
    const regex = /^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;

    if (regex.test(value)) {

        const [latStr, lngStr] = value.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        const latValid = lat >= -90 && lat <= 90;
        const lngValid = lng >= -180 && lng <= 180;

        if (latValid && lngValid) {
            pickupPointGCoords = value;
            dayplan.pick_manual_gcoords = value;
            input.style.border = "2px solid lime";
            return;
        }
    }

    // If invalid
    pickupPointGCoords = '';
    input.style.border = "2px solid red";
};

//to pass gcoords of manual dropoff points
const passManualGeoCoordsDropOff = () => {

    // First remove previous value
    dropoffPointGCoords = '';

    const input = document.getElementById("geoCoordsDropOff");
    const value = input.value.trim();

    // Basic regex pattern (format only)
    const regex = /^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;

    if (regex.test(value)) {
        // Optional: further split and range check
        const [latStr, lngStr] = value.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        const latValid = lat >= -90 && lat <= 90;
        const lngValid = lng >= -180 && lng <= 180;

        if (latValid && lngValid) {
            dropoffPointGCoords = value;
            dayplan.drop_manual_gcoords = value;
            input.style.border = "2px solid lime";
            return;
        }
    }

    // If invalid
    dropoffPointGCoords = '';
    input.style.border = "2px solid red";
};

//to calculate total vehi parking fee using visiting hours and parking fee per hour
const calcTotalVehiParkingfee = () => {

    let cost = 0.00;
    dayplan.vplaces.forEach(placeObj => {
        fee = (placeObj.vehicleparkingfee) * (placeObj.duration);
        cost = cost + fee;
    });

    const roundedCost = Math.ceil(cost / 10) * 10;
    dpTotalVehiParkingCost.value = roundedCost.toFixed(2);
    dayplan.totalvehiparkcost = roundedCost;

}

//common fn for calculate the total cost of a single fee type
const calcTktCost = (vpCostType, dpInputFieldID, dpPropertName) => {

    let cost = 0.00;
    dayplan.vplaces.forEach(placeObj => {
        fee = placeObj[vpCostType];
        cost = cost + fee;
        return cost;
    });

    dpInputFieldID.value = parseFloat(cost).toFixed(2);
    //dpInputFieldID.innerText = parseFloat(cost).toFixed(2);
    dpInputFieldID.innerText = dpInputFieldID.value
    dayplan[dpPropertName] = dpInputFieldID.value;

}

//handle values when the day type radio is selected
//const handleLunchRadio = (fieldId) => {
//    dayplan.is_takepackedlunch = fieldId.value;
//}

//this will be triggered when a real value in lunch place is selected
const checkPackedLunchNo = () => {
    const lunchSelect = document.getElementById('selectDPLunch');
    const packedLunchNoVar = document.getElementById('packedLunchNo');

    if (lunchSelect.value && lunchSelect.value !== '') {
        packedLunchNoVar.checked = true;
        dayplan.is_takepackedlunch = false;
    }
}

//if the lunch for the day is taken as packed lunch
const takePackedLunchYes = () => {

    const lunchProv = document.getElementById('selectLPProv');
    const lunchDist = document.getElementById('selectLPDist');
    const lunchHotel = document.getElementById('selectDPLunch');

    lunchProv.options[0].disabled = false;
    lunchProv.selectedIndex = 0;
    lunchProv.options[0].disabled = true;

    lunchDist.options[0].disabled = false;
    lunchDist.selectedIndex = 0;
    lunchDist.options[0].disabled = true;

    lunchHotel.options[0].disabled = false;
    lunchHotel.selectedIndex = 0;
    lunchHotel.options[0].disabled = true;

    lunchProv.style.border = '1px solid #ced4da';
    lunchDist.style.border = '1px solid #ced4da';
    lunchHotel.style.border = '1px solid #ced4da';

    lunchProv.disabled = true;
    lunchDist.disabled = true;
    lunchHotel.disabled = true;

    dayplan.lunchplace_id = null;
    dayplan.is_takepackedlunch = true;

}

//if lunch is from a restaurant
const takePackedLunchNo = () => {

    const lunchProv = document.getElementById('selectLPProv');
    const lunchDist = document.getElementById('selectLPDist');
    const lunchHotel = document.getElementById('selectDPLunch');

    lunchProv.options[0].disabled = false;
    lunchProv.selectedIndex = 0;
    lunchProv.options[0].disabled = true;

    lunchDist.options[0].disabled = false;
    lunchDist.selectedIndex = 0;
    lunchDist.options[0].disabled = true;

    //meka pissu natanawa, me wemuwata manual option ekak denna 💥💥💥
    //lunchHotel.options[0].disabled = false;
    //lunchHotel.selectedIndex = 0;
    //lunchHotel.options[0].disabled = true;

    lunchProv.disabled = false;
    lunchDist.disabled = true;
    lunchHotel.disabled = true;

    lunchProv.style.border = "1px solid #ced4da";
    lunchDist.style.border = "1px solid #ced4da";
    lunchHotel.style.border = "1px solid #ced4da";

    dayplan.is_takepackedlunch = false;

}

//auto populate lunch restaurants and end stays, based on last element of vplaces array 
const getLunchAndHotelAuto = async () => {

    if (dayplan.vplaces.length > 0) {

        //reset previous styles and values
        dayplan.alt_stay_1_id = null;
        dayplan.alt_stay_2_id = null;
        dayplan.drop_stay_id = null;
        dayplan.lunchplace_id = null;
        dayplan.is_takepackedlunch = null;

        dropOffAccommodationSelect.style.border = "1px solid #ced4da";
        altStay1Select.style.border = "1px solid #ced4da";
        altStay2Select.style.border = "1px solid #ced4da";
        selectDPLunch.style.border = "1px solid #ced4da";

        packedLunchYes.checked = false;
        packedLunchNo.checked = false;

        //for custom pkgs (lunch is a must need)
        if (!dayplan.is_template) {
            let lastElement = (dayplan.vplaces).at(-1);
            let distIdOfLastEle = lastElement.district_id.id;
            let provIdOfLastEle = lastElement.district_id.province_id.id;

            let distName = lastElement.district_id.name;
            let provName = lastElement.district_id.province_id.name;

            console.log("distIdOfLastEle: ", distIdOfLastEle, distName);
            console.log("provIdOfLastEle: ", provIdOfLastEle, provName);

            //for end stay
            fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name', provName);
            fillDataIntoDynamicSelects(dropOffDistrictSelect, 'Please Select The District', allDistricts, 'name', distName);
            try {
                staysByDist = await ajaxGetReq("/stay/bydistrict/" + distIdOfLastEle);
                fillDataIntoDynamicSelects(dropOffAccommodationSelect, 'Please Select The Accomodation', staysByDist, 'name');
                dropOffAccommodationSelect.disabled = false

                fillDataIntoDynamicSelects(altStay1Select, 'Please Select Accomodation', staysByDist, 'name');
                fillDataIntoDynamicSelects(altStay2Select, 'Please Select Accomodation', staysByDist, 'name');
                altStay1Select.disabled = false;
                altStay2Select.disabled = false;


            } catch (error) {
                console.error('getLunchAndHotelAuto stay failed')
            }

            //for lunch place
            fillDataIntoDynamicSelects(selectLPProv, 'Please Select The Province', allProvinces, 'name', provName);
            fillDataIntoDynamicSelects(selectLPDist, 'Please Select The District', allDistricts, 'name', distName);
            try {
                lunchByDist = await ajaxGetReq("/lunchplace/bydistrict/" + distIdOfLastEle);
                fillDataIntoDynamicSelects(selectDPLunch, 'Please Select The Hotel', lunchByDist, 'name');
                selectDPLunch.disabled = false
            } catch (error) {
                console.error('getLunchAndHotelAuto lunch fails');
            }

            const inputTagsToEnable = [
                'selectLPProv',
                'selectLPDist',
                'dropOffProvinceSelect',
                'dropOffDistrictSelect'
            ];

            inputTagsToEnable.forEach((element) => {

                const el = document.getElementById(element);

                if (el) {
                    el.disabled = false;
                    el.style.border = "2px solid orange";
                }
            });
        }
        //for templates
        else if (dayplan.is_template) {
            let lastElement = (dayplan.vplaces).at(-1);
            let distIdOfLastEle = lastElement.district_id.id;
            let provIdOfLastEle = lastElement.district_id.province_id.id;

            let distName = lastElement.district_id.name;
            let provName = lastElement.district_id.province_id.name;

            console.log("distIdOfLastEle: ", distIdOfLastEle, distName);
            console.log("provIdOfLastEle: ", provIdOfLastEle, provName);

            //for end stay
            fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name', provName);
            fillDataIntoDynamicSelects(dropOffDistrictSelect, 'Please Select The District', allDistricts, 'name', distName);
            try {
                staysByDist = await ajaxGetReq("/stay/bydistrict/" + distIdOfLastEle);
                fillDataIntoDynamicSelects(dropOffAccommodationSelect, 'Please Select The Accomodation', staysByDist, 'name');
                dropOffAccommodationSelect.disabled = false

                fillDataIntoDynamicSelects(altStay1Select, 'Please Select Accomodation', staysByDist, 'name');
                fillDataIntoDynamicSelects(altStay2Select, 'Please Select Accomodation', staysByDist, 'name');
                altStay1Select.disabled = false;
                altStay2Select.disabled = false;

            } catch (error) {
                console.error('getLunchAndHotelAuto stay failed')
            }

            const inputTagsToEnable = [

                'dropOffProvinceSelect',
                'dropOffDistrictSelect'
            ];

            inputTagsToEnable.forEach((element) => {

                const el = document.getElementById(element);

                if (el) {
                    el.disabled = false;
                    el.style.border = "2px solid orange";
                }
            });
        }
    }
}

//to pass a single location from all vps to selected vps
const addOne = () => {

    const allVPsBox = document.getElementById('allVPs');
    const selectedVPsBox = document.getElementById('selectedVPs');

    let selectedPlace = JSON.parse(allVPsBox.value);
    let isPlaceAlreadySelected = false;

    for (const vplz of dayplan.vplaces) {
        if (selectedPlace.id == vplz.id) {
            isPlaceAlreadySelected = true;
            break;
        }
    }

    if (isPlaceAlreadySelected) {
        showAlertModal('err', 'this place is already selected')
    } else {

        //fill right side (selected places)
        dayplan.vplaces.push(selectedPlace);
        fillDataIntoDynamicSelects(selectedVPsBox, '', dayplan.vplaces, 'name');

        //remove it from left side

        //opt 1 
        //let updatedVpByDist = vpByDist.filter(vp => vp.id != selectedPlace.id);
        //fillDataIntoDynamicSelects(allVPsBox, '', updatedVpByDist, 'name');

        //opt 2 💥
        //let existIndex = vpByDist.map(place => place.name).indexOf(selectedPlace.name);
        //if (existIndex != -1) {
        //    vpByDist.splice(existIndex, 1);
        //}
        //fillDataIntoDynamicSelects(allVPsBox, '', vpByDist, 'name');
        //opt 2 ends 

        //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
        calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "localadulttktcost");
        calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignadulttktcost");
        calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localchildtktcost");
        calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "foreignchildtktcost");

        calcTotalVehiParkingfee();
        getLunchAndHotelAuto();

    }

}

//for pass all locations 
const addAll = () => {

    //get control of all (loop)
    for (const leftVplz of vpByDist) {

        let isPlaceAlreadySelected = false;

        for (const rightVplz of dayplan.vplaces) {
            if (leftVplz.id == rightVplz.id) {
                isPlaceAlreadySelected = true;
                break;
            }
        }

        if (!isPlaceAlreadySelected) {
            dayplan.vplaces.push(leftVplz);
            fillDataIntoDynamicSelects(selectedVPs, '', dayplan.vplaces, 'name')
        }
    }

    //an empty array to fill the left side as empty
    vplacesByDist = [];
    fillDataIntoDynamicSelects(allVPs, '', vplacesByDist, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "localadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignadulttktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localchildtktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "foreignchildtktcost");

    calcTotalVehiParkingfee();
    getLunchAndHotelAuto();
}

//for remove a single location
const removeOne = () => {

    //left side
    //fillDataIntoDynamicSelects(allVPs, '', vpByDist, 'name');

    //selected (clicked) value in right side
    let selectedPlaceToRemove = JSON.parse(selectedVPs.value);

    //dayplan.vplaces array eke thiynawada balanawa selected option eke name eka (=== selectedPlaceToRemove.name) ;
    // passe eke index eka gannawa; 
    let existIndex = dayplan.vplaces.map(place => place.name).indexOf(selectedPlaceToRemove.name);

    //exist nam(ehema namak thiyanawa nam) right side eke list ekenma remove karanawa
    if (existIndex != -1) {
        dayplan.vplaces.splice(existIndex, 1)
    }

    //eka remove unama ithuru selected vplaces tika
    fillDataIntoDynamicSelects(selectedVPs, '', dayplan.vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "localadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignadulttktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localchildtktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "foreignchildtktcost");

    calcTotalVehiParkingfee();
    getLunchAndHotelAuto();
}

//for remove all locations
const removeAll = () => {

    //empty the entire right side
    dayplan.vplaces = [];
    fillDataIntoDynamicSelects(selectedVPs, '', dayplan.vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "localadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignadulttktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localchildtktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "foreignchildtktcost");

    calcTotalVehiParkingfee();

    //remove and clear automatically binded lp and end stay info too 
    dayplan.lunchplace_id = null;
    dayplan.drop_stay_id = null;

    let lunchPlaceSelect = document.getElementById("selectDPLunch");
    let endStaySelect = document.getElementById("dropOffAccommodationSelect");

    let emptyArr = [];
    fillDataIntoDynamicSelects(lunchPlaceSelect, 'Please Select The Restaurant', emptyArr, 'name');
    fillDataIntoDynamicSelects(endStaySelect, 'Please Select The Accomodation', emptyArr, 'name');

    fillDataIntoDynamicSelects(selectLPProv, 'Please Select The Province', allProvinces, 'name');
    fillDataIntoDynamicSelects(selectLPDist, 'Please Select The District', allDistricts, 'name');

    fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name');
    fillDataIntoDynamicSelects(dropOffDistrictSelect, 'Please Select The District', allDistricts, 'name');

    selectLPProv.style.border = "1px solid #ced4da";
    dropOffProvinceSelect.style.border = "1px solid #ced4da";

    const inputTagsToEnable = [

        'selectLPDist',
        'lunchPlaceSelect',
        'dropOffDistrictSelect',
        'endStaySelect',
        'selectDPLunch',
        'dropOffAccommodationSelect'
    ];

    inputTagsToEnable.forEach((element) => {

        const el = document.getElementById(element);

        if (el) {
            el.disabled = true;
            el.style.border = "1px solid #ced4da";
        }

    });



}

//suucess (NOT USED == updated to next fn)
async function calculateTotalDistanceSuccess() {

    dayplan.totalkmcount = null;
    const kmInput = document.getElementById('dpTotalKMcount');
    kmInput.style.border = "1px solid #ced4da";

    const apiKey = '5b3ce3597851110001cf6248dfc26e4e6071445f9197c3adf89c69e4';
    const msgBox = document.getElementById('calcDistanceMsg');

    // Clear old messages
    msgBox.innerText = '';
    kmInput.value = '';

    let coords = [];

    // Add pickup point if available
    if (pickupPointGCoords && pickupPointGCoords.includes(',')) {
        const [lat, lon] = pickupPointGCoords.split(',').map(Number);
        coords.push([lon, lat]);
    }

    // Add visiting places
    if (dayplan && dayplan.vplaces && dayplan.vplaces.length > 0) {
        coords = coords.concat(
            dayplan.vplaces.map(place => {
                const [lat, lon] = place.gcoords.split(',').map(Number);
                return [lon, lat];
            })
        );
    }

    // Now check if we have at least 2 points
    if (coords.length < 2) {
        msgBox.innerText = 'Please select at least 2 locations (pickup + at least 1 place).';
        return;
    }

    const body = { coordinates: coords };

    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && errorData.error.code === 2010) {
                msgBox.innerText = '⚠️ Some locations are too far from a road. Please enter total KM manually.';
            } else {
                msgBox.innerText = '⚠️ Could not calculate automatically. Please enter total KM manually.';
            }
            return;
        }

        const data = await response.json();
        const distanceMeters = data.features[0].properties.summary.distance;
        const distanceKm = (distanceMeters / 1000).toFixed(2);

        // Update input and object
        kmInput.value = distanceKm;
        dayplan.totalkmcount = distanceKm;
        kmInput.style.border = "2px solid lime";

        // Time handling
        let durationSeconds = data.features[0].properties.summary.duration;
        let totalMinutes = Math.round(durationSeconds / 60);
        let roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
        let hours = Math.floor(roundedMinutes / 60);
        let minutes = roundedMinutes % 60;

        let timeStr = hours;
        if (minutes > 0) {
            timeStr += "." + (minutes / 60).toFixed(2).split('.')[1];
        }

        console.log(`Total Distance: ${distanceKm} km`);
        console.log(`Total Estimated Time: ${timeStr} H`);

    } catch (error) {
        console.error('Error calculating distance:', error);
        msgBox.innerText = '⚠️ Unexpected error. Please enter total KM manually.';
    }
}

//calculate the total distance covered in the entire day (pickup + attractions + dropoff)
async function calculateTotalDistance() {

    dayplan.totalkmcount = null;
    const kmInput = document.getElementById('dpTotalKMcount');
    kmInput.style.border = "1px solid #ced4da";

    const apiKey = '5b3ce3597851110001cf6248dfc26e4e6071445f9197c3adf89c69e4';
    const msgBox = document.getElementById('calcDistanceMsg');

    // Clear old messages
    msgBox.innerText = '';
    kmInput.value = '';

    const hasPickup = dayplan.pickup_stay_id || dayplan.pick_manual_gcoords;
    const hasDrop = dayplan.drop_stay_id || dayplan.drop_manual_gcoords;

    if (!dayplan.is_template && (!hasPickup || !hasDrop)) {
        msgBox.innerText = '⚠️ Cannot calculate distance without both pickup and drop-off points.';
        return;
    }

    let coords = [];

    // Add pickup point if available
    if (pickupPointGCoords && pickupPointGCoords.includes(',')) {
        const [lat, lon] = pickupPointGCoords.split(',').map(Number);
        coords.push([lon, lat]); // OpenRoute needs [lon, lat]
    }

    // Add visiting places
    if (dayplan && dayplan.vplaces && dayplan.vplaces.length > 0) {
        coords = coords.concat(
            dayplan.vplaces.map(place => {
                const [lat, lon] = place.gcoords.split(',').map(Number);
                return [lon, lat];
            })
        );
    }

    // Add drop-off point if available
    if (dropoffPointGCoords && dropoffPointGCoords.includes(',')) {
        const [lat, lon] = dropoffPointGCoords.split(',').map(Number);
        coords.push([lon, lat]);
    }

    // Now check if we have at least 2 points
    if (coords.length < 2) {
        msgBox.innerText = 'Please select at least 2 locations (pickup + at least 1 place or drop-off).';
        return;
    }

    const body = { coordinates: coords };

    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && errorData.error.code === 2010) {
                msgBox.innerText = '⚠️ Some locations are too far from a road. Please enter total KM manually.';
            } else {
                msgBox.innerText = '⚠️ Could not calculate automatically. Please enter total KM manually.';
            }
            return;
        }

        const data = await response.json();
        const distanceMeters = data.features[0].properties.summary.distance;
        const distanceKm = Math.ceil(distanceMeters / 1000);

        // Update input and object
        kmInput.value = distanceKm;
        dayplan.totalkmcount = distanceKm;
        kmInput.style.border = "2px solid lime";

        // Time handling
        let durationSeconds = data.features[0].properties.summary.duration;
        let totalMinutes = Math.round(durationSeconds / 60);
        let roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
        let hours = Math.floor(roundedMinutes / 60);
        let minutes = roundedMinutes % 60;

        let timeStr = hours;
        if (minutes > 0) {
            timeStr += "." + (minutes / 60).toFixed(2).split('.')[1];
        }

        console.log(`Total Distance: ${distanceKm} km`);
        console.log(`Total Estimated Time: ${timeStr} H`);

    } catch (error) {
        console.error('Error calculating distance:', error);
        msgBox.innerText = '⚠️ Unexpected error. Please enter total KM manually.';
    }
}

//get districts list by the selected province
const getDistByProvince = async (provinceSelectid, districtSelectId, selectedValue = "") => {

    districtSelectId.disabled = false;
    districtSelectId.style.border = '1px solid #ced4da';

    const currentProvinceID = JSON.parse(provinceSelectid.value).id;
    try {
        const districts = await ajaxGetReq("districts/byprovinceid/" + currentProvinceID);
        fillDataIntoDynamicSelects(districtSelectId, " Please Select The District ", districts, 'name', selectedValue);
        console.log("getDistByProvince ran for districtSelectId: " + districtSelectId.id);
    } catch (error) {
        console.error("Failed to fetch districts:", error);
    }

    if (selectedValue == "") {
        provinceSelectid.style.border = '2px solid lime';
    } else if (selectedValue != "") {
        provinceSelectid.style.border = '1px solid #ced4da';
    }
    //provinceSelectid.style.border = '2px solid lime';

}

//get accomadations list by the selected district
const getStayByDistrict = async (distSelectID, staySelectID, selectedValue = "") => {

    const selectedDistrict = JSON.parse(distSelectID.value).id;
    staySelectID.disabled = false;
    staySelectID.style.border = '1px solid #ced4da';

    if (selectedValue == "") {
        distSelectID.style.border = '2px solid lime';
    } else if (selectedValue != "") {
        distSelectID.style.border = '1px solid #ced4da';
    }

    try {
        staysByDist = await ajaxGetReq("/stay/bydistrict/" + selectedDistrict);
        fillDataIntoDynamicSelects(staySelectID, 'Please Select The Accomodation', staysByDist, 'name', selectedValue);
        console.log("getStayByDistrict ran for staySelectID: " + staySelectID.id);
        console.log(staysByDist);
    } catch (error) {
        console.error('getStayByDistrict failed')
    }
}

//get lunch hotel by the selected district
const getLunchHotelByDistrict = async (distSelectID, lhSelectID, selectedValue = "") => {

    const selectedDistrict = JSON.parse(distSelectID.value).id;
    lhSelectID.disabled = false;
    lhSelectID.style.border = '1px solid #ced4da';

    if (selectedValue == "") {
        distSelectID.style.border = '2px solid lime';
    } else if (selectedValue != "") {
        distSelectID.style.border = '1px solid #ced4da';
    }

    try {
        lunchByDist = await ajaxGetReq("/lunchplace/bydistrict/" + selectedDistrict);
        fillDataIntoDynamicSelects(lhSelectID, 'Please Select The Hotel', lunchByDist, 'name', selectedValue);
        console.log("getLunchHotelByDistrict ran for lhSelectID: " + lhSelectID.id);
    } catch (error) {
        console.error('getLunchHotelByDistrict');
    }
}

//get visiting places list by the selected district
const getVPlacesByDistrict = async () => {
    const selectedDistrict = JSON.parse(selectVPDist.value).id;
    selectVPDist.style.border = '2px solid lime';
    allVPs.disabled = false;

    try {
        vpByDist = await ajaxGetReq("/attraction/bydistrict/" + selectedDistrict);
        fillDataIntoDynamicSelects(allVPs, '', vpByDist, 'name');
    } catch (error) {
        console.error('get V PlacesByDistrict failed')
    }

}

// Check if the first tab details are valid
const checkDPFirstTab = () => {
    const elementIds = ['dayStep2-tab', 'dayStep3-tab', 'dayStep4-tab', 'dayStep5-tab'];

    if (document.getElementById('dpTitle').value.trim() != '') {

        elementIds.forEach((elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.remove('disabled');
            }
        })
    } else {
        elementIds.forEach((elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('disabled');
            }
        })
    }
}

// Check errors before submitting
const checkDPFormErrors = () => {

    let errors = "";

    //always check these fields
    if (dayplan.is_template == null) {
        errors += "Day plan type (Template or not) must be specified\n";
    }

    if (!dayplan.is_template && dayplan.dayplancode == null) {
        errors += "Day Type is required (choose from First Day, Mid Day, or Final Day)\n";
    }

    if (!dayplan.is_template && dayplan.dp_basedinq == null) {
        errors += "Based Inquiry is required for custom day plans \n";
    }

    if (dayplan.daytitle == null) {
        errors += "Day Plan Name cannot be empty \n";
    }

    if (dayplan.dp_status == null) {
        errors += "Status cannot be empty \n";
    }

    if (!dayplan.vplaces || dayplan.vplaces.length === 0) {
        errors += "At least select one visiing place \n";
    }

    if (dayplan.drop_stay_id != null) {
        if (dayplan.alt_stay_1_id == null && dayplan.alt_stay_2_id == null) {
            errors += " Please select at least one alternative accomodation \n";
        }

    }

    if (dayplan.dp_status === "Finalized") {

        // if a custom package, do additional checks
        if (dayplan.is_template == false) {

            // either lunchplace_id or is_takepackedlunch == true
            if (!dayplan.lunchplace_id && dayplan.is_takepackedlunch !== true) {
                errors += "Lunch place info is required unless taking packed lunch \n";
            }

            //  either pickup_stay_id or pickuppoint
            if (!dayplan.pickup_stay_id && (!dayplan.pickuppoint)) {
                errors += "Pickup location is required \n";
            }

            // either drop_stay_id or droppoint
            if (!dayplan.drop_stay_id && (!dayplan.droppoint)) {
                errors += "Drop-off location is required \n";
            }

            if (dayplan.pickuppoint != null && dayplan.pick_manual_gcoords == null) {
                errors += "Enter the Geo Coords of pickup point \n";
            }

            if (dayplan.droppoint != null && dayplan.drop_manual_gcoords == null) {
                errors += "Enter the Geo Coords of pickup point \n";
            }

            if (dayplan.totalkmcount == null) {
                errors += "Total KM count is required \n";;
            }

        }
    }


    return errors;
};


//fn for add btn to save a record to db
const addNewDayPlan = async () => {

    const errors = checkDPFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {

                //bind the based inq id only, not whole obj
                if (dayplan.dp_basedinq && dayplan.dp_basedinq.id) {
                    dayplan.dp_basedinq = dayplan.dp_basedinq.id;
                } else {
                    dayplan.dp_basedinq = null;
                }

                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/dayplan", "POST", dayplan);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formDayPlan').reset();
                    refreshDayPlanForm();
                    buildDayPlanTable();
                    resetDayPlanFilters();
                    var myDPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myDPTableTab.show();
                    //window.location.reload();
                } else {
                    showAlertModal('err', 'Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        showAlertModal('war', errors);
    }
}

//to reset the modal that show all the info
const resetModal = () => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const tableDayPlanHolderDivElement = document.getElementById('tableDayPlanHolderDiv');
    if (!tableDayPlanHolderDivElement) {
        return;
    }

    // Hide the deleted record message    
    document.getElementById('modalDPIfDeleted').innerText = '';
    document.getElementById('modalDPIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    document.getElementById('modalDPEditBtn').disabled = false;
    document.getElementById('modalDPDeleteBtn').disabled = false;
    document.getElementById('modalDPEditBtn').classList.remove('d-none');
    document.getElementById('modalDPDeleteBtn').classList.remove('d-none');

    // Hide the recover button
    document.getElementById('modalDPRecoverBtn').classList.add('d-none');

}

//fn for edit button to open the modal that shows all the info
const openModal = (dpObj) => {

    //this is added because we use the dayplan.js inside the tpkg.html too
    const tableDayPlanHolderDivElement = document.getElementById('tableDayPlanHolderDiv');
    if (!tableDayPlanHolderDivElement) {
        return;
    }

    resetModal();

    if (dpObj.is_template) {
        document.getElementById('tempInfoDisRow').classList.remove('d-none');
        document.getElementById('modalDPIsTemplateOrNot').innerText = 'This Is A Template Itinerary';
    }

    document.getElementById('modalDPCode').innerText = dpObj.dayplancode || 'N/A';
    document.getElementById('modalDPTitle').innerText = dpObj.daytitle || 'N/A';

    const attractionsElement = document.getElementById('modalDPAttractions');

    if (dpObj.vplaces.length > 0) {

        const badges = dpObj.vplaces.map((element, index) => {
            return `<span class="fs-6 px-2 py-1 me-2 fw-bold ">${index + 1}. ${element.name}</span>`;
        });

        attractionsElement.innerHTML = badges.join(' ');
    } else {
        attractionsElement.innerHTML = 'N/A';
    }


    document.getElementById('modalDPStartLocation').innerText =
        dpObj.pickuppoint || (dpObj.pickup_stay_id && dpObj.pickup_stay_id.name) || 'N/A';

    document.getElementById('modalDPLunch').innerText =
        dpObj.lunchplace_id?.name || (dpObj.is_takepackedlunch ? 'Take Packed Lunch' : 'N/A');

    document.getElementById('modalDPStay').innerText = dpObj.drop_stay_id?.name || dpObj.droppoint || 'N/A';

    if (dpObj.drop_stay_id) {
        document.getElementById('modalDPAltStay1').innerText = dpObj.alt_stay_1_id?.name || 'N/A';
        document.getElementById('modalDPAltStay2').innerText = dpObj.alt_stay_2_id?.name || 'N/A';
    }

    document.getElementById('modalDPTktLocalAdult').innerText = 'LKR ' + dpObj.localadulttktcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTktLocalChild').innerText = 'LKR ' + dpObj.localchildtktcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTktForeignAdult').innerText = 'LKR ' + dpObj.foreignadulttktcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTktForeignChild').innerText = 'LKR ' + dpObj.foreignchildtktcost.toFixed(2) || 'N/A';

    document.getElementById('modalDPParkingFee').innerText = 'LKR ' + dpObj.totalvehiparkcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTotalDistance').innerText = dpObj.totalkmcount > 0 ? `${dpObj.totalkmcount} KM` : 'NA';

    document.getElementById('modalDPNote').innerText = dpObj.note || 'N/A';
    document.getElementById('modalDPStatus').innerText = dpObj.dp_status || 'N/A';

    if (dpObj.deleted_dp) {
        document.getElementById('modalDPIfDeleted').classList.remove('d-none');
        document.getElementById('modalDPIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(dpObj.deleteddatetime).toLocaleString();
        document.getElementById('modalDPEditBtn').disabled = true;
        document.getElementById('modalDPDeleteBtn').disabled = true;
        document.getElementById('modalDPEditBtn').classList.add('d-none');
        document.getElementById('modalDPDeleteBtn').classList.add('d-none');
        document.getElementById('modalDPRecoverBtn').classList.remove('d-none');
    }

    // Show the modal
    $('#infoModalDayPlan').modal('show');

};

//print dp
const printDayPlanRecordNew = (dpObj) => {

    if (!dpObj) {
        alert('No DayPlan data available to print.');
        return;
    }

    console.log(dpObj);

    // prepare attractions badges html
    let attractionsHTML = 'N/A';
    if (dpObj.vplaces && dpObj.vplaces.length > 0) {
        const badges = dpObj.vplaces.map((el, i) => `<span class="fs-6 px-2 py-1 mb-1 fw-bold border rounded">${i + 1}. ${el.name}</span>`);
        attractionsHTML = badges.join('<br>');
    }

    // create printable model
    const modalContent = `
      <div class="container-fluid my-3 p-1 border border-primary rounded shadow-sm" style="font-family: Arial, sans-serif;">
        <h2 class="text-center text-primary mb-3">DayPlan Information</h2>
        <hr class="border border-primary border-2">
  
        <div class="row mb-2">
          <div class="col-md-6 mb-0"><p><strong>DayPlan Code:</strong> ${dpObj.dayplancode || 'N/A'}</p></div>
          <div class="col-md-6"><p><strong>Day Title:</strong> ${dpObj.daytitle || 'N/A'}</p></div>
        </div>
  
        <hr>
  
        <div class="row mb-2">
          <div class="col-md-4"><p><strong>Start / Pickup Location:</strong> ${dpObj.pickuppoint || (dpObj.pickup_stay_id?.name) || 'N/A'}</p></div>
          <div class="col-md-4"><p><strong>Lunch For Day:</strong> ${dpObj.lunchplace_id?.name || (dpObj.is_takepackedlunch ? 'Take Packed Lunch' : 'N/A')}</p></div>
          <div class="col-md-4"><p><strong>End / DropOff Location Day:</strong> ${dpObj.drop_stay_id?.name || dpObj.droppoint || 'N/A'}</p></div>
        </div>
  
        <div class="row mb-2">
          <div class="col-md-4 mb-0"><p><strong>Alternative Stay 1:</strong> ${dpObj.alt_stay_1_id?.name || 'N/A'}</p></div>
          <div class="col-md-4 mb-0"><p><strong>Alternative Stay 2:</strong> ${dpObj.alt_stay_2_id?.name || 'N/A'}</p></div>
        </div>
  
        <hr>
  
        <div class="mb-2">
        <p class="h5 fw-bold text-primary">Visiting Places:</p>
          <div style="border: 1px solid #0d6efd; border-radius: 4px; padding: 8px;">
            ${attractionsHTML}
          </div>
        </div>
   
        <!-- Ticket Costs -->
        <div class="mb-1 p-3 border rounded bg-light">
          <p class="h5 fw-bold text-primary mb-3">Total Ticket Costs:</p>
        
          <div class="row mb-2">
            <div class="col-md-6">
              <p><strong>Local Adults:</strong> LKR ${dpObj.localadulttktcost?.toFixed(2) || '0.00'}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Local Child:</strong> LKR ${dpObj.localchildtktcost?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        
          <div class="row">
            <div class="col-md-6">
              <p><strong>Foreign Adults:</strong> LKR ${dpObj.foreignadulttktcost?.toFixed(2) || '0.00'}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Foreign Child:</strong> LKR ${dpObj.foreignchildtktcost?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
        
        <!-- Parking Fee & Distance -->
        <div class="row mb-2">
          <div class="col-md-6">
            <p><strong>Total Parking Fee:</strong> LKR ${dpObj.totalvehiparkcost?.toFixed(2) || '0.00'}</p>
          </div>
          <div class="col-md-6">
            <p><strong>Total Distance Covered:</strong> ${dpObj.totalkmcount > 0 ? dpObj.totalkmcount + ' KM' : 'N/A'}</p>
          </div>
        </div>
        
        <hr>
  
        <div class="mb-1"><p><strong>Additional Information:</strong> ${dpObj.note || 'N/A'}</p></div>
        <div class="mb-4"><p><strong>Status:</strong> ${dpObj.dp_status || 'N/A'}</p></div>
  
        <p class="text-center text-muted small">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
    `;

    const printableTitle = `DayPlan_${(dpObj.dayplancode || 'Example').replace(/\s+/g, '_')}`;

    //url, window name, settings=== 'width=1000,height=700,resizable=yes,scrollbars=yes'
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>${printableTitle}</title>
          <link rel="stylesheet" href="../libs/bootstrap-5.2.3/css/bootstrap.min.css">
          <style>
            body {
              margin: 0;
              padding: 10px;
              background-color: #f8f9fa;
              font-family: Arial, sans-serif;
            }
            @media print {
              body {
                background-color: white;
                margin: 0; padding: 0;
              }
            }
          </style>
        </head>
        <body>${modalContent}</body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    };
};

let basedInqClientAndCode = null;

// refill the form to update a record
const refillDayPlanForm = async (dpObj) => {

    const elementIds = ['dayStep2-tab', 'dayStep3-tab', 'dayStep4-tab', 'dayStep5-tab'];

    elementIds.forEach((elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('disabled');
        }
    })

    //emptyArray = [];
    //let allStays = [];
    //let allProvinces = [];
    //let allDistricts = [];

    //try {
    //    allStays = await ajaxGetReq('/stay/all');
    //    allProvinces = await ajaxGetReq("/province/all");
    //    allDistricts = await ajaxGetReq("/district/all");
    //} catch (error) {
    //    console.error('failed to fetch provinces,districts and stays')
    //}

    //💥💥💥
    if (dpObj.dp_status == "Completed") {
        showAlertModal('err', "Tour for this day plan is already completed, hence cant edit")
    } else {

        dayplan = JSON.parse(JSON.stringify(dpObj));
        oldDayplan = JSON.parse(JSON.stringify(dpObj));

        //cant edit these
        dpTemplate.disabled = true;
        dpNotTemplate.disabled = true;
        firstDayCB.disabled = true;
        middleDayCB.disabled = true;
        lastDayCB.disabled = true;
        dpBasedInq.disabled = true;

        if (dpObj.is_template) {
            generalPickupCB.disabled = true;
            accommodationsPickupCB.disabled = true;
            manualPickupCB.disabled = true;
        }

        //based inquiry
        if (dayplan.dp_basedinq != null) {
            try {
                basedInqClientAndCode = await ajaxGetReq("/inq/codeandclient?id=" + dayplan.dp_basedinq);
            } catch (error) {
                console.error("Failed to fetch inquiry by ID:", error);
            }
            fakeInqArray = [];
            fakeInqArray.push(basedInqClientAndCode);
            fillMultDataIntoDynamicSelectsRefillById(dpBasedInq, 'Please select based inquiry', fakeInqArray, 'inqcode', 'clientname', dayplan.dp_basedinq);
            dpBasedInq.disabled = true;
        }

        if (dpObj.is_takepackedlunch) {
            packedLunchYes.checked = true;
        } else if (!dpObj.is_takepackedlunch) {
            packedLunchNo.checked = true;
        }

        //if the pickup point was an airport or manual location
        if (dpObj.pickuppoint != null) {

            const airportSelect = document.getElementById('airportSelect');
            const airportPickRow = document.getElementById('generalPickupOptions');
            const airportPickupCB = document.getElementById('generalPickupCB');
            const manualPickupRow = document.getElementById('manualPickupOptions');
            const manualPickupInput = document.getElementById('manualLocationPickup');
            const manualPickupGCoordsInput = document.getElementById('geoCoords');
            const manualPickupCBVar = document.getElementById('manualPickupCB');
            const stayPickupRow = document.getElementById('accommodationPickupOptions');

            airportPickRow.style.display = 'none';
            manualPickupRow.style.display = 'none';
            stayPickupRow.style.display = 'none';

            switch (dpObj.pickuppoint) {
                case "BIA":
                    airportSelect.selectedIndex = 1;
                    airportPickRow.style.display = 'block';
                    airportPickupCB.checked = true;
                    break;
                case "MATTALA":
                    airportSelect.selectedIndex = 2;
                    airportPickRow.style.display = 'block';
                    airportPickupCB.checked = true;
                    break;
                case "RATMALANA":
                    airportSelect.selectedIndex = 3;
                    airportPickRow.style.display = 'block';
                    airportPickupCB.checked = true;
                    break;
                case "JAFFNA":
                    airportSelect.selectedIndex = 4;
                    airportPickRow.style.display = 'block';
                    airportPickupCB.checked = true;
                    break;
                default:
                    airportSelect.selectedIndex = 0;
                    manualPickupRow.style.display = 'block';
                    manualPickupInput.value = dpObj.pickuppoint;
                    manualPickupGCoordsInput.value = dpObj.pick_manual_gcoords;
                    manualPickupCBVar.checked = true;
                    break;
            }

            //enable the 3 radios
            const radioIds = [
                'generalPickupCB',
                'accommodationsPickupCB',
                'manualPickupCB'
            ];

            radioIds.forEach((radioId) => {
                const radioCB = document.getElementById(radioId);
                if (radioCB) {
                    radioCB.disabled = false;
                }
            });

        }

        //if pickup point was a stay
        if (dpObj.pickup_stay_id != null) {

            //enable the 3 radios
            const radioIds = [
                'generalPickupCB',
                'accommodationsPickupCB',
                'manualPickupCB'
            ];

            radioIds.forEach((radioId) => {
                const radioCB = document.getElementById(radioId);
                if (radioCB) {
                    radioCB.disabled = false;
                }
            });

            try {

                fillDataIntoDynamicSelects(pickupProvinceSelect, 'Please Select The Province', allProvinces, 'name', dpObj.pickup_stay_id.district_id.province_id.name);
                fillDataIntoDynamicSelects(pickupDistrictSelect, 'Please Select The District', allDistricts, 'name', dpObj.pickup_stay_id.district_id.name);

                //call these manually here , using dpObj.pickup_stay_id.district_id.province_id 💥💥💥
                //await getDistByProvince(pickupProvinceSelect, pickupDistrictSelect);
                //await getStayByDistrict(pickupDistrictSelect, pickupAccommodationSelect);

                fillDataIntoDynamicSelects(pickupAccommodationSelect, 'Please Select Accomodation', allStays, 'name', dpObj.pickup_stay_id.name);

            } catch (error) {
                console.error('error fetching previous start stay info')
            }

            const stayPickupRow = document.getElementById('accommodationPickupOptions');
            stayPickupRow.style.display = 'block';

            const stayPickupCb = document.getElementById('accommodationsPickupCB');
            stayPickupCb.checked = true;
        }

        //if droppoint is an airport or manual location
        if (dpObj.droppoint != null) {

            const airportDropCBVar = document.getElementById('generalDropOffCB');
            const airportDropRow = document.getElementById('generalDropOffOptions');
            const airportSelect = document.getElementById('airportSelectDropOff');

            const manualDropCBVar = document.getElementById('manualDropOffCB');
            const manualDropRow = document.getElementById('manualDropOffOptions');
            const manualDropInput = document.getElementById('manualLocationDropOff');
            const manualDropGCoordsInput = document.getElementById('geoCoordsDropOff');

            const dropOffAccommodationRow = document.getElementById('accommodationDropOffOptions');

            airportDropRow.style.display = 'none';
            manualDropRow.style.display = 'none';
            dropOffAccommodationRow.style.display = 'none';

            switch (dpObj.droppoint) {
                case "BIA":
                    airportSelect.selectedIndex = 1;
                    airportDropRow.style.display = 'block';
                    airportDropCBVar.checked = true;
                    break;
                case "MATTALA":
                    airportSelect.selectedIndex = 2;
                    airportDropRow.style.display = 'block';
                    airportDropCBVar.checked = true;
                    break;
                case "RATMALANA":
                    airportSelect.selectedIndex = 3;
                    airportDropRow.style.display = 'block';
                    airportDropCBVar.checked = true;
                    break;
                case "JAFFNA":
                    airportSelect.selectedIndex = 4;
                    airportDropRow.style.display = 'block';
                    airportDropCBVar.checked = true;
                    break;
                default:
                    airportSelect.selectedIndex = 0;
                    manualDropRow.style.display = 'block';
                    manualDropInput.value = dpObj.droppoint;
                    manualDropGCoordsInput.value = dpObj.drop_manual_gcoords;
                    manualDropCBVar.checked = true;
                    break;
            }

            //enable the 3 radios
            const radioIds = [
                'generalDropOffCB',
                'accommodationsDropOffCB',
                'manualDropOffCB'
            ];

            radioIds.forEach((radioId) => {
                const radioCB = document.getElementById(radioId);
                if (radioCB) {
                    radioCB.disabled = false;
                }
            });
        }

        //if droppoint is a stay
        if (dpObj.drop_stay_id != null) {

            //enable the 3 radios
            const radioIds = [
                'generalDropOffCB',
                'accommodationsDropOffCB',
                'manualDropOffCB'
            ];

            radioIds.forEach((radioId) => {
                const radioCB = document.getElementById(radioId);
                if (radioCB) {
                    radioCB.disabled = false;
                }
            });

            try {

                fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name', dpObj.drop_stay_id.district_id.province_id.name);
                fillDataIntoDynamicSelects(dropOffDistrictSelect, 'Please Select The District', allDistricts, 'name', dpObj.drop_stay_id.district_id.name);

                fillDataIntoDynamicSelects(dropOffAccommodationSelect, 'Please Select Accomodation', allStays, 'name', dpObj.drop_stay_id.name);
                fillDataIntoDynamicSelects(altStay1Select, 'Please Select Accomodation', allStays, 'name', dpObj.alt_stay_1_id.name);
                fillDataIntoDynamicSelects(altStay2Select, 'Please Select Accomodation', allStays, 'name', dpObj.alt_stay_2_id.name);

                //await getDistByProvince(dropOffProvinceSelect, dropOffDistrictSelect);

                //await getStayByDistrict(dropOffDistrictSelect, dropOffAccommodationSelect);
                //await getStayByDistrict(dropOffDistrictSelect, altStay1Select);
                //await getStayByDistrict(dropOffDistrictSelect, altStay2Select);

            } catch (error) {
                console.error('error fetching previous end stay info');
            }

            const dropOffAccommodationRow = document.getElementById('accommodationDropOffOptions');
            dropOffAccommodationRow.style.display = 'block';

            const dropOffAccommodationCB = document.getElementById('accommodationsDropOffCB');
            dropOffAccommodationCB.checked = true;

            const manualDropRow = document.getElementById('manualDropOffOptions');
            manualDropRow.style.display = 'none';

        }

        document.getElementById('dpTotalKMcount').value = dpObj.totalkmcount;
        document.getElementById('dpTitle').value = dpObj.daytitle;
        document.getElementById('dpCode').value = dpObj.dayplancode;
        document.getElementById('dpCodeRow').classList.remove('d-none');
        document.getElementById('dpSelectStatus').value = dpObj.dp_status;
        document.getElementById('dpNote').value = dpObj.note;
        document.getElementById('dpTotalVehiParkingCost').value = 'LKR ' + dpObj.totalvehiparkcost.toFixed(2);
        document.getElementById('dpTotalForeignChildTktCost').value = 'LKR ' + dpObj.foreignchildtktcost.toFixed(2);
        document.getElementById('dpTotalForeignAdultTktCost').value = 'LKR ' + dpObj.foreignadulttktcost.toFixed(2);
        document.getElementById('dpTotalLocalChildTktCost').value = 'LKR ' + dpObj.localchildtktcost.toFixed(2);
        document.getElementById('dpTotalLocalAdultTktCost').value = 'LKR ' + dpObj.localadulttktcost.toFixed(2);

        if (dpObj.dayplancode.substring(0, 2) == "FD") {
            firstDayCB.checked = true;

        } else if (dpObj.dayplancode.substring(0, 2) == "MD") {
            middleDayCB.checked = true;

        } else if (dpObj.dayplancode.substring(0, 2) == "LD") {
            lastDayCB.checked = true;
        }

        if (dpObj.is_template) {
            dpTemplate.checked = true;
        } else if (!dpObj.is_template) {
            dpNotTemplate.checked = true;
        }

        if (oldDayplan.lunchplace_id != null) {

            try {
                const lhs = await ajaxGetReq("/lunchplace/all");
                fillDataIntoDynamicSelects(selectDPLunch, '', lhs, 'name', dpObj.lunchplace_id.name);

                //const allProvinces = await ajaxGetReq("/province/all");
                fillDataIntoDynamicSelects(selectLPProv, 'Select Province', allProvinces, 'name', dpObj.lunchplace_id.district_id.province_id.name);

                //const allDistricts = await ajaxGetReq("/district/all");
                fillDataIntoDynamicSelects(selectLPDist, 'Select District', allDistricts, 'name', dpObj.lunchplace_id.district_id.name);

            } catch (error) {
                console.error('error fetching previous lunch place info')
            }
        }

        const selectIdsToEnable = [
            'pickupDistrictSelect',
            'pickupAccommodationSelect',
            'dropOffDistrictSelect',
            'dropOffAccommodationSelect',
            'altStay1Select',
            'altStay2Select'
        ]

        selectIdsToEnable.forEach(selectId => {
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                selectElement.disabled = false;
                selectElement.style.border = '1px solid #ced4da';
            }
        })

        fillDataIntoDynamicSelects(selectedVPs, '', dpObj.vplaces, 'name');

        dpUpdateBtn.disabled = false;
        dpUpdateBtn.style.cursor = "pointer";

        dpAddBtn.disabled = true;
        dpAddBtn.style.cursor = "not-allowed";

        dpResetBtn.classList.add("d-none");

        const dyPlanStatusSelectElement = document.getElementById('dpSelectStatus');
        dyPlanStatusSelectElement.style.border = '1px solid #ced4da';

        //handle lunch overall
        if (dpObj.is_template) {
            selectLPProv.disabled = true;
            packedLunchYes.checked = false;
            packedLunchNo.checked = false;
            packedLunchYes.disabled = true;
            packedLunchNo.disabled = true;
        }

        $("#infoModalDayPlan").modal("hide");

        var myDPFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
        myDPFormTab.show();

        var step1Tab = new bootstrap.Tab(document.getElementById('dayStep1-tab'));
        step1Tab.show();

    }

}

// check if visiting places have changed
const vplacesChanged = () => {
    // if the length of vplaces is different, return true directly
    if (dayplan.vplaces.length !== oldDayplan.vplaces.length) {
        return true;
    }

    // If the lengths are the same, check if any of the IDs have changed
    for (let i = 0; i < dayplan.vplaces.length; i++) {
        let newPlaceId = dayplan.vplaces[i]?.id || null;
        let oldPlaceId = oldDayplan.vplaces[i]?.id || null;

        if (newPlaceId !== oldPlaceId) {
            return true;
        }
    }

    // If no changes were found, return false
    return false;
};


//show updated values
const showDPValueChanges = () => {
    let updates = "";

    if (dayplan.daytitle !== oldDayplan.daytitle) {
        updates += `Day title will be changed to "${dayplan.daytitle}"\n`;
    }

    if (dayplan.dp_status !== oldDayplan.dp_status) {
        updates += `Status will be changed to "${dayplan.dp_status}"\n`;
    }

    if (dayplan.note !== oldDayplan.note) {
        updates += `Note will be changed to "${dayplan.note}"\n`;
    }

    // Pickup location
    if (dayplan.pickuppoint !== oldDayplan.pickuppoint) {
        updates += `Pickup point will be changed to "${dayplan.pickuppoint}"\n`;
    }
    if ((dayplan.pickup_stay_id?.id || null) !== (oldDayplan.pickup_stay_id?.id || null)) {
        updates += `Pickup location will be changed to "${dayplan.pickup_stay_id?.name || 'N/A'}"\n`;
    }

    // Drop location
    if (dayplan.droppoint !== oldDayplan.droppoint) {
        updates += `Drop point will be changed to "${dayplan.droppoint}"\n`;
    }

    if ((dayplan.drop_stay_id?.id || null) !== (oldDayplan.drop_stay_id?.id || null)) {
        updates += `Drop location will be changed to "${dayplan.drop_stay_id?.name || 'N/A'}"\n`;
    }

    if ((dayplan.alt_stay_1_id?.id || null) !== (oldDayplan.alt_stay_1_id?.id || null)) {
        updates += `Alternative Stay 1 will be changed to "${dayplan.alt_stay_1_id?.name || 'N/A'}"\n`;
    }

    if ((dayplan.alt_stay_2_id?.id || null) !== (oldDayplan.alt_stay_2_id?.id || null)) {
        updates += `Alternative Stay 2 will be changed to "${dayplan.alt_stay_2_id?.name || 'N/A'}"\n`;
    }

    // Lunch place or packed lunch
    if ((dayplan.lunchplace_id?.id || null) !== (oldDayplan.lunchplace_id?.id || null)) {
        updates += `Lunch place will be changed to "${dayplan.lunchplace_id?.name || 'None'}"\n`;
    }

    if (dayplan.is_takepackedlunch !== oldDayplan.is_takepackedlunch) {
        updates += `Packed lunch option will be changed to "${dayplan.is_takepackedlunch ? 'Yes' : 'No'}"\n`;
    }

    // KM count
    if (dayplan.totalkmcount !== oldDayplan.totalkmcount) {
        updates += `Total distance will be changed to "${dayplan.totalkmcount} km"\n`;
    }

    // Visiting places
    //if (dayplan.vplaces.length !== oldDayplan.vplaces.length) {
    //    updates += `Visiting places list has been updated\n`;
    //}

    if (vplacesChanged()) {
        updates += `Visiting places list has been updated\n`;
    }

    return updates;
};

//fn for update button to update a record
const updateDayPlan = async () => {

    const errors = checkDPFormErrors();
    if (errors == "") {
        let updates = showDPValueChanges();
        if (updates == "") {
            showAlertModal('err', "No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/dayplan", "PUT", dayplan);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', 'Saved Successfully');
                        document.getElementById('formDayPlan').reset();
                        refreshDayPlanForm();
                        resetDayPlanFilters();
                        buildDayPlanTable();
                        var myDPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myDPTableTab.show();
                        //window.location.reload();
                    } else {
                        showAlertModal('err', "Update Failed \n" + putServiceResponse);
                    }

                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                showAlertModal('inf', 'User cancelled the task');
            }
        }
    } else {
        showAlertModal('war', errors);
    }
}

//fn for delete button to delete a record
const deleteDayPlanRecord = async (dpObj) => {
    const userConfirm = confirm("Are you sure to delete the dayplan " + dpObj.dayplancode + " ?");
    if (userConfirm) {
        try {
            const deleteServerResponse = await ajaxPPDRequest("/dayplan", "DELETE", dpObj);

            if (deleteServerResponse === 'OK') {
                showAlertModal('suc', 'Record Deleted');
                $('#infoModalDayPlan').modal('hide');
                window.location.reload();
            } else {
                showAlertModal('err', 'Delete Failed' + deleteServerResponce);
            }
        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', "User cancelled the task")
    }
}

//restore dayplan record if its already deleted
const restoreDayPlanRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥
            dayplan = window.currentObject;
            dayplan.deleted_dp = false;

            let putServiceResponse = await ajaxPPDRequest("/dayplan", "PUT", dayplan);

            if (putServiceResponse === "OK") {
                showAlertModal('suc', "Successfully Restored");
                $("#infoModalDayPlan").modal("hide");

                //A LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
                window.location.reload();

            } else {
                showAlertModal('err', "Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'User cancelled the recovery task');
    }


}

//to support navigate through multi step form (NOT USED)
const updateDayTab = () => {

    console.log("running");

    const dayTabLinks = document.querySelectorAll('#dayPlanTabs .nav-link');
    let currentDayStep = 0;

    dayTabLinks.forEach((link, index) => {
        if (index === currentDayStep) {
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            document.querySelector(link.getAttribute('href')).classList.add('show', 'active');
        } else {
            link.classList.remove('active');
            link.setAttribute('aria-selected', 'false');
            document.querySelector(link.getAttribute('href')).classList.remove('show', 'active');
        }
    });

    //prevDayBtn.disabled = currentDayStep === 0;
    //nextDayBtn.textContent = currentDayStep === dayTabLinks.length - 1 ? 'Submit' : 'Next';
}

//check if alt stays and main dropoff accos are same
const checkMainStayDuplications = () => {
    const dropOff = document.getElementById('dropOffAccommodationSelect');
    const alt1 = document.getElementById('altStay1Select');
    const alt2 = document.getElementById('altStay2Select');

    const dropVal = dropOff.value;
    const alt1Val = alt1.value;
    const alt2Val = alt2.value;

    if (dropVal && alt1Val && dropVal == alt1Val) {
        alert("Drop-off accommodation and Alternative Stay 1 cannot be the same.");
        alt1.value = '';
        alt1.style.border = '2px solid red';
        dayplan.alt_stay_1_id = null;
    }
    if (dropVal && alt2Val && dropVal == alt2Val) {
        alert("Drop-off accommodation and Alternative Stay 2 cannot be the same.");
        alt2.value = '';
        alt2.style.border = '2px solid red';
        dayplan.alt_stay_2_id = null;
    }

}

const checkAltStayDuplications = () => {
    const alt1 = document.getElementById('altStay1Select');
    const alt2 = document.getElementById('altStay2Select');

    const alt1Val = alt1.value;
    const alt2Val = alt2.value;

    if (alt1Val && alt2Val && alt1Val === alt2Val) {
        alert("Alternative Stay 1 and Alternative Stay 2 cannot be the same.");
        alt2.value = '';
        alt2.style.border = '2px solid red';
        dayplan.alt_stay_2_id = null;

        //alt1.value = '';
        //alt1.style.border = '2px solid red';
        //dayplan.alt_stay_1_id = null;
    }
}

//print day plan with input values (NOT USING)
const printDayPlanRecordOld = () => {
    const dpTitle = document.getElementById('modalDPTitle').innerText || 'Day Plan';

    const modalContent = `
<div class="container my-3 p-3 border border-info rounded shadow-sm">
    <h2 class="text-center text-info mb-3">Day Plan Information</h2>
    <hr class="border border-info border-2">

    <div class="mb-3">
        <p><strong>Day Plan Code:</strong> ${document.getElementById('modalDPCode').innerText || 'N/A'}</p>
        <p><strong>Title:</strong> ${dpTitle}</p>
        <p><strong>Status:</strong> ${document.getElementById('modalDPStatus').innerText || 'N/A'}</p>
    </div>

    <div class="mb-3">
        <p><strong>Start Location:</strong> ${document.getElementById('modalDPStartLocation').innerText || 'N/A'}</p>
        <p><strong>Lunch Place:</strong> ${document.getElementById('modalDPLunch').innerText || 'N/A'}</p>
        <p><strong>Stay Location:</strong> ${document.getElementById('modalDPStay').innerText || 'N/A'}</p>
        <p><strong>Alternate Stay 1:</strong> ${document.getElementById('modalDPAltStay1')?.innerText || 'N/A'}</p>
        <p><strong>Alternate Stay 2:</strong> ${document.getElementById('modalDPAltStay2')?.innerText || 'N/A'}</p>
    </div>

    <div class="mb-3">
        <p><strong>Local Adult Ticket:</strong> ${document.getElementById('modalDPTktLocalAdult').innerText || 'N/A'}</p>
        <p><strong>Local Child Ticket:</strong> ${document.getElementById('modalDPTktLocalChild').innerText || 'N/A'}</p>
        <p><strong>Foreign Adult Ticket:</strong> ${document.getElementById('modalDPTktForeignAdult').innerText || 'N/A'}</p>
        <p><strong>Foreign Child Ticket:</strong> ${document.getElementById('modalDPTktForeignChild').innerText || 'N/A'}</p>
        <p><strong>Parking Fee:</strong> ${document.getElementById('modalDPParkingFee').innerText || 'N/A'}</p>
        <p><strong>Total Distance:</strong> ${document.getElementById('modalDPTotalDistance').innerText || 'N/A'}</p>
    </div>

    <div class="mb-3">
        <p><strong>Attractions:</strong></p>
        <div class="border rounded p-2 d-flex flex-column gap-1">
        ${document.getElementById('modalDPAttractions').innerHTML || 'N/A'}
      </div>
    </div>

    <div class="mb-3">
        <p><strong>Additional Note:</strong> ${document.getElementById('modalDPNote').innerText || 'N/A'}</p>
    </div>

    <hr class="mt-4 border border-info">
    <p class="text-center text-muted small">Generated on: 
        ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
</div>
`;

    const printWindow = window.open('', '', 'width=800,height=600');
    const printableTitle = `DayPlan_${dpTitle.trim().replace(/\s+/g, '_')}`;

    printWindow.document.write(`
<html>
<head>
    <title>${printableTitle}</title>
    <link rel="stylesheet" href="../libs/bootstrap-5.2.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="../libs/bootstrap-icons-1.11.3/font/bootstrap-icons.css">
    <script src="../libs/bootstrap-5.2.3/js/bootstrap.bundle.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 10px;
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
        }
        @media print {
            body {
                margin: 0;
                padding: 0;
                background-color: white;
            }
            .shadow-sm {
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body>
    <div id="print-content">Loading...</div>
</body>
</html>
`);

    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.document.getElementById('print-content').innerHTML = modalContent;
        printWindow.print();
        setTimeout(() => {
            printWindow.close();
        }, 1000);
    };
};


