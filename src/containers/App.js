import d3 from 'd3';
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import RadarChart from '../components/radar/radar';
import DevTools from './DevTools';
import InputContainer from '../components/inputContainer';
import { dataUpdated } from '../actions/index';

class App extends React.Component {
    constructor(props) {
        super(props);

        const margin = {top: 100, right: 100, bottom: 100, left: 100},
                width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
                height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
                    
        this.radarChartOptions = {
              w: width,
              h: height,
              margin: margin,
              maxValue: 0.5,
              levels: 5,
              roundStrokes: true,
             // color: color
        };
    }

    render() {
        return (
          <div className='container-fluid'>
            <div className={classnames('radarchart-conainer', 'col-sm-12', 'col-md-8')}>
              <RadarChart id='.radarchart-conainer' data={this.props.companyData} 
                options={this.radarChartOptions} categories={this.props.categories} userData={this.props.userData}/>
            </div>
            <div className={classnames('col-md-4', 'myBox', 'container-fluid')}>
              <InputContainer categories={this.props.categories} 
                containerLoaded={this.props.onContainerLoaded} 
                onValueChanged={this.props.onValueChanged}
                userData={this.props.userData} />
            </div>
            <DevTools />
          </div>
    );
  }
}

 /** <InputContainer categories={this.categories} /> **/

function mapStateToProps(state) {
  return {
    data : state.reducer.phoneData,
    categories: state.reducer.companyData.categories,
    companyData: state.reducer.companyData.companies,
    userData: state.reducer.userData
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onValueChanged: (cat, value) => {
      dispatch(dataUpdated(cat, value))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
