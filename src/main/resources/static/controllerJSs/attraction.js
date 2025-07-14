window.addEventListener('load', () => {

    // loggedUserPrivileges = ajaxGetRequest("/privilege/bymodule/ATTRACTION");

    //call fn for refresh/show data in table
    buildAttractionTable();

    //for attraction form
    refreshAttractionForm();

    refreshDistrictFilter();

})

//global var to store id of the table
let sharedTableId = "mainTableAttraction";

let attractions = [];

//fn for show data in table
const buildAttractionTable = async () => {

    try {
        attractions = await ajaxGetReq("/attraction/all");

        const tableColumnInfo = [

            { displayType: 'text', displayingPropertyOrFn: 'name', colHeadName: 'Name' },
            { displayType: 'function', displayingPropertyOrFn: showDistNProvince, colHeadName: 'District' },
            { displayType: 'function', displayingPropertyOrFn: showLocalFees, colHeadName: 'Local Fees <br class="my-0 py-0"> (LKR)' },
            { displayType: 'function', displayingPropertyOrFn: showForeignFees, colHeadName: 'Foreign Fees <br class="my-0 py-0"> (LKR)' },
            { displayType: 'function', displayingPropertyOrFn: showAttrStatus, colHeadName: 'Status' }

        ]

        createTable(tableAttractionHolderDiv, sharedTableId, attractions, tableColumnInfo);

        //call the new datatable format(from net)
        $(`#${sharedTableId}`).dataTable({
            destroy: true, // Allows re-initialization
            searching: true, // Remove the search bar
            info: false, // Show entries count
            pageLength: 10, // Number of rows per page
            ordering: false,// Remove up and down arrows
            lengthChange: false // Disable ability to change the number of rows
            // dom: 't', // Just show the table (t) with no other controls
        });

    } catch (error) {
        console.error("Failed to build attraction table:", error);
    }

}

//fill the districts to filter
const refreshDistrictFilter = async () => {

    let districts = [];

    try {
        districts = await ajaxGetReq("/district/all");
        let allDistrictsObj = {
            id: -10,
            name: "All Districts",
            province_id: 99
        };

        districts.unshift(allDistrictsObj);
        fillDataIntoDynamicSelects(attrDistrictFilter, 'Please Select The District', districts, 'name');

    } catch (error) {
        console.error("Error fetching districts for filter:", error);
    }

}

//handle filters
const applyAttrFilters = () => {
    const selecteDistrictRaw = document.getElementById('attrDistrictFilter').value;
    let selectedDistrict = null;

        if (selecteDistrictRaw && selecteDistrictRaw !== '') {
        try {
            selectedDistrict = JSON.parse(selecteDistrictRaw);
        } catch (e) {
            console.warn("District filter is not a valid JSON. Ignoring it.");
            selectedDistrict = null;
        }
    }

    const selectedAttrStts = document.getElementById('attrStatusFilter').value;

    const filteredAttractions = attractions.filter(attr => {
        let isDistMatch = true;
        let isStatusMatch = true;

        if (selectedDistrict && selectedDistrict.id !== -10) {
            isDistMatch = attr.district_id.id === selectedDistrict.id;
        }

        if (selectedAttrStts && selectedAttrStts !== "all") {
            if (selectedAttrStts === "ifDeleted") {
                isStatusMatch = attr.deleted_attr === true;
            } else {
                isStatusMatch = attr.attr_status === selectedAttrStts;
            }
        }

        return isDistMatch && isStatusMatch;
    });

    console.log("Filtered attractions:", filteredAttractions);

    $('#mainTableAttraction').empty();

    if ($.fn.DataTable.isDataTable('#mainTableAttraction')) {
        $('#mainTableAttraction').DataTable().clear().destroy();
    }

    const tableColumnInfo = [
        { displayType: 'text', displayingPropertyOrFn: 'name', colHeadName: 'Name' },
        { displayType: 'function', displayingPropertyOrFn: showDistNProvince, colHeadName: 'District' },
        { displayType: 'function', displayingPropertyOrFn: showLocalFees, colHeadName: 'Local Fees <br class="my-0 py-0"> (LKR)' },
        { displayType: 'function', displayingPropertyOrFn: showForeignFees, colHeadName: 'Foreign Fees <br class="my-0 py-0"> (LKR)' },
        { displayType: 'function', displayingPropertyOrFn: showAttrStatus, colHeadName: 'Status' }
    ];

    createTable(tableAttractionHolderDiv, sharedTableId, filteredAttractions, tableColumnInfo);

    setTimeout(() => {
        $(`#${sharedTableId}`).DataTable({
            searching: true,
            info: false,
            pageLength: 10,
            ordering: false,
            lengthChange: false
        });
    }, 100);
};

//reset all filters 
const resetAttrFilters =()=>{
    document.getElementById('attrDistrictFilter').value = '';
    document.getElementById('attrStatusFilter').value = '';
    applyAttrFilters();
}

//fn for show district + province in table
const showDistNProvince = (ob) => {
    return ob.district_id.name + " <br/> " + ob.district_id.province_id.name + " Province";
}

//to support build table
const showAttrStatus = (ob) => {

    if (ob.deleted_attr == null || ob.deleted_attr == false) {

        if (ob.attr_status == "open") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Open for Tours
                </p>`;
        } else if (ob.attr_status == "permanantly_closed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Permanently Closed
                </p>`;
        } else if (ob.attr_status == "temporary_closed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Temporary Closed
                </p>`;
        }

    } else if (ob.deleted_attr != null && ob.deleted_attr == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
}

//fn for show LOCAL fees in table
const showLocalFees = (ob) => {

    if (ob.feelocaladult == null && ob.feechildlocal == null) {
        return 'No Entrance Fee';
    } else {

        if (ob.feelocaladult != 0.00 && ob.feechildlocal != 0.00) {

            return "Adult : " + parseFloat(ob.feelocaladult).toFixed(2) + "<br/> Child  : " + parseFloat(ob.feechildlocal).toFixed(2);

        } else if (ob.feechildlocal == 0.00 && ob.feelocaladult != 0.00) {

            return "Adult : " + parseFloat(ob.feelocaladult).toFixed(2) + "<br/> Child : Free";
            //💥TO FIXED KARAPU GAMAN MEKA STRING EKAK WENAWA. CALC KARANNA BA ITAPASSE,  CALC KARANNA OONNAM  AYE  PARSE KARANNA💥

        } else {
            return 'No Entrance Fee';
        }
    }
}

//fn for show FOREIGN FEES in table
const showForeignFees = (ob) => {

    if (ob.feeforeignadult == null && ob.feechildforeign == null) {

        return 'No Entrance Fee';

    } else {

        if (ob.feeforeignadult != 0.00 && ob.feechildforeign != 0.00) {

            return "Adult : " + parseFloat(ob.feeforeignadult).toFixed(2) + "<br/> Child : " + parseFloat(ob.feechildforeign).toFixed(2);
        } else {
            return 'No Entrance Fee';
        }
    }
}

//get category list in table
//not used 💥
const showCategories = (ob) => {

    let categories = '';
    for (const index in ob.categories) {
        if (index == ob.categories.length - 1) {
            categories = categories + ob.categories[index].name;
        } else {
            categories = categories + ob.categories[index].name + ",";
        }
    }
    return categories;
}

//fn for refresh form
const refreshAttractionForm = async () => {

    attraction = new Object;

    attraction.categories = new Array();
    attraction.attr_activities = new Array();

    document.getElementById('formAttraction').reset();

    try {
        //get province list
        provinces = await ajaxGetReq("province/all");
        fillDataIntoDynamicSelects(selectAttrProvince, 'Please Select The Province', provinces, 'name');

        //get categories list
        categoryList = await ajaxGetReq("/attrcategory/all");
        flushCollapseOne.innerHTML = "";
        categoryList.forEach(element => {

            let idAttribute = element.name.replace(/\s+/g, '-');

            let newInput = document.createElement('input');
            newInput.type = "checkbox";
            newInput.classList.add("btn-check");
            newInput.setAttribute('id', idAttribute);
            newInput.setAttribute('autocomplete', 'off');

            let newLabel = document.createElement('label');
            newLabel.className = "btn , btn-outline-primary me-2 my-1";
            newLabel.setAttribute('for', idAttribute);
            newLabel.innerText = element.name;
            newLabel.style.minWidth = "100px";
            newLabel.style.textAlign = "center";
            newLabel.style.borderRadius = "8px";
            newLabel.style.transition = "all 0.3s ease-in-out";

            newInput.onchange = function () {
                if (this.checked) {
                    attraction.categories.push(element)
                    console.log('checked ' + element.name);
                    newLabel.style.backgroundColor = "lime";
                    newLabel.style.color = "white";
                    newLabel.style.borderColor = "green";

                } else {

                    newLabel.style.backgroundColor = "";
                    newLabel.style.color = "";
                    newLabel.style.borderColor = "";
                    const attrCatIdOnly = attraction.categories.map(atrCat => atrCat.id);
                    const indexOfCurrentPoppingElement = attrCatIdOnly.indexOf(element.id);

                    if (indexOfCurrentPoppingElement != -1) {
                        attraction.categories.splice(indexOfCurrentPoppingElement, 1);
                    }
                    console.log('un checked ' + element.name);
                }
            }

            flushCollapseOne.appendChild(newInput);
            flushCollapseOne.appendChild(newLabel);

        });

    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    //districts will be generated based on selected province
    districts = [];
    fillDataIntoDynamicSelects(selectAttrDistrict, 'Please Select The Provice First', districts, 'name')
    selectAttrDistrict.disabled = true;

    inputLocalAdultFee.disabled = true;
    inputLocalChildFee.disabled = true;
    inputForeignAdultFee.disabled = true;
    inputForeignChildFee.disabled = true;

    //initially UPDATE button should be disabled (in ADD mode)
    attraUpdateBtn.disabled = true;
    attraUpdateBtn.style.cursor = "not-allowed";

    attraAddBtn.disabled = false;
    attraAddBtn.style.cursor = "pointer";

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputPlaceName',
        'selectAttrDistrict',
        'inputForeignAdultFee',
        'inputLocalAdultFee',
        'inputForeignChildFee',
        'inputLocalChildFee',
        'inputNote',
        'inputTourDuration',
        'vehiParkingFeeInput',
        'inputGeoCoords',
        'selectAttrStatus',
        'selectAttrProvince'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    inputLocalAdultFee.value = "0.00"
    inputLocalChildFee.value = "0.00"
    inputForeignAdultFee.value = "0.00"
    inputForeignChildFee.value = "0.00"

}

//set status auto
const setAttrStatusAuto = () => {
    document.getElementById('selectAttrStatus').value = 'open';
    document.getElementById('selectAttrStatus').style.border = '2px solid lime';
    document.getElementById('selectAttrStatus').children[4].setAttribute('class', 'd-none');
    attraction.attr_status = 'open';
}

//fn for if no entrance fee for all
const allEntryFree = () => {

    if (document.getElementById('allEntryFreeChkBox').checked) {

        //disable input fields
        inputForeignAdultFee.disabled = true;
        inputLocalAdultFee.disabled = true;
        inputForeignChildFee.disabled = true;
        inputLocalChildFee.disabled = true;

        //show default value as 0.00 LKR
        inputForeignAdultFee.value = "0.00";
        inputLocalAdultFee.value = "0.00";
        inputForeignChildFee.value = "0.00";
        inputLocalChildFee.value = "0.00";

        //save 0.00 in DB
        attraction.feeforeignadult = 0.00;
        attraction.feelocaladult = 0.00;
        attraction.feechildlocal = 0.00;
        attraction.feechildforeign = 0.00;

        //remove all the styles
        inputLocalAdultFee.style.border = "1px solid #ced4da"
        inputLocalChildFee.style.border = "1px solid #ced4da"
        inputForeignAdultFee.style.border = "1px solid #ced4da"
        inputForeignChildFee.style.border = "1px solid #ced4da"

    }
    else {

        inputForeignAdultFee.disabled = false;
        inputLocalAdultFee.disabled = false;
        inputForeignChildFee.disabled = false;
        inputLocalChildFee.disabled = false;

        inputForeignAdultFee.value = "";
        inputLocalAdultFee.value = "";
        inputForeignChildFee.value = "";
        inputLocalChildFee.value = "";

        attraction.feeforeignadult = null;
        attraction.feelocaladult = null;
        attraction.feechildlocal = null;
        attraction.feechildforeign = null;
    }
}

//fn for if only locals are free
const localsEntryFree = () => {

    if (document.getElementById('localsEntryFreeCheckBox').checked) {

        inputForeignAdultFee.disabled = false;
        inputForeignChildFee.disabled = false;

        //if this is in refill
        if (attraction.feeforeignadult != null || attraction.feechildforeign != null) {
            inputForeignAdultFee.value = attraction.feeforeignadult;
            inputForeignChildFee.value = attraction.feechildforeign;
        } else {
            inputForeignAdultFee.value = "";
            inputForeignChildFee.value = "";
        }

        //local set eka disable karanwa
        inputLocalAdultFee.disabled = true;
        inputLocalChildFee.disabled = true;

        inputLocalAdultFee.value = "0.00";
        inputLocalChildFee.value = "0.00";

        attraction.feechildlocal = 0.00;
        attraction.feelocaladult = 0.00;

        inputLocalAdultFee.style.border = "1px solid #ced4da"
        inputLocalChildFee.style.border = "1px solid #ced4da"
        inputForeignAdultFee.style.border = "1px solid #ced4da"
        inputForeignChildFee.style.border = "1px solid #ced4da"

    }
    else {

        inputLocalAdultFee.disabled = false;
        inputLocalChildFee.disabled = false;

        inputLocalAdultFee.value = "";
        inputLocalChildFee.value = "";

        attraction.feelocaladult = null;
        attraction.feechildlocal = null;

    }

}

//IF NO ONE IS FREE
const allPaid = () => {

    inputForeignAdultFee.disabled = false;
    inputLocalAdultFee.disabled = false;
    inputForeignChildFee.disabled = false;
    inputLocalChildFee.disabled = false;

    //if this is in refill
    if (attraction.feeforeignadult != null || attraction.feelocaladult != null) {
        inputForeignAdultFee.value = attraction.feeforeignadult;
        inputForeignChildFee.value = attraction.feelocaladult;
        inputForeignChildFee.value = attraction.feechildforeign;
        inputLocalChildFee.value = attraction.feechildlocal;
    } else {
        inputForeignAdultFee.value = "";
        inputForeignChildFee.value = "";
        inputForeignChildFee.value = "";
        inputLocalChildFee.value = "";
    }

    //💥KALIN BIND WUNA 0.00 TIKA METHANADITH AYN KARANNA ONE
    attraction.feeforeignadult = null;
    attraction.feelocaladult = null;
    attraction.feechildlocal = null;
    attraction.feechildforeign = null;

    inputLocalAdultFee.style.border = "1px solid #ced4da"
    inputLocalChildFee.style.border = "1px solid #ced4da"
    inputForeignAdultFee.style.border = "1px solid #ced4da"
    inputForeignChildFee.style.border = "1px solid #ced4da"

}

//check errors before submitting
const checkAttrFormErrors = () => {
    let errors = '';

    if (attraction.name == null) {
        errors = errors + " Please Enter The Name \n";
    }

    if (attraction.attr_status == null) {
        errors = errors + " Please Select The Status \n";
    }

    if (attraction.gcoords == null) {
        errors = errors + " Please Enter The Geo Coords \n";
    }

    if (attraction.district_id == null) {
        errors = errors + " Please Select The District \n";
    }

    if (attraction.duration == null) {
        errors = errors + " Please Enter A Duration \n";
    }

    if (!document.getElementById('freeParkingCBX').checked) {

        if (attraction.vehicleparkingfee == null) {
            errors = errors + " Please Enter The Parking Fee \n";
        }
    }

    if (attraction.categories.length == 0) {
        errors = errors + "Please Select One or More Categories \n";
    }

    //all entrance free checkbox eka unclicked nam all fees fields wala value ekak thiyennama one
    if (document.getElementById('allPaidCheckBox').checked) {

        if (attraction.feeforeignadult == null || attraction.feeforeignadult == "0.00") {
            errors = errors + " Please Enter The Foreign Adults' Entrance Fee \n";
        }

        if (attraction.feechildforeign == null || attraction.feechildforeign == "0.00") {
            errors = errors + " Please Enter The Foreign Childs' Entrance Fee \n";
        }

        if (attraction.feelocaladult == null || attraction.feelocaladult == "0.00") {
            errors = errors + " Please Enter The Local Adults' Entrance Fee \n";
        }

        if (attraction.feechildlocal == null || attraction.feechildlocal == "0.00") {
            errors = errors + " Please Enter The Local Childs' Entrance Fee \n";
        }

    } else if (document.getElementById('localsEntryFreeCheckBox').checked) {

        if (attraction.feeforeignadult == null || attraction.feeforeignadult == "0.00") {
            errors = errors + " Please Enter The Foreign Adults' Entrance Fee \n";
        }

        if (attraction.feechildforeign == null || attraction.feechildforeign == "0.00") {
            errors = errors + " Please Enter The Foreign Childs' Entrance Fee \n";
        }
    }

    if (!document.getElementById('allPaidCheckBox').checked && !document.getElementById('localsEntryFreeCheckBox').checked && !document.getElementById('allEntryFreeChkBox').checked) {
        errors = errors + " Please Enter All Entrance Fees \n";
    }

    return errors;
}

//fn for add a visiting place 
const addNewAttraction = async () => {

    //check errors
    const errors = checkAttrFormErrors();

    if (errors == '') {
        const userConfirm = confirm('Are You Sure To Add ? \n' + attraction.name)

        if (userConfirm) {

            try {
                const postServiceResponse = await ajaxPPDRequest("/attraction", "POST", attraction);

                if (postServiceResponse === "OK") {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formAttraction').reset();
                    refreshAttractionForm();
                    buildAttractionTable();
                    var myAttrTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myAttrTableTab.show();

                } else {
                    showAlertModal('err', 'Submit Failed ' + postServiceResponse);
                }

            } catch (error) {
                // Handle errors (such as network issues or server errors)
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }

        } else {
            //💥💥💥
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        showAlertModal('err', errors);
    }
}

//clear modal content without refreshing , to aid show new content in modal
const resetModal = () => {

    // Hide the deleted record message    
    document.getElementById('modalAttrIfDeleted').innerText = '';
    document.getElementById('modalAttrIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    document.getElementById('modalAttrEditBtn').disabled = false;
    document.getElementById('modalAttrDeleteBtn').disabled = false;
    document.getElementById('modalAttrEditBtn').classList.remove('d-none');
    document.getElementById('modalAttrDeleteBtn').classList.remove('d-none');

    // Hide the recover button
    document.getElementById('modalAttrRecoverBtn').classList.add('d-none');

}

//fn for edit button
const openModal = (attrObj) => {

    resetModal();

    document.getElementById('modalAttrName').innerText = attrObj.name || 'N/A';
    document.getElementById('modalAttrDistrict').innerText = attrObj.district_id.name || 'N/A';
    document.getElementById('modalAttrProvince').innerText = attrObj.district_id.province_id.name || 'N/A';
    document.getElementById('modalAttrLocalAdultFee').innerText = `LKR ${parseFloat(attrObj.feelocaladult).toFixed(2)}` || 'N/A';
    document.getElementById('modalAttrLocalChildFee').innerText = `LKR ${parseFloat(attrObj.feechildlocal).toFixed(2)}` || 'N/A';
    document.getElementById('modalAttrForeignAdultFee').innerText = `LKR ${parseFloat(attrObj.feeforeignadult).toFixed(2)}` || 'N/A';
    document.getElementById('modalAttrForeignChildFee').innerText = `LKR ${parseFloat(attrObj.feechildforeign).toFixed(2)}` || 'N/A';
    document.getElementById('modalAttrVehicleParkingFee').innerText = `LKR ${parseFloat(attrObj.vehicleparkingfee).toFixed(2)}` || 'N/A';
    document.getElementById('modalAttrDuration').innerText = `${attrObj.duration} Hours` || 'N/A';
    document.getElementById('modalAttrDescription').innerText = attrObj.description || 'N/A';
    document.getElementById('modalAttrStatus').innerText = attrObj.attr_status || 'N/A';
    document.getElementById('modalAttrNote').innerText = attrObj.note || 'N/A';
    document.getElementById('modalAttrGCoords').innerText = attrObj.gcoords || 'N/A';

    let attrCategories = '';
    if (attrObj.categories && attrObj.categories.length > 0) {
        attrObj.categories.forEach((element, index) => {
            if (index === attrObj.categories.length - 1) {
                attrCategories += element.name;
            } else {
                attrCategories += element.name + ', ';
            }
        });
    } else {
        attrCategories = 'N/A';
    }
    document.getElementById('modalAttrCategories').innerText = attrCategories;


    if (attrObj.deleted_attr) {
        document.getElementById('modalAttrIfDeleted').classList.remove('d-none');
        document.getElementById('modalAttrIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(attrObj.deleteddatetime).toLocaleString();
        document.getElementById('modalAttrEditBtn').disabled = true;
        document.getElementById('modalAttrDeleteBtn').disabled = true;
        document.getElementById('modalAttrEditBtn').classList.add('d-none');
        document.getElementById('modalAttrDeleteBtn').classList.add('d-none');
        document.getElementById('modalAttrRecoverBtn').classList.remove('d-none');
    }

    // Show the modal
    $('#infoModalAttraction').modal('show');

}

//fn for restore button
const restoreAttractionRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala
            attraction = window.currentObject;
            attraction.deleted_attr = false;

            let putServiceResponse = await ajaxPPDRequest("/attraction", "PUT", attraction);

            if (putServiceResponse === "OK") {
                showAlertModal('suc', "Successfully Restored");
                document.getElementById('formAttraction').reset();
                //refreshAttractionForm();
                //buildAttractionTable();
                $("#infoModalAttraction").modal("hide");
                window.location.reload();

            } else {
                showAlertModal('err', "Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'Recovery process has cancelled');
    }
}

//fn for edit btn ** FOR FORM REFILL **
const refillAttractionForm = async (obj) => {

    attraction = JSON.parse(JSON.stringify(obj));
    attractionOldObj = JSON.parse(JSON.stringify(obj));

    selectAttrDistrict.disabled = false;

    inputPlaceName.value = obj.name;
    selectAttrStatus.value = attraction.attr_status;
    inputGeoCoords.value = attraction.gcoords;

    try {

        //get province list
        provinces = await ajaxGetReq("/province/all");
        fillDataIntoDynamicSelects(selectAttrProvince, 'Please Select The Province', provinces, 'name', obj.district_id.province_id.name);
        //selectAttrProvince.style.border = "1px solid #ced4da";

        districts = await ajaxGetReq("/district/all");
        fillDataIntoDynamicSelects(selectAttrDistrict, 'Please Select The District', districts, 'name', obj.district_id.name);

        //override default styling gave by JS
        selectAttrProvince.style.border = "1px solid #ced4da";

        //get categories list
        categoryList = await ajaxGetReq("/attrcategory/all");
        flushCollapseOne.innerHTML = "";
        categoryList.forEach(element => {

            let idAttribute = element.name.replace(/\s+/g, '-');

            let newInput = document.createElement('input');
            newInput.type = "checkbox";
            newInput.classList.add("btn-check");
            newInput.setAttribute('id', idAttribute);
            newInput.setAttribute('autocomplete', 'off');

            let newLabel = document.createElement('label');
            newLabel.className = "btn , btn-outline-primary me-2 my-1";
            newLabel.setAttribute('for', idAttribute);
            newLabel.innerText = element.name;
            newLabel.style.minWidth = "100px";
            newLabel.style.textAlign = "center";

            newInput.onchange = function () {
                if (this.checked) {
                    attraction.categories.push(element)
                    console.log('checked ' + element.name);
                } else {

                    const attrCatIdOnly = attraction.categories.map(atrCat => atrCat.id);
                    const indexOfCurrentPoppingElement = attrCatIdOnly.indexOf(element.id);

                    if (indexOfCurrentPoppingElement != -1) {
                        attraction.categories.splice(indexOfCurrentPoppingElement, 1);
                    }
                    console.log('un checked ' + element.name);
                }
            }

            //needed in refill
            let existIndex = obj.categories.map(category => category.id).indexOf(element.id);
            if (existIndex != -1) {
                newInput.checked = true;
            }

            flushCollapseOne.appendChild(newInput)
            flushCollapseOne.appendChild(newLabel)

        });

    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }

    flushCollapseOne.classList.add("show");

    if (obj.feetype === "All Free") {
        allEntryFreeChkBox.checked = true;

        inputForeignAdultFee.disabled = true;
        inputLocalAdultFee.disabled = true;
        inputForeignChildFee.disabled = true;
        inputLocalChildFee.disabled = true;
    }

    if (obj.feetype === "Local Free") {
        localsEntryFreeCheckBox.checked = true;

        inputLocalAdultFee.disabled = true;
        inputLocalChildFee.disabled = true;

        inputForeignAdultFee.disabled = false;
        inputForeignChildFee.disabled = false;

    }

    if (obj.feetype === "All Paid") {
        allPaidCheckBox.checked = true;

        inputForeignAdultFee.disabled = false;
        inputLocalAdultFee.disabled = false;
        inputForeignChildFee.disabled = false;
        inputLocalChildFee.disabled = false;
    }

    inputForeignAdultFee.value = parseFloat(obj.feeforeignadult).toFixed(2);
    inputLocalAdultFee.value = parseFloat(obj.feelocaladult).toFixed(2);
    inputLocalChildFee.value = parseFloat(obj.feechildlocal).toFixed(2);
    inputForeignChildFee.value = parseFloat(obj.feechildforeign).toFixed(2);
    vehiParkingFeeInput.value = parseFloat(obj.vehicleparkingfee).toFixed(2);
    vehiParkingFeeInput.value = parseFloat(obj.vehicleparkingfee).toFixed(2);

    if (obj.vehicleparkingfee === 0.00) {
        freeParkingCBX.checked = true;
        vehiParkingFeeInput.disabled = true;
    }

    inputNote.value = obj.description;
    inputTourDuration.value = obj.duration;

    attraAddBtn.disabled = true;
    attraAddBtn.style.cursor = "not-allowed";

    attraUpdateBtn.disabled = false;
    attraUpdateBtn.style.cursor = "pointer";

    $("#infoModalAttraction").modal("hide");

    var myAttrFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myAttrFormTab.show();

    //get Activity list
    // attrActivities = ajaxGetRequest("/attractivity/alldata");
    // flushCollapseTwo.innerHTML = "";
    // attrActivities.forEach(activity => {

    //     let activityDiv = document.createElement('div');
    //     activityDiv.classList = "form-check form-check-inline";
    //     activityDiv.style.width = "30%"

    //     let activityInput = document.createElement('input');
    //     activityInput.classList.add("form-check-input");
    //     activityInput.type = "checkbox";
    //     activityInput.setAttribute('id', JSON.stringify(activity.name))

    //     let activityLabel = document.createElement('label');
    //     activityLabel.classList.add("form-check-label");
    //     activityLabel.innerText = activity.name;
    //     activityLabel.setAttribute('for', JSON.stringify(activity.name))

    //     //fn for radio clicks
    //     activityInput.onchange = function () {

    //         if (this.checked) {
    //             obj.attr_activities.push(activity);
    //         } else {
    //             let existIndex = obj.attr_activities.map(activity => activity.id).indexOf(activity.id);
    //             if (existIndex != -1) {
    //                 obj.attr_activities.splice(existIndex, 1)
    //             }
    //         }
    //     }

    //     let existIndex = obj.attr_activities.map(activity => activity.id).indexOf(activity.id);
    //     if (existIndex != -1) {
    //         activityInput.checked = true;
    //     }

    //     activityDiv.appendChild(activityInput);
    //     activityDiv.appendChild(activityLabel);

    //     flushCollapseTwo.appendChild(activityDiv);

    // })

    //disabling update button based on USER PRIVILEGES
    //if (loggedUserPrivileges.privupdate) {
    //    attraUpdateBtn.disabled = false;
    //} else {
    //    attraUpdateBtn.disabled = true;
    //}

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshAttractionForm();
        }
    });
});

//not complete
const showAttrValueChanges = () => {

    let updates = '';

    if (attraction.name != attractionOldObj.name) {
        updates = updates + "Name Has Changed To " + attraction.name + "\n";
    }

    if (attraction.gcoords != attractionOldObj.gcoords) {
        updates = updates + "Geo Coords Has Changed To " + attraction.gcoords + "\n";
    }

    if (attraction.district_id.name != attractionOldObj.district_id.name) {
        updates = updates + "District Has Changed To " + attraction.district_id.name + "\n";
    }


    if (attraction.attr_status != attractionOldObj.attr_status) {
        updates = updates + "Status Has Changed To " + attraction.attr_status + "\n";
    }

    if (attraction.duration != attractionOldObj.duration) {
        updates = updates + "Duration Has Changed To " + attraction.duration + "\n";
    }

    //for categories
    if (attraction.categories.length != attractionOldObj.categories.length) {
        updates = updates + "Category List Has Changed  \n";

    } else {
        for (let element of attraction.categories) {
            let existCategoryCount = attractionOldObj.categories.map(item => item.id).indexOf(element.id);

            if (existCategoryCount == -1) {
                updates = updates + "Category List Has Changed  \n";
                break;
            }
        }
    }

    //for activities
    // if (attraction.attr_activities.length != attractionOldObj.attr_activities.length) {
    //     updates = updates + "Activity List Has Changed  \n";

    // } else {
    //     for (let element of attraction.attr_activities) {
    //         let existCategoryCount = attractionOldObj.attr_activities.map(item => item.id).indexOf(element.id);

    //         if (existCategoryCount == -1) {
    //             updates = updates + "Activity List Has Changed  \n";
    //             break;
    //         }
    //     }
    // }

    if (attraction.feeforeignadult != attractionOldObj.feeforeignadult) {
        updates = updates + "Foreigner Adult Entrance Fee Has Changed To " + attraction.feeforeignadult + "\n";
    }

    if (attraction.feelocaladult != attractionOldObj.feelocaladult) {
        updates = updates + "Local Adult Entrance Fee Has Changed To " + attraction.feelocaladult + "\n";
    }

    if (attraction.feechildforeign != attractionOldObj.feechildforeign) {
        updates = updates + "Foreigner Child Entrance Fee Has Changed To " + attraction.feechildforeign + "\n";
    }

    if (attraction.feechildlocal != attractionOldObj.feechildlocal) {
        updates = updates + "Local Child Entrance Fee Has Changed To " + attraction.feechildlocal + "\n";
    }

    if (attraction.description != attractionOldObj.description) {
        updates = updates + attractionOldObj.description + " Has Changed To " + attraction.description + "\n";
    }

    if (attraction.vehicleparkingfee != attractionOldObj.vehicleparkingfee) {
        updates = updates + attractionOldObj.vehicleparkingfee + " Has Changed To " + attraction.vehicleparkingfee + "\n";
    }

    return updates;
}

//fn for update BTN
const updateAttraction = async () => {

    let errors = checkAttrFormErrors();
    if (errors == '') {
        let updates = showAttrValueChanges();
        if (updates == '') {
            showAlertModal('No changes detected to update');
        } else {

            let userResponse = confirm("Sure To Update ? \n \n " + updates);

            if (userResponse) {

                try {
                    let putServiceResponce = await ajaxPPDRequest("/attraction", "PUT", attraction);

                    if (putServiceResponce == "OK") {
                        showAlertModal('suc', "Successfully Updated");
                        document.getElementById('formAttraction').reset();
                        buildAttractionTable();
                        refreshAttractionForm();
                        var myAttrTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myAttrTableTab.show();
                    } else {
                        showAlertModal('err', "An Error Occured " + putServiceResponce);
                    }

                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }

            } else {
                showAlertModal('inf', "User cancelled the task");
            }
        }

    } else {
        showAlertModal('err', 'form has following errors \n ' + errors);
    }

}

//for delete btn
const deleteAttractionRecord = async (ob) => {

    const userConfirm = confirm('Are you sure to delete the record ' + ob.name + ' ?');

    if (userConfirm) {

        try {
            const deleteServerResponse = await ajaxPPDRequest("/attraction", "DELETE", ob);

            if (deleteServerResponse === "OK") {
                showAlertModal('suc', "Record Deleted");
                $('#infoModalAttraction').modal('hide');
                buildAttractionTable();
            } else {
                showAlertModal('err', "Delete Failed \n" + deleteServerResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'User Cancelled The Deletion Task');
    }
}

//get district list by province
const getDistByProvince = async () => {

    const currentProvinceID = JSON.parse(selectAttrProvince.value).id;
    selectAttrProvince.style.border = '2px solid lime';
    selectAttrDistrict.disabled = false;

    try {
        const districts = await ajaxGetReq("districts/byprovinceid/" + currentProvinceID);
        fillDataIntoDynamicSelects(selectAttrDistrict, " Please Select The District Now", districts, 'name');
        selectAttrDistrict.style.border = '2px solid #ced4da'
    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }


}

const freeParkingCheckBox = () => {
    const checkbox = document.getElementById("freeParkingCBX");

    if (checkbox.checked) {
        vehiParkingFeeInput.disabled = true;
        vehiParkingFeeInput.style.border = "1px solid #ced4da";
        //attraction.vehicleparkingfee = null;
        attraction.vehicleparkingfee = 0.00;
        vehiParkingFeeInput.value = "0.00";
    } else {
        vehiParkingFeeInput.disabled = false;
        attraction.vehicleparkingfee = vehiParkingFeeInput.value;
    }
}




