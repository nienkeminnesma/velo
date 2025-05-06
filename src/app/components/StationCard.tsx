import React from 'react';
import { Station } from '../types/stations';
import styles from './StationCard.module.css';
import Link from 'next/link';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  return (
    <Link key={station.id} href={`/station-detail/${station.id}`} className={styles.stationCard}>
              <div className={styles.stationHeader}>
                <div className={styles.stationInfo}>
                  <h2 className={styles.stationName}>{station.name}</h2>
                  <div className={styles.stationAddress}>
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className={styles.addressText}>
                      {station.extra?.address || 'Address unavailable'}
                    </span>
                  </div>
                </div>
                <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>

              <div className={styles.stationStats}>
                <div className={styles.bikesAvailable}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    <path d="M19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    <path d="M12 19v-4l-3-3 4-3 2 3h2" />
                  </svg>
                  <span className={styles.bikesCount}>{station.free_bikes} bikes</span>
                </div>
                <div className={styles.spacesAvailable}>
                  <span className={styles.spacesCount}>{station.empty_slots} spaces</span>
                </div>
              </div>

              {station.extra?.status && (
                <div className={styles.stationStatus}>
                  <div className={`${styles.statusBadge} ${station.extra.status === 'OPEN' ? styles.statusOpen : styles.statusClosed}`}>
                    {station.extra.status}
                  </div>
                </div>
              )}
            </Link>
  );
};

export default StationCard;