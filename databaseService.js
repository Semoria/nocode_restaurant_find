import { supabase } from "@/integrations/supabase/client";

// 生成唯一的query_id
export const generateQueryId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `query_${dateStr}_${timeStr}`;
};

// 创建用户查询记录
export const createUserQuery = async (rawText, userId = 'default_user') => {
  const queryId = generateQueryId();
  
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .insert([
        {
          query_id: queryId,
          user_id: userId,
          raw_text: rawText,
          status: 'initial',
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('创建用户查询记录失败:', error);
    throw error;
  }
};

// 更新用户查询记录
export const updateUserQuery = async (queryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('query_id', queryId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('更新用户查询记录失败:', error);
    throw error;
  }
};

// 获取用户查询记录
export const getUserQuery = async (queryId) => {
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .select('*')
      .eq('query_id', queryId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('获取用户查询记录失败:', error);
    throw error;
  }
};
