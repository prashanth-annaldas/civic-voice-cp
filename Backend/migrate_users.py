import sqlite3

try:
    conn = sqlite3.connect("test.db") # The default engine is sqlite:///test.db
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR")
    conn.commit()
    print("Successfully added name column")
except sqlite3.OperationalError as e:
    print(f"Skipped adding column: {e}")
except Exception as e:
    print(f"Error: {e}")
finally:
    if conn:
        conn.close()
