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
            { displayType: 'text', displayingPropertyOrFn: 'dp_code', colHeadName: 'Code' },
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

//to fill main table
const showDayPlanStatus = (dpObj) => {
    if (dpObj.deleted_dp == null || dpObj.deleted_dp == false) {
        if (dpObj.dp_status == "active") {
            return "Active"
        } else {
            return "Deleted Record"
        }
    } else if (dpObj.deleted_dp != null && dpObj.deleted_dp == true) {
        return '<p class="text-white bg-danger text-center my-0 p-2" > Deleted Record </p>'
    }
}

//fn to ready the main form for accept values
const refreshDayPlanForm = async () => {

    dayplan = new Object();

    dayplan.vplaces = [];
    dayplan.activities = [];

    document.getElementById('formDayPlan').reset();

    try {
        const allProvinces = await ajaxGetReq("/province/all");

        fillDataIntoDynamicSelects(selectDPStartProv, 'Select Province', allProvinces, 'name');

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
    fillDataIntoDynamicSelects(selectDPStartDist, 'Select The Province First', districts, 'name');
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

//💥
const setDPStatus = () => {

}

//handle isTemplate or not
const handleDayTypeRadio = (fieldId) => {
    dayplan.is_template = fieldId.value;
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

//for add a single location
const addOne = () => {

    let isPlaceAlreadyExist = false;
    let selectedPlace = JSON.parse(allVPs.value);

    for (const vplz of dayplan.vplaces) {
        if (selectedPlace.id == vplz.id) {
            isPlaceAlreadyExist = true;
            break;
        }
    }
    if (isPlaceAlreadyExist) {
        alert('this place is already selected')
    } else {
        let selectedPlace = JSON.parse(allVPs.value);

        dayplan.vplaces.push(selectedPlace);
        fillDataIntoDynamicSelects(passedVPlaces, 'Selected Places', dayplan.vplaces, 'name')

        let existIndex = vplaces.map(place => place.name).indexOf(selectedPlace.name);
        if (existIndex != -1) {
            vplaces.splice(existIndex, 1)
        }
        fillDataIntoDynamicSelects(allVPs, 'Please Select The Place', vplaces, 'name');

        //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
        calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
        calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
        calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
        calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

        calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");
    }

}
//for add all locations 
const addAll = () => {
    for (const lvplz of vplaces) {
        let rightsideisPlaceAlreadyExist = false;

        for (const rvplz of dayplan.vplaces) {
            if (lvplz.id == rvplz.id) {
                rightsideisPlaceAlreadyExist = true;
                break;
            }
        }

        if (!rightsideisPlaceAlreadyExist) {
            dayplan.vplaces.push(lvplz);
            fillDataIntoDynamicSelects(passedVPlaces, 'Selected Places', dayplan.vplaces, 'name')
        }
    }

    vplaces = [];
    fillDataIntoDynamicSelects(allVPs, 'Please Select The Place', vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

    calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");

}

//for remove a single location
const removeOne = () => {

    let selectedPlaceToRemove = JSON.parse(passedVPlaces.value);

    fillDataIntoDynamicSelects(allVPs, 'Please Select The Place', vplaces, 'name');

    let existIndex = dayplan.vplaces.map(place => place.name).indexOf(selectedPlaceToRemove.name);  //dayplan.vplaces array eke thiynawada balanawa selected option eke name eka (selectedPlaceToRemove.name) ; passe eke index eka gannawa; 
    if (existIndex != -1) {
        dayplan.vplaces.splice(existIndex, 1)   //exist nam(ehema namak thiyanawa nam) right side eke list ekenma remove karanawa
    }

    fillDataIntoDynamicSelects(passedVPlaces, 'Selected Places', dayplan.vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

    calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");

}

//for remove all locations
const removeAll = () => {

    dayplan.vplaces = [];
    fillDataIntoDynamicSelects(passedVPlaces, '', dayplan.vplaces, 'name');

    //CALC TOTAL TKT COSTS AND VEHICLE PARKING COSTS 
    calcTktCost("feelocaladult", dpTotalLocalAdultTktCost, "foreignadulttktcost");
    calcTktCost("feeforeignadult", dpTotalForeignAdultTktCost, "foreignchildtktcost");
    calcTktCost("feechildlocal", dpTotalLocalChildTktCost, "localadulttktcost");
    calcTktCost("feechildforeign", dpTotalForeignChildTktCost, "localchildtktcost");

    calcTktCost("vehicleparkingfee", dpTotalVehiParkingCost, "totalvehiparkcost");

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
        fillDataIntoDynamicSelects(allVPs, 'Please Select The Place', vpByDist, 'name');
    } catch (error) {
        console.error('getVPlacesByDistrict failed')
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

    if (dayplan.daytitle == null) {
        errors += " Name cannot be empty \n";
    }

    if (dayplan.is_template == null) {
        errors += "TYPE cannot be empty \n";
    }

    if (dayplan.foreignadulttktcost == null) {
        errors += "foreignadulttktcost cannot be empty \n";
    }

    if (dayplan.foreignchildtktcost == null) {
        errors += "foreignchildtktcost cannot be empty \n";
    }

    if (dayplan.localadulttktcost == null) {
        errors += "localadulttktcost Number cannot be empty \n";
    }

    if (dayplan.localchildtktcost == null) {
        errors += "localchildtktcost cannot be empty \n";
    }

    if (dayplan.vplaces == null && dayplan.activities) {
        errors += "At least select one of actiities or attractions  \n";
    }

    if (dayplan.totalkmcount == null) {
        errors += "totalkmcount cannot be empty \n";
    }

    if (dayplan.end_stay_id == null) {
        errors += "end_stay_id cannot be empty \n";
    }

    if (dayplan.lunchplace_id == null) {
        errors += "lunchplace_id cannot be empty \n";
    }

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
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formDayPlan').reset();
                    refreshDayPlanForm();
                    buildDayPlanTable();
                    var myDPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myDPTableTab.show();
                } else {
                    alert('Submit Failed ' + postServerResponse);
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
const openModal = (empObj) => {

    resetModal();

    document.getElementById('modalEmpCode').innerText = empObj.emp_code || 'N/A';
    document.getElementById('modalEmpFullName').innerText = empObj.fullname || 'N/A';
    document.getElementById('modalEmpNIC').innerText = empObj.nic || 'N/A';
    document.getElementById('modalEmpDOB').innerText = empObj.dob || 'N/A';
    document.getElementById('modalEmpPersonalEmail').innerText = empObj.email || 'N/A';
    document.getElementById('modalEmpWorkEmail').innerText = empObj.email || 'N/A';
    document.getElementById('modalEmpMobileNum').innerText = empObj.mobilenum || 'N/A';
    document.getElementById('modalEmpLandNum').innerText = empObj.landnum || 'N/A';
    document.getElementById('modalEmpAddress').innerText = empObj.address || 'N/A';
    document.getElementById('modalEmpGender').innerText = empObj.gender || 'N/A';
    document.getElementById('modalEmpNote').innerText = empObj.note || 'N/A';
    document.getElementById('modalEmpDesignation').innerText = empObj.designation_id.name || 'N/A';
    document.getElementById('modalEmpStatus').innerText = empObj.emp_status || 'N/A';

    if (empObj.emp_photo != null) {
        document.getElementById('modalPreviewEmployeeImg').src = atob(empObj.emp_photo)
    } else {
        document.getElementById('modalPreviewEmployeeImg').src = 'images/employee.png';
    }

    if (empObj.deleted_emp) {
        document.getElementById('modalEmpIfDeleted').classList.remove('d-none');
        document.getElementById('modalEmpIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(empObj.deleteddatetime).toLocaleString();
        document.getElementById('modalEmpEditBtn').disabled = true;
        document.getElementById('modalEmpDeleteBtn').disabled = true;
        document.getElementById('modalEmpEditBtn').classList.add('d-none');
        document.getElementById('modalEmpDeleteBtn').classList.add('d-none');
        document.getElementById('modalEmpRecoverBtn').classList.remove('d-none');
    }

    // Show the modal
    $('#infoModalEmployee').modal('show');

};

// refill the form to edit a record
const refillEmployeeForm = async (empObj) => {

    employee = JSON.parse(JSON.stringify(empObj));
    oldEmployee = JSON.parse(JSON.stringify(empObj));

    //doc.getelebyid yanna 💥💥💥💥
    inputFullName.value = empObj.fullname;
    inputNIC.value = empObj.nic;
    inputEmail.value = empObj.email;
    inputMobile.value = empObj.mobilenum;
    inputLand.value = empObj.landnum;
    inputAddress.value = empObj.address;
    inputNote.value = empObj.note;
    dateDateOfBirth.value = empObj.dob;
    selectEmployeementStatus.value = empObj.emp_status;

    if (empObj.gender == "Male") {
        radioMale.checked = true;
    } else {
        radioFemale.checked = true;
    }

    if (employee.emp_photo != null) {
        previewEmployeeImg.src = atob(employee.emp_photo);
    } else {
        previewEmployeeImg.src = "images/employee.png";
    }

    try {
        designations = await ajaxGetReq("/desig/all");
        fillDataIntoDynamicSelects(selectDesignation, 'Select Designation', designations, 'name', empObj.designation_id.name);
    } catch (error) {
        console.error("Failed to fetch Designations : ", error);
    }

    empUpdateBtn.disabled = false;
    empUpdateBtn.style.cursor = "pointer";

    empAddBtn.disabled = true;
    empAddBtn.style.cursor = "not-allowed";

    document.getElementById('selectEmployeementStatus').style.border = '1px solid #ced4da';
    //document.getElementById('selectEmployeementStatus').children[2].classList.remove('d-none');

    $("#infoModalEmployee").modal("hide");

    var myEmpFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myEmpFormTab.show();

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshEmployeeForm();
        }
    });
});

//show value changes before update
const showEmpValueChanges = () => {

    let updates = "";

    if (employee.fullname != oldEmployee.fullname) {
        updates = updates + " Full Name will be changed to " + employee.fullname + "\n";
    }
    if (employee.nic != oldEmployee.nic) {
        updates = updates + " NIC will be changed to " + employee.nic + "\n";
    }
    if (employee.mobilenum != oldEmployee.mobilenum) {
        updates = updates + " Mobile Number will be changed to " + employee.mobilenum + "\n";
    }
    if (employee.landnum != oldEmployee.landnum) {
        updates = updates + " Land Number will be changed to " + employee.landnum + "\n";
    }
    if (employee.email != oldEmployee.email) {
        updates = updates + " Email will be changed to " + employee.email + "\n";
    }
    if (employee.dob != oldEmployee.dob) {
        updates = updates + " DOB will be changed to " + employee.dob + "\n";
    }
    if (employee.gender != oldEmployee.gender) {
        updates = updates + " Gender will be changed to " + employee.gender + "\n";
    }
    if (employee.address != oldEmployee.address) {
        updates = updates + " Address will be changed to " + employee.address + "\n";
    }
    if (employee.designation_id.name != oldEmployee.designation_id.name) {
        updates = updates + " Designation will be changed to " + employee.designation_id.name + "\n";
    }
    if (employee.emp_status != oldEmployee.emp_status) {
        updates = updates + " Status will be changed to " + employee.emp_status + "\n";
    }
    if (employee.note != oldEmployee.note) {
        updates = updates + " Note will be changed to " + employee.note + "\n";
    }

    if (employee.emp_photo != oldEmployee.emp_photo) {
        updates = updates + " Employee Photo has changed";
    }

    return updates;
}

//fn for update button
const updateEmployee = async () => {

    const errors = checkEmpFormErrors();
    if (errors == "") {
        let updates = showEmpValueChanges();
        if (updates == "") {
            alert("No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/emp", "PUT", employee);

                    if (putServiceResponse === "OK") {
                        alert("Successfully Updated");
                        document.getElementById('formEmployee').reset();
                        refreshEmployeeForm();
                        buildEmployeeTable();
                        var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myEmpTableTab.show();
                    } else {
                        alert("Update Failed \n" + putServiceResponse);
                    }

                } catch (error) {
                    alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                alert("User cancelled the task");
            }
        }
    } else {
        alert("Form has following errors: \n" + errors);
    }
}

//fn to delete an employee record
const deleteEmployeeRecord = async (empObj) => {
    const userConfirm = confirm("Are you sure to delete the employee " + empObj.emp_code + " ?");
    if (userConfirm) {
        try {
            const deleteServerResponse = await ajaxPPDRequest("/emp", "DELETE", empObj);

            if (deleteServerResponse === 'OK') {
                alert('Record Deleted');
                $('#infoModalEmployee').modal('hide');
                window.location.reload();
            } else {
                alert('Delete Failed' + deleteServerResponce);
            }
        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert("User cancelled the task")
    }
}

//restore employee record if its already deleted
// or this should call a new service to set deleted_emp as false ? 💥💥💥
const restoreEmployeeRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥
            employee = window.currentObject;
            employee.deleted_emp = false;

            let putServiceResponse = await ajaxPPDRequest("/emp", "PUT", employee);

            if (putServiceResponse === "OK") {
                alert("Successfully Restored");
                $("#infoModalEmployee").modal("hide");

                //AN LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
                window.location.reload();

            } else {
                alert("Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert('User cancelled the recovery task');
    }


}

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
    fillDataIntoDynamicSelects(passedVPlaces, 'Please Select The Place', dayplan.vplaces, 'name')

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
        alert("Succesfully Saved ! \n New Code : " + postServiceResponse);
        formDayPlan.reset();
        refreshDayPlanForm();
        refreshDayPlanTable();

        $('#mainDayPlanFormModal').modal('hide');
    } else {
        alert("An Error Occured " + postServiceResponse);
    }

}


