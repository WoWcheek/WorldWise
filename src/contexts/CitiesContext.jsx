import {
   useEffect,
   createContext,
   useContext,
   useReducer,
   useCallback
} from "react";

const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

const initialState = {
   cities: [],
   isLoading: false,
   currentCity: {},
   error: ""
};

function reducer(state, action) {
   switch (action.type) {
      case "loading":
         return { ...state, isLoading: true };
      case "cities/loaded":
         return {
            ...state,
            isLoading: false,
            cities: action.paylaod
         };
      case "city/loaded":
         return {
            ...state,
            isLoading: false,
            currentCity: action.paylaod
         };
      case "city/created":
         return {
            ...state,
            isLoading: false,
            cities: [...state.cities, action.paylaod],
            currentCity: action.paylaod
         };
      case "city/deleted":
         return {
            ...state,
            isLoading: false,
            cities: state.cities.filter((city) => city.id !== action.paylaod),
            currentCity: {}
         };
      case "rejected":
         return {
            ...state,
            isLoading: false,
            error: action.paylaod
         };
      default:
         throw new Error("Unknown action type");
   }
}

function CitiesProvider({ children }) {
   const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
      reducer,
      initialState
   );

   useEffect(function () {
      async function fetchCities() {
         dispatch({ type: "loading" });
         try {
            const res = await fetch(`${BASE_URL}/cities`);
            const data = await res.json();
            dispatch({ type: "cities/loaded", paylaod: data });
         } catch {
            dispatch({
               type: "rejected",
               paylaod: "There was an error loading cities."
            });
         }
      }
      fetchCities();
   }, []);

   const getCity = useCallback(
      async function getCity(id) {
         if (Number(id) === currentCity.id) return;
         dispatch({ type: "loading" });
         try {
            const res = await fetch(`${BASE_URL}/cities?id=${id}`);
            const data = await res.json();
            dispatch({ type: "city/loaded", paylaod: data[0] });
         } catch {
            dispatch({
               type: "rejected",
               paylaod: "There was an error loading the city."
            });
         }
      },
      [currentCity.id]
   );

   async function createCity(newCity) {
      dispatch({ type: "loading" });
      try {
         const res = await fetch(`${BASE_URL}/cities`, {
            method: "POST",
            body: JSON.stringify(newCity),
            headers: {
               "Content-Type": "application/json"
            }
         });
         const data = await res.json();
         dispatch({ type: "city/created", paylaod: data });
      } catch {
         dispatch({
            type: "rejected",
            paylaod: "There was an error creating the city."
         });
      }
   }

   async function deleteCity(id) {
      dispatch({ type: "loading" });
      try {
         await fetch(`${BASE_URL}/cities/${id}`, {
            method: "DELETE"
         });
         dispatch({ type: "city/deleted", paylaod: id });
      } catch {
         dispatch({
            type: "rejected",
            paylaod: "There was an error deleting the city."
         });
      }
   }

   return (
      <CitiesContext.Provider
         value={{
            cities,
            isLoading,
            error,
            currentCity,
            getCity,
            createCity,
            deleteCity
         }}
      >
         {children}
      </CitiesContext.Provider>
   );
}

function useCities() {
   const context = useContext(CitiesContext);
   if (context === undefined)
      throw new Error("CitiesContext was used outside the CitiesProvider");
   return context;
}

function flagemojiToPNG(flag) {
   if (!flag) return "";
   const countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt())
      .map((char) => String.fromCharCode(char - 127397).toLowerCase())
      .join("");
   return (
      <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
   );
}

export { CitiesProvider, useCities, flagemojiToPNG };
