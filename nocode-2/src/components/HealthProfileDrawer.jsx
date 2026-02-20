import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { ClipboardList, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const HealthProfileDrawer = ({ open, onOpenChange, onSave }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [allergens, setAllergens] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [dietPreferences, setDietPreferences] = useState([]);
  const [bodyConstitution, setBodyConstitution] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [periodCycleDays, setPeriodCycleDays] = useState(28);
  const [periodDurationDays, setPeriodDurationDays] = useState(7);

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 打开时从 localStorage 读取数据
  useEffect(() => {
    if (!open) return;
    
    const savedProfile = localStorage.getItem('sipwise_health_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setAllergens(profile.allergens || []);
        setChronicConditions(profile.chronic_conditions || []);
        setDietPreferences(profile.diet_preferences || []);
        setBodyConstitution(profile.body_constitution || '');
        setLastPeriodDate(profile.last_period_date || '');
        setPeriodCycleDays(profile.period_cycle_days || 28);
        setPeriodDurationDays(profile.period_duration_days || 7);
      } catch (err) {
        console.error('解析健康档案失败:', err);
      }
    } else {
      // 重置表单
      setAllergens([]);
      setChronicConditions([]);
      setDietPreferences([]);
      setBodyConstitution('');
      setLastPeriodDate('');
      setPeriodCycleDays(28);
      setPeriodDurationDays(7);
    }
  }, [open]);

  // 处理多选框变化
  const handleMultiSelect = (value, currentValues, setter) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter(v => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  // 保存健康档案
  const handleSave = async () => {
    const deviceId = getDeviceId();
    const profile = {
      allergens,
      chronic_conditions: chronicConditions,
      diet_preferences: dietPreferences,
      body_constitution: bodyConstitution,
      last_period_date: lastPeriodDate,
      period_cycle_days: periodCycleDays,
      period_duration_days: periodDurationDays
    };

    try {
      // 保存到 localStorage
      localStorage.setItem('sipwise_health_profile', JSON.stringify(profile));
      
      // 保存到 Supabase
      const { error } = await supabase
        .from('health_profiles')
        .upsert({
          device_id: deviceId,
          ...profile
        }, {
          onConflict: 'device_id'
        });
      
      if (error) throw error;
      
      toast.success('健康档案已保存');
      onSave?.(profile);
    } catch (err) {
      console.error('保存健康档案失败:', err);
      toast.error('保存失败，请重试');
    }
  };

  // 处理 CGM 数据导入
  const handleCGMImport = () => {
    toast('CGM 数据导入功能即将上线，敬请期待！');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "h-[80vh] rounded-t-2xl overflow-hidden"
            : "w-96 overflow-hidden"
        }
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-primary" />
            我的健康档案
          </SheetTitle>
        </SheetHeader>
        
        {/* 移动端顶部拖拽把手 */}
        {isMobile && (
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {/* 修复滚动区域 */}
        <div className="overflow-y-auto h-full pb-20 mt-4">
          <div className="space-y-6">
            {/* 过敏原 */}
            <div>
              <h3 className="font-medium text-brand-text mb-3">过敏原</h3>
              <div className="grid grid-cols-2 gap-2">
                {['牛奶', '大豆', '坚果', '芒果', '桃子', '花生', '小麦/麸质'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allergens.includes(item)}
                      onChange={() => handleMultiSelect(item, allergens, setAllergens)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 慢性病 */}
            <div>
              <h3 className="font-medium text-brand-text mb-3">慢性病</h3>
              <div className="grid grid-cols-2 gap-2">
                {['糖尿病', '高血脂', '高血压', '痛风', '胃溃疡'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chronicConditions.includes(item)}
                      onChange={() => handleMultiSelect(item, chronicConditions, setChronicConditions)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 饮食偏好 */}
            <div>
              <h3 className="font-medium text-brand-text mb-3">饮食偏好</h3>
              <div className="grid grid-cols-2 gap-2">
                {['素食', '低碳水', '生酮', '无乳糖', '清真'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietPreferences.includes(item)}
                      onChange={() => handleMultiSelect(item, dietPreferences, setDietPreferences)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 体质 */}
            <div>
              <h3 className="font-medium text-brand-text mb-3">体质</h3>
              <div className="grid grid-cols-2 gap-2">
                {['平和体质', '阳虚体质', '气虚体质', '阴虚体质', '湿热体质', '痰湿体质', '气郁体质', '血瘀体质', '特禀体质'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bodyConstitution"
                      value={item}
                      checked={bodyConstitution === item}
                      onChange={(e) => setBodyConstitution(e.target.value)}
                      className="text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 月经信息 */}
            <div>
              <h3 className="font-medium text-brand-text mb-3">月经信息</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">上次月经日期</label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">月经周期天数</label>
                  <input
                    type="number"
                    value={periodCycleDays}
                    onChange={(e) => setPeriodCycleDays(parseInt(e.target.value) || 28)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    min="20"
                    max="40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">经期持续天数</label>
                  <input
                    type="number"
                    value={periodDurationDays}
                    onChange={(e) => setPeriodDurationDays(parseInt(e.target.value) || 7)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    min="1"
                    max="14"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮区域 - 固定在底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 space-y-3">
          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium"
          >
            保存
          </button>

          {/* CGM 数据导入按钮 */}
          <button
            onClick={handleCGMImport}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg text-gray-400 py-3 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-500 transition-colors"
          >
            <Upload className="h-4 w-4" />
            导入我的 CGM 数据
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HealthProfileDrawer;
