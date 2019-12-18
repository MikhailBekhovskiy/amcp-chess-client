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
  const [move, setMove] = useState("");
  const [lastMove, setLastMove] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  function connectToWebSocket() {
    socket.current = new WebSocket(config.apiGateway.WS);
    socket.current.onmessage = (event) => {
      let data = JSON.parse(event.data);
      console.log("New message:", event);
      console.log(messages);
      switch (data.action) {
      case "sendMessage":
        setMessages(messages.concat(data.message));
        break;
      case "move":
        setLastMove(data.move);
      default:
        setMessages(messages.concat("Unknown socket message:", JSON.stringify(data)));
      }
    }; 
    socket.current.onerror = (event) => {
      console.error("WebSocket error observed:", event);
    };  
  }

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

  const sendToWebsocket = async (body) => {
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
      "gameId": `${props.match.params.id}`,
    };
    sendToWebsocket(body);
  }

  async function sendInfo() {
    let body = {
      "action": "send-gameid",
      "gameId": `${props.match.params.id}`,
    };
    await sendToWebsocket(body);
    await API.post("chess", `/games/${props.match.params.id}`, {
      body: {
        gameId: `${props.match.params.id}`,
      },
    });
  }

  async function disconnect() {
    await API.del("chess", `/games/${props.match.params.id}`, {
      body: {
        gameId: `${props.match.params.id}`,
      },
    });
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
  function SendMove(event) {
    event.preventDefault();
    let body = {
      action: "makeMove",
      move: move,
      gameId: `${props.match.params.id}`
    }
    sendToWebsocket(body);

  }

  return (
    <>
      <Prompt
        when={true}
        message={leaveGame}
      />
      <div className="Forms">
        <div className="Chat">
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
            <LoaderButton
              block
              bsSize="large"
              bsStyle="danger"
              onClick={sendInfo}
              isLoading={isLoading}
            >
              Send info
            </LoaderButton>
            <LoaderButton
              block
              bsSize="large"
              bsStyle="danger"
              onClick={connectToWebSocket}
              isLoading={isLoading}
            >
              Connect
            </LoaderButton>
          </form>
          <MessagesContainer messages={messages}/>
        </div>
        
        <div className="Moves">
          <form onSubmit={SendMove}>
            <FormGroup controlId="content">
              <FormControl
                value={move}
                componentClass="textarea"
                onChange={e => setMove(e.target.value)}
              />
            </FormGroup>
            <LoaderButton
              block
              type="submit"
              bsSize="large"
              bsStyle="primary"
              isLoading={isLoading}
              disabled={!validateForm()}
            >SendMove
            </LoaderButton>
          </form>
          <div>{lastMove}</div>
        </div>
      </div>
    </>
  )
}