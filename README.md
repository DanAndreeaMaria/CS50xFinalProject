# NUTRIENT TRACKER

#### DESCRIPTION:
This app is designed to support people who want to build and maintain a healthy lifestyle by keeping track of what they eat and ensuring they include as many essential nutrients as possible in their daily diet. The idea behind it is very simple: the quality of the food we eat shapes not only our physical health but also our energy, mood and long-term well-being. This is why I chose to focus on what science-based books are demonstrating and apply them in a fun and easy way. Each of these food groups is known to support different body functions, from providing fiber for digestion to help maybe women with anemia get the enough amount of iron from diet and not necessarily only from supplements.

When the user first opens the app, six information cards will be seen. Each card represents one of the six food groups and contains an illustrative photo along with a short description of why that group is beneficial. The goal of this introduction is to provide some educational value, so that users understand why it matters to include these foods in their daily meals.

From a technical standpoint, the project combines modern web technologies. I used Bootstrap 5 to create a responsive design, HTML and CSS to handle the structure and JavaScript which takes the logic and makes everything interactive. On the server side, I relied on Python with Flask framework to manage routes, handle user authentication and connect to the database and I used Jinja templating to dynamically render HTML pages. The database is built with SQLite and is stored in a file called food_nutrients.db.

To start using the app, a user first needs to create an account with a unique username, a password and a confirmation of that password. For security reasons, passwords are not stored as plain text, instead, they are hashed before being saved into the database. Once registered, the user can now log in and start tracking their meals. The Flask sessions keeps the login data preserved even if the user closes or reopens the app.

The tracking page is organized into three columns, the left column has a search feature that allows users to find the food items. For now, there is only a list of 50 food items but it can easily be changed or expanded. Users can search by typing one letter to see suggestions or the entire word to locate a specific item. Each item has a default portion size of 100 grams but the quantity can be adjusted by the user. Items can be added or removed from the list. Once the user has done with adding, click on 'Save items' and the food items are stored in the database.

In the middle column, by clicking on 'Result' button, the app calculates the total for other nutrients such as fiber, iron, calcium, magnesium, omega-3, vitamin C, protein, zinc. The results are displayed in a clear, friendly and colorful format so the user can immediately understand their intake. Below these values, are another set of values, 'Portion counts', the app also shows how many portions of each major food category have been logged. To keep results meaningful, the app doesn’t count repeated additions (for example, adding strawberries five times) will not increase the portion count.

Finally, the right column provides a history feature. Users can select a specific date using the calendar input and the app will fetch data from the backend for that specific date. Here is implemented a feedback system, if the user reached a recommended target for a specific nutrient, a success message is shown. If not, the app suggests which nutrient could use improvements. This creates a sense of progress and provides guidance, helping users learn from the data.

#### Project structure:
```
FINAL_PROJECT/
│
├── flask_session # The Flask stores session data for each user in this folder, which allows the app to keep track of logged-in users securely on the server. Even if the folder appears empty, it is used automatically whenever a session is created.
│
├── static/ # Static files (HTML, CSS, JS, images)
│  ├── css/
│     └── track.css # Styles for the track page - even if I used mainly Bootstrap 5, I still needed to change a few colors and styles separately
│
│  ├── js/
│     └── track.js # JavaScript for track page - here I built the logic for the search bar functionality (Search, Add item, Remove item, Save items, change quantity), the logic for the second column which contains the Results of added items and for the third column, History, where nutrient history is fetched for the selected date via backend API and the DOM is updated with feedback messages comparing intake with targets
│
│  └── media/ # In this folder are stored presentation images I used for the project
│     ├── fruit.jpg
│     ├── hero-img.jpg
│     ├── legumes.jpg
│     ├── nuts.jpg
│     ├── seeds.jpg
│     ├── vegetables.jpg
│     └── whole-grains.jpg
│
├── templates/ # In this folder are stored the HTML templates for every page the project needed to be built.
│     ├── index.html # This is an extended HTML template built on top of layout.html and it provides the description section of the home page, more exactly the Bootstrap cards with all the six nutrients (fruit, vegetables, legumes, whole grains, nuts and seeds), each card has an image from the 'static/media/' folder and a short description for the user to read.
│     ├── layout.html # This is the main HTML template of the project. It uses Jinja templating syntax, to dynamically render content for all other pages. It includes external libraries and frameworks like Google Fonts, Bootstrap 5. It defines the navbar which contains navigation links such as ‘Create account’ and ‘Log In/Out’. At the bottom, it also provides a consistent footer across the app.
│     ├── login.html # This is an extended HTML template built on top of layout.html where are represented the 'Log In' form with the inputs for 'Username' and 'Password', the error messages in case the user input is not correct or success message if the input is correct and the button for 'Log In'.
│     ├── register.html # This is an extended HTML template built on top of layout.html where represents the 'Register' form (with username, password and confirm password input fields), the error messages in case the username already exists or the fields are not filled in and the 'Register' button.
│     └── track.html # This is an extended HTML template built on top of layout.html. It represents the main tracking page of the app and ties together all the key functionalities. It links to the custom stylesheet stored in css/track.css for page-specific styling. The layout is divided into three columns: Search column – contains the search input field, a list (<ul>) for displaying search results and the ‘Save items’ button. Result column – includes the ‘Result’ button and a display area where nutrient values and portion counts appear. History column – provides the ‘Check history’ button, a calendar input for selecting dates and scripts that fetch past data from the backend and update the page dynamically.
│
├── app.py # This file contains all the routes and backend logic needed to run the application. It also includes several helper functions for retrieving and processing data from the database.
The main routes are:
Register (/register)
Handles new user registration
Validates that the username, password and confirmation are provided
If input is valid, stores the user in the database with a hashed password
Shows error messages for invalid input or if the username already exists
On success, it redirects to the login page with a confirmation message
Login (/login)
Validates username and password against the database
If successful, starts a new user session (after clearing any previous sessions
Greets the user with a welcome message
Displays errors for invalid login attempts
Logout (/logout)
Clears the current session
Redirects the user back to login page
Track (/track)
Renders the track.html page where users can search, add and save food items
Search (/search)
Fetches food items from the database
Converts database fields into the expected frontend format for the search bar
Save items (/save_items)
Ensures the user is logged in
Extracts the list of items submitted from the frontend
Records each item into the user_items table
Nutrient history (nutrient_history)
Ensures the user is logged in
Retrieves nutrient totals for a specific date selected by the user
Returns the results as JSON, which the frontend uses to display progress and feedback
│
├── food_nutrients.db # This is the SQLite database that stores all the data needed by the application. It contains three main tables:
Food table – stores information about each food item
Fields:  id – unique identifier for each food
	Name – the food name 
	Category – food group
	Serving_size – default portion in grams
	Fiber, iron, protein, alcium, magnesium, omega3, vitaminC, zinc – nutrient values (in grams or miligrams)
User_items table – keeps track of the foods that users log.
Fields: id – unique entry ID
	User_id – links the item to a specific user
	Foos_name – name of the food item
	Quantity – amount consumed
	Fiber, iron, protein, alcium, magnesium, omega3, vitaminC, zinc – nutrient totals for that portion
	Timestamp – the date and time the food was logged
	Foreign key – ensures the entry belongs to a valid user
Users table – stores account information for registered users.
Fields: id – unique identifier for each user
	Username – chosen login name
	Hash – securely stored password (hashed, not plain text)
├── food.csv # The CSV folder (comma separated values) which contains plain-text data about the food items, their category and their nutrient values
│
└── import_csv.py # The helper Python script in the project which role to import data from food.csv to SQLite database food_nutrients.db. This allows the app to transform raw CSV data into a structured format stored in the database so the Flask app can query it efficiently
```




