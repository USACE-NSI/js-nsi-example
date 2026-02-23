/**
 * Represents a single Feature Property (the metadata)
 */
class NSIProperties {
    constructor(props) {
        // Identifiers
        this.fd_id = props.fd_id;
        this.bid = props.bid;
        
        // Building Characteristics
        this.occtype = props.occtype;
        this.st_damcat = props.st_damcat;
        this.bldgtype = props.bldgtype;
        this.found_type = props.found_type;
        this.sqft = Number(props.sqft);
        this.num_story = props.num_story;
        this.found_ht = props.found_ht;
        
        // Financials
        this.val_struct = props.val_struct;
        this.val_cont = props.val_cont;
        this.val_vehic = props.val_vehic;
        
        // Geolocation / Elevation
        this.x = props.x;
        this.y = props.y;
        this.ground_elv = props.ground_elv; // in feet
        this.ground_elv_m = props.ground_elv_m; // in meters
        
        // Demographics
        this.pop_stats = {
            amu65: props.pop2amu65,
            amo65: props.pop2amo65,
            pmu65: props.pop2pmu65,
            pmo65: props.pop2pmo65
        };
        
        // Other Metadata
        this.cbfips = props.cbfips;
        this.med_yr_blt = props.med_yr_blt;
        this.firmzone = props.firmzone;
    }

    // Example Helper: Calculate total value
    getTotalValue() {
        return this.val_struct + this.val_cont + this.val_vehic;
    }
}

/**
 * Represents a single GeoJSON Feature
 */
class GeoFeature {
    constructor(feature) {
        this.type = "Feature";
        this.geometry = {
            type: feature.geometry.type,
            coordinates: [...feature.geometry.coordinates] // [lng, lat]
        };
        this.properties = new NSIProperties(feature.properties);
    }
}

/**
 * Main Store to hold the FeatureCollection
 */
class FeatureCollectionStore {
    constructor(jsonData) {
        this.type = "FeatureCollection";
        this.features = jsonData.features.map(f => new GeoFeature(f));
    }

    // Find a building by ID
    getById(fd_id) {
        return this.features.find(f => f.properties.fd_id === fd_id);
    }
}

async function downloadNSIJson() {
    const url = "https://www.hec.usace.army.mil/fwlink/?linkid=1&type=string";//'https://nsi.sec.usace.army.mil/nsiapi/structures?bbox=-81.58418,30.25165,-81.58161,30.26939,-81.55898,30.26939,-81.55281,30.24998,-81.58418,30.25165';
    let nsiurl = "";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        nsiurl = await response.text() + "structures?bbox=-81.58418,30.25165,-81.58161,30.26939,-81.55898,30.26939,-81.55281,30.24998,-81.58418,30.25165";
    }catch (error) {
        console.error('fwlink failed:', error);
    }
    try {
      console.log("Downloading structures from: " +  nsiurl)
      const response = await fetch(nsiurl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const buildingStore = new FeatureCollectionStore(data);

      // Access data
      const firstBuilding = buildingStore.features[0];
      console.log("Structure count " + buildingStore.features.length); // "862W7C7M+5WP-0-0-0-0"

      // Use the helper method
      const totalVal = firstBuilding.properties.getTotalValue();
      console.log(`Total Value: $${totalVal.toLocaleString()}`);
      
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
  
  downloadNSIJson();