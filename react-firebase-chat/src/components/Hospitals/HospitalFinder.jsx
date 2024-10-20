// src/HospitalFinder.js
import { useState, useEffect } from 'react';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import './hospital.css';

const containerStyle = {
    width: '100%',
    height: '400px',
};

const HospitalFinder = ({ onSelectHospital }) => {
    const [location, setLocation] = useState('');
    const [autocomplete, setAutocomplete] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);

    const [enableMapDiv, setEnableMapDiv] = useState(false);

    const googleMapsApiKey = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: googleMapsApiKey,
        libraries: ['places'],
    });

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handlePlaceSelect = () => {
        if (!autocomplete) {
            console.error("Autocomplete instance is not available.");
            return;
        }

        const place = autocomplete.getPlace();
        if (!place || !place.geometry) {
            console.error("Place is null or does not have geometry.");
            return;
        }

        setUserLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        });

        console.log("this is user location" + userLocation);
        setLocation(place.formatted_address);

        findHospitals();
    };

    const findHospitals = async () => {
        if (userLocation) {
            setLoading(true);
            const { lat, lng } = userLocation;

            try {
                const response = await axios.get(`http://localhost:5001/api/hospitals`, {
                    params: { lat, lng },
                });
                setHospitals(response.data.results || []);
            } catch (error) {
                console.error('Error fetching hospitals:', error);
                alert('Failed to fetch hospitals. Please try again.');
            } finally {
                setLoading(false);
                setEnableMapDiv(true);
            }
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
            }, (error) => {
                console.error('Error getting location:', error);
                alert('Could not retrieve location. Please enable location services.');
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }

        setEnableMapDiv(true);
    };

    useEffect(() => {
        if (userLocation) {
            findHospitals();
            setEnableMapDiv(true);
        }
    }, [userLocation]);

    useEffect(() => {
        if (map && hospitals.length) {
            const bounds = new window.google.maps.LatLngBounds();
            hospitals.forEach(hospital => {
                bounds.extend({
                    lat: hospital.geometry.location.lat,
                    lng: hospital.geometry.location.lng,
                });
            });
            map.fitBounds(bounds);
            
        }
    }, [hospitals, map]);

    if (!isLoaded) {
        return <div>Loading Map...</div>;
    }

    const handleLogin = (name) => {
        onSelectHospital(name);
    };

    return (
        <div className="container flex flex-col h-screen p-20 items-center justify-center overflow-scroll">
            {!enableMapDiv && <><h1 className="text-5xl flex items-center justify-center font-bold text-white text-center mb-40">Hospital Connect</h1>
            <h2 className="text-xl text-white text-center mb-4">
                Connect with nearby healthcare professionals for instant consultations—chat or talk to the doctors who care!
            </h2>
            <p className="text-xl text-white text-center mb-8">Enter Your Location To Find The Nearest Hospitals</p>
            <div className="flex flex-col items-center">
                <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={handlePlaceSelect}
                >
                    <input
                        className="flex-1 w-full max-w-lg text-black p-4 mt-10 mb-10 mr-10 border border-blue-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                        type="text"
                        placeholder="Enter your location..."
                        value={location}
                        onChange={handleLocationChange}
                    />       
                </Autocomplete>
                <div className="flex space-x-8">
                    <button 
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg transition duration-200 ease-in-out hover:bg-blue-600 transform hover:scale-105"
                        onClick={getCurrentLocation}
                    >
                        Use Current Location
                    </button>
                    <button 
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg transition duration-200 ease-in-out hover:bg-blue-600 transform hover:scale-105"
                        onClick={findHospitals}
                    >
                        Find Hospitals
                    </button>
                </div>
            </div>
            </>}
            {loading && <div className="loading text-center text-lg text-blue-500">Loading hospitals...</div>}

            {/*Hide the below div until you recieve response */}
            {enableMapDiv && <div className="flex flex-row space-y-12 md:space-y-0 md:space-x-4 w-full">
                {/* Google Map */}
                <div className="flex-1 p-8 items-center px-20 mt-15 justify-between">
                    {userLocation && (
                        <div style={{ marginTop: '150px'}}>
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={userLocation}
                                zoom={12}
                                onLoad={mapInstance => setMap(mapInstance)}
                            >
                                {hospitals.map((hospital) => (
                                    <Marker
                                        key={hospital.place_id}
                                        position={{
                                            lat: hospital.geometry.location.lat,
                                            lng: hospital.geometry.location.lng,
                                        }}
                                        title={hospital.name}
                                    />
                                ))}
                            </GoogleMap>
                        </div>
                    )}
                </div>

                {/* List of hospitals */}
                <div className="container flex-1 flex flex-col p-8 items-center overflow-scroll">
                    <h2 className='text-2xl text-center py-8 mt-10'>Choose a hospital near you</h2>
                    <div className='overflow-scroll'>
                        <ul className="mb-6 flex flex-col">
                        {hospitals.map((hospital) => (
                            <li 
                                key={hospital.place_id} 
                                className="bg-gray-100 p-3 rounded-lg mb-2 text-black transition duration-200 ease-in-out transform hover:scale-105 hover:bg-blue-50"
                                onClick={() => handleLogin(hospital.name)}
                            >
                                {hospital.name}
                            </li>
                        ))}
                    </ul>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default HospitalFinder;
