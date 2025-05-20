'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { Station } from '@/app/types/stations';
import useNetwork from '@/data/network';

// Extended DeviceOrientationEvent interface to include webkit properties
interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

// Extended DeviceOrientationEvent constructor with requestPermission method
interface DeviceOrientationEventiOS extends EventTarget {
  requestPermission?: () => Promise<string>;
}

const StationDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.stationId as string;
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const { network, isLoading, isError } = useNetwork();
  const locationWatchId = useRef<number | null>(null);
  
  // Added for compass functionality
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const compassInitialized = useRef<boolean>(false);

  // Always call hooks first
  // Define station even if network is not yet available (it will be undefined).
  const station: Station | undefined = network ? network.stations.find((station: Station) => station.id === id) : undefined;

  useEffect(() => {
    if (!station?.latitude || !station?.longitude) return;

    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
    }

    locationWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: userLat, longitude: userLon } = position.coords;
        const distance = getDistanceFromLatLonInKm(userLat, userLon, station.latitude, station.longitude);
        const bearingDeg = calculateBearing(userLat, userLon, station.latitude, station.longitude);
        setDistanceKm(distance);
        setBearing(bearingDeg);
      },
      (error) => {
        console.error("Geolocation error:", error.message || error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
        locationWatchId.current = null;
      }
    };
  }, [station]);

  // State to track permission status
  const [compassPermission, setCompassPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // Function to request compass permissions
  const requestCompassPermission = async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setCompassPermission('denied');
      return;
    }

    try {
      // Use proper typing for the iOS-specific DeviceOrientationEvent
      const DeviceOrientationEvent = window.DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
      
      // iOS 13+ requires explicit permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        setCompassPermission(permission as 'granted' | 'denied');
        
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);
          compassInitialized.current = true;
        }
      } else {
        // For Android and other devices, we'll just try to use the API
        // Note: Android permissions are typically requested via the manifest
        setCompassPermission('granted');
        window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);
        compassInitialized.current = true;
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
      setCompassPermission('denied');
    }
  };

  // Handler for device orientation events
  const handleDeviceOrientation = (event: ExtendedDeviceOrientationEvent) => {
    // Different browsers provide compass data in different ways
    let heading: number | null = null;
    
    if (event.webkitCompassHeading !== undefined) {
      // iOS provides webkitCompassHeading (inverted)
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null && event.alpha !== undefined) {
      // Android provides rotation in 'alpha' from 0 to 360
      heading = 360 - event.alpha;
    }
    
    if (heading !== null) {
      heading = -heading;
      setCompassHeading(heading);
    }
  };

  // Set up and clean up the compass event listener
  useEffect(() => {
    // Only add event listeners if permission is granted
    if (compassPermission === 'granted' && !compassInitialized.current) {
      window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);
      compassInitialized.current = true;
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation as EventListener);
      }
    };
  }, [compassPermission]);
  

  if (isLoading || !network) {
    return (
      <div id="loading" className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading network data...</div>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div id="error" className={styles.errorContainer}>
        <div className={styles.errorText}>{isError}</div>
      </div>
    );
  }
  if (!station) return null; // If station is not found, return nothing.

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

  // Function to format distance based on how far away the user is
  function formatDistance(distance: number): string {
    if (distance < 0.1) {
      // Less than 100 meters, show in meters
      return `${Math.round(distance * 1000)} m`;
    } else if (distance < 1) {
      // Less than 1 km, show with more precision
      return `${distance.toFixed(2)} km`;
    } else {
      // More than 1 km, show with less precision
      return `${distance.toFixed(1)} km`;
    }
  }
  
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

          <div className={styles.directionCard}>
            <h3>Navigate to Station</h3>
            <div className={styles.compassWrapper}>
              {compassPermission === 'prompt' ? (
                <button 
                  className={styles.permissionButton}
                  onClick={requestCompassPermission}
                >
                  Enable Compass
                </button>
              ) : compassPermission === 'denied' ? (
                <p>Compass access denied. Please enable location and orientation permissions in your device settings.</p>
              ) : distanceKm !== null && bearing !== null ? (
                <>
                  <div className={styles.compassContainer}>
                    <div className={styles.compass}>
                      <div 
                        className={styles.arrow} 
                        style={{ 
                          transform: `rotate(${compassHeading !== null ? (compassHeading + bearing) % 360 : bearing}deg)` 
                        }}
                      >
                        ↑
                      </div>
                    </div>
                  </div>
                  <div className={styles.distanceInfo}>
                    <p><strong>{formatDistance(distanceKm)}</strong></p>
                  </div>
                </>
              ) : (
                <p>Getting your location...</p>
              )}
            </div>
          </div>

      </div>

      {/* Bike image placed outside the white frame */}
      <div className={styles.bikeImageContainer}>
        <img src="/images/bike.png" alt="Bike" className={styles.bikeImage} />
      </div>
    </div>
  );
};

export default StationDetailPage;