import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
from flask import Flask, render_template, request, redirect, session, jsonify
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
app.secret_key = 'your_secret_key' # Required for session

# Helper function to get data from the database
# Inspired from the course
def get_food_data():
  conn = sqlite3.connect('food_nutrients.db')  # opens a connection to the SQLite database file food_nutrients.db
  conn.execute("PRAGMA foreign_keys = ON")
  conn.row_factory = sqlite3.Row  # allows dict-like access
  cursor = conn.cursor()  # creates a cursor object to execute SQL queries
  cursor.execute("SELECT * FROM food")  # executes a SQL query that gets all rows from the food table
  rows = cursor.fetchall()  # fetches all the result from that query and stores them in a list
  conn.close()  # closes the database connection
  return rows  # returns the list of rows to whoever calls this function

# Helper function to interact with the users table
# Inspired from the course
def query_db(query, args=(), one=False, commit=False):
  conn = sqlite3.connect('food_nutrients.db')
  conn.row_factory = sqlite3.Row
  cursor = conn.cursor()
  cursor.execute(query, args)
  if commit:
    conn.commit()
    result = cursor.lastrowid if query.strip().upper().startswith("INSERT") else None # for INSERTs
  else:
    result = cursor.fetchall()
  conn.close()
  return result if not one else (result[0] if result else None)

# when someone visits the homepage, Flask calls the function below it
# Inspired from the course
@app.route('/')
def index():
  food_data = get_food_data()
  return render_template('index.html', foods=food_data)  # tells Flask to load templates/index.html and pass the data into the HTML as a variable

# Register route
# Inspired from the course
@app.route("/register", methods=["GET", "POST"])
def register():
  if request.method == "POST":
    username = request.form.get("username")
    password = request.form.get("password")
    confirmation = request.form.get("confirmation")

    if not username:
      session["error"] = "Must provide username"
      return redirect("/register")
    if not password:
       session["error"] = "Must provide password"
       return redirect("/register")
    if not confirmation:
       session["error"] = "Must confirm password"
       return redirect("/register")
    if password != confirmation:
       session["error"] = "Passwords do not match"
       return redirect("/register")

    existing_user = query_db(
        "SELECT * FROM users WHERE username = ?", (username,), one=True
    )
    if existing_user:
        session["error"] = "Username already exists"
        return redirect("/register")

    hashed_password = generate_password_hash(password)
    new_user_id = query_db(
        "INSERT INTO users (username, hash) VALUES (?, ?)", (username, hashed_password), commit=True
    )

    session["user_id"] = new_user_id

    # Add success message, at registering
    session["success"] = "Account created successfully! You can now log in!"
    return redirect("/login")
  
  # Handle GET: display error if set, then clear it
  error = session.pop("error", None)
  return render_template("register.html", error=error)

# Log In route
# Inspired from the course
@app.route("/login", methods=["GET", "POST"])
def login():
  # User reached route via POST
  if request.method == "POST":
    if not request.form.get("username"):
      session["error"] = "Must provide username"
      return redirect("/login")
    elif not request.form.get("password"):
      session["error"] = "Must provide password"
      return redirect("/login")
    
    # Query database for username
    rows = query_db(
      "SELECT * FROM users WHERE username = ?", (request.form.get("username"),)
    )

    # Ensure username exists and password is correct
    if len(rows) != 1 or not check_password_hash(
      rows[0]["hash"], request.form.get("password")
    ):
      session["error"] = "Invalid username and/or password"
      return redirect("/login")
    
    # Clear any sessions
    session.clear()
    
    # Remember which user has logged in
    session["user_id"] = rows[0]["id"]
    session["username"] = rows[0]["username"]

    # Redirect user to home page
    return redirect("/")
  
  # User reached route via GET
  else:
     # GET request
    error = session.pop("error", None)  # remove it safely
    success = session.pop("success", None) # grab success too
    return render_template("login.html", error=error, success=success)
  
# Log Out
# Inspired from the course
@app.route("/logout")
def logout():
  # Forget any user id
  session.clear()

  # Redirect user to login form
  return redirect("/")

@app.route("/track")
def track():
  # Pass it into the template
  return render_template("track.html")

# Flask search food item route
# Inspired from the course
@app.route("/search")
def search():
  query = request.args.get("q")
  if query:
    rows = query_db("SELECT * FROM food WHERE LOWER(name) LIKE ?", (query.lower() + "%",))
    # Convert DB fields to expected frontend field names
    food_nutrients = []
    for row in rows:
      food_nutrients.append({
        "food_name":row["name"],
        "quantity": 100,
        "fiber": row["fiber_g"],
        "iron": row["iron_g"],
        "protein": row["protein_g"],
        "calcium": row["calcium_mg"],
        "magnesium": row["magnesium_mg"],
        "omega3": row["omega3_mg"],
        "vitaminC": row["vitamin_c_mg"],
        "zinc": row["zinc_mg"],
        "category": row["category"]
      })
  else:
      food_nutrients = []

  return jsonify(food_nutrients)

# Flask route to save in session selected food items into the database
# Inspired from AI, I searched how to save data into the database
@app.route("/save_items", methods=["POST"])
def save_items():
    # Ensure the user is logged in before saving
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    # Generate local timestamp (UTC+3)
    local_time = (datetime.now(timezone.utc) + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")
    
    # Extract the list of items from the request body (JSON payload)
    items = request.json.get("items", [])
    
    # Loop through each food item and insert into user_items table
    for item in items:
        query_db(
            """
            INSERT INTO user_items 
            (user_id, food_name, quantity, fiber, iron, protein, calcium, 
             magnesium, omega3, vitaminC, zinc, timestamp, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session["user_id"],          # Logged-in user's ID
                item["food_name"],           # Name of the food
                item["quantity"],            # Quantity in grams
                item.get("fiber") or 0,      # Fiber value (default 0 if missing)
                item.get("iron") or 0,       # Iron value
                item.get("protein") or 0,    # Protein value
                item.get("calcium") or 0,    # Calcium value
                item.get("magnesium") or 0,  # Magnesium value
                item.get("omega3") or 0,     # Omega-3 value
                item.get("vitaminC") or 0,   # Vitamin C value
                item.get("zinc") or 0,       # Zinc value
                local_time,                  # Timestamp (local time)
                item.get("category")         # Food category (Vegetable, Fruit, etc.)
            ),
            commit=True
        )

    # Return empty response with status 204 (success, no content)
    return "", 204

# Flask route to fetch daily nutrient totals for the logged-in user
# Inspired from AI, I asked how history is created for accessing it via calendar
@app.route("/api/nutrient-history")
def nutrient_history():
  # Ensure the user is logged in
  if "user_id" not in session:
    return jsonify({"error": "Not logged in"}), 401
  
  # Get the selected data from query string (expected format YYYY-MM-DD )
  selected_date = request.args.get("date")    
  if not selected_date:
    return jsonify({"error": "Date is required"}), 400
  
  # Query the database for nutrient totals for the given date
  rows = query_db("""
                SELECT
                  SUM(calcium) AS total_calcium,
                  SUM(iron) AS total_iron,
                  SUM(fiber) AS total_fiber,
                  SUM(protein) AS total_protein,
                  SUM(magnesium) AS total_magnesium,
                  SUM(omega3) AS total_omega3,
                  SUM(vitaminC) AS total_vitaminC,
                  SUM(zinc) AS total_zinc
                FROM user_items
                WHERE user_id = ?
                  AND DATE(timestamp) = DATE(?)
                """, (session["user_id"], selected_date), one=True)

  # If results exist, return them as JSON
  # Used AI to search how to return data as JSON
  if rows and any(rows):   # any(rows) checks that at least one nutrient is not NULL
    
    return jsonify({
      "calcium":rows["total_calcium"] or 0,
      "iron":rows["total_iron"] or 0,
      "fiber":rows["total_fiber"] or 0,
      "protein":rows["total_protein"] or 0,
      "magnesium":rows["total_magnesium"] or 0,
      "omega3":rows["total_omega3"] or 0,
      "vitaminC":rows["total_vitaminC"] or 0,
      "zinc":rows["total_zinc"] or 0,
    })
  else:
    # No entries found for that date
    return jsonify(None)
  
  
# Run the app
if __name__=='__main__':
  app.run(debug=True)
