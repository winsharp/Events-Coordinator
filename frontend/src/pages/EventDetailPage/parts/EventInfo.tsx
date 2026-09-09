import calendar from "../../../assets/calendar.svg";
import location from "../../../assets/location.png";

import type {Event} from "../types/types.ts";

interface EventInfoProps {
    event: Event;
}

function EventInfo({ event }: EventInfoProps) {
    return (
        <div className="event-detail-container">
            <ArtistSection event={event} />

            <hr />

            <DescriptionSection event={event} />

            <hr />

            <DateLocationSection event={event} />

            <EventMap />
        </div>
    );
}

function ArtistSection({ event }: EventInfoProps) {
    return (
        <div className="artist-card">
            <img
                src={event.artist.profilePicture}
                alt={event.artist.name}
            />

            <div>
                <p className="performer-label">
                    Main Performer
                </p>

                <p className="performer-name">
                    {event.artist.name}
                </p>
            </div>
        </div>
    );
}

function DescriptionSection({ event }: EventInfoProps) {
    return (
        <div className="event-detail-description-container">
            <h2>About this Event</h2>

            <p>{event.description}</p>
        </div>
    );
}

function DateLocationSection({ event }: EventInfoProps) {
    return (
        <div className="event-time-location-container">
            <div className="event-detail-card">
                <img
                    src={calendar}
                    alt=""
                />

                <div>
                    <h3>Date & Time</h3>

                    <p className="event-time-location-primary">
                        {event.eventDate}
                    </p>

                    <p className="event-time-location-secondary">
                        {event.eventTime}
                    </p>
                </div>
            </div>

            <div className="event-detail-card">
                <img
                    src={location}
                    alt=""
                />

                <div>
                    <h3>{event.venue.name}</h3>

                    <p className="event-time-location-primary">
                        {event.venue.address}
                    </p>

                    <p className="event-time-location-secondary">
                        {event.venue.city},{" "}
                        {event.venue.state}{" "}
                        {event.venue.country}
                    </p>
                </div>
            </div>
        </div>
    );
}

function EventMap() {
    return (
        <iframe
            className="map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-122.275%2C37.805%2C-122.265%2C37.811&layer=mapnik&marker=37.8080%2C-122.2702"
            style={{ border: "none" }}
            title="Event location"
        />
    );
}

export default EventInfo;