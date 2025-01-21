i will use sqlite3 as it is straightforward and doesn't need to install anything.
i'll use bcrypt for basic hashing.

My approach is to put the inittables inside the start routine, so that if i need to adapt the DB, no need to run another script everytime (less things to do in the future)