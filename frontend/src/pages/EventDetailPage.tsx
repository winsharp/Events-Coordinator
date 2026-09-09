import { useState } from "react";

import calendar from "../assets/calendar.svg";
import location from "../assets/location.png";
import "./EventDetailPage.css";

interface Event {
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

interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
}

interface Artist {
    id: number;
    name: string;
    profilePicture: string;
}

interface EventDetailPageProps {
    event: Event;
}

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
            <div
                className="event-banner"
                style={{ backgroundImage: `url(${event.banner})` }}
            >
                <div className="event-banner-content">
                    <p className="chip">{event.category}</p>
                    <h1>{event.name}</h1>
                </div>
            </div>

            <div className="event-content-container">

                <div className="event-detail-container">

                    <div className="artist-card">
                        <img src={event.artist.profilePicture}></img>
                        <div>
                            <p className="performer-label">
                                Main Performer
                            </p>
                            <p className="performer-name">
                                {event.artist.name}
                            </p>
                        </div>
                    </div>

                    <hr />

                    <div className="event-detail-description-container">
                        <h2>About this Event</h2>
                        <p>{event.description}</p>
                    </div>

                    <hr />

                    <div className="event-time-location-container">
                        <div className="event-detail-card">
                            <img src={calendar}></img>
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
                            <img src={location}></img>
                            <div>
                                <h3>{event.venue.name}</h3>
                                <p className="event-time-location-primary">
                                    {event.venue.address}
                                </p>
                                <p className="event-time-location-secondary">
                                    {event.venue.city}, {event.venue.state}{" "}
                                    {event.venue.country}
                                </p>
                            </div>
                        </div>
                    </div>

                    <iframe
                        className="map"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=-122.275%2C37.805%2C-122.265%2C37.811&layer=mapnik&marker=37.8080%2C-122.2702"
                        style={{ border: "none" }}
                    />

                </div>

                <div className="ticket-category-container">
                    <h2>Select Tickets</h2>

                    <fieldset>
                        <legend>Ticket Category</legend>

                        <div>
                            <input
                                type="radio"
                                id="general"
                                name="ticket-category"
                                value="general"
                                checked={ticketCategory === "general"}
                                onChange={() =>
                                    setTicketCategory("general")
                                }
                            />
                            <label htmlFor="general">
                                <p className="ticket-category-primary">
                                    General Admission
                                </p>
                                <p className="ticket-category-secondary">
                                    ${event.generalPrice.toFixed(2)}
                                </p>
                            </label>
                        </div>

                        <div>
                            <input
                                type="radio"
                                id="vip"
                                name="ticket-category"
                                value="vip"
                                checked={ticketCategory === "vip"}
                                onChange={() =>
                                    setTicketCategory("vip")
                                }
                            />
                            <label htmlFor="vip">
                                <p className="ticket-category-primary">
                                    VIP Pass
                                </p>
                                <p className="ticket-category-secondary">
                                    ${event.vipPrice.toFixed(2)}
                                </p>
                            </label>
                        </div>
                    </fieldset>

                    <div className="ticket-quantity-container">
                        <p className="quantity-label">Quantity</p>

                        <div className="ticket-quantity-button-container">
                            <button
                                onClick={() =>
                                    setQuantity(
                                        Math.max(1, quantity - 1)
                                    )
                                }
                            >
                                -
                            </button>

                            <p className="quantity-value">
                                {quantity}
                            </p>

                            <button
                                onClick={() =>
                                    setQuantity(quantity + 1)
                                }
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <hr />

                    <div className="price-container">
                        <div className="ticket-container">
                            <p className="ticket-primary">
                                {quantity} x{" "}
                                {ticketCategory === "general"
                                    ? "General Admission"
                                    : "VIP Pass"}
                            </p>

                            <p className="ticket-secondary">
                                ${ticketSubtotal.toFixed(2)}
                            </p>
                        </div>

                        <div className="ticket-container">
                            <p className="ticket-primary">
                                Service Fee
                            </p>

                            <p className="ticket-secondary">
                                ${serviceFee.toFixed(2)}
                            </p>
                        </div>

                        <hr className="dashed-line" />

                        <div className="total-price-container">
                            <p className="total-price-label">
                                Total Price
                            </p>

                            <p className="total-price-value">
                                ${totalPrice.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <button className="buy-ticket-button">
                        Buy Tickets
                    </button>

                    <div className="available-status-container">
                        <div className="available-status-symbol"></div>

                        <p>
                            Available tickets:{" "}
                            <strong>
                                {event.availableTickets} remaining
                            </strong>
                        </p>
                    </div>
                </div>

                <div className="related-container">
                    <h2>You Might Also Like</h2>
                    <div>
                        <p>event 1</p>
                        <p>event 1</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default EventDetailPage;