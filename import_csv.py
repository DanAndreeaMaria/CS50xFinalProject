import sqlite3
import csv

# Connect to the SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect("food_nutrients.db")
cursor = conn.cursor()

# Open the CSV file
with open("food.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        cursor.execute("""
            INSERT INTO food (
                name, category, serving_size_g, fiber_g, iron_mg,
                protein_g, calcium_mg, magnesium_mg, omega3_mg,
                vitamin_c_mg, zinc_mg
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row['name'],
            row['category'],
            int(row['serving_size_g']),
            float(row['fiber_g']),
            float(row['iron_mg']),
            float(row['protein_g']),
            float(row['calcium_mg']),
            float(row['magnesium_mg']),
            float(row['omega3_mg']),
            float(row['vitamin_c_mg']),
            float(row['zinc_mg']),
        ))

# Commit and close
conn.commit()
conn.close()

print("✅ Data successfully imported into SQLite database.")
