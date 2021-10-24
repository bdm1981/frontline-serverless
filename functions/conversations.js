exports.handler = async (context, event, callback) => {
  console.log("Frontline Conversations Callback");
  console.log(JSON.stringify(event));

  callback(null);
};
