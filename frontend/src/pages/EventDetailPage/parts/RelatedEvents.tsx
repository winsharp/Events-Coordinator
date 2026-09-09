import {EventCard, EVENTS, SectionHeader} from "../../HomePage/HomePage.tsx";

function RelatedEvents() {
    return (
        <section className="related-container">
            <SectionHeader title="Featured Live Events" linkText="View All Events" />
            <div className="grid-3">
                {EVENTS.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </section>
    );
}

export default RelatedEvents;