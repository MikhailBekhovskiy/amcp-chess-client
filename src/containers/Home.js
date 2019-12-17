import React, { useState, useEffect } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default function Home(props) {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!props.isAuthenticated) {
        return;
      }
  
      try {
        const games = await loadGames();
        setGames(games);
      } catch (e) {
        alert(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [props.isAuthenticated]);
  
  function loadGames() {
    return API.get("chess", "/games");
  }

  function renderGamesList(games) {
    return [{}].concat(games).map((game, i) =>
      i !== 0 ? (
        <LinkContainer key={game.gameId} to={`/games/${game.gameId}`}>
          <ListGroupItem header={game.gameId.trim().split("\n")[0]}>
            {"Created: " + new Date(game.createdAt).toLocaleString()}
          </ListGroupItem>
        </LinkContainer>
      ) : (
        <LinkContainer key="new" to="/games/new">
          <ListGroupItem>
            <h4>
              <b>{"\uFF0B"}</b> Create a new game
            </h4>
          </ListGroupItem>
        </LinkContainer>
      )
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p>A sample for the future of online gaming!</p>
      </div>
    );
  }

  function renderGames() {
    return (
      <div className="games">
        <PageHeader>Your games</PageHeader>
        <ListGroup>
          {!isLoading && renderGamesList(games)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {props.isAuthenticated ? renderGames() : renderLander()}
    </div>
  );
}