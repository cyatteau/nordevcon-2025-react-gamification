// src/utils/getDemographicData.js
import { queryDemographicData } from "@esri/arcgis-rest-demographics";
import { ApiKeyManager } from "@esri/arcgis-rest-request";

const apiKey =
  "your_key"; // Replace with your actual API key

export const getDemographicData = async (latitude, longitude) => {
  const authentication = ApiKeyManager.fromKey(apiKey);

  try {
    const response = await queryDemographicData({
      studyAreas: [{ geometry: { x: longitude, y: latitude } }],
      dataCollections: ["KeyGlobalFacts"],
      analysisVariables: [
        "15YearIncrements.PAGE01_CY",
        "15YearIncrements.PAGE05_CY",
        "EducationalAttainment.EDUC08_CY",
        "EducationalAttainment.EDUC09_CY",
        "EducationalAttainment.EDUC10_CY",
        "Spending.CS01_CY",
        "Spending.CS04_CY",
        "Spending.CS13_CY",
        "Employment.UNEMP_CY",
        "KeyFacts.MRST01_CY",
        "KeyFacts.MRST02_CY",
        "KeyFacts.MRST03_CY",
        "HouseholdTotals.TOTHH_CY",
        "KeyFacts.TOTPOP_CY",
        "KeyFacts.PP_CY",
        "KeyFacts.PPPRM_CY",
        "KeyFacts.PPPC_CY",
        "HouseholdTotals.AVGHHSZ_CY",
        "Gender.MALES_CY",
        "Gender.FEMALES_CY",
      ],
      authentication,
    });

    if (
      response.results &&
      response.results[0] &&
      response.results[0].value &&
      response.results[0].value.FeatureSet &&
      response.results[0].value.FeatureSet.length > 0 &&
      response.results[0].value.FeatureSet[0].features &&
      response.results[0].value.FeatureSet[0].features.length > 0
    ) {
      const attributes =
        response.results[0].value.FeatureSet[0].features[0].attributes;
      return attributes;
    } else {
      return { message: "No data found for this location." };
    }
  } catch (error) {
    console.error("Failed to fetch demographic data:", error);
    return { message: "Failed to fetch demographic data." };
  }
};
