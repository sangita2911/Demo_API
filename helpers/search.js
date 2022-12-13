exports.keywordSearch = (params, key = "name") => {
  let finalParams = {};

  if (params.keyword) {
    finalParams[key] = { $regex: params.keyword, $options: "i" };
  }

  if (
    params.dateRange &&
    params.dateRange.start &&
    params.dateRange.end &&
    params.dateRange.start != "" &&
    params.dateRange.end != ""
  ) {
    finalParams.created_at = {
      $gte: new Date(params.dateRange.start),
      $lte: new Date(params.dateRange.end),
    };
  }
  return finalParams;
};

exports.dateRangeSearch = (params) => {
  let finalParams = {};

  if (
    params.dateRange &&
    params.dateRange.start &&
    params.dateRange.end &&
    params.dateRange.start != "" &&
    params.dateRange.end != ""
  ) {
    finalParams.created_at = {
      $gte: new Date(params.dateRange.start),
      $lte: new Date(params.dateRange.end),
    };
  }
  if (params.date && params.date.e) {
    finalParams.created_at = {
      $gte: new Date(params.date.e[0]),
      $lte: new Date(params.date.e[1] ? params.date.e[1] : params.date.e[0]),
    };
  }
  return finalParams;
};

exports.sortByField = (params) => {
  let sort = { created_at: -1 };
  let fields = params.sortByField;
  if (params.sortByField) {
    if (params.sortByField == "name") {
      sort = { name: params.sortByValue };
    } else if (params.sortByField == "created_at") {
      sort = { created_at: params.sortByValue };
    } else {
      sort = { [fields]: params.sortByValue };
    }
  }
  return sort;
};
