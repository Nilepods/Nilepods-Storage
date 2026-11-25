import { Component } from 'react';

// Base class for pages converted from Claude Design.
// A page's Logic class keeps its state with this.state / this.setState (normal React)
// and returns everything its template needs from renderVals(). The generated View
// function turns those values into markup.
export default class DCLogic extends Component {
  render() {
    return this.props.view(this.renderVals());
  }
}
