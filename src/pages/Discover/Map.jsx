

/** 
 * I created this map from the vector embeddings of this words in a high dimensional space.
 * The distance between two words is the euclidean distance between their embeddings.
 * 
 */
const wordDistanceMap = {
    "Heavyweight": {
      "Heavyweight": 0.0,
      "Structured": 1.209137794708505,
      "Neutral Colors": 1.3277896033591274,
      "Monochrome": 1.2395024287200866,
      "Tapered": 1.2373064246607146,
      "Distressed": 1.2921694741639602,
      "Layered": 1.145726389020457,
      "Soft Fabric": 1.347356843312366,
      "Athleisure": 1.136842118717643,
      "Fitted": 1.2460495862664849,
      "Retro Silhouettes": 1.3266762071845748,
      "Earthy Tones": 1.3171484305554417,
      "Slim Fit": 1.22217316680913,
      "High Contrast": 1.2883386355650126,
      "Oversized": 1.137474489670843,
      "Soft Fabric (suede)": 1.3957178631613292,
      "Performance Fabric": 1.3052005617398577
    },
    "Structured": {
      "Heavyweight": 1.209137794708505,
      "Structured": 0.0,
      "Neutral Colors": 1.381293533314268,
      "Monochrome": 1.277835655890859,
      "Tapered": 1.2768171837532816,
      "Distressed": 1.1815443049346224,
      "Layered": 1.0580127019017642,
      "Soft Fabric": 1.2341474015371732,
      "Athleisure": 1.2503665280347602,
      "Fitted": 1.267996081992421,
      "Retro Silhouettes": 1.2140000356819367,
      "Earthy Tones": 1.3640655365047052,
      "Slim Fit": 1.3480994015246603,
      "High Contrast": 1.2466303780099284,
      "Oversized": 1.3173807615903093,
      "Soft Fabric (suede)": 1.3169113772681216,
      "Performance Fabric": 1.1683185225673398
    },
    "Neutral Colors": {
      "Heavyweight": 1.3277896033591274,
      "Structured": 1.381293533314268,
      "Neutral Colors": 0.0,
      "Monochrome": 1.0065294524770592,
      "Tapered": 1.3492175906494233,
      "Distressed": 1.2678529600961423,
      "Layered": 1.2202220486148743,
      "Soft Fabric": 1.236633010155611,
      "Athleisure": 1.3475890350537159,
      "Fitted": 1.305879967632563,
      "Retro Silhouettes": 1.2364966374876312,
      "Earthy Tones": 1.0612734451422192,
      "Slim Fit": 1.375988885683359,
      "High Contrast": 1.1126237341692922,
      "Oversized": 1.3558956639980178,
      "Soft Fabric (suede)": 1.2720548260155462,
      "Performance Fabric": 1.242899660015218
    },
    "Monochrome": {
      "Heavyweight": 1.2395024287200866,
      "Structured": 1.277835655890859,
      "Neutral Colors": 1.0065294524770592,
      "Monochrome": 0.0,
      "Tapered": 1.261290367624334,
      "Distressed": 1.1970849460951953,
      "Layered": 1.0887289039862191,
      "Soft Fabric": 1.1813549030808572,
      "Athleisure": 1.2791147839519754,
      "Fitted": 1.2139476282227268,
      "Retro Silhouettes": 1.1030503742993556,
      "Earthy Tones": 1.0500267075288363,
      "Slim Fit": 1.2931767491950856,
      "High Contrast": 0.9515556891850852,
      "Oversized": 1.1605909617689563,
      "Soft Fabric (suede)": 1.266893949494277,
      "Performance Fabric": 1.185326676035021
    },
    "Tapered": {
      "Heavyweight": 1.2373064246607146,
      "Structured": 1.2768171837532816,
      "Neutral Colors": 1.3492175906494233,
      "Monochrome": 1.261290367624334,
      "Tapered": 0.0,
      "Distressed": 1.28587943855878,
      "Layered": 1.2050501553746924,
      "Soft Fabric": 1.2303173355346109,
      "Athleisure": 1.23390127504757,
      "Fitted": 1.207588053495485,
      "Retro Silhouettes": 1.2919152707939774,
      "Earthy Tones": 1.306384003865326,
      "Slim Fit": 1.2088123407238727,
      "High Contrast": 1.2906679280485887,
      "Oversized": 1.258581122074275,
      "Soft Fabric (suede)": 1.2695798326828214,
      "Performance Fabric": 1.2330926138478437
    },
    "Distressed": {
      "Heavyweight": 1.2921694741639602,
      "Structured": 1.1815443049346224,
      "Neutral Colors": 1.2678529600961423,
      "Monochrome": 1.1970849460951953,
      "Tapered": 1.28587943855878,
      "Distressed": 0.0,
      "Layered": 1.1713652830168333,
      "Soft Fabric": 1.1124738633678177,
      "Athleisure": 1.2423704838364509,
      "Fitted": 1.280396884701306,
      "Retro Silhouettes": 1.2412337537839813,
      "Earthy Tones": 1.2391668548385129,
      "Slim Fit": 1.343090828895242,
      "High Contrast": 1.1603363643859217,
      "Oversized": 1.28622897692012,
      "Soft Fabric (suede)": 1.197411322463928,
      "Performance Fabric": 1.2660573076428758
    },
    "Layered": {
      "Heavyweight": 1.145726389020457,
      "Structured": 1.0580127019017642,
      "Neutral Colors": 1.2202220486148743,
      "Monochrome": 1.0887289039862191,
      "Tapered": 1.2050501553746924,
      "Distressed": 1.1713652830168333,
      "Layered": 0.0,
      "Soft Fabric": 1.1216591709975565,
      "Athleisure": 1.229182214762919,
      "Fitted": 1.1614752485314337,
      "Retro Silhouettes": 1.092023644695046,
      "Earthy Tones": 1.1800312583009434,
      "Slim Fit": 1.2278223288513361,
      "High Contrast": 1.1590154884091592,
      "Oversized": 1.2237045161405582,
      "Soft Fabric (suede)": 1.2091989852634224,
      "Performance Fabric": 1.1000956338104806
    },
    "Soft Fabric": {
      "Heavyweight": 1.347356843312366,
      "Structured": 1.2341474015371732,
      "Neutral Colors": 1.236633010155611,
      "Monochrome": 1.1813549030808572,
      "Tapered": 1.2303173355346109,
      "Distressed": 1.1124738633678177,
      "Layered": 1.1216591709975565,
      "Soft Fabric": 0.0,
      "Athleisure": 1.2932652119009223,
      "Fitted": 1.1785207951805998,
      "Retro Silhouettes": 1.1462568751301248,
      "Earthy Tones": 1.2538476347796805,
      "Slim Fit": 1.2041974328547513,
      "High Contrast": 1.248957492877417,
      "Oversized": 1.2563561171774162,
      "Soft Fabric (suede)": 0.5458372138503399,
      "Performance Fabric": 0.8628248414050769
    },
    "Athleisure": {
      "Heavyweight": 1.136842118717643,
      "Structured": 1.2503665280347602,
      "Neutral Colors": 1.3475890350537159,
      "Monochrome": 1.2791147839519754,
      "Tapered": 1.23390127504757,
      "Distressed": 1.2423704838364509,
      "Layered": 1.229182214762919,
      "Soft Fabric": 1.2932652119009223,
      "Athleisure": 0.0,
      "Fitted": 1.2462980043614762,
      "Retro Silhouettes": 1.2728809001123793,
      "Earthy Tones": 1.2796911473301005,
      "Slim Fit": 1.2365750701997806,
      "High Contrast": 1.248601487455531,
      "Oversized": 1.1491609562775418,
      "Soft Fabric (suede)": 1.319086525374445,
      "Performance Fabric": 1.2635937915623514
    },
    "Fitted": {
      "Heavyweight": 1.2460495862664849,
      "Structured": 1.267996081992421,
      "Neutral Colors": 1.305879967632563,
      "Monochrome": 1.2139476282227268,
      "Tapered": 1.207588053495485,
      "Distressed": 1.280396884701306,
      "Layered": 1.1614752485314337,
      "Soft Fabric": 1.1785207951805998,
      "Athleisure": 1.2462980043614762,
      "Fitted": 0.0,
      "Retro Silhouettes": 1.1676216399176924,
      "Earthy Tones": 1.2734181276900964,
      "Slim Fit": 0.8715068923682739,
      "High Contrast": 1.3067942300042432,
      "Oversized": 1.031460054731158,
      "Soft Fabric (suede)": 1.266559225662153,
      "Performance Fabric": 1.2329590331649363
    },
    "Retro Silhouettes": {
      "Heavyweight": 1.3266762071845748,
      "Structured": 1.2140000356819367,
      "Neutral Colors": 1.2364966374876312,
      "Monochrome": 1.1030503742993556,
      "Tapered": 1.2919152707939774,
      "Distressed": 1.2412337537839813,
      "Layered": 1.092023644695046,
      "Soft Fabric": 1.1462568751301248,
      "Athleisure": 1.2728809001123793,
      "Fitted": 1.1676216399176924,
      "Retro Silhouettes": 0.0,
      "Earthy Tones": 1.1568010945477785,
      "Slim Fit": 1.2009543519340897,
      "High Contrast": 1.169678390191851,
      "Oversized": 1.2009392751837293,
      "Soft Fabric (suede)": 1.2329329442182313,
      "Performance Fabric": 1.0839944089740021
    },
    "Earthy Tones": {
      "Heavyweight": 1.3171484305554417,
      "Structured": 1.3640655365047052,
      "Neutral Colors": 1.0612734451422192,
      "Monochrome": 1.0500267075288363,
      "Tapered": 1.306384003865326,
      "Distressed": 1.2391668548385129,
      "Layered": 1.1800312583009434,
      "Soft Fabric": 1.2538476347796805,
      "Athleisure": 1.2796911473301005,
      "Fitted": 1.2734181276900964,
      "Retro Silhouettes": 1.1568010945477785,
      "Earthy Tones": 0.0,
      "Slim Fit": 1.2795473704707299,
      "High Contrast": 1.1178369714629528,
      "Oversized": 1.3064694187584704,
      "Soft Fabric (suede)": 1.2974317637816548,
      "Performance Fabric": 1.2904118016576929
    },
    "Slim Fit": {
      "Heavyweight": 1.22217316680913,
      "Structured": 1.3480994015246603,
      "Neutral Colors": 1.375988885683359,
      "Monochrome": 1.2931767491950856,
      "Tapered": 1.2088123407238727,
      "Distressed": 1.343090828895242,
      "Layered": 1.2278223288513361,
      "Soft Fabric": 1.2041974328547513,
      "Athleisure": 1.2365750701997806,
      "Fitted": 0.8715068923682739,
      "Retro Silhouettes": 1.2009543519340897,
      "Earthy Tones": 1.2795473704707299,
      "Slim Fit": 0.0,
      "High Contrast": 1.3479649292569722,
      "Oversized": 1.0077084090982884,
      "Soft Fabric (suede)": 1.2633879155483165,
      "Performance Fabric": 1.2802986735533308
    },
    "High Contrast": {
      "Heavyweight": 1.2883386355650126,
      "Structured": 1.2466303780099284,
      "Neutral Colors": 1.1126237341692922,
      "Monochrome": 0.9515556891850852,
      "Tapered": 1.2906679280485887,
      "Distressed": 1.1603363643859217,
      "Layered": 1.1590154884091592,
      "Soft Fabric": 1.248957492877417,
      "Athleisure": 1.248601487455531,
      "Fitted": 1.3067942300042432,
      "Retro Silhouettes": 1.169678390191851,
      "Earthy Tones": 1.1178369714629528,
      "Slim Fit": 1.3479649292569722,
      "High Contrast": 0.0,
      "Oversized": 1.2771931702724868,
      "Soft Fabric (suede)": 1.3143473166235975,
      "Performance Fabric": 1.1907965325141538
    },
    "Oversized": {
      "Heavyweight": 1.137474489670843,
      "Structured": 1.3173807615903093,
      "Neutral Colors": 1.3558956639980178,
      "Monochrome": 1.1605909617689563,
      "Tapered": 1.258581122074275,
      "Distressed": 1.28622897692012,
      "Layered": 1.2237045161405582,
      "Soft Fabric": 1.2563561171774162,
      "Athleisure": 1.1491609562775418,
      "Fitted": 1.031460054731158,
      "Retro Silhouettes": 1.2009392751837293,
      "Earthy Tones": 1.3064694187584704,
      "Slim Fit": 1.0077084090982884,
      "High Contrast": 1.2771931702724868,
      "Oversized": 0.0,
      "Soft Fabric (suede)": 1.3038758850085403,
      "Performance Fabric": 1.2515965891258414
    },
    "Soft Fabric (suede)": {
      "Heavyweight": 1.3957178631613292,
      "Structured": 1.3169113772681216,
      "Neutral Colors": 1.2720548260155462,
      "Monochrome": 1.266893949494277,
      "Tapered": 1.2695798326828214,
      "Distressed": 1.197411322463928,
      "Layered": 1.2091989852634224,
      "Soft Fabric": 0.5458372138503399,
      "Athleisure": 1.319086525374445,
      "Fitted": 1.266559225662153,
      "Retro Silhouettes": 1.2329329442182313,
      "Earthy Tones": 1.2974317637816548,
      "Slim Fit": 1.2633879155483165,
      "High Contrast": 1.3143473166235975,
      "Oversized": 1.3038758850085403,
      "Soft Fabric (suede)": 0.0,
      "Performance Fabric": 0.9894458517577421
    },
    "Performance Fabric": {
      "Heavyweight": 1.3052005617398577,
      "Structured": 1.1683185225673398,
      "Neutral Colors": 1.242899660015218,
      "Monochrome": 1.185326676035021,
      "Tapered": 1.2330926138478437,
      "Distressed": 1.2660573076428758,
      "Layered": 1.1000956338104806,
      "Soft Fabric": 0.8628248414050769,
      "Athleisure": 1.2635937915623514,
      "Fitted": 1.2329590331649363,
      "Retro Silhouettes": 1.0839944089740021,
      "Earthy Tones": 1.2904118016576929,
      "Slim Fit": 1.2802986735533308,
      "High Contrast": 1.1907965325141538,
      "Oversized": 1.2515965891258414,
      "Soft Fabric (suede)": 0.9894458517577421,
      "Performance Fabric": 0.0
    }
  }

  /**
 * Calculates the average Euclidean distance between all pairs of words from sourceList and targetList.
 *
 * @param {string[]} sourceList - Array of word labels (e.g., ["Slim Fit", "High Contrast", "Oversized"]).
 * @param {string[]} targetList - Array of word labels (e.g., ["Distressed", "Layered"]).
 * @returns {number} The average distance between the two groups.
 */
export function calculateGroupProximity(sourceList, targetList) {
    let totalDistance = 0;
    let pairCount = 0;
  
    sourceList.forEach(source => {
      targetList.forEach(target => {
        // Check if the distance exists in the map
        if (wordDistanceMap[source] && wordDistanceMap[source][target] !== undefined) {
          totalDistance += wordDistanceMap[source][target];
          pairCount++;
        } else {
          console.warn(`Distance not found for pair: ${source}, ${target}`);
        }
      });
    });
  
    if (pairCount === 0) {
      console.error("No valid pairs found. Please check the source and target lists.");
      return null;
    }
  
    return totalDistance / pairCount;
  }