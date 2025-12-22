import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChatWindow } from './components/ChatWindow';
import './taskpane.css';

/* global Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    const container = document.getElementById('container');
    if (container) {
      const root = ReactDOM.createRoot(container);
      root.render(<ChatWindow />);
    }
  }
});

