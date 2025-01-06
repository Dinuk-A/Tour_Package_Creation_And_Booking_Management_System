window.addEventListener('DOMContentLoaded',()=>{
    loggedUser = ajaxGetRequest("/loggeduser");
})


const refreshProfileEditForm = () => {    

    editPortalUN.value = loggedUser.username;
    editPortalEmail.value = loggedUser.email;

    if (loggedUser.user_photo === null) {
        editPortalImage.src = "resources/images/employee.png";
    } else {
        editPortalImage.src = atob(loggedUser.user_photo);
    }
}

const retypePasswordValiForEditPortal = () => {
    if (editPortalRetypePW.value == editPortalNewPW.value) {
        editPortalRetypePW.style.border = "2px solid lime";
        loggedUser.newpw = editPortalRetypePW.value;
    } else {
        editPortalRetypePW.style.border = '2px solid red';
        loggedUser.newpw = null;
    }
}

const imgValidator = (fileElement, object, imgProperty, imgNameProperty, previewId) => {

    if (fileElement.files != null) {
        console.log(fileElement.files);

        let file = fileElement.files[0];
        // window[object][imgNameProperty] = file.name;

        let fileReader = new FileReader();

        fileReader.onload = function (e) {
            previewId.src = e.target.result;
            window[object][imgProperty] = btoa(e.target.result);

        }
        fileReader.readAsDataURL(file);
    }

}

const submitProfileChanges = () => {
    
    let updateServicesResponces = ajaxRequest("/edituserinfo", "PUT", loggedUser);

    if (updateServicesResponces == 'OK') {
        alert('User Profile Changed Successfully! \n ');
        window.location.assign("/logout");
    } else {

        alert('User Info Change Failed \n' +
            updateServicesResponces);
    }
}