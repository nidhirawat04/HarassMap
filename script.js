const sections = document.querySelectorAll("main section");

const buttons = document.querySelectorAll(
    ".nav-btn, .open-section, .back-btn"
);

buttons.forEach(function(button) {

    button.addEventListener("click", function() {

        const sectionId = button.dataset.section;

        sections.forEach(function(section) {
            section.style.display = "none";
        });

        if (sectionId === "home") {
            document.getElementById(sectionId).style.display = "block";
        } else {
            document.getElementById(sectionId).style.display = "flex";
        }

    });

});

sections.forEach(function(section) {
    section.style.display = "none";
});

document.getElementById("home").style.display = "block";

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

    navigator.geolocation.getCurrentPosition(
        function (position) {

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            locationInput.value =
                latitude + ", " + longitude;

            locationButton.textContent = "Location Added";

        },

        function (error) {

            alert("Unable to get your location.");

            locationButton.textContent =
                "Use My Current Location";
        }
    );

});

const reportForm = document.getElementById("report-form");

reportForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const incidentType = document.getElementById("incident-type").value;

    const description = document.getElementById("description").value;

    const location = document.getElementById("location").value;

    const date = document.getElementById("incident-date").value;

    const report = {
        incidentType: incidentType,
        description: description,
        location: location,
        latitude: latitude,
        longitude: longitude,
        date: date
    };

    let reports= JSON.parse(localStorage.getItem("reports")) || [];

    reports.push(report);

    localStorage.setItem("reports", JSON.stringify(reports));

    const successMessage = document.getElementById("success-message");

    successMessage.textContent = "Report submitted successfully!";

    reportForm.reset();

    latitude = null;
    longitude = null;
});

const map = L.map("safety-map").setView([28.6139, 77.2090],12);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);

const savedReports =
    JSON.parse(localStorage.getItem("reports")) || [];

const heatPoints = [];

savedReports.forEach(function(report){
    if(report.latitude!== null && report.longitude!== null){

        heatPoints.push([
            report.latitude,
            report.longitude,
            1
        ]);

        let markerColor;

        if (report.incidentType === "verbal") {
            markerColor = "orange";
        } 
        else if (report.incidentType === "stalking") {
            markerColor = "purple";
        } 
        else if (report.incidentType === "physical") {
            markerColor = "red";
        } 
        else if (report.incidentType === "online") {
            markerColor = "blue";
        } 
        else {
            markerColor = "gray";
        }

        const marker = L.circleMarker(
            [report.latitude, report.longitude],
            {
                radius: 8,
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.7
            }
        ).addTo(map);

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
})

L.heatLayer(heatPoints, {
    radius: 25,
    blur: 15,
    maxZoom: 17
}).addTo(map);