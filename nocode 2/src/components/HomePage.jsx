import { useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import SecondSection from './SecondSection';
import WordCloudSection from './WordCloudSection';
import Footer from './Footer';
import FavoritesDrawer from './FavoritesDrawer';
import BeverageDetailDialog from './BeverageDetailDialog';
import ErrorBoundary from './ErrorBoundary';

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
    try {
      setLocationData(data);
      console.log('地址确认:', data);
    } catch (err) {
      console.error('地址确认处理失败:', err);
    }
  };

  const handleTagsExtracted = (tags) => {
    try {
      setExtractedTags(tags || []);
      console.log('提取的标签:', tags);
    } catch (err) {
      console.error('标签提取处理失败:', err);
    }
  };

  const handlePoiStoresFetched = (stores) => {
    try {
      setPoiStores(stores || []);
      console.log('附近店铺:', stores);
    } catch (err) {
      console.error('店铺数据处理失败:', err);
    }
  };

  const handleRecommendationsReceived = (recs, isLoading) => {
    try {
      setRecommendations(recs || []);
      setIsRecommendationsLoading(Boolean(isLoading));
      console.log('推荐结果:', recs);
    } catch (err) {
      console.error('推荐数据处理失败:', err);
    }
  };

  const handleSelectBeverage = (bev) => {
    try {
      if (bev) {
        setSelectedBeverage(bev);
        setBeverageDialogOpen(true);
        setFavDrawerOpen(false);  // 关闭收藏抽屉
      }
    } catch (err) {
      console.error('饮品选择处理失败:', err);
    }
  };

  const handleFavoritesClick = () => {
    try {
      setFavDrawerOpen(true);
    } catch (err) {
      console.error('收藏页面打开失败:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-bg overflow-x-hidden">
        <Header onFavoritesClick={handleFavoritesClick} />
        
        <ErrorBoundary>
          <HeroSection onAddressConfirm={handleAddressConfirm} />
        </ErrorBoundary>
        
        {locationData && (
          <>
            <ErrorBoundary>
              <SecondSection 
                onTagsExtracted={handleTagsExtracted}
                onPoiStoresFetched={handlePoiStoresFetched}
                onRecommendationsReceived={handleRecommendationsReceived}
                locationData={locationData}
              />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <WordCloudSection 
                extractedTags={extractedTags} 
                poiStores={poiStores}
                recommendations={recommendations}
                isRecommendationsLoading={isRecommendationsLoading}
                locationData={locationData}
                onSelectBeverage={handleSelectBeverage}
                onRecommendationsReceived={handleRecommendationsReceived}
              />
            </ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default HomePage;
