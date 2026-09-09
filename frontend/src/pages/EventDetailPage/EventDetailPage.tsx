import { useState } from "react";

import "./EventDetailPage.css";
import EventBanner from "./parts/EventBanner.tsx";
import EventInfo from "./parts/EventInfo.tsx";
import TicketSelector from "./parts/TicketSelector.tsx";
import RelatedEvents from "./parts/RelatedEvents.tsx";

import type {EventDetailPageProps} from "./types/types.ts";

function EventDetailPage({ event }: EventDetailPageProps) {
    const [quantity, setQuantity] = useState(1);
    const [ticketCategory, setTicketCategory] = useState("general");

    const ticketPrice =
        ticketCategory === "general"
            ? event.generalPrice
            : event.vipPrice;

    const ticketSubtotal = ticketPrice * quantity;
    const serviceFee = ticketSubtotal * 0.1;
    const totalPrice = ticketSubtotal + serviceFee;

    return (
        <div id="event-detail-page">
            <EventBanner event={event} />

            <div className="event-content-container">
                <EventInfo event={event} />

                <TicketSelector
                    event={event}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    ticketCategory={ticketCategory}
                    setTicketCategory={setTicketCategory}
                    ticketSubtotal={ticketSubtotal}
                    serviceFee={serviceFee}
                    totalPrice={totalPrice}
                />

                <RelatedEvents />
            </div>
        </div>
    );
}

export default EventDetailPage;