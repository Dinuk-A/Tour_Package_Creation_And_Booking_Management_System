window.addEventListener('load', () => {

    refreshYathraWebSite(openReusableModalForCardsReadMore);
    refreshPkgRelInqForm();

    nationalityList = [];
});


//refresh whole website
const refreshYathraWebSite = async (openReusableModalForCardsReadMore) => {

    try {
        nationalityList = await ajaxGetReq('/nationalityforweb/all');
    } catch (error) {
        console.error("Error fetching nationality for Yathra website:", error);
    }

    fillDataIntoDataListYathra(dataListNationality, nationalityList, 'countryname');
    //get nationality list to pkg related inq form
    fillDataIntoDynamicSelects(pkgRelInqNationalitySelect, 'Select Nationality', nationalityList, 'countryname');

    try {
        packageList = await ajaxGetReq("/tourpackageforweb/all");
    } catch (error) {
        console.error("Error fetching tour packages for Yathra website:", error);
    }

    packageCardsList.innerHTML = "";
    packageList.forEach(pkg => {

        // Create column div
        let columnDiv = document.createElement('div');
        columnDiv.className = "col-md-4 col-lg-3 mb-4";

        // Create card div
        let cardDiv = document.createElement('div');
        cardDiv.className = "card h-100 shadow-sm";

        // Create image tag
        let imageTag = document.createElement('img');
        imageTag.className = "card-img-top";
        if (pkg.img1 != null) {
            imageTag.src = atob(pkg.img1);
        } else {
            imageTag.src = 'images/sigiriya.jpg';
        }
        imageTag.alt = 'Tour package image';

        // Create card body
        let cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = "card-body d-flex flex-column";

        // Create card title
        let cardTitleHeadTag = document.createElement('h5');
        cardTitleHeadTag.className = "card-title";
        cardTitleHeadTag.innerText = pkg.pkgtitle;

        // Create card text (short description)
        let cardParagraphTag = document.createElement('p');
        cardParagraphTag.className = "card-text";
        cardParagraphTag.innerText = pkg.web_description;

        // Create "Read more" button
        let cardReadMoreButton = document.createElement('button');
        cardReadMoreButton.setAttribute('type', 'button');
        cardReadMoreButton.className = 'btn btn-primary mt-auto';
        cardReadMoreButton.setAttribute('data-bs-toggle', 'modal');
        cardReadMoreButton.setAttribute('data-bs-target', '#reusableModalForCards');
        cardReadMoreButton.innerText = 'Read more';
        cardReadMoreButton.onclick = () => { openReusableModalForCardsReadMore(pkg); }

        // Append elements
        cardBodyDiv.appendChild(cardTitleHeadTag);
        cardBodyDiv.appendChild(cardParagraphTag);
        cardBodyDiv.appendChild(cardReadMoreButton);

        cardDiv.appendChild(imageTag);
        cardDiv.appendChild(cardBodyDiv);
        columnDiv.appendChild(cardDiv);

        packageCardsList.appendChild(columnDiv);
    });

}

//PKG RELATED INQ FORM
const refreshPkgRelInqForm = async () => {

    inquiry = new Object();

    document.getElementById('formPkgRelateInqForm').reset();

    try {
        nationalityList = await ajaxGetReq('/nationalityforweb/all');
        fillDataIntoDynamicSelects(pkgRelInqNationalitySelect, 'Select Nationality', nationalityList, 'countryname');
        fillDataIntoDataListYathra(dataListNationality, nationalityList, 'countryname');
    } catch (error) {
        console.error("Error refreshing package related inquiry form:", error);

    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inqClientTitlePkgrelated',
        'inqClientNamePkgRelForm',
        'pkgRelInqNationalitySelect',
        'inqClientEmailPkgRelForm',
        'inqClientMobileOnePkgRelForm',
        'prefContMethodPkgRelForm',
        'inqClientEnquiriesPkgRelForm',
        'inqStartDate',
        'adultsCount',
        'kidsCount',
        'inqAccommodationNote',
        'inqPlacesPreferences',
        'inqTransportNote'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    //for data list
    // fillDataIntoDataList(pkgrelatednationalityDataList, nationalityList, 'countryname');
}

//handle customer name submission
const handleCustName = (nameInputElement) => {
    const originalNameVal = nameInputElement.value.trim();

    const capitalized = originalNameVal
        .split(" ")
        .map(namePart => namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase())
        .join(" ");

    nameInputElement.value = capitalized;

    const namePattern = /^([A-Z][a-z]{3,30}\s)+([A-Z][a-z]{3,30})$/;

    if (namePattern.test(capitalized)) {
        nameInputElement.style.borderBottom = "4px solid lime";
        nameInputElement.style.borderRight = "4px solid lime";
        inquiry.clientname = capitalized;
    } else {
        nameInputElement.style.borderBottom = "4px solid red";
        nameInputElement.style.borderRight = "4px solid red";
        inquiry.clientname = null;
    }
};

//validate selected options 
const staticSelectValidatorWeb = (selectTagId, object, property) => {

    const selectedValue = selectTagId.value;

    if (selectedValue != "") {
        selectTagId.style.borderBottom = "4px solid lime";
        selectTagId.style.borderRight = "4px solid lime";
        window[object][property] = selectedValue;
    } else {
        selectTagId.style.borderBottom = "4px solid red";
        selectTagId.style.borderRight = "4px solid red";
        window[object][property] = null;
    }

}

//custom validator fn for web form
const inputValidatorTextWeb = (inputTagId, pattern, object, property) => {

    const regXP = new RegExp(pattern);
    const currentValue = inputTagId.value;

    // run all this only if a value is entered
    if (currentValue != "") {

        if (regXP.test(currentValue)) {
            inputTagId.style.borderBottom = "4px solid lime";
            inputTagId.style.borderRight = "4px solid lime";
            window[object][property] = currentValue;
        } else {
            inputTagId.style.borderBottom = "4px solid red";
            inputTagId.style.borderRight = "4px solid red";
            window[object][property] = null;
        }

    } else {
        window[object][property] = null;

        if (inputTagId.required) {
            inputTagId.style.borderBottom = "4px solid red";
            inputTagId.style.borderRight = "4px solid red";
        } else {
            inputTagId.style.borderBottom = "1px solid #ced4da";
            inputTagId.style.borderRight = "1px solid #ced4da";
        }
    }
};

//fill the data list
const fillDataIntoDataListYathra = (fieldId, dataList, propertyName) => {

    fieldId.innerHTML = '';

    for (const obj of dataList) {
        let option = document.createElement('option');
        option.value = obj[propertyName];
        fieldId.appendChild(option)

    }
}

//set country code auto
const passCountryCodeInqForm = (contactNumInputElement) => {

    contactNumInputElement.value = "";

    if (inquiry.nationality_id?.id != null) {

        const countryCode = inquiry.nationality_id.countrycode;

        if (countryCode) {
            contactNumInputElement.value = countryCode;
        } else {
            contactNumInputElement.value = "";
        }
    } else {
        contactNumInputElement.value = "";
    }

}

//after clicking READ MORE btn
const openReusableModalForCardsReadMore = (package) => {

    // Clear previous content
    ForDPlansAccordions.innerHTML = "";
    pkgname.innerText = package.pkgtitle;
    pkgDescription.innerText = package.web_description;

    //for images
    //img1 will be the cover photo...populated in js

    //img1
    if (package.img1 != null) {
        image1.src = atob(package.img1);
    } else {
        image1.src = 'images/sigiriya.jpg';
    }

    //img 2
    if (package.img2 != null) {
        image2.src = atob(package.img2);
    } else {
        image2.src = 'images/sigiriya.jpg';
    }

    //img3
    if (package.img3 != null) {
        image3.src = atob(package.img3);
    } else {
        image3.src = 'images/sigiriya.jpg';
    }

    // For start dates
    accorsForStartDayPlans.appendChild(makeAccordionsForSDnED(package.sd_dayplan_id, 'Start Day ', "SD"));

    console.log("Package Day Plans: ", package.dayplans);

    // Create accordions for middle day plans
    package.dayplans.forEach((tpDayPlan, index) => {

        // "accordion-item" div
        let accItemDiv = document.createElement('div');
        accItemDiv.className = "accordion-item border rounded shadow-sm mb-3";

        // acc header div , inside "accordion-item"
        let acHdrDiv = document.createElement('div');
        acHdrDiv.className = "accordion-header mb-2";

        // button inside header 
        let accBtn = document.createElement('button');
        accBtn.className = "accordion-button collapsed fw-bold bg-white text-dark shadow-sm";
        accBtn.setAttribute('type', 'button');
        accBtn.setAttribute('data-bs-toggle', 'collapse');
        accBtn.setAttribute('data-bs-target', '#flushCollapseOne' + index.toString());
        accBtn.setAttribute('aria-expanded', 'false');
        accBtn.setAttribute('aria-controls', 'flushCollapseOne' + index.toString());

        // h inside button
        let hTag = document.createElement('h5');
        hTag.className = "text-primary mb-0";
        //hTag.innerText = ("Day #" + (parseInt(index) + 2)); ✅✅✅
        hTag.innerHTML = tpDayPlan.daytitle;

        // flushCollapseOne inside "accordion-item"
        let clpsDiv = document.createElement('div');
        clpsDiv.className = "accordion-collapse collapse my-1";
        clpsDiv.setAttribute('id', 'flushCollapseOne' + index.toString());
        clpsDiv.setAttribute('data-bs-parent', 'ForDPlansAccordions');

        // inside flushCollapseOne 
        let accBody = document.createElement('div');
        accBody.className = "accordion-body bg-light border-top pt-3";

        // Attraction list
        tpDayPlan.vplaces.forEach((place, index) => {
            let p = document.createElement('p');
            p.className = "mb-1 ps-2";
            p.innerHTML = `<span class="text-secondary">${index + 1} ⏩</span> ${place.name}`;
            accBody.appendChild(p);
        });

        // Accommodation section (if available)
        if (tpDayPlan.drop_stay_id) {
            let staySection = document.createElement('div');
            staySection.className = "mt-4";

            let mainStay = document.createElement('div');
            mainStay.className = "alert alert-success py-2 px-3 mb-2 small";
            mainStay.innerHTML = `🏨 <strong>Main Accommodation:</strong> ${tpDayPlan.drop_stay_id.name}`;
            staySection.appendChild(mainStay);

            if (tpDayPlan.alt_stay_1_id || tpDayPlan.alt_stay_2_id) {
                if (tpDayPlan.alt_stay_1_id) {
                    let alt1 = document.createElement('div');
                    alt1.className = "alert alert-warning py-2 px-3 mb-2 small";
                    alt1.innerHTML = `🔁 <strong>Alternate Option 1:</strong> ${tpDayPlan.alt_stay_1_id.name}`;
                    staySection.appendChild(alt1);
                }
                if (tpDayPlan.alt_stay_2_id) {
                    let alt2 = document.createElement('div');
                    alt2.className = "alert alert-warning py-2 px-3 mb-2 small";
                    alt2.innerHTML = `🔁 <strong>Alternate Option 2:</strong> ${tpDayPlan.alt_stay_2_id.name}`;
                    staySection.appendChild(alt2);
                }

                let altNote = document.createElement('div');
                altNote.className = "text-muted fst-italic small ps-2";
                altNote.innerText = "Note: If the selected accommodation is unavailable, a similar-rated stay will be provided.";
                staySection.appendChild(altNote);
            }

            accBody.appendChild(staySection);
        }

        // append accordion-body to flushCollapseOne
        clpsDiv.appendChild(accBody);

        // append hTag to button
        accBtn.appendChild(hTag);

        // append button to accHeader 
        acHdrDiv.appendChild(accBtn);

        // append header and flushCollapseOne to item
        accItemDiv.appendChild(acHdrDiv);
        accItemDiv.appendChild(clpsDiv);
        ForDPlansAccordions.appendChild(accItemDiv);
    });


    // For end dates
    //first check its existence(no end day in 1 day tours)
    if (package.ed_dayplan_id != null) {
        accorsForEndDayPlans.appendChild(makeAccordionsForSDnED(package.ed_dayplan_id, 'Last Day ', "ED"));
    }

    // Bind the package id with inquiry.based_tpkg_id field 💥💥💥
    inquiry.intrstdpkgid = package;

    //show the selected pkg name in the form
    selectedPkgName.innerText = package.pkgtitle;

    // Open the modal
    $('#reusableModalForCards').modal('show');
}

//common fn for create accordions for start day and end day
const makeAccordionsForSDnEDoRI = (dayPlan, dayType, SDorED) => {

    console.log("SD or ED Day plan");
    console.log(dayPlan);

    //"accordion-item" div
    let accItemDiv = document.createElement('div');
    accItemDiv.className = "accordion-item";

    //acc header div , inside "accordion-item"
    let acHdrDiv = document.createElement('div');
    acHdrDiv.className = "accordion-header mb-2";

    //button inside header 
    let accBtn = document.createElement('button');
    accBtn.className = "p-0 accordion-button collapsed fw-bold mt-2";
    accBtn.setAttribute('type', 'button');
    accBtn.setAttribute('data-bs-toggle', 'collapse');
    accBtn.setAttribute('data-bs-target', `#` + SDorED)
    accBtn.setAttribute('aria-expanded', 'false');
    accBtn.setAttribute('aria-controls', SDorED);

    console.log(dayType);

    //h inside button
    let hTag = document.createElement('h5');
    hTag.className = "text-info"
    hTag.innerText = dayType;
    // hTag.innerText = dayType + " " + dayPlan.daytitle;

    //flushCollapseOneSDorED inside "accordion-item"
    let clpsDiv = document.createElement('div');
    clpsDiv.className = "accordion-collapse collapse ps-4"
    clpsDiv.setAttribute('id', SDorED);
    clpsDiv.setAttribute('data-bs-parent', 'ForDPlansAccordions');

    //inside flushCollapseOneSDorED 
    let accBody = document.createElement('div');
    accBody.className = "accordion-body bg-light ";

    if (SDorED === 'SD') {
        let pickupText = document.createElement('p');
        pickupText.className = "text-muted mb-2 fst-italic";
        pickupText.innerText = "We’ll pick you up from the airport or any location you prefer.";
        accBody.appendChild(pickupText);
    }

    //accBodyHTML = "";

    //dayPlan.vplaces.forEach((place, index) => {
    //    accBodyHTML = accBodyHTML + "<p class='mb-0'>" + (parseInt(index) + 1) + " ⏩ " + place.name + "</p>";
    //})
    //accBody.innerHTML = accBodyHTML;

    dayPlan.vplaces.forEach((place, index) => {
        let p = document.createElement('p');
        p.className = "mb-0";
        p.innerText = `${index + 1} ⏩ ${place.name}`;
        accBody.appendChild(p);
    });

    if (SDorED === 'ED') {
        let dropText = document.createElement('p');
        dropText.className = "text-muted mt-2 fst-italic";
        dropText.innerText = "We’ll drop you off at the airport or any location of your choice.";
        accBody.appendChild(dropText);
    }

    //append accordion-body to flushCollapseOneSDorED
    clpsDiv.appendChild(accBody);

    //append hTag to button
    accBtn.appendChild(hTag);

    //append button to accHeader 
    acHdrDiv.appendChild(accBtn)

    //append header and flushcollapseoneSDorED to item
    accItemDiv.appendChild(acHdrDiv);
    accItemDiv.appendChild(clpsDiv);

    return accItemDiv;

}

// for start and end date
const makeAccordionsForSDnED = (dayPlan, dayType, SDorED) => {

    console.log("SD or ED Day plan");
    console.log(dayPlan);

    // "accordion-item" div
    let accItemDiv = document.createElement('div');
    accItemDiv.className = "accordion-item border rounded shadow-sm";

    // acc header div , inside "accordion-item"
    let acHdrDiv = document.createElement('div');
    acHdrDiv.className = "accordion-header mb-2";

    // button inside header 
    let accBtn = document.createElement('button');
    accBtn.className = "accordion-button collapsed fw-bold bg-white text-dark shadow-sm";
    accBtn.setAttribute('type', 'button');
    accBtn.setAttribute('data-bs-toggle', 'collapse');
    accBtn.setAttribute('data-bs-target', `#${SDorED}`);
    accBtn.setAttribute('aria-expanded', 'false');
    accBtn.setAttribute('aria-controls', SDorED);

    // h inside button
    let hTag = document.createElement('h5');
    hTag.className = "text-primary mb-0";
    hTag.innerText = dayType;

    // flushCollapseOneSDorED inside "accordion-item"
    let clpsDiv = document.createElement('div');
    clpsDiv.className = "accordion-collapse collapse";
    clpsDiv.setAttribute('id', SDorED);
    clpsDiv.setAttribute('data-bs-parent', 'ForDPlansAccordions');

    // inside flushCollapseOneSDorED 
    let accBody = document.createElement('div');
    accBody.className = "accordion-body bg-light border-top pt-3";

    // START day message
    if (SDorED === 'SD') {
        let pickupText = document.createElement('div');
        pickupText.className = "alert alert-info py-2 px-3 mb-3 fst-italic small";
        pickupText.innerText = "🛬 We'll pick you up from the airport or any location you prefer.";
        accBody.appendChild(pickupText);
    }

    // Attraction places
    dayPlan.vplaces.forEach((place, index) => {
        let p = document.createElement('p');
        p.className = "mb-1 ps-2";
        p.innerHTML = `<span class="text-secondary">${index + 1} ⏩</span> ${place.name}`;
        accBody.appendChild(p);
    });

    // Accommodation (Only for Start Day)
    if (SDorED === 'SD' && dayPlan.drop_stay_id) {
        let staySection = document.createElement('div');
        staySection.className = "mt-4";

        let mainStay = document.createElement('div');
        mainStay.className = "alert alert-success py-2 px-3 mb-2 small";
        mainStay.innerHTML = `🏨 <strong>Main Accommodation:</strong> ${dayPlan.drop_stay_id.name}`;
        staySection.appendChild(mainStay);

        if (dayPlan.alt_stay_1_id || dayPlan.alt_stay_2_id) {
            if (dayPlan.alt_stay_1_id) {
                let alt1 = document.createElement('div');
                alt1.className = "alert alert-warning py-2 px-3 mb-2 small";
                alt1.innerHTML = `🔁 <strong>Alternate Option 1:</strong> ${dayPlan.alt_stay_1_id.name}`;
                staySection.appendChild(alt1);
            }
            if (dayPlan.alt_stay_2_id) {
                let alt2 = document.createElement('div');
                alt2.className = "alert alert-warning py-2 px-3 mb-2 small";
                alt2.innerHTML = `🔁 <strong>Alternate Option 2:</strong> ${dayPlan.alt_stay_2_id.name}`;
                staySection.appendChild(alt2);
            }

            let altNote = document.createElement('div');
            altNote.className = "text-muted fst-italic small ps-2";
            altNote.innerText = "Note: If the selected accommodation is unavailable, a similar-rated stay will be provided.";
            staySection.appendChild(altNote);
        }

        accBody.appendChild(staySection);
    }

    // END day message
    if (SDorED === 'ED') {
        let dropText = document.createElement('div');
        dropText.className = "alert alert-info py-2 px-3 mt-3 fst-italic small";
        dropText.innerText = "✈️ We'll drop you off at the airport or any location of your choice.";
        accBody.appendChild(dropText);
    }

    // append accordion-body to flushCollapseOneSDorED
    clpsDiv.appendChild(accBody);

    // append hTag to button
    accBtn.appendChild(hTag);

    // append button to accHeader 
    acHdrDiv.appendChild(accBtn);

    // append header and flushcollapseoneSDorED to item
    accItemDiv.appendChild(acHdrDiv);
    accItemDiv.appendChild(clpsDiv);

    return accItemDiv;
};

//after clicking send inquiry btn
const openModalForPkgInqs = () => {
    $('#reusableModalForCards').modal('hide');
    $('#modalForPkgRelatedInqs').modal('show');

    //💥💥💥 + in html 197
    // document.getElementById('selectedPkgId').value = selectedpkg.id;
}

const checkGenInqErrors = () => {
    let genInqFormErrors = '';

    if (inquiry.clientname == null) {
        genInqFormErrors += "Please enter your name.\n";
    }
    //if (inquiry.nationality_id == null) {
    //    genInqFormErrors += "Please select your country.\n";
    //}
    if (inquiry.email == null) {
        genInqFormErrors += "Please provide your email address.\n";
    }
    //if (inquiry.contactnum == null) {
    //    genInqFormErrors += "Please enter your contact number.\n";
    //}
    if (inquiry.prefcontactmethod == null) {
        genInqFormErrors += "Please choose your preferred contact method.\n";
    }
    if (inquiry.main_inq_msg == null) {
        genInqFormErrors += "Please enter the details of your enquiry.\n";
    }

    return genInqFormErrors;
};

//ADD BTN OF PKG RELATED INQ FORM
const pkgRelInqAddBtn = async () => {

    const errors = checkGenInqErrors();

    if (errors == '') {
        try {
            inquiry.inqsrc = 'Website';
            let postServiceResponse = await ajaxPPDRequest("/inquiryfromweb", "POST", inquiry);
            console.log("submitted inq: ", inquiry);
            if (postServiceResponse === "OK") {
                console.log("submitted inq: ", inquiry);
                showAlertModal("suc", "Thank you! Your inquiry has been submitted and we will get back to you soon");
                formPkgRelateInqForm.reset();
                refreshPkgRelInqForm();
                $("#modalForPkgRelatedInqs").modal("hide");
            } else {
                showAlertModal("err", "Sorry, we couldn't process your request at the moment. Please try again in a few minutes.");
            }

        } catch (error) {
            showAlertModal("err", "Oops! Something went wrong on our end. Please refresh the page and try again.");
        }

    } else {
        showAlertModal('war', 'Oops! There were some issues with your form submission:\n' + errors);
    }
}

//handle start date     
const handleApproxDatesOpts = () => {
    const startDateInput = document.getElementById('inqStartDate');
    const dateNotSureCB = document.getElementById('startDateNotSure');
    const dateSureCB = document.getElementById('startDateApprox');

    if (dateNotSureCB.checked) {
        startDateInput.classList.add('d-none');
        startDateInput.style.border = "1px solid #ced4da"
        startDateInput.value = "";
        inquiry.inq_apprx_start_date = null
    } else if (dateSureCB) {
        startDateInput.classList.remove('d-none');
    }
}

//days count eka anuwa FOREACH multiple accordions hadenna one💥💥💥

//first div tag
// let mainDiv = document.createElement('div');
// mainDiv.className = "mb-2 w-100 border p-3 accordion accordion-flush mt-1";
// mainDiv.setAttribute('id', $id);
//or mainDiv.id = ""
//id ekata placeholder ekak dala foreach day eka increment karanna💥💥💥

//second div
// let secondDiv = document.createElement('div');
// secondDiv.className = "accordion-item";

//div for acc header
// let divAccHdr = document.createElement('h5');
// divAccHdr.className = "accordion-header mb-2";

//button inside header
// let hdrBtn = document.createElement('button');
// hdrBtn.className = "p-0 accordion-button collapsed fw-bold ";
// hdrBtn.setAttribute('type', 'button');
// hdrBtn.setAttribute('data-bs-toggle', 'collapse');
// hdrBtn.setAttribute('data-bs-target', '#flushCollapseOne'); //mekath id ekak
// hdrBtn.setAttribute('aria-expanded', 'false');
// hdrBtn.setAttribute('aria-controls', 'flushCollapseOne'); //same id

//h for button txt
// let btnTxtH = document.createElement('h5');
// btnTxtH.className="text-info";
// btnTxtH.innerText='day___' //methentath placeholder value eka enna one

//div for actual accordion
// let accoDiv = document.createElement('div');
// accoDiv.className =  "accordion-collapse collapse ps-4";
// accoDiv.setAttribute('data-bs-parent' , '' ) ; //methana mulma id eke placeholder eka

//div for acc body
// let accBody = document.createElement('div');
// accBody.className="accordion-body bg-light d-flex justify-content-between";

//append all
// accoDiv.appendChild(accBody);
// divAccHdr.appendChild(hdrBtn);
// divAccHdr.appendChild(btnTxtH);
// secondDiv.appendChild(accoDiv);
// secondDiv.appendChild(divAccHdr);
// mainDiv.appendChild(secondDiv);
// divForAccordions.appendChild(mainDiv);


