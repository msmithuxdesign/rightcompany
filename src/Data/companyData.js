import * as _ from 'lodash';


export function readData(filename){
    let data = require('dsv!./companyData.csv');
    let companies = {};
    let companyRead = false;
    let companyKeys = [];
    let topics = [];
    data.forEach(function(d, i){
        let keys = Object.keys(d);
        //check if companies contains the company name
        //if not add the company to copanies
        //we only need to do this once
        if(!companyRead){
            keys.forEach(function(k){
                if(k !== 'category' && k !== 'topic' && k !== ''){
                    if(!_.has(companies, k)){
                        companyKeys.push(k,{});
                    }
                }
            });
            companyRead = true;
            companies = _.zipObject(companyKeys, {});
        }

        //look up the company name, add the topic
        // assign to category the value and the category
        topics.push(d.topic);
        _.forIn(companies, function(value, key){
            let tmpObj = _.zipObject([d.topic], {});
            tmpObj[d.topic] = {category: d.category, value: parseInt( _.pick(d, [key])[key], 10)};
            value =_.merge(value, tmpObj);
            companies[key] = value;
            if(value === null || typeof value === 'undefined'){
                console.log('null value for: '+key+' topic: '+d.topic);
            }
        });

    });
    
    return {companies: companies, categories: _.uniq(topics)};
};
