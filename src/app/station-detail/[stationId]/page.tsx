'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { Station } from '@/app/types/stations';
import useNetwork from '@/data/network';



const StationDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.stationId as string;
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
const { network, isLoading, isError } = useNetwork();


  const station: Station | undefined = network.stations.find((station) => station.id === id);

  useEffect(() => {
    if (station?.latitude && station?.longitude) {
      const updateLocationData = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude: userLat, longitude: userLon } = position.coords;
            const distance = getDistanceFromLatLonInKm(userLat, userLon, station.latitude, station.longitude);
            const bearingDeg = calculateBearing(userLat, userLon, station.latitude, station.longitude);
            setDistanceKm(distance);
            setBearing(bearingDeg);
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true }
        );
      };
  
      updateLocationData();
      const intervalId = setInterval(updateLocationData, 5000); // update every 5s
      return () => clearInterval(intervalId);
    }
  }, [station]);

if (isLoading) 
    return (
      <div id="loading" className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading Velo stations...</div>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  if (isError) 
    return (
      <div id="error" className={styles.errorContainer}>
        <div className={styles.errorText}>{isError}</div>
      </div>
    );
  


  
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = deg2rad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(deg2rad(lat2));
    const x =
      Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
      Math.sin(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return (rad2deg(bearing) + 360) % 360;
  }
  
  function rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }
  
  if (!station) return null;

  return (
    <div className={styles.appContainer}>
      <Link href="/home" className={styles.backButton}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to stations
      </Link>

      <div className={styles.stationDetailCard} id="station-detail">
        <h1 id="station-name" className={styles.stationDetailName}>{station.name}</h1>

        <div id="station-address" className={styles.stationDetailAddress}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p id="address-text">{station.extra?.address || 'Address unavailable'}</p>
        </div>

        <div className={styles.stationMeta}>
          <div className={styles.lastUpdated}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span id="timestamp">Last updated: {new Date(station.timestamp).toLocaleString()}</span>
          </div>
          {station.extra?.status && (
            <div id="status-badge" className={`${styles.statusBadge} ${station.extra.status === 'OPEN' ? styles.statusOpen : styles.statusClosed}`}>
              {station.extra.status}
            </div>
          )}
        </div>

        <div className={styles.availabilityGrid}>
          <div className={styles.bikesCard}>
            <div className={styles.availabilityHeader}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M12 19v-4l-3-3 4-3 2 3h2" />
              </svg>
              <h2>Available Bikes</h2>
            </div>
            <p id="bikes-count" className={styles.availabilityCount}>{station.free_bikes}</p>
          </div>

          <div className={styles.spacesCard}>
            <div className={styles.availabilityHeader}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h2>Empty Slots</h2>
            </div>
            <p id="spaces-count" className={styles.availabilityCount}>{station.empty_slots}</p>
          </div>
        </div>

        <div className={styles.capacityCard}>
          <h3>Station Capacity</h3>
          <div className={styles.progressBarContainer}>
            <div id="capacity-bar" className={styles.progressBar} style={{
              width: `${(station.free_bikes / (station.free_bikes + station.empty_slots)) * 100}%`
            }}></div>
          </div>
          
          <div className={styles.capacityLabels}>
            <span id="capacity-bikes">{station.free_bikes} bikes</span>
            <span id="capacity-spaces">{station.empty_slots} spaces</span>
          </div>
        </div>
        {distanceKm !== null && bearing !== null && (
  <div className={styles.directionCard}>
    <h3>Distance & Direction</h3>
    <div className={styles.compassWrapper}>
      <div
        className={styles.arrow}
        style={{ transform: `rotate(${bearing}deg)` }}
      >
        ↑
      </div>
      <p>{distanceKm.toFixed(2)} km away</p>
    </div>
  </div>
)}

      </div>

      {/* Bike image placed outside the white frame */}
      <div className={styles.bikeImageContainer}>
        <img src="/images/bike.png" alt="Bike" className={styles.bikeImage} />
      </div>
    </div>
  );
};

export default StationDetailPage;