exports.handler = async (context, event, callback) => {
  console.log("outgoingConversationCallbackHandler");
  console.log("event: ", event.Location);

  const location = event.Location;

  const handleGetProxyAddress = () => {
    console.log("Getting Proxy Address");
    const channelName = event.ChannelType;

    const proxyAddress = getCustomerProxyAddress(channelName);
    console.log("proxy address: ", proxyAddress);

    // In order to start a new conversation ConversationsApp need a proxy address
    // otherwise the app doesn't know from which number send a message to a customer
    if (proxyAddress) {
      console.log("Got proxy address!");
      callback(null, { proxy_address: proxyAddress });
      return;
    }

    console.log("Proxy address not found");
    callback("403");
  };

  const getCustomerProxyAddress = (channelName) => {
    if (channelName === "whatsapp") {
      return context.WHATSAPP_NUMBER;
    } else {
      return context.SMS_NUMBER;
    }
  };

  // Location helps to determine which action to perform.
  switch (location) {
    case "GetProxyAddress": {
      handleGetProxyAddress();
      return;
    }

    default: {
      console.log("Unknown location: ", location);
      callback("422");
    }
  }
};
