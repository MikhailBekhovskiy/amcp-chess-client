import React, { useState, useEffect, useRef } from "react";
import { Prompt } from "react-router";
import { API } from "aws-amplify";
import "./Game.css";
import config from "../config";
import { FormGroup, FormControl } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

export default function Game(props) {
  const [isLoading, setIsLoading] = useState(false);
  props.userHasJoinedGame(true);

  const [text, setText] = useState("");
  let [messages, setMessages] = useState([]);
  const socket = useRef(null);
  const [connectionId, setConnectionId] = useState('');
  
  useEffect(() => {
    function connectToWebSocket() {
      socket.current = new WebSocket(config.apiGateway.WS);
      socket.current.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log("New message:", event);
        switch (data.action) {
        case "getConnectionId": 
          setConnectionId(data.connectionId);
          break;
        case "sendMessage":
          setMessages(messages.concat(data.message));
          break;
        default:
          setMessages(messages.concat("Unknown socket message:", JSON.stringify(data)));
        }
      };
      socket.current.onerror = (event) => {
        console.error("WebSocket error observed:", event);
      };  
    }
    function sendGameId() {
      sendToWebsocket({action: "send-gameid", gameId: `${props.match.params.id}`});
    }

    function getConnectionId() {
      sendToWebsocket({action: "getConnectionId"})
    }

    function sendIdentity() {
      await API.post("chess", `/games/${props.match.params.id}`, {
        body: {
          connectionId: connectionId,
        },
      });
    }

    async function onLoad() {
      try {
        connectToWebSocket();
        sendGameId();
        getConnectionId();
        sendIdentity();
      } catch (e) {
        alert(e);
      }
    }

    onLoad();
  }, [messages, props.match.params.id, socket]);



  function validateForm() {
    return text.length > 0;
  }

  function MessagesContainer(props) {
    return (
      <div>
        {props.messages.map((message, i) =>
          <div className="message" key={("message-"+i)}>{message}</div>)}
      </div>
    )
  }

  async function sendToWebsocket(body) {
    if (!socket.current.readyState) {
      setIsLoading(true);
      setTimeout(() => {
        sendToWebsocket();
      }, 100);
    }
    else {
      socket.current.send(JSON.stringify(body));
      setIsLoading(false);
    }
  }

  function sendMessage() {
    let body = {
      "action": "send-message",
      "message": text,
    };
    sendToWebsocket(body);
  }

  async function disconnect() {
    await API.put("chess", `/games/${props.match.params.id}`, {
      body: {
        connectionId: connectionId,
      },
    }); 
    socket.current.close();
  }

  async function leaveGame() {
    await disconnect();
    console.log("gameId:", `${props.match.params.id}`);
    props.userHasJoinedGame(false);
    await API.del("chess", `/games/${props.match.params.id}`);
    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <>
      <div className="Game">
        <Prompt
          when={true}
          message={leaveGame}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="content">
          <FormControl
            value={text}
            componentClass="textarea"
            onChange={e => setText(e.target.value)}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          bsStyle="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Send
        </LoaderButton>
      </form>
      <MessagesContainer messages={messages}/>
    </>
  )
}