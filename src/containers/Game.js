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

  useEffect(() => {
    function connectToWebSocket() {      
      let webSocketConnection = config.apiGateway.WS;
      socket.current = new WebSocket(webSocketConnection);
      socket.current.onmessage = (event) => {
        setMessages(messages.concat(event.data));
      };
      socket.current.onerror = (event) => {
        console.error("WebSocket error observed:", event);
      };
      sendGameId();
    }
    async function sendGameId() {
      if (!socket.current.readyState) {
        setIsLoading(true);
        setTimeout(() => {
          sendGameId();
        }, 100);
      }
      else {
        socket.current.send(JSON.stringify({
          "action": "send-gameid",
          "gameId": `${props.match.params.id}`,
        }));
        setIsLoading(false);
      }
    }

    async function onLoad() {
      try {
        connectToWebSocket();
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

  async function sendMessage() {
    if (!socket.current.readyState) {
      setIsLoading(true);
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
    else {
      socket.current.send(JSON.stringify({
        "action": "send-message",
        "message": text,
        "gameId": `${props.match.params.id}`,
      }));
      setIsLoading(false);
    }
  }

  function disconnect() {
    socket.current.close();
  }

  async function leaveGame() {
    disconnect();
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