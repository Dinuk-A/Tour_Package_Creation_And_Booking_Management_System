window.addEventListener('load', () => {
    loggedUserPrivileges = ajaxGetRequest("/privilege/bymodule/TOUR_PACKAGE");
    refreshTourPkgForm();
    refreshTPkgTable();

    console.log(loggedUserPrivileges);

    var myModal = document.getElementById('modalAddTP');

    if (myModal) {
        myModal.addEventListener('shown.bs.modal', function () {
            var customTP = document.getElementById('customTP');
            if (customTP && customTP.checked) {
                changesDependTypeOri();
            }
        });
    }

    // Get the date input element
    const dateInput = document.getElementById('tpStartDateInput');

    // Get today's date
    const today = new Date();

    // Add 7 days to today's date
    const minDate = new Date(today.setDate(today.getDate() + 5));

    // Format the date as yyyy-mm-dd
    const formattedDate = minDate.toISOString().split('T')[0];

    // Set the min attribute of the date input
    dateInput.setAttribute('min', formattedDate);

});


const refreshTourPkgForm = () => {

    // /inquiry/newandinprogressonly

    tourpkg = new Object();

    tourpkg.tourpkgHasDaypPlanList = new Array();

    tourpkg.tourpackagestatus_id = {
        id: 1,
        name: "Active"
    }

    inqs = ajaxGetRequest("/inquiry/newandinprogressonly");
    fillDataIntoSelect(tpkgBasedInquiry, 'Please Select the Based Inquiry', inqs, 'inqcode');

    startDayPlans = ajaxGetRequest('/dayplan/onlyfirstdays');
    fillDataIntoSelect(tpStartDaySelect, 'Please Select the firdt day', startDayPlans, 'dayplancode');

    lastDayPlans = ajaxGetRequest('/dayplan/onlylastdays');
    fillDataIntoSelect(tpEndDaySelect, 'Please Select the last day', lastDayPlans, 'dayplancode');

    pkgStatusList = ajaxGetRequest("/tpstatus/alldata");
    fillDataIntoSelect(tpSelectStatus, 'Please Select the status', pkgStatusList, 'name', tourpkg.tourpackagestatus_id.name);
    tpSelectStatus.style.border = "2px solid lime";

    vTypes = ajaxGetRequest("/vtypes/alldata");
    fillDataIntoSelect(tpkgVehitype, 'Please Select The Type', vTypes, 'name');

    tpUpdateBtn.disabled = true;
    tpUpdateBtn.style.cursor = "not-allowed";

    tpTitle.style.border = "1px solid #ced4da";
    tpStartDaySelect.style.border = "1px solid #ced4da";
    tpEndDaySelect.style.border = "1px solid #ced4da";
    tpNote.style.border = "1px solid #ced4da";
    tpSelectStatus.style.border = "1px solid #ced4da";

    //initially UPDATE button should be disabled (when in ADD mode)
    tpUpdateBtn.disabled = true;
    tpUpdateBtn.style.cursor = "not-allowed";

    //only manager can create web site tour packages
    loggedUserDesignation = loggedUserDesignationId.innerText;
    if (loggedUserDesignation == "Manager") {
        forWebSite.disabled = false;
    }

    // Only non-managers should see the alert when trying to edit packages with iscustompkg=0
    if (loggedUserDesignation !== "Manager" && tourpkg.iscustompkg === false) {
        btnEdit.addEventListener('click', () => {
            alert("You Don't Have Permissions To Edit Packages Displaying On Website");
        });
    }

    //only manager can update tour packages with iscustompkg=0
    // if (loggedUserDesignation == "Manager" && tourpkg.iscustompkg == 0) {
    //     btnEdit.addEventListener('click', () => {
    //         alert("You Dont Have Permissions To Edit Packages Displaying On Website")
    //     })

    // }

    // btnEdit.disabled = false;
    // enableDaySelectsContainer();
}

const refreshTPkgTable = () => {
    tourPkgs = ajaxGetRequest('/tourpackage/alldata');

    const displayProperty = [
        { dataType: 'text', propertyName: 'packagename' },
        { dataType: 'text', propertyName: 'packagecode' },
        { dataType: 'function', propertyName: getPkgType },
        { dataType: 'function', propertyName: getTourPkgStatus }
    ]

    fillDataIntoTable3(tableTourPkgs, tourPkgs, displayProperty, buttonVisibility = true, loggedUserPrivileges)

    $('#tableTourPkgs').dataTable();

}

const getPkgType = (ob) => {
    if (ob.iscustompkg == '1') {

        return 'Custom Package'
    } else {

        return 'Display in Website'
    }
}

const getTourPkgStatus = (ob) => {
    return ob.tourpackagestatus_id.name;

}

//save the selected inquiry
const bindBasedInq = () => {
    const selectedValue = tpkgBasedInquiry.value
    tourpkg.basedinquiry = JSON.parse(selectedValue).inqcode;
}

// const disableButtonsCommonFn =()=>{} 💥💥💥

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
        tourpkg.localchildcount = 0;
        tourpkg.foreignchildcount = 0;

    }
}

// const activateEdit = ()=>{

//     btnEdit.disabled = true;
//     const loggedInDesignation = loggedUserDesignation ;
//     const selectedObject = window['editOb'];

//     if(loggedInDesignation=="Manager" ){
//         if(selectedObject.iscustompkg){
//             btnEdit.disabled = false;
//         }
//         else{
//             btnEdit.disabled = false;
//         }

//     }
//     else{
//         if(selectedObject.iscustompkg){
//             btnEdit.disabled = false;
//         }
//         else{
//             btnEdit.disabled = true;
//         }
//     }


// }



// document.getElementById('btnEdit').addEventListener('click',()=>{
//     activateEdit();
// })

//this global var will be used later with generateNormalDayPlanSelectors();
//just to display day counts in UI elements, not bind
let showDayCount = 0;

//generate dayplan selectors when "add a day" clicked
const generateNormalDayPlanSelectors = () => {


    tourpkgHasDaypPlan = new Object();
    tourpkgHasDaypPlan.dayplan_id = null;
    tourpkgHasDaypPlan.dayno = showDayCount + 1;

    tourpkg.tourpkgHasDaypPlanList.push(tourpkgHasDaypPlan);

    let txt = 'dayId';
    let viewBtnIdTxt = 'idForViewButton';
    let dltBtnIdTxt = 'idForDeleteButton';

    //create a row
    let divRow = document.createElement('div');
    divRow.setAttribute('class', 'row mt-2');
    divRow.setAttribute('id', 'rowID' + showDayCount);

    // create a col (for label)
    let divColForLbl = document.createElement('div');
    divColForLbl.setAttribute('class', 'col-2');

    //create a label inside the col-2
    let labelTag = document.createElement('label');
    labelTag.setAttribute('for', (txt + showDayCount));
    labelTag.setAttribute('class', 'form-label mb-1');
    labelTag.innerText = 'Day ' + (tpNormLDayPlansSelectSection.children.length + 2) + ' :';

    //create a col for select tag
    let divColForSelect = document.createElement('div');
    divColForSelect.setAttribute('class', 'col-7');

    //create the select tag inside col-8
    let selectTag = document.createElement('select');
    selectTag.setAttribute('id', (txt + showDayCount))
    selectTag.setAttribute('class', 'form-control form-select mb-2');

    //original
    // normalDayPlansList = ajaxGetRequest('/dayplan/onlymiddays')
    // fillDataIntoSelect(selectTag, 'Please Select dayplan', normalDayPlansList, 'dayplancode');

    if (tourpkg.basedinquiry != null) {
        const selectedInq = JSON.parse(tpkgBasedInquiry.value).inqcode;
        normalDayPlansListByInq = ajaxGetRequest('/dayplan/onlymiddays/' + selectedInq)
        fillDataIntoSelect(selectTag, 'Please Select Dayplan', normalDayPlansListByInq, 'dayplancode');

    } else if (tourpkg.basedinquiry == null) {
        normalDayPlansList = ajaxGetRequest('/dayplan/onlymiddays')
        fillDataIntoSelect(selectTag, 'Please Select dayplan', normalDayPlansList, 'dayplancode');
    }



    selectTag.onchange = function () {

        selectedValue = JSON.parse(this.value);
        let slectday = this.parentNode.parentNode.children[0].children[0].innerText.split(" ")[1];

        let extDayplan = false;
        for (const tdp of tourpkg.tourpkgHasDaypPlanList) {
            if (tdp.dayplan_id != null && tdp.dayplan_id.id == selectedValue.id) {
                extDayplan = true;
                break;
            }
        }

        if (extDayplan) {
            alert("This DayPlan Has Already Selected");
            this.value = "";
            this.style.border = "1px solid red";

            document.getElementById(viewBtnIdTxt + showDayCount).disabled = false;
            document.getElementById(dltBtnIdTxt + showDayCount).disabled = false;

        } else {
            this.style.border = "1px solid lime";
            tourpkg.tourpkgHasDaypPlanList[parseInt(slectday) - 2].dayplan_id = selectedValue;

            document.getElementById(viewBtnIdTxt + showDayCount).disabled = false;
            document.getElementById(dltBtnIdTxt + showDayCount).disabled = false;
        }


        showDayCount++
        calcTotalDayCount();
    }

    //create a col for buttons
    let divColForBtns = document.createElement('div');
    divColForBtns.setAttribute('class', 'col-3');

    //create view btn
    let btnView = document.createElement('button');
    btnView.setAttribute('class', 'btn btn-all btn-add me-1');
    btnView.setAttribute('id', (viewBtnIdTxt + showDayCount));
    // btnView.setAttribute('id', 'idForViewButton');
    btnView.innerText = '👁';
    btnView.disabled = 'true';
    btnView.onclick = function () { openReusableModalToShowDayInfo(this.parentNode.parentNode.children[1].children[0].value); }

    //create delete btn
    let btnDelete = document.createElement('button');
    btnDelete.setAttribute('class', 'btn btn-all btn-delete');
    btnDelete.setAttribute('id', (dltBtnIdTxt + showDayCount));
    // btnDelete.setAttribute('id', 'idForDeleteButton');
    btnDelete.innerText = '🚮';
    btnDelete.disabled = 'true';
    // btnDelete.onclick = function () { deleteThisRow(this.parentNode.parentNode); }

    btnDelete.onclick = function () {

        deleteThisRow(this.parentNode.parentNode);

        calcTotalDayCount();

    }

    //append btns to col-2
    divColForBtns.appendChild(btnView);
    divColForBtns.appendChild(btnDelete);

    //append select tag to col-8
    divColForSelect.appendChild(selectTag);

    //append label tag to col-2
    divColForLbl.appendChild(labelTag);

    //append 3 columns to row
    divRow.appendChild(divColForLbl);
    divRow.appendChild(divColForSelect);
    divRow.appendChild(divColForBtns);

    //append row to the section in HTML
    document.getElementById('tpNormLDayPlansSelectSection').appendChild(divRow);

}

// Update the total days count and display
const calcTotalDayCount = () => {

    //original
    // if (tpEndDaySelect.value != "") {
    //     document.getElementById('showTotalDaysCount').innerText = tourpkg.tourpkgHasDaypPlanList.length + 2;
    //     tourpkg.totaldayscount = document.getElementById('showTotalDaysCount').innerText;
    // } else {
    //     document.getElementById('showTotalDaysCount').innerText = tourpkg.tourpkgHasDaypPlanList.length + 1;
    //     tourpkg.totaldayscount = document.getElementById('showTotalDaysCount').innerText;
    // }

    if (tpEndDaySelect.value != "") {
        document.getElementById('showTotalDaysCount').value = tourpkg.tourpkgHasDaypPlanList.length + 2;
        tourpkg.totaldayscount = document.getElementById('showTotalDaysCount').value;
    } else {
        document.getElementById('showTotalDaysCount').value = tourpkg.tourpkgHasDaypPlanList.length + 1;
        tourpkg.totaldayscount = document.getElementById('showTotalDaysCount').value;
        showTotalDaysCount.value = '';
    }

    calcEndDate();
}

// const daysCount = parseInt(document.getElementById('daysCount').value, 10);
//calc end date auto
const calcEndDate = () => {
    const startDate = tpStartDateInput.value;

    //to treat the parsed value as a base 10 integer
    const daysCount = parseInt(document.getElementById('showTotalDaysCount').value, 10);

    if (startDate && daysCount) {
        const startDateObj = new Date(startDate);
        startDateObj.setDate(startDateObj.getDate() + (daysCount));

        const endDate = startDateObj.toISOString().split('T')[0];

        document.getElementById('tpEndDateInput').value = endDate;

        // Manually trigger 
        inputFieldValidator(document.getElementById('tpEndDateInput'), '', 'tourpkg', 'tourenddate');
        checkInternalDriverAvailability();
        checkInternalGuideAvailability();
    }

}

//FOR OPEN MODAL TO SHOW START DAY DETAILS
const showDayInfoModal = (dayOb) => {

    let placeVar = JSON.parse(dayOb);
    dpName.innerText = placeVar.daytitle;
    dpStartLoc.innerText = placeVar.startlocation;
    dpEndLoc.innerText = placeVar.endlocation;
    dpNote.innerText = placeVar.note;

    tempVPlaceVar = "";
    num = 1
    placeVar.vplaces.forEach(attraction => {
        // index eka dipu gaman function eka awul yanawa 💥💥💥
        // tempVPlaceVar = tempVPlaceVar + (parseInt(index)+1) + " ⏩ " + attraction.name +"</br>";

        //working
        tempVPlaceVar = tempVPlaceVar + num + ">" + attraction.name + " </br>";
        num++
    });

    dpVplacesList.innerHTML = tempVPlaceVar;
    $('#reusableModalToShowDayInfo').modal('show');
}

//enable select days until the day count is more than 0
const enableDaySelectsContainer = () => {
    let localAdultCount = parseInt(document.getElementById('tpkgLocalAdultCount').value);
    let localChildCount = parseInt(document.getElementById('tpkgLocalChildCount').value);
    let foreignAdultCount = parseInt(document.getElementById('tpkgForeignAdultCount').value);
    let foreignChildCount = parseInt(document.getElementById('tpkgForeignChildCount').value);


    if (localAdultCount > 0) {
        let totalTravellers = localAdultCount + localChildCount + foreignAdultCount + foreignChildCount;
        console.log("totalTravellers", totalTravellers);


        if (totalTravellers > 0) {
            pkgDaysContainerId.classList.remove('d-none');
        } else {
            pkgDaysContainerId.classList.add('d-none');
            tourpkg.sd_dayplan_id = null;
            tourpkg.ed_dayplan_id = null;
            tourpkg.tourpkgHasDaypPlanList = [];

        }
    } else {

    }



}

//submit a tour pkg
const addTourPkg = () => {

    //check form error
    const errors = checkTourPkgErrors();

    if (errors == '') {
        const userConfirm = confirm('Are You Sure To Add ? \n');

        if (userConfirm) {
            let postServiceResponse = ajaxRequest("/tourpackage", "POST", tourpkg);

            if (new RegExp("^[T,P]{2}[0-9]{5}$").test(postServiceResponse)) {
                alert("Succesfully Saved " + postServiceResponse);
                refreshTPkgTable();
                tourPackageForm.reset();
                refreshTourPkgForm();
                $('#modalAddTP').modal('hide');

            } else {
                alert("An Error Occured " + postServiceResponse);
            }

        } else {
            alert('Operation Cancelled By User')
        }
    } else {
        alert('Form Has Followimg Errors \n \n' + errors);
    }
}

//CHECK INPUT ERRORS 💥
const checkTourPkgErrors = () => {
    let tpErrors = "";

    // if (tourpkg.iscustompkg == null) {
    //     tpErrors = tpErrors + " Please Choose The Package's Type \n";
    // }

    // if (tourpkg.packagename == null) {
    //     tpErrors = tpErrors + " Please Enter A Name For The Package \n";
    // }

    // if (tourpkg.sd_dayplan_id == null) {
    //     tpErrors = tpErrors + " Please Select The Starting Date \n";
    // }

    // if (!tourpkg.iscustompkg && tourpkg.description == null) {
    //     tpErrors = tpErrors + " Please Provide A Small Description \n";
    // }

    // if (tourpkg.tourpackagestatus_id == null) {
    //     tpErrors = tpErrors + " Please Select A Status \n";
    // }

    // ALUTH EWATA THAWA ENNA ONE tpDescription 💥💥💥

    return tpErrors;
}

//open a modal to show day info 
const openReusableModalToShowDayInfo = (dayOb) => {
    let placeVar = JSON.parse(dayOb);

    // Assign values
    dpName.innerText = placeVar.daytitle;
    dpStartLoc.innerText = placeVar.startlocation;
    dpEndLoc.innerText = placeVar.endlocation;
    dpNote.innerText = placeVar.note;

    // Populate visiting places list
    let tempVPlaceVar = '';
    placeVar.vplaces.forEach((attraction, index) => {
        tempVPlaceVar += `<li>${index + 1}. ${attraction.name}</li>`;
    });
    dpVplacesList.innerHTML = tempVPlaceVar;

    // Show modal
    $('#reusableModalToShowDayInfo').modal('show');
}

// const openReusableModalToShowDayInfo = (dayOb) => {

//     let placeVar = JSON.parse(dayOb);
//     dpName.innerText = placeVar.daytitle;
//     dpStartLoc.innerText = placeVar.startlocation;
//     dpEndLoc.innerText = placeVar.endlocation;
//     dpNote.innerText = placeVar.note;

//     tempVPlaceVar = "";
//     num = 1
//     placeVar.vplaces.forEach(attraction => {

//         tempVPlaceVar = tempVPlaceVar + num + ">" + attraction.name + " </br>";
//         num++
//     });

//     dpVplacesList.innerHTML = tempVPlaceVar;

//     $('#reusableModalToShowDayInfo').modal('show');

// }

//💥💥💥aluthem cost hadannaa hadapu fn tika meketh cal karanna
const tpFormRefill = (ob) => {
    $('#modalAddTP').modal('show');

    tourpkg = JSON.parse(JSON.stringify(ob));
    oldTPkg = JSON.parse(JSON.stringify(ob));

    calcEndDate();

    if (tourpkg.iscustompkg) {
        customTP.checked = true;
        tpDescRow.classList.toggle('d-none');
        basedInqSection.classList.toggle('d-none');
        accordionForTPKGCosts.classList.toggle('d-none');
        datesSection.classList.toggle('d-none');
        numberOfTravellersSection.classList.toggle('d-none');
        checkAvailabilitySection.classList.toggle('d-none');
        imageAddSection.classList.toggle('d-none');

    } else {
        forWebSite.checked = true;
        tpDescRow.classList.toggle('d-none');
        accordionForTPKGCosts.classList.toggle('d-none');
        basedInqSection.classList.toggle('d-none');
        datesSection.classList.toggle('d-none');
        numberOfTravellersSection.classList.toggle('d-none');
        checkAvailabilitySection.classList.toggle('d-none');
        imageAddSection.classList.toggle('d-none');

    }

    tpTitle.value = tourpkg.packagename;
    tpCode.value = tourpkg.packagecode;
    tpDescription.value = tourpkg.description;

    tpNote.value = tourpkg.note;

    startDayPlans = ajaxGetRequest('/dayplan/onlyfirstdays');
    fillDataIntoSelect(tpStartDaySelect, 'Please Select the first day', startDayPlans, 'dayplancode', tourpkg.sd_dayplan_id.dayplancode);

    if (tourpkg.ed_dayplan_id != null) {
        lastDayPlans = ajaxGetRequest('/dayplan/onlylastdays');
        fillDataIntoSelect(tpEndDaySelect, 'Please Select the last day', lastDayPlans, 'dayplancode', tourpkg.ed_dayplan_id.dayplancode);
    }

    pkgStatusList = ajaxGetRequest("/tpstatus/alldata");
    fillDataIntoSelect(tpSelectStatus, 'Please Select the status', pkgStatusList, 'name', tourpkg.tourpackagestatus_id.name);

    inqs = ajaxGetRequest("/inquiry/newandinprogressonly");
    fillDataIntoSelect(tpkgBasedInquiry, 'Please Select the Based Inquiry', inqs, 'inqcode', tourpkg.basedinquiry);

    //add button should be disabled in EDIT MODE
    tpAddBtn.disabled = true;
    tpAddBtn.style.cursor = "not-allowed";

    //formrefresh ekedi disabled karapu ewa methanin enable karanawa
    tpEndDaySelect.disabled = false;
    showStartDayBtn.disabled = false;
    showEndDayBtn.disabled = false;

    tpUpdateBtn.disabled = false;
    tpUpdateBtn.style.cursor = "pointer";

    let showDayCountWhenReFill = 0;

    tourpkg.tourpkgHasDaypPlanList.forEach((dpln) => {
        let txt = 'dayId';

        //create a row
        let divRow = document.createElement('div');
        divRow.setAttribute('class', 'row mt-2');
        divRow.setAttribute('id', 'rowID' + showDayCountWhenReFill);

        // create a col (for label)
        let divColForLbl = document.createElement('div');
        divColForLbl.setAttribute('class', 'col-2');

        //create a label inside the col-2
        let labelTag = document.createElement('label');
        labelTag.setAttribute('for', (txt + showDayCountWhenReFill));
        labelTag.setAttribute('class', 'form-label mb-1');
        labelTag.innerText = 'Day ' + (tpNormLDayPlansSelectSection.children.length + 2) + ' :';

        //create a col for select tag
        let divColForSelect = document.createElement('div');
        divColForSelect.setAttribute('class', 'col-7');

        //create the select tag inside col-8
        let selectTag = document.createElement('select');
        selectTag.setAttribute('id', (txt + showDayCountWhenReFill))
        selectTag.setAttribute('class', 'form-control form-select mb-2');

        normalDayPlansList = ajaxGetRequest('/dayplan/onlymiddays')

        // indexOfArray = parseInt(dpln.dayplan_id); 
        fillDataIntoSelect(selectTag, 'Please Select dayplan', normalDayPlansList, 'dayplancode', dpln.dayplan_id.dayplancode);

        selectTag.onchange = function () {
            selectedValue = JSON.parse(this.value);
            let slectday = this.parentNode.parentNode.children[0].children[0].innerText.split(" ")[1];


            let extDayplan = false;
            for (const tdp of tourpkg.tourpkgHasDaypPlanList) {
                if (tdp.dayplan_id != null && tdp.dayplan_id.id == selectedValue.id) {
                    extDayplan = true;
                    break;
                }
            }
            if (extDayplan) {
                alert("This DayPlan Has Already Selected");
                this.value = "";
                this.style.border = "1px solid red";
            } else {
                this.style.border = "1px solid lime";
                tourpkg.tourpkgHasDaypPlanList[parseInt(slectday) - 2].dayplan_id = selectedValue;
            }

            showDayCountWhenReFill++



        }

        //create a col for buttons
        let divColForBtns = document.createElement('div');
        divColForBtns.setAttribute('class', 'col-3');

        //create view btn
        let btnView = document.createElement('button');
        btnView.setAttribute('class', 'btn btn-all btn-add');
        btnView.setAttribute('id', 'idForViewButton');
        btnView.innerText = '👁';
        btnView.onclick = function () { openReusableModalToShowDayInfo(this.parentNode.parentNode.children[1].children[0].value); }

        //create delete btn
        let btnDelete = document.createElement('button');
        btnDelete.setAttribute('class', 'btn btn-all btn-delete');
        btnDelete.setAttribute('id', 'idForDeleteButton');
        btnDelete.innerText = '🚮';
        btnDelete.onclick = function () { deleteThisRow(this.parentNode.parentNode); }

        //append btns to col-2
        divColForBtns.appendChild(btnView);
        divColForBtns.appendChild(btnDelete);

        //append select tag to col-8
        divColForSelect.appendChild(selectTag);

        //append label tag to col-2
        divColForLbl.appendChild(labelTag);

        //append 3 columns to row
        divRow.appendChild(divColForLbl);
        divRow.appendChild(divColForSelect);
        divRow.appendChild(divColForBtns);

        //append row to the section in HTML
        document.getElementById('tpNormLDayPlansSelectSection').appendChild(divRow);
    });

    //MEKA CHECK KARANNA NAM KATAHARI UPDATE PRV AYN KARALA BALANNA💥💥💥
    //disabling update button based on USER PRIVILEGES 
    // if (loggedUserPrivileges.privupdate) {
    //     empUpdateBtn.disabled = false;
    // } else {
    //     empUpdateBtn.disabled = true;
    // }

}

//DELETE A ROW
const deleteTP = (ob) => {

    const userConfirm = confirm("You Sure To Delete?")
    if (userConfirm) {
        let deleteServerResponse = ajaxRequest("/tourpackage", "DELETE", ob)
        if (deleteServerResponse == "OK") {
            alert('Deleted succesfully');
            refreshTPkgTable();
        }
    } else {
        alert("Delete Failed \n" + deleteServerResponse);
    }

}

//UPDATE A ROW
const updateTPkg = () => {

    let tPkgErrors = checkTourPkgErrors();

    if (tPkgErrors == '') {
        let tPkgUpdates = checkTPkgUpdates();
        if (tPkgUpdates == '') {
            alert('No Changes Detected')
        } else {
            let userResponse = confirm('are you sure to update ? \n \n' + tPkgUpdates);
            if (userResponse) {
                let putServiceResponce = ajaxRequest('/tourpackage', 'PUT', tourpkg)
                if (putServiceResponce == 'OK') {
                    alert('successfully updated');
                    $('#modalAddTP').modal('hide');
                    refreshTourPkgForm();
                    tourPackageForm.reset();
                    refreshTPkgTable();
                } else {
                    alert("An error occured \n" + putServiceResponce);
                }
            } else {
                alert("Operation cancelled by the Operator");
            }
        }
    } else {
        alert('form has following errors ' + tPkgErrors)
    }
}

//compare updates
const checkTPkgUpdates = () => {
    let tpUpdates = "";

    if (tourpkg.iscustompkg != oldTPkg.iscustompkg) {
        tpUpdates = tpUpdates + " Package Type has changed \n";
    }

    if (tourpkg.packagename != oldTPkg.packagename) {
        tpUpdates = tpUpdates + " Package Name has changed \n";
    }

    if (tourpkg.basedinquiry != oldTPkg.basedinquiry) {
        tpUpdates = tpUpdates + " Based Inquiry has changed \n";
    }

    if (tourpkg.sd_dayplan_id.dayplancode != oldTPkg.sd_dayplan_id.dayplancode) {
        tpUpdates = tpUpdates + " Package's Start Day has changed \n";
    }

    if (tourpkg.ed_dayplan_id.dayplancode != oldTPkg.ed_dayplan_id.dayplancode) {
        tpUpdates = tpUpdates + " Package's End Day has changed \n";
    }

    if (tourpkg.note != oldTPkg.note) {
        tpUpdates = tpUpdates + " Note has changed \n";
    }

    if (tourpkg.description != oldTPkg.description) {
        tpUpdates = tpUpdates + " Description has changed \n";
    }

    if (tourpkg.tourpackagestatus_id.name != oldTPkg.tourpackagestatus_id.name) {
        tpUpdates = tpUpdates + " Package Status has changed \n";
    }

    if (tourpkg.tourpkgHasDaypPlanList.length != oldTPkg.tourpkgHasDaypPlanList.length) {
        tpUpdates = tpUpdates + " Mid Days List have changed \n";
    }

    if (tourpkg.img1 != oldTPkg.img1) {
        tpUpdates = tpUpdates + "Cover Photo has changed \n";
    }

    if (tourpkg.img2 != oldTPkg.img2) {
        tpUpdates = tpUpdates + "Photo #2 has changed \n";
    }

    if (tourpkg.img3 != oldTPkg.img3) {
        tpUpdates = tpUpdates + "Photo #3 has changed \n";
    }

    if (tourpkg.img4 != oldTPkg.img4) {
        tpUpdates = tpUpdates + "Photo #4 has changed \n";
    }

    return tpUpdates;
}

//DELETE SELECTED MID DAY 
const deleteThisRow = (row) => {

    let slectday = row.children[0].children[0].innerText.split(" ")[1];
    row.remove();

    tourpkg.tourpkgHasDaypPlanList.splice((parseInt(slectday) - 2), 1);

    if (tpEndDaySelect.value != "") {
        document.getElementById('showTotalDaysCount').innerText = tourpkg.tourpkgHasDaypPlanList.length + 2;
    } else {
        document.getElementById('showTotalDaysCount').innerText = tourpkg.tourpkgHasDaypPlanList.length + 1;
    }

    for (let index = 0; index < tpNormLDayPlansSelectSection.children.length; index++) {
        tpNormLDayPlansSelectSection.children[index].children[0].children[0].innerText = "Day " + (index + 2);

    }

}

const imgValidatorfortpkg = (fileElement, object, imgProperty, previewId) => {
    if (fileElement.files && fileElement.files[0]) {
        let file = fileElement.files[0];
        let fileReader = new FileReader();

        fileReader.onload = function (e) {
            previewId.src = e.target.result;
            window[object][imgProperty] = btoa(e.target.result);
        }
        fileReader.readAsDataURL(file);
    }
}

const clearImg = (imgProperty, previewId) => {
    if (tourpkg[imgProperty] != null) {
        let userConfirmImgDlt = confirm("Are You Sure To Delete This Image?");
        if (userConfirmImgDlt) {
            tourpkg[imgProperty] = null;
            previewId.src = 'resources/images/placeholder.jpg';
        } else {
            alert("User Cancelled The Deletion Task");
        }
    }
}


//calc total parking fee   mekata travellers count and vehi type adala na
const calcTotalParkingfee = () => {

    let parkingCostFirstDay = tourpkg.sd_dayplan_id.vehiparkingfeeforday;
    console.log("parking Cost First Day: ", parkingCostFirstDay);

    let parkingCostLastDay = 0.00;
    if (tourpkg.ed_dayplan_id == null) {
        parkingCostLastDay = 0.00;
    } else {
        parkingCostLastDay = tourpkg.sd_dayplan_id.vehiparkingfeeforday;
        console.log("parking Cost Last Day: ", parkingCostLastDay);
    }

    let parkingCostMidDays = 0.00;
    if (tourpkg.tourpkgHasDaypPlanList.length > 0) {
        tourpkg.tourpkgHasDaypPlanList.forEach(day => {
            if (day.dayplan_id) {
                let midDaysParkingCost = day.dayplan_id.vehiparkingfeeforday;
                parkingCostMidDays += midDaysParkingCost;
                console.log("parkingCostMidDays: ", parkingCostMidDays);
            }
        });
    }

    totalParkingCost = parkingCostFirstDay + parkingCostMidDays + parkingCostLastDay;
    console.log("Total parking Cost: ", totalParkingCost);

    totalVehicleParkingCost.value = totalParkingCost.toFixed(2);

}

//calc total vehicle fee ✅
const calcTotalVehicleFee = () => {

    //distance covered first day 
    let distanceCoverageFirstDay = tourpkg.sd_dayplan_id.kmcountforday;

    //distance covered for mid days 
    let distanceCoverageMidDays = 0.00;
    if (tourpkg.tourpkgHasDaypPlanList.length > 0) {
        tourpkg.tourpkgHasDaypPlanList.forEach(day => {
            if (day.dayplan_id) {
                let midDaysKMcount = day.dayplan_id.kmcountforday;
                distanceCoverageMidDays += midDaysKMcount;
            }
        });
    }

    //distance covered last day 
    let distanceCoverageLastDay = 0.000;
    if (tourpkg.ed_dayplan_id == null) {
        distanceCoverageLastDay = 0.000;
    } else {
        distanceCoverageLastDay = tourpkg.sd_dayplan_id.kmcountforday;
    }

    let totalKMCount = distanceCoverageFirstDay + distanceCoverageLastDay + distanceCoverageMidDays;

    let vehiCharge = tourpkg.vehicletype.chargeperkm;
    totalVehicleChargeForPkg = totalKMCount * vehiCharge;

    console.log('totalVehicleChargeForPkg', totalVehicleChargeForPkg);

    totalVehiCost.value = totalVehicleChargeForPkg.toFixed(2);

    //then if not null, run calc
    //refresh fn ekak athule okkoma calc funtion, btn eken refresh fn eka call wenawa, eke athulema default 0s thiyanawa athyawashya inputs naththan

}

//calc accomodation cost
const calcTotalStayCost = () => {
    // Get total traveller count
    const totalTravellers = parseInt(document.getElementById('tpkgLocalAdultCount').value) +
        parseInt(document.getElementById('tpkgLocalChildCount').value) +
        parseInt(document.getElementById('tpkgForeignAdultCount').value) +
        parseInt(document.getElementById('tpkgForeignChildCount').value);

    console.log('totalTravellers:', totalTravellers);

    // First day
    const firstDayBasePrice = tourpkg.sd_dayplan_id.end_stay_id.base_price;
    const firstDayIncrementalCost = tourpkg.sd_dayplan_id.end_stay_id.incremental_cost;

    // Last day
    let lastDayBasePrice = 0;
    let lastDayIncrementalCost = 0;
    if (tourpkg.ed_dayplan_id.end_stay_id != null) {
        lastDayBasePrice = tourpkg.ed_dayplan_id.end_stay_id.base_price;
        lastDayIncrementalCost = tourpkg.ed_dayplan_id.end_stay_id.incremental_cost;

    } else if (tourpkg.ed_dayplan_id.end_stay_id = null) {
        lastDayBasePrice = 0;
        lastDayIncrementalCost = 0;
    }

    // Mid days
    let totalMidDaysBasePrice = 0;
    let totalMidDaysIncrementalCost = 0;
    if (tourpkg.tourpkgHasDaypPlanList.length > 0) {
        tourpkg.tourpkgHasDaypPlanList.forEach(day => {
            if (day.dayplan_id) {
                totalMidDaysBasePrice += day.dayplan_id.end_stay_id.base_price;
                totalMidDaysIncrementalCost += day.dayplan_id.end_stay_id.incremental_cost;
            }
        });
    }

    console.log('totalMidDaysBasePrice:', totalMidDaysBasePrice);
    console.log('totalMidDaysIncrementalCost:', totalMidDaysIncrementalCost);

    const firstDayCost = firstDayBasePrice + (firstDayIncrementalCost * totalTravellers);
    const lastDayCost = lastDayBasePrice + (lastDayIncrementalCost * totalTravellers);
    const midDaysCost = totalMidDaysBasePrice + (totalMidDaysIncrementalCost * totalTravellers);

    const totalStayCost = firstDayCost + lastDayCost + midDaysCost;

    totalStayCostInput.value = totalStayCost.toFixed(2);
    tourpkg.totalstaycost = totalStayCost;

    return totalStayCost;
};

//calc water bottle cost
const calcWBCost = () => {

    const totalTravellers = parseInt(document.getElementById('tpkgLocalAdultCount').value) +
        parseInt(document.getElementById('tpkgLocalChildCount').value) +
        parseInt(document.getElementById('tpkgForeignAdultCount').value) +
        parseInt(document.getElementById('tpkgForeignChildCount').value);

    //get total wb cost
    let totalWBCostVar = (singleWBCost.value) * (dailyWBCount.value) * (tourpkg.totaldayscount) * totalTravellers;
    totalWBCost.value = totalWBCostVar.toFixed(2);

}

const calcWBandAdditionalCost = () => {
    // Convert the input values to numbers before performing addition

    let additionalCostsVar = parseFloat(additionalCostsInput.value) || 0;
    let waterBottleCostVar = parseFloat(totalWBCost.value) || 0;

    // Calculate the total additional costs
    let totalAdditionalCostsSum = additionalCostsVar + waterBottleCostVar;

    // Update the total additional costs field
    totalAdditionalCosts.value = totalAdditionalCostsSum.toFixed(2);
    tourpkg.totaladditionalcosts = totalAdditionalCostsSum;

}

//calc total lunch cost ✅
const calcTotalLunchcost = () => {

    //lunch cost for first day , for 1 person
    let lunchCostFirstDay = tourpkg.sd_dayplan_id.lunch_hotel_id.costperhead;
    console.log("Lunch Cost First Day: ", lunchCostFirstDay);

    //lunch cost for all mid days , for 1 person
    let lunchCostMidDays = 0.00;
    if (tourpkg.tourpkgHasDaypPlanList.length > 0) {
        tourpkg.tourpkgHasDaypPlanList.forEach(day => {
            if (day.dayplan_id) {
                let midDaysLCost = day.dayplan_id.lunch_hotel_id.costperhead;
                lunchCostMidDays += midDaysLCost;
            }
        });
    }
    console.log("Lunch Cost Mid Days: ", lunchCostMidDays);

    //lunch cost for last day , for 1 person
    let lunchCostLastDay;
    if (tourpkg.ed_dayplan_id == null) {
        lunchCostLastDay = 0.00;
    } else {
        lunchCostLastDay = tourpkg.ed_dayplan_id.lunch_hotel_id.costperhead;
    }
    console.log("Lunch Cost Last Day: ", lunchCostLastDay);

    //get total traveller count
    let localAdultCount = parseInt(document.getElementById('tpkgLocalAdultCount').value);
    let localChildCount = parseInt(document.getElementById('tpkgLocalChildCount').value);
    let foreignAdultCount = parseInt(document.getElementById('tpkgForeignAdultCount').value);
    let foreignChildCount = parseInt(document.getElementById('tpkgForeignChildCount').value);
    let totalTravellerCount = localAdultCount + localChildCount + foreignAdultCount + foreignChildCount;
    console.log("totalTravellerCount ", totalTravellerCount);

    //final lunch cost for all
    totalLunchCost = (lunchCostFirstDay + lunchCostMidDays + lunchCostLastDay) * totalTravellerCount;

    totalLunchCostForAll.value = totalLunchCost.toFixed(2);
    //bind karala na💥💥💥
    console.log("Total Lunch Cost: ", totalLunchCost);
}

//calc total tkt costs
const calcTotalTktCost = (startId, listname, enddayid) => {

    let totalLocalAdultCost = 0;
    let totalLocalChildCost = 0;
    let totalForeignAdultCost = 0;
    let totalForeignChildCost = 0;

    const localAdultCount = parseInt(document.getElementById('tpkgLocalAdultCount').value);
    const localChildCount = parseInt(document.getElementById('tpkgLocalChildCount').value);
    const foreignAdultCount = parseInt(document.getElementById('tpkgForeignAdultCount').value);
    const foreignChildCount = parseInt(document.getElementById('tpkgForeignChildCount').value);

    // Check if 'sd_dayplan_id' is defined and has the necessary properties
    if (document.getElementById(startId).value !== "") {
        totalLocalAdultCost += (tourpkg.sd_dayplan_id.totallocaladultticketcost) * localAdultCount;
        totalLocalChildCost += (tourpkg.sd_dayplan_id.totallocalchildticketcost) * localChildCount;
        totalForeignAdultCost += (tourpkg.sd_dayplan_id.totalforeignadultticketcost) * foreignAdultCount;
        totalForeignChildCost += (tourpkg.sd_dayplan_id.totalforeignchildticketcost) * foreignChildCount;
    }

    let dataList = window['tourpkg'][listname];
    if (dataList.length > 0) {
        dataList.forEach(plan => {
            totalLocalAdultCost += (plan.dayplan_id.totallocaladultticketcost) * localAdultCount;
            totalLocalChildCost += (plan.dayplan_id.totallocalchildticketcost) * localChildCount;
            totalForeignAdultCost += (plan.dayplan_id.totalforeignadultticketcost) * foreignAdultCount;
            totalForeignChildCost += (plan.dayplan_id.totalforeignchildticketcost) * foreignChildCount;
        });
    }

    if (document.getElementById(enddayid).value !== "") {
        totalLocalAdultCost += (tourpkg.ed_dayplan_id.totallocaladultticketcost) * localAdultCount;
        totalLocalChildCost += (tourpkg.ed_dayplan_id.totallocalchildticketcost) * localChildCount;
        totalForeignAdultCost += (tourpkg.ed_dayplan_id.totalforeignadultticketcost) * foreignAdultCount;
        totalForeignChildCost += (tourpkg.ed_dayplan_id.totalforeignchildticketcost) * foreignChildCount;
    }

    totalTktCost = totalLocalAdultCost + totalLocalChildCost + totalForeignAdultCost + totalForeignChildCost;
    totalTktCostInput.value = totalTktCost.toFixed(2);
    tourpkg.totaltktcostforall = totalTktCost;

    console.log('Local Adult Tickets Cost:', totalLocalAdultCost);
    console.log('Local Child Tickets Cost:', totalLocalChildCost);
    console.log('Foreign Adult Tickets Cost:', totalForeignAdultCost);
    console.log('Foreign Child Tickets Cost:', totalForeignChildCost);
    console.log('Total Tickets Cost:', totalTktCost);
}

const calcAllCosts = () => {

    calcTotalLunchcost();
    calcTotalVehicleFee();
    calcTotalTktCost('tpStartDaySelect', 'tourpkgHasDaypPlanList', 'tpEndDaySelect');
    calcTotalParkingfee();
    let totalStayCost = calcTotalStayCost();
    calcWBandAdditionalCost();

    const additionalCostValue = parseInt(document.getElementById('totalAdditionalCosts').value);

    let finalPkgCost = totalTktCost + totalVehicleChargeForPkg + totalLunchCost + totalParkingCost + additionalCostValue + totalStayCost;

    pkgFinalCostInput.value = finalPkgCost.toFixed(2);
    tourpkg.pkgtotalcost = finalPkgCost;

    console.log('finalPkgCost', finalPkgCost);

    let profitMargin = 0.3; // Base profit margin 

    // Adjust profit margin based on guide needed or not
    if (guideYesCB.checked) {
        if (yathraGuideCB.checked) {
            profitMargin += 0.05;                     // Internal guide = 5% 
        } else if (rentalGuideCB.checked) {
            profitMargin += 0.08;                    // External guide = 8% 
        }
    }

    // Adjust profit margin based on driver
    if (yathraDriverCB.checked) {
        profitMargin += 0.00;                     // Internal vehicle = already included in package 
    } else if (rentalDriverCB.checked) {
        profitMargin += 0.08;                    // External vehicle = 8% 
    }

    // Adjust profit margin based on vehicle
    if (yathraVehiCB.checked) {
        profitMargin += 0.00;               // internal vehicle = already included in package
    } else if (rentalVehiCB.checked) {
        profitMargin += 0.05;                //external vehicle = 5%
    }

    console.log('profitMargin', profitMargin);

    // Calculate final price
    let finalPrice = finalPkgCost * (1 + profitMargin);

    // Apply discount
    const discountPercent = parseFloat(document.getElementById('pkgDiscountPrec').value) / 100;
    finalPrice = finalPrice * (1 - discountPercent);

    console.log('discountPercent ', discountPercent);

    // Round to closest 1000
    finalPrice = Math.ceil(finalPrice / 1000) * 1000;

    pkgFinalPrice.value = finalPrice.toFixed(2);
    tourpkg.pkgprice = pkgFinalPrice.value;

    console.log('finalPrice', finalPrice);

    // Calculate advance amount
    const advancePercentage = 0.4;   //40%
    let advanceAmount = finalPrice * advancePercentage;
    document.getElementById('pkgAdvance').value = advanceAmount.toFixed(2);
    
    tourpkg.advanceamount = advanceAmount;

    console.log('advanceAmount', advanceAmount);

    calcCostsButton.innerText = "Refresh Sum";
}


// dicountPrecentage = document.getElementById('pkgDiscountPrec').value;

// if(dicountPrecentage="5%"){

// }

function calculateProfitMargin() {
    let profitMargin = 0.3; // Base profit margin 

    // Adjust profit margin based on guide needed or not
    if (guideYesCB.checked) {
        if (yathraGuideCB.checked) {
            profitMargin += 0.05;                     // Internal guide = 5% 
        } else if (rentalGuideCB.checked) {
            profitMargin += 0.08;                    // External guide = 8% 
        }
    }

    // Adjust profit margin based on driver
    if (yathraDriverCB.checked) {
        if (yathraGuideCB.checked) {
            profitMargin += 0.00;                     // Internal vehicle = already included in package 
        } else if (rentalDriverCB.checked) {
            profitMargin += 0.08;                    // External vehicle = 8% 
        }
    }

    // Adjust profit margin based on vehicle
    if (yathraVehiCB.checked) {
        profitMargin += 0.00;               // internal vehicle = already included in package
    } else if (rentalVehiCB.checked) {
        profitMargin += 0.05;                //external vehicle = 5%
    }

    console.log(profitMargin);
}

//for first 2 radio buttons
//CALCUATE WALA values unbind wennath one💥💥💥
const changesDependTypeOri = () => {

    //if a custom package
    if (customTP.checked) {
        tourpkg.iscustompkg = true;

        // add
        tpDescRow.classList.add('d-none');
        imageAddSection.classList.add('d-none');

        // remove
        basedInqSection.classList.remove('d-none');
        accordionForTPKGCosts.classList.remove('d-none');
        datesSection.classList.remove('d-none');
        numberOfTravellersSection.classList.remove('d-none');
        checkAvailabilitySection.classList.remove('d-none');

        //unbind if previously binded values are exist
        tourpkg.description = null;
        tourpkg.img1 = null;
        tourpkg.img2 = null;
        tourpkg.img3 = null;
        tourpkg.img4 = null;

        //refresh border colours + remove frontend values
        tpDescription.style.border = "1px solid #ced4da";
        tpkgBasedInquiry.value = '';

        calcTotalDayCount();


        //if a package is for show in website
    } else if (forWebSite.checked) {
        tourpkg.iscustompkg = false;

        // remove
        tpDescRow.classList.remove('d-none');
        imageAddSection.classList.remove('d-none');

        // add
        accordionForTPKGCosts.classList.add('d-none');
        basedInqSection.classList.add('d-none');
        datesSection.classList.add('d-none');
        numberOfTravellersSection.classList.add('d-none');
        checkAvailabilitySection.classList.add('d-none');


        //unbind if previously binded values are exist
        tourpkg.basedinquiry = null;
        tourpkg.tourstartdate = null;
        tourpkg.localadultcount = null;
        tourpkg.localchildcount = null;
        tourpkg.foreignadultcount = null;
        tourpkg.foreignchildcount = null;
        tourpkg.vehicletype = null;

        //borders refresh karanna
        tpkgBasedInquiry.style.border = "1px solid #ced4da";
        tpStartDateInput.style.border = "1px solid #ced4da";
        tpEndDateInput.style.border = "1px solid #ced4da";
        tpkgLocalAdultCount.style.border = "1px solid #ced4da";
        tpkgLocalChildCount.style.border = "1px solid #ced4da";
        tpkgForeignAdultCount.style.border = "1px solid #ced4da";
        tpkgForeignChildCount.style.border = "1px solid #ced4da";
        tpkgVehitype.style.border = "1px solid #ced4da";

        tpkgBasedInquiry.value = '';
        tpStartDateInput.value = '';
        tpEndDateInput.value = '';
        tpkgLocalAdultCount.value = 0;
        tpkgLocalChildCount.value = 0;
        tpkgForeignAdultCount.value = 0;
        tpkgForeignChildCount.value = 0;
        tpkgVehitype.value = '';


    }
}

const previewImage = (imageNumber) => {
    const input = document.getElementById(`img${imageNumber}`);
    const preview = document.getElementById(`previewImg${imageNumber}`);

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
}

//vehicle check karna eka call wenna one type input field ekedi 💥💥💥💥
const checkInternalDriverAvailability = () => {
    let startDate = tpStartDateInput.value;
    let lastDate = tpEndDateInput.value;

    const availableDriversList = ajaxGetRequest("emp/availabledriver/" + startDate + "/" + lastDate)

    console.log(availableDriversList);

    let availableDriversCount = availableDriversList.length;
    
    showAvailableDriverList.innerText = availableDriversCount;

}

const checkInternalGuideAvailability = () => {
    let startDate = tpStartDateInput.value;
    let lastDate = tpEndDateInput.value;
    const availableGuidesList = ajaxGetRequest("emp/availableguide/" + startDate + "/" + lastDate)
    let availableGuidesCount = availableGuidesList.length;
    showAvailableGuideList.innerText = availableGuidesCount;
}

//get available vehi list
const checkCompanyVehiAvailability = () => {
    let startDate = tpStartDateInput.value;
    let lastDate = tpEndDateInput.value;

    let selectedOption = JSON.parse(tpkgVehitype.value);
    let vehitype = selectedOption.id;

    console.log('vehitype', vehitype);

    const availableVehiList = ajaxGetRequest("vehi/availablevehiclesbyvehitype/" + startDate + "/" + lastDate + "/" + vehitype)
    let availableVehiCount = availableVehiList.length;
    showAvailableVehiList.innerText = availableVehiCount;

}

//get fDs by inquiry
const getDayPlansByGivenInquiry = () => {
    const selectedInq = JSON.parse(tpkgBasedInquiry.value).inqcode;

    startDayPlansByInq = ajaxGetRequest('/dayplan/onlyfirstdays/' + selectedInq);
    fillDataIntoSelect(tpStartDaySelect, 'Please Select The First Day', startDayPlansByInq, 'dayplancode');

    lastDayPlansByInq = ajaxGetRequest('/dayplan/onlylastdays/' + selectedInq);
    fillDataIntoSelect(tpEndDaySelect, 'Please Select The Last day', lastDayPlansByInq, 'dayplancode');

    // normalDayPlansListByInq = ajaxGetRequest('/dayplan/onlymiddays' + selectedInq)
    // fillDataIntoSelect(selectTag, 'Please Select Dayplan', normalDayPlansListByInq, 'dayplancode');
}

const viewTP = (rowOb, rowIndex) => {

    //open view details
    $('#tourPackageViewModal').modal('show');

    viewPName.innerHTML = rowOb.packagename;
    viewPCode.innerHTML = rowOb.packagecode;
    // viewSDate.innerHTML = rowOb.tourstartdate;
    // viewEDate.innerHTML = rowOb.tourenddate;//hari property set krgnnd
    // viewTCount.innerHTML = rowOb.totalcount;//mekath
    viewDescri.innerHTML = rowOb.description;
    viewTPrice.innerHTML = rowOb.totalprice;//mekath
    viewAddDate.innerHTML = rowOb.addeddatetime.split("T")[0] + " " + rowOb.addeddatetime.split("T")[1];
    viewNote.innerHTML = rowOb.note;
}

const btnPrintRow = () => {
    console.log("print");

    let newWindow = window.open();
    newWindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resources/bootstrap-5.2.3/css/bootstrap.min.css'></link>" +
        "<title>" + "Tour Package Details" + "</title>"
        + "</head><body>" +
        printTourPackageTable.outerHTML + "<script>printTourPackageTable.classList.remove('d-none');</script></body></html>"
    );

    setTimeout(() => {
        newWindow.stop();//table ek load wena ek nawathinw
        newWindow.print();//table ek print weno
        newWindow.close();//aluthin open una window tab ek close weno
        //ar data load wenn nm  time out ekk oni weno aduma 500k wth
    }, 500)
}

//    <link rel="stylesheet" href="resources/bootstrap-5.2.3/css/bootstrap.min.css">
// src/main/resources/static/resources/images/yathra_logo.ico

