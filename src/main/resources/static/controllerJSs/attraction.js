window.addEventListener('load', () => {

    // loggedUserPrivileges = ajaxGetRequest("/privilege/bymodule/ATTRACTION");

    //call fn for refresh/show data in table
    buildAttractionTable();

    //for attraction form
    refreshAttractionForm();
})

//global var to store id of the table
let sharedTableId = "mainTableAttraction";

//fn for show data in table
const buildAttractionTable = async () => {

    try {
        const attractions = await ajaxGetReq("/attraction/all");

        const tableColumnInfo = [

            { displayType: 'text', displayingPropertyOrFn: 'name', colHeadName: 'Name' },
            { displayType: 'function', displayingPropertyOrFn: getDistNProvince, colHeadName: 'District' },
            // { displayType: 'function', displayingPropertyOrFn: getCategories , colHeadName: 'Categories'},
            // { displayType: 'function', displayingPropertyOrFn: getActivities , colHeadName: 'Activities'},
            //{ displayType: 'function', displayingPropertyOrFn: getDuration, colHeadName: 'Duration' },
            { displayType: 'function', displayingPropertyOrFn: showLocalFees, colHeadName: 'Local Fees <br class="my-0 py-0"0> (LKR)' },
            { displayType: 'function', displayingPropertyOrFn: showForeignFees, colHeadName: 'Foreign Fees <br class="my-0 py-0"> (LKR)' },
            { displayType: 'text', displayingPropertyOrFn: 'attr_status', colHeadName: 'Status' }

        ]

        createTable(tableAttractionHolderDiv, sharedTableId, attractions, tableColumnInfo);

        //call the new datatable format(from net)
        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build attraction table:", error);
    }

}

//fn for show district + province in table
const getDistNProvince = (ob) => {
    return ob.district_id.name + " <br/> " + ob.district_id.province_id.name + " Province";
}

//get category list in table
const getCategories = (ob) => {

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

//get Available activity list in table
// const getActivities = (ob) => {

//     let attr_activities = '';

//     if (attr_activities == null) {
//         return "NO ACTIVITIES";                             //MEKA AYE HADANNA ONE ACTIVITY 0 UNAMA TABEL EKE MSG EKAK PENNANNA
//     } else {
//         for (const index in ob.attr_activities) {
//             if (index == ob.attr_activities.length - 1) {
//                 attr_activities = attr_activities + ob.attr_activities[index].name;
//             } else {
//                 attr_activities = attr_activities + ob.attr_activities[index].name + ",";
//             }
//         }
//         return attr_activities;
//     }


//     //original
//     // let attr_activities = '';
//     // for (const index in ob.attr_activities) {
//     //     if (index == ob.attr_activities.length - 1) {
//     //         attr_activities = attr_activities + ob.attr_activities[index].name;
//     //     } else {
//     //         attr_activities = attr_activities + ob.attr_activities[index].name + ',';
//     //     }
//     // }
//     // return attr_activities;
// }

//fn for get Duration + " Hours" in table
const getDuration = (ob) => {
    return ob.duration + " Hours";
}

//fn for show LOCAL fees in table
const showLocalFees = (ob) => {

    if (ob.feelocaladult != 0.00 && ob.feechildlocal != 0.00) {

        return "Adult : " + parseFloat(ob.feelocaladult).toFixed(2) + "<br/> Child  : " + parseFloat(ob.feechildlocal).toFixed(2);

    } else if (ob.feechildlocal == 0.00 && ob.feelocaladult != 0) {

        return "Adult : " + parseFloat(ob.feelocaladult).toFixed(2) + "<br/> Child : Free";
        //💥TO FIXED KARAPU GAMAN MEKA STRING EKAK WENAWA. CALC KARANNA BA ITAPASSE,  CALC KARANNA OONNAM  AYE  PARSE KARANNA💥

    } else {
        return 'No Entrance Fee';
    }

}

//fn for show FOREIGN FEES in table
const showForeignFees = (ob) => {

    if (ob.feeforeignadult != 0.00 && ob.feechildforeign != 0.00) {

        return "Adult : " + parseFloat(ob.feeforeignadult).toFixed(2) + "<br/> Child : " + parseFloat(ob.feechildforeign).toFixed(2);
    } else {
        return 'No Entrance Fee';
    }
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

            let newDiv = document.createElement('div');
            newDiv.className = "form-check form-check-inline";
            newDiv.style.width = "30%";

            let newInput = document.createElement('input');
            newInput.classList.add("form-check-input");
            newInput.type = "checkbox";
            newInput.setAttribute('id', JSON.stringify(element.name)) //new

            let newLabel = document.createElement('label');
            newLabel.classList.add("form-check-label");
            newLabel.innerText = element.name;
            newLabel.setAttribute('for', JSON.stringify(element.name))  //new

            newInput.onchange = function () {
                if (this.checked) {
                    attraction.categories.push(element)

                } else {
                    let existIndex = attraction.categories.map(category => category.id).indexOf(element.id);
                    if (existIndex != -1) {
                        attraction.categories.splice(existIndex, 1)

                    }
                }
            }

            newDiv.appendChild(newInput);
            newDiv.appendChild(newLabel);

            flushCollapseOne.appendChild(newDiv)

        });

    } catch (error) {
        console.error("Failed to fetch Designations : ", error);
    }

    //districts will be generated based on selected province
    districts = [];
    fillDataIntoDynamicSelects(selectAttrDistrict, 'Please Select The Provice First', districts, 'name')
    selectAttrDistrict.disabled = true;

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
    //             attraction.attr_activities.push(activity);
    //         } else {
    //             let existIndex = attraction.attr_activities.map(activity => activity.id).indexOf(activity.id);
    //             if (existIndex != -1) {
    //                 attraction.attr_activities.splice(existIndex, 1)
    //             }
    //         }
    //     }

    //     activityDiv.appendChild(activityInput);
    //     activityDiv.appendChild(activityLabel);

    //     flushCollapseTwo.appendChild(activityDiv);

    // })

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
    ];

    // 'selectAttrStatus',

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

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

    } else {  //check karala aye uncheck kaloth 

        inputForeignAdultFee.disabled = false;
        inputLocalAdultFee.disabled = false;
        inputForeignChildFee.disabled = false;
        inputLocalChildFee.disabled = false;

        inputForeignAdultFee.value = "";
        inputLocalAdultFee.value = "";
        inputForeignChildFee.value = "";
        inputLocalChildFee.value = "";

        //💥TYPE KARANA VALUE EKA BIND WENNA ONE, NATHTHN DIGATAMA 0 BIND WENAWA
        attraction.feeforeignadult = null;
        attraction.feelocaladult = null;
        attraction.feechildlocal = null;
        attraction.feechildforeign = null;
    }
}

//fn for if only locals are free
const localsEntryFree = () => {

    if (document.getElementById('localsEntryFreeCheckBox').checked) {

        //mulin 1st chk box eka  click krla apahu 2nd eka click krnwa nam foreign set eka apahu enable karanawa + ewaye values ayn karanawa
        inputForeignAdultFee.disabled = false;
        inputForeignChildFee.disabled = false;

        inputForeignAdultFee.value = "";
        inputForeignChildFee.value = "";

        //local set eka disable karanwa
        inputLocalAdultFee.disabled = true;
        inputLocalChildFee.disabled = true;

        inputLocalAdultFee.value = "0.00";
        inputLocalChildFee.value = "0.00";

        attraction.feelocaladult = 0.00;
        attraction.feechildlocal = 0.00;

    } else {

        inputLocalAdultFee.disabled = false;
        inputLocalChildFee.disabled = false;

        inputLocalAdultFee.value = "";
        inputLocalChildFee.value = "";

        //💥TYPE KARANA VALUE EKA BIND WENNA ONE, NATHTHN DIGATAMA 0 BIND WENAWA
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

    inputForeignAdultFee.value = "";
    inputLocalAdultFee.value = "";
    inputForeignChildFee.value = "";
    inputLocalChildFee.value = "";

    //💥KALIN BINND WUNA 0.00 TIKA METHANADITH AYN KARANNA ONE
    attraction.feeforeignadult = null;
    attraction.feelocaladult = null;
    attraction.feechildlocal = null;
    attraction.feechildforeign = null;

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

    // if (attraction.attr_activities.length == 0) {
    //     errors = errors + "Please Select One or More Activities \n";
    // }

    //all entrance free checkbox eka unclicked nam all fees fields wala value ekak thiyennama one
    if (document.getElementById('allPaidCheckBox').checked) {

        if (attraction.feeforeignadult == null) {
            errors = errors + " Please Enter The Foreign Adults' Entrance Fee \n";
        }

        if (attraction.feechildforeign == null) {
            errors = errors + " Please Enter The Foreign Childs' Entrance Fee \n";
        }

        if (attraction.feelocaladult == null) {
            errors = errors + " Please Enter The Local Adults' Entrance Fee \n";
        }

        if (attraction.feechildlocal == null) {
            errors = errors + " Please Enter The Local Childs' Entrance Fee \n";
        }

    } else if (!document.getElementById('localsEntryFreeCheckBox').checked) {

        if (attraction.feelocaladult == null) {
            errors = errors + " Please Enter The Local Adult Entrance Fee \n";
        }

        if (attraction.feechildlocal == null) {
            errors = errors + " Please Enter The Local Child Entrance Fee \n";
        }

    } else if (document.getElementById('localsEntryFreeCheckBox').checked) {

        if (attraction.feeforeignadult == null) {
            errors = errors + " Please Enter The Foreign Adults' Entrance Fee \n";
        }

        if (attraction.feechildforeign == null) {
            errors = errors + " Please Enter The Foreign Childs' Entrance Fee \n";
        }
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
                    alert('Saved Successfully');
                    document.getElementById('formAttraction').reset();
                    refreshAttractionForm();
                    buildAttractionTable();
                    var myAttrTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myAttrTableTab.show();

                } else {
                    alert('Submit Failed ' + postServiceResponse);
                }

            } catch (error) {
                // Handle errors (such as network issues or server errors)
                alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
            }

        } else {
            alert('User cancelled the task');
        }
    } else {
        alert('Form Has Followimg Errors \n \n' + errors);
    }
}

//fn for edit button
const openModal = (attrObj) => {
    document.getElementById('modalAttrName').innerText = attrObj.name || 'N/A';
    document.getElementById('modalAttrDistrict').innerText = attrObj.district_id.name || 'N/A';
    document.getElementById('modalAttrProvince').innerText = attrObj.district_id.province_id.name || 'N/A';
    document.getElementById('modalAttrCatrgories').innerText = attrObj.dob || 'N/A';
    document.getElementById('modalAttrLocalAdultFee').innerText = attrObj.feelocaladult || 'N/A';
    document.getElementById('modalAttrLocalChildFee').innerText = attrObj.feechildlocal || 'N/A';
    document.getElementById('modalAttrForeignAdultFee').innerText = attrObj.feeforeignadult || 'N/A';
    document.getElementById('modalAttrForeignChildFee').innerText = attrObj.feechildforeign || 'N/A';
    document.getElementById('modalAttrDuration').innerText = attrObj.duration || 'N/A';
    document.getElementById('modalAttrDescription').innerText = attrObj.description || 'N/A';
    document.getElementById('modalAttrVehicleParkingFee').innerText = attrObj.vehicleparkingfee || 'N/A';
    document.getElementById('modalAttrStatus').innerText = attrObj.attr_status || 'N/A';
    document.getElementById('modalAttrNote').innerText = attrObj.note || 'N/A';
    //document.getElementById('modalAttrPersonalEmail').innerText = attrObj.email || 'N/A';
    //document.getElementById('modalAttrPersonalEmail').innerText = attrObj.email || 'N/A';

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
const restoreAttractionRecord = async() => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
             //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala
            attraction = window.currentObject;
            attraction.deleted_attr = false;

            let putServiceResponse = await ajaxPPDRequest("/attraction", "PUT", attraction);

            if (putServiceResponse === "OK") {
                alert("Successfully Restored");
                document.getElementById('formAttraction').reset();
                //refreshAttractionForm();
                //buildAttractionTable();
                $("#infoModalAttraction").modal("hide");
                window.location.reload();
                
            } else {
                alert("Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else{
        alert('Recovery process has cancelled');
    }
}

//fn for edit btn ** FOR FORM REFILL **
const refillAttractionForm = async (obj) => {

    attraction = JSON.parse(JSON.stringify(obj));
    attractionOldObj = JSON.parse(JSON.stringify(obj));

    selectAttrDistrict.disabled = false;

    inputPlaceName.value = obj.name;
    // selectAttrStatus.value = attraction.attrstatus_id;

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

            let newDiv = document.createElement('div');
            newDiv.className = "form-check form-check-inline";
            newDiv.style.width = "30%";

            let newInput = document.createElement('input');
            newInput.classList.add("form-check-input");
            newInput.type = "checkbox";
            newInput.setAttribute('id', JSON.stringify(element.name))

            let newLabel = document.createElement('label');
            newLabel.classList.add("form-check-label");
            newLabel.innerText = element.name;
            newLabel.setAttribute('for', JSON.stringify(element.name))

            newInput.onchange = function () {
                if (this.checked) {
                    obj.categories.push(element)
                } else {
                    let existIndex = obj.categories.map(category => category.id).indexOf(element.id);
                    if (existIndex != -1) {
                        obj.categories.splice(existIndex, 1)
                    }
                }
            }

            let existIndex = obj.categories.map(category => category.id).indexOf(element.id);
            if (existIndex != -1) {
                newInput.checked = true;
            }

            newDiv.appendChild(newInput);
            newDiv.appendChild(newLabel);

            flushCollapseOne.appendChild(newDiv)

        })

    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }

    //open 2 collapses auto
    flushCollapseOne.classList.add("show")
    // flushCollapseTwo.classList.add("show")



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
    }

    if (obj.feetype === "All Paid") {
        allPaidCheckBox.checked = true;
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

    if (attraction.district_id.name != attractionOldObj.district_id.name) {
        updates = updates + "District Has Changed To " + attraction.district_id.name + "\n";
    }
//
//    if (attraction.attrstatus_id.name != attractionOldObj.attrstatus_id.name) {
//        updates = updates + "Status Has Changed To " + attraction.attrstatus_id.name + "\n";
//    }

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
            alert('No changes detected to update');
        } else {

            let userResponse = confirm("Sure To Update ? \n \n " + updates);

            if (userResponse) {

                try {
                    let putServiceResponce = await ajaxPPDRequest("/attraction", "PUT", attraction);

                    if (putServiceResponce == "OK") {
                        alert("Successfully Updted");
                        document.getElementById('formAttraction').reset();
                        buildAttractionTable();
                        refreshAttractionForm();
                        var myAttrTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myAttrTableTab.show();
                    } else {
                        alert("An Error Occured " + putServiceResponce);
                    }

                } catch (error) {
                    alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
                }

            } else {
                alert("User cancelled the task");
            }
        }

    } else {
        alert('form has following errors \n ' + errors);
    }

}

//for delete btn
const deleteAttractionRecord = async (ob) => {

    const userConfirm = confirm('Are you sure to delete the record ' + ob.name + ' ?');

    if (userConfirm) {

        try {
            const deleteServerResponse = await ajaxPPDRequest("/attraction", "DELETE", ob);

            if (deleteServerResponse === "OK") {
                alert("Record Deleted");
                $('#infoModalAttraction').modal('hide');
                buildAttractionTable();
            } else {
                alert("Delete Failed \n" + deleteServerResponse);
            }

        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert('User Cancelled The Deletion Task');
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
    } catch (error) {
        console.error("Failed to fetch Data : ", error);
    }


}

const freeParkingCheckBox = () => {
    const checkbox = document.getElementById("freeParkingCBX");

    if (checkbox.checked) {
        vehiParkingFeeInput.disabled = true;
        vehiParkingFeeInput.style.border = "1px solid #ced4da";
        attraction.vehicleparkingfee = null;
        vehiParkingFeeInput.value = "0.00";
    } else {
        vehiParkingFeeInput.disabled = false;
        attraction.vehicleparkingfee = vehiParkingFeeInput.value;
    }
}




