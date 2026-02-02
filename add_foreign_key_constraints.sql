-- 添加外键约束以建立表间关系
-- 关系 1: user_queries → recommendations (一对多)
-- 关系 2: restaurants → recommendations (一对多)
-- 关系 3: user_queries ← recommendations → restaurants (多对多)

-- 为 recommendations 表添加外键约束
ALTER TABLE recommendations 
ADD CONSTRAINT fk_recommendations_query_id 
FOREIGN KEY (query_id) 
REFERENCES user_queries(query_id) 
ON DELETE CASCADE;

ALTER TABLE recommendations 
ADD CONSTRAINT fk_recommendations_restaurant_id 
FOREIGN KEY (restaurant_id) 
REFERENCES restaurants(restaurant_id) 
ON DELETE CASCADE;

-- 添加注释说明关系
COMMENT ON TABLE recommendations IS '推荐结果表，连接用户查询和餐厅信息，实现多对多关系';
COMMENT ON CONSTRAINT fk_recommendations_query_id ON recommendations IS '关联到 user_queries 表的 query_id，实现一对多关系';
COMMENT ON CONSTRAINT fk_recommendations_restaurant_id ON recommendations IS '关联到 restaurants 表的 restaurant_id，实现一对多关系';
