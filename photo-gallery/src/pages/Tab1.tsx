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

    // Helper: resolve common ACF image shapes into an absolute URL synchronously.
    const resolveImageUrl = (imgField: any, origin: string): string | undefined => {
      if (!imgField) return undefined;
      if (typeof imgField === 'string') return imgField.startsWith('http') ? imgField : `${origin}${imgField}`;
      if (typeof imgField === 'object') {
        const url = imgField.source_url || imgField.url || imgField.sizes?.medium || imgField.sizes?.thumbnail || imgField.guid?.rendered;
        return url ? (url.startsWith('/') ? `${origin}${url}` : url) : undefined;
      }
      // numeric media IDs are not resolved here to keep the logic simple
      return undefined;
    };

    const fetchPlanets = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Planet[];
        const origin = new URL(API_URL).origin;

        // Map synchronously using the small helper above. This keeps the logic
        // straightforward and avoids per-item async work.
        const processed = data.map((planet) => {
          const acf = planet.acf || {};
          const imageUrl = resolveImageUrl(acf.image, origin);
          return { ...planet, imageUrl } as Planet;
        });

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
