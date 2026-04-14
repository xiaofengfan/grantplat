import sqlite3
conn = sqlite3.connect('quantmaster.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print("现有表:", tables)
print("\n检查股票池相关表:")
for t in ['stock_pools', 'stock_alerts', 'ai_configs', 'ai_conversations', 'ai_signals']:
    cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{t}'")
    exists = cursor.fetchone()
    print(f"  {t}: {'存在' if exists else '不存在'}")
conn.close()