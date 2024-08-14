# User Data Management System

## Objective
The approach taken is **Indexing**. While it can take time during the app initialization stage, it significantly reduces the time afterwards compared to a linear scan for each API call. 

I assumed that if the file will grow, it will grow from the end. Therefore, I used fs.watch to implement a watch mechanism - if new lines are appended to the data.csv (and saved), it will trigger indexing of them as well.

## Data Structures Used

| Metric  | Data Structure | Rationale                                                      |
|---------|----------------|----------------------------------------------------------------|
| ID      | HashMap        | Unique, endpoint to store                                       |
| Country | HashMap        | No importance for suffix                                        |
| Email   | HashMap        | No importance for suffix                                        |
| Name    | Trie           | Suffix search capabilities                                      |
| Age     | AVL Tree       | Range for being on a certain age                                |

Each data structure has the metric as the key and the id/s as the value. For example, if we want to get all users in a country:

GET /users?country=US
We will get a list of ids and for each we will use `userMap.get(id)`, and return it.

## Key Components

1. **DataManager**: Responsible for indexing and managing all data structures.
   - Handles file reading, indexing, and watching for changes.
   - Manages all data structures (HashMap, Trie, AVL Tree).

2. **UsersModel**: Acts as an interface between the DataManager and the API routes.
   - Provides methods for retrieving and deleting user data.

3. **DateIndex**: Custom class for managing and querying date-of-birth data.
   - Uses an AVL Tree for efficient age-based queries.
   - Provides methods for inserting, deleting, and searching by age.

## Complexity Analysis

- Get user by ID: **O(1)**
- Get users by country: **O(n)**, where n is the total number of users
- Get users by name: **O(m + k)**, where m is the length of the name and k is the number of matching users
- Get users by age: **O(n)**, where n is the total number of users
- Delete user: **O(N)**, where N is the total number of nodes in the name trie


# Guidelines

## Requirements
Use the file `data.csv` as the data source.

Implement the following APIs, using memory only - no external DB.

You can either take the `data.csv` file and create a new project in node.js, or use the attached boilerplate and implement only the logic part in model/users.js.

 **Keep efficiency in mind, the user base (data.csv) can grow exponentially.
Searching the data linearly is not a good enough solution.**

---
```
Get user by Id
    - GET /users/a2ee2667-c2dd-52a7-b9d8-1f31c3ca4eae
    - Should return the requested user details 

Example required response:
{
    "id": "ae8da2bf-69f6-5f40-a5e6-2f1fedb5cea6",
    "name": "Ricardo Wise",
    "dob": "13/1/1973",
    "country": "AE"
}

Get users list by country
    - GET /users?country=US
    - Should return a list of all users from requested country

Get users list by age
    - GET /users?age=30
    - Should return all users which are of age 30 at the time of the request

Get users list by name
    - GET /users?name=Susan
    - Should return all users which name matches the requested name
    - Matching names rules:
        - Full match - for input "Susan James" should return all users with name "Susan James".
        - Full first name or last name - for input "Susan" should return all users with that first or last name.
        - Partial match (minimum 3 chars) - for input "Sus", should return all users with first or last name that begin with "Sus".
        - Should support non case sensitive search (Searching for "susan" should return users with name "Susan").

Example required response for list of users:
[    
    {
        "id": "ae8da2bf-69f6-5f40-a5e6-2f1fedb5cea6",
        "name": "Ricardo Wise",
        "dob": "13/1/1973",
        "country": "AE"
    }
]

Delete user by id
    - DELETE /users/a2ee2667-c2dd-52a7-b9d8-1f31c3ca4eae
    - Should delete the user, after the call the user will not be returned by any of the previous APIs.
```

---

## Using boilerplate
In order to use this project as a template, please implement the missing methods in the `model/users.js` file.

### Install node
Follow the instructions here:
https://nodejs.org/en/download/

### Start up the service
```
npm install
node index.js
```