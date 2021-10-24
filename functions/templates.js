exports.handler = async (context, event, callback) => {
  console.log("Frontline Template Callback");
  console.log(JSON.stringify(event));

  callback(null);
};
