import qs from "qs";
import axios from "axios";

import lastFMconfig from "auth/lastFM.json";

export const searchMusic = async (query, tracks = 30) => {
  if (query == "") {
    return [];
  }

  const promise = axios.post(
    "https://ws.audioscrobbler.com/2.0",
    qs.stringify({
      method: "track.search",
      limit: tracks,
      track: query,
      api_key: lastFMconfig.api_key,
      format: "json",
    })
  );

  let result = await promise;

  if (Object.keys(result.data).length !== 0) {
    return result.data.results.trackmatches.track;
  } else {
    return [];
  }
};

export default { searchMusic };
