window.addEventListener('load', () => {

    buildTpkgTable();
    refreshTpkgForm();
    refreshAddiCostForm();
    fetchPriceMods();

});

//global var to store id of the table
let sharedTableIdForTpkg = "mainTableTpkg";

//declared globally because needed for filterings
let allItineraryTemplates = [];

//clear out the form everytime a user switches to table tab   
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTabTpkg').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshTpkgForm();
        }
    });
});

// 💥💥💥
const resetModalTpkg = () => {
    console.log("Resetting modal form");
}

//handle the creation method radio buttons NOT USED 💥💥💥
const handleCeationMethodSelect = () => {
    const fromScratch = document.getElementById('createFromScratch');
    const fromInq = document.getElementById('createFromInquiry');

    // track which option was selected BEFORE reset
    const selectedMethod = fromScratch.checked ? 'scratch' : fromInq.checked ? 'inquiry' : null;

    const hasExistingData =
        tpkg.pkgtitle != null ||
        tpkg.sd_dayplan_id?.id != null ||
        tpkg.dayplans?.length > 0 ||
        tpkg.web_description != null ||
        tpkg.img1 != null ||
        tpkg.img2 != null ||
        tpkg.img3 != null;

    if (hasExistingData) {
        const userConfirm = confirm("Changing the creation method will reset all current data. Do you want to continue?");
        if (userConfirm) {

            refreshTpkgForm();

            // re-check the user's original choice
            if (selectedMethod === 'scratch') {
                document.getElementById('createFromScratch').checked = true;
            } else if (selectedMethod === 'inquiry') {
                document.getElementById('createFromInquiry').checked = true;
            }

            // apply changes based on the selection
            elementChangesOnCreationMethod();
        }
    } else {
        elementChangesOnCreationMethod();
    }
};

//NOT USED 💥💥💥
const elementChangesOnCreationMethod = () => {
    const fromScratch = document.getElementById('createFromScratch');
    const fromInq = document.getElementById('createFromInquiry');
    const selectBasedInq = document.getElementById('tpkgBasedInq');
    const forWebSiteRadio = document.getElementById('forWebSite');

    if (fromScratch.checked) {
        selectBasedInq.disabled = true;
        selectBasedInq.value = "";
        selectBasedInq.style.border = "1px solid #ced4da";
        forWebSiteRadio.disabled = false;
        tpkg.basedinq = null;
    } else if (fromInq.checked) {
        selectBasedInq.disabled = false;
        forWebSiteRadio.disabled = true;
    }

}

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

        createTable(tableTpkgHolderDiv, sharedTableIdForTpkg, tpkgs, tableColumnInfo);

        $(`#${sharedTableIdForTpkg}`).dataTable();

    } catch (error) {
        console.error("Failed to build table:", error);
    }
}

//to support fill main table   
const showTpkgType = (tpkgObj) => {
    if (!tpkgObj.is_custompkg) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #007bff; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Template Package
            </p>`;
    } else {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #17a2b8; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Custom Package
            </p>`;
    }
}

//to support fill main table  
const showTpkgStatus = (tpkgObj) => {

    if (tpkgObj.deleted_tpkg == null || tpkgObj.deleted_tpkg === false) {

        if (tpkgObj.tpkg_status === "Draft") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Draft
                </p>`;
        }

        else if (tpkgObj.tpkg_status === "Completed") {
            return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
            style="background-color: #28a745; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            Completed
         </p>`;
        }

        else if (tpkgObj.tpkg_status === "Inactive") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #6c757d; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Inactive
                </p>`;
        }

    } else if (tpkgObj.deleted_tpkg != null && tpkgObj.deleted_tpkg === true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
}

//to clear the day plan info section 
const resetDayPlanInfoSection = () => {

    document.getElementById('tempInfoDisRow').classList.add('d-none');
    document.getElementById('dpInfoIsTemplate').innerText = '';

    // Reset all <span> elements to 'N/A'
    document.getElementById('dpInfoCode').innerText = 'N/A';
    document.getElementById('dpInfoTitle').innerText = 'N/A';
    document.getElementById('dpInfoStartLocation').innerText = 'N/A';
    document.getElementById('dpInfoLunchPlace').innerText = 'N/A';
    document.getElementById('dpInfoDropPoint').innerText = 'N/A';
    document.getElementById('dpInfoNote').innerText = 'N/A';

    const placesList = document.getElementById('dpInfoPlaces');
    placesList.innerHTML = '<li>N/A</li>';

    document.getElementById('dayPlanInfoEditBtn').disabled = true;
};

let onlyFirstDays = [];
let onlyLastDays = [];
let onlyMidDays = [];

//to ready the main form   
const refreshTpkgForm = async () => {

    tpkg = new Object();
    tpkg.dayplans = new Array();
    tpkg.addiCostList = new Array();
    document.getElementById('formTpkg').reset();

    try {
        const vehiTypes = await ajaxGetReq("/vehitypes/all");
        fillDataIntoDynamicSelects(tpkgVehitype, 'Select Vehicle Type', vehiTypes, 'name');

    } catch (error) {
        console.error("Failed to fetch form data vehicles:", error);
    }

    const loggedEmpId = document.getElementById('loggedUserEmpIdSectionId').textContent;
    console.log(loggedEmpId);

    try {
        const allActiveInqs = await ajaxGetReq("/inq/personal/active?empid=" + loggedEmpId);
        fillMultDataIntoDynamicSelects(tpkgBasedInq, 'Please select based inquiry', allActiveInqs, 'inqcode', 'clientname')
    } catch (error) {
        console.error("Failed to fetch form data inquiries:", error);
    }

    //get first days only
    try {
        onlyFirstDays = await ajaxGetReq("/dayplan/onlyfirstdays");
    } catch (error) {
        console.error('Error fetching first days:', error);
    }

    //get last days only
    try {
        onlyLastDays = await ajaxGetReq("/dayplan/onlylastdays");
    } catch (error) {
        console.error('Error fetching last days:', error);
    }

    //get mid days only
    try {
        onlyMidDays = await ajaxGetReq("/dayplan/onlymiddays");
    } catch (error) {
        console.error('Error fetching mid days:', error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputPkgTitle',
        'inputPkgCode',
        'tpStartDateInput',
        'tpDescription',
        'showTotalKMCount',
        'tpkgBasedInq',
        'showTotalDaysCount',
        'tpkgFirstDaySelect',
        'tpkgFinalDaySelect',
        'tpkgLocalAdultCount',
        'tpkgLocalChildCount',
        'tpkgForeignAdultCount',
        'tpkgForeignChildCount',
        'tpkgTotalTravellers',
        'tpkgVehitype',
        'totalTktCostInput',
        'totalVehicleParkingCost',
        'totalLunchCostForAll',
        'totalVehiCostInput',
        'totalStayCostInput',
        'totalDriverCostInput',
        'totalGuideCostInput',
        'totalAdditionalCosts',
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

    document.getElementById('startDateCol').classList.remove('d-none');
    document.getElementById('tpDescRow').classList.add('d-none');

    //first day
    document.getElementById('tpkgFirstDaySelect').disabled = true;
    document.getElementById('firstDayMsg').classList.add('d-none');
    document.getElementById('showFirstDayBtn').disabled = true;

    //mid days
    document.getElementById('addNewDaysBtn').disabled = true;
    document.getElementById('tpkgMidDaysSelectSection').innerHTML = '';
    //template msg for each day 💥💥💥

    //final day
    document.getElementById('tpkgFinalDaySelect').disabled = true;
    document.getElementById('finalDayMsg').classList.add('d-none');
    document.getElementById('showFinalDayBtn').disabled = true;
    document.getElementById('removeFinalDayBtn').disabled = true;
    document.getElementById('finalDaySelectUseTempsBtn').disabled = true;
    document.getElementById('finalDaySelectUseExistingBtn').disabled = true;

    //show dayplan info section
    document.getElementById('dayPlanInfoEditBtn').disabled = true;
    resetDayPlanInfoSection();

    const localChildInput = document.getElementById('tpkgLocalChildCount');
    const foreignChildInput = document.getElementById('tpkgForeignChildCount');

    localChildInput.disabled = true;
    foreignChildInput.disabled = true;

    document.getElementById('tourStartDateDisplay').innerText = 'Start Date Not Selected';
    document.getElementById('tourEndDateDisplay').innerText = 'Please Add Day Plans';

    document.getElementById('tpkgLocalAdultCount').value = 0;
    document.getElementById('tpkgLocalChildCount').value = 0;
    document.getElementById('tpkgForeignAdultCount').value = 0;
    document.getElementById('tpkgForeignChildCount').value = 0;

    document.getElementById('tpkgLocalAdultCount').value = 0;
    localChildInput.value = 0;
    document.getElementById('tpkgForeignAdultCount').value = 0;
    foreignChildInput.value = 0;

    //additional cost add btn
    document.getElementById('addCostAddBtn').disabled = false;

    //radio tags to reset
    const radioIdsToReset = [
        'customTP',
        'forWebSite',
        'yathraVehiCB',
        'rentalVehiCB',
        'yathraDriverCB',
        'rentalDriverCB',
        'guideYes',
        'guideNo',
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

    //keep these 2 below the radioIdsToReset
    document.getElementById('yathraGuideCB').disabled = true;
    document.getElementById('rentalGuideCB').disabled = true;

    //total costs section 
    document.getElementById('totalTktCostGroup').classList.add('d-none');
    document.getElementById('totalTktCostMsg').classList.remove('d-none');

    document.getElementById('totalVehiParkCostGroup').classList.add('d-none');
    document.getElementById('totalVehicleParkingCostMsg').classList.remove('d-none');

    document.getElementById('totalLunchCostGroup').classList.add('d-none');
    document.getElementById('totalLunchCostMsg').classList.remove('d-none');

    document.getElementById('totalVehiCostGroup').classList.add('d-none');
    document.getElementById('totalVehicleCostMsg').classList.remove('d-none');

    document.getElementById('totalStayCostGroup').classList.add('d-none');
    document.getElementById('totalStayCostMsg').classList.remove('d-none');

    document.getElementById('totalDriverCostGroup').classList.add('d-none');
    document.getElementById('totalDriverCostMsg').classList.remove('d-none');

    document.getElementById('totalGuideCostGroup').classList.add('d-none');
    document.getElementById('totalGuideCostMsg').classList.remove('d-none');

    document.getElementById('finalTotalCost').value = '';
    const pkgFinalPriceShowInput = document.getElementById('pkgFinalPrice');

    pkgFinalPriceShowInput.value = '';
    pkgFinalPriceShowInput.style.border = "1px solid #ced4da";

    document.getElementById("additionalCostTableBody").innerHTML = "";

    showVehiAvailabilityButtons();
    showDnGAvailabilityButtons();

    document.getElementById('forWebSite').disabled = true;

    //get logged user roles
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);

    const roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    if (roles.includes("System_Admin") || roles.includes("Manager")) {
        document.getElementById('forWebSite').disabled = false;
    }

    const updateBtn = document.getElementById('tpkgUpdateBtn');
    updateBtn.disabled = true;
    updateBtn.style.cursor = "not-allowed";

    //set the min start date to 7 days future
    setTpkgStartDateToFuture();

}

//handle refill tpkg data from inquiry
const fillDataFromInq = async () => {
    if (tpkg.basedinq?.id != null) {

        if (tpkg.basedinq.inq_apprx_start_date != null && tpkg.basedinq.is_startdate_confirmed == true) {
            document.getElementById('tpStartDateInput').value = tpkg.basedinq.inq_apprx_start_date;
        }

        document.getElementById('tpkgLocalAdultCount').value = tpkg.basedinq.inq_local_adults || 0;
        document.getElementById('tpkgLocalChildCount').value = tpkg.basedinq.inq_local_kids || 0;
        document.getElementById('tpkgForeignAdultCount').value = tpkg.basedinq.inq_foreign_adults || 0;
        document.getElementById('tpkgForeignChildCount').value = tpkg.basedinq.inq_foreign_kids || 0;

        if (tpkg.basedinq.inq_guideneed != null && tpkg.basedinq.inq_guideneed == true) {
            document.getElementById('guideYes').checked = true;
            console.log("guideYes");
        } else if (tpkg.basedinq.inq_guideneed != null && tpkg.basedinq.inq_guideneed == false) {
            document.getElementById('guideNo').checked = true;
            console.log("guideNo");
        }

        //if needed to show the result in an empty array
        //const emptyArray = [];
        //emptyArray.push(interestedTemplatePkg.sd_dayplan_id); 

        if (tpkg.basedinq.intrstdpkgid != null) {

            const interestedTemplatePkg = await ajaxGetReq("/tpkg/byid?tpkgId=" + tpkg.basedinq.intrstdpkgid);

            //for first day
            const fdSelect = document.getElementById('tpkgFirstDaySelect');
            fdSelect.disabled = true;
            fillDataIntoDynamicSelects(fdSelect, 'please select', onlyFirstDays, 'daytitle', interestedTemplatePkg.sd_dayplan_id.daytitle);
            handleFirstDayChange(tpkgFirstDaySelect);

            //for final day
            const ldSelect = document.getElementById('tpkgFinalDaySelect');
            ldSelect.disabled = true;
            fillDataIntoDynamicSelects(ldSelect, 'please select', onlyLastDays, 'daytitle', interestedTemplatePkg.ed_dayplan_id.daytitle);
            //showFinalDayBtn.disabled = false;
            //finalDayMsg.classList.remove('d-none');
            handleFinalDayChange(tpkgFinalDaySelect);

            //for middays
            const intrstdPkgMidDays = interestedTemplatePkg.dayplans

            for (let i = 0; i < intrstdPkgMidDays.length; i++) {
                const dayPlan = intrstdPkgMidDays[i];

                //created once per loop element
                generateNormalDayPlanSelectSections();

                const midDaySelectId = `tpkgMidDaySelect${i + 1}`;
                const selectElement = document.getElementById(midDaySelectId);

                selectElement.disabled = false;

                fillDataIntoDynamicSelects(
                    selectElement,
                    'Please Select',
                    onlyMidDays,
                    'daytitle',
                    dayPlan.daytitle
                );

                tpkg.dayplans[i] = dayPlan;

                document.getElementById(`showMidDayBtn${i + 1}`).disabled = false;
                document.getElementById(`midDayDeleteBtn${i + 1}`).disabled = false;

                if (tpkg.dayplans[i].is_template) {
                        console.log("a template");
                }
            }





        }
    }
}

//to handle the reset button click in the form
const handlePkgReset = () => {
    let userConfirm = confirm("Are you sure you want to reset the form? All unsaved data will be lost.");
    if (userConfirm) {
        refreshTpkgForm();
    } else {
        showAlertModal('inf', "Reset Cancelled");
    }
}

//set status auto
//think new values 💥💥💥
const setTpkgStatus = () => {
    const tpkgStatusSelectElement = document.getElementById('tpSelectStatus');
    tpkg.tpkg_status = "Draft";
    tpkgStatusSelectElement.value = "Draft";
    tpkgStatusSelectElement.style.border = "2px solid lime";
    tpkgStatusSelectElement.children[2].classList.add('d-none');
    tpkgStatusSelectElement.children[3].classList.add('d-none');
    tpkgStatusSelectElement.children[4].classList.add('d-none');
    //tpkgStatusSelectElement.children[5].classList.add('d-none');
}

//set the start date to 7 days future   
const setTpkgStartDateToFuture = () => {

    const dateInput = document.getElementById('tpStartDateInput');

    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 7));
    const formattedDate = minDate.toISOString().split('T')[0];
    dateInput.setAttribute('min', formattedDate);

}

//for first 2 radio buttons to choose package type   
const changesTpkgCustomOrTemp = () => {

    const selectBasedInq = document.getElementById('tpkgBasedInq');

    //if a custom package
    if (customTP.checked) {

        tpkg.is_custompkg = true;

        //enable selecting based inq
        selectBasedInq.disabled = false;

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

        //if a package is for show in website
    } else if (forWebSite.checked) {

        tpkg.is_custompkg = false;

        //disable selecting based inq
        selectBasedInq.disabled = true;
        selectBasedInq.value = '';
        selectBasedInq.style.border = '1px solid #ced4da';
        tpkg.basedinq = null

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
        tpkg.totaldays = null;
        tpkg.totaltktcost = null;
        tpkg.totallunchcost = null;
        tpkg.totalvehiparkingcost = null;
        tpkg.totalvehicost = null;
        tpkg.totalstaycost = null;
        tpkg.pkgcostsum = null;
        tpkg.pkgfinalprice = null;
        tpkg.is_guide_needed = null;
        tpkg.is_company_guide = null;
        tpkg.is_company_vehicle = null;
        tpkg.is_company_driver = null;
        tpkg.pref_vehi_type = null;

        // Array of input field IDs to reset
        const inputTagsIds = [

            'tpStartDateInput',
            'tpDescription',
            'tpkgLocalAdultCount',
            'tpkgLocalChildCount',
            'tpkgForeignAdultCount',
            'tpkgForeignChildCount',
            'tpkgVehitype',
            'tpkgTotalTravellers',
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

        const radioIdsToReset = [
            'yathraVehiCB',
            'rentalVehiCB',
            'yathraDriverCB',
            'rentalDriverCB',
            'guideYes',
            'guideNo',
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

        document.getElementById('tpkgLocalAdultCount').value = 0;
        document.getElementById('tpkgLocalChildCount').value = 0;
        document.getElementById('tpkgForeignAdultCount').value = 0;
        document.getElementById('tpkgForeignChildCount').value = 0;

        document.getElementById('showAvailableVehiCount').innerText = '';
        document.getElementById('showAvailableDriverCount').innerText = '';
        document.getElementById('showAvailableGuideCount').innerText = '';

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

// common debounce to delay the execution of a function    
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// to get vehicle types by minimum seats based on total travellers  
const getVehicleTypesByMinSeats = async () => {
    const totalTravellers = parseInt(document.getElementById('tpkgTotalTravellers').value) || 0;
    const vehitypeSelect = document.getElementById('tpkgVehitype');

    vehitypeSelect.value = "";
    vehitypeSelect.disabled = false;
    vehitypeSelect.style.border = '1px solid #ced4da';

    yathraVehiCB.disabled = false;
    rentalVehiCB.checked = false;

    //reset the available vehicle count message
    document.getElementById('showAvailableVehiCount').innerText = "";

    try {
        const vehicleTypes = await ajaxGetReq("vehicletypes/byminseats/" + totalTravellers);

        if (vehicleTypes.length === 0) {

            vehitypeSelect.style.border = '2px solid lime';
            vehitypeSelect.disabled = true;
            vehitypeSelect.innerHTML = "<option selected disabled>Requires Multiple External Vehicles</option>";
            tpkg.pref_vehi_type = "Requires multiple vehicles";

            rentalVehiCB.checked = true;
            yathraVehiCB.disabled = true;

            //check vehicel availability query+function doesnt need to run 
            const msgElement = document.getElementById('showAvailableVehiCount');
            msgElement.classList.add('text-danger');
            msgElement.innerText = "No Company Vehicles Available";

        } else {

            fillDataIntoDynamicSelects(
                vehitypeSelect,
                " Please Select Vehicle Type ",
                vehicleTypes, 'name'
            );
        }

        console.log("getVehicleTypesByMinSeats ran with traveller count: " + totalTravellers);
    } catch (error) {
        console.error("Failed to fetch vehicle types:", error);
    }
};

// debounced version to limit query calls  
const debouncedGetVehicleTypesByMinSeats = debounce(getVehicleTypesByMinSeats, 300);

// to calculate total travellers  
const updateTotalTravellers = () => {
    const localAdult = parseInt(document.getElementById('tpkgLocalAdultCount').value) || 0;
    const localChild = parseInt(document.getElementById('tpkgLocalChildCount').value) || 0;
    const foreignAdult = parseInt(document.getElementById('tpkgForeignAdultCount').value) || 0;
    const foreignChild = parseInt(document.getElementById('tpkgForeignChildCount').value) || 0;

    const total = localAdult + localChild + foreignAdult + foreignChild;

    document.getElementById('tpkgTotalTravellers').value = total;

    //function to update the predered vehicle type select input
    debouncedGetVehicleTypesByMinSeats();

}

// to save guide need or not  
const handleNeedGuideCB = () => {

    if (guideYes.checked) {

        tpkg.is_guide_needed = true;
        yathraGuideCB.disabled = false;
        rentalGuideCB.disabled = false;

        tpkg.is_company_guide = null;
        yathraGuideCB.checked = false;
        rentalGuideCB.checked = false;

    } else if (guideNo.checked) {

        tpkg.is_guide_needed = false;
        yathraGuideCB.disabled = true;
        rentalGuideCB.disabled = true;

        tpkg.is_company_guide = null;
        rentalGuideCB.checked = false;
        yathraGuideCB.checked = false;

    }
}

//function to save vehicle source  
const handleVehicleSourceChange = () => {

    if (yathraVehiCB.checked) {
        tpkg.is_company_vehicle = true;
    } else if (rentalVehiCB.checked) {
        tpkg.is_company_vehicle = false;
    }

}

//function to flag which driver source is selected  
const handleDriverSourceChange = () => {

    if (yathraDriverCB.checked) {
        tpkg.is_company_driver = true;
    } else if (rentalDriverCB.checked) {
        tpkg.is_company_driver = false;
    }

}

// function to flag which guide source is selected  
const handleGuideSourceChange = () => {
    if (yathraGuideCB.checked) {
        tpkg.is_company_guide = true;
    } else if (rentalGuideCB.checked) {
        tpkg.is_company_guide = false;
    }
}

// to reset data in dynamic selects  
const resetSelectElements = (selectElement, defaultText = "Please Select") => {
    selectElement.disabled = false;
    selectElement.innerHTML = '';
    const defaultOption = document.createElement("option");
    defaultOption.text = defaultText;
    defaultOption.value = "";
    selectElement.add(defaultOption);
}

//
//    if (selectElementId.id.startsWith("tpkgMidDaySelect")) {
//        const index = getMidDayIndexFromSelect(selectElementId);
//        if (index >= 0) {
//            console.log(`Clearing tpkg.dayplans[${index}] for select ${selectElementId.id}`);
//            tpkg.dayplans[index] = null;
//            console.log("Updated tpkg.dayplans after template load:", tpkg.dayplans);
//            
//            const selectNumber = selectElementId.id.replace('tpkgMidDaySelect', '');
//            document.getElementById(`showMidDayBtn${selectNumber}`).disabled = true;
//            document.getElementById(`midDayDeleteBtn${selectNumber}`).disabled = true;
//        }
//    }

const getMidDayIndexFromSelect = (selectEl) => {
    const labelText = selectEl.closest('.row').querySelector('label').innerText;
    return parseInt(labelText.split(" ")[2]) - 1;
};



// to handle first day changes  
const handleFirstDayChange = (selectElement) => {

    dynamicSelectValidator(selectElement, 'tpkg', 'sd_dayplan_id');
    showFirstDayBtn.disabled = false;
    const fdMsg = document.getElementById('firstDayMsg');

    if (tpkg.sd_dayplan_id.is_template) {
        selectElement.style.border = "2px solid orange";
        fdMsg.classList.remove('d-none');
        tpkg.sd_dayplan_id = null;
        addNewDaysBtn.disabled = true;
    } else {
        selectElement.style.border = "2px solid lime";
        fdMsg.classList.add('d-none');
        addNewDaysBtn.disabled = false;
        finalDaySelectUseTempsBtn.disabled = false;
        finalDaySelectUseExistingBtn.disabled = false;
        updateTotalDaysCount();
    }

    showTotalKmCount();

}

//💥💥💥
//refreshMainCostCard();

// to handle last day changes  
const handleFinalDayChange = (selectElement) => {

    dynamicSelectValidator(selectElement, 'tpkg', 'ed_dayplan_id');
    showFinalDayBtn.disabled = false;
    removeFinalDayBtn.disabled = false;
    showTotalKmCount();

    const finalDMsg = document.getElementById('finalDayMsg');

    if (tpkg.ed_dayplan_id.is_template) {
        selectElement.style.border = "2px solid orange";
        finalDMsg.classList.remove('d-none');
        tpkg.ed_dayplan_id = null;
    } else {
        selectElement.style.border = "2px solid lime";
        finalDMsg.classList.add('d-none');
        finalDaySelectUseTempsBtn.disabled = false;
        finalDaySelectUseExistingBtn.disabled = false;
        updateTotalDaysCount();
    }

    // 💥💥💥
    // refreshMainCostCard();
};

// fn to calculate the total days count of the tour package 
const updateTotalDaysCount = () => {

    let total = 0;

    // add 1 if start dayplan is selected
    if (tpkg.sd_dayplan_id?.id != null) {
        total += 1;
    }

    // add 1 if end dayplan is selected
    if (tpkg.ed_dayplan_id?.id != null) {
        total += 1;
    }

    // add number of middle day plans
    tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);
    if (tpkg.dayplans && Array.isArray(tpkg.dayplans)) {
        total += tpkg.dayplans.length;
    }

    document.getElementById('showTotalDaysCount').value = total;
    tpkg.totaldays = total;

    updateTourEndDate();
    showDnGAvailabilityButtons();
    showVehiAvailabilityButtons();
};

//💥💥💥
//for every change in selected days,number of travellers,dates the main cost card must be refreshed
const refreshMainCostCard = () => {
    //and also show a hidden msg
}

// to fetch all price modifiers and store them globally 
let globalPriceMods = null;
const fetchPriceMods = async () => {
    try {
        const pricemods = await ajaxGetReq("/pricemods/all");
        globalPriceMods = pricemods;
    } catch (error) {
        console.error("Failed to load price modifiers:", error);
    }
};

//to calculate the total costs of the tour package 
const calculateMainCosts = () => {

    calcTotalVehiParkingfeeTpkg();
    calcTotalTktCosts();
    calcTotalLunchCost();
    calcTotalStayCost();
    calcVehicleCosts();
    calcTotalDriverCost();
    if (tpkg.is_guide_needed && guideYes.checked) {
        calcTotalGuideCost();
    }

    calcTotalCostSum();

}

//calc sum of all costs
const calcTotalCostSum = () => {
    const total =
        (tpkg.totalvehiparkingcost || 0) +
        (tpkg.totaltktcost || 0) +
        (tpkg.totallunchcost || 0) +
        (tpkg.totalstaycost || 0) +
        (tpkg.totalvehicost || 0) +
        (tpkg.totaldrivercost || 0) +
        (tpkg.totalguidecost || 0) +
        (tpkg.totaladditionalcosts || 0);

    tpkg.pkgcostsum = parseFloat(total.toFixed(2));
    document.getElementById('finalTotalCost').value = total.toFixed(2);

    calcFinalPrice();
}

// calc final price of the tour package (profit margin added)
const calcFinalPrice = () => {
    const profitMargin = parseFloat(globalPriceMods.company_profit_margin) || 0;

    const cost = parseFloat(tpkg.pkgcostsum);
    const profit = cost * (profitMargin / 100);
    const rawFinalPrice = cost + profit;

    const finalPrice = Math.ceil(rawFinalPrice / 100) * 100;
    const finalPriceRounded = parseFloat(finalPrice.toFixed(2));

    tpkg.pkgfinalprice = finalPriceRounded;
    const finalPriceInput = document.getElementById('pkgFinalPrice');
    finalPriceInput.value = finalPriceRounded.toFixed(2);
    finalPriceInput.style.border = "2px solid lime";

    console.log("Final price calculated: " + finalPriceRounded);
};

// update total km count of the tour package
const showTotalKmCount = () => {

    tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);

    //first day
    const kmCountFD = tpkg.sd_dayplan_id?.totalkmcount || 0;

    //last day
    let kmCountLD = 0;
    if (tpkg.ed_dayplan_id) {
        kmCountLD = tpkg.ed_dayplan_id.totalkmcount || 0;
    }

    //mid days
    let kmCountMD = 0;
    if (tpkg.dayplans.length > 0) {
        tpkg.dayplans.forEach((day) => {
            kmCountMD = kmCountMD + (day.totalkmcount || 0);
        })
    }

    const sumKM = kmCountFD + kmCountLD + kmCountMD;
    const inputTotalKm = document.getElementById('showTotalKMCount');
    tpkg.totalkmcountofpkg = sumKM;
    inputTotalKm.value = sumKM;

}

// calc total cost for driver
const calcTotalDriverCost = () => {

    if (!globalPriceMods) {
        console.warn("Price modifiers not loaded.");
        return;
    }

    const yathraDriver = document.getElementById('yathraDriverCB');
    const rentedDriver = document.getElementById('rentalDriverCB');
    const totalDaysInput = document.getElementById('showTotalDaysCount');
    const totalDays = parseInt(totalDaysInput.value) || 0;

    const costInput = document.getElementById('totalDriverCostInput');
    const driverCostLabel = document.querySelector('label[for="totalDriverCostInput"]');
    const driverCostGroup = document.getElementById('totalDriverCostGroup');
    const totalDriverCostMsg = document.getElementById('totalDriverCostMsg');

    // Hide cost input group and show message initially
    driverCostGroup.classList.add("d-none");
    totalDriverCostMsg.classList.remove("d-none");
    costInput.value = "";
    tpkg.totaldrivercost = null;

    // Check if a driver source is selected and total days is valid
    if ((!yathraDriver.checked && !rentedDriver.checked) || totalDays <= 0) {
        totalDriverCostMsg.classList.remove("d-none");
        return;
    }

    let driverDailyCharge = 0;

    if (yathraDriver.checked) {
        driverDailyCharge = parseFloat(globalPriceMods.int_driver_daily_cost) || 0;
        driverCostLabel.innerText = "For Driver (Company Driver):";
    } else if (rentedDriver.checked) {
        driverDailyCharge = parseFloat(globalPriceMods.ext_driver_daily_charge) || 0;
        driverCostLabel.innerText = "For Driver (Rented Driver):";
    }

    const totalDriverCost = driverDailyCharge * totalDays;
    costInput.value = totalDriverCost.toFixed(2);
    tpkg.totaldrivercost = parseFloat(totalDriverCost.toFixed(2));

    driverCostGroup.classList.remove("d-none");
    totalDriverCostMsg.classList.add("d-none");

    console.log("Total driver cost calculated: " + tpkg.totaldrivercost);
}

// calc total guide cost
const calcTotalGuideCost = () => {

    if (!globalPriceMods) {
        console.warn("Price modifiers not loaded.");
        return;
    }

    const yathraGuide = document.getElementById('yathraGuideCB');
    const rentedGuide = document.getElementById('rentalGuideCB');
    const totalDaysInput = document.getElementById('showTotalDaysCount');
    const totalDays = parseInt(totalDaysInput.value) || 0;

    const costInput = document.getElementById('totalGuideCostInput');
    const guideCostLabel = document.querySelector('label[for="totalGuideCostInput"]');
    const guideCostGroup = document.getElementById('totalGuideCostGroup');
    const totalGuideCostMsg = document.getElementById('totalGuideCostMsg');

    guideCostGroup.classList.add("d-none");
    totalGuideCostMsg.classList.remove("d-none");
    costInput.value = "";
    tpkg.totalguidecost = null;

    if ((!yathraGuide.checked && !rentedGuide.checked) || totalDays <= 0) {
        totalGuideCostMsg.classList.remove("d-none");
        return;
    }

    let guideDailyCharge = 0;

    if (yathraGuide.checked) {
        guideDailyCharge = parseFloat(globalPriceMods.int_guide_daily_cost) || 0;
        guideCostLabel.innerText = "For Guide (Company Guide):";
    } else if (rentedGuide.checked) {
        guideDailyCharge = parseFloat(globalPriceMods.ext_guide_daily_charge) || 0;
        guideCostLabel.innerText = "For Guide (Rented Guide):";
    }

    const totalGuideCost = guideDailyCharge * totalDays;
    costInput.value = totalGuideCost.toFixed(2);
    tpkg.totalguidecost = parseFloat(totalGuideCost.toFixed(2));

    guideCostGroup.classList.remove("d-none");
    totalGuideCostMsg.classList.add("d-none");

    console.log("Total guide cost calculated: " + tpkg.totalguidecost);
};

//to calculate the total vehicle cost
const calcVehicleCosts = () => {
    const kmCountForPkg = parseFloat(document.getElementById('showTotalKMCount').value) || 0;
    const yathraVehi = document.getElementById('yathraVehiCB');
    const rentedVehi = document.getElementById('rentalVehiCB');
    const preferedVehitypeRawValue = document.getElementById('tpkgVehitype').value;

    const costInput = document.getElementById('totalVehiCostInput');
    const vehiCostLabel = document.querySelector('label[for="totalVehiCostInput"]');
    const vehiCostGroup = document.getElementById('totalVehiCostGroup');
    const totalVehiCostMsg = document.getElementById('totalVehicleCostMsg');

    vehiCostGroup.classList.add("d-none");
    totalVehiCostMsg.classList.remove("d-none");
    costInput.value = "";
    tpkg.totalvehicost = null;

    const isVehicleSourceSelected = yathraVehi.checked || rentedVehi.checked;
    const isVehitypeSelected = preferedVehitypeRawValue !== "" && preferedVehitypeRawValue !== "null";

    if (!isVehicleSourceSelected || !isVehitypeSelected || kmCountForPkg <= 0) {
        totalVehiCostMsg.classList.remove("d-none");
        return;
    }

    const preferedVehitype = JSON.parse(preferedVehitypeRawValue);
    let vehiCharge = 0;

    if (yathraVehi.checked && tpkg.is_company_vehicle === true) {
        vehiCharge = preferedVehitype.int_avg_cpkm || 0;
        vehiCostLabel.innerText = "For Vehicle(Company Vehicle):";
    } else if (rentedVehi.checked && tpkg.is_company_vehicle === false) {
        vehiCharge = preferedVehitype.ext_avg_cpkm || 0;
        vehiCostLabel.innerText = "For Vehicle(Rented Vehicle):";
    }

    const totalVehicost = vehiCharge * kmCountForPkg;
    costInput.value = totalVehicost.toFixed(2);
    tpkg.totalvehicost = parseFloat(totalVehicost.toFixed(2));

    vehiCostGroup.classList.remove("d-none");
    totalVehiCostMsg.classList.add("d-none");

    console.log("Total vehicle cost calculated: " + tpkg.totalvehicost);
};

//to calculate the total costs of the tickets/entrance 
const calcTotalTktCosts = () => {

    const localAdultCount = parseInt(document.getElementById('tpkgLocalAdultCount').value);
    const localChildCount = parseInt(document.getElementById('tpkgLocalChildCount').value);
    const foreignAdultCount = parseInt(document.getElementById('tpkgForeignAdultCount').value);
    const foreignChildCount = parseInt(document.getElementById('tpkgForeignChildCount').value);

    const totalTravellers = localAdultCount + localChildCount + foreignAdultCount + foreignChildCount;

    const tktGroup = document.getElementById("totalTktCostGroup");
    const tktInput = document.getElementById("totalTktCostInput");
    const tktMsg = document.getElementById("totalTktCostMsg");

    tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);

    const hasAtLeastOneDay =
        (tpkg.sd_dayplan_id != null) ||
        (tpkg.dayplans.length > 0) ||
        (tpkg.ed_dayplan_id != null);

    //if reqs are not present
    if (totalTravellers === 0 || !hasAtLeastOneDay) {

        tktMsg.classList.remove("d-none");
        tktGroup.classList.add("d-none");
        tktInput.value = "";
        tpkg.totaltktcost = null;
        return;
    }

    //if all reqs are present, execute below all
    tktMsg.classList.add("d-none");
    tktGroup.classList.remove("d-none");

    let totalLocalAdultCost = 0;
    let totalLocalChildCost = 0;
    let totalForeignAdultCost = 0;
    let totalForeignChildCost = 0;

    if (document.getElementById('tpkgFirstDaySelect').value !== "" &&
        tpkg.sd_dayplan_id != null) {
        totalLocalAdultCost += (tpkg.sd_dayplan_id.localadulttktcost) * localAdultCount;
        totalLocalChildCost += (tpkg.sd_dayplan_id.localchildtktcost) * localChildCount;
        totalForeignAdultCost += (tpkg.sd_dayplan_id.foreignadulttktcost) * foreignAdultCount;
        totalForeignChildCost += (tpkg.sd_dayplan_id.foreignchildtktcost) * foreignChildCount;
    }

    //check how many middle days pkg has
    if (tpkg.dayplans.length > 0) {
        tpkg.dayplans.forEach(day => {
            totalLocalAdultCost += (day.localadulttktcost) * localAdultCount;
            totalLocalChildCost += (day.localchildtktcost) * localChildCount;
            totalForeignAdultCost += (day.foreignadulttktcost) * foreignAdultCount;
            totalForeignChildCost += (day.foreignchildtktcost) * foreignChildCount;
        });
    }

    //check if tpkg has a final day
    if (document.getElementById('tpkgFinalDaySelect').value !== "" &&
        tpkg.ed_dayplan_id != null) {
        totalLocalAdultCost += (tpkg.ed_dayplan_id.localadulttktcost) * localAdultCount;
        totalLocalChildCost += (tpkg.ed_dayplan_id.localchildtktcost) * localChildCount;
        totalForeignAdultCost += (tpkg.ed_dayplan_id.foreignadulttktcost) * foreignAdultCount;
        totalForeignChildCost += (tpkg.ed_dayplan_id.foreignchildtktcost) * foreignChildCount;
    }

    //set the total costs to the input fields
    let totalTktCost = (totalLocalAdultCost + totalLocalChildCost + totalForeignAdultCost + totalForeignChildCost).toFixed(2);
    tktInput.value = totalTktCost;
    tpkg.totaltktcost = parseFloat(totalTktCost);

}

//calc total lunch cost  
const calcTotalLunchCost = () => {

    const totalTravellers = parseInt(document.getElementById('tpkgTotalTravellers').value);

    const lunchInput = document.getElementById("totalLunchCostForAll");
    const lunchGroup = document.getElementById("totalLunchCostGroup");
    const lunchMsg = document.getElementById("totalLunchCostMsg");

    tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);

    const hasItineraries =
        (tpkg.sd_dayplan_id != null) ||
        (tpkg.dayplans.length > 0) ||
        (tpkg.ed_dayplan_id != null)

    if (totalTravellers === 0 || !hasItineraries) {
        lunchMsg.classList.remove("d-none");
        lunchGroup.classList.add("d-none");
        tpkg.totallunchcost = null;
        return;
    }

    lunchMsg.classList.add("d-none");
    lunchGroup.classList.remove("d-none");

    //lunch cost for first day , for 1 person
    let lunchCostFirstDay = 0.00;
    if (!tpkg.sd_dayplan_id.is_takepackedlunch || tpkg.sd_dayplan_id.is_takepackedlunch == null) {
        lunchCostFirstDay = tpkg.sd_dayplan_id.lunchplace_id?.costperhead || 0.00;
    }


    //lunch cost for all mid days , for 1 person
    let lunchCostMidDays = 0.00;
    if (tpkg.dayplans.length > 0) {
        tpkg.dayplans.forEach(day => {
            if (!day.is_takepackedlunch || day.is_takepackedlunch == null) {
                lunchCostMidDays += day.lunchplace_id?.costperhead || 0.00;
            }
        });
    }

    //lunch cost for last day , for 1 person
    let lunchCostLastDay = 0.00;
    if (tpkg.ed_dayplan_id == null) {
        lunchCostLastDay = 0.00;
    } else {
        if (!tpkg.ed_dayplan_id.is_takepackedlunch || tpkg.ed_dayplan_id.is_takepackedlunch == null) {
            lunchCostLastDay = tpkg.ed_dayplan_id.lunchplace_id?.costperhead || 0.00;
        }
    }

    //final lunch cost for all
    const totalLunchCost = (lunchCostFirstDay + lunchCostMidDays + lunchCostLastDay) * totalTravellers;

    lunchInput.value = totalLunchCost.toFixed(2);
    tpkg.totallunchcost = parseFloat(totalLunchCost.toFixed(2));

}

//to calculate the total stay cost of the tour package
//add incremental cost for KIDS 💥💥💥
const calcTotalStayCost = () => {

    tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);

    //updateTotalTravellers();
    const totalTravellers = parseInt(document.getElementById('tpkgTotalTravellers').value);

    const stayInput = document.getElementById("totalStayCostInput");
    const stayGroup = document.getElementById("totalStayCostGroup");
    const stayMsg = document.getElementById("totalStayCostMsg");

    // check if there are any itineraries selected
    const hasItineraries =
        (tpkg.sd_dayplan_id != null) ||
        (Array.isArray(tpkg.dayplans) && tpkg.dayplans.length > 0) ||
        (tpkg.ed_dayplan_id != null);

    if (totalTravellers === 0 || !hasItineraries) {
        stayMsg.classList.remove("d-none");
        stayGroup.classList.add("d-none");
        tpkg.totalstaycost = null;
        return;
    }

    //if all reqs are present, execute below all
    stayMsg.classList.add("d-none");
    stayGroup.classList.remove("d-none");

    // First day
    let firstDayBasePrice = 0;
    let firstDayIncrementalCost = 0;

    if (tpkg.sd_dayplan_id.drop_stay_id != null && tpkg.sd_dayplan_id.droppoint == null) {
        firstDayBasePrice = tpkg.sd_dayplan_id.drop_stay_id.base_price;
        firstDayIncrementalCost = tpkg.sd_dayplan_id.drop_stay_id.incremental_cost;
    } else if (tpkg.sd_dayplan_id.drop_stay_id == null && tpkg.sd_dayplan_id.droppoint != null) {
        firstDayBasePrice = 0;
        firstDayIncrementalCost = 0;
    }


    // Last day
    let lastDayBasePrice = 0;
    let lastDayIncrementalCost = 0;

    if (tpkg.ed_dayplan_id?.drop_stay_id != null && tpkg.ed_dayplan_id.droppoint == null) {
        lastDayBasePrice = tpkg.ed_dayplan_id.drop_stay_id.base_price;
        lastDayIncrementalCost = tpkg.ed_dayplan_id.drop_stay_id.incremental_cost;

    } else if (tpkg.ed_dayplan_id?.drop_stay_id == null && tpkg.ed_dayplan_id?.droppoint != null) {
        lastDayBasePrice = 0;
        lastDayIncrementalCost = 0;
    }

    // Mid days
    let totalMidDaysBasePrice = 0;
    let totalMidDaysIncrementalCost = 0;

    if (tpkg.dayplans.length > 0) {
        tpkg.dayplans.forEach(day => {
            if (day.drop_stay_id != null && day.droppoint == null) {
                totalMidDaysBasePrice += day.drop_stay_id.base_price;
                totalMidDaysIncrementalCost += day.drop_stay_id.incremental_cost;
            } else if (day.drop_stay_id == null && day.droppoint != null) {
                totalMidDaysBasePrice += 0;
                totalMidDaysIncrementalCost += 0;
            }
        });
    }

    const firstDayCost = firstDayBasePrice + (firstDayIncrementalCost * totalTravellers);
    const lastDayCost = lastDayBasePrice + (lastDayIncrementalCost * totalTravellers);
    const midDaysCost = totalMidDaysBasePrice + (totalMidDaysIncrementalCost * totalTravellers);

    const totalStayCostValue = firstDayCost + lastDayCost + midDaysCost;

    stayInput.value = totalStayCostValue.toFixed(2);
    tpkg.totalstaycost = parseFloat(totalStayCostValue.toFixed(2));

};

//calc total vehicle fee  
const calcTotalVehiParkingfeeTpkg = () => {

    tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);

    const costInput = document.getElementById("totalVehicleParkingCost");
    const groupDiv = document.getElementById("totalVehiParkCostGroup");
    const msgDiv = document.getElementById("totalVehicleParkingCostMsg");

    const hasItineraries =
        (tpkg.sd_dayplan_id && tpkg.sd_dayplan_id.totalvehiparkcost != null) ||
        (tpkg.dayplans.length > 0) ||
        (tpkg.ed_dayplan_id && tpkg.ed_dayplan_id.totalvehiparkcost != null);

    if (!hasItineraries) {
        tpkg.totalvehiparkingcost = null
        msgDiv.classList.remove("d-none");
        groupDiv.classList.add("d-none");
        return;
    } else {
        msgDiv.classList.add("d-none");
        groupDiv.classList.remove("d-none");

        // parking cost for 1st day
        let parkingCostFirstDay = tpkg.sd_dayplan_id.totalvehiparkcost || 0.00;

        // parking cost for last day
        let parkingCostLastDay = 0.00;
        if (tpkg.ed_dayplan_id == null) {
            parkingCostLastDay = 0.00;
        } else {
            parkingCostLastDay = tpkg.ed_dayplan_id.totalvehiparkcost || 0.00;
        }

        // parking cost for mid days
        let parkingCostMidDays = 0.00;

        if (tpkg.dayplans.length > 0) {
            tpkg.dayplans.forEach(day => {

                if (day) {
                    let midDaysParkingCost = day.totalvehiparkcost;
                    parkingCostMidDays += midDaysParkingCost || 0.00;
                }

            });
        }

        totalParkingCost = parkingCostFirstDay + parkingCostMidDays + parkingCostLastDay;

        costInput.value = totalParkingCost.toFixed(2);
        tpkg.totalvehiparkingcost = parseFloat(totalParkingCost.toFixed(2));
    }

}

// check if first tabs inputs are all filled 💥💥💥
const checkFirstTab = () => {
    const pkgTitle = tpkg.pkgtitle;
    const startDate = tpkg.tourstartdate;
    const description = tpkg.web_description;

    if (tpkg.is_custompkg == null) {
        alert("Please select whether this is a custom package or a template package.");
        return null;
    }

    if (!pkgTitle) {
        alert("Please enter the tour package title.");
        return null;
    }

    if (tpkg.is_custompkg === true) {
        if (!startDate) {
            alert("For a custom package, please fill the start date.");
            return null;
        }
    }

    if (tpkg.is_custompkg === false) {
        if (!description) {
            alert("For a template package, please fill the web description.");
            return null;
        }
    }

    tabelement = document.getElementById('tpkgStep2-tab');
    tabelement.classList.remove("disabled");
    tabelement.click();

};

// save the preferred vehi types name only., as a string
const savePrefVehitype = (selectElement) => {

    const selectedOption = selectElement.value;

    if (selectedOption != "") {
        const selectedVehicleTypeName = JSON.parse(selectedOption).name;
        tpkg.pref_vehi_type = selectedVehicleTypeName;
        selectElement.style.border = "2px solid lime";
        getAvailableVehiCount();
    } else {
        tpkg.pref_vehi_type = null;
        selectElement.style.border = "1px solid #ced4da";
    }

}

const showVehiAvailabilityButtons = () => {
    // show the vehi availability button
    document.getElementById("btnCheckVehiAvailability").classList.remove("d-none");

    // hide + clear spans
    const vehicleSpan = document.getElementById("showAvailableVehiCount");
    vehicleSpan.textContent = "";
}

// function to show both buttons again
const showDnGAvailabilityButtons = () => {

    document.getElementById("btnCheckGuideAvailability").classList.remove("d-none");
    document.getElementById("btnCheckDriverAvailability").classList.remove("d-none");

    // hide + clear spans
    const guideSpan = document.getElementById("showAvailableGuideCount");
    const driverSpan = document.getElementById("showAvailableDriverCount");

    guideSpan.textContent = "";
    driverSpan.textContent = "";
}

//get available vehi count based on date range and vehi type
const getAvailableVehiCount = async () => {

    const startDate = document.getElementById('tpStartDateInput').value || tpkg.tourstartdate;
    const endDate = tpkg.tourenddate;
    const selectedVehitype = document.getElementById('tpkgVehitype').value;

    if (!startDate || !endDate || !selectedVehitype) {
        alert("Please select start date, day plans and vehicle type.");
        return;
    }

    const selectedVehitypeObjid = JSON.parse(selectedVehitype).id;
    const btnCheckVehiAvailability = document.getElementById("btnCheckVehiAvailability");


    const vehicleResultSection = document.getElementById('showAvailableVehiCount');

    try {
        const availablevehiListByTypeAndDates = await ajaxGetReq("vehi/availablevehiclesbyvehitype/" + startDate + "/" + endDate + "/" + selectedVehitypeObjid);
        const availableCount = availablevehiListByTypeAndDates.length;
        vehicleResultSection.classList.remove('text-danger');
        vehicleResultSection.classList.add('text-success');
        vehicleResultSection.innerText = ` ${availableCount} Vehicles Available `;

        btnCheckVehiAvailability.classList.add("d-none");
    } catch (error) {
        console.error("Error fetching available vehicles:", error);
        vehicleResultSection.classList.remove('text-success');
        vehicleResultSection.classList.add('text-danger');
        vehicleResultSection.innerText = "Error fetching available vehicles";

        btnCheckVehiAvailability.classList.remove("d-none");
    }

}

//get available drivers count based on date range 
const getAvailableIntrDriversCount = async () => {

    const startDate = document.getElementById('tpStartDateInput').value || tpkg.tourstartdate;
    const endDate = tpkg.tourenddate;

    if (!startDate || !endDate) {
        alert("Please select both start date and day plans.");
        return;
    }

    const driverResultSection = document.getElementById('showAvailableDriverCount');
    const btnCheckDriverAvailability = document.getElementById("btnCheckDriverAvailability");

    try {
        const availabledriversByDates = await ajaxGetReq("emp/availabledriversbydates/" + startDate + "/" + endDate);
        const availableCount = availabledriversByDates.length;
        driverResultSection.classList.remove('text-danger');
        driverResultSection.classList.add('text-success');
        driverResultSection.innerText = ` ${availableCount} Drivers Available `;

        btnCheckDriverAvailability.classList.add("d-none");

    } catch (error) {
        console.error("Error fetching available drivers:", error);
        driverResultSection.classList.remove('text-success');
        driverResultSection.classList.add('text-danger');
        driverResultSection.innerText = "Error fetching available drivers";

        btnCheckDriverAvailability.classList.remove("d-none");
    }

}

//get available drivers count based on date range 
const getAvailableIntrGuidesCount = async () => {

    const startDate = document.getElementById('tpStartDateInput').value || tpkg.tourstartdate;
    const endDate = tpkg.tourenddate;

    if (!startDate || !endDate) {
        alert("Please select both start date and day plans.");
        return;
    }

    const guideResultSection = document.getElementById('showAvailableGuideCount');
    const btnCheckGuideAvailability = document.getElementById("btnCheckGuideAvailability");

    try {
        const availableguidesByDates = await ajaxGetReq("emp/availableguidesbydates/" + startDate + "/" + endDate);
        const availableCount = availableguidesByDates.length;

        btnCheckGuideAvailability.classList.add("d-none");

        guideResultSection.classList.remove('text-danger');
        guideResultSection.classList.add('text-success');
        guideResultSection.innerText = ` ${availableCount} Guides Available `;
        guideResultSection.classList.remove("d-none");

    } catch (error) {
        console.error("Error fetching available guides:", error);
        guideResultSection.classList.remove('text-success');
        guideResultSection.classList.add('text-danger');
        guideResultSection.innerText = "Error fetching available guides";

        btnCheckGuideAvailability.classList.remove("d-none");
    }

}

//++++++++++++++++++++++ DayPlan form related codes ++++++++++++++++++++++

//this will helps in refilling the dayplan when editing
let editingDPsSelectElementIdVal = null;

// to clear the day plan info section
const clearDpInfoShowSection = () => {
    document.getElementById('dpInfoIsTemplate').innerText = 'N/A';
    document.getElementById('tempInfoDisRow').classList.add('d-none');
    document.getElementById('dpInfoCode').innerText = 'N/A';
    document.getElementById('dpInfoTitle').innerText = 'N/A';
    document.getElementById('dpInfoStartLocation').innerText = 'N/A';
    document.getElementById('dpInfoDropPoint').innerText = 'N/A';
    document.getElementById('dpInfoLunchPlace').innerText = 'N/A';
    document.getElementById('dpInfoNote').innerText = 'N/A';
    document.getElementById('dpInfoPlaces').innerHTML = 'N/A';
    document.getElementById('dayPlanInfoEditBtn').disabled = true;

    refreshDpFormInTpkg();

    editingDPsSelectElementIdVal = null;

}

//this will be helps when refilling a dp and set the correct day type auto
let selectedDayTypeToEdit = null;

//show selected day plan's info
const showDayPlanDetails = (selectElementId) => {

    // Clear previous details
    clearDpInfoShowSection()

    // Get the selected option value
    const selectedOption = document.getElementById(selectElementId).value;

    // Parse the selected option to get the day plan info
    const selectedDayPlan = JSON.parse(selectedOption);

    // Template info
    if (selectedDayPlan.is_template) {
        document.getElementById('tempInfoDisRow').classList.remove('d-none');
        document.getElementById('dpInfoIsTemplate').innerText = 'This Is A Template Itinerary';
    }

    // Set fields
    document.getElementById('dpInfoCode').innerText = selectedDayPlan.dayplancode || 'N/A';
    document.getElementById('dpInfoTitle').innerText = selectedDayPlan.daytitle || 'N/A';

    document.getElementById('dpInfoStartLocation').innerText =
        selectedDayPlan.pickuppoint || (selectedDayPlan.pickup_stay_id?.name) || 'N/A';

    document.getElementById('dpInfoLunchPlace').innerText =
        selectedDayPlan.lunchplace_id?.name || (selectedDayPlan.is_takepackedlunch ? 'Take Packed Lunch' : 'N/A');

    document.getElementById('dpInfoDropPoint').innerText =
        selectedDayPlan.drop_stay_id?.name || selectedDayPlan.droppoint || 'N/A';

    // Visiting places
    const placesElement = document.getElementById('dpInfoPlaces');
    if (Array.isArray(selectedDayPlan.vplaces) && selectedDayPlan.vplaces.length > 0) {
        const placeItems = selectedDayPlan.vplaces.map((place, index) =>
            `<li>${index + 1}. ${place.name}</li>`
        );
        placesElement.innerHTML = placeItems.join('');
    } else {
        placesElement.innerHTML = '<li>N/A</li>';
    }

    // Notes
    document.getElementById('dpInfoNote').innerText = selectedDayPlan.note || 'N/A';

    // Edit button 
    const editBtn = document.getElementById('dayPlanInfoEditBtn');
    editBtn.disabled = false;
    editBtn.onclick = function () {
        refillSelectedDayPlan(selectedDayPlan);
    };

    //this will helps in refilling the dayplan when editing
    //the view button is clicked from this select element's card
    editingDPsSelectElementIdVal = selectElementId;

    console.log("select element id for editing DPs: ", editingDPsSelectElementIdVal);

    //this will be helps when refilling a dp and set the correct day type auto
    selectedDayTypeToEdit = getDayTypeFromLabel(selectElementId);

};

// to get the day type from the label of the select element
const getDayTypeFromLabel = (selectId) => {
    const label = document.querySelector(`label[for="${selectId}"]`);
    if (label) {
        const text = label.innerText.trim();
        return text.replace(':', '').split(' ')[0].toLowerCase();
    }
    return null;
}

//💥💥💥 new
// to get the day number from the label of the select element 
const getDayNumberFromLabel = (selectId) => {
    const label = document.querySelector(`label[for="${selectId}"]`);
    if (label) {
        const text = label.innerText.trim().replace(':', '');
        const match = text.match(/\d+/); // Finds the first number in the string
        return match ? parseInt(match[0]) : null;
    }
    return null;
};

//💥💥💥
// to refresh the day plan form in the tpkg module 💥
const refreshDpFormInTpkg = async () => {

    dayplan = new Object();

    dayplan.vplaces = new Array();

    document.getElementById('formDayPlanInTpkg').reset();

    try {
        const allProvinces = await ajaxGetReq("/province/all");

        fillDataIntoDynamicSelects(selectVPProv, 'Please Select The Province', allProvinces, 'name');
        fillDataIntoDynamicSelects(selectLPProv, 'Please Select The Province', allProvinces, 'name');
        fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name');
        fillDataIntoDynamicSelects(pickupProvinceSelect, 'Please Select The Province', allProvinces, 'name');

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
    ];


    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    const radioIdsToReset = [
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

    //status eka auto set karanna one kohomada kiyalath hithanna 💥💥💥
    //document.getElementById('dpSelectStatus ').children[2].removeAttribute('class', 'd-none');

}

// to refill the selected day plan in order to prepare for edit
const refillSelectedDayPlan = async (dpObj) => {

    dayplan = JSON.parse(JSON.stringify(dpObj));

    //declaring global variables to use in this function
    let allDists, allProvinces;

    //fetch all districts and provinces only once
    try {
        allDists = await ajaxGetReq('district/all');
        allProvinces = await ajaxGetReq("/province/all");
    } catch (error) {
        console.error("Failed to fetch districts or provinces:", error);
    }

    const firstDayCbVar = document.getElementById('firstDayCB');
    const midDayCbVar = document.getElementById('middleDayCB');
    const lastDayCbVar = document.getElementById('lastDayCB');

    if (selectedDayTypeToEdit === "first") {

        firstDayCbVar.checked = true;
        dayplan.dayplancode = 'FD';

        midDayCbVar.disabled = true;
        midDayCbVar.style.cursor = 'not-allowed';
        lastDayCbVar.disabled = true;
        lastDayCbVar.style.cursor = 'not-allowed';

    } else if (selectedDayTypeToEdit === "middle") {

        midDayCbVar.checked = true;
        dayplan.dayplancode = 'MD';

        firstDayCbVar.disabled = true;
        firstDayCbVar.style.cursor = 'not-allowed';
        lastDayCbVar.disabled = true;
        lastDayCbVar.style.cursor = 'not-allowed';

    } else if (selectedDayTypeToEdit === "final") {

        lastDayCbVar.checked = true;
        dayplan.dayplancode = 'LD';

        firstDayCbVar.disabled = true;
        firstDayCbVar.style.cursor = 'not-allowed';
        midDayCbVar.disabled = true;
        midDayCbVar.style.cursor = 'not-allowed';

    } else {
        console.log("selectedDayTypeToEdit: " + selectedDayTypeToEdit);
        console.log("else");
    }

    //enable these select elements
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
    }

    //if pickup point was a stay
    if (dpObj.pickup_stay_id?.id != null) {

        try {

            fillDataIntoDynamicSelects(pickupDistrictSelect, 'Please Select The District', allDists, 'name', dpObj.pickup_stay_id.district_id.name);
            fillDataIntoDynamicSelects(pickupProvinceSelect, 'Please Select The Province', allProvinces, 'name', dpObj.pickup_stay_id.district_id.province_id.name);

            await getStayByDistrict(pickupDistrictSelect, pickupAccommodationSelect, dpObj.pickup_stay_id.name);

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
    }

    //if droppoint is a stay
    if (dpObj.drop_stay_id?.id != null) {

        const dropOffAccommodationRow = document.getElementById('accommodationDropOffOptions');
        dropOffAccommodationRow.style.display = 'block';

        const dropOffAccommodationCB = document.getElementById('accommodationsDropOffCB');
        dropOffAccommodationCB.checked = true;

        const manualDropRow = document.getElementById('manualDropOffOptions');
        manualDropRow.style.display = 'none';

        try {
            fillDataIntoDynamicSelects(dropOffDistrictSelect, 'Please Select The District', allDists, 'name', dpObj.drop_stay_id.district_id.name);
            fillDataIntoDynamicSelects(dropOffProvinceSelect, 'Please Select The Province', allProvinces, 'name', dpObj.drop_stay_id.district_id.province_id.name);

            await getStayByDistrict(dropOffDistrictSelect, dropOffAccommodationSelect, dpObj.drop_stay_id.name);
            await getStayByDistrict(dropOffDistrictSelect, altStay1Select, dpObj.alt_stay_1_id.name);
            await getStayByDistrict(dropOffDistrictSelect, altStay2Select, dpObj.alt_stay_2_id.name);

        } catch (error) {
            console.error('error fetching previous end stay info');
        }

    }

    //if packed lunch is taken
    if (dpObj.is_takepackedlunch) {

        packedLunchYes.checked = true;

        selectLPProv.disabled = false;
        selectLPDist.disabled = true;
        selectDPLunch.disabled = true;

        //fill the selects with /all data
        try {

            fillDataIntoDynamicSelects(selectLPProv, 'Please Select The Province', allProvinces, 'name');

            fillDataIntoDynamicSelects(selectLPDist, 'Please Select The District', allDists, 'name');

            const lhsEmptyArray = [];
            fillDataIntoDynamicSelects(selectDPLunch, 'Please Select Restaurent', lhsEmptyArray, 'name');

        } catch (error) {
            console.error('error fetching previous lunch place info');
        }

    } else if (!dpObj.is_takepackedlunch || dpObj.is_takepackedlunch == null) {
        packedLunchNo.checked = true;
    }

    //if lunch taken from a restaurent
    if (dpObj.lunchplace_id?.id != null) {

        fillDataIntoDynamicSelects(selectLPProv, 'Select Province', allProvinces, 'name', dpObj.lunchplace_id.district_id.province_id.name);
        fillDataIntoDynamicSelects(selectLPDist, 'Select District', allDists, 'name', dpObj.lunchplace_id.district_id.name);

        try {

            await getLunchHotelByDistrict(selectLPDist, selectDPLunch, dpObj.lunchplace_id.name);

        } catch (error) {
            console.error('error fetching previous lunch place info')
        }
    }

    //all selected visiting places
    fillDataIntoDynamicSelects(selectedVPs, '', dpObj.vplaces, 'name');
    fillDataIntoDynamicSelects(selectVPDist, 'Please Select The District', allDists, 'name');
    fillDataIntoDynamicSelects(selectVPProv, 'Please Select The Province', allProvinces, 'name');

    //other input fields
    document.getElementById('dpTitle').value = dpObj.daytitle;
    document.getElementById('dpTotalKMcount').value = dpObj.totalkmcount;
    document.getElementById('dpCode').value = dpObj.dayplancode;
    document.getElementById('dpSelectStatus').value = dpObj.dp_status;
    document.getElementById('dpNote').value = dpObj.note;
    document.getElementById('dpTotalVehiParkingCost').innerText = 'LKR ' + dpObj.totalvehiparkcost.toFixed(2);
    document.getElementById('dpTotalForeignChildTktCost').innerText = 'LKR ' + dpObj.foreignchildtktcost.toFixed(2);
    document.getElementById('dpTotalForeignAdultTktCost').innerText = 'LKR ' + dpObj.foreignadulttktcost.toFixed(2);
    document.getElementById('dpTotalLocalChildTktCost').innerText = 'LKR ' + dpObj.localchildtktcost.toFixed(2);
    document.getElementById('dpTotalLocalAdultTktCost').innerText = 'LKR ' + dpObj.localadulttktcost.toFixed(2);

    //give another value 💥💥💥
    document.getElementById('dpSelectStatus').style.border = '1px solid #ced4da';
    //
    //    var step1Tab = new bootstrap.Tab(document.getElementById('dayStep1-tab'));
    //    step1Tab.show();

    $("#dayPlanModalInTpkg").modal("show");
}

//auto select the newly added dp into the correct select element
const feedAndSelectNewlyAddedDp = async () => {

    //for first days
    if (editingDPsSelectElementIdVal === "tpkgFirstDaySelect") {

        resetSelectElements(tpkgFirstDaySelect, "Please Select First Day");

        try {
            tpkg.sd_dayplan_id = null;
            const onlyFirstDays = await ajaxGetReq("/dayplan/onlyfirstdays");
            const newlyAddedDayTitle = window.newlyAddedDayTitleGlobal;
            console.log("newlyAddedDayTitle:", newlyAddedDayTitle);
            fillDataIntoDynamicSelects(tpkgFirstDaySelect, "Please Select First Day", onlyFirstDays, "daytitle", newlyAddedDayTitle);
            const selectedVal = tpkgFirstDaySelect.value;
            console.log("Selected value in tpkgFirstDaySelect:", selectedVal);
            if (selectedVal) {
                tpkg.sd_dayplan_id = JSON.parse(selectedVal);
                handleFirstDayChange(tpkgFirstDaySelect);
            } else {
                console.warn("No value selected in tpkgFirstDaySelect");
            }
        } catch (error) {
            console.error("first day fetch failed " + error)
        }

        //for last days
    } else if (editingDPsSelectElementIdVal === "tpkgFinalDaySelect") {

        resetSelectElements(tpkgFinalDaySelect, "Please Select Final Day");

        try {
            tpkg.ed_dayplan_id = null;
            const onlyLastDays = await ajaxGetReq("/dayplan/onlylastdays");
            const newlyAddedDayTitle = window.newlyAddedDayTitleGlobal;
            console.log("newlyAddedDayTitle:", newlyAddedDayTitle);
            fillDataIntoDynamicSelects(tpkgFinalDaySelect, "Please Select Final Day", onlyLastDays, "daytitle", newlyAddedDayTitle);
            const selectedVal = tpkgFinalDaySelect.value;

            if (selectedVal) {
                tpkg.ed_dayplan_id = JSON.parse(selectedVal);
                handleFinalDayChange(tpkgFinalDaySelect);
            } else {
                console.warn("No value selected in tpkgFinalDaySelect");
            }
        } catch (error) {
            console.error("final day fetch failed " + error)
        }

        //for mid days
    } else {

        const midDaySelect = document.getElementById(editingDPsSelectElementIdVal);
        if (midDaySelect) {
            resetSelectElements(midDaySelect, "Please Select The Itinerary");
            console.log("midDaySelect:", midDaySelect);

            try {
                const newlyAddedDayTitle = window.newlyAddedDayTitleGlobal;
                console.log("newlyAddedDayTitle:", newlyAddedDayTitle);
                const onlyMidDays = await ajaxGetReq("/dayplan/onlymiddays");
                fillDataIntoDynamicSelects(midDaySelect, "Please Select Middle Day", onlyMidDays, "daytitle", newlyAddedDayTitle);
                setTimeout(() => {
                    const selectedVal = midDaySelect.value;
                    console.log("Selected value in mid day select:", selectedVal);

                    if (selectedVal) {
                        const selectedDayPlan = JSON.parse(selectedVal);
                        const index = getDayNumberFromLabel(editingDPsSelectElementIdVal) - 1;
                        tpkg.dayplans[index] = selectedDayPlan;
                        console.log("Updated tpkg.dayplans:", tpkg.dayplans);

                        // manually trigger the onchange event to update UI
                        const changeEvent = new Event('change');
                        midDaySelect.dispatchEvent(changeEvent);

                    } else {
                        console.warn("No value selected in mid day select");
                        // If no value is selected, try to find and select the newly added day name
                        const options = midDaySelect.querySelectorAll('option');
                        for (let option of options) {
                            if (option.textContent.includes(newlyAddedDayTitle)) {
                                midDaySelect.value = option.value;
                                const selectedDayPlan = JSON.parse(option.value);
                                const index = getDayNumberFromLabel(editingDPsSelectElementIdVal) - 1;
                                tpkg.dayplans[index] = selectedDayPlan;

                                // manually trigger onchange event
                                const changeEvent = new Event('change');
                                midDaySelect.dispatchEvent(changeEvent);
                                break;
                            }
                        }
                    }
                }, 100);
            } catch (error) {
                console.error("mid day fetch failed " + error)
            }
        }
    }

}

// add new day plan in the tpkg module
const addNewDayPlanInTpkg = async () => {

    const errors = checkDPFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {
                dayplan.id = null;
                dayplan.is_template = false;
                const postServerResponse = await ajaxPPDRequest("/dayplan/saveasnew", "POST", dayplan);

                if (postServerResponse && !postServerResponse.startsWith("save not completed")) {
                    window.newlyAddedDayTitleGlobal = postServerResponse;
                    showAlertModal('suc', 'Saved Successfully as ' + postServerResponse);
                    feedAndSelectNewlyAddedDp();
                    document.getElementById('formDayPlanInTpkg').reset();
                    refreshDpFormInTpkg();
                    clearDpInfoShowSection();
                    $('#dayPlanModalInTpkg').modal('hide');
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

//💥💥💥💥
//check errors for DP in TPKG

//######################################################


//this will be needed for create dyamic IDs in mid days
let midDayCounter = 1;

//generate mid day select sections
const generateNormalDayPlanSelectSections = () => {

    const currentDay = midDayCounter;

    const container = document.getElementById('tpkgMidDaysSelectSection');

    const selectId = `tpkgMidDaySelect${currentDay}`;
    const viewBtnId = `showMidDayBtn${currentDay}`;
    const actionRowId = `midDayActionBtnsRow${currentDay}`;
    const msgId = `midDayMsg${currentDay}`;

    // outer container
    const outerDiv = document.createElement('div');
    outerDiv.className = 'col-12 mt-0';

    // row
    const row = document.createElement('div');
    row.className = 'row border border-secondary rounded p-3 mb-3 bg-white shadow-sm';

    //day selector
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

    //actual select element
    const select = document.createElement('select');
    select.id = selectId;
    select.disabled = true;
    select.className = 'form-control form-select';
    select.onchange = function () {
        handleMidDaySelectChange(this, currentDay);
    };

    selectCol.appendChild(select);

    const msgDiv = document.createElement('div');
    msgDiv.className = 'text-danger d-none';
    msgDiv.id = `midDayMsg${midDayCounter}`;
    msgDiv.textContent = 'This is a template day plan. Customize this to suit the tour';
    selectCol.appendChild(msgDiv);

    const btnCol = document.createElement('div');
    btnCol.className = 'col-3 d-flex justify-content-end gap-2';

    //view btn
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.id = viewBtnId;
    viewBtn.disabled = true;
    viewBtn.className = 'btn btn-all';
    viewBtn.textContent = 'View';
    viewBtn.onclick = () => {
        showDayPlanDetails(selectId);
    };
    btnCol.appendChild(viewBtn);

    //delete btn
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-outline-danger btn-sm';
    deleteBtn.innerText = "Delete";
    deleteBtn.id = `midDayDeleteBtn${midDayCounter}`;
    deleteBtn.onclick = () => {
        deleteMidDay(currentDay);
    };
    btnCol.appendChild(deleteBtn);

    // appnd selector row
    selectorRow.appendChild(labelCol);
    selectorRow.appendChild(selectCol);
    selectorRow.appendChild(btnCol);

    // action buttons
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'col-12 mt-3';
    actionsWrapper.id = actionRowId;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex justify-content-center flex-wrap gap-2';

    const templateBtn = document.createElement('button');
    templateBtn.className = 'btn btn-outline-primary btn-sm';
    templateBtn.onclick = () => {
        loadTemplates(select, currentDay);
    };
    templateBtn.innerHTML = `<i class="bi bi-pencil-square me-1"></i> Use Template`;

    const existingBtn = document.createElement('button');
    existingBtn.className = 'btn btn-outline-secondary btn-sm';
    existingBtn.onclick = () => {
        loadExistingMDs(select, currentDay);
    };
    existingBtn.innerHTML = `<i class="bi bi-archive me-1"></i> Use Existing`;

    // Assemble buttons
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

const handleMidDaySelectChange = (selectElem, currentDay = null) => {
    const selectedValue = JSON.parse(selectElem.value);
    const msgId = `midDayMsg${currentDay}`;
    const viewBtnId = `showMidDayBtn${currentDay}`;

    const msgElement = document.getElementById(msgId);

    console.log("Selected DayPlan:", selectedValue);
    console.log("Selected Day Number:", currentDay);

    const index = currentDay - 1;  // zero-based index in tpkg.dayplans
    console.log("Target index in dayplans:", index);

    let isDuplicate = tpkg.dayplans.some(dp => dp && dp.id === selectedValue.id);

    if (isDuplicate) {
        showAlertModal('war', 'This DayPlan has already been selected!');
        selectElem.value = "";
        selectElem.style.border = "2px solid red";
    } else {
        if (selectedValue.is_template) {
            selectElem.style.border = "2px solid orange";
            msgElement.classList.remove("d-none");

            tpkg.dayplans[index] = null;

            addNewDaysBtn.disabled = true;
        } else {
            selectElem.style.border = "2px solid lime";
            msgElement.classList.add("d-none");

            tpkg.dayplans[index] = selectedValue;

            addNewDaysBtn.disabled = false;
            finalDaySelectUseTempsBtn.disabled = false;
            finalDaySelectUseExistingBtn.disabled = false;
        }

        updateTotalDaysCount();
        showTotalKmCount();

        document.getElementById(viewBtnId).disabled = false;
        document.getElementById(`midDayDeleteBtn${currentDay}`).disabled = false;

        console.log("Updated tpkg.dayplans:", tpkg.dayplans);
    }
}

// to load templates   
const loadTemplates = async (selectElementId) => {

    //for first days
    if (selectElementId.id == "tpkgFirstDaySelect") {
        console.log(' if (selectElementId == "tpkgFirstDaySelect") called');
        tpkg.sd_dayplan_id = null;
        document.getElementById('addNewDaysBtn').disabled = true;
        document.getElementById('firstDayMsg').classList.add('d-none');
    }

    //for final days
    if (selectElementId.id == "tpkgFinalDaySelect") {
        console.log(' if (selectElementId == "tpkgFinalDaySelect") called');
        tpkg.ed_dayplan_id = null;
    }

    selectElementId.style.border = "1px solid #ced4da";
    clearDpInfoShowSection();

    // Handle mid-days
    if (selectElementId.id.startsWith("tpkgMidDaySelect")) {
        const index = getMidDayIndexFromSelect(selectElementId);
        tpkg.dayplans[index] = {};
        console.log(`Cleared tpkg.dayplans[${index}] due to template load`);
    }

    if (tpkg.sd_dayplan_id?.id == null) {
        showFirstDayBtn.disabled = true;
    }

    if (tpkg.ed_dayplan_id?.id == null) {
        showFinalDayBtn.disabled = true;
    }

    try {
        const onlyTemplates = await ajaxGetReq("/dayplan/onlytemplatedays");
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyTemplates, "daytitle");
        const editBtn = document.getElementById('dayPlanInfoEditBtn');
        editBtn.disabled = true;
    } catch (error) {
        console.error("Error loading templates:", error);
    }

    updateTotalDaysCount();
    console.log("Updated tpkg.dayplans:", tpkg.dayplans);
};

// to load existing first days  
const loadExistingFDs = async (selectElementId) => {

    document.getElementById('addNewDaysBtn').disabled = true;

    tpkg.sd_dayplan_id = null;

    selectElementId.style.border = "1px solid #ced4da";
    clearDpInfoShowSection();

    if (tpkg.sd_dayplan_id?.id == null) {
        showFirstDayBtn.disabled = true;
    }

    try {
        // onlyFirstDays = await ajaxGetReq("/dayplan/onlyfirstdays");
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyFirstDays, "daytitle");
        const editBtn = document.getElementById('dayPlanInfoEditBtn');
        editBtn.disabled = true;
        document.getElementById('firstDayMsg').classList.add('d-none');
    } catch (error) {
        console.error("Error loading existing days:", error);
    }

    updateTotalDaysCount();
};

// to load existing mid days  
const loadExistingMDs = async (selectElement) => {

    selectElement.style.border = "1px solid #ced4da";
    clearDpInfoShowSection();

    if (selectElement.id.startsWith("tpkgMidDaySelect")) {
        const index = getMidDayIndexFromSelect(selectElement);
        tpkg.dayplans[index] = {};
        console.log(`Cleared tpkg.dayplans[${index}] due to existing load`);

        const viewBtnId = `showMidDayBtn${index + 1}`;
        const viewBtn = document.getElementById(viewBtnId);
        if (viewBtn) viewBtn.disabled = true;

    }

    try {
        resetSelectElements(selectElement, "Please Select");
        fillDataIntoDynamicSelects(selectElement, "Please Select", onlyMidDays, "daytitle");
        const editBtn = document.getElementById('dayPlanInfoEditBtn');
        editBtn.disabled = true;
    } catch (error) {
        console.error("Error loading existing days:", error);
    }

    updateTotalDaysCount();

    console.log("Updated tpkg.dayplans:", tpkg.dayplans);
};

// to load existing last days  
const loadExistingLDs = async (selectElementId) => {

    tpkg.ed_dayplan_id = null;

    selectElementId.style.border = "1px solid #ced4da";
    clearDpInfoShowSection();

    if (tpkg.ed_dayplan_id?.id == null) {
        showFinalDayBtn.disabled = true;
    }

    try {
        resetSelectElements(selectElementId, "Please Select");
        fillDataIntoDynamicSelects(selectElementId, "Please Select", onlyLastDays, "daytitle");
        const editBtn = document.getElementById('dayPlanInfoEditBtn');
        editBtn.disabled = true;
        document.getElementById('finalDayMsg').classList.add('d-none');
    } catch (error) {
        console.error("Error loading existing days:", error);
    }

    updateTotalDaysCount();
};

//handle midday delete
const deleteMidDay = (index) => {

    let userConfirm = confirm("Are you sure you want to delete this middle day?");
    if (!userConfirm) {
        showAlertModal('inf', 'User cancelled the mid day deletion task');
        return;
    }

    const select = document.getElementById(`tpkgMidDaySelect${index}`);

    if (select && select.value && select.value.trim() !== "") {
        try {
            const arrayIndex = index - 1;
            tpkg.dayplans[arrayIndex] = null;
            console.log(`Deleted tpkg.dayplans[${arrayIndex}] for midDay ${index}`);
        } catch (err) {
            console.warn("Invalid JSON in select value, skipping removal from tpkg.dayplans");
        }
    }

    // Remove the row
    const row = select.closest('.row').parentElement;
    row.remove();

    // Shift the remaining elements
    for (let i = index + 1; i < midDayCounter; i++) {

        const oldSelect = document.getElementById(`tpkgMidDaySelect${i}`);
        if (!oldSelect) continue;

        const oldRow = oldSelect.closest('.row').parentElement;
        const newIndex = i - 1;

        // Update IDs
        oldSelect.id = `tpkgMidDaySelect${newIndex}`;
        oldRow.querySelector('label').textContent = `Middle Day ${newIndex} :`;
        oldRow.querySelector('label').setAttribute('for', `tpkgMidDaySelect${newIndex}`);

        const viewBtn = oldRow.querySelector(`#showMidDayBtn${i}`);
        viewBtn.id = `showMidDayBtn${newIndex}`;
        viewBtn.onclick = () => {
            showDayPlanDetails(`tpkgMidDaySelect${newIndex}`);
        };

        const deleteBtn = oldRow.querySelector(`#midDayDeleteBtn${i}`);
        deleteBtn.id = `midDayDeleteBtn${newIndex}`;
        deleteBtn.onclick = () => {
            deleteMidDay(newIndex);
        };

        const msg = oldRow.querySelector(`#midDayMsg${i}`);
        msg.id = `midDayMsg${newIndex}`;

        const actionRow = oldRow.querySelector(`#midDayActionBtnsRow${i}`);
        if (actionRow) {
            actionRow.id = `midDayActionBtnsRow${newIndex}`;
        }

        // ✅ Update the onchange handler with closure-captured index
        oldSelect.onchange = function () {
            const selectedValue = JSON.parse(this.value);
            console.log("Selected DayPlan:", selectedValue);

            const selectedDayNum = this.parentNode.parentNode.children[0].children[0].innerText.split(" ")[2];
            console.log("Selected Day Number:", selectedDayNum);

            const msgElement = document.getElementById(`midDayMsg${newIndex}`);

            let isDuplicate = tpkg.dayplans.some(dp => dp && dp.id === selectedValue.id);

            if (isDuplicate) {
                showAlertModal('war', 'This DayPlan has already been selected!');
                this.value = "";
                this.style.border = "2px solid red";
            } else {
                if (selectedValue.is_template) {
                    this.style.border = "2px solid orange";
                    msgElement.classList.remove("d-none");

                    tpkg.dayplans[selectedDayNum - 1] = null;
                    updateTotalDaysCount();
                    showTotalKmCount();
                    addNewDaysBtn.disabled = true;
                } else {
                    this.style.border = "2px solid lime";
                    msgElement.classList.add("d-none");

                    tpkg.dayplans[selectedDayNum - 1] = selectedValue;
                    updateTotalDaysCount();
                    showTotalKmCount();

                    addNewDaysBtn.disabled = false;
                    finalDaySelectUseTempsBtn.disabled = false;
                    finalDaySelectUseExistingBtn.disabled = false;
                }

                document.getElementById(`showMidDayBtn${newIndex}`).disabled = false;
                document.getElementById(`midDayDeleteBtn${newIndex}`).disabled = false;
            }
        };
    }

    // Shift the array elements
    for (let i = index; i < midDayCounter - 1; i++) {
        tpkg.dayplans[i - 1] = tpkg.dayplans[i];
    }
    tpkg.dayplans.pop();

    midDayCounter--;
    updateTotalDaysCount();

    document.getElementById('addNewDaysBtn').disabled = false;

    console.log("Updated tpkg.dayplans after deletion:", tpkg.dayplans);
};

// remove the final day from the tpkg
const removeFinalDay = () => {

    const finalDaySelectElement = document.getElementById('tpkgFinalDaySelect');

    tpkg.ed_dayplan_id = null;

    document.getElementById('showFinalDayBtn').disabled = true;
    document.getElementById('removeFinalDayBtn').disabled = true;

    finalDaySelectElement.value = "";
    finalDaySelectElement.style.border = "1px solid #ced4da";
    finalDaySelectElement.disabled = true;

    //updateTourEndDate();
    updateTotalDaysCount();
    showDnGAvailabilityButtons();
    showVehiAvailabilityButtons();
}

//check errors before adding 💥💥💥💥💥
const checkTpkgFormErrors = () => {

    let errors = "";

    if (tpkg.pkgtitle == null) {
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

//add a tpkg
const addNewTpkg = async () => {

    const errors = checkTpkgFormErrors();
    if (errors == "") {
        const userConfirm = confirm("Are you sure you want to add this package?");
        if (userConfirm) {
            try {

                //bind addiCost array with the tpkg obj 💥💥💥
                //console.log("tpkg.addiCostList:", tpkg.addiCostList);

                //remove null days from dayplans list
                tpkg.dayplans = tpkg.dayplans.filter(dp => dp !== null);

                const postServerResponse = await ajaxPPDRequest("/tpkg", "POST", tpkg);
                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    refreshAddiCostForm();
                    refreshTpkgForm();
                    buildTpkgTable();
                    var tpkgTblTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    tpkgTblTab.show();
                } else { showAlertModal('err', 'Submit Failed ' + postServerResponse); }
            } catch (error) { showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message)); }
        } else { showAlertModal('inf', 'User cancelled the task'); }
    } else { showAlertModal('war', errors); }

}

//image binding
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

// clear image
const clearImg = (imgProperty, previewId) => {
    if (tpkg[imgProperty] != null) {
        let userConfirmImgDlt = confirm("Are You Sure To Remove This Image?");
        if (userConfirmImgDlt) {
            tpkg[imgProperty] = null;
            previewId.src = 'images/sigiriya.jpg';
        } else {
            alert("User Cancelled The Image Deletion Task");
        }
    }
}

// show the tour start date 
const showTourStartDate = () => {

    //actual date input
    const estimatedStartDateInput = document.getElementById('tpStartDateInput');

    //to display the start date
    const startDateDisplay = document.getElementById('tourStartDateDisplay');
    startDateDisplay.textContent = estimatedStartDateInput.value;

}

//calc tour end date and display it
const updateTourEndDate = () => {

    const startDateInputValue = document.getElementById('tpStartDateInput').value;
    const totalDaysCounterDisplay = document.getElementById('showTotalDaysCount').value;
    const endDateDisplay = document.getElementById('tourEndDateDisplay');

    //check if bothnecessary values are present
    if (!startDateInputValue || !totalDaysCounterDisplay) {
        endDateDisplay.innerText = "Please enter a start date and total days.";
        return;
    }

    const startDate = new Date(startDateInputValue);
    const totalDays = parseInt(totalDaysCounterDisplay);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + totalDays - 1);

    const formattedEndDate = endDate.toISOString().split('T')[0];
    endDateDisplay.innerText = formattedEndDate;

    tpkg.tourenddate = formattedEndDate;

    console.log("startDate:", startDate);
    console.log("totalDays:", totalDays);
    console.log("endDate:", endDate);


    // format and display the end date
    //const options = { year: 'numeric', month: 'long', day: 'numeric' };
    //endDateDisplay.innerText = endDate.toLocaleDateString(undefined, options);
};

//💥💥💥💥💥💥💥💥💥💥💥
//add , delete, update
//check errors, check updates 
//refill 
//print




//################ additional costs related codes ###################

//tpkg.addiCostList = new Array();

//refresh the additional cost form
const refreshAddiCostForm = () => {

    addiCost = new Object();

    document.getElementById('addCostUpdateBtn').disabled = true;
    document.getElementById('addCostUpdateBtn').style.cursor = 'not-allowed';

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

//check errors in additional costs form 💥💥
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

//create addi cost table
const createAddiCostTable = () => {

    const tbody = document.getElementById('additionalCostTableBody');
    tbody.innerHTML = '';

    tpkg.addiCostList.forEach((cost, index) => {
        const row = document.createElement('tr');
        row.classList.add('no-hover');

        const idCell = document.createElement('td');
        idCell.innerText = index + 1;
        row.appendChild(idCell);

        const nameCell = document.createElement('td');
        nameCell.innerText = cost.costname;
        row.appendChild(nameCell);

        const amountCell = document.createElement('td');
        amountCell.innerText = `LKR ${parseFloat(cost.amount).toFixed(2)}`;
        row.appendChild(amountCell);

        const actionCell = document.createElement('td');
        actionCell.className = 'text-center';

        const btnGroup = document.createElement('div');
        btnGroup.className = '';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-outline-primary me-1';
        viewBtn.innerText = 'View';
        viewBtn.onclick = () => showNote(cost);
        btnGroup.appendChild(viewBtn);

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary me-1';
        editBtn.innerText = 'Edit';
        editBtn.onclick = () => refillAdditionalCostFormNew(cost);
        btnGroup.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerText = 'Delete';
        deleteBtn.onclick = () => {
            tpkg.addiCostList.splice(index, 1);
            createAddiCostTable();
            updateTotalAdditionalCost();
            refreshAddiCostForm();
        };
        btnGroup.appendChild(deleteBtn);

        actionCell.appendChild(btnGroup);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    })
}

// add additional cost to the table
const addAddiCostToTable = () => {

    const errors = checkAddiCostFormErrors();

    if (errors == '') {
        const userConfirm = confirm("Are you sure you sure to add this additional cost?");
        if (userConfirm) {
            tpkg.addiCostList.push(addiCost);
            createAddiCostTable();
            updateTotalAdditionalCost();
            console.log("addAddiCostToTable success");
            refreshAddiCostForm();
        }
    } else {
        alert('Form Has Followimg Errors \n \n' + errors);
    }

}

// show all the info in an alert in once
//use custom alert 💥💥💥
const showNote = (addiCostObj) => {
    alert(addiCostObj.costname + "\n" + addiCostObj.amount);
}

//refill the same form with the data of the selected row
const refillAdditionalCostFormNew = (addiCostObj) => {

    refreshAddiCostForm();

    document.getElementById('additionalCostName').value = addiCostObj.costname;
    document.getElementById('additionalCostAmount').value = addiCostObj.amount;
    document.getElementById('additionalCostNote').value = addiCostObj.note;

    document.getElementById('addCostAddBtn').style.cursor = 'not-allowed';
    document.getElementById('addCostAddBtn').disabled = true;

    document.getElementById('addCostUpdateBtn').style.cursor = 'pointer';
    document.getElementById('addCostUpdateBtn').disabled = false;

    //to support updating the same row
    editingRowData = addiCostObj;

}

//update a cost in the table 
const updateAddCost = () => {

    const costName = document.getElementById('additionalCostName').value.trim();
    const amount = parseFloat(document.getElementById('additionalCostAmount').value);
    const note = document.getElementById('additionalCostNote').value.trim();

    const errors = checkAddiCostFormErrors();

    if (errors !== '') {

        const userConfirm = confirm("Are you sure you want to update this additional cost?");
        if (userConfirm) {

            editingRowData.costname = costName;
            editingRowData.amount = amount;
            editingRowData.note = note;

            createAddiCostTable();
            refreshAddiCostForm();
            updateTotalAdditionalCost();
            editingRowData = null;

            document.getElementById('addCostAddBtn').style.cursor = 'pointer';
            document.getElementById('addCostAddBtn').disabled = false;

            console.log("updateAddCost success");
        }
    } else {
        alert('Form Has Following Errors \n \n' + errors);
    }
};

// calculate the total additional cost and update the field
const updateTotalAdditionalCost = () => {
    let total = 0.00;

    tpkg.addiCostList.forEach(cost => {
        total += parseFloat(cost.amount) || 0.00;
    });

    const totalAmountField = document.getElementById("totalAdditionalCosts");
    totalAmountField.value = total.toFixed(2);
    tpkg.totaladditionalcosts = Number(total.toFixed(2));

    //update the total cost sum and final price too
    calcTotalCostSum();
};


//######################################################

//not used 💥
const filterDayPlanTemplatesByDistrict = () => {
    const rawValue = document.getElementById('dpTemplateStartDistrict ').value;
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





