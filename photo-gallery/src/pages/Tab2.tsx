// Camera icon used for the floating action button
import { camera } from 'ionicons/icons';

// Ionic UI components used for layout, grid, images, and the FAB
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonFab, 
  IonFabButton, 
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
} from '@ionic/react';
// Custom hook that handles taking, saving and deleting photos
import { usePhotoGallery } from '../hooks/usePhotoGallery'; 
// import ExploreContainer from '../components/ExploreContainer';
// Styles specific to Tab2
import './Tab2.css';

// Tab component: renders the photo gallery and a FAB to add new photos
const Tab2: React.FC = () => {
  const { photos, addNewToGallery } = usePhotoGallery();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photo Gallery</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Photo Gallery</IonTitle>
          </IonToolbar>
        </IonHeader>
      {/* Grid compnent to display photos in a grid layout */}
      <IonGrid>
        <IonRow>
          {photos.map((photo) => (
            <IonCol size="6" key={photo.filepath}>
              <IonImg src={photo.webviewPath} />
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>

        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => addNewToGallery ()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
