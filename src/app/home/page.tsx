'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import StationCard from '../components/StationCard';
import { Station } from '@/app/types/stations';
import useNetwork from '@/data/network';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { network, isLoading, isError } = useNetwork();

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

  const stations: Station[] = network.stations;
  const filteredStations = stations.filter((station: Station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.appContainer}>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h1 className={styles.appTitle}>Velo Antwerp</h1>
          <p className={styles.appSubtitle}>Find available bikes near you</p>
        </div>
        <div className={styles.rotatingWheel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <button className={styles.searchButton} onClick={() => setShowSearch(!showSearch)}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {showSearch && (
        <div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Enter station name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

    {!isLoading && !isError && (
        <div id="stations-list">
          {filteredStations.length > 0 ? (
            filteredStations.map((station: Station) => <StationCard key={station.id} station={station} />)
          ) : (
            <div className={styles.noStationsText}>No stations found.</div>
          )}
        </div>
      )}
    </div>
  );
}