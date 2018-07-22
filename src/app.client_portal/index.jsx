import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import 'es7-object-polyfill';
import '../shared/lib/object.polyfill';

import store from './store';

import Login from './components/pages/login';
import Register from './components/pages/register';
import Dashboard from './components/pages/dashboard';
import Orders from './components/pages/orders';
import Products from './components/pages/products';
import Customers from './components/pages/customers';
import Settings from './components/pages/settings';
import Marketplace from './components/pages/marketplace';
import ForgotPassword from './components/pages/forgot_password';
import ResetPassword from './components/pages/reset_password';

ReactDOM.render(
  (
    <Provider store={store}>
      <Router>
        <div>
          <Route path="/account/orders" component={Orders} />
          <Route path="/account/dashboard" component={Dashboard} />
          <Route path="/account/products" component={Products} />
          <Route path="/account/customers" component={Customers} />
          <Route path="/account/marketplace" component={Marketplace} />
          <Route path="/account/settings" component={Settings} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
        </div>
      </Router>
    </Provider>
  ),
  document.getElementById('app'),
);
