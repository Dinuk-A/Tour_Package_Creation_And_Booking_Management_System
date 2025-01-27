window.addEventListener('load', () => {

    // loggedUserPrivileges = ajaxGetRequest("/privilege/bymodule/ATTRACTION");

    //call fn for refresh/show data in table
    refreshAttractionTable();

    //for attraction form
    refreshAttractionsForm();
})

//fn for show data in table
const refreshAttractionTable = () => {

    attractions = ajaxGetRequest("/attraction/alldata");

    const displayProperty = [
        { dataType: 'text', propertyName: 'name' },
        { dataType: 'function', propertyName: getDistNProvince },
        // { dataType: 'function', propertyName: getCategories },
        // { dataType: 'function', propertyName: getActivities },
        { dataType: 'function', propertyName: getDuration },
        { dataType: 'function', propertyName: showLocalFees },
        { dataType: 'function', propertyName: showForeignFees },
        { dataType: 'function', propertyName: getStatus }

    ]

    fillDataIntoTable3(tableVPlace, attractions, displayProperty, buttonVisibility = true)

    //call the new datatable format(from net)
    $('#tableVPlace').dataTable();
}

//fn for refresh form
const refreshAttractionsForm = () => {

    attraction = new Object;

    attraction.categories = new Array();
    attraction.attr_activities = new Array();

    vPlaceForm.reset();

    //get province list
    provinces = ajaxGetRequest("province/alldata");
    fillDataIntoSelect(inputPlaceProvince, 'Please Select The Province', provinces, 'name')

    //get district list 
    districts = [];
    fillDataIntoSelect(inputPlaceDistrict, 'Please Select The Provice First', districts, 'name')
    inputPlaceDistrict.disabled = true;

    //get Attr Status list
    attrstts = ajaxGetRequest("/attrstatus/alldata");
    fillDataIntoSelect(selectAttrStatus, 'Please Select The Status', attrstts, 'name', 'Active Site')
    attraction.attrstatus_id = JSON.parse(selectAttrStatus.value);
    selectAttrStatus.style.border= "2px solid lime"


    //get categories list
    categoryList = ajaxGetRequest("/category/alldata");
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

    })

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

    inputPlaceName.style.border = "1px solid #ced4da";
    selectAttrStatus.style.border = "1px solid #ced4da";
    inputPlaceDistrict.style.border = "1px solid #ced4da";
    feeForeignAdult.style.border = "1px solid #ced4da";
    feeLocalAdult.style.border = "1px solid #ced4da";
    feeForeignChild.style.border = "1px solid #ced4da";
    feeLocalChild.style.border = "1px solid #ced4da";
    inputNote.style.border = "1px solid #ced4da";
    tourDuration.style.border = "1px solid #ced4da";
    vehiParkingFeeInput.style.border = "1px solid #ced4da";
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

    if (ob.feelocal != 0.00 && ob.feechildlocal != 0.00) {

        return "Adult : " + parseFloat(ob.feelocal).toFixed(2) + "<br/> Child  : " + parseFloat(ob.feechildlocal).toFixed(2);

    } else if (ob.feechildlocal == 0.00 && ob.feelocal != 0) {

        return "Adult : " + parseFloat(ob.feelocal).toFixed(2) + "<br/> Child : Free";
        //💥TO FIXED KARAPU GAMAN MEKA STRING EKAK WENAWA. CALC KARANNA BA ITAPASSE,  CALC KARANNA OONNAM  AYE  PARSE KARANNA💥

    } else {
        return 'No Entrance Fee';
    }

}

//fn for show FOREIGN FEES in table
const showForeignFees = (ob) => {

    if (ob.feeforeign != 0.00 && ob.feechildforeign != 0.00) {

        return "Adult : " + parseFloat(ob.feeforeign).toFixed(2) + "<br/> Child : " + parseFloat(ob.feechildforeign).toFixed(2);
    } else {
        return 'No Entrance Fee';
    }
}

//show status in table
const getStatus = (ob) => {
    return ob.attrstatus_id.name;
}

//fn for if no entrance fee for all
const allEntryFree = () => {

    if (allEntryFreeChkBox.checked) {

        //disable input fields
        feeForeignAdult.disabled = true;
        feeLocalAdult.disabled = true;
        feeForeignChild.disabled = true;
        feeLocalChild.disabled = true;

        //show default value as 0.00 LKR
        feeForeignAdult.value = "0.00";
        feeLocalAdult.value = "0.00";
        feeForeignChild.value = "0.00";
        feeLocalChild.value = "0.00";

        //save 0.00 in DB
        attraction.feeforeign = 0.00;
        attraction.feelocal = 0.00;
        attraction.feechildlocal = 0.00;
        attraction.feechildforeign = 0.00;

    } else {  //check karala aye uncheck kaloth 

        feeForeignAdult.disabled = false;
        feeLocalAdult.disabled = false;
        feeForeignChild.disabled = false;
        feeLocalChild.disabled = false;

        feeForeignAdult.value = "";
        feeLocalAdult.value = "";
        feeForeignChild.value = "";
        feeLocalChild.value = "";

        //💥TYPE KARANA VALUE EKA BIND WENNA ONE, NATHTHN DIGATAMA 0 BIND WENAWA
        attraction.feeforeign = null;
        attraction.feelocal = null;
        attraction.feechildlocal = null;
        attraction.feechildforeign = null;
    }
}

//fn for if only locals are free
const localsEntryFree = () => {

    if (localsEntryFreeCheckBox.checked) {

        //mulin 1st chk box eka  click krla apahu 2nd eka click krnwa nam foreign set eka apahu enable karanawa + ewaye values ayn karanawa
        feeForeignAdult.disabled = false;
        feeForeignChild.disabled = false;

        feeForeignAdult.value = "";
        feeForeignChild.value = "";

        //local set eka disable karanwa
        feeLocalAdult.disabled = true;
        feeLocalChild.disabled = true;

        feeLocalAdult.value = "0.00";
        feeLocalChild.value = "0.00";

        attraction.feelocal = 0.00;
        attraction.feechildlocal = 0.00;

    } else {

        feeLocalAdult.disabled = false;
        feeLocalChild.disabled = false;

        feeLocalAdult.value = "";
        feeLocalChild.value = "";

        //💥TYPE KARANA VALUE EKA BIND WENNA ONE, NATHTHN DIGATAMA 0 BIND WENAWA
        attraction.feelocal = null;
        attraction.feechildlocal = null;

    }

}

//IF NO ONE IS FREE
const allPaid = () => {

    feeForeignAdult.disabled = false;
    feeLocalAdult.disabled = false;
    feeForeignChild.disabled = false;
    feeLocalChild.disabled = false;

    feeForeignAdult.value = "";
    feeLocalAdult.value = "";
    feeForeignChild.value = "";
    feeLocalChild.value = "";

    //💥KALIN BINND WUNA 0.00 TIKA METHANADITH AYN KARANNA ONE
    attraction.feeforeign = null;
    attraction.feelocal = null;
    attraction.feechildlocal = null;
    attraction.feechildforeign = null;

}

//fn for add a visiting place 
const addVPlaceBtn = () => {

    //check errors
    const errors = checkAttrErrors();

    if (errors == '') {
        const userConfirm = confirm('Are You Sure To Add ? \n' + attraction.name)

        if (userConfirm) {

            //call POST service
            let postServiceResponse = ajaxRequest("/attraction", "POST", attraction);

            if (postServiceResponse == "OK") {
                alert("Succesfully Saved !!!");
                vPlaceForm.reset();
                refreshAttractionsForm();
                refreshAttractionTable();
                $('#vPlaceModal').modal('hide');

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

const checkAttrErrors = () => {
    let errors = '';

    if (attraction.name == null) {
        errors = errors + " Please Enter The Name \n";
    }

    if (attraction.attrstatus_id == null) {
        errors = errors + " Please Select The Status \n";
    }

    if (attraction.district_id == null) {
        errors = errors + " Please Select The District \n";
    }

    if (attraction.duration == null) {
        errors = errors + " Please Enter A Duration \n";
    }

    // if (!freeParkingCBX.checked) {
    //     if (attraction.vehicleparkingfee == null) {
    //         errors = errors + " Please Enter The Parking Fee \n";
    //     }
    // }

    if (attraction.categories.length == 0) {
        errors = errors + "Please Select One or More Categories \n";
    }

    // if (attraction.attr_activities.length == 0) {
    //     errors = errors + "Please Select One or More Activities \n";
    // }

    //all entrance free checkbox eka unclicked nam all fees fields wala value ekak thiyennama one
    if (allPaidCheckBox.checked) {

        if (attraction.feeforeign == null) {
            errors = errors + " Please Enter The Foreign Adults' Entrance Fee \n";
        }

        if (attraction.feechildforeign == null) {
            errors = errors + " Please Enter The Foreign Childs' Entrance Fee \n";
        }

        if (attraction.feelocal == null) {
            errors = errors + " Please Enter The Local Adults' Entrance Fee \n";
        }

        if (attraction.feechildlocal == null) {
            errors = errors + " Please Enter The Local Childs' Entrance Fee \n";
        }

    } else if (!localsEntryFreeCheckBox.checked) {

        if (attraction.feelocal == null) {
            errors = errors + " Please Enter The Local Adult Entrance Fee \n";
        }

        if (attraction.feechildlocal == null) {
            errors = errors + " Please Enter The Local Child Entrance Fee \n";
        }

    } else if (localsEntryFreeCheckBox.checked) {
        if (attraction.feeforeign == null) {
            errors = errors + " Please Enter The Foreign Adults' Entrance Fee \n";
        }

        if (attraction.feechildforeign == null) {
            errors = errors + " Please Enter The Foreign Childs' Entrance Fee \n";
        }
    }

    return errors;
}

//fn for edit btn ** FOR FORM REFILL **
const editVPlaceBtn = (obj) => {

    attraction = JSON.parse(JSON.stringify(obj));
    attractionOldObj = JSON.parse(JSON.stringify(obj));

    $('#vPlaceModal').modal('show');

    inputPlaceDistrict.disabled = false;

    inputPlaceName.value = attraction.name;
    // selectAttrStatus.value = attraction.attrstatus_id;

    //get province list
    provinces = ajaxGetRequest("/province/alldata");
    fillDataIntoSelect(inputPlaceProvince, 'Please Select The Province', provinces, 'name', attraction.district_id.province_id.name)
    inputPlaceProvince.style.border = "1px solid ced4da"

    districts = ajaxGetRequest("/district/alldata");
    fillDataIntoSelect(inputPlaceDistrict, 'Please Select The District', districts, 'name', attraction.district_id.name)

    attrstts = ajaxGetRequest("/attrstatus/alldata");
    fillDataIntoSelect(selectAttrStatus, 'Please Select The Status', attrstts, 'name', attraction.attrstatus_id.name)

    //open 2 collapses auto
    flushCollapseOne.classList.add("show")
    // flushCollapseTwo.classList.add("show")

    //get categories list
    categoryList = ajaxGetRequest("/category/alldata");
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
                attraction.categories.push(element)
            } else {
                let existIndex = attraction.categories.map(category => category.id).indexOf(element.id);
                if (existIndex != -1) {
                    attraction.categories.splice(existIndex, 1)
                }
            }
        }

        let existIndex = attraction.categories.map(category => category.id).indexOf(element.id);
        if (existIndex != -1) {
            newInput.checked = true;
        }

        newDiv.appendChild(newInput);
        newDiv.appendChild(newLabel);

        flushCollapseOne.appendChild(newDiv)

    })

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

    //     let existIndex = attraction.attr_activities.map(activity => activity.id).indexOf(activity.id);
    //     if (existIndex != -1) {
    //         activityInput.checked = true;
    //     }

    //     activityDiv.appendChild(activityInput);
    //     activityDiv.appendChild(activityLabel);

    //     flushCollapseTwo.appendChild(activityDiv);

    // })

    //override default styling gave by JS
    inputPlaceProvince.style.border = "1px solid ced4da"

    if (attraction.feetype == "All Free") {
        allEntryFreeChkBox.checked = true;

        feeForeignAdult.disabled = true;
        feeLocalAdult.disabled = true;
        feeForeignChild.disabled = true;
        feeLocalChild.disabled = true;
    }

    if (attraction.feetype == "Local Free") {
        localsEntryFreeCheckBox.checked = true;

        feeLocalAdult.disabled = true;
        feeLocalChild.disabled = true;
    }

    if (attraction.feetype == "All Paid") {
        allPaidCheckBox.checked = true;
    }

    feeForeignAdult.value = parseFloat(attraction.feeforeign).toFixed(2);
    feeLocalAdult.value = parseFloat(attraction.feelocal).toFixed(2);
    feeLocalChild.value = parseFloat(obj.feechildlocal).toFixed(2);
    feeForeignChild.value = parseFloat(attraction.feechildforeign).toFixed(2);
    vehiParkingFeeInput.value = parseFloat(attraction.vehicleparkingfee).toFixed(2);
    vehiParkingFeeInput.value = parseFloat(attraction.vehicleparkingfee).toFixed(2);

    if (attraction.vehicleparkingfee == 0.00) {
        freeParkingCBX.checked = true;
        vehiParkingFeeInput.disabled=true;
    }

    inputNote.value = attraction.description;
    tourDuration.value = attraction.duration;

    //add button should be disabled in EDIT MODE
    attraAddBtn.disabled = true;
    attraAddBtn.style.cursor = "not-allowed";

    //formrefresh ekedi disabled karapu btn eka methanin again enable karanawa
    attraUpdateBtn.disabled = false;
    attraUpdateBtn.style.cursor = "pointer";

    //disabling update button based on USER PRIVILEGES
    if (loggedUserPrivileges.privupdate) {
        attraUpdateBtn.disabled = false;
    } else {
        attraUpdateBtn.disabled = true;
    }

}

//fn for update BTN
const updateVplaceBtn = () => {

    let errors = checkAttrErrors();
    if (errors == '') {
        let updates = getAttrUpdates();
        if (updates == '') {
            alert('No Changes Detected');
        } else {
            let userResponse = confirm("Sure To Update ? \n \n " + updates);
            if (userResponse) {
                let putServiceResponce = ajaxRequest("/attraction", "PUT", attraction);

                if (putServiceResponce == "OK") {
                    alert("Successfully Updted");
                    $('#vPlaceModal').modal('hide');
                    refreshAttractionTable();
                    vPlaceForm.reset();
                    refreshAttractionsForm();

                } else {
                    alert("An Error Occured " + putServiceResponce);
                }

            } else {
                alert('Operator Cancelled The Task')
            }
        }

    } else {
        alert('form has following errors \n ' + errors);
    }

}

//not complete
const getAttrUpdates = () => {

    let updates = '';

    if (attraction.name != attractionOldObj.name) {
        updates = updates + "Name Has Changed To " + attraction.name + "\n";
    }

    if (attraction.district_id.name != attractionOldObj.district_id.name) {
        updates = updates + "District Has Changed To " + attraction.district_id.name + "\n";
    }

    if (attraction.attrstatus_id.name != attractionOldObj.attrstatus_id.name) {
        updates = updates + "Status Has Changed To " + attraction.attrstatus_id.name + "\n";
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

    if (attraction.feeforeign != attractionOldObj.feeforeign) {
        updates = updates + "Foreigner Adult Entrance Fee Has Changed To " + attraction.feeforeign + "\n";
    }

    if (attraction.feelocal != attractionOldObj.feelocal) {
        updates = updates + "Local Adult Entrance Fee Has Changed To " + attraction.feelocal + "\n";
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

//for delete btn
const deleteVplace = (ob, row) => {

    tableVPlace.children[1].children[row].style.backgroundColor = 'red';

    setTimeout(function () {
        const userConfirm = confirm('Are You Sure To Delete ?');

        if (userConfirm) {
            let deleteServerResponse = ajaxRequest("/attraction", "DELETE", ob);

            if (deleteServerResponse == "OK") {
                alert("successfully Deleted");
                refreshAttractionTable();
            } else {
                alert("An Error Occured \n" + deleteServerResponse);
            }
        } else {
            alert('Operator Cancelled The Task');
        }
    }, 300)

}

//get district list by province
const getDistByProvince = () => {

    const currentProvinceID = JSON.parse(inputPlaceProvince.value).id;
    inputPlaceProvince.style.border = '2px solid lime';
    inputPlaceDistrict.disabled = false;
    const districts = ajaxGetRequest("district/getdistrictbyprovince/" + currentProvinceID);
    fillDataIntoSelect(inputPlaceDistrict, " Please Select The District Now", districts, 'name');

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




