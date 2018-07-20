//use 'esversion: 6'
class server {
    constructor(host, port){
        this.ws = new WebSocket('ws://' + host + ':' + port);

        this.ws.onerror = function (event) {this.error(event);};
        this.ws.onmessage = function (event) {this.recievemessage(event);};
        this.ws.onopen = function (event) {this.open(event);};
        this.ws.onclose = function (event) {this.close(event);};
    }
    open(event){//conection made
        console.log("connection opened");
    }
    close(event){//conection closed
        console.log("connection closed");
    }
    error(event){//conection closed
        console.error("WEBSOCKED CONNECTION ERROR" + event);
    }
    recievemessage(event){
        try{
            let data = JSON.parse(event.data);//parse json data
        }catch(e){console.error("ERROR PARSING RECIEVED MESSAGE: " + e );}
        
    }

    send(object){
        if(this.ws.readyState == 1){//check if connection is open
            this.ws.send(JSON.stringify(object));
        } else{
           console.error("ERROR TRIED SENDING TO CLOSED CONNECTION");
        }
    }

}