import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { Users, Copy, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const FamilyGroupDrawer = ({ open, onOpenChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasFamilyGroup, setHasFamilyGroup] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 检查是否已有家庭组
  useEffect(() => {
    if (!open) return;
    
    const checkFamilyGroup = async () => {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('family_groups')
        .select('group_id')
        .eq('device_id', deviceId)
        .limit(1);
      
      if (error) {
        console.error('检查家庭组失败:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setHasFamilyGroup(true);
        setGroupId(data[0].group_id);
        await fetchMembers(data[0].group_id);
      } else {
        setHasFamilyGroup(false);
        setGroupId(null);
        setMembers([]);
      }
    };
    
    checkFamilyGroup();
  }, [open]);

  // 获取成员列表
  const fetchMembers = async (groupId) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('group_id', groupId);
      
      if (membersError) throw membersError;
      
      // 获取每个成员的健康档案
      const membersWithHealth = await Promise.all(
        membersData.map(async (member) => {
          const { data: healthData } = await supabase
            .from('health_profiles')
            .select('*')
            .eq('device_id', member.device_id)
            .limit(1);
          
          return {
            ...member,
            health_profile: healthData && healthData.length > 0 ? healthData[0] : null
          };
        })
      );
      
      setMembers(membersWithHealth);
    } catch (err) {
      console.error('获取成员列表失败:', err);
    }
  };

  // 创建家庭组
  const handleCreateFamilyGroup = async () => {
    setLoading(true);
    const deviceId = getDeviceId();
    const newGroupId = crypto.randomUUID();
    
    try {
      const { error } = await supabase
        .from('family_groups')
        .insert({
          group_id: newGroupId,
          device_id: deviceId,
          role: 'creator'
        });
      
      if (error) throw error;
      
      localStorage.setItem('sipwise_family_group_id', newGroupId);
      setHasFamilyGroup(true);
      setGroupId(newGroupId);
      toast.success('家庭组创建成功');
      await fetchMembers(newGroupId);
    } catch (err) {
      console.error('创建家庭组失败:', err);
      toast.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 生成邀请码
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成并保存邀请码
  const handleGenerateInvite = async () => {
    if (!groupId) return;
    
    const deviceId = getDeviceId();
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    try {
      const { error } = await supabase
        .from('family_invites')
        .insert({
          invite_code: code,
          creator_device_id: deviceId,
          group_id: groupId,
          expires_at: expiresAt
        });
      
      if (error) throw error;
      
      setGeneratedInviteCode(code);
      toast.success('邀请码生成成功');
    } catch (err) {
      console.error('生成邀请码失败:', err);
      toast.error('生成失败，请重试');
    }
  };

  // 复制邀请码
  const handleCopyInviteCode = async () => {
    if (!generatedInviteCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedInviteCode);
      toast.success('邀请码已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      toast.error('复制失败');
    }
  };

  // 加入家庭组
  const handleJoinFamilyGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error('请输入邀请码');
      return;
    }
    
    setLoading(true);
    const deviceId = getDeviceId();
    
    try {
      // 验证邀请码
      const { data: inviteData, error: inviteError } = await supabase
        .from('family_invites')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .is('used_by', null)
        .limit(1);
      
      if (inviteError) throw inviteError;
      
      if (!inviteData || inviteData.length === 0) {
        toast.error('邀请码无效或已过期');
        return;
      }
      
      const invite = inviteData[0];
      
      // 加入家庭组
      const { error: joinError } = await supabase
        .from('family_groups')
        .insert({
          group_id: invite.group_id,
          device_id: deviceId,
          role: 'member'
        });
      
      if (joinError) throw joinError;
      
      // 更新邀请码使用状态
      const { error: updateError } = await supabase
        .from('family_invites')
        .update({ used_by: deviceId })
        .eq('invite_code', inviteCode.toUpperCase());
      
      if (updateError) throw updateError;
      
      localStorage.setItem('sipwise_family_group_id', invite.group_id);
      setHasFamilyGroup(true);
      setGroupId(invite.group_id);
      setInviteCode('');
      toast.success('成功加入家庭组');
      await fetchMembers(invite.group_id);
    } catch (err) {
      console.error('加入家庭组失败:', err);
      toast.error('加入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 为成员推荐
  const handleRecommendForMember = (member) => {
    localStorage.setItem('sipwise_recommend_for', JSON.stringify({
      device_id: member.device_id,
      nickname: member.nickname || `成员${members.indexOf(member) + 1}`,
      health_profile: member.health_profile
    }));
    toast.success(`正在为 ${member.nickname || `成员${members.indexOf(member) + 1}`} 推荐`);
    onOpenChange(false);
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
            <Users className="h-5 w-5 text-brand-primary" />
            我的家庭组
          </SheetTitle>
        </SheetHeader>
        
        {/* 移动端顶部拖拽把手 */}
        {isMobile && (
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        <div className="overflow-y-auto h-full pb-20 mt-4">
          {!hasFamilyGroup ? (
            <div className="space-y-6">
              {/* 创建家庭组 */}
              <div className="text-center">
                <button
                  onClick={handleCreateFamilyGroup}
                  disabled={loading}
                  className="w-full py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? '创建中...' : '创建家庭组'}
                </button>
              </div>
              
              {/* 加入家庭组 */}
              <div className="space-y-3">
                <h3 className="font-medium text-brand-text">输入邀请码加入</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="输入6位邀请码"
                    maxLength={6}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleJoinFamilyGroup}
                    disabled={loading || !inviteCode.trim()}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50"
                  >
                    加入
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 邀请成员 */}
              <div className="space-y-3">
                <button
                  onClick={handleGenerateInvite}
                  className="w-full py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  邀请成员
                </button>
                
                {generatedInviteCode && (
                  <div className="flex items-center gap-2 p-3 bg-brand-light rounded-lg">
                    <span className="font-mono text-lg font-bold">{generatedInviteCode}</span>
                    <button
                      onClick={handleCopyInviteCode}
                      className="p-1 hover:bg-brand-primary/10 rounded transition-colors"
                    >
                      <Copy className="h-4 w-4 text-brand-primary" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* 成员列表 */}
              <div className="space-y-3">
                <h3 className="font-medium text-brand-text">家庭成员</h3>
                {members.map((member, index) => (
                  <div key={member.id} className="bg-white rounded-lg border border-brand-border p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-brand-text">
                          {member.nickname || `成员${index + 1}`}
                        </h4>
                        <p className="text-sm text-brand-text/60">
                          {member.role === 'creator' ? '创建者' : '成员'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRecommendForMember(member)}
                        className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:bg-brand-accent transition-colors"
                      >
                        为TA推荐
                      </button>
                    </div>
                    
                    {member.health_profile && (
                      <div className="space-y-1 text-sm">
                        {member.health_profile.body_constitution && (
                          <p>体质: {member.health_profile.body_constitution}</p>
                        )}
                        {member.health_profile.allergens && member.health_profile.allergens.length > 0 && (
                          <p>过敏原: {member.health_profile.allergens.join(', ')}</p>
                        )}
                        {member.health_profile.last_period_date && (
                          <p>
                            经期状态: {
                              // 简单判断是否在经期中（假设经期持续period_duration_days天）
                              (() => {
                                const lastPeriod = new Date(member.health_profile.last_period_date);
                                const today = new Date();
                                const daysDiff = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
                                return daysDiff <= (member.health_profile.period_duration_days || 7) ? '经期中' : '非经期';
                              })()
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyGroupDrawer;
