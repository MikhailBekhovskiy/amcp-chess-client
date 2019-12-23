import React from "react";
import { FormGroup, FormControl } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Chat.css"

export default function Chat(props) {
    return (
      <div className="Chat">
        <MessagesContainer messages={props.messages}/>
        <form onSubmit={props.handleSubmit}>
          <FormGroup controlId="text">
            <FormControl
              value={props.text}
              componentClass="textarea"
              onChange={props.textOnChange}
              style={{overflow:"hidden"}}
            />
          </FormGroup>
          <LoaderButton
            block
            type="submit"
            bsSize="large"
            bsStyle="primary"
            isLoading={props.isLoading}
            disabled={props.disabled}
          >
            Send
          </LoaderButton>
        </form>
      </div>
    )
  }
  
  function MessagesContainer(props) {
    return (
      <div className="MessagesContainer">
        {props.messages.map((message, i) =>
          // <div className="ChatMessage" key={("message-"+i)}>{message}</div>
          <ChatMessage key={("message-"+i)} message={message}/>
        )}
      </div>
    )
  }
  
  function ChatMessage(props) {
    return (
      <div className="ChatMessage">
        {/* <div className="header">
          <div className="author">
            {props.message.author}  
          </div>
        </div> */}
        <div className="body">
          <div className="text">
            {props.message}
          </div>
        </div>
      </div>
    )
  }