import axios from "axios";
import { createContext, useCallback, useContext, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL;


export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  price: number;
  image: string;
  venue: Venue;
};

export type Artist = {
  id: number;
  stageName: string;
  bio: string;
  image: string;
}

export type Venue = {
  id: number;
  name: string;
  city: string;
  capacity: number;
  image: string;
};

type DataContextType = {
  events: Event[];
  venues: Venue[];
  artists: Artist[];
  loadEvents: () => Promise<void>;
  loadVenues: () => Promise<void>;
  loadArtists: () => Promise<void>;
};

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  const loadEvents = useCallback(async () => {
    try {
      const response = await axios.get<Event[]>(`${API_URL}/events`);
      console.log(response.data);
      setEvents(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [events]);

  const loadVenues = useCallback(async () => {
    try {
      const response = await axios.get<Venue[]>(`${API_URL}/venues`);
      console.log(response.data);
      setVenues(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [venues]);

  const loadArtists = useCallback(async () => {
    try {
      const response = await axios.get<Artist[]>(`${API_URL}/artists`);
      console.log(response.data);
      setArtists(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [artists]);

  return (
    <DataContext.Provider
      value={{
        events,
        venues,
        artists,
        loadEvents,
        loadVenues,
        loadArtists
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be inside DataProvider');
  }

  return context;
}