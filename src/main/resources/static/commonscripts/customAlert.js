function showAlertModal(message) {
    let modal = document.getElementById("customAlertModal");
    document.getElementById("alertMsg").innerText = message;

    modal.style.display = "block";

    // Slide down effect
    setTimeout(() => {
        modal.style.top = "10px";
        modal.style.opacity = "1";
    }, 10);
}

function closeAlertModal() {
    let modal = document.getElementById("customAlertModal");

    // Slide up before closing
    modal.style.top = "-100px";
    modal.style.opacity = "0";

    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
}
