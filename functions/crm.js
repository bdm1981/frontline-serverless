// const getCustomerByNumber = async (customerNumber) => {
//   return customers.find((customer) =>
//     customer.channels.find(
//       (channel) => String(channel.value) === String(customerNumber)
//     )
//   );
// };

const handleGetCustomerDetailsByCustomerIdCallback = async (
  context,
  event,
  callback,
  twilioClient
) => {
  const body = event;
  console.log("Getting Customer details: ", body.CustomerId);

  const workerIdentity = body.Worker;
  const customerId = body.CustomerId;

  // Fetch Customer Details based on his ID
  // and information about a worker, that requested that information
  let customerDetails = {};
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
};

const handleGetCustomersListCallback = async (
  context,
  event,
  callback,
  twilioClient
) => {
  console.log("Getting Customers list");

  const workerIdentity = event.Worker;
  const pageSize = event.PageSize;
  const anchor = event.Anchor || 1;

  let customers = await twilioClient.sync
    .services(context.SYNC_SERVICE)
    .syncMaps(context.SYNC_CUSTOMER_MAP)
    .syncMapItems.list({ limit: pageSize * anchor })
    .then((items) => items.map((item) => item.data));

  // Respond with Customers object
  callback(null, {
    objects: {
      customers: customers,
    },
  });
};

exports.handler = async (context, event, callback) => {
  const twilioClient = context.getTwilioClient();
  const location = event.Location;
  // Location helps to determine which information was requested.
  // CRM callback is a general purpose tool and might be used to fetch different kind of information

  switch (location) {
    case "GetCustomerDetailsByCustomerId": {
      await handleGetCustomerDetailsByCustomerIdCallback(
        context,
        event,
        callback,
        twilioClient
      );
      break;
    }
    case "GetCustomersList": {
      await handleGetCustomersListCallback(
        context,
        event,
        callback,
        twilioClient
      );
      break;
    }

    default: {
      console.log("Unknown location: ", location);
      callback(`Unknown location: ${location}`);
    }
  }
};
