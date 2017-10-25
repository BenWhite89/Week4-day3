Continuing lab 16, add a Users table to your database
Each user should have an id, email, and name
Modify your Chirps table to require a relationship to a user (Every chirp must have a user that sent it)
Add a few users to the database
In the Chirp form on the front-end, add an HTML select box (drop-down box) to select the user for the chirp
The box options should display the names of the users, but have values of the ids of the users
The box options should be populated from a GET request to get the users
When you post a chirp, you will also need to send along the id of the selected user
So you will be dropping the user column and getting a userId column