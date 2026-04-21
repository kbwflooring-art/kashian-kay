exports.handler = async function(event) {
  var headers = {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"};
  if(event.httpMethod==="OPTIONS") return {statusCode:200,headers,body:""};
  try {
    var input = event.queryStringParameters && event.queryStringParameters.input;
    if(!input) return {statusCode:400,headers,body:JSON.stringify({error:"No input"})};
    var key = process.env.GOOGLE_MAPS_API_KEY;
    if(!key) return {statusCode:500,headers,body:JSON.stringify({error:"No key"})};
    var url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+encodeURIComponent(input)+"&components=country:us&types=address&key="+key;
    var res = await fetch(url);
    var data = await res.json();
    var suggestions = (data.predictions||[]).map(function(p){return p.description;});
    return {statusCode:200,headers,body:JSON.stringify({suggestions:suggestions})};
  } catch(e) {
    return {statusCode:500,headers,body:JSON.stringify({error:e.message})};
  }
};
