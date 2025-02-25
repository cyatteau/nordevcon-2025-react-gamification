// src/hooks/useDemographicData.js
import { useState, useCallback } from "react";
import { getDemographicData } from "../utils/getDemographicData";
import { useAppContext } from "../AppContext";

const useDemographicData = () => {
  const [demographicData, setDemographicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAppContext();

  const fetchData = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const data = await getDemographicData(latitude, longitude);
      console.log("Demographic data:", data);

      // Build fun facts using the provided formatting style and UK keys.
      const facts = [
        data.TOTPOP_CY && `Total Population 👥: ${data.TOTPOP_CY}`,
        data.TOTHH_CY && `Total Households 🏠: ${data.TOTHH_CY}`,
        data.AVGHHSZ_CY && `Average Household Size: ${data.AVGHHSZ_CY}`,
        data.PPPC_CY && `Purchasing Power Per Capita: ${data.PPPC_CY}`,
        data.MRST01_CY &&
          `Married Adults 💍: ${data.MRST01_CY} are married (out of the ${
            data.TOTPOP_CY - (data.PAGE01_CY + data.PAGE05_CY)
          } who are 15+ years old)`,
        data.EDUC10_CY &&
          `Educated Residents 🎓: ${data.EDUC10_CY} have at least a bachelor's degree (out of the ${
            data.TOTPOP_CY - (data.PAGE01_CY + data.PAGE05_CY)
          } who are 25+ years old)`,
      ].filter(Boolean);

      const newBadges = [];

      // Calculate eligible population for marriage & education (15+)
      const eligiblePopulation = data.TOTPOP_CY - (data.PAGE01_CY + data.PAGE05_CY);

      // Badge: High Marriage Rate (if marriage rate > 80%)
      if (data.MRST01_CY && eligiblePopulation > 0) {
        const marriageRate = (data.MRST01_CY / eligiblePopulation) * 100;
        if (marriageRate > 80) {
          dispatch({ type: "EARN_BADGE", payload: "Marriage Maven" });
          newBadges.push({
            text: "Marriage Maven",
            color: "#e91e63",
            description: "Awarded to areas with an extremely high marriage rate (>80%).",
          });
        }
      }

      // Badge: Scholar Town (if at least 20% have a bachelor's degree)
      if (data.EDUC10_CY && eligiblePopulation > 0) {
        const educationRate = (data.EDUC10_CY / eligiblePopulation) * 100;
        if (educationRate >= 20) {
          dispatch({ type: "EARN_BADGE", payload: "Scholar Town" });
          newBadges.push({
            text: "Scholar Town",
            color: "#3f51b5",
            description: "Awarded to areas where at least 20% of the eligible population have a bachelor's degree.",
          });
        }
      }

      // Badge: Small Households (if average household size is under 2.0)
      if (data.AVGHHSZ_CY && data.AVGHHSZ_CY < 2.0) {
        dispatch({ type: "EARN_BADGE", payload: "Small Households" });
        newBadges.push({
          text: "Small Households",
          color: "#ff5722",
          description: "Awarded to areas where the average household size is less than 2.0.",
        });
      }

      // Badge: High Purchasing Power (if PPPC_CY is above 24000)
      if (data.PPPC_CY && data.PPPC_CY > 24000) {
        dispatch({ type: "EARN_BADGE", payload: "Economic Powerhouse" });
        newBadges.push({
          text: "Economic Powerhouse",
          color: "#4caf50",
          description: "Awarded to areas with purchasing power exceeding 24,000 per capita.",
        });
      }

      // Badge: Population Size based on TOTPOP_CY
      if (data.TOTPOP_CY) {
        const totPop = data.TOTPOP_CY;
        if (totPop < 5000) {
          newBadges.push({
            text: "Small Population Area",
            color: "#4caf50",
            description: "Awarded to areas with a small population size (less than 5,000 people).",
          });
        } else if (totPop >= 5000 && totPop <= 25000) {
          newBadges.push({
            text: "Medium Population Area",
            color: "#ff9800",
            description: "Awarded to areas with a medium population size (5,000 - 25,000 people).",
          });
        } else if (totPop > 25000) {
          newBadges.push({
            text: "Large Population Area",
            color: "#2196f3",
            description: "Awarded to areas with a large population size (more than 25,000 people).",
          });
        }
      }

      setDemographicData({ funFact: facts, badges: newBadges });
      return { funFact: facts, badges: newBadges };
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return { demographicData, loading, error, fetchData };
};

export default useDemographicData;
