// DeepSeek API 服务
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = 'sk-6fcd604753324744a228f58bbf41f894';

// 清洗模型返回的 JSON 内容
const cleanJsonContent = (responseText) => {
  // 方法1: 移除 markdown 代码块标记
  let cleanText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // 方法2: 只保留从第一个 { 到最后一个 } 的子串
  const firstBraceIndex = cleanText.indexOf('{');
  const lastBraceIndex = cleanText.lastIndexOf('}');
  
  if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
    cleanText = cleanText.substring(firstBraceIndex, lastBraceIndex + 1);
  }
  
  return cleanText.trim();
};

export const parseUserQuery = async (rawText) => {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是餐厅推荐助手。请将用户的自然语言需求解析为 JSON 格式。返回格式必须是纯 JSON，不要任何其他文字。JSON 结构：{"city": "城市", "city_only": true/false, "city_zh": "中文城市名", "cuisine": "菜系", "budget_min": 最低预算, "budget_max": 最高预算, "scene_tags": ["场景标签数组"], "party_size": 人数, "environment_tags": ["环境标签"], "special_needs": ["特殊需求"]}'
          },
          {
            role: 'user',
            content: rawText
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 提取API响应内容
    const responseText = data.choices[0].message.content;
    
    // 步骤 3.1: 清洗模型返回内容
    const cleanJsonText = cleanJsonContent(responseText);
    
    // 步骤 3.2: 解析清洗后的 JSON
    const parsedConditions = JSON.parse(cleanJsonText);
    
    return parsedConditions;
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    throw error;
  }
};
