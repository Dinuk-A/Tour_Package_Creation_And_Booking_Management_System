window.addEventListener('load', () => {

    handleCardVisibility();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//based on logged user role
const handleCardVisibility = () => {

    //get logged user roles
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);
    roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    //changes for higher users
    if (roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager")) {
        document.getElementById('inqSummaryCard').style.display = 'none';
        document.getElementById('unassignedInqCard').style.display = 'block';
        document.getElementById('pendingAssignCard').style.display = 'block';

        loadUnassignedInquiries();
        loadPendingAssignmentBookings();

    } else if (roles.includes("Executive")) {
        document.getElementById('inqSummaryCard').style.display = 'block';
        document.getElementById('unassignedInqCard').style.display = 'none';
        document.getElementById('pendingAssignCard').style.display = 'none';

        loadRescheduledInquiriesForToday();
        showCurrentlyActiveInquiries();
    }
}

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

// fn to load unassigned inquiries count
const loadUnassignedInquiries = async () => {
    try {
        const unassignedInquiries = await ajaxGetReq("/inq/new/unassigned");
        document.getElementById("unassignedInqCount").innerText = unassignedInquiries.length;
    } catch (error) {
        console.error("Failed to fetch unassigned inquiries:", error);
    }
};

// fn to load pending assignment bookings count
const loadPendingAssignmentBookings = async () => {
    try {
        const pendingBookings = await ajaxGetReq("/booking/assignmentspending");
        document.getElementById("pendingAssignCount").innerText = pendingBookings.length;
    } catch (error) {
        console.error("Failed to fetch pending assignment bookings:", error);
    }
};

const loadUpcomingToursOri = async () => {
    try {
        const tours = await ajaxGetReq("/report/upcomingtours");

        const list = document.getElementById("upcomingTourList");
        list.innerHTML = "";

        if (tours.length === 0) {
            const noItem = document.createElement("li");
            noItem.classList.add("list-group-item", "text-muted");
            noItem.innerText = "No upcoming tours found.";
            list.appendChild(noItem);
            return;
        }

        for (const tour of tours) {
            const item = document.createElement("li");
            item.classList.add("list-group-item");

            const content = `
                <strong>${tour.bookingCode}</strong> | ${tour.packageTitle}<br>
                <span class="text-muted">Client: ${tour.clientName} | Contact: ${tour.clientContact}</span>
            `;

            item.innerHTML = content;
            list.appendChild(item);
        }

    } catch (err) {
        console.error("Failed to load upcoming tours", err);
        document.getElementById("upcomingTourList").innerHTML = `
            <li class="list-group-item text-danger">Error loading upcoming tours.</li>
        `;
    }
};

//limited to 5
const loadUpcomingTours = async () => {
    try {
        const tours = await ajaxGetReq("/report/upcomingtours");

        const list = document.getElementById("upcomingTourList");
        list.innerHTML = "";

        if (tours.length === 0) {
            const noItem = document.createElement("li");
            noItem.classList.add("list-group-item", "text-muted");
            noItem.innerText = "No upcoming tours found.";
            list.appendChild(noItem);
            return;
        }

        const limitedTours = tours.slice(0, 5);

        for (const tour of limitedTours) {
            const item = document.createElement("li");
            item.classList.add("list-group-item");

            const content = `
                <strong>${tour.bookingCode}</strong> | ${tour.packageTitle}<br>
                <span class="text-muted">Client: ${tour.clientName} | Contact: ${tour.clientContact}</span>
            `;

            item.innerHTML = content;
            list.appendChild(item);
        }

    } catch (err) {
        console.error("Failed to load upcoming tours", err);
        document.getElementById("upcomingTourList").innerHTML = `
            <li class="list-group-item text-danger">Error loading upcoming tours.</li>
        `;
    }
};


// Call on page load
window.addEventListener("load", loadUpcomingTours);




