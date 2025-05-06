import React from 'react';
import styles from '../stationdetails/[stationId]/page.module.css';
import { Station } from '../types/stations';

interface StationDetailProps {
  station: Station;
}

const StationDetail: React.FC<StationDetailProps> = ({ station }) => {
  return (
    <div className={styles.stationDetailCard}>
      <h1 className={styles.stationDetailName}>{station.name}</h1>
      <div className={styles.stationDetailAddress}>
        {station.extra?.address || 'Address unavailable'}
      </div>
      <div className={styles.lastUpdated}>
        Last updated: {new Date(station.timestamp).toLocaleString()}
      </div>
      <div className={styles.statusBadge}>
        {station.extra?.status || 'Status unavailable'}
      </div>
      <div className={styles.availabilityGrid}>
        <div className={styles.bikesCard}>
          <h2>Available Bikes</h2>
          <p>{station.free_bikes}</p>
        </div>
        <div className={styles.spacesCard}>
          <h2>Empty Slots</h2>
          <p>{station.empty_slots}</p>
        </div>
      </div>
    </div>
  );
};

export default StationDetail;