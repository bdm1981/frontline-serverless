exports.handler = async (context, event, callback) => {
  const customerFile = Runtime.getAssets()["/customers.json"].open;
  const customers = JSON.parse(customerFile());

  const twilioClient = context.getTwilioClient();
  const location = event.Location;

  // Fetch Customer Details based on his ID
  // and information about a worker, that requested that information
  const handleGetCustomerDetailsByCustomerIdCallback = async () => {
    console.log("Getting Customer details: ", event.CustomerId);

    const customerId = event.CustomerId;

    let customerDetails;
    if (context.CUSTOMER_SOURCE == "SYNC") {
      await twilioClient.sync
        .services(context.SYNC_SERVICE)
        .syncMaps(context.SYNC_CUSTOMER_MAP)
        .syncMapItems.list({ limit: 30 })
        .then((items) => {
          items.forEach((item) => {
            if (item.data.customer_id == customerId) {
              customerDetails = item.data;
            }
          });
        });
    } else if (context.CUSTOMER_SOURCE == "JSON") {
      customerDetails = customers.find(
        (customer) => customer.customer_id == customerId
      );
    }

    if (customerDetails) {
      // Respond with Contact object
      callback(null, {
        objects: {
          customer: {
            customer_id: customerDetails.customer_id,
            display_name: customerDetails.display_name,
            channels: customerDetails.channels,
            links: customerDetails.links,
            avatar: customerDetails.avatar,
            details: customerDetails.details,
          },
        },
      });
    } else {
      // If no customers match the provided id, return an empty customer object
      callback(null, { objects: { customers: {} } });
    }
  };

  const handleGetCustomersListCallback = async (customers = []) => {
    console.log("Getting Customers list");

    const workerIdentity = event.Worker;
    const pageSize = event.PageSize;
    const anchor = event.Anchor || 1;

    if (context.CUSTOMER_SOURCE == "SYNC") {
      customers = await twilioClient.sync
        .services(context.SYNC_SERVICE)
        .syncMaps(context.SYNC_CUSTOMER_MAP)
        .syncMapItems.list({ limit: pageSize * anchor })
        .then((items) => items.map((item) => item.data));
    }

    // Respond with Customers object
    callback(null, {
      objects: {
        customers: customers,
      },
    });
  };

  // Location helps to determine which information was requested.
  // CRM callback is a general purpose tool and might be used to fetch different kind of information

  switch (location) {
    case "GetCustomerDetailsByCustomerId": {
      await handleGetCustomerDetailsByCustomerIdCallback(customers);
      break;
    }
    case "GetCustomersList": {
      await handleGetCustomersListCallback(customers);
      break;
    }

    default: {
      console.log("Unknown location: ", location);
      callback(`Unknown location: ${location}`);
    }
  }
};
