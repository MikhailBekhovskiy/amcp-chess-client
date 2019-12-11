import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import AppliedRoute from "./components/AppliedRoute";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NewGame from "./containers/NewGame";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";


export default function Routes({ appProps }) {
  return (
    <Switch>
      <AppliedRoute path="/" exact component={Home} appProps={appProps} />
      <UnauthenticatedRoute path="/login" exact component={Login} appProps={appProps} />
      <UnauthenticatedRoute path="/signup" exact component={Signup} appProps={appProps} />
      <AuthenticatedRoute path="/games/new" exact component={NewGame} appProps={appProps} />
      { /* Finally, catch all unmatched routes */ }
      <Route component={NotFound} />
    </Switch>
  );
}