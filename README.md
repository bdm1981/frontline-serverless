# Frontline Integration Service Example

This repository contains an example serverless web application that is required to use [Twilio Frontline](https://www.twilio.com/frontline).

## Prerequisites

- A Twilio Account. Don't have one? [Sign up](https://www.twilio.com/try-twilio) for free!
- Follow the quickstart tutorial [here](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart).
- NodeJS (latest or LTS)
- Twilio CLI - [Setup Instructions](https://www.twilio.com/docs/twilio-cli/quickstart)

## How to start development service

```shell script
# install dependencies
npm install

# copy environment variables
cp example.env .env

# run service
npm start
```

## Environment variables

```
# Twilio account variables
ACCOUNT_SID=ACXXX...
AUTH_TOKEN

# Variables for chat configuration
SMS_NUMBER # Twilio number for incoming/outgoing SMS
WHATSAPP_NUMBER # Twilio number for incoming/outgoing Whatsapp

CUSTOMER_SOURCE=JSON

# OPTIONAL: Twilio Sync
SYNC_SERVICE=
SYNC_CUSTOMER_MAP=

```

## Setting up customers and mapping

The customer data can be configured in `functions/crm.protected.js`.

Quick definition of customer's objects can be found below.

### Map between customer address + worker identity pair.

```js
{
  customerAddress: workerIdentity;
}
```

Example:

```js
const customersToWorkersMap = {
  "whatsapp:+87654321": "john@example.com",
};
```

### Customers list

Example:

```js
const customers = [
  {
    customer_id: 98,
    display_name: "Bobby Shaftoe",
    channels: [
      { type: "email", value: "bobby@example.com" },
      { type: "sms", value: "+123456789" },
      { type: "whatsapp", value: "whatsapp:+123456789" },
    ],
    links: [
      {
        type: "Facebook",
        value: "https://facebook.com",
        display_name: "Social Media Profile",
      },
    ],
    worker: "joe@example.com",
  },
];
```

### Optional Sync configuration

By default the customers list is sourced from the assets/customers.private.json file. This can also be stored in Twilio Sync. To pull contact information from Sync perform the following additional steps:

1. Create a SYNC map in your Twilio account to store the customer data.
1. Populate the Sync map with contact information in the same format referenced above.
1. Update the `.env` file your SYNC_SERVICE, SYNC_CUSTOMER_MAP SIDs.
1. Set the CUSTOMER_SOURCE=SYNC

---

Detailed information can be found in **Quickstart**, provided by Frontline team.
