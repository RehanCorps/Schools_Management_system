from database import get_connection

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE fee_records (
    fee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    fee_month TEXT NOT NULL,
    fee_amount REAL NOT NULL,
    fee_status TEXT DEFAULT 'unpaid',   -- 'paid' or 'unpaid'
    payment_date TEXT,                  -- optional
    FOREIGN KEY(student_id) REFERENCES students_record(student_id) ON DELETE CASCADE
)
""")

    conn.commit()
    conn.close()



if __name__ == "__main__":
        init_db()
