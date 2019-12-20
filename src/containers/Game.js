import React from "react";
import { Prompt } from "react-router";
import { API } from "aws-amplify";
import "./Game.css";
import config from "../config";
import { FormGroup, FormControl } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import Chat from "../components/Chat";
import ChessBoard from "react-chess";
import ChessGame from "chess.js";

const lineup = ['R@h1', 'P@f2', 'q@d8', 'R@a1', 'P@a2', 'P@c2', 'b@c8', 'p@d7', 'Q@d1', 'n@g8']

// from fen
//        ...
// to ['R@h1', 'P@f2', 'q@d8', ...]
function transformNotation(fenNotation) {
  var result = [];
  let figures = fenNotation.split(' ')[0];
  let lines = figures.split('/');
  var skipped = 0;
  lines.forEach((line, i) => {
    skipped = 0;
    [...line].forEach((piece, j) => {
      if (piece >= '0' && piece <= '8') {
        skipped += parseInt(piece) - 1;
      }
      else {
        const position = String.fromCharCode(j + 97 + skipped) + (8 - i).toString();
        result.push(piece + '@' + position);
      }
    })
  });
  return result;
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
      messages: [
        // {author: "Author", text: "Hello world"},
      ],
      socket: null,
      chess: null,
      pieces: []
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
    this.submitSend = this.submitSend.bind(this);
    this.sendMove = this.sendMove.bind(this);
    this.onMovePiece = this.onMovePiece.bind(this);

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
      case "gameOver":
      case "move":
        this.setState((state, props) => {
          return {moves: state.moves.concat(data.move)};
        });
        let chessCopy = this.state.chess;
        chessCopy.move(data.move, {sloppy: true});
        this.setState({
          chess: chessCopy,
          pieces: transformNotation(chessCopy.fen()),
        })
        break;
      case "gameStarted":
        this.setState({
          chess: new ChessGame()
        });
        break;
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

  submitSend(event) {
    event.preventDefault();
    this.sendMove(this.state.move);
  }

  sendMove(move) {
    let body = {
      action: "makeMove",
      move: move,
      gameId: `${this.props.match.params.id}`
    }
    this.sendToWebsocket(body);
  }

  onMovePiece(piece, fromSquare, toSquare) {
    console.log(fromSquare, toSquare);
    let chessCopy = this.state.chess;
    if (chessCopy.move(fromSquare + toSquare, {sloppy: true})) {
      this.sendMove(fromSquare + toSquare);
    }
    this.setState({
      chess: chessCopy
    })
  }

  render() {
    return (
      <div className="Game">
        <Prompt
          when={true}
          message={this.leaveGame}
        />

        <div className="BoardWrapper">
          <ChessBoard pieces={
            this.state.chess
            ? transformNotation(this.state.chess.fen())
            : ChessBoard.getDefaultLineup()
            }
            onMovePiece={this.onMovePiece}/>
        </div>

        <div className="Forms">
          <Chat messages={this.state.messages}
                handleSubmit={this.handleSubmit}
                text={this.state.text}
                textOnChange={e => this.setState({text: e.target.value})}
                isLoading={this.state.isLoading}
                disabled={!this.validateMessageForm()}
          />
          
          <div className="Moves">
            <form onSubmit={this.submitSend}>
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
        </div>
      </div>
    )
  }
}

export default Game;