import React from "react";
import { Prompt } from "react-router";
import { API } from "aws-amplify";
import "./Game.css";
import config from "../config";
import { FormGroup, FormControl } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

function MessagesContainer(props) {
  return (
    <div className="MessagesContainer">
      {props.messages.map((message, i) =>
        <div className="ChatMessage" key={("message-"+i)}>{message}</div>)}
    </div>
  )
}

class Game extends React.Component {
  constructor(props) {
    props.userHasJoinedGame(true);
    super(props);

    this.state = {
      isLoading: false,
      text: "",
      move: "",
      moves: [],
      messages: [],
      socket: null,
    }

    // binding
    this.connectToWebSocket = this.connectToWebSocket.bind(this);
    this.validateMessageForm = this.validateMessageForm.bind(this);
    this.validateMoveForm = this.validateMoveForm.bind(this);
    this.sendToWebsocket = this.sendToWebsocket.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendInfo = this.sendInfo.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendMove = this.sendMove.bind(this);
  }

  componentDidMount() {
    this.connectToWebSocket();
    this.sendInfo();
  }

  connectToWebSocket() {
    let socket = new WebSocket(config.apiGateway.WS);
    socket.onmessage = (event) => {
      let data = JSON.parse(event.data);
      console.log("New message:", event);
      switch (data.action) {
      case "sendMessage":
        this.setState((state, props) => {
          return {messages: state.messages.concat(data.message)};
        });
        break;
      case "move":
        this.setState((state, props) => {
          return {moves: state.moves.concat(data.move)};
        });
      default:
        this.setState((state, props) => {
          return {messages: state.messages.concat("Unknown socket message:", JSON.stringify(data))};
        });
      }
    }

    socket.onerror = (event) => {
      console.error("WebSocket error observed:", event);
    }

    this.setState({
      socket: socket
    })
  }

  validateMessageForm() {
    return this.state.text.length > 0;
  }

  validateMoveForm() {
    return this.state.move.length > 0;
  }

  async sendToWebsocket(body) {
    if (!this.state.socket.readyState) {
      this.setState({ isLoading: true });
      setTimeout(() => {
        this.sendToWebsocket(body);
      }, 100);
    }
    else {
      this.state.socket.send(JSON.stringify(body));
      this.setState({ isLoading: false });
    }
  }

  sendMessage() {
    let body = {
      "action": "propagateMessage",
      "message": this.state.text,
      "gameId": `${this.props.match.params.id}`,
    };
    this.sendToWebsocket(body);
  }

  async sendInfo() {
    if (!this.state.socket) {
      this.setState({ isLoading: true });
      setTimeout(() => {
        this.sendInfo();
      }, 100);
    }
    else {
      let body = {
        "action": "send-gameid",
        "gameId": `${this.props.match.params.id}`,
      };
      await this.sendToWebsocket(body);
      await API.post("chess", `/games/${this.props.match.params.id}`, {
        body: {
          gameId: `${this.props.match.params.id}`,
        },
      });
      this.setState({ isLoading: false });
    }
  }

  async disconnect() {
    await API.del("chess", `/games/${this.props.match.params.id}`, {
      body: {
        gameId: `${this.props.match.params.id}`,
      },
    });
    if (this.state.socket) {
      this.state.socket.close();
    }
  }

  async leaveGame() {
    await this.disconnect();
    this.props.userHasJoinedGame(false);
    return true;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.sendMessage();
  }

  sendMove(event) {
    event.preventDefault();
    let body = {
      action: "makeMove",
      move: this.state.move,
      gameId: `${this.props.match.params.id}`
    }
    this.sendToWebsocket(body);
  }

  render() {
    return (
      <>
        <Prompt
          when={true}
          message={this.leaveGame}
        />
        <div className="Chat">
          <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="content">
              <FormControl
                value={this.state.text}
                componentClass="textarea"
                onChange={e => this.setState({text: e.target.value})}
              />
            </FormGroup>
            <LoaderButton
              block
              type="submit"
              bsSize="large"
              bsStyle="primary"
              isLoading={this.state.isLoading}
              disabled={!this.validateMessageForm()}
            >
              Send
            </LoaderButton>
          </form>
          <MessagesContainer messages={this.state.messages}/>
        </div>
        
        <div className="Moves">
          <form onSubmit={this.sendMove}>
            <FormGroup controlId="content">
              <FormControl
                value={this.state.move}
                componentClass="textarea"
                onChange={e => this.setState({move: e.target.value})}
              />
            </FormGroup>
            <LoaderButton
              block
              type="submit"
              bsSize="large"
              bsStyle="primary"
              isLoading={this.state.isLoading}
              disabled={!this.validateMoveForm()}
            >SendMove
            </LoaderButton>
          </form>
          <div>{this.state.moves}</div>
        </div>
      </>
    )
  }
}

export default Game;