import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import NavBar from "./component/layout/NavBar";
import Footer from "./component/layout/Footer";
import Landing from "./component/layout/Landing";
import Login from "./component/auth/Login";
import Register from "./component/auth/Register";
import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <NavBar />

          <Route exact path="/" component={Landing} />

          <div className="container">
            <Route exat path="/login" component={Login} />
            <Route exat path="/Register" component={Register} />
          </div>

          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
