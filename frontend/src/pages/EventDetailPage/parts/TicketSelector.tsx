import type {Dispatch, SetStateAction} from "react";

import type {Event} from "../types/types.ts";

interface TicketSelectorProps {
    event: Event;
    quantity: number;
    setQuantity: Dispatch<SetStateAction<number>>;
    ticketCategory: string;
    setTicketCategory: Dispatch<SetStateAction<string>>;
    ticketSubtotal: number;
    serviceFee: number;
    totalPrice: number;
}

interface BuyTicketRequest {
    eventId: number;
    // ticketCategory: string;
    // quantity: number;
}

interface TicketResponse {
    id: number;
    eventId: number;
    eventTitle: string;
    artistStageName: string;
    venueName: string;
    eventDate: string;
    purchasedAt: string;
}

function TicketSelector({
                            event,
                            quantity,
                            setQuantity,
                            ticketCategory,
                            setTicketCategory,
                            ticketSubtotal,
                            serviceFee,
                            totalPrice,
                        }: TicketSelectorProps) {
    const ticketName =
        ticketCategory === "general"
            ? "General Admission"
            : "VIP Pass";

    async function handleBuyTicket() {
        const request: BuyTicketRequest = {
            eventId: event.id,
            // ticketCategory,
            // quantity,
        };

        try {
            const response = await fetch("http://localhost:8080/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error("Failed to buy ticket");
            }

            const ticket: TicketResponse = await response.json();

            console.log(ticket);
        } catch (error) {
            console.error("Error buying ticket:", error);
        }
    }

    return (
        <div className="ticket-category-container">
            <h2>Select Tickets</h2>

            <TicketCategory
                event={event}
                ticketCategory={ticketCategory}
                setTicketCategory={setTicketCategory}
            />

            <TicketQuantity
                quantity={quantity}
                setQuantity={setQuantity}
            />

            <hr />

            <TicketPrice
                quantity={quantity}
                ticketName={ticketName}
                ticketSubtotal={ticketSubtotal}
                serviceFee={serviceFee}
                totalPrice={totalPrice}
            />

            <button
                type="button"
                className="buy-ticket-button"
                onClick={handleBuyTicket}
            >
                Buy Tickets
            </button>

            <AvailableTickets
                availableTickets={event.availableTickets}
            />
        </div>
    );
}

interface TicketCategoryProps {
    event: Event;
    ticketCategory: string;
    setTicketCategory: Dispatch<SetStateAction<string>>;
}

function TicketCategory({
                            event,
                            ticketCategory,
                            setTicketCategory,
                        }: TicketCategoryProps) {
    return (
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
    );
}

interface TicketQuantityProps {
    quantity: number;
    setQuantity: Dispatch<SetStateAction<number>>;
}

function TicketQuantity({
                            quantity,
                            setQuantity,
                        }: TicketQuantityProps) {
    return (
        <div className="ticket-quantity-container">
            <p className="quantity-label">
                Quantity
            </p>

            <div className="ticket-quantity-button-container">
                <button
                    type="button"
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
                    type="button"
                    onClick={() =>
                        setQuantity(quantity + 1)
                    }
                >
                    +
                </button>
            </div>
        </div>
    );
}

interface TicketPriceProps {
    quantity: number;
    ticketName: string;
    ticketSubtotal: number;
    serviceFee: number;
    totalPrice: number;
}

function TicketPrice({
                         quantity,
                         ticketName,
                         ticketSubtotal,
                         serviceFee,
                         totalPrice,
                     }: TicketPriceProps) {
    return (
        <div className="price-container">
            <div className="ticket-container">
                <p className="ticket-primary">
                    {quantity} x {ticketName}
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
    );
}

interface AvailableTicketsProps {
    availableTickets: number;
}

function AvailableTickets({
                              availableTickets,
                          }: AvailableTicketsProps) {
    return (
        <div className="available-status-container">
            <div className="available-status-symbol"></div>

            <p>
                Available tickets:{" "}
                <strong>
                    {availableTickets} remaining
                </strong>
            </p>
        </div>
    );
}

export default TicketSelector;