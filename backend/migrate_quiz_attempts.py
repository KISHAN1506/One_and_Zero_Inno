import sqlite3

def migrate_db():
    conn = sqlite3.connect('learnpath.db')
    cursor = conn.cursor()
    
    # Create quiz_attempts table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            overall_score REAL,
            total_questions INTEGER,
            correct_count INTEGER,
            incorrect_count INTEGER,
            skipped_count INTEGER,
            topic_mastery JSON,
            incorrect_questions JSON,
            detailed_report JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            quiz_type TEXT DEFAULT 'diagnostic',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("Migration Complete: quiz_attempts table created.")

if __name__ == "__main__":
    migrate_db()
