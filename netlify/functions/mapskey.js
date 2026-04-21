exports.handler = async function(event) {
  return {
    statusCode: 200,
    headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},
    body: JSON.stringify({key: process.env.GOOGLE_MAPS_API_KEY||""})
  };
};
