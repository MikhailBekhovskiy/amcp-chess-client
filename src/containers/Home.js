import React, { useState, useEffect } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default function Home(props) {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [whiteStat, setWhiteStat] = useState(0.0);
  const [blackStat, setBlackStat] = useState(0.0);

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

  function loadWStat(){
    return parseFloat(API.get("chess", "/whitestat").body);
  }

  function loadBStat(){
    return parseFloat(API.get("chess", "/blackstat").body);
  }
  
  async function updateStatistics(){
    const whiteStat = await loadWStat();
    setWhiteStat(whiteStat);
    const blackStat = await loadBStat();
    setBlackStat(blackStat);
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

  function renderStatistics(whiteStat, blackStat){
    return <div>{"Statistics for white: " + whiteStat} <br/>{"Stastistics for black: "+ blackStat}</div>;
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
        <PageHeader>Games</PageHeader>
        <ListGroup>
          {!isLoading && renderGamesList(games)}
        </ListGroup>
      </div>
    );
  }

  return (
    <>
      <div className="Home">
        {props.isAuthenticated ? renderGames() : renderLander()}
      </div>
      <button onClick = {updateStatistics}>Click me for statistics</button>
      <div>{renderStatistics(whiteStat, blackStat)}</div>
    </>
  );
}