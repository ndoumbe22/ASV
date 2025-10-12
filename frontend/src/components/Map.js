import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fixer l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Composant pour centrer la carte sur la position de l'utilisateur
function LocationButton() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });
  };

  return (
    <button
      onClick={handleLocate}
      className="btn btn-primary position-absolute"
      style={{ top: "10px", right: "10px", zIndex: 1000 }}
      title="Me localiser"
    >
      <i className="bi bi-geo-alt-fill"></i>
    </button>
  );
}

function HealthFacilitiesMap() {
  const [userPosition, setUserPosition] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchRadius, setSearchRadius] = useState(5000); // 5km par défaut
  const mapRef = useRef();

  // Position par défaut (Dakar, Sénégal)
  const defaultPosition = [14.6928, -17.4467];

  useEffect(() => {
    // Obtenir la position de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Erreur géolocalisation:", error);
        }
      );
    }

    // Charger les centres de santé depuis l'API
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      // Charger depuis votre API Django
      const response = await fetch(
        "http://localhost:8000/api/health-facilities/"
      );
      const data = await response.json();
      setFacilities(data);
    } catch (error) {
      console.error("Erreur chargement centres:", error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Formule de Haversine pour calculer la distance en mètres
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  };

  const filteredFacilities = facilities.filter((facility) => {
    // Filtrer par type
    if (selectedType !== "all" && facility.type !== selectedType) {
      return false;
    }

    // Filtrer par distance si position utilisateur disponible
    if (userPosition) {
      const distance = calculateDistance(
        userPosition[0],
        userPosition[1],
        facility.latitude,
        facility.longitude
      );
      return distance <= searchRadius;
    }

    return true;
  });

  const getMarkerIcon = (type) => {
    const colors = {
      hopital: "red",
      clinique: "blue",
      pharmacie: "green",
      dentiste: "orange",
    };

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
        colors[type] || "grey"
      }.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  return (
    <div className="health-facilities-map-container">
      {/* Filtres */}
      <div className="map-controls p-3 bg-white shadow-sm mb-3 rounded">
        <div className="row align-items-center">
          <div className="col-md-4">
            <label className="form-label">Type de centre</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Tous les centres</option>
              <option value="hopital">Hôpitaux</option>
              <option value="clinique">Cliniques</option>
              <option value="pharmacie">Pharmacies</option>
              <option value="dentiste">Dentistes</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Rayon de recherche</label>
            <select
              className="form-select"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
            >
              <option value="1000">1 km</option>
              <option value="2000">2 km</option>
              <option value="5000">5 km</option>
              <option value="10000">10 km</option>
              <option value="20000">20 km</option>
              <option value="999999">Tous</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Résultats</label>
            <div className="alert alert-info mb-0 p-2">
              <strong>{filteredFacilities.length}</strong> centre(s) trouvé(s)
            </div>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div
        className="map-wrapper"
        style={{ height: "600px", position: "relative" }}
      >
        <MapContainer
          center={userPosition || defaultPosition}
          zoom={13}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
          ref={mapRef}
        >
          {/* Utilisation d'OpenStreetMap (GRATUIT) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationButton />

          {/* Marqueur position utilisateur */}
          {userPosition && (
            <Marker
              position={userPosition}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
                  shadowUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <strong>Votre position</strong>
              </Popup>
            </Marker>
          )}

          {/* Marqueurs des centres de santé */}
          {filteredFacilities.map((facility) => (
            <Marker
              key={facility.id}
              position={[facility.latitude, facility.longitude]}
              icon={getMarkerIcon(facility.type)}
            >
              <Popup>
                <div className="facility-popup">
                  <h6>
                    <strong>{facility.nom}</strong>
                  </h6>
                  <p className="mb-1">
                    <span className="badge bg-secondary">{facility.type}</span>
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-geo-alt"></i> {facility.adresse}
                  </p>
                  {facility.telephone && (
                    <p className="mb-1">
                      <i className="bi bi-telephone"></i> {facility.telephone}
                    </p>
                  )}
                  {facility.horaires && (
                    <p className="mb-1">
                      <i className="bi bi-clock"></i> {facility.horaires}
                    </p>
                  )}
                  {userPosition && (
                    <p className="mb-0">
                      <i className="bi bi-signpost"></i>{" "}
                      <strong>
                        {(
                          calculateDistance(
                            userPosition[0],
                            userPosition[1],
                            facility.latitude,
                            facility.longitude
                          ) / 1000
                        ).toFixed(2)}{" "}
                        km
                      </strong>
                    </p>
                  )}
                  <a
                    href={`https://www.openstreetmap.org/directions?from=${
                      userPosition
                        ? userPosition[0] + "," + userPosition[1]
                        : ""
                    }&to=${facility.latitude},${facility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary mt-2 w-100"
                  >
                    <i className="bi bi-map"></i> Itinéraire
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Légende */}
      <div className="map-legend p-3 bg-white shadow-sm mt-3 rounded">
        <h6 className="mb-3">Légende</h6>
        <div className="row">
          <div className="col-6 col-md-3 mb-2">
            <span style={{ color: "red" }}>●</span> Hôpitaux
          </div>
          <div className="col-6 col-md-3 mb-2">
            <span style={{ color: "blue" }}>●</span> Cliniques
          </div>
          <div className="col-6 col-md-3 mb-2">
            <span style={{ color: "green" }}>●</span> Pharmacies
          </div>
          <div className="col-6 col-md-3 mb-2">
            <span style={{ color: "orange" }}>●</span> Dentistes
          </div>
          <div className="col-12 col-md-3 mb-2">
            <span style={{ color: "violet" }}>●</span> Votre position
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthFacilitiesMap;
