const handleGetProxyAddress = (context, event, callback) => {
  console.log("Getting Proxy Address");

  const body = event;
  const workerIdentity = body.Worker;
  const customerId = body.CustomerId;
  const channelName = body.ChannelType;
  const channelAddress = body.ChannelValue;

  const proxyAddress = getCustomerProxyAddress(context, channelName);
  console.log("proxy address: ", proxyAddress);

  // In order to start a new conversation ConversationsApp need a proxy address
  // otherwise the app doesn't know from which number send a message to a customer
  if (proxyAddress) {
    callback(null, { proxy_address: proxyAddress });
    console.log("Got proxy address!");
    return;
  }

  console.log("Proxy address not found");
  callback("403");
};

const getCustomerProxyAddress = (context, channelName) => {
  if (channelName === "whatsapp") {
    return context.whatsapp_number;
  } else {
    return context.sms_number;
  }
};

exports.handler = async (context, event, callback) => {
  console.log("outgoingConversationCallbackHandler");
  console.log("event: ", event.Location);

  const location = event.Location;

  // Location helps to determine which action to perform.
  switch (location) {
    case "GetProxyAddress": {
      handleGetProxyAddress(context, event, callback);
      return;
    }

    default: {
      console.log("Unknown location: ", location);
      callback("422");
    }
  }
};
