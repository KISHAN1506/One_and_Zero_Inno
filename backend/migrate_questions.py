import sqlite3

def migrate_db():
    conn = sqlite3.connect('learnpath.db')
    cursor = conn.cursor()
    
    # Check if 'tags' column exists in 'questions' table
    cursor.execute("PRAGMA table_info(questions)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if 'tags' not in columns:
        print("Migrating: Adding 'tags' column to questions table...")
        cursor.execute("ALTER TABLE questions ADD COLUMN tags JSON DEFAULT '[]'")
    
    if 'difficulty_score' not in columns:
        print("Migrating: Adding 'difficulty_score' column to questions table...")
        cursor.execute("ALTER TABLE questions ADD COLUMN difficulty_score INTEGER DEFAULT 5")
        
    conn.commit()
    conn.close()
    print("Migration Check Complete.")

if __name__ == "__main__":
    migrate_db()
