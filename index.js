'use strict';

const sendGenericToAll = require('lunchbot');


const Alexa = require('ask-sdk');
// use 'ask-sdk' if standard SDK module is installed

function isSlotValid(request, slotName){
    var slot = request.intent.slots[slotName];
    console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
    var slotValue;

    //if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        //we have a value in the slot
        slotValue = slot.value;
        return slotValue;
    } else {
        //we didn't get a value in the slot.
        return false;
    }
}

// Code for the handlers here

const tellMessageHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'doTellMessage'
    },
    handle(handlerInput) {
        console.log(handlerInput);
        console.log(handlerInput.requestEnvelope.request.intent);
        console.log(handlerInput.requestEnvelope.request.dialogState);
        console.log("Getting MQ");
        let messageQuery = isSlotValid(handlerInput.requestEnvelope.request, "messageQuery");
        if(!messageQuery) {
            var response = handlerInput.responseBuilder
                .addDelegateDirective().getResponse();
            console.log(response);
            return response;
        }
        console.log("Getting Name");
        let targetName = handlerInput.requestEnvelope.request.intent.slots.targetName.value;

        const speechResponse = 'Ok, I\'ll tell '+ targetName + ' ' + messageQuery + '.';
        console.log('tellMessage Received');
        sendGenericToAll(messageQuery, targetName);
        return handlerInput.responseBuilder
            .speak(speechResponse).getResponse();
    }
};

const kickLunchBotHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'kickLunchBot';
    },
    handle(handlerInput) {
        const speechText = 'Ok, I\'m kicking the lunch bot now.';
        console.log('kicked by alexa!!');
        sendGenericToAll('Ouch, alexa just kicked me!', 'everyone');
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Kicked Lunchbot', speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        tellMessageHandler,
        kickLunchBotHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
