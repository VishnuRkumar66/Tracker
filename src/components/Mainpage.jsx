import React, { useState, useEffect } from "react";
import backImage from "../assets/bg.png";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Popup, useMap, Marker } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon issue in Vite production build
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);

  return null;
};

const Mainpage = () => {
  const [addIp, setAddIp] = useState("");
  const [ipData, setIpData] = useState({
    add: "",
    city: "",
    region: "",
    country: "",
    timezone: "",
    isp: "",
    latitude: 0,
    longitude: 0,
  });

  const fetchIPData = async (ip = "") => {
    try {
      let currentIp = ip;

      if (!ip) {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipJson = await ipRes.json();
        currentIp = ipJson.ip;
      }

      const locRes = await fetch(`https://ipwho.is/${currentIp}`);
      const data = await locRes.json();

      if (!data.success) {
        alert("Enter a valid IP address!");
        return;
      }

      setIpData({
        add: currentIp,
        city: data.city,
        country: data.country,
        timezone: data.timezone?.utc || "",
        isp: data.connection?.isp || "",
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (err) {
      alert("Something went wrong. Please try again later.");
    }
  };

  useEffect(() => {
    fetchIPData();
  }, []);

  const handleNewIpSearch = () => {
    if (addIp.trim() !== "") {
      fetchIPData(addIp.trim());
    }
  };

  const metadata = [
    { Name: "IP ADDRESS", content: ipData.add || "Loading..." },
    { Name: "LOCATION", content: `${ipData.city}, ${ipData.country}` },
    { Name: "TIME ZONE", content: ipData.timezone || "Loading..." },
    { Name: "ISP", content: ipData.isp || "Loading..." },
  ];

  return (
    <div className="text-white flex flex-col items-center">
      <div
        className="h-[40vh] w-full bg-cover bg-center flex flex-col items-center"
        style={{ backgroundImage: `url(${backImage})` }}
      >
        <p className="text-2xl font-semibold font-sans p-2 mt-3">
          IP ADDRESS TRACKER
        </p>
        <div className="flex mt-3 items-center">
          <input
            type="text"
            placeholder="Search for any IP here..."
            onChange={(e) => setAddIp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNewIpSearch();
              }
            }}
            className="text-black font-sans bg-white border-2 border-yellow-400 h-9 w-80 rounded-[8px] font-bold text-[16px] p-3"
          />
          <button
            onClick={handleNewIpSearch}
            className="h-9 w-9 rounded bg-black text-2xl"
          >
            →
          </button>
        </div>
      </div>

      <div className="absolute top-[40vh] w-full h-[500px] -z-10">
        {ipData.latitude !== 0 && ipData.longitude !== 0 && (
          <MapContainer
            center={[ipData.latitude, ipData.longitude]}
            zoom={16}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[ipData.latitude, ipData.longitude]}>
              <Popup>{`${ipData.city}, ${ipData.country}`}</Popup>
            </Marker>
            <RecenterMap lat={ipData.latitude} lng={ipData.longitude} />
          </MapContainer>
        )}
      </div>

      <div className="bg-white text-black min-w-[50vw] rounded-xl mt-28 absolute grid z-10 sm:grid-cols-2  md:grid-cols-4 text-center shadow-2xl">
        {metadata.map((info, index) => (
          <div key={index} className="m-2 md:border-r last:border-none">
            <p className="text-gray-500 text-[12px] font-bold">{info.Name}</p>
            <p className="text-[13px] font-extrabold">{info.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mainpage;
