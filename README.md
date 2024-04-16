# @anonacy/api

## About
Anonacy's v2 api enables simplified control over a [Postal](https://docs.postalserver.io/) open-source mail server. 

It is designed for email aliasing, by managing the 'Routing' system within Postal, while Postal handles the mail forwarding between smtp servers. 

It works by utilizing direct mySQL queries in Postal's database, as well as using puppeteer for more complex interactions.

You can use the [@anonacy/app](https://github.com/anonacy/app) project as a UI for the api.

## Authorization

Uses the credentials system within postal to generate api keys. These automatically scope to the org & server within postal. Use header: `Authorization: Bearer APIKEY` or the [@anonacy/app](https://github.com/anonacy/app)

## Documentation

Full api documentation can be found here:
https://api2.anonacy.com/docs/ or by running your own instance and navigating to the `/docs` route in a browser.

## Installation

To host the api yourself, follow the guide in [install.md](./INSTALL.md)

***

Built by hew🪶

