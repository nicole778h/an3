import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const containerStyle = {
    width: '100%',
    height: '400px',
};

interface MapComponentProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLocation?: LatLngExpression;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect, initialLocation = [37.7749, -122.4194] }) => {
    const [position, setPosition] = useState<LatLngExpression>(initialLocation);

    useEffect(() => {
        // Actualizează poziția pinului atunci când locația inițială se schimbă
        setPosition(initialLocation);
    }, [initialLocation]);

    const MapEvents = () => {
        useMapEvents({
            click(event) {
                const lat = event.latlng.lat;
                const lng = event.latlng.lng;
                setPosition([lat, lng]); // Actualizează poziția pinului
                onLocationSelect(lat, lng); // Transmite locația selectată
            },
        });
        return null;
    };

    return (
        <MapContainer center={position} zoom={12} style={containerStyle}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            <Marker position={position}>
                <Popup>
                    Selected location: {position[0]}, {position[1]}
                </Popup>
            </Marker>
            <MapEvents />
        </MapContainer>
    );
};

export default MapComponent;
