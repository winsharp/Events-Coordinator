export interface Event {
    id: number;
    name: string;
    category: string;
    description: string;
    banner: string;
    artist: Artist;
    venue: Venue;
    eventDate: string;
    eventTime: string;
    generalPrice: number;
    vipPrice: number;
    availableTickets: number;
}

export interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
}

export interface Artist {
    id: number;
    name: string;
    profilePicture: string;
}

export interface EventDetailPageProps {
    event: Event;
}