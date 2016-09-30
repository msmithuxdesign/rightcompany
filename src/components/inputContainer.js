import React, { Component } from 'react';
import classnames from 'classnames';
import InputRow from './inputRow';
// import _ from 'lodash';

export default class InputContainer extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        const handler = this.props.onValueChanged;
        const userDat = this.props.userData;
        return (
                <div className={classnames('query-container', 'row')}>
                    {this.props.categories.map(function(c, i){
                        return <InputRow key={i} title={c} onValueChanged={handler} userValue={userDat[c]} />;
                    })}
                </div>
            );
    }
}
InputContainer.propTypes = { categories: React.PropTypes.array, 
    onValueChanged: React.PropTypes.func, 
    containerLoaded: React.PropTypes.func,
    userData: React.PropTypes.object };
InputContainer.defaultProps = { categories: []};
