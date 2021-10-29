exports.handler = async (context, event, callback) => {
  console.log("Frontline Routing Callback");
  console.log(JSON.stringify(event));

  // Load local JSON file
  const customersToWorkersFile =
    Runtime.getAssets()["/customersToWorkerMap.json"].open;
  const customersToWorkersMap = JSON.parse(customersToWorkersFile);

  const twilioClient = context.getTwilioClient();

  const conversationSid = event.ConversationSid;
  const customerNumber = event["MessagingBinding.Address"];

  const findWorkerForCustomer = async (customerNumber) =>
    customersToWorkersMap[customerNumber];

  const findRandomWorker = async () => {
    const onlyUnique = (value, index, self) => {
      return self.indexOf(value) === index;
    };

    const workers = Object.values(customersToWorkersMap).filter(onlyUnique);
    const randomIndex = Math.floor(Math.random() * workers.length);

    return workers[randomIndex];
  };

  const routeConversation = async () => {
    let workerIdentity = await findWorkerForCustomer(customerNumber);
    console.log("worker: ", workerIdentity);

    if (!workerIdentity) {
      // Customer doesn't have a worker

      // Select a random worker
      workerIdentity = await findRandomWorker();

      // Or you can define default worker for unknown customers.
      // workerIdentity = 'john@example.com'

      if (!workerIdentity) {
        console.warn(
          "Routing failed, please add workers to customersToWorkersMap or define a default worker",
          { conversationSid: conversationSid }
        );
        return;
      }
    }
    await routeConversationToWorker(conversationSid, workerIdentity);
  };

  const routeConversationToWorker = async (conversationSid, workerIdentity) => {
    // Add worker to the conversation with a customer
    twilioClient.conversations
      .conversations(conversationSid)
      .participants.create({ identity: workerIdentity })
      .then((participant) =>
        console.log("Create agent participant: ", participant.sid)
      )
      .catch((e) => console.log("Create agent participant: ", e));
  };

  await routeConversation(conversationSid, customerNumber);
  callback(null);
};
