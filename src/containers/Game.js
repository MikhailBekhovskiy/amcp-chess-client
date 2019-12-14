import React, {useState} from "react";
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
  let [messages, setMessages] = useState([])

  function validateForm() {
    return text.length > 0;
  }

  function MessagesContainer(props) {
    return (
      <div>
        {props.messages.map((message) =>
          <div className="message">{message}</div>)}
      </div>
    )
  }

  let socket;

  function connectToWebSocket() {      
    let webSocketConnection = config.apiGateway.WS;
    console.log(webSocketConnection);
    socket = new WebSocket(webSocketConnection);
    socket.onmessage = function(event) {
      setMessages(messages.concat(event.data));
    };
    socket.onerror = function(event) {
        console.error("WebSocket error observed:", event);
    };
  }

  function sendMessage() {
    let payload = { "action": "onMessage", "message": text };
    socket.send(JSON.stringify(payload));
  }

  function disconnect() {
    socket.close();
  }

  async function leaveGame() {
    console.log("gameId:", `${props.match.params.id}`);
    props.userHasJoinedGame(false);
    await API.del("chess", `/games/${props.match.params.id}`);
    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
    // setMessages(messages.concat(text));
  }

  connectToWebSocket();

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