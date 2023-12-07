import React from "react";
import ReactDOM from "react-dom";
import {Provider} from 'react-redux'
import store from './app/store'
import App from "./components/App";
import "semantic-ui-css/semantic.min.css";
import "./index.css";
import Modal from 'react-modal';
import {BrowserRouter} from "react-router-dom"

// Set the app element for react-modal
Modal.setAppElement('#root');

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
    , document.getElementById("root"));
