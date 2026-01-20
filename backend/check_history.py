import sqlite3

conn = sqlite3.connect('learnpath.db')
cursor = conn.cursor()

# Check quiz attempts table
cursor.execute("SELECT id, user_id, overall_score, total_questions, correct_count, incorrect_count, created_at FROM quiz_attempts ORDER BY created_at DESC LIMIT 5")
attempts = cursor.fetchall()

print("Recent Quiz Attempts:")
print("-" * 80)
for attempt in attempts:
    print(f"ID: {attempt[0]}, User: {attempt[1]}, Score: {attempt[2]*100:.1f}%, " 
          f"Total: {attempt[3]}, Correct: {attempt[4]}, Incorrect: {attempt[5]}, Date: {attempt[6]}")

conn.close()
