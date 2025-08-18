//FOR ALERTS
const showAlertModal = (type, message) => {
    let modal = document.getElementById("customAlertModal");
    document.getElementById("alertMsg").innerText = message;

    modal.classList.remove("success", "info", "warning", "error");

    let title = document.getElementById('alertTitle');
    let icon = document.getElementById('alertIcon');
    let okButton = document.querySelector('.alert-footer button');

    if (type === 'suc') {
        title.innerText = 'Success';
        icon.src = 'images/success.png';
        modal.classList.add("success");
        okButton.className = 'btn-success';
    } else if (type === 'inf') {
        title.innerText = 'Info';
        icon.src = 'images/employee.png';
        modal.classList.add("info");
        okButton.className = 'btn-info';
    } else if (type === 'war') {
        title.innerText = 'Warning';
        icon.src = 'images/warning.png';
        modal.classList.add("warning");
        okButton.className = 'btn-warning';
    } else if (type === 'err') {
        title.innerText = 'Error';
        icon.src = 'images/error.png';
        modal.classList.add("error");
        okButton.className = 'btn-danger';
    }

    modal.style.display = "block";

    // Slide-down effect
    setTimeout(() => {
        modal.style.top = "20px";
        modal.style.opacity = "1";
    }, 10);
};

//not used
const closeAlertModal = () => {
    let modal = document.getElementById("customAlertModal");

    // Slide up before closing
    modal.style.top = "-100px";
    modal.style.opacity = "0";

    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
}



