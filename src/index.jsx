import 'normalize.css';
import React from 'react';
import { render } from 'react-dom';
import { Spin } from 'antd';
import App from './app/App';

const loading = <Spin tip="Loading local data..." />;

render(<App />, document.querySelector('#root'));
