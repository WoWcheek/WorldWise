import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
   MapContainer,
   TileLayer,
   Marker,
   Popup,
   useMap,
   useMapEvent
} from "react-leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useCities, flagemojiToPNG } from "../contexts/CitiesContext";
import Button from "./Button";
import styles from "./Map.module.css";

function Map() {
   const { cities } = useCities();
   const [mapPosition, setMapPosition] = useState([50, 30]);
   const [mapLat, mapLng] = useUrlPosition();
   const {
      isLoading: isLoadingPosition,
      position: geolocationPosition,
      getPosition
   } = useGeolocation();

   useEffect(
      function () {
         if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
      },
      [mapLat, mapLng]
   );

   useEffect(
      function () {
         if (geolocationPosition)
            setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
      },
      [geolocationPosition]
   );

   return (
      <div className={styles.mapContainer}>
         {!geolocationPosition && (
            <Button type="position" onClick={getPosition}>
               {isLoadingPosition ? "Loading..." : "Use your position"}
            </Button>
         )}
         <MapContainer
            center={mapPosition}
            zoom={6}
            scrollWheelZoom={true}
            className={styles.map}
         >
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            {cities.map((city) => (
               <Marker
                  position={[city.position.lat, city.position.lng]}
                  key={city.id}
               >
                  <Popup>
                     <span>{flagemojiToPNG(city.emoji)}</span>
                     <span>{city.cityName}</span>
                  </Popup>
               </Marker>
            ))}
            <ChangeCenter position={mapPosition} />
            <DetectClick />
         </MapContainer>
      </div>
   );
}

function ChangeCenter({ position }) {
   const map = useMap();
   map.setView(position);
   return null;
}

function DetectClick() {
   const navigate = useNavigate();

   useMapEvent({
      click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
   });

   return null;
}

export default Map;
