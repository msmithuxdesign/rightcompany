import React, { Component } from 'react';
import Slider from 'react-rangeslider';
import classnames from 'classnames';

export default class InputRow extends Component {
    constructor(props, context) {
        super(props, context);
        /* this.state = {
            value: 5 
        }; */
    }

    handleChange = (event) => {
        console.log(this.props.userValue);
        this.props.onValueChanged(this.props.title, event.target.value);
    }

    render() {
        
        return (
                <div className={classnames('col-xs-12', 'col-md-6')}>
                    <div className="query-title">{this.props.title}</div>
                    <input 
                      id="typeinp" 
                      type="range" 
                      min="0" max="10" 
                      value={this.props.userValue} 
                      onChange={this.handleChange.bind(this)}
                      step="1"/>
                    <div className='input-value'>Value: {this.props.userValue}</div>
                </div>
            );
    }
}

React.PropTypes.RadarChart = {
    title: React.PropTypes.string.isRequired,
    onValueChanged: React.PropTypes.func.isRequired,
    userValue: React.PropTypes.number
};