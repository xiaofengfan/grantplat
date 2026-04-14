import sqlite3
from datetime import datetime, timezone

conn = sqlite3.connect('quantmaster.db')
cursor = conn.cursor()

cursor.execute("SELECT id FROM users LIMIT 1")
user_id = cursor.fetchone()[0]

sample_stocks = [
    ('600519', '贵州茅台', 'A', '白酒龙头', '核心持仓'),
    ('000858', '五粮液', 'A', '白酒龙头', '稳健配置'),
    ('601318', '中国平安', 'A', '金融保险', '长线持有'),
    ('600036', '招商银行', 'A', '银行', '稳健收益'),
    ('000001', '平安银行', 'A', '银行', '关注'),
    ('000002', '万科A', 'A', '房地产', '观察'),
    ('600276', '恒瑞医药', 'A', '医药', '创新药龙头'),
    ('300750', '宁德时代', 'A', '新能源', '成长股'),
    ('688981', '中芯国际', '科创板', '半导体', '科技配置'),
    ('002475', '立讯精密', 'A', '消费电子', '苹果产业链'),
]

now = datetime.now(timezone.utc).isoformat()

for stock in sample_stocks:
    try:
        cursor.execute("""
            INSERT INTO stock_pools (user_id, symbol, name, market, group_name, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, stock[0], stock[1], stock[2], stock[3], stock[4], now))
        print(f"添加股票: {stock[0]} {stock[1]}")
    except Exception as e:
        print(f"股票 {stock[0]} 已存在或添加失败: {e}")

conn.commit()
conn.close()
print("\n样例股票添加完成!")