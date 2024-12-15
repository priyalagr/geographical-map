let map, marker;

const markers = [
    { lat: 40.7128, lon: -74.0060, name: "New York City", country: "USA" },
    { lat: 51.5074, lon: -0.1278, name: "London", country: "UK" },
    { lat: 35.6762, lon: 139.6503, name: "Tokyo", country: "Japan" },
    { lat: 48.8566, lon: 2.3522, name: "Paris", country: "France" },
    { lat: -33.8688, lon: 151.2093, name: "Sydney", country: "Australia" },
    { lat: 55.7558, lon: 37.6173, name: "Moscow", country: "Russia" },
    { lat: 28.6139, lon: 77.2090, name: "New Delhi", country: "India" },
    { lat: 34.0522, lon: -118.2437, name: "Los Angeles", country: "USA" },
    { lat: -23.5505, lon: -46.6333, name: "São Paulo", country: "Brazil" },
    { lat: 31.2304, lon: 121.4737, name: "Shanghai", country: "China" },
    { lat: 37.7749, lon: -122.4194, name: "San Francisco", country: "USA" },
    { lat: 41.9028, lon: 12.4964, name: "Rome", country: "Italy" },
    { lat: -26.2041, lon: 28.0473, name: "Johannesburg", country: "South Africa" },
    { lat: 1.3521, lon: 103.8198, name: "Singapore", country: "Singapore" },
    { lat: 19.0760, lon: 72.8777, name: "Mumbai", country: "India" },
];

function initMap() {
    map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markers.forEach(markerData => {
        L.marker([markerData.lat, markerData.lon])
            .addTo(map)
            .bindPopup(markerData.name);
    });

    // Initialize the search provider
    const provider = new GeoSearch.OpenStreetMapProvider();

    // Add search functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', () => performSearch(provider));
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performSearch(provider);
        }
    });

    // Feel Lucky button functionality
    const feelLuckyBtn = document.getElementById('feel-lucky-btn');
    feelLuckyBtn.addEventListener('click', showRandomPlace);
}

async function performSearch(provider) {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value;
    try {
        const results = await provider.search({ query: query });
        if (results.length > 0) {
            const { x, y, label } = results[0];
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([y, x]).addTo(map);
            marker.bindPopup(label).openPopup();
            map.setView([y, x], 13);
            
            // Clear the search input
            searchInput.value = '';
            
            // Remove the location from the URL
            history.replaceState(null, '', window.location.pathname);
        } else {
            alert('Location not found. Please try a different search.');
        }
    } catch (error) {
        console.error('Search failed:', error);
        alert('Search failed. Please try again.');
    }
}

async function fetchWikipediaExtract(title) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&origin=*`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        return pages[pageId].extract;
    } catch (error) {
        console.error('Error fetching Wikipedia extract:', error);
        return 'Unable to fetch information at this time.';
    }
}

async function showRandomPlace() {
    const randomIndex = Math.floor(Math.random() * markers.length);
    const randomPlace = markers[randomIndex];
    
    if (marker) {
        map.removeLayer(marker);
    }
    
    marker = L.marker([randomPlace.lat, randomPlace.lon]).addTo(map);
    
    const extract = await fetchWikipediaExtract(randomPlace.name);
    const currentTime = new Date().toLocaleString();
    
    const popupContent = `
        <b>${randomPlace.name}, ${randomPlace.country}</b><br>
        <small>Information retrieved at: ${currentTime}</small><br><br>
        ${extract.split('.').slice(0, 3).join('.')}...
    `;
    
    marker.bindPopup(popupContent).openPopup();
    map.setView([randomPlace.lat, randomPlace.lon], 10);
}

document.addEventListener('DOMContentLoaded', initMap);

