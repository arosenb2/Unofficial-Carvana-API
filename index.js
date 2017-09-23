const request = require('request-promise');
const _ = require('lodash');
const BodyStyles = require('./enums/BodyStyles');
const FuelTypes = require('./enums/FuelTypes');

const generateRequestOptions = (options = {}) => {
  Object.assign({
    bodyStyles: BodyStyles.ALL,
    fuelTypes: FuelTypes.ALL,
    minPrice: 10000,
    maxPrice: 20000,
    zipCode: 30305
  }, options);

  const { bodyStyles, fuelTypes, minPrice, maxPrice, zipCode } = options;

  let payload = {
    sortBy: "LowestPrice",
    pagination: {
      page: 1,
      pageSize: 10000
    },
    filters: {
      bodyStyles,
      fuelTypes,
      price: {
        min: minPrice,
        max: maxPrice
      }
    },
    searchContext: {
      mostPopularSortOption: 1,
      geolocationInfo: {
        location: {
          zip5: zipCode
        }
      }
    }
  };

  if (options.bodyStyles === BodyStyles.ALL) {
    delete payload.filters.bodyStyles;
  }

  if (options.fuelTypes === FuelTypes.ALL) {
    delete payload.filters.fuelTypes;
  }

  return payload;
};

const getVehicles = (options = {}) => {
  const requestOptions = generateRequestOptions(Object.assign({ fuelTypes: FuelTypes.ALL, bodyStyles: BodyStyles.ALL }, options));
  return request({
    uri: "https://www.carvana.com/api/v1/inventory",
    method: "POST",
    body: JSON.stringify(requestOptions),
    transform: JSON.parse,
    headers: {
      // The only authentication they have is requiring a non ROBOTS User-Agent
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.91 Safari/537.36'
    }
  }).then(json => {
    const { inventory } = json;
    console.log(`Found ${inventory.pagination.totalMatchedInventory} Cars`);
    return inventory.vehicles;
  }).catch(err => {
    console.log(err);
  });
};

const vehicleIsHybrid = vehicle => vehicle.model.includes(/Hybrid|Prius|Niro|Ioniq/);
const filterToHybrids = vehicles => {
  console.log(`Filtering down to Hybrids...`);
  return vehicles.filter(vehicleIsHybrid);
};

const filterToNonPendingPurchase = vehicles => {
  console.log(`Removing pending purchases...`);
  return vehicles.filter(vehicle => ! vehicle.isPendingPurchase);
};

const debug = vehicles => vehicles.map(vehicle => console.log(vehicle) && vehicle);

const transformVehicleJSON = vehicle => ({
  make: vehicle.make,
  model: vehicle.model,
  trim: vehicle.trim,
  mileage: vehicle.mileage,
  year: vehicle.year,
  sku: vehicle.stockNumber,
  totalCost: Number(vehicle.price.total) + (Number(vehicle.price.transportCost) || 0)
});

const average = (vehicles, key) => Math.floor(_.meanBy(vehicles, v => v[key]));
const groupByMakeAndModel = vehicles => _.groupBy(vehicles, vehicle => `${vehicle.make} ${vehicle.model}`);

getVehicles({ bodyStyles: BodyStyles.SEDAN })
  .then(filterToNonPendingPurchase)
  .then(vehicles => vehicles.map(transformVehicleJSON))
  .then(vehicles => {
    console.log(`Found ${vehicles.length} Vehicles`);
    const grouped = groupByMakeAndModel(vehicles);
    Object.keys(grouped).map(type => {
      const filtered = grouped[type];
      console.log('--------------------------')
      console.log(`${type}: ${filtered.length} car(s)`)
      console.log(`Average Year: ${average(filtered, 'year')}`)
      console.log(`Average Mileage: ${average(filtered, 'mileage')}`)
      console.log(`Average Cost: ${average(filtered, 'totalCost')}`)
    });
  });
