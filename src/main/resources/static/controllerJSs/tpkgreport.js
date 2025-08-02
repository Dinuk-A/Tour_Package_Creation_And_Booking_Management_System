window.addEventListener('load', () => {

    // Load date pickers when the page is loading
    const today = new Date().toISOString().split('T')[0];
    const startDatePicker = document.getElementById('startDatePickerID');
    const endDatePicker = document.getElementById('endDatePickerID');

    // Set max date to today
    startDatePicker.setAttribute('max', today);
    endDatePicker.setAttribute('max', today);

    // When start date changes
    startDatePicker.addEventListener('change', function () {
        const startDateValue = this.value;
        endDatePicker.value = today;
        endDatePicker.setAttribute('min', startDateValue);
    });

    // When end date is earlier than start date
    endDatePicker.addEventListener('change', function () {
        const endDateValue = this.value;
        const startDateValue = startDatePicker.value;
        if (endDateValue < startDateValue) {
            alert('End date cannot be earlier than start date.');
            this.value = '';
        }
    });

    // Generate report button
    document.getElementById('generateReportBtn').addEventListener('click', fillTable);
});

const fillTable = async () => {
    const startDate = startDatePickerID.value;
    const lastDate = endDatePickerID.value;

    if (startDate && lastDate) {

        document.getElementById('pkgInquiryReportTable').classList.remove('d-none');

        const formattedDateRangeText = `${new Date(startDate).toLocaleDateString()} to ${new Date(lastDate).toLocaleDateString()}`;
        document.getElementById('dateRange').innerText = formattedDateRangeText;

        try {
            const reportData = await ajaxGetReq("report/inquiries-by-pkg/" + startDate + "/" + lastDate);
            const labels = reportData.labels; // pkg IDs
            const data = reportData.data;

            const tableBody = document.getElementById("pkgInquiryReportTableBody");
            tableBody.innerHTML = "";

            for (let i = 0; i < labels.length; i++) {
                const pkgId = labels[i];
                const count = data[i];

                // Fetch title & code for each package
                let pkgInfo;
                try {
                    pkgInfo = await ajaxGetReq("/tpkg/byid?tpkgId=" + pkgId);
                } catch (err) {
                    console.error("Failed to load package details for ID " + pkgId, err);
                    pkgInfo = { pkgtitle: "Unknown", pkgcode: "N/A" };
                }

                const row = document.createElement("tr");

                const pkgCell = document.createElement("td");
                pkgCell.innerText = pkgInfo.pkgcode + " - " + pkgInfo.pkgtitle;

                const countCell = document.createElement("td");
                countCell.innerText = count;

                row.appendChild(pkgCell);
                row.appendChild(countCell);

                tableBody.appendChild(row);
            }

        } catch (error) {
            console.error("Error fetching inquiry data:", error);
            alert("Failed to load inquiry report.");
        }

    } else {
        alert('Please select both start date and end date.');
    }
}
