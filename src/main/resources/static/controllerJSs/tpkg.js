window.addEventListener('load', () => {

    buildTpkgTable();
    refreshTpkgForm();
    refreshAddiCostForm();
    fetchPriceMods();
    fetchDays();
    fetchTemplateDaysForRefill();

});

//get all day plans and save in global variables
let onlyFirstDays = [];
let onlyLastDays = [];
let onlyMidDays = [];
let onlyTemplates = [];
let allActiveInqs = [];
let vehiTypes = [];

const fetchDays = async () => {

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

    //get template days only
    try {
        onlyTemplates = await ajaxGetReq("/dayplan/onlytemplatedays");
    } catch (error) {
        console.error('Error fetching mid days:', error);
    }


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
}

//global var to store id of the table
let sharedTableIdForTpkg = "mainTableTpkg";

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

        createTable(tableTpkgHolderDiv, sharedTableIdForTpkg, tpkgs, tableColumnInfo, openModalTpkg);

        $(`#${sharedTableIdForTpkg}`).dataTable();

    } catch (error) {
        console.error("Failed to build table:", error);
    }
}

//to ready the main form   
const refreshTpkgForm = async () => {

    //general changes. no matter loggeduser role

    //general changes for entire form
    tpkg = new Object();
    tpkg.dayplans = new Array();
    tpkg.addiCostList = new Array();
    document.getElementById('formTpkg').reset();

    //general changes for tabs
    document.getElementById('tpkgStep3-tab').innerText = "Preferences";
    preferencesFieldset.classList.remove('d-none');
    document.getElementById('tpkgStep4-tab').parentElement.classList.remove('d-none');

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
        'pkgStartingPrice',
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

    //clear out any previous styles
    radioIdsToReset.forEach(id => {
        const radio = document.getElementById(id);
        if (radio) {
            radio.checked = false;
            radio.disabled = false;
        }
    });

    //get the logged user's emp id to filter inquiries assigned to him
    const loggedEmpId = document.getElementById('loggedUserEmpIdSectionId').textContent;
    console.log(loggedEmpId);

    // refresh based inq field active inquiries of the logged user
    try {
        allActiveInqs = await ajaxGetReq("/inq/personal/active?empid=" + loggedEmpId);
        fillDataIntoDynamicSelects(tpkgBasedInq, 'Please select based inquiry', allActiveInqs, 'inqcode', 'clientname')
    } catch (error) {
        console.error("Failed to fetch inquiries for assigned user:", error);
    }

    //date must be shown first and web desc must hidden
    document.getElementById('startDateCol').classList.remove('d-none');
    document.getElementById('tpDescRow').classList.add('d-none');

    //changes to the first final days and its buttons
    //first day
    document.getElementById('tpkgFirstDaySelect').disabled = true;
    document.getElementById('firstDayMsg').classList.add('d-none');
    document.getElementById('showFirstDayBtn').disabled = true;

    //final day
    document.getElementById('tpkgFinalDaySelect').disabled = true;
    document.getElementById('finalDayMsg').classList.add('d-none');
    document.getElementById('showFinalDayBtn').disabled = true;
    document.getElementById('removeFinalDayBtn').disabled = true;
    document.getElementById('finalDaySelectUseTempsBtn').disabled = true;
    document.getElementById('finalDaySelectUseExistingBtn').disabled = true;

    //reset mid days selection section and its button
    document.getElementById('addNewDaysBtn').disabled = true;
    document.getElementById('tpkgMidDaysSelectSection').innerHTML = '';
    //template msg for each day 💥💥💥

    //reset dayplans info showing section and its button
    resetDayPlanInfoSection();
    document.getElementById('dayPlanInfoEditBtn').disabled = true;

    //reset traveller grp count section
    //all values must be 0 and child ones must disabled

    const trvlrGrpLocalAdult = document.getElementById('tpkgLocalAdultCount');
    const trvlrGrpLocalChild = document.getElementById('tpkgLocalChildCount');
    const trvlrGrpForeignAdult = document.getElementById('tpkgForeignAdultCount');
    const trvlrGrpForeignChild = document.getElementById('tpkgForeignChildCount');

    trvlrGrpLocalAdult.value = 0;
    trvlrGrpLocalChild.value = 0;
    trvlrGrpForeignAdult.value = 0;
    trvlrGrpForeignChild.value = 0;

    trvlrGrpLocalChild.disabled = true;
    trvlrGrpForeignChild.disabled = true;

    // reset vehicle types selector
    try {
        vehiTypes = await ajaxGetReq("/vehitypes/all");
        fillDataIntoDynamicSelects(tpkgVehitype, 'Select Vehicle Type', vehiTypes, 'name');
    } catch (error) {
        console.error("Failed to fetch form data vehicles:", error);
    }

    //reset sd and ed displaying (in preferences section, not inputs)
    document.getElementById('tourStartDateDisplay').innerText = 'Start Date Not Selected';
    document.getElementById('tourEndDateDisplay').innerText = 'Please Add Day Plans';

    //reset the 3 fields that shows resources availability
    showVehiAvailabilityButtons();
    showDnGAvailabilityButtons();

    //guide options initially disabled
    document.getElementById('yathraGuideCB').disabled = true;
    document.getElementById('rentalGuideCB').disabled = true;

    // reset additionalcost table 
    document.getElementById("additionalCostTableBody").innerHTML = "";

    //reset additionalCost inner form
    refreshAddiCostForm();

    //reset additional cost add btn
    document.getElementById('addCostAddBtn').disabled = false;

    //reset total costs section 
    document.getElementById('totalTktCostGroup').classList.remove('d-none');
    document.getElementById('totalTktCostMsg').classList.add('d-none');

    document.getElementById('totalVehiParkCostGroup').classList.remove('d-none');
    document.getElementById('totalVehicleParkingCostMsg').classList.add('d-none');

    document.getElementById('totalLunchCostGroup').classList.remove('d-none');
    document.getElementById('totalLunchCostMsg').classList.add('d-none');

    document.getElementById('totalVehiCostGroup').classList.remove('d-none');
    document.getElementById('totalVehicleCostMsg').classList.add('d-none');

    document.getElementById('totalStayCostGroup').classList.remove('d-none');
    document.getElementById('totalStayCostMsg').classList.add('d-none');

    document.getElementById('totalDriverCostGroup').classList.remove('d-none');
    document.getElementById('totalDriverCostMsg').classList.add('d-none');

    document.getElementById('totalGuideCostGroup').classList.remove('d-none');
    document.getElementById('totalGuideCostMsg').classList.add('d-none');

    document.getElementById('finalTotalCost').value = '';
    document.getElementById('pkgSellingPrice').value = '';

    //discount section
    const noneCb = document.getElementById('discountNone');
    const loyalityCb = document.getElementById('discountLoyality');
    const offpeakCb = document.getElementById('discountOffpeak');

    noneCb.disabled = false;
    noneCb.checked = true;

    loyalityCb.checked = false;
    offpeakCb.checked = false;

    loyalityCb.disabled = true;
    offpeakCb.disabled = true;

    //reset final price section
    const pkgFinalPriceShowInput = document.getElementById('pkgFinalPrice');
    pkgFinalPriceShowInput.value = '';
    pkgFinalPriceShowInput.style.border = "1px solid #ced4da";

    //set status auto
    const tpkgStatusSelectElement = document.getElementById('tpSelectStatus');
    tpkg.tpkg_status = "Draft";
    tpkgStatusSelectElement.value = "Draft";
    tpkgStatusSelectElement.style.border = "2px solid lime";

    //get logged user roles
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);
    const roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    //changes for higher users
    if (roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager")) {

        //enable for website radio
        document.getElementById('forWebSite').disabled = false;

        //only hide last child, 'if deleted' in status
        tpkgStatusSelectElement.children[5].classList.add('d-none');

        //show the 3rd and 4th childs
        tpkgStatusSelectElement.children[3].classList.remove('d-none');
        tpkgStatusSelectElement.children[4].classList.remove('d-none');

    } else {

        //disable for website radio
        document.getElementById('forWebSite').disabled = true;

        //hide options from 3 to 5 in status
        for (let i = 3; i <= 5; i++) {
            if (tpkgStatusSelectElement.children[i]) {
                tpkgStatusSelectElement.children[i].classList.add('d-none');
            }
        }

    }

    //disable update btn
    const updateBtn = document.getElementById('tpkgUpdateBtn');
    updateBtn.disabled = true;
    updateBtn.style.cursor = "not-allowed";

    //enable add button
    const addBtn = document.getElementById('tpkgAddBtn');
    addBtn.disabled = false;
    addBtn.style.cursor = "pointer";

    //set the min start date to 7 days future
    setTpkgStartDateToFuture();

}

//clear out the form everytime a user switches to table tab   
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTabTpkg').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshTpkgForm();
        }
    });
});

//to reset the modal when opening it
const resetModalTpkg = () => {

    // Hide deleted record message
    const deletedMsg = document.getElementById('modTpkgIfDeleted');
    if (deletedMsg) {
        deletedMsg.innerText = '';
        deletedMsg.classList.add('d-none');
    }

    // Enable and show edit/delete buttons
    const editBtn = document.getElementById('modalDPEditBtn');
    const deleteBtn = document.getElementById('modalDPDeleteBtn');
    if (editBtn && deleteBtn) {
        editBtn.disabled = false;
        deleteBtn.disabled = false;
        editBtn.classList.remove('d-none');
        deleteBtn.classList.remove('d-none');
    }

    // Hide recover button
    const recoverBtn = document.getElementById('modalDPRecoverBtn');
    if (recoverBtn) {
        recoverBtn.classList.add('d-none');
    }
};

//open modal to show all the info
const openModalTpkg = (tpkgObj) => {

    resetModalTpkg();

    // Show template info if applicable
    if (!tpkgObj.is_custompkg) {
        document.getElementById('modTpkgInfoTemplate').classList.remove('d-none');
        document.getElementById('modTpkgIsTemplateOrNot').innerText = 'This is a Template Package';
    }

    // Basic Info
    document.getElementById('modTpkgCode').innerText = tpkgObj.pkgcode || 'N/A';
    document.getElementById('modTpkgTitle').innerText = tpkgObj.pkgtitle || 'N/A';
    document.getElementById('modTpkgBasedInq').innerText = tpkgObj.basedinq?.inqcode || 'N/A';

    document.getElementById('modTpkgStartDate').innerText = tpkgObj.tourstartdate || 'N/A';
    document.getElementById('modTpkgEndDate').innerText = tpkgObj.tourenddate || 'N/A';
    document.getElementById('modTpkgDays').innerText = tpkgObj.totaldays || 'N/A';

    // Traveller Counts
    document.getElementById('modTpkgLocalAdults').innerText = tpkgObj.localadultcount ?? 0;
    document.getElementById('modTpkgLocalChildren').innerText = tpkgObj.localchildcount ?? 0;
    document.getElementById('modTpkgForeignAdults').innerText = tpkgObj.foreignadultcount ?? 0;
    document.getElementById('modTpkgForeignChildren').innerText = tpkgObj.foreignchildcount ?? 0;

    const dayplansContainer = document.getElementById('modTpkgDayPlans');
    let allDayBadges = [];

    // Start Day Plan
    if (tpkgObj.sd_dayplan_id) {
        allDayBadges.push(`<div><span class="badge bg-info text-dark fs-6 px-3 py-2 mb-2 fw-semibold">Start - ${tpkgObj.sd_dayplan_id.daytitle} (${tpkgObj.sd_dayplan_id.dayplancode})</span></div>`);
    }

    // Mid Day Plans
    if (tpkgObj.dayplans && tpkgObj.dayplans.length > 0) {
        tpkgObj.dayplans.forEach((dp, i) => {
            allDayBadges.push(`<div><span class="badge bg-info text-dark fs-6 px-3 py-2 mb-2 fw-semibold">Day ${i + 2} - ${dp.daytitle} (${dp.dayplancode})</span></div>`);
        });
    }

    // End Day Plan
    if (tpkgObj.ed_dayplan_id) {
        allDayBadges.push(`<div><span class="badge bg-info text-dark fs-6 px-3 py-2 mb-2 fw-semibold">End - ${tpkgObj.ed_dayplan_id.daytitle} (${tpkgObj.ed_dayplan_id.dayplancode})</span></div>`);
    }

    dayplansContainer.innerHTML = allDayBadges.length > 0 ? allDayBadges.join('') : 'N/A';


    // Show Preview Image if available
    const previewSection = document.getElementById('modTpkgImagePreviewSection');
    const previewImg = document.getElementById('modTpkgPreviewImg');

    if (tpkgObj.img1) {
        previewSection.classList.remove('d-none');
        previewImg.src = atob(tpkgObj.img1);
    } else {
        previewSection.classList.add('d-none');
        previewImg.src = 'images/sigiriya.jpg';
    }

    // Cost Summary
    document.getElementById('modTpkgTotalTktCost').innerText = 'LKR ' + (tpkgObj.totaltktcost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgTotalLunchCost').innerText = 'LKR ' + (tpkgObj.totallunchcost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgTotalParkingCost').innerText = 'LKR ' + (tpkgObj.totalvehiparkingcost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgTotalVehicleCost').innerText = 'LKR ' + (tpkgObj.totalvehicost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgTotalDriverCost').innerText = 'LKR ' + (tpkgObj.totaldrivercost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgTotalGuideCost').innerText = 'LKR ' + (tpkgObj.totalguidecost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgTotalStayCost').innerText = 'LKR ' + (tpkgObj.totalstaycost?.toFixed(2) || '0.00');
    document.getElementById('modTpkgAddCostTotal').innerText = 'LKR ' + (tpkgObj.totaladditionalcosts?.toFixed(2) || '0.00');
    document.getElementById('modTpkgPkgCostSum').innerText = 'LKR ' + (tpkgObj.pkgcostsum?.toFixed(2) || '0.00');
    document.getElementById('modTpkgSellingPrice').innerText = 'LKR ' + (tpkgObj.pkgsellingprice?.toFixed(2) || '0.00');
    document.getElementById('modTpkgFinalPrice').innerText = 'LKR ' + (tpkgObj.pkgfinalprice?.toFixed(2) || '0.00');

    // Booleans
    document.getElementById('modTpkgIsGuideNeeded').innerText = tpkgObj.is_guide_needed ? 'Yes' : 'No';
    document.getElementById('modTpkgIsCompanyGuide').innerText = tpkgObj.is_company_guide ? 'Yes' : 'No';
    document.getElementById('modTpkgIsCompanyVehicle').innerText = tpkgObj.is_company_vehicle ? 'Yes' : 'No';
    document.getElementById('modTpkgIsCompanyDriver').innerText = tpkgObj.is_company_driver ? 'Yes' : 'No';

    // Preferred Vehicle
    document.getElementById('modTpkgPrefVehicleType').innerText = tpkgObj.pref_vehi_type || 'N/A';

    // Web Desc & Notes
    document.getElementById('modTpkgWebDesc').innerText = tpkgObj.web_description || 'N/A';
    document.getElementById('modTpkgNote').innerText = tpkgObj.note || 'N/A';

    // Status
    document.getElementById('modTpkgStatus').innerText = tpkgObj.tpkg_status || 'N/A';

    // Deleted Record
    if (tpkgObj.deleted_tpkg) {
        const deletedBanner = document.getElementById('modTpkgIfDeleted');
        const editBtn = document.getElementById('modalDPEditBtn');
        const deleteBtn = document.getElementById('modalDPDeleteBtn');
        const recoverBtn = document.getElementById('modalDPRecoverBtn');

        // Show deleted message
        deletedBanner.classList.remove('d-none');
        deletedBanner.innerHTML = 'This is a deleted record.<br>Deleted at ' +
            new Date(tpkgObj.deleteddatetime).toLocaleString();

        // Disable edit & delete buttons and hide them
        editBtn.disabled = true;
        deleteBtn.disabled = true;
        editBtn.classList.add('d-none');
        deleteBtn.classList.add('d-none');

        // Show restore button
        recoverBtn.classList.remove('d-none');
    }


    // Show modal
    $('#infoModalTpkg').modal('show');
};

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

//load templates and save globally just for refill
let templateDaysForRefill = [];

const fetchTemplateDaysForRefill = async () => {

    try {
        templateDaysForRefill = await ajaxGetReq("/dayplan/onlytemplatedays");
    } catch (error) {
        console.error("Error loading templates:", error);
    }
}

//refill the TPKG
const refillTpkgForm = (tpkgObj) => {

    console.log("Refilling Template Package Form with data:", tpkgObj);

    tpkg = JSON.parse(JSON.stringify(tpkgObj));
    oldTpkg = JSON.parse(JSON.stringify(tpkgObj));

    //refill generally, doesnt matter the type (custom or template)
    //title and code
    document.getElementById("inputPkgTitle").value = tpkgObj.pkgtitle || "";
    document.getElementById("inputPkgCode").value = tpkgObj.pkgcode || "";

    //total days and km count
    document.getElementById('showTotalKMCount').value = tpkgObj.totalkmcount;
    document.getElementById('showTotalDaysCount').value = tpkgObj.totaldays;

    // note , status
    document.getElementById('tpNote').value = tpkgObj.note;
    document.getElementById('tpSelectStatus').value = tpkgObj.tpkg_status;

    //type based changes   
    //first setup UI for both types
    if (tpkgObj.is_custompkg === true) {
        document.getElementById("customTP").checked = true;
    } else if (tpkgObj.is_custompkg === false) {
        document.getElementById("forWebSite").checked = true;
    }

    changesTpkgCustomOrTemp();

    //for custom pkgs
    if (tpkgObj.is_custompkg === true) {

        //based inquiry
        if (tpkg.basedinq != null) {
            fillDataIntoDynamicSelects(tpkgBasedInq, 'Please select based inquiry', allActiveInqs, 'inqcode', tpkgObj.basedinq.inqcode);
            tpkgBasedInq.disabled = false;
        }

        //approx start date
        document.getElementById("tpStartDateInput").value = tpkgObj.tourstartdate || "";

        //start day plan
        fillDataIntoDynamicSelects(tpkgFirstDaySelect, 'please select first day plan', onlyFirstDays, 'daytitle', tpkgObj.sd_dayplan_id.daytitle);

        //last day plan 💥
        fillDataIntoDynamicSelects(tpkgFinalDaySelect, 'please select final day plan', onlyLastDays, 'daytitle', tpkgObj.ed_dayplan_id.daytitle);

        //reset midday counter
        let midDayCounter = 1;

        //mid days    
        for (let i = 0; i < tpkgObj.dayplans.length; i++) {

            console.log("Processing mid day plan start:", i);
            const dayPlan = tpkgObj.dayplans[i];
            console.log(dayPlan);

            //created once per loop element
            generateNormalDayPlanSelectSections();

            setTimeout(() => {
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

                document.getElementById(`showMidDayBtn${i + 1}`).disabled = false;
                document.getElementById(`midDayDeleteBtn${i + 1}`).disabled = false;

            }, 150);

            midDayCounter++;
        }

        //traevellers counts
        document.getElementById("tpkgLocalAdultCount").value = tpkgObj.localadultcount ?? 0;
        document.getElementById("tpkgLocalChildCount").value = tpkgObj.localchildcount ?? 0;
        document.getElementById("tpkgForeignAdultCount").value = tpkgObj.foreignadultcount ?? 0;
        document.getElementById("tpkgForeignChildCount").value = tpkgObj.foreignchildcount ?? 0;

        // update total travellers
        updateTotalTravellers();

        // preferred vehicle type
        fillDataIntoDynamicSelects(
            document.getElementById("tpkgVehitype"),
            'Please Select Vehicle Type',
            vehiTypes,
            'vehiclename',
            tpkgObj.pref_vehi_type
        );

        // include guide
        if (tpkgObj.is_guide_needed === true) {
            document.getElementById("guideYes").checked = true;
        } else if (tpkgObj.is_guide_needed === false) {
            document.getElementById("guideNo").checked = true;
        }
        handleNeedGuideCB();

        // vehicle source (int or ext)
        if (tpkgObj.is_company_vehicle === true) {
            document.getElementById("yathraVehiCB").checked = true;
        } else if (tpkgObj.is_company_vehicle === false) {
            document.getElementById("rentalVehiCB").checked = true;
        }

        // driver source (int or ext)
        if (tpkgObj.is_company_driver === true) {
            document.getElementById("yathraDriverCB").checked = true;
        } else if (tpkgObj.is_company_driver === false) {
            document.getElementById("rentalDriverCB").checked = true;
        }

        // guide source (int or ext)
        if (tpkgObj.is_company_guide === true) {
            document.getElementById("yathraGuideCB").checked = true;
        } else if (tpkgObj.is_company_guide === false) {
            document.getElementById("rentalGuideCB").checked = true;
        }

        //additional cost entire table create again 💥💥💥

        //refill all the related costs
        document.getElementById('totalTktCostInput').value = tpkgObj.totaltktcost.toFixed(2);
        document.getElementById('totalVehicleParkingCost').value = tpkgObj.totalvehiparkingcost.toFixed(2);
        document.getElementById('totalLunchCostForAll').value = tpkgObj.totallunchcost.toFixed(2);
        document.getElementById('totalVehiCostInput').value = tpkgObj.totalvehicost.toFixed(2);
        document.getElementById('totalStayCostInput').value = tpkgObj.totalstaycost.toFixed(2);
        document.getElementById('totalDriverCostInput').value = tpkgObj.totaldrivercost.toFixed(2);
        document.getElementById('totalGuideCostInput').value = tpkgObj.totalguidecost.toFixed(2);
        document.getElementById('totalAdditionalCosts').value = tpkgObj.totaladditionalcosts.toFixed(2);
        document.getElementById('finalTotalCost').value = tpkgObj.pkgcostsum.toFixed(2);
        document.getElementById('pkgSellingPrice').value = tpkgObj.pkgsellingprice.toFixed(2);
        document.getElementById('pkgSellingPrice').value = tpkgObj.pkgsellingprice.toFixed(2);

        //discounts
        refillDiscountSection(tpkgObj);

        //final price cx will see
        document.getElementById('pkgFinalPrice').value = tpkgObj.pkgfinalprice.toFixed(2);

    }

    //for template pkgs
    if (tpkgObj.is_custompkg === false) {

        //web description
        document.getElementById("tpDescription").value = tpkgObj.web_description || "";

        //start day plan (with templates)
        fillDataIntoDynamicSelects(tpkgFirstDaySelect, 'please select first day plan', templateDaysForRefill, 'daytitle', tpkgObj.sd_dayplan_id.daytitle);
        tpkgFirstDaySelect.disabled = false;

        //last day plan (with templates)
        fillDataIntoDynamicSelects(tpkgFinalDaySelect, 'please select final day plan', templateDaysForRefill, 'daytitle', tpkgObj.ed_dayplan_id.daytitle);
        tpkgFinalDaySelect.disabled = false;

        //reset midday counter
        let midDayCounter = 1;

        //mid days (with templates)   
        for (let i = 0; i < tpkgObj.dayplans.length; i++) {

            console.log("Processing mid day plan start:", i);
            const dayPlan = tpkgObj.dayplans[i];
            console.log(dayPlan);

            //created once per loop element
            generateNormalDayPlanSelectSections();

            setTimeout(() => {
                const midDaySelectId = `tpkgMidDaySelect${i + 1}`;
                const selectElement = document.getElementById(midDaySelectId);

                selectElement.disabled = false;

                fillDataIntoDynamicSelects(
                    selectElement,
                    'Please Select',
                    templateDaysForRefill,
                    'daytitle',
                    dayPlan.daytitle
                );

                document.getElementById(`showMidDayBtn${i + 1}`).disabled = false;
                document.getElementById(`midDayDeleteBtn${i + 1}`).disabled = false;

            }, 150);

            midDayCounter++;
        }

        //refill all 3 images 
        const defaultImgPath = "images/sigiriya.jpg";

        if (tpkgObj.img1 != null) {
            imgPreview1.src = atob(tpkgObj.img1);
        } else {
            imgPreview1.src = defaultImgPath;
        }

        if (tpkgObj.img2 != null) {
            imgPreview2.src = atob(tpkgObj.img2);
        } else {
            imgPreview2.src = defaultImgPath;
        }

        if (tpkgObj.img3 != null) {
            imgPreview3.src = atob(tpkgObj.img3);
        } else {
            imgPreview3.src = defaultImgPath;
        }

        //refill per person price
        document.getElementById('pkgStartingPrice').value = tpkgObj.pkgstartingprice.toFixed(2);

    }

    //reactive days related button
    document.getElementById('showFirstDayBtn').disabled = false;
    document.getElementById('addNewDaysBtn').disabled = false;
    document.getElementById('showFinalDayBtn').disabled = false;
    document.getElementById('removeFinalDayBtn').disabled = false;
    document.getElementById('finalDaySelectUseTempsBtn').disabled = false;
    document.getElementById('finalDaySelectUseExistingBtn').disabled = false;

    //reactive update button
    const updateBtn = document.getElementById('tpkgUpdateBtn');
    updateBtn.disabled = false;
    updateBtn.style.cursor = "pointer";

    //disable add button
    const addBtn = document.getElementById('tpkgAddBtn');
    addBtn.disabled = true;
    addBtn.style.cursor = "not-allowed";

    $("#infoModalTpkg").modal("hide");

    var myTPKGFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myTPKGFormTab.show();

    var step1Tab = new bootstrap.Tab(document.getElementById('tpkgStep1-tab'));
    step1Tab.show();

    //reset middle day counter for later use
    midDayCounter = 1;

}

//show updated values
const showTpkgValueChanges = () => {
    let updates = "";

    if (tpkg.is_custompkg !== oldTpkg.is_custompkg) {
        updates += `Package type will be changed to "${tpkg.is_custompkg ? 'Custom Package' : 'Template Package'}"\n`;
    }

    if (tpkg.pkgtitle !== oldTpkg.pkgtitle) {
        updates += `Package title will be changed to "${tpkg.pkgtitle}"\n`;
    }

    if (tpkg.basedinq !== oldTpkg.basedinq) {
        updates += `Based inquiry will be changed to "${tpkg.basedinq}"\n`;
    }

    if (tpkg.tourstartdate !== oldTpkg.tourstartdate) {
        updates += `Tour start date will be changed to "${tpkg.tourstartdate}"\n`;
    }

    if (tpkg.tourenddate !== oldTpkg.tourenddate) {
        updates += `Tour end date will be changed to "${tpkg.tourenddate}"\n`;
    }

    if (tpkg.totaldays !== oldTpkg.totaldays) {
        updates += `Total days will be changed to "${tpkg.totaldays}"\n`;
    }

    // Travellers
    if (tpkg.localadultcount !== oldTpkg.localadultcount) {
        updates += `Local adult count will be changed to "${tpkg.localadultcount}"\n`;
    }

    if (tpkg.localchildcount !== oldTpkg.localchildcount) {
        updates += `Local child count will be changed to "${tpkg.localchildcount}"\n`;
    }

    if (tpkg.foreignadultcount !== oldTpkg.foreignadultcount) {
        updates += `Foreign adult count will be changed to "${tpkg.foreignadultcount}"\n`;
    }

    if (tpkg.foreignchildcount !== oldTpkg.foreignchildcount) {
        updates += `Foreign child count will be changed to "${tpkg.foreignchildcount}"\n`;
    }

    // Start & End Day Plan
    if ((tpkg.sd_dayplan_id?.id) !== (oldTpkg.sd_dayplan_id?.id)) {
        updates += `Start day plan will be changed to "${tpkg.sd_dayplan_id?.daytitle || 'N/A'}"\n`;
    }

    if ((tpkg.ed_dayplan_id?.id) !== (oldTpkg.ed_dayplan_id?.id)) {
        updates += `End day plan will be changed to "${tpkg.ed_dayplan_id?.daytitle || 'N/A'}"\n`;
    }

    // Mid days 💥
    if ((tpkg.dayplans?.length) !== (oldTpkg.dayplans?.length)) {
        updates += `Mid day plan count will be changed to "${tpkg.dayplans?.length}"\n`;
    }

    // Costs
    if (tpkg.totaltktcost !== oldTpkg.totaltktcost) {
        updates += `Total ticket cost will be changed to "${tpkg.totaltktcost} LKR"\n`;
    }

    if (tpkg.totallunchcost !== oldTpkg.totallunchcost) {
        updates += `Total lunch cost will be changed to "${tpkg.totallunchcost} LKR"\n`;
    }

    if (tpkg.totalvehiparkingcost !== oldTpkg.totalvehiparkingcost) {
        updates += `Total vehicle parking cost will be changed to "${tpkg.totalvehiparkingcost} LKR"\n`;
    }

    if (tpkg.totalvehicost !== oldTpkg.totalvehicost) {
        updates += `Total vehicle cost will be changed to "${tpkg.totalvehicost} LKR"\n`;
    }

    if (tpkg.totaldrivercost !== oldTpkg.totaldrivercost) {
        updates += `Total driver cost will be changed to "${tpkg.totaldrivercost} LKR"\n`;
    }

    if (tpkg.totalguidecost !== oldTpkg.totalguidecost) {
        updates += `Total guide cost will be changed to "${tpkg.totalguidecost} LKR"\n`;
    }

    if (tpkg.totalstaycost !== oldTpkg.totalstaycost) {
        updates += `Total stay cost will be changed to "${tpkg.totalstaycost} LKR"\n`;
    }

    if (tpkg.totaladditionalcosts !== oldTpkg.totaladditionalcosts) {
        updates += `Total additional costs will be changed to "${tpkg.totaladditionalcosts} LKR"\n`;
    }

    if (tpkg.pkgcostsum !== oldTpkg.pkgcostsum) {
        updates += `Package cost sum will be changed to "${tpkg.pkgcostsum} LKR"\n`;
    }

    if (tpkg.pkgfinalprice !== oldTpkg.pkgfinalprice) {
        updates += `Package final price will be changed to "${tpkg.pkgfinalprice} LKR"\n`;
    }

    // Others
    if (tpkg.note !== oldTpkg.note) {
        updates += `Note will be changed to "${tpkg.note}"\n`;
    }

    if (tpkg.tpkg_status !== oldTpkg.tpkg_status) {
        updates += `Status will be changed to "${tpkg.tpkg_status}"\n`;
    }

    // Guide, vehicle, driver
    if (tpkg.is_guide_needed !== oldTpkg.is_guide_needed) {
        updates += `Guide needed will be changed to "${tpkg.is_guide_needed ? 'Yes' : 'No'}"\n`;
    }

    if (tpkg.is_company_guide !== oldTpkg.is_company_guide) {
        updates += `Guide source will be changed to "${tpkg.is_company_guide ? 'Company Guide' : 'External Guide'}"\n`;
    }

    if (tpkg.is_company_vehicle !== oldTpkg.is_company_vehicle) {
        updates += `Vehicle source will be changed to "${tpkg.is_company_vehicle ? 'Company Vehicle' : 'Rental Vehicle'}"\n`;
    }

    if (tpkg.is_company_driver !== oldTpkg.is_company_driver) {
        updates += `Driver source will be changed to "${tpkg.is_company_driver ? 'Company Driver' : 'External Driver'}"\n`;
    }

    // Web
    if (tpkg.web_description !== oldTpkg.web_description) {
        updates += `Web description will be updated\n`;
    }

    if (tpkg.pref_vehi_type !== oldTpkg.pref_vehi_type) {
        updates += `Preferred transport type will be changed to "${tpkg.pref_vehi_type}"\n`;
    }

    // Images
    if (tpkg.img1 !== oldTpkg.img1) {
        updates += `Cover image will be updated\n`;
    }

    if (tpkg.img2 !== oldTpkg.img2) {
        updates += `Image 2 will be updated\n`;
    }

    if (tpkg.img3 !== oldTpkg.img3) {
        updates += `Image 3 will be updated\n`;
    }

    // Additional cost list
    if ((tpkg.addiCostList?.length) !== (oldTpkg.addiCostList?.length)) {
        updates += `Additional cost list has been updated\n`;
    }

    return updates;
};

//to update the TPKG
const updateTpkg = async () => {
    const errors = checkTpkgFormErrors();

    if (errors === "") {
        let updates = showTpkgValueChanges();

        if (updates === "") {
            showAlertModal('err', "No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed?\n\n" + updates);

            if (userConfirm) {
                try {
                    let putServiceResponse = await ajaxPPDRequest("/tpkg", "PUT", tpkg);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', 'Tour package updated successfully');
                        document.getElementById('formTpkg').reset();
                        refreshTpkgForm();
                        buildTpkgTable();

                        let myPkgTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myPkgTab.show();

                    } else {
                        showAlertModal('err', "Update failed\n" + putServiceResponse);
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
};

//delete tpkg
const deleteTpkgRecord = async (tpkgObj) => {
    const userConfirm = confirm("Are you sure to delete the package " + tpkgObj.pkgcode + " ?");
    if (userConfirm) {
        try {
            const deleteServerResponse = await ajaxPPDRequest("/tpkg", "DELETE", tpkgObj);

            if (deleteServerResponse === 'OK') {
                showAlertModal('suc', 'Record Deleted');
                $('#infoModalTpkg').modal('hide');
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

//restore after a deletion
const restoreTpkgRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {

            tpkg = window.currentObject;
            tpkg.deleted_tpkg = false;

            let putServiceResponse = await ajaxPPDRequest("/tpkg", "PUT", tpkg);

            if (putServiceResponse === "OK") {
                showAlertModal('suc', "Successfully Restored");
                $("#infoModalTpkg").modal("hide");

                setTimeout(() => {
                    window.location.reload();
                }, 200);


            } else {
                showAlertModal('err', "Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'User cancelled the restoration task');
    }
}

//print tpkg
const printTpkgRecord = (tpkgObj) => {
    if (!tpkgObj) {
        alert('No Tour Package data available to print.');
        return;
    }

    const travelersList = `
        <li>Local Adults: ${tpkgObj.localadultcount ?? 0}</li>
        <li>Local Children: ${tpkgObj.localchildcount ?? 0}</li>
        <li>Foreign Adults: ${tpkgObj.foreignadultcount ?? 0}</li>
        <li>Foreign Children: ${tpkgObj.foreignchildcount ?? 0}</li>
    `;

    const costList = `
        <li>Ticket Cost: LKR ${tpkgObj.totaltktcost?.toFixed(2) || '0.00'}</li>
        <li>Lunch Cost: LKR ${tpkgObj.totallunchcost?.toFixed(2) || '0.00'}</li>
        <li>Vehicle Parking Cost: LKR ${tpkgObj.totalvehiparkingcost?.toFixed(2) || '0.00'}</li>
        <li>Vehicle Cost: LKR ${tpkgObj.totalvehicost?.toFixed(2) || '0.00'}</li>
        <li>Driver Cost: LKR ${tpkgObj.totaldrivercost?.toFixed(2) || '0.00'}</li>
        <li>Guide Cost: LKR ${tpkgObj.totalguidecost?.toFixed(2) || '0.00'}</li>
        <li>Stay Cost: LKR ${tpkgObj.totalstaycost?.toFixed(2) || '0.00'}</li>
        <li>Additional Costs: LKR ${tpkgObj.totaladditionalcosts?.toFixed(2) || '0.00'}</li>
        <li><strong>Total Cost:</strong> LKR ${tpkgObj.pkgcostsum?.toFixed(2) || '0.00'}</li>
        <li><strong>Selling Price:</strong> LKR ${tpkgObj.pkgsellingprice?.toFixed(2) || '0.00'}</li>
        <li><strong>Final Price:</strong> LKR ${tpkgObj.pkgfinalprice?.toFixed(2) || '0.00'}</li>
    `;

    // Middle Day Plan List
    let middleDaysHTML = '';
    if (Array.isArray(tpkgObj.dayplans) && tpkgObj.dayplans.length > 0) {
        tpkgObj.dayplans.forEach((dp, idx) => {
            middleDaysHTML += `<li><strong>Middle Day ${idx + 1}:</strong> ${dp.daytitle || 'Untitled Day Plan'}</li>`;
        });
    } else {
        middleDaysHTML = '<li><strong>Middle Days:</strong> None</li>';
    }

    const dayPlanSectionHTML = `
        <div class="mb-2">
            <p class="h5 fw-bold text-primary">Day Plan Sequence</p>
            <ul style="padding-left: 18px;">
                <li><strong>First Day:</strong> ${tpkgObj.sd_dayplan_id?.daytitle || 'N/A'}</li>
                ${middleDaysHTML}
                <li><strong>Final Day:</strong> ${tpkgObj.ed_dayplan_id?.daytitle || 'N/A'}</li>
            </ul>
        </div>
    `;

    const modalContent = `
    <div class="container-fluid my-3 p-2 border border-primary rounded shadow-sm" style="font-family: Arial, sans-serif;">
        <h2 class="text-center text-primary mb-3">Tour Package Information</h2>
        <hr class="border border-primary border-2">

        <div class="mb-2">
            <p><strong>Package Code:</strong> ${tpkgObj.tpcode || 'N/A'}</p>
            <p><strong>Title:</strong> ${tpkgObj.pkgtitle || 'N/A'}</p>
            <p><strong>Status:</strong> ${tpkgObj.tpkg_status || 'N/A'}</p>
            <p><strong>Based Inquiry:</strong> ${tpkgObj.basedinq || 'N/A'}</p>
        </div>

        <div class="mb-2">
            <p><strong>Start Date:</strong> ${tpkgObj.tourstartdate || 'N/A'}</p>
            <p><strong>End Date:</strong> ${tpkgObj.tourenddate || 'N/A'}</p>
            <p><strong>Total Days:</strong> ${tpkgObj.totaldays || 0}</p>
        </div>

        <div class="mb-2">
            <p><strong>Travellers:</strong></p>
            <ul>${travelersList}</ul>
        </div>

        ${dayPlanSectionHTML}

        <div class="mb-2">
            <p><strong>Guide Included:</strong> ${tpkgObj.is_guide_needed ? 'Yes' : 'No'}</p>
            <p><strong>Company Guide:</strong> ${tpkgObj.is_company_guide ? 'Yes' : 'No'}</p>
            <p><strong>Company Vehicle:</strong> ${tpkgObj.is_company_vehicle ? 'Yes' : 'No'}</p>
            <p><strong>Company Driver:</strong> ${tpkgObj.is_company_driver ? 'Yes' : 'No'}</p>
            <p><strong>Preferred Transport Type:</strong> ${tpkgObj.pref_vehi_type || 'N/A'}</p>
        </div>

        <div class="mb-2">
            <p><strong>Web Description:</strong> ${tpkgObj.web_description || 'N/A'}</p>
            <p><strong>Note:</strong> ${tpkgObj.note || 'N/A'}</p>
        </div>

        <div class="mb-2">
            <p><strong>Cost Breakdown:</strong></p>
            <ul>${costList}</ul>
        </div>

        <hr class="mt-4 border border-primary">
        <p class="text-center text-muted small">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    </div>`;

    const printableTitle = `TourPackage_${(tpkgObj.tpcode || 'Example').replace(/\s+/g, '_')}`;

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

//handle refill tpkg data from inquiry
const fillDataFromInq = async () => {

    if (tpkg.basedinq?.id != null) {

        //approx start date
        if (tpkg.basedinq.inq_apprx_start_date != null && tpkg.basedinq.is_startdate_confirmed == true) {
            document.getElementById('tpStartDateInput').value = tpkg.basedinq.inq_apprx_start_date;
        }

        //traveller grp
        document.getElementById('tpkgLocalAdultCount').value = tpkg.basedinq.inq_local_adults || 0;
        document.getElementById('tpkgLocalChildCount').value = tpkg.basedinq.inq_local_kids || 0;
        document.getElementById('tpkgForeignAdultCount').value = tpkg.basedinq.inq_foreign_adults || 0;
        document.getElementById('tpkgForeignChildCount').value = tpkg.basedinq.inq_foreign_kids || 0;

        //guide
        if (tpkg.basedinq.inq_guideneed != null && tpkg.basedinq.inq_guideneed == true) {
            document.getElementById('guideYes').checked = true;
            document.getElementById('yathraGuideCB').disabled = false;
            document.getElementById('rentalGuideCB').disabled = false;
        } else if (tpkg.basedinq.inq_guideneed != null && tpkg.basedinq.inq_guideneed == false) {
            document.getElementById('guideNo').checked = true;

        }

        //if needed to show the result in an empty array
        //const emptyArray = [];
        //emptyArray.push(interestedTemplatePkg.sd_dayplan_id); 

        if (tpkg.basedinq.intrstdpkgid != null) {

            const interestedTemplatePkg = await ajaxGetReq("/tpkg/byid?tpkgId=" + tpkg.basedinq.intrstdpkgid);
            console.log(interestedTemplatePkg);

            //for first day
            const fdSelect = document.getElementById('tpkgFirstDaySelect');
            fdSelect.disabled = true;
            fillDataIntoDynamicSelects(fdSelect, 'Please select first day plan', onlyTemplates, 'daytitle', interestedTemplatePkg.sd_dayplan_id.daytitle);
            handleFirstDayChange(tpkgFirstDaySelect);

            //for final day
            const ldSelect = document.getElementById('tpkgFinalDaySelect');
            ldSelect.disabled = true;
            fillDataIntoDynamicSelects(ldSelect, 'Please select last day plan', onlyTemplates, 'daytitle', interestedTemplatePkg.ed_dayplan_id.daytitle);
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
                    onlyTemplates,
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
const setTpkgStatus = () => {
    const tpkgStatusSelectElement = document.getElementById('tpSelectStatus');
    tpkg.tpkg_status = "Draft";
    tpkgStatusSelectElement.value = "Draft";
    tpkgStatusSelectElement.style.border = "2px solid lime";

    //hide options from 3 to 5
    for (let i = 3; i <= 5; i++) {
        if (tpkgStatusSelectElement.children[i]) {
            tpkgStatusSelectElement.children[i].classList.add('d-none');
        }
    }
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
        tpkg.web_description = null;
        tpkg.img1 = null;
        tpkg.img2 = null;
        tpkg.img3 = null;

        //refresh border colours + remove frontend values
        tpDescription.style.border = "1px solid #ced4da";

        //startingPriceSection
        document.getElementById('startingPriceSection').classList.add('d-none');
        document.getElementById('pkgStartingPrice').value = '';
        tpkg.pkgstartingprice = null;

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
        tpkg.pkgsellingprice = null;
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

        document.getElementById('startingPriceSection').classList.remove('d-none');


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
}

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

// get the index of the midday select element from its label text
const getMidDayIndexFromSelect = (selectEl) => {
    const labelText = selectEl.closest('.row').querySelector('label').innerText;
    return parseInt(labelText.split(" ")[2]) - 1;
};

// to handle first day changes  
const handleFirstDayChange = (selectElement) => {

    dynamicSelectValidator(selectElement, 'tpkg', 'sd_dayplan_id');
    showFirstDayBtn.disabled = false;
    const fdMsg = document.getElementById('firstDayMsg');

    if (tpkg.is_custompkg == true && tpkg.sd_dayplan_id.is_template) {
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

// to handle last day changes  
const handleFinalDayChange = (selectElement) => {

    dynamicSelectValidator(selectElement, 'tpkg', 'ed_dayplan_id');
    showFinalDayBtn.disabled = false;
    removeFinalDayBtn.disabled = false;
    showTotalKmCount();

    const finalDMsg = document.getElementById('finalDayMsg');

    if (tpkg.is_custompkg == true && tpkg.ed_dayplan_id.is_template) {
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

    calcSellingPrice();
}

// calc selling price of the tour package (profit margin added)
const calcSellingPrice = () => {

    const profitMargin = parseFloat(globalPriceMods.company_profit_margin) || 0;

    const cost = parseFloat(tpkg.pkgcostsum);
    const profit = cost * (profitMargin / 100);
    const rawSellingPrice = cost + profit;

    const sellingPrice = Math.ceil(rawSellingPrice / 100) * 100;
    const sellingPriceRounded = parseFloat(sellingPrice.toFixed(2));

    //selling price 
    tpkg.pkgsellingprice = sellingPriceRounded;
    const sellingPriceInput = document.getElementById('pkgSellingPrice');
    sellingPriceInput.value = sellingPriceRounded.toFixed(2);

    //update the same price to the final price by default (can be changed by the discount cbs later)    
    tpkg.pkgfinalprice = sellingPriceRounded;
    const finalPriceInput = document.getElementById('pkgFinalPrice');
    finalPriceInput.value = sellingPriceRounded.toFixed(2);
    finalPriceInput.style.border = "4px solid lime";

};

//if no discount is given (not used) 💥
const handleDiscountNoneToggle = () => {
    const noneCb = document.getElementById('discountNone');
    const loyalityCb = document.getElementById('discountLoyality');
    const offpeakCb = document.getElementById('discountOffpeak');

    if (noneCb.checked) {
        loyalityCb.checked = false;
        loyalityCb.disabled = true;

        offpeakCb.checked = false;
        offpeakCb.disabled = true;

    } else {
        loyalityCb.disabled = false;
        offpeakCb.disabled = false;
    }
};

//other discounts
const handleDiscsOri = () => {

    const loyalDiscCB = document.getElementById('discountLoyality');
    const offpeakCbDiscCB = document.getElementById('discountOffpeak');
    const finalPriceInput = document.getElementById('pkgFinalPrice');
    const noneCb = document.getElementById('discountNone');

    discount = 0.00;
    let discountLabels = [];

    if (loyalDiscCB.checked) {
        const loyalDisc = parseFloat(globalPriceMods.loyalty_discount) || 0;
        discount = discount + loyalDisc;
        noneCb.checked = false;
        discountLabels.push("loyality");
    }

    if (offpeakCbDiscCB.checked) {
        const offPeakDisc = parseFloat(globalPriceMods.off_peak_discount) || 0;
        discount = discount + offPeakDisc;
        noneCb.checked = false;
        discountLabels.push("off-peak");
    }

    if (noneCb.checked) {
        loyalDiscCB.checked = false;
        loyalDiscCB.disabled = true;

        offpeakCbDiscCB.checked = false;
        offpeakCbDiscCB.disabled = true;

        discountLabels = ["none"];
        discount = 0.00;
    } else {
        loyalDiscCB.disabled = false;
        offpeakCbDiscCB.disabled = false;
    }

    //calc final price
    const sellingPrice = parseFloat(tpkg.pkgsellingprice);
    const discountedePrice = sellingPrice * (discount / 100);
    const finalPriceRaw = sellingPrice - discountedePrice;

    const finalPrice = Math.ceil(finalPriceRaw / 100) * 100;
    finalPriceInput.value = finalPrice.toFixed(2);
    tpkg.pkgfinalprice = finalPriceInput.value;

    //save the discs used
    tpkg.useddiscounts = discountLabels.join(',');

}

const handleDiscs = () => {

    const noneCb = document.getElementById('discountNone');
    const loyalDiscCB = document.getElementById('discountLoyality');
    const offpeakCbDiscCB = document.getElementById('discountOffpeak');
    const finalPriceInput = document.getElementById('pkgFinalPrice');

    let discount = 0.00;
    let discountLabels = [];

    if (noneCb.checked) {
        loyalDiscCB.checked = false;
        loyalDiscCB.disabled = true;

        offpeakCbDiscCB.checked = false;
        offpeakCbDiscCB.disabled = true;

        discountLabels = ["none"];
        discount = 0.00;
    } else {
        loyalDiscCB.disabled = false;
        offpeakCbDiscCB.disabled = false;

        if (loyalDiscCB.checked) {
            const loyalDisc = parseFloat(globalPriceMods.loyalty_discount) || 0;
            discount += loyalDisc;
            discountLabels.push("loyality");
        }

        if (offpeakCbDiscCB.checked) {
            const offPeakDisc = parseFloat(globalPriceMods.off_peak_discount) || 0;
            discount += offPeakDisc;
            discountLabels.push("off-peak");
        }

        if (loyalDiscCB.checked || offpeakCbDiscCB.checked) {
            noneCb.checked = false;
        }
    }

    const sellingPrice = parseFloat(tpkg.pkgsellingprice);
    const discountedPrice = sellingPrice * (discount / 100);
    const finalPriceRaw = sellingPrice - discountedPrice;
    const finalPrice = Math.ceil(finalPriceRaw / 100) * 100;

    finalPriceInput.value = finalPrice.toFixed(2);
    tpkg.pkgfinalprice = finalPriceInput.value;

    tpkg.useddiscounts = discountLabels.join(',');
};


//this will be neede when refilling the form
const refillDiscountSection = (obj) => {

    const noneCb = document.getElementById('discountNone');
    const loyalityCb = document.getElementById('discountLoyality');
    const offpeakCb = document.getElementById('discountOffpeak');

    if (!obj.discountsused || typeof obj.discountsused !== 'string') {
        console.log("No used discounts found or invalid format.");
        return;
    }

    const used = obj.discountsused.toLowerCase().split(',');
    console.log("used array: ", used);

    if (used.includes("none")) {
        noneCb.checked = true;
        loyalityCb.disabled = true;
        offpeakCb.disabled = true;
    }

    if (used.includes("loyality")) {
        loyalityCb.checked = true;
        noneCb.checked = false;
    }

    if (used.includes("offpeak")) {
        offpeakCb.checked = true;
        noneCb.checked = false;
    }
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

//to show in website
const calcStartingPricePerAdult = () => {

    //vehi == van    
    //guide, driver == external

    //lunch == no

    //traveller count == 1
    //vehi parking == places in day 
    //accos == in day
    //tkt == places in day

    //calc tkt cost + vehi parking cost + accos in once
    let tktCostTotalForWeb = 0;
    let stayCostTotalForWeb = 0;
    let vehiParkCostForweb = 0;

    if (document.getElementById('tpkgFirstDaySelect').value !== "" &&
        tpkg.sd_dayplan_id != null) {

        //tkt
        tktCostTotalForWeb += tpkg.sd_dayplan_id.foreignadulttktcost || 0;
        //stay
        stayCostTotalForWeb += (tpkg.sd_dayplan_id.drop_stay_id?.base_price || 0) + (tpkg.sd_dayplan_id.drop_stay_id?.incremental_cost || 0);
        //vehi park
        vehiParkCostForweb += tpkg.sd_dayplan_id.totalvehiparkcost || 0;

    }

    if (tpkg.dayplans.length > 0) {
        tpkg.dayplans.forEach(day => {

            //tkt
            tktCostTotalForWeb += day.foreignadulttktcost || 0;
            //stay
            stayCostTotalForWeb += (day.drop_stay_id?.base_price || 0) + (day.drop_stay_id?.incremental_cost || 0);
            //vehi park
            vehiParkCostForweb += day.totalvehiparkcost || 0;

        });
    }

    if (document.getElementById('tpkgFinalDaySelect').value !== "" &&
        tpkg.ed_dayplan_id != null) {

        //tkt
        tktCostTotalForWeb += tpkg.ed_dayplan_id.foreignadulttktcost || 0;
        stayCostTotalForWeb += (tpkg.ed_dayplan_id.drop_stay_id?.base_price || 0) + (tpkg.ed_dayplan_id.drop_stay_id?.incremental_cost || 0);
        //vehi park
        vehiParkCostForweb += tpkg.ed_dayplan_id.totalvehiparkcost || 0;

    }

    //vehicle cost == for ext van
    let vehiChargeForWeb = 0;
    const kmCountForPkg = parseFloat(document.getElementById('showTotalKMCount').value) || 0;

    //use vehiTypes global array
    const van = vehiTypes.find(v => v.name.toLowerCase() === "van");
    const vehiCharge = van.ext_avg_cpkm || 0;
    vehiChargeForWeb = vehiCharge * kmCountForPkg;

    //for guide and driver
    const totalDays = parseInt(showTotalDaysCount.value) || 0;

    //guide == ext
    let guideCostForWeb = (globalPriceMods.ext_guide_daily_charge || 0) * totalDays;

    //driver  == ext
    let driverCostForWeb = (globalPriceMods.ext_driver_daily_charge || 0) * totalDays;

    console.log("Ticket Cost Total (tktCostTotalForWeb):", tktCostTotalForWeb);
    console.log("Stay Cost Total (stayCostTotalForWeb):", stayCostTotalForWeb);
    console.log("Vehicle Parking Cost Total (vehiParkCostForweb):", vehiParkCostForweb);
    console.log("Vehicle Charge (vehiChargeForWeb):", vehiChargeForWeb);
    console.log("Guide Cost (guideCostForWeb):", guideCostForWeb);
    console.log("Driver Cost (driverCostForWeb):", driverCostForWeb);

    const finalStartingPrice = tktCostTotalForWeb + stayCostTotalForWeb + vehiParkCostForweb + vehiChargeForWeb + guideCostForWeb + driverCostForWeb;
    console.log("Final starting price for website: " + finalStartingPrice);

    const roundedStartingPrice = Math.ceil(finalStartingPrice / 100) * 100;
    console.log("Rounded starting price for website: " + roundedStartingPrice);

    const startingPriceInput = document.getElementById('pkgStartingPrice');
    startingPriceInput.value = roundedStartingPrice.toFixed(2);

    tpkg.pkgstartingprice = parseFloat(roundedStartingPrice.toFixed(2));
    console.log(tpkg.pkgstartingprice);
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

    if ((!yathraGuide.checked && !rentedGuide.checked) || totalDays <= 0) {
        totalGuideCostMsg.classList.remove("d-none");
        guideCostGroup.classList.add("d-none");
        return;
    }

    //guideCostGroup.classList.add("d-none");
    totalGuideCostMsg.classList.remove("d-none");
    costInput.value = "";
    tpkg.totalguidecost = null;

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

//
function showVehiAvailabilityButtons() {
    // show the vehi availability button
    document.getElementById("btnCheckVehiAvailability").classList.remove("d-none");

    // hide + clear spans
    const vehicleSpan = document.getElementById("showAvailableVehiCount");
    vehicleSpan.textContent = "";
}

// function to show both buttons again
function showDnGAvailabilityButtons() {

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

    //dom elements
    const firstDayCbVar = document.getElementById('firstDayCB');
    const midDayCbVar = document.getElementById('middleDayCB');
    const lastDayCbVar = document.getElementById('lastDayCB');

    //pickups
    const airportSelect = document.getElementById('airportSelect');
    const airportPickRow = document.getElementById('generalPickupOptions');
    const airportPickupCB = document.getElementById('generalPickupCB');
    const manualPickupRow = document.getElementById('manualPickupOptions');
    const manualPickupInput = document.getElementById('manualLocationPickup');
    const manualPickupGCoordsInput = document.getElementById('geoCoords');
    const manualPickupCBVar = document.getElementById('manualPickupCB');
    const stayPickupRow = document.getElementById('accommodationPickupOptions');

    //dropoffs
    const airportDropCBVar = document.getElementById('generalDropOffCB');
    const airportDropRow = document.getElementById('generalDropOffOptions');
    const airportSelectDrop = document.getElementById('airportSelectDropOff');
    const manualDropCBVar = document.getElementById('manualDropOffCB');
    const manualDropRow = document.getElementById('manualDropOffOptions');
    const manualDropInput = document.getElementById('manualLocationDropOff');
    const manualDropGCoordsInput = document.getElementById('geoCoordsDropOff');
    const dropOffAccommodationRow = document.getElementById('accommodationDropOffOptions');

    //if this dp is chosen from first day select box
    if (selectedDayTypeToEdit === "first") {

        firstDayCbVar.checked = true;
        dayplan.dayplancode = 'FD';

        midDayCbVar.disabled = true;
        midDayCbVar.style.cursor = 'not-allowed';
        lastDayCbVar.disabled = true;
        lastDayCbVar.style.cursor = 'not-allowed';

        airportDropCBVar.disabled = true;
        airportSelectDrop.disabled = true;

        airportPickupCB.disabled = false;
        airportSelect.disabled = false;

        //if this dp is chosen from a mid day select box
    } else if (selectedDayTypeToEdit === "middle") {

        midDayCbVar.checked = true;
        dayplan.dayplancode = 'MD';

        firstDayCbVar.disabled = true;
        firstDayCbVar.style.cursor = 'not-allowed';
        lastDayCbVar.disabled = true;
        lastDayCbVar.style.cursor = 'not-allowed';

        airportDropCBVar.disabled = true;
        airportSelectDrop.disabled = true;

        airportPickupCB.disabled = true;
        airportSelect.disabled = true;

        //if this dp is chosen from final day select box
    } else if (selectedDayTypeToEdit === "final") {

        lastDayCbVar.checked = true;
        dayplan.dayplancode = 'LD';

        firstDayCbVar.disabled = true;
        firstDayCbVar.style.cursor = 'not-allowed';
        midDayCbVar.disabled = true;
        midDayCbVar.style.cursor = 'not-allowed';

        airportDropCBVar.disabled = false;
        airportSelectDrop.disabled = false;

        airportPickupCB.disabled = true;
        airportSelect.disabled = true;

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

        airportDropRow.style.display = 'none';
        manualDropRow.style.display = 'none';
        dropOffAccommodationRow.style.display = 'none';

        switch (dpObj.droppoint) {
            case "BIA":
                airportSelectDrop.selectedIndex = 1;
                airportDropRow.style.display = 'block';
                airportDropCBVar.checked = true;
                break;
            case "MATTALA":
                airportSelectDrop.selectedIndex = 2;
                airportDropRow.style.display = 'block';
                airportDropCBVar.checked = true;
                break;
            case "RATMALANA":
                airportSelectDrop.selectedIndex = 3;
                airportDropRow.style.display = 'block';
                airportDropCBVar.checked = true;
                break;
            case "JAFFNA":
                airportSelectDrop.selectedIndex = 4;
                airportDropRow.style.display = 'block';
                airportDropCBVar.checked = true;
                break;
            default:
                airportSelectDrop.selectedIndex = 0;
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
    document.getElementById('dpNote').value = dpObj.note;
    document.getElementById('dpTotalVehiParkingCost').innerText = 'LKR ' + dpObj.totalvehiparkcost.toFixed(2);
    document.getElementById('dpTotalForeignChildTktCost').innerText = 'LKR ' + dpObj.foreignchildtktcost.toFixed(2);
    document.getElementById('dpTotalForeignAdultTktCost').innerText = 'LKR ' + dpObj.foreignadulttktcost.toFixed(2);
    document.getElementById('dpTotalLocalChildTktCost').innerText = 'LKR ' + dpObj.localchildtktcost.toFixed(2);
    document.getElementById('dpTotalLocalAdultTktCost').innerText = 'LKR ' + dpObj.localadulttktcost.toFixed(2);

    //give another value 💥💥💥
    const dpSelectStatusElement = document.getElementById('dpSelectStatus');
    dpSelectStatusElement.value = dpObj.dp_status;
    dpSelectStatusElement.style.border = '1px solid #ced4da';

    var step1Tab = new bootstrap.Tab(document.getElementById('dayStep1-tab'));
    step1Tab.show();

    $("#dayPlanModalInTpkg").modal("show");
}

//auto select the newly added dp into the correct select element
const feedAndSelectNewlyAddedDp = async () => {

    //for first days
    if (editingDPsSelectElementIdVal === "tpkgFirstDaySelect") {

        resetSelectElements(tpkgFirstDaySelect, "Please Select First Day");

        try {
            tpkg.sd_dayplan_id = null;
            const onlyFirstDaysNew = await ajaxGetReq("/dayplan/onlyfirstdays");
            const newlyAddedDayTitle = window.newlyAddedDayTitleGlobal;
            console.log("newlyAddedDayTitle:", newlyAddedDayTitle);
            fillDataIntoDynamicSelects(tpkgFirstDaySelect, "Please Select First Day", onlyFirstDaysNew, "daytitle", newlyAddedDayTitle);
            const selectedVal = tpkgFirstDaySelect.value;
            console.log("Selected value in tpkgFirstDaySelect:", selectedVal);
            if (selectedVal != null) {
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
            const onlyLastDaysNew = await ajaxGetReq("/dayplan/onlylastdays");
            const newlyAddedDayTitle = window.newlyAddedDayTitleGlobal;
            console.log("newlyAddedDayTitle:", newlyAddedDayTitle);
            fillDataIntoDynamicSelects(tpkgFinalDaySelect, "Please Select Final Day", onlyLastDaysNew, "daytitle", newlyAddedDayTitle);
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
                const onlyMidDaysNew = await ajaxGetReq("/dayplan/onlymiddays");
                fillDataIntoDynamicSelects(midDaySelect, "Please Select Middle Day", onlyMidDaysNew, "daytitle", newlyAddedDayTitle);
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
                    setTimeout(feedAndSelectNewlyAddedDp, 100);
                    //feedAndSelectNewlyAddedDp();
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
        if (tpkg.is_custompkg == true && selectedValue.is_template) {
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

//check errors before adding 
const checkTpkgFormErrors = () => {
    let errors = "";

    if (!tpkg.pkgtitle) {
        errors += "Title cannot be empty \n";
    }

    if (tpkg.is_custompkg === null || tpkg.is_custompkg === undefined) {
        errors += "Please select the type of package \n";
    }

    if (!tpkg.sd_dayplan_id) {
        errors += "Please select the first day plan \n";
    }

    if (!tpkg.ed_dayplan_id && tpkg.dayplans && tpkg.dayplans.length > 0) {
        errors += "Please add a last day plan \n";
    }

    if (!tpkg.tpkg_status) {
        errors += "Please select the status of the package \n";
    }

    //for custom packages
    if (tpkg.is_custompkg) {
        if (!tpkg.basedinq) {
            errors += "Custom packages must be based on an inquiry \n";
        }

        if (!tpkg.tourstartdate) {
            errors += "Please select the start date of the tour \n";
        }

        if (
            (tpkg.localadultcount == null || tpkg.localadultcount < 0) &&
            (tpkg.foreignadultcount == null || tpkg.foreignadultcount < 0)
        ) {
            errors += "At least one adult count must be greater than 0 \n";
        }

        if (tpkg.pkgcostsum == null) {
            errors += "Package cost sum is required \n";
        }

        if (tpkg.pkgfinalprice == null) {
            errors += "Final price is required \n";
        }

        if (tpkg.is_guide_needed === null || tpkg.is_guide_needed === undefined) {
            errors += "Please specify whether a guide is needed \n";
        }

        if (tpkg.is_guide_needed && (tpkg.is_company_guide === null || tpkg.is_company_guide === undefined)) {
            errors += "Please specify if the guide is from the company \n";
        }

        if (tpkg.is_company_vehicle === null || tpkg.is_company_vehicle === undefined) {
            errors += "Please specify if the vehicle is from the company \n";
        }

        if (tpkg.is_company_driver === null || tpkg.is_company_driver === undefined) {
            errors += "Please specify if the driver is from the company \n";
        }

        if (!tpkg.pref_vehi_type) {
            errors += "Preferred vehicle type is required \n";
        }
    }

    //for template packages
    if (tpkg.is_custompkg != null && tpkg.is_custompkg == false) {

        if (!tpkg.web_description || tpkg.web_description.trim() === "") {
            errors += "Please enter the description for the website \n";
        }

        if (!tpkg.img1 || tpkg.img1.trim() === "") {
            errors += "Please upload the first image for the website \n";
        }

        if (!tpkg.img2 || tpkg.img2.trim() === "") {
            errors += "Please upload the second image for the website \n";
        }

        if (!tpkg.img3 || tpkg.img3.trim() === "") {
            errors += "Please upload the third image for the website \n";
        }
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


//###################################################### NOT USED

//declared globally because needed for filterings
let allItineraryTemplates = [];

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

//not used 💥
const fetchAllDataParallel = async () => {
    const endpoints = [
        { key: 'onlyFirstDays', url: "/dayplan/onlyfirstdays" },
        { key: 'onlyLastDays', url: "/dayplan/onlylastdays" },
        { key: 'onlyMidDays', url: "/dayplan/onlymiddays" },
        { key: 'globalPriceMods', url: "/pricemods/all" },
    ];

    const results = await Promise.allSettled(
        endpoints.map(ep => ajaxGetReq(ep.url))
    );

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            window[endpoints[i].key] = result.value;
        } else {
            console.error(`Failed to fetch ${endpoints[i].key}:`, result.reason);
        }
    });
}




