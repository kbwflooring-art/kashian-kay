exports.handler = async function(event) {
  var headers = {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"};
  if(event.httpMethod==="OPTIONS") return {statusCode:200,headers,body:""};
  try {
    var input = event.queryStringParameters && event.queryStringParameters.input;
    if(!input) return {statusCode:400,headers,body:JSON.stringify({error:"No input"})};
    var key = process.env.GOOGLE_MAPS_API_KEY;
    if(!key) return {statusCode:500,headers,body:JSON.stringify({error:"No key"})};

    // Try Places API (New) first
    var res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key
      },
      body: JSON.stringify({
        input: input,
        includedRegionCodes: ["us"],
        includedPrimaryTypes: ["street_address","premise","subpremise"]
      })
    });
    var data = await res.json();
    
    if(data.suggestions && data.suggestions.length) {
      var suggestions = data.suggestions.map(function(s){
        return s.placePrediction && s.placePrediction.text && s.placePrediction.text.text;
      }).filter(Boolean);
      return {statusCode:200,headers,body:JSON.stringify({suggestions:suggestions})};
    }

    // Fallback to old Places API
    var url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+encodeURIComponent(input)+"&components=country:us&types=address&key="+key;
    var res2 = await fetch(url);
    var data2 = await res2.json();
    var suggestions2 = (data2.predictions||[]).map(function(p){return p.description;});
    return {statusCode:200,headers,body:JSON.stringify({suggestions:suggestions2,status:data2.status,error_message:data2.error_message})};

  } catch(e) {
    return {statusCode:500,headers,body:JSON.stringify({error:e.message})};
  }
};
