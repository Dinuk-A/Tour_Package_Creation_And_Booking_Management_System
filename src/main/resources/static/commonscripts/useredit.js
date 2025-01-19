window.addEventListener('DOMContentLoaded',async () => {
    try {
        loggedUser = await ajaxGetReq("/loggeduser");
    } catch (error) {
        console.error("Failed to fetch Current User : ", error);
    }
})


const refreshProfileEditForm = () => {

    editPortalUN.value = loggedUser.username;

    if (loggedUser.avatar == null) {
        previewUserAvatar.src = "images/employee.png";
    } else {
        previewUserAvatar.src = atob(loggedUser.avatar);
    }

}

const checkNewPassword=()=>{
    editPortalRetypePW.disabled = false;
}

const retypePWValiForEditPortal = () => {
    if (editPortalRetypePW.value == editPortalNewPW.value) {
        editPortalRetypePW.style.border = "2px solid lime";
        loggedUser.newpassword = editPortalRetypePW.value;
    } else {
        editPortalRetypePW.style.border = '2px solid red';
        loggedUser.newpassword = null;
    }
}



//submit image
const imgValidatorUserEditPortal = () => {
    if (fileInputUserAvatar.files != null) {
        let imgFile = fileInputUserAvatar.files[0];
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
            previewUserAvatar.src = e.target.result;
            loggedUser.avatar = btoa(e.target.result);
        }
        fileReader.readAsDataURL(imgFile);
    }
}

const submitUserAccChanges =async () => {

    try {
        let updateServicesResponces = await ajaxPPDRequest("/edituserinfo", "PUT", loggedUser);

    if (updateServicesResponces == 'OK') {
        alert('User Profile Changed Successfully! \n ');
        window.location.assign("/logout");
    } else {
        alert('User Info Change Failed \n' +
            updateServicesResponces);
    }
    } catch (error) {
        alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
    }
    
}