import React, { useState, useEffect } from "react";
import { PageHeader, ListGroup, ListGroupItem, Button } from "react-bootstrap";
import { API } from "aws-amplify";
import Modal from 'react-modal';
// import "./Home.css";

export default function Profile(props) {
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
    
    function Party(props) {
      const [show, setShow] = useState(false);
      const handleClose = () => setShow(false);
      const handleShow = () => setShow(true);
      let party = props.party;
      return (
      <>
        <Button onClick={handleShow}>
          <ListGroupItem  header={party.gameId}>
            {"Created: " + new Date(party.createdAt).toLocaleString() + '|' +
            party.user1Id + '|' + party.user2Id + '|' + party.winner}
          </ListGroupItem>
        </Button>
        <Modal show={show} onHide={handleClose} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
      )
    }

    return [].concat(parties).map((party, i) =>
      <Party party={party} key={party.createdAt}/>
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