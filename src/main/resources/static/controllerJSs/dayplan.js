window.addEventListener('load', () => {

    buildDayPlanTable();
    refreshDayPlanForm();

});

//global var to store id of the table
let sharedTableId = "mainTableDayPlan";

//to create and refresh content in main dayplan table
const buildDayPlanTable = async () => {

    try {
        const dayplans = await ajaxGetReq("/dayplan/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'dayplancode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'daytitle', colHeadName: 'Title' },
            { displayType: 'function', displayingPropertyOrFn: showDayType, colHeadName: 'Type' },
            { displayType: 'function', displayingPropertyOrFn: showDayPlanStatus, colHeadName: 'Status' }
        ]

        createTable(tableDayPlanHolderDiv, sharedTableId, dayplans, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build day plan table:", error);
    }

}

//to fill main table
const showDayType = (dpObj) => {
    if (dpObj.is_template) {
        return "Template"
    } else {
        return "Not Template"
    }
}


const showDayPlanStatus = (dpObj) => {

    if (dpObj.deleted_dp == null || dpObj.deleted_dp == false) {

        return dpObj.dp_status
        //if (dpObj.dp_status == "Draft") {
        //    return "Draft"
        //}
        //if (dpObj.dp_status == "Confirmed") {
        //    return "Confirmed"
        //}
        //if (dpObj.dp_status == "Completed") {
        //    return "Completed"
        //}

    } else if (dpObj.deleted_dp != null && dpObj.deleted_dp == true) {
        return '<p class="text-white bg-danger text-center my-0 p-2" > Deleted Record </p>'
    }
}

//fn to ready the main form for accept values
const refreshDayPlanForm = async () => {

    dayplan = new Object();

    dayplan.vplaces = new Array();

    document.getElementById('formDayPlan').reset();

    try {
        const allProvinces = await ajaxGetReq("/province/all");

        //fillDataIntoDynamicSelects(selectDPStartProv, 'Select Province', allProvinces, 'name');

        fillDataIntoDynamicSelects(selectVPProv, 'Select Province', allProvinces, 'name');

        fillDataIntoDynamicSelects(selectLPProv, 'Select Province', allProvinces, 'name');

        fillDataIntoDynamicSelects(selectDPEndProv, 'Select Province', allProvinces, 'name');

    } catch (error) {
        console.error("Failed to fetch Provinces : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'dpTitle',
        'selectDPStartProv',
        'selectDPStartDist',
        'selectVPProv',
        'selectVPDist',
        'selectLPProv',
        'selectLPDist',
        'selectDPLunch',
        'selectDPEndProv',
        'selectDPEndDist',
        'selectDPEndStay',
        'dpTotalLocalAdultTktCost',
        'dpTotalLocalChildTktCost',
        'dpTotalForeignAdultTktCost',
        'dpTotalForeignChildTktCost',
        'dpTotalVehiParkingCost',
        'dpTotalCostForToday',
        'dpNote',
        'allVPs',
        'selectedVPs',
        'dpSelectStatus',
        'dpTotalKMcount',
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    // show EMPTY district selects, before filtered by province
    districts = [];
    //fillDataIntoDynamicSelects(selectDPStartDist, 'Select The Province First', districts, 'name');
    fillDataIntoDynamicSelects(selectVPDist, 'Select The Province First', districts, 'name');
    fillDataIntoDynamicSelects(selectLPDist, 'Select The Province First', districts, 'name');
    fillDataIntoDynamicSelects(selectDPEndDist, 'Select The Province First', districts, 'name');

    //show EMPTY accomadation selects, before filtered by district
    stay = [];
    fillDataIntoDynamicSelects(selectDPEndStay, 'Select The District First', stay, 'name');

    //show EMPTY lunch selects, before filtered by district
    lunchHotels = [];
    fillDataIntoDynamicSelects(selectDPLunch, 'select the District first', lunchHotels, 'name')

    dpUpdateBtn.disabled = true;
    dpUpdateBtn.style.cursor = "not-allowed";

    dpAddBtn.disabled = false;
    dpAddBtn.style.cursor = "pointer";

    document.getElementById('dpSelectStatus').children[2].removeAttribute('class', 'd-none');
}

//for 3 checkboxes
const selectDayType = (feild) => {
    dayplan.dayplancode = feild.value;
}


//handle isTemplate or not
const handleDayTypeRadio = (fieldId) => {
    dayplan.is_template = fieldId.value;
}

//set status auto
const setDayPlanStatus = () => {
    document.getElementById('dpSelectStatus').classList.add = 'd-none';
    dayplan.dp_status = 'Draft';
}

//handle changes based on dp type
const handleChangesBasedDPType = () => {
    if (dpTemplate.checked) {

        document.getElementById('DayTypeCBsRow').classList.add("d-none");
        dayplan.dayplancode = "TP";

        document.getElementById('lunchPlaceDivId').classList.add("d-none");
        dayplan.lunchplace_id = null;

        document.getElementById('endPointDivId').classList.add("d-none");
        dayplan.end_stay_id = null;

    } else if (dpNotTemplate.checked) {
        document.getElementById('DayTypeCBsRow').classList.remove("d-none");
        dayplan.dayplancode = null;

        document.getElementById('lunchPlaceDivId').classList.remove("d-none");
        dayplan.lunchplace_id = null;

        document.getElementById('endPointDivId').classList.remove("d-none");
        dayplan.end_stay_id = null;
    }
}

//to calculate total vehi parking fee also depends on visiting hours
const calcTotalVehiParkingfee = () => {
    let cost = 0.00;
    dayplan.vplaces.forEach(placeObj => {
        fee = (placeObj.vehicleparkingfee) * (placeObj.duration);
        cost = cost + fee;
        return cost;
    });

    dpTotalVehiParkingCost.value = parseFloat(cost).toFixed(2);
    dayplan.totalvehiparkcost = dpTotalVehiParkingCost.value ;
}

//CALCULATE TOTAL TICKET COST AND VEHI PARKING FEE
const calcTktCost = (vpCostType, dpInputFieldID, dpPropertName) => {

    let cost = 0.00;
    dayplan.vplaces.forEach(placeObj => {
        fee = placeObj[vpCostType];
        cost = cost + fee;
        return cost;
    });

    dpInputFieldID.value = parseFloat(cost).toFixed(2);
    dayplan[dpPropertName] = dpInputFieldID.value;

}

//auto populate lunch restaurants and end stays, based on last element of vplaces array
const getLunchAndHotelAuto = async () => {

    if (dayplan.vplaces.length != 0 && dayplan.is_template == "false") {

        let lastElement = (dayplan.vplaces).at(-1);
        let distIdOfLastEle = lastElement.district_id.id;
        let provIdOfLastEle = lastElement.district_id.province_id.id;
        console.log("distIdOfLastEle: " + distIdOfLastEle);
        console.log("provIdOfLastEle: " + provIdOfLastEle);

        try {
            lunchByDist = await ajaxGetReq("/lunchplace/bydistrict/" + distIdOfLastEle);
            fillDataIntoDynamicSelects(selectDPLunch, 'Please Select The Hotel', lunchByDist, 'name');
            selectDPLunch.disabled = false
        } catch (error) {
            console.error('getLunchAndHotelAuto lunch fails');
        }

        try {
            staysByDist = await ajaxGetReq("/stay/bydistrict/" + distIdOfLastEle);
            fillDataIntoDynamicSelects(selectDPEndStay, 'Please Select The Accomodation', staysByDist, 'name');
            selectDPEndStay.disabled = false
        } catch (error) {
            console.error('getStayByDistrict failed')
        }

    }

}

//new
function printGcoords(dayplan) {
    if (dayplan && Array.isArray(dayplan.vplaces)) {
        dayplan.vplaces.forEach(place => {
            console.log(place.gcoords);
        });
    } else {
        console.log("No valid vplaces array found.");
    }
}


//for add a single location
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

        dayplan.vplaces.push(selectedPlace);
        fillDataIntoDynamicSelects(selectedVPsBox, '', dayplan.vplaces, 'name');

        let updatedVpByDist = vpByDist.filter(vp => vp.id != selectedPlace.id);
        fillDataIntoDynamicSelects(allVPsBox, '', updatedVpByDist, 'name');

        //opt 2 💥
        //let existIndex = vpByDist.map(place => place.name).indexOf(selectedPlace.name);
        //if (existIndex != -1) {
        //    vpByDist.splice(existIndex, 1);
        //}
        //fillDataIntoDynamicSelects(allVPsBox, '', vpByDist, 'name');
        //opt 2 ends 

        //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
        calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
        calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
        calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
        calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

        //calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");
        calcTotalVehiParkingfee();
        //getLunchAndHotelAuto();



        printGcoords(dayplan);

        //calculateRoadDistanceFromDayplan(dayplan);
    }

}

//for add all locations 
const addAll = () => {

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

    //new part
    printGcoords(dayplan);

    //calculateRoadDistanceFromDayplan(dayplan);

    //original
    vplaces = [];
    fillDataIntoDynamicSelects(allVPs, '', vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

    //calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");
    calcTotalVehiParkingfee();

    //getLunchAndHotelAuto()

}

//for remove a single location
const removeOne = () => {

    fillDataIntoDynamicSelects(allVPs, '', vpByDist, 'name');

    let selectedPlaceToRemove = JSON.parse(selectedVPs.value);

    let existIndex = dayplan.vplaces.map(place => place.name).indexOf(selectedPlaceToRemove.name);
    if (existIndex != -1) {
        dayplan.vplaces.splice(existIndex, 1)
    }

    fillDataIntoDynamicSelects(selectedVPs, '', dayplan.vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

    //calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");
    calcTotalVehiParkingfee();

    //getLunchAndHotelAuto();

}

//for remove all locations
const removeAll = () => {

    dayplan.vplaces = [];
    fillDataIntoDynamicSelects(selectedVPs, '', dayplan.vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

    //calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");
    calcTotalVehiParkingfee();

    //remove and clear automatically binded lp and end stay info too
    dayplan.lunchplace_id = null;
    dayplan.end_stay_id = null;

    let lunchPlaceSelect = document.getElementById("selectDPLunch");
    let endStaySelect = document.getElementById("selectDPEndStay");

    lunchPlaceSelect.style.border = "1px solid #ced4da";
    endStaySelect.style.border = "1px solid #ced4da";

    let emptyArr = [];
    fillDataIntoDynamicSelects(lunchPlaceSelect, 'Please Select The Restaurant', emptyArr, 'name');
    fillDataIntoDynamicSelects(endStaySelect, 'Please Select The Accomodation', emptyArr, 'name');

    lunchPlaceSelect.disabled = true;
    endStaySelect.disabled = true;

}

async function calculateTotalDistance() {
    const apiKey = '5b3ce3597851110001cf6248dfc26e4e6071445f9197c3adf89c69e4';
    const msgBox = document.getElementById('calcDistanceMsg');
    const kmInput = document.getElementById('dpTotalKMcount');

    // Clear old messages
    msgBox.innerText = '';
    kmInput.value = '';

    if (!dayplan || !dayplan.vplaces || dayplan.vplaces.length < 2) {
        msgBox.innerText = 'Please select at least 2 places.';
        return;
    }

    // Extract gcoords
    const coordinates = dayplan.vplaces.map(place => {
        const [lat, lon] = place.gcoords.split(',').map(Number);
        return [lon, lat];
    });

    const body = { coordinates: coordinates };

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
        const distanceKm = (distanceMeters / 1000).toFixed(2); // two decimals

        // ✅ Update the input and dayplan object
        kmInput.value = distanceKm;
        dayplan.totalkmcount = distanceKm;

        // ✅ Calculate time
        let durationSeconds = data.features[0].properties.summary.duration;
        let totalMinutes = Math.round(durationSeconds / 60);

        // Round to nearest 15 minutes
        let roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
        let hours = Math.floor(roundedMinutes / 60);
        let minutes = roundedMinutes % 60;

        // Format nicely
        let timeStr = hours;
        if (minutes > 0) {
            timeStr += "." + (minutes / 60).toFixed(2).split('.')[1]; // like 1.25 H
        }
        console.log(`🚗 Total Distance: ${distanceKm} km`);
        console.log(`⏱️ Total Estimated Time: ${timeStr} H`);

    } catch (error) {
        console.error('Error calculating distance:', error);
        msgBox.innerText = '⚠️ Unexpected error. Please enter total KM manually.';
    }
}

//get districts by province
const getDistByProvince = async (provinceSelectid, districtSelectId) => {

    const currentProvinceID = JSON.parse(provinceSelectid.value).id;
    try {
        const districts = await ajaxGetReq("districts/byprovinceid/" + currentProvinceID);
        fillDataIntoDynamicSelects(districtSelectId, " Please Select The District ", districts, 'name');
    } catch (error) {
        console.error("Failed to fetch districts:", error);
    }
    provinceSelectid.style.border = '2px solid lime';
    districtSelectId.disabled = false;

}

//getvisiting places by district
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

//get accomadations list by district
const getStayByDistrict = async (distSelectID, staySelectID) => {

    const selectedDistrict = JSON.parse(distSelectID.value).id;
    distSelectID.style.border = '2px solid lime';
    staySelectID.disabled = false;

    try {
        staysByDist = await ajaxGetReq("/stay/bydistrict/" + selectedDistrict);
        fillDataIntoDynamicSelects(staySelectID, 'Please Select The Accomodation', staysByDist, 'name');
    } catch (error) {
        console.error('getStayByDistrict failed')
    }
}

//get lunch hotel by district
const getLunchHotelByDistrict = async (distSelectID, lhSelectID) => {

    const selectedDistrict = JSON.parse(distSelectID.value).id;
    distSelectID.style.border = '2px solid lime';
    lhSelectID.disabled = false;

    try {
        lunchByDist = await ajaxGetReq("/lunchplace/bydistrict/" + selectedDistrict);
        fillDataIntoDynamicSelects(lhSelectID, 'Please Select The Hotel', lunchByDist, 'name');
    } catch (error) {
        console.error('getLunchHotelByDistrict');
    }
}



//check errors before submitting
const checkDPFormErrors = () => {
    let errors = "";

    //check these only if the day plan is a template
    if (dayplan.is_template) {

        if (dayplan.daytitle == null) {
            errors += " Name cannot be empty \n";
        }


        if (dayplan.vplaces == 0) {
            errors += "At least select one attraction  \n";
        }

        if (dayplan.totalkmcount == null) {
            errors += "totalkmcount cannot be empty \n";
        }

        //temporary 💥
        //if (dayplan.end_stay_id == null) {
        //    errors += "end_stay_id cannot be empty \n";
        //}

        //temporary 💥
        //if (dayplan.lunchplace_id == null) {
        //    errors += "lunchplace_id cannot be empty \n";
        //}

    } else {

        //methenta inq enna one , inq haduwata passe 💥

        if (dayplan.daytitle == null) {
            errors += " Name cannot be empty \n";
        }

        if (dayplan.vplaces.length == 0) {
            errors += "At least select one attraction  \n";
        }

        if (dayplan.totalkmcount == null) {
            errors += "totalkmcount cannot be empty \n";
        }

        if (dayplan.lunchplace_id == null) {
            errors += "lunchplace_id cannot be empty \n";
        }

        if (dayplan.end_stay_id == null) {
            errors += "end_stay_id cannot be empty \n";
        }
    }

    //    if (dayplan.foreignadulttktcost == null) {
    //        errors += "foreignadulttktcost cannot be empty \n";
    //    }
    //
    //    if (dayplan.foreignchildtktcost == null) {
    //        errors += "foreignchildtktcost cannot be empty \n";
    //    }
    //
    //    if (dayplan.localadulttktcost == null) {
    //        errors += "localadulttktcost Number cannot be empty \n";
    //    }
    //
    //    if (dayplan.localchildtktcost == null) {
    //        errors += "localchildtktcost cannot be empty \n";
    //    }

    return errors;
};

//fn to submit button (add button)
const addNewDayPlan = async () => {

    const errors = checkDPFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {
                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/dayplan", "POST", dayplan);

                if (postServerResponse === 'OK') {
                    showAlertModalModal('suc', 'Saved Successfully');
                    document.getElementById('formDayPlan').reset();
                    refreshDayPlanForm();
                    buildDayPlanTable();
                    var myDPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myDPTableTab.show();
                } else {
                    showAlertModal('err', 'Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                // Handle errors (such as network issues or server errors)
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        //showAlertModal('war',' \n' + errors);
        showAlertModal('war', errors);
    }
}

const resetModal = () => {

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

//fn for edit button,
const openModal = (dpObj) => {

    resetModal();

    if (dpObj.is_template) {
        document.getElementById('modalDPIsTemplateOrNot').innerText = 'This is a Template';
    }
    document.getElementById('modalDPCode').innerText = dpObj.dayplancode || 'N/A';
    document.getElementById('modalDPTitle').innerText = dpObj.daytitle || 'N/A';

    //find another way 💥💥💥
    let dpAttrs = '';
    dpObj.vplaces.forEach((element, index) => {
        if (dpObj.vplaces.length - 1 == index) {
            dpAttrs = dpAttrs + element.name;
        }
        else {
            dpAttrs = dpAttrs + element.name + ", ";
        }
    });

    document.getElementById('modalDPAttractions').innerText = dpAttrs || 'N/A';

    document.getElementById('modalDPLunch').innerText = dpObj.lunchplace_id?.name || 'N/A';

    document.getElementById('modalDPStay').innerText = dpObj.end_stay_id?.name || 'N/A';

    document.getElementById('modalDPTktLocalAdult').innerText = dpObj.localadulttktcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTktLocalChild').innerText = dpObj.localchildtktcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTktForeignAdult').innerText = dpObj.foreignadulttktcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTktForeignChild').innerText = dpObj.foreignchildtktcost.toFixed(2) || 'N/A';

    document.getElementById('modalDPParkingFee').innerText = dpObj.totalvehiparkcost.toFixed(2) || 'N/A';
    document.getElementById('modalDPTotalDistance').innerText = dpObj.totalkmcount + ' KM' || 'N/A';
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

// refill the form to edit a record
const refillDayPlanForm = async (dpObj) => {

    if (dpObj.dp_status == "Completed") {
        showAlertModal('err', "tour for this day plan is already completed, hence cant edit")
    } else {

        dayplan = JSON.parse(JSON.stringify(dpObj));
        oldDayplan = JSON.parse(JSON.stringify(dpObj));

        //cant edit these
        dpTemplate.disabled = true;
        dpNotTemplate.disabled = true;
        firstDayCB.disabled = true;
        middleDayCB.disabled = true;
        lastDayCB.disabled = true;

        document.getElementById('dpTotalKMcount').value = dayplan.totalkmcount;
        document.getElementById('dpTitle').value = dayplan.daytitle;
        document.getElementById('dpSelectStatus').value = dayplan.dp_status;
        document.getElementById('dpNote').value = dayplan.note;
        document.getElementById('dpTotalVehiParkingCost').value = dayplan.totalvehiparkcost;
        document.getElementById('dpTotalForeignChildTktCost').value = dayplan.foreignchildtktcost;
        document.getElementById('dpTotalForeignAdultTktCost').value = dayplan.foreignadulttktcost;
        document.getElementById('dpTotalLocalChildTktCost').value = dayplan.localchildtktcost;
        document.getElementById('dpTotalLocalAdultTktCost').value = dayplan.localadulttktcost;

        if (dayplan.dayplancode.substring(0, 2) == "FD") {
            firstDayCB.checked = true;

        } else if (dayplan.dayplancode.substring(0, 2) == "MD") {
            middleDayCB.checked = true;

        } else if (dayplan.dayplancode.substring(0, 2) == "LD") {
            lastDayCB.checked = true;
        }

        if (dayplan.is_template) {
            dpTemplate.checked = true;
        } else if (!dayplan.is_template) {
            dpNotTemplate.checked = true;
        }

        if (oldDayplan.lunchplace_id != null) {

            try {
                const lhs = await ajaxGetReq("/lunchplace/all");
                fillDataIntoDynamicSelects(selectDPLunch, '', lhs, 'name', dayplan.lunchplace_id.name);

                const allProvinces = await ajaxGetReq("/province/all");
                fillDataIntoDynamicSelects(selectLPProv, 'Select Province', allProvinces, 'name', dayplan.lunchplace_id.district_id.province_id.name);

                const allDistricts = await ajaxGetReq("/district/all");
                fillDataIntoDynamicSelects(selectLPDist, 'Select District', allDistricts, 'name', dayplan.lunchplace_id.district_id.name);

            } catch (error) {
                console.error('error fetching previous lunch place info')
            }
        }

        if (oldDayplan.end_stay_id != null) {
            try {
                const allStays = await ajaxGetReq("/stay/all");
                fillDataIntoDynamicSelects(selectDPEndStay, '', allStays, 'name', dayplan.end_stay_id.name);

                const allProvinces = await ajaxGetReq("/province/all");
                fillDataIntoDynamicSelects(selectDPEndProv, 'Select Province', allProvinces, 'name', dayplan.end_stay_id.district_id.province_id.name);

                const allDistricts = await ajaxGetReq("/district/all");
                fillDataIntoDynamicSelects(selectDPEndDist, 'Select District', allDistricts, 'name', dayplan.end_stay_id.district_id.name);

            } catch (error) {
                console.error('error fetching previous stay place info')
            }
        }

        fillDataIntoDynamicSelects(selectedVPs, '', dayplan.vplaces, 'name');

        dpUpdateBtn.disabled = false;
        dpUpdateBtn.style.cursor = "pointer";

        dpAddBtn.disabled = true;
        dpAddBtn.style.cursor = "not-allowed";

        document.getElementById('dpSelectStatus').style.border = '1px solid #ced4da';

        $("#infoModalDayPlan").modal("hide");

        var myDPFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
        myDPFormTab.show();

    }

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshDayPlanForm();
        }
    });
});

//show value changes before update
const showDPValueChanges = () => {

    let updates = "";

    if (dayplan.daytitle != oldDayplan.daytitle) {
        updates = updates + " Full Name will be changed to " + dayplan.daytitle + "\n";
    }
    if (dayplan.end_stay_id != oldDayplan.end_stay_id) {
        updates = updates + " end_stay_id will be changed to " + dayplan.end_stay_id.name + "\n";
    }
    if (dayplan.note != oldDayplan.note) {
        updates = updates + " note Number will be changed to " + dayplan.note + "\n";
    }
    if (dayplan.lunchplace_id != oldDayplan.lunchplace_id) {
        updates = updates + " lunchplace_id Number will be changed to " + dayplan.lunchplace_id.name + "\n";
    }
    if (dayplan.dp_status != oldDayplan.dp_status) {
        updates = updates + " dp_status will be changed to " + dayplan.dp_status + "\n";
    }
    if (dayplan.totalkmcount != oldDayplan.totalkmcount) {
        updates = updates + " totalkmcount will be changed to " + dayplan.email + "\n";
    }
    if (dayplan.vplaces.length != oldDayplan.vplaces.length) {
        updates = updates + "visiting places list changed";
    }

    return updates;
}

//fn for update button
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
                        buildDayPlanTable();
                        var myDPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myDPTableTab.show();
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

//fn to delete an dayplan record
const deleteDayPlanRecord = async (dpObj) => {
    const userConfirm = confirm("Are you sure to delete the dayplan " + dpObj.emp_code + " ?");
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
// or this should call a new service to set deleted_emp as false ? 💥💥💥
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

                //AN LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
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

//DONE FOR MODIFICATION 💥💥💥      
//total cost for today +++ discounted price
const calcTotalCostPerDay = () => {

    let localAdultCost = parseInt(document.getElementById('totalLocalAdultTktCost').value);
    let ForeignAdultCost = parseInt(document.getElementById('foreignadulttktcost').value);
    let LocalChildCost = parseInt(document.getElementById('totalLocalChildTktCost').value);
    let ForeignCgildCost = parseInt(document.getElementById('totalForeignChildTktCost').value);
    let ParkingCost = parseInt(document.getElementById('totalVehiParkingFeesInput').value);

    let totalCostForTodayVar = localAdultCost + ForeignAdultCost + LocalChildCost + ForeignCgildCost + ParkingCost;

    totalCostForToday.value = totalCostForTodayVar.toFixed(2);

}

//pass inq code to day title
const passName = () => {

    let inqSelectElement = document.getElementById('dpBasedInquiryNameSelect');

    let selectedOption = JSON.parse(inqSelectElement.value);
    let selectedOpsCode = selectedOption.inqcode;

    // var selectedText = inqSelectElement.innerText;

    var inputField = document.getElementById('dpTitle');

    inputField.value += " for " + selectedOpsCode;

}

//to save the same day plan with minor changes
const duplicateDayPlan = (obj) => {
    dayplan = JSON.parse(JSON.stringify(obj));
    oldDayPlanObj = JSON.parse(JSON.stringify(obj));

    firstDayCB.disabled = true;
    middleDayCB.disabled = true;
    lastDayCB.disabled = true;

    if (dayplan.dpbasedinq == null) {
        forWebSite.checked = true;
        // dpBasedInquiryNameSelect.disabled = true
        // lunchPlaceDivId.classList.add('d-none')
        // endPointDivId.classList.add('d-none')

    }

    if (dpBasedInquiryNameSelect.value != null) {
        forWebSite.checked = true;
    }

    if (oldDayPlanObj.lunch_hotel_id != null) {
        lunchHotels = ajaxGetReq("/lunchhotel/alldata");
        fillDataIntoDynamicSelects(dpLunchHotelSelect, 'Please Select', lunchHotels, 'name', dayplan.lunch_hotel_id.name);
    }

    //refill end stay
    if (oldDayPlanObj.end_stay_id != null) {
        endStay = ajaxGetReq("stay/alldata");
        fillDataIntoDynamicSelects(dpEndStaySelect, 'Please Select The Stay', endStay, 'name', dayplan.end_stay_id.name);

        //get province list FOR ENDING POINTS 
        endProvinces = ajaxGetReq("province/alldata");
        fillDataIntoDynamicSelects(dpEndProvinceSelect, 'Please Select The Province', endProvinces, 'name', dayplan.end_district_id.province_id.name)

        //refill end district
        districts = ajaxGetReq("district/alldata");
        fillDataIntoDynamicSelects(dpEndDistrictSelect, 'Please Select The District', districts, 'name', dayplan.end_district_id.name)
        dpEndDistrictSelect.disabled = false;

    }

    if (dayplan.endlocation != null) {
        endLocationText.value = dayplan.endlocation;
    }

    dpStartStaySelect.disabled = false;
    dpEndStaySelect.disabled = false;

    if (dayplan.dayplancode.substring(0, 2) == "FD") {
        firstDayCB.checked = true;

    } else if (dayplan.dayplancode.substring(0, 2) == "MD") {
        middleDayCB.checked = true;

    } else {
        lastDayCB.checked = true;
    }

    dpTitle.value = dayplan.daytitle;
    dpCode.value = dayplan.dayplancode;
    startLocationText.value = dayplan.startlocation;
    dpNote.value = dayplan.note;
    totalKMcount.value = dayplan.kmcountforday;

    //Refill province list FOR STARTING POINT
    startProvinces = ajaxGetReq("province/alldata");
    fillDataIntoDynamicSelects(dpStartProvinceSelect, 'Please Select The Province', startProvinces, 'name', dayplan.start_district_id.province_id.name)

    //refill start district
    districts = ajaxGetReq("district/alldata");
    fillDataIntoDynamicSelects(dpStartDistrictSelect, 'Please Select The District', districts, 'name', dayplan.start_district_id.name)
    dpStartDistrictSelect.disabled = false;

    //REFILL PASSED VPLACES
    fillDataIntoDynamicSelects(selectedVPs, 'Please Select The Place', dayplan.vplaces, 'name')

    //refill start stay
    if (dayplan.start_stay_id != null) {
        startStay = ajaxGetReq("stay/alldata");
        fillDataIntoDynamicSelects(dpStartStaySelect, 'Please Select The Stay', startStay, 'name', dayplan.start_stay_id.name)
    }

    //Refill dp status 
    dpStatuses = ajaxGetReq("/dpstatus/alldata")
    fillDataIntoDynamicSelects(dpStatusSelect, 'Select Status', dpStatuses, 'name', dayplan.dpstatus_id.name);

    dpStartProvinceSelect.disabled = true;
    dpStartDistrictSelect.disabled = true;

    dpAddBtn.disabled = true;
    dpAddBtn.style.cursor = "not-allowed";

    dpUpdateBtn.disabled = true;
    dpUpdateBtn.style.cursor = "not-allowed";

    dpSaveAsNewBtn.disabled = false;
    dpSaveAsNewBtn.style.cursor = "pointer";

    $('#mainDayPlanFormModal').modal('show');
}

//save as a new dayplan record
const saveAsNewDayPlan = () => {

    let postServiceResponse = ajaxRequest("/dayplan/saveasnew", "POST", dayplan);
    if (new RegExp("^[A-Z]{5}[0-9]{1,3}$").test(postServiceResponse)) {
        showAlertModal('suc', "Succesfully Saved ! \n New Code : " + postServiceResponse);
        formDayPlan.reset();
        refreshDayPlanForm();
        refreshDayPlanTable();

        $('#mainDayPlanFormModal').modal('hide');
    } else {
        showAlertModal('err', "An Error Occured " + postServiceResponse);
    }

}


