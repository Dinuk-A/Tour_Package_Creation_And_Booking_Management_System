window.addEventListener('load', () => {

    refreshMainForm();
    refreshDPForm();

})

const refreshDPForm = async () => {

    dayplan = new Object();
    dayplan.visitingplaces = new Array();

    try {
        //fill attractions
        attrs = await ajaxGetReq("/attraction/all");
        fillDataIntoDynamicSelects(allPlaces, 'Please Select The ', attrs, 'name');

    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }
}

const refreshMainForm = async () => {
    tpkg = new Object();
    tpkg.dayplans = [];

    try {
        //fill days
        days = await ajaxGetReq("/dayplan/all");
        fillDataIntoDynamicSelects(existingDayPlans, 'Please Select The Day Plans', days, 'daytitle');
    } catch (error) {
        console.error("Failed to fetch data : ", error);
    }
}

const addOne = () => {

    //check duplications when clicking add btn
    let selectedPlace = JSON.parse(allPlaces.value);
    let existPlace = false;

    for (const place of dayplan.visitingplaces) {
        if (selectedPlace.id == place.id) {
            existPlace = true;
            break;
        }
    }
    if (existPlace) {
        alert('this place is already selected');
    } else {
        dayplan.visitingplaces.push(selectedPlace);
        fillDataIntoDynamicSelects(passedVPlaces, 'Selected Places', dayplan.visitingplaces, 'name');
    }

}

const addNewDay = async () => {
    try {
        const postServiceResponse = await ajaxPPDRequest("/dayplan", "POST", dayplan);
        if (postServiceResponse === "OK") {
            alert('Saved Successfully');         

        } else {
            alert('Submit Failed ' + postServiceResponse);
        }

    } catch (error) {
        alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
    }
}


const addAll = () => {

}

const removeOne = () => {

}

const removeAll = () => {

}