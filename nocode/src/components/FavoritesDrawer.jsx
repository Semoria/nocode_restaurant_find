import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { Heart, X, Coffee, CheckCircle, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const FavoritesDrawer = ({ open, onOpenChange, onSelectBeverage }) => {
  const [favorites, setFavorites] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 打开时查询 Supabase
  useEffect(() => {
    if (!open) return;
    const fetchFavorites = async () => {
      const deviceId = getDeviceId();
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });
      setFavorites(data || []);
    };
    fetchFavorites();
  }, [open]);

  // 删除收藏
  const removeFavorite = async (beverageKey, e) => {
    if (e) e.stopPropagation();
    const deviceId = getDeviceId();
    await supabase
      .from('favorites')
      .delete()
      .eq('device_id', deviceId)
      .eq('beverage_key', beverageKey);
    setFavorites(prev => prev.filter(f => f.beverage_key !== beverageKey));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "h-[80vh] rounded-t-2xl"
            : "w-80"
        }
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            我的收藏
          </SheetTitle>
        </SheetHeader>
        {/* 移动端顶部拖拽把手 */}
        {isMobile && (
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        <div className="overflow-y-auto flex-1 mt-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Coffee className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>还没有收藏哦，去探索一下吧 ☕</p>
            </div>
          ) : (
            favorites.map(item => {
              // ⚠️【关键修正】beverage_data 是 jsonb 类型，Supabase 返回时已经是 JS 对象，
              // 不需要 JSON.parse！直接使用：
              const bev = item.beverage_data;
              return (
                <div 
                  key={item.beverage_key}
                  className="bg-white rounded-lg border border-brand-border p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectBeverage(bev)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-brand-text">{bev.beverage_name}</h4>
                      <p className="text-sm text-brand-text/70">{bev.brand}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-primary font-medium">¥{bev.price_approx}</span>
                        <span className="text-sm text-brand-text/60">{bev.sugar_option}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {bev.data_badge === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            小红书实测
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            <Zap className="h-3 w-3" />
                            AI 估算
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeFavorite(item.beverage_key, e)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesDrawer;
