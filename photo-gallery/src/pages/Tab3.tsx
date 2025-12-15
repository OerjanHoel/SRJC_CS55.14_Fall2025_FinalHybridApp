// React and hooks: `useEffect` for lifecycle side-effects, `useState` for local state
import React, { useEffect, useState } from 'react';
// Ionic components used to build the page layout and list
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/react';
// Tab3-specific styles
import './Tab3.css';

// WordPress REST endpoint returning `agency` posts with ACF fields
const API_URL = 'https://dev-cs5513-database.pantheonsite.io/wp-json/wp/v2/agency?acf_format=standard';

// Minimal TypeScript type describing the agency item we consume
interface Agency {
  id: number;
  acf?: any;
  // computed absolute image URL (resolved from various ACF shapes)
  imageUrl?: string;
}

// Main Tab3 component: loads agencies and renders them
const Tab3: React.FC = () => {
  // Component state: list, loading flag, and error message
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Side-effect: fetch agency data once on mount
  useEffect(() => {
    let mounted = true;
    const fetchAgencies = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const origin = new URL(API_URL).origin;

        // Process each item to normalize/resolve the ACF image into an absolute URL
        const processed = data.map((agency: any) => {
            const acf = agency.acf || {};
          const imgField = acf.image;
          let imageUrl: string | undefined;
          if (typeof imgField === 'number') {
            imageUrl = `${origin}/wp-content/uploads/`; // fallback — will be refined if needed
          } else if (typeof imgField === 'string') {
            imageUrl = imgField.startsWith('http') ? imgField : `${origin}${imgField}`;
          } else if (imgField && typeof imgField === 'object') {
            imageUrl = imgField.source_url || imgField.url || imgField.sizes?.medium || imgField.guid?.rendered;
            if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${origin}${imageUrl}`;
          }
          return { id: agency.id, acf, imageUrl } as Agency;
        });

        // Update state only if component still mounted
        if (mounted) setAgencies(processed);
      } catch (error: any) {
        setError(error.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAgencies();
    return () => { mounted = false; };
  }, []);

  // After fetching completes (or fails), the component renders the page UI:
  // - header/toolbars
  // - loading or error messages while data is being fetched
  // - the resolved list of agencies once data is available
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Space Agencies</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Agencies</IonTitle>
          </IonToolbar>
        </IonHeader>

        {loading && <div style={{ padding: 16 }}>Loading…</div>}
        {error && <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>}

        {!loading && !error && (
          <IonList>
            {/* Render each agency as a list item */}
            {agencies.map((agency) => {
              const acf = agency.acf || {};
              const name = acf.name || acf.title || 'Untitled';
              const description = acf.description || '';
              const website = acf.website || '';
              const src = agency.imageUrl;

              return (
                <IonItem key={agency.id} lines="full">
                  <div className="agency-item">
                    {src ? (
                      <img className="agency-image" src={src} alt={name} />
                    ) : (
                      <div className="agency-image placeholder" />
                    )}
                    <div className="agency-text">
                      <h2 className="agency-title">{name}</h2>
                      <p className="agency-description">{description}</p>
                      {website ? (
                        <h4 className="agency-website"><a href={website} target="_blank" rel="noreferrer">{website}</a></h4>
                      ) : null}
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

export default Tab3;
