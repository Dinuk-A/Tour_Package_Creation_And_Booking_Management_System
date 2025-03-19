window.addEventListener('load', () => {

    buildDayPlanTable();
    //refreshDayPlanForm();

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
        console.error("Failed to build dayplan table:", error);
    }

}

//
const showDayType = () => {

}

//
const showDayPlanStatus = () => {

}

//fn to ready the main form for accept values
const refreshDayPlanForm = async () => {

    dayplan = new Object();

    document.getElementById('formDayPlan').reset();

    try {
        const allProvinces = await ajaxGetReq("/province/all");

        fillDataIntoDynamicSelects(dpStartProvinceSelect, 'Select Designation', allProvinces, 'name');

        fillDataIntoDynamicSelects(dpPlaceProvinceSelect, 'Select Designation', allProvinces, 'name');

    } catch (error) {
        console.error("Failed to fetch Provinces : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputFullName',
        'inputNIC',
        'dateDateOfBirth',
        'inputEmail',
        'inputMobile',
        'inputLand',
        'inputAddress',
        'inputNote',
        'selectDesignation',
        'selectDayPlanStatus'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    dpUpdateBtn.disabled = true;
    dpUpdateBtn.style.cursor = "not-allowed";

    dpAddBtn.disabled = false;
    dpAddBtn.style.cursor = "pointer";

    document.getElementById('selectDayPlanmentStatus').children[2].removeAttribute('class', 'd-none');
}
