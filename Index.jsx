import { Database, CheckCircle, Table, Indent, Utensils, List, Search } from 'lucide-react';
import QueryInput from '../components/QueryInput';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">数据库表创建成功！</h1>
          <p className="text-xl text-gray-600">已成功创建用户查询表、餐厅信息表和推荐结果表</p>
        </div>

        {/* 查询输入区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Search className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">用户查询处理</h2>
          </div>
          <p className="text-gray-600 mb-4">
            输入您的餐厅需求，系统将自动解析并保存到数据库中
          </p>
          <QueryInput />
        </div>

        {/* 用户查询表信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Table className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">用户查询表 (user_queries)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">基础字段</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  id: 自增主键 (BIGINT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  query_id: 唯一查询 ID (TEXT, 唯一约束)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  user_id: 用户 ID (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  raw_text: 用户原始输入 (TEXT, 必填)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">JSON 字段</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  parsed_conditions: 解析后的条件 (JSONB, 默认 {})
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  backend_parameters: 后端参数 (JSONB, 默认 {})
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">状态字段</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  status: 查询状态 (TEXT, 默认 'initial')
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  clarify_round: 追问轮数 (INTEGER, 默认 0)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  match_score: 匹配分数 (DECIMAL, 默认 0.00)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">其他字段</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  additional_requirements: 额外需求 (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  timestamp: 查询时间 (TIMESTAMP, 默认当前时间)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  created_at: 创建时间 (TIMESTAMP, 默认当前时间)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  updated_at: 更新时间 (TIMESTAMP, 自动更新)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 餐厅信息表信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Utensils className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">餐厅信息表 (restaurants)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">基础 ID</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  id: 自增主键 (BIGINT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  restaurant_id: 餐厅唯一 ID (TEXT, 必填, 唯一)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  name: 店名 (TEXT, 必填)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  alias: Yelp 别名 (TEXT)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">位置信息</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  city: 城市 (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  district: 商圈/区域 (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  address: 详细地址 (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  latitude: 纬度 (DECIMAL(10,8))
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  longitude: 经度 (DECIMAL(11,8))
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">第三方平台</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  place_id: Google Maps place_id (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  google_maps_url: Google 地图链接 (TEXT)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  phone: 电话 (TEXT)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">分类与菜系</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  categories: 分类数组 (TEXT[])
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  cuisine_primary: 主菜系 (TEXT)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">价格信息</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  avg_price: 人均价格 (DECIMAL(8,2))
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  price_level: 价格档位 (INTEGER 1-4, 默认 1)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">评分信息</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  rating: 评分 (DECIMAL(3,2), 默认 0.00)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  review_count: 评论数 (INTEGER, 默认 0)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">标签系统</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  environment_tags: 环境标签 (TEXT[])
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  special_tags: 特殊标签 (TEXT[])
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  scene_tags: 场景标签 (TEXT[])
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  signature_dishes: 招牌菜 (TEXT[])
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">复杂字段</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  business_hours: 营业时间 (JSONB)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  attributes: 餐厅属性 (JSONB)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">计算分数</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  popularity_score: 热度分 (DECIMAL(6,4), 默认 0.0000)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  scene_match_score: 场景匹配分 (DECIMAL(6,4), 默认 0.0000)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">时间戳</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  created_at: 创建时间 (TIMESTAMP, 默认当前时间)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  updated_at: 更新时间 (TIMESTAMP, 自动更新)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 推荐结果表信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <List className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">推荐结果表 (recommendations)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">基础 ID</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  id: 自增主键 (BIGINT)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">关联字段</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  query_id: 关联 user_queries 表的 query_id (TEXT, 必填)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  restaurant_id: 关联 restaurants 表的 restaurant_id (TEXT, 必填)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">推荐信息</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  rank: 推荐排名 (INTEGER, 必填)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  final_score: 综合打分 (DECIMAL(6,4), 默认 0.0000)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">分项得分</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  location_score: 位置得分 (DECIMAL(6,4))
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  price_score: 价格得分 (DECIMAL(6,4))
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  rating_score: 评分得分 (DECIMAL(6,4))
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  scene_score: 场景得分 (DECIMAL(6,4))
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">时间戳</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  created_at: 创建时间 (TIMESTAMP, 默认当前时间)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">约束</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  query_id + restaurant_id 组合唯一约束
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 索引信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Indent className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">索引信息</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-purple-800 mb-3">用户查询表索引</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">用户ID索引</h4>
                  <p className="text-sm text-purple-600">idx_user_queries_user_id</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">时间戳索引</h4>
                  <p className="text-sm text-purple-600">idx_user_queries_timestamp</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">状态索引</h4>
                  <p className="text-sm text-purple-600">idx_user_queries_status</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-purple-800 mb-3">餐厅信息表索引</h3>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">城市索引</h4>
                  <p className="text-sm text-purple-600">idx_restaurants_city</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">区域索引</h4>
                  <p className="text-sm text-purple-600">idx_restaurants_district</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">菜系索引</h4>
                  <p className="text-sm text-purple-600">idx_restaurants_cuisine_primary</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">价格索引</h4>
                  <p className="text-sm text-purple-600">idx_restaurants_price_level</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">评分索引</h4>
                  <p className="text-sm text-purple-600">idx_restaurants_rating</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-purple-800 mb-3">推荐结果表索引</h3>
              <div className="grid md:grid-cols-1 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">查询ID索引</h4>
                  <p className="text-sm text-purple-600">idx_recommendations_query_id</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <Database className="h-5 w-5 mr-2" />
            <span className="font-medium">数据库表创建完成，可以开始使用！</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
