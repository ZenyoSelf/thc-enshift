i will use sqlite3 as it is straightforward and doesn't need to install anything.
i'll use bcrypt for basic hashing.

My approach is to put the inittables inside the start routine, so that if i need to adapt the DB, no need to run another script everytime (less things to do in the future)

Testings 
      ✔ should register a new user (222ms)
      ✔ should not register with invalid email
      ✔ should not register with no lastName
      ✔ should not register with no firstName
      ✔ should not register with short password
      ✔ should not register duplicate email (201ms)

      