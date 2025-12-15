// React hooks: `useEffect` for lifecycle and `useState` for local component state
import React, { useEffect, useState } from 'react';
// Ionic UI components used to build the page layout and list items
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel } from '@ionic/react';
// Page-specific styles for Tab1
import './Tab1.css';

// WordPress REST API endpoint returning planet posts with ACF fields
const API_URL = 'https://dev-cs5513-database.pantheonsite.io/wp-json/wp/v2/planet?acf_format=standard';

// Minimal type for planet items returned by the API
interface Planet {
  id: number;
  acf?: any;
  // computed absolute image URL (resolved from ACF structure)
  imageUrl?: string;
}

// Main component: fetches planet data from WP and renders the list
const Tab1: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect: load planets once when the component mounts
  useEffect(() => {
    let mounted = true;
    const fetchPlanets = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Planet[];
        const origin = new URL(API_URL).origin;

        // Process fetched items in parallel and resolve each item's image URL
        const processed = await Promise.all(
          data.map(async (planet) => {
            const acf = planet.acf || {};
            const imgField = acf.image;
            let imageUrl: string | undefined;

            // If the ACF image field is a numeric media ID, fetch the media endpoint
            // to obtain the absolute `source_url` for display.
            if (typeof imgField === 'number') {
              // media ID -> fetch media endpoint
              try {
                const mediaRes = await fetch(`${origin}/wp-json/wp/v2/media/${imgField}`);
                if (mediaRes.ok) {
                  const mediaJson = await mediaRes.json();
                  imageUrl = mediaJson.source_url || mediaJson.guid?.rendered;
                }
              } catch (error) {
                // ignore
              }
            } else if (typeof imgField === 'string') {
              imageUrl = imgField.startsWith('http') ? imgField : `${origin}${imgField}`;
            } else if (imgField && typeof imgField === 'object') {
              imageUrl = imgField.source_url || imgField.url || imgField.sizes?.medium || imgField.sizes?.thumbnail || imgField.guid?.rendered;
              if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${origin}${imageUrl}`;
            }

            return { ...planet, imageUrl } as Planet;
          })
        );

        // Only update state if component is still mounted (prevents state updates
        // after unmount which can cause memory leaks / React warnings)
        if (mounted) setPlanets(processed);
      } catch (error: any) {
        setError(error.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPlanets();
    return () => { mounted = false; };
  }, []);

  // Render the page: header, intro text, and the resolved planets list
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Planets from your backyard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Planets</IonTitle>
          </IonToolbar>
        </IonHeader>


      <IonItem>
        <IonLabel className="planet-text">
          <h2 className="planet-title">What can we see from our backyards?</h2>
          <p className="planet-description">
            Astronomy and planetary observation are fascinating. Watching planets move across the sky
            can be amazing. While clear views often require telescopes, which may be expensive,
            several planets are visible to the naked eye. Read the entries below to learn more about
            these planets and when they were first recorded.
          </p>
        </IonLabel>
      </IonItem>

        {loading && <div className="tab-status">Loading…</div>}
        {error && <div className="tab-status tab-error">Error: {error}</div>}

        {!loading && !error && (
          <IonList>
            {planets.map((planet) => {
              const acf = planet.acf || {};
              const name = acf.name || acf.title || 'Untitled';
              const description = acf.description || '';
              const firstDiscovered = acf.first_discovered || '';
              const src = planet.imageUrl;

              return (
                <IonItem key={planet.id} lines="full">
                  <div className="planet-item">
                    {src ? (
                      <img className="planet-image" src={src} alt={name} />
                    ) : (
                      <div className="planet-image placeholder" />
                    )}
                    <div className="planet-text">
                      <h2 className="planet-title">{name}</h2>
                      <p className="planet-description">{description}</p>
                      <p className="planet-first">First discovered: {firstDiscovered}</p>
                    </div>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
