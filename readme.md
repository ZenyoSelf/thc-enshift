separated client and server.
made client with angular cli.

FRONTEND :

Frontend will use material, ngx-toastr and jwt for sessions.
generated module and components with ng generate.
auth will be the routing.
all of essentials (core) part of the frontend is in core, including the service and the guard for verification.
Dashboard is the logged on page, which includes a logout button.
I used interfaces, as it is cleaner and has a better maintanability in the future (especially for cross technologies projects).

I did a "folder name routing" in a sense that every thing has a parent named after it.
This is to side more with the Angular way of naming things, to have a better Developer Experience. 
For states, i like to use RXJS, even if in this context it might be overkill, i prefer to use it as soon as possible.



BACKEND:

i will use sqlite3 as it is straightforward and doesn't need to install anything.
i'll use bcrypt for basic hashing.
I did a simple middleware for the profile, at first i wanted to use it for session (remember Me).
My approach is to put the initTables inside the start routine, so that if i need to adapt the DB, no need to run another script everytime (less things to do in the future)