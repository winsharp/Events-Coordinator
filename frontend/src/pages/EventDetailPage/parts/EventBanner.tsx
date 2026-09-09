import type {Event} from "../types/types.ts";

interface EventBannerProps {
    event: Event;
}

function EventBanner({ event }: EventBannerProps) {
    return (
        <div
            className="event-banner"
            style={{
                backgroundImage: `url(${event.banner})`,
            }}
        >
            <div className="event-banner-content">
                <p className="chip">
                    {event.category}
                </p>

                <h1>{event.name}</h1>
            </div>
        </div>
    );
}

export default EventBanner;