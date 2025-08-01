window.addEventListener('load', () => {

    loadRescheduledInquiriesForToday();
    showCurrentlyActiveInquiries();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

// fn to load rescheduled inquiries for today
const loadRescheduledInquiriesForToday = async () => {
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

        const rescheduledSection = document.getElementById("rescheduledInqSection");
        const listContainer = document.getElementById("rescheduledInqList");

        if (rescheduledInqs.length > 0) {
            listContainer.innerHTML = "";

            rescheduledInqs.forEach(inq => {
                const li = document.createElement("li");
                li.classList.add("list-group-item", "py-1");
                li.innerText = `${inq.inqcode} – ${inq.clientname}`;
                listContainer.appendChild(li);
            });

            rescheduledSection.classList.remove("d-none");
        } else {
            // Hide if no rescheduled inquiries
            rescheduledSection.classList.add("d-none");
            listContainer.innerHTML = "";
        }
    } catch (err) {
        console.error("Failed to fetch today's rescheduled inquiries:", err);
    }
};

//fn to show currently active inquiries count
const showCurrentlyActiveInquiries = async () => {

    //  logged users employee ID
    const loggedEmpId = document.getElementById('loggedUserEmpIdSectionId').textContent.trim();
    console.log("loggedEmpId:", loggedEmpId);

    try {
        //  working inquiries
        const workingInqs = await ajaxGetReq("/inq/personal/active?empid=" + loggedEmpId);
        document.getElementById("workingInqCount").innerText = workingInqs.length;

        //  newly assigned (not started) inquiries
        const newAssignedInqs = await ajaxGetReq("/inq/personal/notstarted?empid=" + loggedEmpId);
        document.getElementById("newAssignedCount").innerText = newAssignedInqs.length;

    } catch (error) {
        console.error("Failed to fetch inquiry counts:", error);
    }
};

