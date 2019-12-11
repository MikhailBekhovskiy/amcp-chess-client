import React, { useState } from "react";
import { API } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { useFormFields } from "../libs/hooksLib";
import "./Login.css";

export default function NewGame(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    time: ""
  });

  function validateForm() {
    return Number.isInteger(+fields.time);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      await createGame(fields);
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
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="time" bsSize="large">
          <ControlLabel>Time</ControlLabel>
          <FormControl
            autoFocus
            type="textarea"
            value={fields.time}
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