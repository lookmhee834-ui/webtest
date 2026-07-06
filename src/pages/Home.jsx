import React from 'react';
import Hero from '../components/Hero';

export default function Home({ setCurrentTab }) {
  return (
    <Hero 
      onExploreTravel={() => setCurrentTab('travel')} 
      onExploreArt={() => setCurrentTab('art')} 
    />
  );
}
