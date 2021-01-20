
// defino el objeto raiz


var LT= LT ? LT : {};


function inheritPrototype(childObject, parentObject) {
    // basicamente, el objeto hijo copia a su prototype todas las propiedades del prototipo del padre, pero conserva su propio constructor

    var copyOfParent = Object.create(parentObject.prototype); // devuelve un objetos con las propiedades del pasado por parametro
    copyOfParent.constructor = childObject; // en el paso anterior, se copio parentObject.prototype.contructor ---> a ---> copyOfParent
    // pero nosotros queremos heredar todas las propiedades, excepto el constructor del padre
    // por eso lo reemplazamos por el constructor del hijo

    childObject.prototype = copyOfParent;   // finalmente este es el nuevo prototype del hijo

}


/*  Agregar 3 funciones al prototype para manejar eventos   addEventListener, removeEventListener y dispatchEvent  */

function addEventsHandlingFunctions(obj) {

    obj._listerners=Object.create(null);
    /**
     * Adds an event listener to this Acceleration Module.
     * @param {string} type The name of the command.
     * @param handler The handler for the cmomand. This is called whenever the command is received.
     */
    obj.prototype.addEventListener = function (type, handler) {
        if (!this._listerners) {
            this._listerners = Object.create(null);
        }
        if (!(type in this._listerners)) {
            this._listerners[type] = [handler];
        } else {
            var handlers = this._listerners[type];
            if (handlers.indexOf(handler) < 0) {
                handlers.push(handler);
            }
        }
    }

    /**
     * Removes an event listener from this Acceleration Module.
     * @param {string} type The name of the command.
     * @param handler The handler for the cmomand. This is called whenever the command is received.
     */
    obj.prototype.removeEventListener = function (type, handler) {
        if (!this._listerners) {
            // No listeners
            return;
        }
        if (type in this._listerners) {
            var handlers = this._listerners[type];
            var index = handlers.indexOf(handler);
            if (index >= 0) {
                if (handlers.length == 1) {
                    // Listeners list would be empty, delete it
                    delete this._listerners[type];
                } else {
                    // Remove the handler
                    handlers.splice(index, 1);
                }
            }
        }
    }


    obj.prototype.dispatchEvent = function (event) {
        if (!this._listerners) {
            return true;
        }
        var type = event.type;
        if (type in this._listerners) {
            // Make a copy to walk over
            var handlers = this._listerners[type].concat();
            for (var i = 0, handler; handler = handlers[i]; i++) {
                handler.call(this, event);
            }
        }
    }


}

function getCurrentTime(){
    var d = new Date();
    return d.getTime();
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


//https://gist.github.com/fatihacet/1290216


//http://stackoverflow.com/questions/5527972/how-to-implement-event-driven-javascript-without-involving-any-dom-element
//https://github.com/mroderick/PubSubJS

//http://radio.uxder.com/
//http://amplifyjs.com/api/pubsub/
/*
var pubsub = {};
(function(q) {
    var topics = {}, subUid = -1;
    var objectToken=-1;
    q.subscribe = function(topic, func) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        var token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });
        return token;
    };

    q.publish = function(topic, args) {
        if (!topics[topic]) {
            return false;
        }
        setTimeout(function() {
            var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(topic, args);
            }
        }, 0);
        return true;

    };

    q.unsubscribe = function(token) {
        for (var m in topics) {
            if (topics[m]) {
                for (var i = 0, j = topics[m].length; i < j; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };

    q.getObjectToken =function(){
        return (objectToken++);
    }
}(pubsub));

    */