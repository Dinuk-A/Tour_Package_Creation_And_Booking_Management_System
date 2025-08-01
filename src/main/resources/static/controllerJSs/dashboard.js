window.addEventListener('load', () => {

    loadRescheduledInquiriesForToday();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

const loadRescheduledInquiriesForToday = async () => {
    // Get logged-in employee ID from the element
    const loggedInEmpIdElem = document.getElementById("loggedUserEmpIdSectionId");
    if (!loggedInEmpIdElem) {
        console.warn("Logged-in employee ID element not found");
        return;
    }

    const loggedInEmpId = loggedInEmpIdElem.innerText.trim();
    if (!loggedInEmpId) {
        console.warn("Logged-in employee ID is empty");
        return;
    }

    try {
        const rescheduledInqs = await ajaxGetReq(`/inq/personal/rescheduled/today?empid=${loggedInEmpId}`);
        console.log("Today's rescheduled inquiries:", rescheduledInqs);
        if (rescheduledInqs.length > 0) {
            const listContainer = document.getElementById("rescheduledInqList");
            listContainer.innerHTML = ""; 

            rescheduledInqs.forEach(inq => {
                const li = document.createElement("li");
                li.innerText = `${inq.inqcode} – ${inq.clientname}`;
                listContainer.appendChild(li);
            });

            document.getElementById("rescheduledInqSection").classList.remove("d-none");
        }
    } catch (err) {
        console.error("Failed to fetch today's rescheduled inquiries:", err);
    }
}