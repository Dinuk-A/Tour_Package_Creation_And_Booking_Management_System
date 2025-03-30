window.addEventListener('load', () => {

    buildLunchPlaceTable();
    refreshLunchPlaceForm();

});

//global var to store id of the table
let sharedTableId = "mainTableLunchPlace";


const buildLunchPlaceTable = async () => {

    try {
        const lunchPlaces = await ajaxGetReq("/lunchplace/all");

        const tableColumnInfo =
            [
                { displayType: 'text', displayingPropertyOrFn: 'name', colHeadName: 'Name' },
                { displayType: 'function', displayingPropertyOrFn: showLPLocationShort, colHeadName: 'Location' },
                { displayType: 'function', displayingPropertyOrFn: showLPContacts, colHeadName: 'Contacts' },
                { displayType: 'text', displayingPropertyOrFn: 'costperhead', colHeadName: 'Price (per Head)' },
            ];

        createTable(tableLunchPlaceHolderDiv, sharedTableId, lunchPlaces, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build Lunch Places table:", error);
    }

};

const showLPLocationShort = (obj) => {
    return obj.district_id.name + "<br> " + obj.district_id.province_id.name;
}


const showLPContacts = (obj) => {
    return obj.contactnum + "<br>" + obj.contactnumtwo || "N/A";
}


const refreshLunchPlaceForm = async () => {

    lunchplace = new Object();

    document.getElementById('formLunchPlace').reset();

    try {
        districts = await ajaxGetReq("district/all");
        fillDataIntoDynamicSelects(selectLHDistrict, 'Please Select The District', districts, 'name');

    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputLHPlaceName',
        'inputCostperHead',
        'selectLHDistrict',
        'inputContactNum',
        'inputContactNumTwo',
        'inputEmail',
        'inputLHNote',
        'inputLHAddress',
        'lHStatusSelect'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    lunchPlaceUpdateBtn.disabled = true;
    lunchPlaceUpdateBtn.style.cursor = "not-allowed";

    lunchPlaceAddBtn.disabled = false;
    lunchPlaceAddBtn.style.cursor = "pointer";

}

const checkLHFormErrors = () => {

    let lPlaceErrors = '';

    if (lunchplace.name == null) {
        lPlaceErrors = lPlaceErrors + " Please Enter Hotel Name \n";
    }

    if (lunchplace.costperhead == null) {
        lPlaceErrors = lPlaceErrors + " Please Enter The Cost \n";
    }

    if (lunchplace.district_id == null) {
        lPlaceErrors = lPlaceErrors + " Please Select The District \n";
    }

    if (lunchplace.address == null) {
        lPlaceErrors = lPlaceErrors + " Please Enter The Address \n";
    }

    if (lunchplace.contactnum == null) {
        lPlaceErrors = lPlaceErrors + " Please Enter The Contact Number \n";
    }

    if (lunchplace.lp_status == null) {
        lPlaceErrors = lPlaceErrors + " Please Select The Status \n";
    }


    return lPlaceErrors;
}

const addNewLunchPlace = async () => {

    //check errors
    const errors = checkLHFormErrors();

    if (errors == '') {
        const userConfirm = confirm('Are You Sure To Add ? \n' + lunchplace.name)

        if (userConfirm) {

            try {
                //call POST service
                let postServiceResponse = await ajaxPPDRequest("/lunchplace", "POST", lunchplace);

                if (postServiceResponse == "OK") {
                    showAlertModal('suc','Saved Successfully');
                    document.getElementById('formLunchPlace').reset();
                    refreshLunchPlaceForm();
                    buildLunchPlaceTable();
                    var myLPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myLPTableTab.show();

                } else {
                    showAlertModal('err','Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                // Handle errors (such as network issues or server errors)
                showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
            }


        } else {
            showAlertModal('inf','Operation Cancelled By User')
        }
    } else {
        showAlertModal('err', errors);
    }

}

const openModal = (obj) => {
    document.getElementById('modalLPName').innerText = obj.name || 'N/A';
    document.getElementById('modalLPDistrict').innerText = obj.district_id.name || 'N/A';
    document.getElementById('modalLPProvince').innerText = obj.district_id.province_id.name || 'N/A';
    document.getElementById('modalLPAddress').innerText = obj.address || 'N/A';
    document.getElementById('modalLPCostPerHead').innerText = obj.costperhead || 'N/A';
    document.getElementById('modalLPContactNum').innerText = obj.contactnum || 'N/A';
    document.getElementById('modalLPContactNumTwo').innerText = obj.contactnumtwo || 'N/A';
    document.getElementById('modalLPEmail').innerText = obj.email || 'N/A';
    document.getElementById('modalLPStatus').innerText = obj.lp_status || 'N/A';
    document.getElementById('modalLPNote').innerText = obj.note || 'N/A';

    if (obj.deleted_lp) {
        document.getElementById('modalLPIfDeleted').classList.remove('d-none');
        document.getElementById('modalLPIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(obj.deleteddatetime).toLocaleString();
        document.getElementById('modalLPEditBtn').disabled = true;
        document.getElementById('modalLPDeleteBtn').disabled = true;
        document.getElementById('modalLPEditBtn').classList.add('d-none');
        document.getElementById('modalLPDeleteBtn').classList.add('d-none');
        document.getElementById('modalLPRecoverBtn').classList.remove('d-none');
    }

    // Show the modal
    $('#infoModalLunchPlace').modal('show');

}

const refillLunchPlaceForm = async (ob) => {

    lunchplace = JSON.parse(JSON.stringify(ob));
    lunchplaceOldObj = JSON.parse(JSON.stringify(ob));

    $('#modalLunchplace').modal('show');

    inputLHPlaceName.value = lunchplace.name;
    inputCostperHead.value = lunchplace.costperhead;

    try {
        districts = await ajaxGetReq("district/all");
        fillDataIntoDynamicSelects(selectLHDistrict, 'Please Select The District', districts, 'name', lunchplace.district_id.name);

    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }

    inputContactNum.value = lunchplace.contactnum;
    inputLHNote.value = lunchplace.note;
    inputLHAddress.value = lunchplace.address;
    inputLPEmail.value = lunchplace.email;

    lunchPlaceAddBtn.disabled = true;
    lunchPlaceAddBtn.style.cursor = "not-allowed";

    lunchPlaceUpdateBtn.disabled = false;
    lunchPlaceUpdateBtn.style.cursor = "pointer";

    $("#infoModalLunchPlace").modal("hide");

    var myLPFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myLPFormTab.show();
}

const showLPValueChanges = () => {
    let updates = "";

    if (lunchplace.name != lunchplaceOldObj.name) {
        updates = updates + " Hotel Name has changed \n";
    }

    if (lunchplace.costperhead != lunchplaceOldObj.costperhead) {
        updates = updates + " Meal cost has changed \n";
    }

    if (lunchplace.note != lunchplaceOldObj.note) {
        updates = updates + " Note has changed \n";
    }

    if (lunchplace.address != lunchplaceOldObj.address) {
        updates = updates + " Hotel address has changed \n";
    }

    if (lunchplace.contactnum != lunchplaceOldObj.contactnum) {
        updates = updates + " Hotel contact number has changed \n";
    }

    if (lunchplace.contactnumtwo != lunchplaceOldObj.contactnumtwo) {
        updates = updates + " Hotel contact number #2 has changed \n";
    }

    if (lunchplace.email != lunchplaceOldObj.email) {
        updates = updates + " Hotel contact number #2 has changed \n";
    }

    if (lunchplace.district_id.name != lunchplaceOldObj.district_id.name) {
        updates = updates + " Hotel district has changed \n";
    }
    return updates
}

const updateLunchPlace = async () => {
    let errors = checkLHFormErrors();
    if (errors == "") {
        let updates = showLPValueChanges();
        if (updates == "") {
            showAlertModal('err',"No changes detected");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponce = await ajaxPPDRequest("/lunchplace", "PUT", lunchplace);

                    if (putServiceResponce == "OK") {
                        showAlertModal('suc',"Successfully Updted");
                        document.getElementById('formLunchPlace').reset();
                        refreshLunchPlaceForm();
                        buildLunchPlaceTable();
                        var myLPTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myLPTableTab.show();
                    } else {
                        showAlertModal('err',"An Error Occured " + putServiceResponce);
                    }
                } catch (error) {
                    showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
                }

            } else {
                showAlertModal('inf',"Operation cancelled by the Operator");
            }
        }
    } else {
        showAlertModal('err', errors);
    }
}

const deleteLunchPlaceRecord = async (ob) => {

    const userConfirm = confirm("Are you sure to delete this record ? ");

    if (userConfirm) {
        try {
            let deleteServerResponse = await ajaxPPDRequest("/lunchplace", "DELETE", ob);
            if (deleteServerResponse == "OK") {
                showAlertModal('suc','Deleted succesfully')
                $('#infoModalEmployee').modal('hide');
                window.location.reload();
            } else {
                showAlertModal('err',"Delete Failed \n" + deleteServerResponse);
            }
        } catch (error) {
            showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
        }

    } else {
        showAlertModal('inf',"User cancelled the task")
    }
}

const restoreLunchPlaceRecord = async () => {
    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥
            lunchplace = window.currentObject;
            lunchplace.deleted_lp = false;

            let putServiceResponse = await ajaxPPDRequest("/lunchplace", "PUT", lunchplace);

            if (putServiceResponse === "OK") {
                showAlertModal('suc',"Successfully Restored");
                $("#infoModalLunchplace").modal("hide");

                //AN LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
                window.location.reload();

            } else {
                showAlertModal('err',"Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err','An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf','User cancelled the recovery task');
    }

}

// const getDistByProvince = () => {

//     const currentProvinceID = JSON.parse(stayProvinceSelect.value).id;
//     stayProvinceSelect.style.border = '2px solid green';
//     stayDistrictSelect.disabled = false;
//     const districts = ajaxGetRequest("district/getdistrictbyprovince/" + currentProvinceID);
//     fillDataIntoSelect(stayDistrictSelect, " Please Select The District Now", districts, 'name');

// }

// const disableButtonsCommonFn = (rowOb) => {

//     if (!loggedUserPrivileges.privupdate) {
//         btnEdit.disabled = true;
//         btnEdit.style.cursor = "not-allowed"
//     }

//     if (!loggedUserPrivileges.privdelete) {
//         btnDelete.disabled = true;
//         btnDelete.style.cursor = "not-allowed"
//     } else {
//         if (rowOb.lunchplacestatus_id.name == "Deleted") {
//             btnDelete.disabled = true;
//             btnDelete.style.cursor = "not-allowed";
//         }
//     }
//     if (!loggedUserPrivileges.privselect) {
//         btnPrint.disabled = true;
//         btnPrint.style.cursor = "not-allowed"
//     }
// }