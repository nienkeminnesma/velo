'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // You'll need to create this CSS module

export default function HomeScreen() {
  const router = useRouter();

  const navigateToHomePage = () => {
    router.push('/home'); // Assuming your current page will be moved to /homepage
  };

  return (
    <div className={styles.homeScreenContainer}>
      <h1 className={styles.homeTitle}>Velo Antwerp</h1>
      
      <div className={styles.imageContainer}>
        <img src="/images/bike.png" alt="Bike" className={styles.bikeImage} />
      </div>
      
      <button 
        className={styles.startButton}
        onClick={navigateToHomePage}
      >
        Get started
      </button>
    </div>
  );
}