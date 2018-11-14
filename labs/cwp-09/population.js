const Promise = require('bluebird');
const axios = require('axios');

let totalPopulation = 0;

// Task 1.1

axios.get('http://api.population.io:80/1.0/population/2017/Belarus/')
    .then((response) => {
        response.data.forEach((data) => {
            totalPopulation += data.total;
        })
    })
    .then(() => console.log(totalPopulation))
    .catch((err) => {
        console.log(`Error while loading population info: ${err}`);
    });


// Task 1.2
let urls = [
    'http://api.population.io:80/1.0/population/2017/Canada/',
    'http://api.population.io:80/1.0/population/2017/Germany/',
    'http://api.population.io:80/1.0/population/2017/France/'
];

let females = 0;
let males = 0;

Promise.all([
    axios.get(urls[0]),
    axios.get(urls[1]),
    axios.get(urls[2])
])
    .then(response => {
        response.forEach((country) => {
            country.data.forEach(data => {
                females += data.females;
                males += data.males;
            })
        })
        console.log(`females: ${females}\nmales: ${males}`);
    })
    .catch((err) => {
        console.log(`Error while loading population info: ${err}`);
    });

// Task 1.3
urls = [
    'http://api.population.io:80/1.0/population/2014/Belarus/',
    'http://api.population.io:80/1.0/population/2015/Belarus/'
];

Promise.any([
    axios.get(urls[0]),
    axios.get(urls[1])
])
    .then(response => {
        response.data.forEach(data => {
            if (data.age == 25) {
                console.log(`year: ${data.year}`)
                console.log(`females: ${data.females}`)
                console.log(`males: ${data.males}`)
            }
        })
    })
    .catch((err) => {
        console.log(`Error while loading population info: ${err}`);
    });

// Task 1.4

Promise.props({
    maleGreece: axios.get(`http://api.population.io:80/1.0/mortality-distribution/Greece/male/49y2m/today/`),
    femaleGreece: axios.get(`http://api.population.io:80/1.0/mortality-distribution/Greece/female/49y2m/today/`),
    maleTurkey: axios.get(`http://api.population.io:80/1.0/mortality-distribution/Turkey/male/49y2m/today/`),
    femaleTurkey: axios.get(`http://api.population.io:80/1.0/mortality-distribution/Turkey/female/49y2m/today/`)
}).then((result) => {
    console.log('Age of men with the highest mortality in Greece: ');
    getMaxMortalityDistributionAge(result['maleGreece'].data.mortality_distribution);

    console.log('Age of women with the highest mortality in Greece: ');
    getMaxMortalityDistributionAge(result['femaleGreece'].data.mortality_distribution);

    console.log('Age of men with the highest mortality in Turkey:: ');
    getMaxMortalityDistributionAge(result['maleTurkey'].data.mortality_distribution);

    console.log('Age of women with the highest mortality in Turkey:: ');
    getMaxMortalityDistributionAge(result['femaleTurkey'].data.mortality_distribution);
}).catch((err) => {
    console.log(`Error while loading population info: ${err}`);
});

// Task 1.5

axios.get('http://api.population.io:80/1.0/countries')
    .then(response => {
        return response.data.countries.splice(0, 5);
    })
    .then(result => {
        Promise.map(result, (country) => {
            return axios.get(`http://api.population.io:80/1.0/population/2007/${country}`)
        })
            .then(responses => {
                responses.forEach(response => {
                    getCountryInfo(response);
                })
            })
            .catch((err) => {
                console.log(`Error while mapping population info: ${err}`);
            });
    })
    .catch((err) => {
        console.log(`Error while loading population info: ${err}`);
    });

function getCountryInfo(country) {
    let total = 0;
    console.log(`Country: ${country.data[0].country}`);
    country.data.forEach(country => {
        total += country.total;
    })
    console.log(`Total population: ${total}`);
}

function getMaxMortalityDistributionAge(md) {
    let max = 0, age;
    md.forEach(data => {
        if (data.mortality_percent > max) {
            max = data.mortality_percent;
            age = data.age;
        }
    });
    console.log(age);
    console.log();
}

