import { combineReducers } from "redux";
import { applyMiddleware } from "redux";
import { createStore } from "@reduxjs/toolkit";
// import rootReducer from "./reducers";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

/* IMPORT THE REDUCERS */
import { provider, tokens, exchange } from "./reducers";

const reducer = combineReducers({
  providers: provider,
  token: tokens,
  exchange: exchange,
});

const initialState = {};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
