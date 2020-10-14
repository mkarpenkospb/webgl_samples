import React from 'react';
import ReactDOM from 'react-dom';

import { ViewArea } from './ViewArea.jsx';

import './styles.css';

function App () {
  return (
    <div className='App' style={{width: "100%",height: "100vh"}}>
      <ViewArea />
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
