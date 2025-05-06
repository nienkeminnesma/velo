'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { Station } from '@/app/types/stations';


const StationDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.stationId as string;
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchStationDetail = async () => {
        try {
          const response = await fetch('https://api.citybik.es/v2/networks/velo-antwerpen');
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          const foundStation = data.network.stations.find((s: any) => s.id === id);
          if (foundStation) {
            setStation(foundStation);
          } else {
            setError('Station not found');
          }
        } catch (err) {
          setError('Failed to fetch station data');
        } finally {
          setLoading(false);
        }
      };
      fetchStationDetail();
    }
  }, [id]);

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading station details...</div>
        <div className={styles.loadingSpinner}></div>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>{error}</div>
      </div>
    );

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
      </div>

      {/* Bike image placed outside the white frame */}
      <div className={styles.bikeImageContainer}>
        <img src="/images/bike.png" alt="Bike" className={styles.bikeImage} />
      </div>
    </div>
  );
};

export default StationDetailPage;