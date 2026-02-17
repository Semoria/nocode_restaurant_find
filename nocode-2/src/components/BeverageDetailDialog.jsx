import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Heart, CheckCircle, Zap, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';

const BeverageDetailDialog = ({ beverage, open, onOpenChange }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 打开弹窗时检查是否已收藏
  useEffect(() => {
    if (!beverage || !open) return;
    const checkFavorite = async () => {
      const deviceId = getDeviceId();
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('device_id', deviceId)
        .eq('beverage_key', `${beverage.brand}::${beverage.beverage_name}`)
        .maybeSingle();
      setIsFavorited(!!data);
    };
    checkFavorite();
  }, [beverage, open]);

  // 切换收藏
  const toggleFavorite = async () => {
    setFavoriteLoading(true);
    const deviceId = getDeviceId();
    const beverageKey = `${beverage.brand}::${beverage.beverage_name}`;

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('device_id', deviceId)
          .eq('beverage_key', beverageKey);
        setIsFavorited(false);
      } else {
        await supabase
          .from('favorites')
          .insert({
            device_id: deviceId,
            beverage_key: beverageKey,
            beverage_data: beverage    // ⚠️【关键修正】直接传对象，不要 JSON.stringify！
                                       // Supabase 的 jsonb 列会自动序列化 JS 对象。
                                       // 如果你写 JSON.stringify(beverage) 会导致双重编码，
                                       // 读取时需要 parse 两次才能拿到对象。
          });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
    setFavoriteLoading(false);
  };

  if (!beverage) return null;

  // 准备血糖数据
  const chartData = beverage.blood_sugar_data ? [
    { time: "餐前", value: beverage.blood_sugar_data.fasting },
    { time: "30min", value: beverage.blood_sugar_data.post_30min },
    { time: "60min", value: beverage.blood_sugar_data.post_60min },
    { time: "120min", value: beverage.blood_sugar_data.post_120min },
    { time: "180min", value: beverage.blood_sugar_data.post_180min },
  ] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-5 md:w-auto md:max-w-md md:max-h-[90vh]">
        <DialogTitle className="text-xl font-bold flex justify-between items-start">
          <span>{beverage.beverage_name}</span>
          <div className="flex items-center gap-2">
            {beverage.data_badge === "verified" ? (
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
            <button 
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </DialogTitle>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 text-sm">
          <span className="text-gray-500">{beverage.store?.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-brand-primary font-bold">¥{beverage.price_approx}</span>
            <span className="text-gray-500">{beverage.sugar_option}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 my-3">
          {beverage.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-brand-light text-brand-text rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <p className="text-sm text-brand-text/70 italic mb-4">
          {beverage.reason}
        </p>
        
        {chartData ? (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">血糖变化曲线 (mmol/L)</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" fontSize={11} />
                <YAxis 
                  domain={[3.5, 13]} 
                  fontSize={10} 
                  width={35}
                />
                <Tooltip formatter={(value) => [`${value} mmol/L`, "血糖值"]} />
                <ReferenceLine y={7.8} stroke="#999" strokeDasharray="3 3" label="餐后2h正常上限" />
                <ReferenceLine y={11.1} stroke="#ef4444" strokeDasharray="3 3" label="糖尿病诊断线" />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#D4A574" 
                  strokeWidth={2} 
                  dot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 mb-4">
            暂无血糖数据
          </div>
        )}
        
        {beverage.health_note && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{beverage.health_note}</p>
          </div>
        )}
        
        <button 
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 transition-transform active:scale-90"
        >
          <Heart 
            className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500 animate-pulse' : 'text-white'}`} 
          />
          {isFavorited ? '已收藏' : '收藏饮品'}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default BeverageDetailDialog;
