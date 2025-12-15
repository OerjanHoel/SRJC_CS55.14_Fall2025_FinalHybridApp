import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/react';
import './Tab3.css';

const API_URL = 'https://dev-cs5513-database.pantheonsite.io/wp-json/wp/v2/agency?acf_format=standard';

interface Agency {
  id: number;
  acf?: any;
  imageUrl?: string;
}

const Tab3: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAgencies = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const origin = new URL(API_URL).origin;

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agencies</IonTitle>
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
