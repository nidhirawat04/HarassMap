/* =========================
   SECTION NAVIGATION
========================= */

const sections = document.querySelectorAll("main > section");

const navigationButtons = document.querySelectorAll(
    ".nav-btn, .open-section, .back-btn"
);

function showSection(sectionId) {

    sections.forEach(function (section) {
        section.style.display = "none";
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.style.display =
            sectionId === "home" ? "block" : "flex";
    }

    // Fix Leaflet map size when opening the map section
    if (sectionId === "map") {
        setTimeout(function () {
            map.invalidateSize();
        }, 100);
    }
}


navigationButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const sectionId = button.dataset.section;

        showSection(sectionId);

    });

});


/* Show Home when the website first loads */

showSection("home");


/* =========================
   LOCATION
========================= */

const locationButton = document.getElementById("location-btn");
const locationInput = document.getElementById("location");

let latitude = null;
let longitude = null;


locationButton.addEventListener("click", function () {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");

        return;
    }

    locationButton.textContent = "Getting location...";
    locationButton.disabled = true;


    navigator.geolocation.getCurrentPosition(

        function (position) {

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            locationInput.value =
                `${latitude}, ${longitude}`;

            locationButton.textContent = "Location Added";

            locationButton.disabled = false;
        },

        function () {

            alert(
                "Unable to get your location. Please enter it manually."
            );

            locationButton.textContent =
                "Use My Current Location";

            locationButton.disabled = false;
        }

    );

});


/* =========================
   REPORT FORM
========================= */

const reportForm = document.getElementById("report-form");
const successMessage = document.getElementById("success-message");


reportForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const incidentType =
        document.getElementById("incident-type").value;

    const description =
        document.getElementById("description").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const date =
        document.getElementById("incident-date").value;


    const report = {

        incidentType: incidentType,

        description: description,

        location: location,

        latitude: latitude,

        longitude: longitude,

        date: date

    };


    const reports =
        JSON.parse(localStorage.getItem("reports")) || [];


    reports.push(report);


    localStorage.setItem(
        "reports",
        JSON.stringify(reports)
    );


    successMessage.textContent =
        "Report submitted successfully!";


    reportForm.reset();

    latitude = null;
    longitude = null;

    locationButton.textContent =
        "Use My Current Location";


    // Add the newly submitted report to the map
    addReportToMap(report);

});


/* =========================
   LEAFLET MAP
========================= */

const map = L.map("safety-map").setView(
    [28.6139, 77.2090],
    12
);


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


/* =========================
   INCIDENT MARKERS
========================= */

const heatPoints = [];


function getMarkerColor(incidentType) {

    const colors = {

        verbal: "orange",

        stalking: "purple",

        physical: "red",

        online: "blue",

        other: "gray"

    };

    return colors[incidentType] || "gray";
}


function addReportToMap(report) {

    if (
        report.latitude === null ||
        report.longitude === null
    ) {
        return;
    }


    const latitude = Number(report.latitude);
    const longitude = Number(report.longitude);


    if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
    ) {
        return;
    }


    /* Add point to heatmap */

    heatPoints.push([
        latitude,
        longitude,
        1
    ]);


    /* Create marker */

    const markerColor =
        getMarkerColor(report.incidentType);


    const marker = L.circleMarker(
        [latitude, longitude],
        {
            radius: 8,

            color: markerColor,

            fillColor: markerColor,

            fillOpacity: 0.7
        }
    ).addTo(map);


    /* Popup content */

    marker.bindPopup(`
        <strong>${report.incidentType}</strong>
        <br>
        ${report.description}
        <br>
        ${report.location}
        <br>
        <small>${report.date}</small>
    `);

}


/* =========================
   LOAD SAVED REPORTS
========================= */

const savedReports =
    JSON.parse(localStorage.getItem("reports")) || [];


savedReports.forEach(function (report) {

    addReportToMap(report);

});


/* =========================
   HEATMAP
========================= */

const heatLayer = L.heatLayer(
    heatPoints,
    {
        radius: 25,

        blur: 15,

        maxZoom: 17
    }
).addTo(map);