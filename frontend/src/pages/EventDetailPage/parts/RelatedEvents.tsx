import { useData } from "../../../context/DataContext.tsx";
import {EventCard, SectionHeader} from "../../HomePage/HomePage.tsx";

function RelatedEvents() {
    const { events } = useData();
    return (
        <section className="related-container">
            <SectionHeader title="Featured Live Events" linkText="View All Events" />
            <div className="grid-3">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </section>
    );
}

export default RelatedEvents;