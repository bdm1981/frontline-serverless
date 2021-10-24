// Example:
//     {
//         'whatsapp:+12345678': 'john@example.com'
//     }
const customersToWorkersMap = [{ "+18153073121": "bmcallister@twilio.com" }];

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

const routeConversation = async (
  conversationSid,
  customerNumber,
  twilioClient
) => {
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
  await routeConversationToWorker(
    conversationSid,
    workerIdentity,
    twilioClient
  );
};

const routeConversationToWorker = async (
  conversationSid,
  workerIdentity,
  twilioClient
) => {
  // Add worker to the conversation with a customer
  twilioClient.conversations
    .conversations(conversationSid)
    .participants.create({ identity: workerIdentity })
    .then((participant) =>
      console.log("Create agent participant: ", participant.sid)
    )
    .catch((e) => console.log("Create agent participant: ", e));
};

exports.handler = async (context, event, callback) => {
  const twilioClient = context.getTwilioClient();
  console.log("Frontline Routing Callback");
  console.log(JSON.stringify(event));

  const conversationSid = event.ConversationSid;
  const customerNumber = event["MessagingBinding.Address"];

  await routeConversation(conversationSid, customerNumber, twilioClient);
  callback(null);
};
