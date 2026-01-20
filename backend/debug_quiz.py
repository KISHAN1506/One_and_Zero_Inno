import sqlite3
conn = sqlite3.connect('learnpath.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print("Tables:", tables)

# Check quiz_attempts
if 'quiz_attempts' in tables:
    cursor.execute("SELECT COUNT(*) FROM quiz_attempts")
    count = cursor.fetchone()[0]
    print(f"quiz_attempts has {count} records")
    cursor.execute("SELECT id, user_id, overall_score, created_at FROM quiz_attempts LIMIT 5")
    rows = cursor.fetchall()
    for r in rows:
        print(r)
else:
    print("quiz_attempts table does NOT exist!")
conn.close()
