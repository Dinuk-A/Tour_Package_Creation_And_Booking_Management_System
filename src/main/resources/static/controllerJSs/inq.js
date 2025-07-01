window.addEventListener('load', () => {

    refreshInquiryForm();
    refreshInqFollowupSection();
    handleTableCreation();
    handleDateFields();


});

//handle min max of date fields
const handleDateFields = () => {

    const todayRecievedDate = new Date().toISOString().split('T')[0];
    const recievedDateInput = document.getElementById('inqRecievedDate');
    recievedDateInput.setAttribute('max', todayRecievedDate);
    recievedDateInput.value = todayRecievedDate;

    const approxStartDateInput = document.getElementById('inqApproxStartDate');
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 5));
    const formattedDate = minDate.toISOString().split('T')[0];
    approxStartDateInput.setAttribute('min', formattedDate);

}

//handle tables type
const handleTableCreation = () => {
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);

    const roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    if (roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager")) {
        buildAllInqTable();
    } else if (roles.includes("Executive")) {
        console.log("else running");
        buildPersonalInqTable();
    }
}

//global var to store id of the table
let sharedTableIdMainTbl = "mainTableInquiry";
let sharedTableIdPersonalTbl = "personalTableInquiry";

//this table will show all the inquiries,all statuses, all assigned users
const buildAllInqTable = async () => {

    try {
        const allInqs = await ajaxGetReq("/inq/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' }
        ]

        createTable(tableHolderDiv, sharedTableIdMainTbl, allInqs, tableColumnInfo);

        $(`#${sharedTableIdMainTbl}`).dataTable();

    } catch (error) {
        console.error("Failed to build main inq table:", error);
    }
}

//this table will show all the assigned inquiries of the user
const buildPersonalInqTable = async () => {

    const userEmpId = document.getElementById('loggedUserEmpIdSectionId').textContent;
    console.log(userEmpId);

    try {
        const assignedInqs = await ajaxGetReq("/inq/personal?userempid=" + userEmpId);

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' }
        ]

        createTable(tableHolderDiv, sharedTableIdPersonalTbl, assignedInqs, tableColumnInfo);

        $(`#${sharedTableIdPersonalTbl}`).dataTable();

    } catch (error) {
        console.error("Failed to build personal inq table:", error);
    }
}

//show time stamp on table
const showRecievedTimeStamp = (ob) => {
    return ob.recieveddate + "</br>" + (ob.recievedtime ? ob.recievedtime : "12:00")
}

//refresh the inquiry form and reset all fields
const refreshInquiryForm = async () => {

    inquiry = new Object();

    try {
        const intrstdPkgList = await ajaxGetReq('/tourpackageforweb/all');
        fillMultDataIntoDynamicSelects(inqInterestedPkg, 'Please Select Package', intrstdPkgList, 'pkgcode', 'pkgtitle');
    } catch (error) {
        console.error('Error fetching interested packages:', error);
    }

    try {
        nationalityList = await ajaxGetReq('/nationalityforweb/all');
        fillDataIntoDynamicSelects(InqClientNationality, 'Select Nationality', nationalityList, 'countryname');
        fillDataIntoDynamicDataList(dataListNationality, nationalityList, 'countryname');
    } catch (error) {
        console.error("Error fetching nationality list:", error);

    }

    const updateBtn = document.getElementById('manualInqUpdateBtn');
    updateBtn.disabled = true;
    updateBtn.style.cursor = "not-allowed";

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inqRecievedMethod',
        'inqRecievedDate',
        'inqRecievedTime',
        'inqCodeRecievedContact',
        'inqInterestedPkg',
        'inqClientTitle',
        'inqClientName',
        'InqClientNationality',
        'inqContactOne',
        'inqAdditionalContact',
        'inqClientEmail',
        'inqMainEnquiry',
        'prefContMethodPkgRelForm',
        'inqApproxStartDate',
        'inqLocalAdultCount',
        'inqLocalChildCount',
        'inqForeignAdultCount',
        'inqForeignChildCount',
        'inqAccommodationNote',
        'inqPlacesPreferences',
        'inqTransportNote',
        'estdPickupLocation',
        'estdDropOffLocation',
        'inputNoteInquiry',
        'inqStatus',
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

}



//for natonality field
const changeLableNicPpt = () => {
    const labelOfField = document.getElementById('lblForNICorPpt');
    if (InqClientNationality.value === "Sri Lanka") {
        labelOfField.innerText = "NIC: "
    } else {
        labelOfField.innerText = "Passport Number: "
    }
}

//for 2nd contact num field
const sameContactError = () => {
    if (inqAdditionalContact.value === inqContactOne.value) {
        alert("Enter A Different Number than The Previous Contact Number")
        inqAdditionalContact.style.border = '2px solid red';
        inquiry.contactnumtwo = null
    } else {
        inputFieldValidator(this, '', 'inquiry', 'contactnumtwo');
        inqAdditionalContact.style.border = '2px solid lime';
    }
}

//check errors
const checkManualInqErrors = () => {
    let errors = "";

    if (inquiry.inqsrc == null) {
        errors = errors + " Please Select The Source Of Inquiry \n";
    }

    // if (inquiry.recievedmethod == "Phone Call" && inquiry.recievedcontactoremail == null) {
    //     errors = errors + " Please Enter The Source Phone Number \n";
    // }

    // if (inquiry.recievedmethod == "Email" && inquiry.recievedcontactoremail == null) {
    //     errors = errors + " Please Enter The Source Email Address \n";
    // }

    if (inquiry.recieveddate == null) {
        errors = errors + " Please Enter The Inquiry Recieved Date  \n";
    }

    // if (inquiry.recievedtime == null) {
    //     errors = errors + " Please Enter The Inquiry Recieved Time  \n";
    // }

    if (inquiry.main_inq_msg == null) {
        errors = errors + " Please Enter The Main Enquiry Details  \n";
    }

    if (inquiry.clientname == null) {
        errors = errors + " Please Enter The Client's Name  \n";
    }

    //if (inquiry.nationality == null) {
    //    errors = errors + " Please Select The Client's Nationality  \n";
    //}

    if (inquiry.contactnum == null && inquiry.email == null) {
        errors = errors + " Please Enter At Least One Contact Method (Phone or Email)  \n";
    }

    if (inquiry.prefcontactmethod == null) {
        errors = errors + " Please Select The Client's Preferred Contact Method  \n";
    }

    return errors;
}

//fn to submit button (add button)
const addNewInquiry = async () => {

    const errors = checkManualInqErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {
                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/inq", "POST", inquiry);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formSystemInq').reset();
                    refreshInquiryForm();
                    //buildEmployeeTable();
                    //var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    //myEmpTableTab.show();
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

//fn to view button, refill the data in form
const openModal = (inqObj) => {

    inquiry = JSON.parse(JSON.stringify(inqObj));
    oldInquiry = JSON.parse(JSON.stringify(inqObj));

    document.getElementById('manualInqUpdateBtn').disabled = false;
    document.getElementById('manualInqUpdateBtn').style.cursor = "pointer";

    document.getElementById('manualInqAddBtn').disabled = true;
    document.getElementById('manualInqAddBtn').style.cursor = "not-allowed";

    document.getElementById('inqCodeInput').value = inqObj.inqcode || "";
    document.getElementById('inqRecievedMethod').value = inqObj.inqsrc || "";
    document.getElementById('inqRecievedDate').value = inqObj.recieveddate || "";
    document.getElementById('inqRecievedTime').value = inqObj.recievedtime || "";
    document.getElementById('inqCodeRecievedContact').value = inqObj.recievedcontactoremail || "";
    document.getElementById('inqInterestedPkg').value = inqObj.intrstdpkgid || "";
    document.getElementById('inqClientTitle').value = inqObj.clienttitle || "";
    document.getElementById('inqClientName').value = inqObj.clientname || "";
    document.getElementById('InqClientNationality').value = inqObj.nationality?.countryname || "";
    document.getElementById('inqContactOne').value = inqObj.contactnum || "";
    document.getElementById('inqAdditionalContact').value = inqObj.contactnumtwo || "";
    document.getElementById('inqClientEmail').value = inqObj.email || "";
    document.getElementById('inqClientPassportNumorNIC').value = inqObj.passportnumornic || "";
    document.getElementById('inqMainEnquiry').value = inqObj.main_inq_msg || "";
    document.getElementById('prefContMethodPkgRelForm').value = inqObj.prefcontactmethod || "";
    document.getElementById('inqApproxStartDate').value = inqObj.inq_apprx_start_date || "";

    document.getElementById('inqLocalAdultCount').value = inqObj.inq_local_adults || 0;
    document.getElementById('inqLocalChildCount').value = inqObj.inq_local_kids || 0;
    document.getElementById('inqForeignAdultCount').value = inqObj.inq_adults || 0;
    document.getElementById('inqForeignChildCount').value = inqObj.inq_kids || 0;

    document.getElementById('inqAccommodationNote').value = inqObj.inq_accos || "";
    document.getElementById('inqPlacesPreferences').value = inqObj.inq_vplaces || "";
    document.getElementById('inqTransportNote').value = inqObj.inq_vehi || "";
    document.getElementById('estdPickupLocation').value = inqObj.inq_pick || "";
    document.getElementById('estdDropOffLocation').value = inqObj.inq_drop || "";
    document.getElementById('inputNoteInquiry').value = inqObj.note || "";
    document.getElementById('inqStatus').value = inqObj.inq_status || "";

    if (inqObj.inq_guideneed === true) {
        document.getElementById('guideYes').checked = true;
    } else if (inqObj.inq_guideneed === false) {
        document.getElementById('guideNo').checked = true;
    }

    const inputTagsIds = [
        'inqCodeInput',
        'inqRecievedMethod',
        'inqRecievedDate',
        'inqRecievedTime',
        'inqCodeRecievedContact',
        'inqInterestedPkg',
        'inqClientTitle',
        'inqClientName',
        'InqClientNationality',
        'inqContactOne',
        'inqAdditionalContact',
        'inqClientEmail',
        'inqClientPassportNumorNIC',
        //'inqMainEnquiry',
        'prefContMethodPkgRelForm',
        //'inqApproxStartDate',
        //'inqLocalAdultCount',
        //'inqLocalChildCount',
        //'inqForeignAdultCount',
        //'inqForeignChildCount',
        'inqAccommodationNote',
        'inqPlacesPreferences',
        'inqTransportNote',
        'estdPickupLocation',
        'estdDropOffLocation',
        'inputNoteInquiry',
        'inqStatus'
    ];

    // Disable all inputs in the list
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.disabled = true;
        }
    });

    var myInqFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myInqFormTab.show();

    refillAllPrevResponses();

};

//get updates
const showInqValueChanges = () => {

    let updates = "";

    if (inquiry.contactnumtwo != oldInquiry.contactnumtwo) {
        updates = updates + "Contact #2 changed from " + oldInquiry.contactnumtwo.trim() + " to " + inquiry.contactnumtwo.trim() + "\n";
    }

    if (inquiry.main_inq_msg != oldInquiry.main_inq_msg) {
        updates = updates + "Main Enquiry Message changed from " + oldInquiry.main_inq_msg.trim() + " to " + inquiry.main_inq_msg.trim() + "\n";
    }

    if (inquiry.inq_apprx_start_date != oldInquiry.inq_apprx_start_date) {
        updates = updates + "Estimated Start Date changed from " + oldInquiry.inq_apprx_start_date + " to " + inquiry.inq_apprx_start_date + "\n";
    }

    if (inquiry.inq_adults != oldInquiry.inq_adults) {
        updates = updates + "Traveller Group: Foreign Adult Count changed from " + oldInquiry.inq_adults + " to " + inquiry.inq_adults + "\n";
    }

    if (inquiry.inq_kids != oldInquiry.inq_kids) {
        updates = updates + "Traveller Group: Foreign Child Count changed from " + oldInquiry.inq_kids + " to " + inquiry.inq_kids + "\n";
    }

    if (inquiry.inq_local_adults != oldInquiry.inq_local_adults) {
        updates = updates + "Traveller Group: Local Adult Count changed from " + oldInquiry.inq_local_adults + " to " + inquiry.inq_local_adults + "\n";
    }

    if (inquiry.inq_local_kids != oldInquiry.inq_local_kids) {
        updates = updates + "Traveller Group: Local Child Count changed from " + oldInquiry.inq_local_kids + " to " + inquiry.inq_local_kids + "\n";
    }

    return updates;

}


//refresh the inquiry followup section and reset all fields
const refreshInqFollowupSection = () => {

    followup = new Object();

    //    const inqFollowupInputTagsIds = [
    //        'inqFollowupDate',
    //        'inqFollowupTime',
    //        'inqFollowupNote',
    //        'inqFollowupStatus',
    //    ];
    //
    //    inqFollowupInputTagsIds.forEach((fieldID) => {
    //        const field = document.getElementById(fieldID);
    //        if (field) {
    //            field.style.border = "1px solid #ced4da";
    //            field.value = '';
    //        }
    //    });

    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');
    addNewResponseRowBtn.disabled = true;
    addNewResponseRowBtn.style.cursor = "not-allowed";

}

//update a manual inq(after a followup)
const updateSystemInq = async () => {

    //💥💥💥errors balannath onee

    const changesHappened = showInqValueChanges();

    if (changesHappened == "") {

        showAlertModal('war', "No changes detected to update");

    } else {

        let userConfirm = confirm("Are you sure to proceed ? \n \n" + changesHappened);

        if (userConfirm) {
            followup.content = changesHappened;
            followup.inquiry_id = inquiry;

            console.log("Follow up object: ", followup);
            try {
                let putServiceResponse = await ajaxPPDRequest("/followupwithinq", "POST", followup);
                if (putServiceResponse === "OK") {
                    showAlertModal('suc', "Successfully Updated");
                    //document.getElementById('formEmployee').reset();
                    //refreshEmployeeForm();
                    //buildEmployeeTable();
                    //var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    //myEmpTableTab.show();
                } else {
                    showAlertModal('err', "Update Failed \n" + putServiceResponse);
                }

            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            showAlertModal('inf', "User cancelled the task");
        }
    }

}

//show all the responses
const refillAllPrevResponses = async () => {

    // /followup/byinqid/{inqId}
    try {
        const prevResponses = await ajaxGetReq("/followup/byinqid/" + inquiry.id);
        console.log(prevResponses);

        const container = document.getElementById("submittedAllResponses");
        container.innerHTML = ""; // Clear existing content

        if (!prevResponses || prevResponses.length === 0) {
            const noData = document.createElement("p");
            noData.classList.add("text-muted");
            noData.innerText = "No follow-up responses available.";
            container.appendChild(noData);
            return;
        }

        prevResponses.forEach(res => {
            // Outer column div
            const colDiv = document.createElement("div");
            colDiv.classList.add("col-12", "mb-3");

            // Card box
            const boxDiv = document.createElement("div");
            boxDiv.classList.add("p-3", "rounded", "border", "shadow-sm", "bg-light");

            // Header row (user id + time)
            const headerDiv = document.createElement("div");
            headerDiv.classList.add("d-flex", "justify-content-between", "mb-2");

            const userSpan = document.createElement("small");
            userSpan.classList.add("text-muted");
            userSpan.innerHTML = `<i class="bi bi-person"></i> User ID: ${res.addeduserid}`;

            const timeSpan = document.createElement("small");
            timeSpan.classList.add("text-muted");
            const dateObj = new Date(res.addeddatetime);
            timeSpan.innerHTML = `<i class="bi bi-clock-history"></i> ${dateObj.toLocaleString()}`;

            headerDiv.appendChild(userSpan);
            headerDiv.appendChild(timeSpan);

            // Content (with <pre> to preserve line breaks)
            const contentPre = document.createElement("pre");
            contentPre.classList.add("mb-0");
            contentPre.innerText = res.content;

            // Assemble all
            boxDiv.appendChild(headerDiv);
            boxDiv.appendChild(contentPre);
            colDiv.appendChild(boxDiv);
            container.appendChild(colDiv);
        });


    } catch (error) {
        console.error("Failed to fetch inquiry responses:", error);

    }

}

//get the inq responses for this inq
//const getAllPrevResponsesByInq = async (inqId) => {
//
//
//
//}



























//    const changes = showInqValueChanges();
//    console.log(changes);
//
//    followup.content = changes;
//    console.log("followup : ",followup );
//
//    console.log("Inq before followup: ", inquiry);
//
//    inquiry.followup.content = changes;
//
//    console.log("Inq after followup: ", inquiry);

//document.getElementById('inputNoteInquiry').value = changes;