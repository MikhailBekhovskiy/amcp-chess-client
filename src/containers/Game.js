import React, {useState} from "react";
import { Prompt } from "react-router";
import { API } from "aws-amplify";
import { Button } from "react-bootstrap";
import "./Game.css"

export default function Game(props) {
  props.userHasJoinedGame(true);

  async function leaveGame() {
    console.log('gameId:', `${props.match.params.id}`);
    props.userHasJoinedGame(false);
    await API.del("chess", `/games/${props.match.params.id}`);
    return true;
  }

  let [messages, setMessages] = useState([])


  function MessagesContainer(props) {
    return (
      <div>
        {props.messages.map((message) =>
          <div className="message">{message}</div>)}
      </div>
    )
  }

  function handleClick() {
    setMessages(messages.concat('test message'))
  }

  return (
    <>
      <div className="Game">
        <Prompt
          when={true}
          message={leaveGame}
        />
      </div>
      <MessagesContainer messages={messages}/>
      <Button onClick={handleClick}/>
    </>
  )
}