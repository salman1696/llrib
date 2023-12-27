import React, { useState } from 'react';
import { initialState, reducer } from './store/reducers/reducer';

export const AppContext = React.createContext(initialState);

export const AppProvider = ({ children }) => {

    const [state, dispatch] = React.useReducer(reducer, initialState);
    return (
        <AppContext.Provider value={[state, dispatch]} >
            {children}
        </AppContext.Provider>
    )
}