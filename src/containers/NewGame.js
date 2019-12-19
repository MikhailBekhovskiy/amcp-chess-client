import React, { useState } from "react";
import { API } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { useFormFields } from "../libs/hooksLib";
import "./NewGame.css";

export default function NewGame(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    roomType: ""
  });

  function validateForm() {
    // return fields.time.length && Number.isInteger(+fields.roomType);
    return fields.roomType === "hidden" || fields.roomType === "open" || fields.roomType === "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      let body = {roomType: fields.roomType.length > 0 ? fields.roomType : "open"}
      let game = await createGame(body);
      props.history.push("/games/" + game.gameId);
    } catch (e) {
      alert(e.message);
      setIsLoading(false);
    }
  }

  function createGame(game) {
    return API.post("chess", "/games", {
      body: game
    });
  }

  return (
    <div className="NewGame">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="roomType" bsSize="large">
          <ControlLabel>Open or hidden</ControlLabel>
          <FormControl
            autoFocus
            type="textarea"
            value={fields.roomType}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </form>
    </div>
  );
}