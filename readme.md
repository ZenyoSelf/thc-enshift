
# Take Home Challenge - Arnaud Soltermann

### This is my submission for the Take Home Challenge

  

Before starting, check that you have **node 22** installed, **angular-cli** and **cypress**.  

## Setup

- Clone the repo.
- inside the auth-app folder, open a terminal and write the following.

		npm run install:all

- After it's done, add the .env file for the server, at the root of the folder and create an auth.db file :

		
		server
		│ src
		│ .env
		│ auth.db
		

Inside the .env there needs to be two value :

- PORT, this will be server port. this value should be 3200. if you want to use another port, you need to update it inside the client **environment.ts** file.

- JWT_SECRET, this will be used for the token validity verification, use whatever you'd like.

  

Once that's done, you can run these commands on two terminals :

		npm run start:server

		npm run start:client
  

And voilà !

The app should be running at http://localhost:4200

  

## Tests

  

### Backend

  

Units testing is run with :

		npm run test:server

The result should be displayed in your IDE -> Tests results.

If it doesn't, it is displayed inside your terminal.

  

### Frontend

For cypress, you can either choose headless, or standard cypress with it's GUI.

  

GUI version :

		npm run test:client-e2e

  

When you want to have the headless tests results, you need to have the server running.

Then you can run this in another terminal :

		npm run test:client-e2e-headless

If it isn't working, here's a simple fix :

- run the client and server on different terminals.
- go into the client folder with another terminal, and run :
		npm run e2e:headless

If test fails, screenshots will appear in the cypress folder.

## Architectural Decisions

  

I like to keep it simple and fast, i chose to build this app with these technologies :

 1. Frontend
 - Angular/PrimeNG for UI components, coupled with Tailwind
 - Reactive forms for validation
 - Auth interceptor for token management
 - Route guards for protected paths
 - Observable pattern for auth state
 - Standalone components

 2. Backend
- SQLite3 for simplicity and zero-config database
- Express middleware pattern for auth checks
- Bcrypto for hashing and JWT for stateless authentication
- Ethereal email for testing without SMTP setup


 3. Testing:
- Mocha / Chai for unit testing backend
- Cypress for e2e frontend testing
- Test isolation with database cleanup
- Mocked email service

 4. Project Structure:
- Monorepo with client/server separation
- Feature-based organization
- TypeScript for type safety
- Environment-specific configurations


## Train of thoughts

  

I made some notes during this adventure, it is not grammatically checked or even make sense, but i would like to share it as it can help see how i arrived at this state of a product.

  
### Notes

separated client and server.

made client with angular cli.

  


I used TS, as it is cleaner and has a better maintainability in the future (especially for cross technologies projects).

Frontend will use PrimeNG and jwt for sessions.

generated module and components with ng generate.

divided main routing and auth.

all of essentials (core) part of the frontend is in core, including auth service, token service and the guard for verification.

Dashboard is the logged on page, which includes a logout function (top right avatar, submenu).

For states, i generally like to use RXJS, even if in this context it might be overkill, i prefer to use it as soon as possible, as shown in the authService.

I did a custom validator in regex for the email, as the one from angular doesnt check for a dot (for some reason).

At first i went for angular material, as i had only used react these past months, but i .

I switched to PrimeNG, as it is what i'm familiar with, and it also has a lot of components that are easy to use and customize.


I chose SQLite3 as it is straightforward and doesn't need to install anything.

I implemented bcrypt for basic hashing.

nodemailer for the password recovery flow.

I did a simple middleware for the profile, at first i wanted to use it for session (remember Me).

My approach is to put the initTables inside the start routine, so that if i need to adapt the DB, no need to run another script everytime (fewer things to do in the future)

  

So i started with the Frontend, i overviewed what's new about Angular 19 rapidly and decided to not go through the ssr path, as Balazs told me Enshift wasn't using it.

I firstly went for an Angular Material framework, which was a bad idea to start with, but i wasn't sure where to go for at this point, as i only used react in the past months.

After having a file structure (login, signup & dashboard), i swapped angular material with PrimeNG, which i have already used in the past.

They have a great list of components with extensible customization and is easily set up.

I also implemented Tailwind with it, just to have a better DX with layout.

  

At this point i had to start thinking about what will the backend look like.

Went for a basic 3 endpoints (more in the future, for password recovery path) for login, register and profile.

Login and register is pretty straightforward.

  

Now for the DB init, i decided to put the InitTables inside, to have a way to easily create or update tables and data in the future. This reduces maintainability drastically.

  

profile is a way to handle the expiration of the token. for this project, i did not implement a refresh token, so it will be a simple logout when it's due.

at this point, i did not think about the email service at all, so i simply started doing the database with sqlite3, one controller for the auth manipulation and a basic router.

I choosed bcrypt for hashing passwords.

i will implement .env in the future, i want to have 1 env for both projects, will see if i have enough time for such things, otherwise i'll just explain the steps on how to run the dev setup.

After scratching my head multiple times with the JWT, guard and the auth service, i finally have a persistent login system.

Being confident with the fact that it "works", i spent some time having a flat look and feel of the app. Added a Toast for future notifications, button with some animation, worked on the responsiveness of it and more.

  

At this point i saw that i was missing data validation in an UX-way, so i put some small display when information was missing or wrong in different pages.

I saw a weird thing with the Validators.email from angular, as i could use something like aa@at as an email, so i used Regex for it (didn't want to spend more time on why it was happening).

  

Before tests, i decided to do the password recovery flow, i knew i was going to have problem with the testing of it (need to manually go to the logged link for the token), but even so, i started working on it.

2 new endpoints was created, the forgot-password and reset-password.

One handles the token generation aswell as the mailService, and the other one is for the row update.

  

As testing purposes, i went for Ethereal as an SMTP provider, and nodemailer.

Nodemailer is easy to use, and ethereal is the perfect one to have a dev build.

  

After extensive tests, i was happy with the global result.

It was time to do the tests.

  

I went for cypress for the frontend, and simple mocha/chai tests for the backend.

I don't believe in unit testing for frontend, i want these tests to be fully simulated inside a browser.

Cypress is the perfect choice for this, due to it's large amount of browser engines implementation (Webkit, Chromium, Gecko, ...)