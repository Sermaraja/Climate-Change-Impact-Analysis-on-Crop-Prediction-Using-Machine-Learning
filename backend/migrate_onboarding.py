import sqlite3

conn = sqlite3.connect('climate_crop.db')
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users)")
cols = [c[1] for c in cursor.fetchall()]
print("Existing columns in users:", cols)

if "onboarding_completed" not in cols:
    cursor.execute("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0")
    print("Added onboarding_completed column")

if "tour_status" not in cols:
    cursor.execute("ALTER TABLE users ADD COLUMN tour_status VARCHAR(50) DEFAULT 'NOT_STARTED'")
    print("Added tour_status column")

conn.commit()
conn.close()
print("Migration completed successfully!")
