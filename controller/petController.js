const Pet = require("../model/Pet");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const ObjectId = require("mongoose").Types.ObjectId;

//handling errors
const handleErrors = (err) => {
  console.log(`error massage: ${err.message}`);
  console.log(`error code: ${err.code}`);

  let errors = { massaga: [] };

  //incorect email
  if (err.message === "unvalid jwt token") {
    errors.massaga = "unable to verify user";
  }
  //incorect petID
  if (err.message === "unvalid petID") {
    errors.massaga = "unable to verify your petID";
  }
  //user not found by given id
  if (err.message === "user not found") {
    errors.massaga = "user not found";
  }
  //location not provided
  if (err.message === "location undefined") {
    error.massaga = "couldn't get location";
  }
  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.createPet_post = async (req, res) => {
  const {
    name,
    species,
    race,
    age,
    gender,
    vaccine_card,
    tags,
    lng,
    lat,
    city,
    country,
  } = req.body;

  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;

  try {
    const ownerID = await jwtMiddleware.jwtVerifier(token, secret);
    if (ownerID) {
      const pet = await Pet.create({
        ownerID,
        name,
        species,
        race,
        age,
        gender,
        vaccine_card,
        tags,
        lng,
        lat,
        city,
        country,
      });
      res.status(201).json({ created: true });
    } else {
      throw Error("unvalid jwt token");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

module.exports.readPet_get = async (req, res) => {
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  try {
    const ownerID = await jwtMiddleware.jwtVerifier(token, secret);
    if (ownerID) {
      Pet.find({ ownerID: ownerID }, (err, pets) => {
        if (err) throw Error(err);
        res.status(200).json(pets);
      });
    } else {
      throw Error("unvalid jwt token");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

module.exports.petUpdate_post = async (req, res) => {
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  const {
    petID,
    name,
    species,
    race,
    age,
    gender,
    vaccine_card,
    tags,
    lng,
    lat,
    city,
    country,
  } = req.body;

  const keys = {
    name,
    species,
    race,
    age,
    gender,
    vaccine_card,
    tags,
    lng,
    lat,
    city,
    country,
  };

  locationArr = [lng, lat, city, country];
  locationArr.map((value) => {
    if (value === undefined || value == "") {
      keys["lng"] = "";
      keys["lat"] = "";
      keys["city"] = "";
      keys["country"] = "";
    }
  });

  const updateKeys = {};
  try {
    if (!ObjectId.isValid(petID) || String(new ObjectId(petID)) !== petID) {
      throw Error("unvalid petID");
    }

    for (key in keys) {
      if (keys.hasOwnProperty(key) && keys[key] !== undefined) {
        if (
          key == "species" ||
          key == "lng" ||
          key == "lat" ||
          key == "city" ||
          key == "country"
        ) {
          if (keys[key] === null || keys[key] == "") {
            continue;
          }
        }
        if (key == "tags" && keys[key] === "") {
          keys["tags"] = [];
        }
        updateKeys[key] = keys[key];
      }
    }

    const ownerID = await jwtMiddleware.jwtVerifier(token, secret);
    if (ownerID) {
      Pet.findOneAndUpdate(
        { _id: petID, ownerID: ownerID },
        updateKeys,
        (err, docs) => {
          if (err) throw Error(err);
          res.status(200).json({ docs, update: true });
        }
      );
    } else {
      throw Error("unvalid jwt token");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

module.exports.geoQuery_post = async (req, res) => {
  const { lng, lat } = req.body;

  try {
    Pet.find()
      .where("lng")
      .gte(lng[0])
      .lt(lng[1])
      .where("lat")
      .gte(lat[0])
      .lt(lat[1])
      .exec((err, pets) => {
        if (err) throw Err(err);
        res.status(200).json(pets);
      });
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

module.exports.filterQueryPet_get = async (req, res) => {
  try {
    if (Object.keys(req.query).length === 0) {
      res.status(200).json({ message: "nothing to search" });
    } else {
      const {
        lng_min,
        lng_max,
        lat_min,
        lat_max,
        city,
        country,
        species,
        race,
        age_min,
        age_max,
        gender,
        vaccine_card,
        tags,
      } = req.query;
      regFilters = { city, country, species, gender };
      otherFilters = { race, vaccine_card, tags };
      console.log(regFilters);
      let conditions = {};
      //add conditions with regexp
      for (var key in regFilters) {
        if (regFilters.hasOwnProperty(key) && regFilters[key] !== undefined) {
          conditions[key] = new RegExp("^" + regFilters[key] + "$", "i");
        }
      }
      //add conditions for geo coordinates
      if (lng_min && lat_min) {
        conditions["lng"] = { $gte: lng_min, $lt: lng_max };
        conditions["lat"] = { $gte: lat_min, $lt: lat_max };
      }
      //add age range conditions
      if (age_min && age_max) {
        conditions["age"] = { $gte: age_min, $lte: age_max };
      }
      // add none string value conditions
      if (otherFilters) {
        for (key in otherFilters) {
          if (otherFilters[key] !== undefined) {
            conditions[key] = { $in: otherFilters[key] };
          }
        }
      }
      Pet.find(conditions).exec((err, pets) => {
        if (err) throw Error(err);
        res.status(200).json(pets);
      });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

module.exports.petDelete_delete = async (req, res) => {
  const { petID } = req.body;
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  try {
    if (!ObjectId.isValid(petID) || String(new ObjectId(petID)) !== petID) {
      throw Error("unvalid petID");
    }

    const ownerID = await jwtMiddleware.jwtVerifier(token, secret);
    if (ownerID) {
      Pet.findOneAndRemove({ _id: petID, ownerID: ownerID }, (err, docs) => {
        if (err) throw Error(err);
        res.status(200).json({ deleted: true });
      });
    } else {
      throw Error("unvalid jwt token");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};
