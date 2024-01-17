import { useCities } from "../contexts/CitiesContext";
import CountryItem from "./CountryItem";
import Spinner from "./Spinner";
import Message from "./Message";
import styles from "./CountryList.module.css";

function CountryList() {
   const { cities, isLoading } = useCities();

   if (isLoading) return <Spinner />;

   if (!cities.length)
      return (
         <Message message="Add your first city by clicking on a city on a map" />
      );

   const countries = cities.reduce((acc, cur) => {
      if (!acc.map((el) => el.country).includes(cur.country))
         return [...acc, { country: cur.country, emoji: cur.emoji }];
      else return acc;
   }, []);

   return (
      <ul className={styles.countryList}>
         {countries.map((country) => (
            <CountryItem country={country} key={country} />
         ))}
      </ul>
   );
}

export default CountryList;
