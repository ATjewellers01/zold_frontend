"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for Leaflet marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl =
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl =
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Partner {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    area: string;
    city: string;
    distance?: number;
    rating: number;
    reviews: number;
    services: string[];
    offers: string[];
    timings: string;
    phone: string;
}

interface PartnersMapProps {
    partners: Partner[];
    onSelectPartner: (partner: Partner) => void;
}

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

const MapClickHandler = ({
    onMapClick,
}: {
    onMapClick: (lat: number, lng: number) => void;
}) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

export default function PartnersMap({
    partners,
    onSelectPartner,
}: PartnersMapProps) {
    // Default center (Connaught Place, Delhi)
    const defaultCenter: [number, number] = [28.6304, 77.2177];

    // Calculate center based on filtered partners
    const mapCenter =
        partners.length > 0
            ? ([partners[0].latitude, partners[0].longitude] as [number, number])
            : defaultCenter;

    const handleMapClick = (lat: number, lng: number) => {
        // Create a temporary partner object for the selected location
        const customPartner: Partner = {
            id: Date.now().toString(), // Temporary ID
            name: "Selected Location",
            latitude: lat,
            longitude: lng,
            area: "Custom Area",
            city: "Custom City",
            distance: 0,
            rating: 0,
            reviews: 0,
            services: [],
            offers: [],
            timings: "",
            phone: "",
        };
        onSelectPartner(customPartner);
    };

    return (
        <div className="h-96 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 z-0 relative">
            <MapContainer
                center={mapCenter}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full"
                // Force re-render when switching views or themes
                key="partners-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapCenter} />
                <MapClickHandler onMapClick={handleMapClick} />
                {partners.map((partner) => (
                    <Marker
                        key={partner.id}
                        position={[partner.latitude, partner.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => onSelectPartner(partner),
                        }}
                    >
                        <Popup>
                            <div className="min-w-[150px]">
                                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {partner.area}, {partner.city}
                                </p>
                                <div className="mt-1 flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-sm font-medium">{partner.rating}</span>
                                </div>
                                <button
                                    onClick={() => onSelectPartner(partner)}
                                    className="mt-2 w-full rounded bg-[#3D3066] px-2 py-1 text-xs text-white"
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
