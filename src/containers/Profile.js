import React, { useState, useEffect } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default function Home(props) {
  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!props.isAuthenticated) {
        return;
      }
  
      try {
        const parties = await loadParties();
        console.log("parties:", parties);
        setParties(parties);
      } catch (e) {
        alert(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [props.isAuthenticated]);
  
  function loadParties() {
    return API.get("chess", "/profile/parties");
  }

  function renderPartiesList(parties) {
    return [].concat(parties).map((party, i) =>
    <div key={party.createdAt}>
      <ListGroupItem  header={party.gameId}>
        {"Created: " + new Date(party.createdAt).toLocaleString() + '|' +
        party.user1Id + '|' + party.user2Id + '|' + party.winner}
      </ListGroupItem>
      </div>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <p>Here are your parties!</p>
      </div>
    );
  }

  function renderParties() {
    return (
      <div className="parties">
        <PageHeader>Your Parties</PageHeader>
        <ListGroup>
          {!isLoading && renderPartiesList(parties)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {props.isAuthenticated ? renderParties() : renderLander()}
    </div>
  );
}