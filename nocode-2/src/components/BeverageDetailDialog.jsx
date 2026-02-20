import { DialogContent, DialogTitle, Dialog } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Heart, CheckCircle, Zap, Info, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { getDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
const BeverageDetailDialog = ({ beverage, open, onOpenChange }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 打开弹窗时检查是否已收藏
  useEffect(() => {
    if (!beverage || !open) return;
    
    // 重置状态，避免切换饮品时残留上一杯的收藏状态
    setIsFavorited(false);
    
    const checkFavorite = async () => {
      try {
        const deviceId = getDeviceId();
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('device_id', deviceId)
          .eq('beverage_key', `${beverage.brand}::${beverage.beverage_name}`)
          .limit(1);
        
        if (error) {
          console.error('检查收藏状态失败:', error);
          return;
        }
        
        setIsFavorited(data && data.length > 0);
      } catch (err) {
        console.error('检查收藏状态异常:', err);
      }
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
        // 取消收藏
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('device_id', deviceId)
          .eq('beverage_key', beverageKey);
        
        if (error) throw error;
        
        setIsFavorited(false);
        toast.success('已取消收藏');
      } else {
        // 添加收藏
        const { error } = await supabase
          .from('favorites')
          .upsert({
            device_id: deviceId,
            beverage_key: beverageKey,
            beverage_data: beverage
          }, {
            onConflict: 'device_id, beverage_key'
          });
        
        if (error) throw error;
        
        setIsFavorited(true);
        toast.success('已收藏');
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      toast.error('操作失败，请重试');
      // 回滚状态
      setIsFavorited(prev => !prev);
    } finally {
      setFavoriteLoading(false);
    }
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

  // 生成外卖链接
  const city = beverage.store?.city || '上海'; // 从店铺信息获取城市，没有则默认为上海
  const elemeUrl = `https://www.ele.me/search?keyword=${encodeURIComponent(beverage.brand + ' ' + beverage.beverage_name)}`;
  const meituanUrl = `https://waimai.meituan.com/search?cityName=${encodeURIComponent(city)}&keyword=${encodeURIComponent(beverage.brand)}`;

  // 处理外卖链接点击
  const handleDeliveryClick = (url) => {
    // 测试沙箱支持的跳转方式
    const newWindow = window.open();
    if (newWindow) {
      // window.open 可用
      newWindow.location.href = url;
    } else {
      // window.open 被阻止，尝试用 <a target="_blank">
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 新增变量计算
  const calories = beverage.calories_kcal || beverage.calories_estimate || 0;
  const sugarGrams = beverage.sugar_grams || beverage.sugar_grams_estimate || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-5 md:w-auto md:max-w-md md:max-h-[90vh]">
        {/* 经期警告/推荐标识 */}
        {beverage.periodWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">⚠️ 经期不建议饮用此饮品</p>
          </div>
        )}
        
        {beverage.periodFriendly && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">✅ 经期友好饮品</p>
          </div>
        )}
        
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

        {/* 热量与运动可视化 */}
        {calories > 0 && (
          <div className="mb-4 bg-brand-light rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-brand-text">热量与运动</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                beverage.calories_source && beverage.calories_source !== 'AI估算'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {beverage.calories_source && beverage.calories_source !== 'AI估算'
                  ? '🎬 B站实测' : '🤖 AI 估算'}
              </span>
            </div>

            {/* 热量进度条 */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-brand-text/70 mb-1">
                <span>🔥 预估热量</span>
                <span className="font-medium">{calories} kcal</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((calories / 600) * 100, 100)}%`,
                    backgroundColor: calories > 400 ? '#ef4444' : calories > 200 ? '#f59e0b' : '#22c55e'
                  }}
                />
              </div>
            </div>

            {/* 跑步等价 */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-brand-text/70 mb-1">
                <span>🏃 相当于慢跑</span>
                <span className="font-medium">{Math.round(calories / 10)} 分钟</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((Math.round(calories / 10) / 60) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 含糖量 */}
            {sugarGrams > 0 && (
              <div>
                <div className="flex justify-between text-xs text-brand-text/70 mb-1">
                  <span>🍬 含糖量</span>
                  <span className="font-medium">约 {sugarGrams}g</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((sugarGrams / 70) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {beverage.health_note && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{beverage.health_note}</p>
          </div>
        )}
        
        {/* 外卖按钮区域 */}
        <div className="mt-4 mb-4">
          <p className="text-xs text-gray-400 mb-2">在线点单</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDeliveryClick(elemeUrl)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              饿了么
            </button>
            <button
              onClick={() => handleDeliveryClick(meituanUrl)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
            >
              美团外卖
            </button>
          </div>
        </div>
        
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
