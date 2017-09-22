var https = require('https')

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to an Alexa Skill, this is running on a deployed lambda function", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`);

        switch(event.request.intent.name) {
          case "GetConcertsByArtist":
            var endpoint = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=go53tCLErqRjlAQ9ZkKDOIUoNHOAl20a&keyword=" + event.request.intent.slots.artist.value + "&classificationName=music" // ENDPOINT GOES HERE
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                console.log(`In callback`);
                var data = JSON.parse(body)
                var date = data._embedded.events[0].dates.start.localDate
                var city = data._embedded.events[0]._embedded.venues[0].city.name
                var artist = data._embedded.events[0]._embedded.attractions[0].name
                console.log(`Generating Response`);
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`The next event scheduled for ${artist} is on ${date} in ${city}`, true),
                    {}
                  )
                )
              })
            })
            break;

          case "GetConcertsInCity":
            var endpoint = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=go53tCLErqRjlAQ9ZkKDOIUoNHOAl20a&city="+ event.request.intent.slots.city.value + "&classificationName=music" // ENDPOINT GOES HERE
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var city = data._embedded.events[0]._embedded.venues[0].city.name
                
                var artist0 = data._embedded.events[0]._embedded.attractions[0].name
                var artist1 = data._embedded.events[1]._embedded.attractions[0].name
                var artist2 = data._embedded.events[2]._embedded.attractions[0].name
                
                var date0 = data._embedded.events[0].dates.start.localDate
                var date1 = data._embedded.events[1].dates.start.localDate
                var date2 = data._embedded.events[2].dates.start.localDate
                
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`The upcoming concerts in ${city} are ${artist0} on ${date0}, ${artist1} on ${date1}, and ${artist2} on ${date2}`, true),
                    {}
                  )
                )
              })
            })
            break;
            
            case "GetConcertsOnDate":
            var myDate = event.request.intent.slots.date.value
            var endpoint = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=go53tCLErqRjlAQ9ZkKDOIUoNHOAl20a&startDateTime="+myDate+"T00:00:00Z&endDateTime="+myDate+"T23:59:59Z&classificationName=Music" // ENDPOINT GOES HERE
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var myDate = event.request.intent.slots.date.value
                var artist = data._embedded.events[0]._embedded.attractions[0].name
                var city = data._embedded.events[0]._embedded.venues[0].city.name

                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`A concert on ${myDate} is ${artist} in ${city}`, true),
                    {}
                  )
                )
                
                
              })
            })
            break;
            
        case "GetConcerts":
            var endpoint = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=go53tCLErqRjlAQ9ZkKDOIUoNHOAl20a&classificationName=music" // ENDPOINT GOES HERE
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var event =data._embedded.events[0].name
                 var city = data._embedded.events[0]._embedded.venues[0].city.name
                 var myDate = data._embedded.events[0].dates.start.localDate
                
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`There is ${event}  in ${city} on ${myDate} `, true),
                    {}
                  )
                )
              })
            })
            break;

         
        case "GetConcertsByArtistInCity":
            var artist = event.request.intent.slots.artist.value
            var city = event.request.intent.slots.city.value
            var endpoint = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=go53tCLErqRjlAQ9ZkKDOIUoNHOAl20a&keyword=" + artist + "&city=" + city+ "&classificationName=music" // ENDPOINT GOES HERE
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var event = data._embedded.events[0].name
                var venue = data._embedded.events[0]._embedded.venues[0].name
                var myDate = data._embedded.events[0].dates.start.localDate
                
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`There is ${event} in ${venue} on ${myDate}`, true),
                    {}
                  )
                )
              })
            })
            break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}