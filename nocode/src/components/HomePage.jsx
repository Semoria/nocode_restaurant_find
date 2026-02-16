import { useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import SecondSection from './SecondSection';
import WordCloudSection from './WordCloudSection';
import Footer from './Footer';
import FavoritesDrawer from './FavoritesDrawer';
import BeverageDetailDialog from './BeverageDetailDialog';

const HomePage = () => {
  const [locationData, setLocationData] = useState(null);
  const [extractedTags, setExtractedTags] = useState([]);
  const [poiStores, setPoiStores] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [beverageDialogOpen, setBeverageDialogOpen] = useState(false);

  const handleAddressConfirm = (data) => {
    setLocationData(data);
    console.log('地址确认:', data);
  };

  const handleTagsExtracted = (tags) => {
    setExtractedTags(tags);
    console.log('提取的标签:', tags);
  };

  const handlePoiStoresFetched = (stores) => {
    setPoiStores(stores);
    console.log('附近店铺:', stores);
  };

  const handleRecommendationsReceived = (recs, isLoading) => {
    setRecommendations(recs);
    setIsRecommendationsLoading(isLoading);
    console.log('推荐结果:', recs);
  };

  const handleSelectBeverage = (bev) => {
    setSelectedBeverage(bev);
    setBeverageDialogOpen(true);
    setFavDrawerOpen(false);  // 关闭收藏抽屉
  };

  return (
    <div className="min-h-screen bg-brand-bg overflow-x-hidden">
      <Header onFavoritesClick={() => setFavDrawerOpen(true)} />
      <HeroSection onAddressConfirm={handleAddressConfirm} />
      
      {locationData && (
        <>
          <SecondSection 
            onTagsExtracted={handleTagsExtracted}
            onPoiStoresFetched={handlePoiStoresFetched}
            onRecommendationsReceived={handleRecommendationsReceived}
            locationData={locationData}
          />
          <WordCloudSection 
            extractedTags={extractedTags} 
            poiStores={poiStores}
            recommendations={recommendations}
            isRecommendationsLoading={isRecommendationsLoading}
            locationData={locationData}
            onSelectBeverage={handleSelectBeverage}
            onRecommendationsReceived={handleRecommendationsReceived}
          />
        </>
      )}
      
      <Footer />
      
      <FavoritesDrawer
        open={favDrawerOpen}
        onOpenChange={setFavDrawerOpen}
        onSelectBeverage={handleSelectBeverage}
      />
      <BeverageDetailDialog
        open={beverageDialogOpen}
        onOpenChange={setBeverageDialogOpen}
        beverage={selectedBeverage}
      />
    </div>
  );
};

export default HomePage;
