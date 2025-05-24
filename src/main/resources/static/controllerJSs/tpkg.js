window.addEventListener('load', () => {

    buildTpkgTable();
    refreshTpkgForm();

});

//global var to store id of the table
let sharedTableId = "mainTableTpkg";

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshTpkgForm();
        }
    });
});


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

        createTable(tableTpkgHolderDiv, sharedTableId, tpkgs, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build table:", error);
    }
}

//to support fill main table
const showTpkgType = (tpkgObj) => {
    if (!tpkgObj.is_custompkg) {
        return "Template"
    } else {
        return "For Website"
    }
}

//to support fill main table
const showTpkgStatus = (tpkgObj) => {

    if (tpkgObj.deleted_tpkg == null || tpkgObj.deleted_tpkg == false) {
        if (tpkgObj.tpkg_status == "Draft") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Draft
                </p>`;
        } else if (tpkgObj.tpkg_status == "Confirmed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #3498db; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Confirmed
                </p>`;
        } else if (tpkgObj.tpkg_status == "Completed") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Completed
                </p>`;
        }
    } else if (tpkgObj.deleted_tpkg != null && tpkgObj.deleted_tpkg == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
}

//to ready the main form 
const refreshTpkgForm = async () => {

    tpkg = new Object();
    tpkg.dayplans = new Array();
    document.getElementById('formTpkg').reset();

    //ajax's to fill days/templates
    try {
        const vehiTypes = await ajaxGetReq("/vehitypes/all");
        fillDataIntoDynamicSelects(tpkgVehitype, 'Select Vehicle Type', vehiTypes, 'vehi_type_name', 'name');


    } catch (error) {
        console.error("Failed to fetch form data:", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputPkgTitle',
        'inputPkgCode',
        'tpStartDateInput',
        'tpDescription',
        'tpkgLocalAdultCount',
        'tpkgLocalChildCount',
        'tpkgForeignAdultCount',
        'tpkgForeignChildCount',
        'tpkgVehitype',
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

    document.getElementById('tpkgLocalAdultCount').value = 0;
    document.getElementById('tpkgLocalChildCount').value = 0;
    document.getElementById('tpkgForeignAdultCount').value = 0;
    document.getElementById('tpkgForeignChildCount').value = 0;

    const radioIdsToReset = [
        'customTP',
        'forWebSite',
        'yathraVehiCB',
        'rentalVehiCB',
        'yathraDriverCB',
        'rentalDriverCB',
        'guideYesCB',
        'guideNoCB',
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

}

//set status auto
const setTpkgStatus = () => {
    const tpkgStatusSelectElement = document.getElementById('tpSelectStatus');
    tpkg.tpkg_status = "Draft";
    tpkgStatusSelectElement.value = "Draft";
    tpkgStatusSelectElement.style.border = "2px solid lime";
    tpkgStatusSelectElement.children[2].classList.add('d-none');
    tpkgStatusSelectElement.children[3].classList.add('d-none');
    tpkgStatusSelectElement.children[4].classList.add('d-none');
    tpkgStatusSelectElement.children[5].classList.add('d-none');
}

//for first 2 radio buttons
const changesTpkgCustomOrTemp = () => {
    //if a custom package
    if (customTP.checked) {

        tpkg.is_custompkg = true;

        // hide
        tpDescRow.classList.add('d-none');
        imagesFieldset.classList.add('d-none');

        //change step name
        document.getElementById('tpkgStep3-tab').innerText = "Preferences"

        // show again (if previously for website selected)
        startDateCol.classList.remove('d-none');
        preferencesFieldset.classList.remove('d-none');
        document.getElementById('tpkgStep4-tab').classList.remove('d-none');

        //unbind if previously binded values are exist
        tpkg.web_discription = null;
        tpkg.img1 = null;
        tpkg.img2 = null;
        tpkg.img3 = null;

        //refresh border colours + remove frontend values
        tpDescription.style.border = "1px solid #ced4da";

        //calcTotalDayCount();


        //if a package is for show in website
    } else if (forWebSite.checked) {

        tpkg.is_custompkg = false;

        // unhide
        tpDescRow.classList.remove('d-none');
        imagesFieldset.classList.remove('d-none');       

        //change step name
        document.getElementById('tpkgStep3-tab').innerText = "Images"       

        // hide
        startDateCol.classList.add('d-none');
        preferencesFieldset.classList.add('d-none');
        document.getElementById('tpkgStep4-tab').classList.add('d-none');

        //unbind if previously binded values are exist
        tpkg.tourstartdate = null;
        tpkg.tourenddate = null;
        tpkg.localadultcount = null;
        tpkg.localchildcount = null;
        tpkg.foreignadultcount = null;
        tpkg.foreignchildcount = null;

        // Array of input field IDs to reset
        const inputTagsIds = [

            'tpStartDateInput',
            'tpDescription',
            'tpkgLocalAdultCount',
            'tpkgLocalChildCount',
            'tpkgForeignAdultCount',
            'tpkgForeignChildCount',
            'tpkgVehitype',
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

        document.getElementById('tpkgLocalAdultCount').value = 0;
        document.getElementById('tpkgLocalChildCount').value = 0;
        document.getElementById('tpkgForeignAdultCount').value = 0;
        document.getElementById('tpkgForeignChildCount').value = 0;

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

// to calculate total travellers
const updateTotalTravellers=()=> {
    const localAdult = parseInt(document.getElementById('tpkgLocalAdultCount').value) || 0;
    const localChild = parseInt(document.getElementById('tpkgLocalChildCount').value) || 0;
    const foreignAdult = parseInt(document.getElementById('tpkgForeignAdultCount').value) || 0;
    const foreignChild = parseInt(document.getElementById('tpkgForeignChildCount').value) || 0;

    const total = localAdult + localChild + foreignAdult + foreignChild;

    document.getElementById('tpkgTotalTravellers').value = total;
}



