import { useEffect, useState } from "react";
import { getMyCustomerProfile, type CustomerResponse } from "../../api/customerApi";
import { getMyTickets, type TicketResponse } from "../../api/ticketApi";
import "./CustomerProfilePage.css";

interface TicketGroup {
    eventId: number;
    displayName: string;
    venueName: string;
    eventDate: string;
    quantity: number;
    hasCustomTitle: boolean;
}

function formatDate(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function eventDisplayName(ticket: TicketResponse): string {
    if (ticket.eventTitle) {
        return ticket.eventTitle;
    }
    if (ticket.artistStageName) {
        return `${ticket.artistStageName} @ ${ticket.venueName}`;
    }
    return ticket.venueName;
}

function groupTickets(tickets: TicketResponse[]): TicketGroup[] {
    const groups = new Map<number, TicketGroup>();
    for (const ticket of tickets) {
        const existing = groups.get(ticket.eventId);
        if (existing) {
            existing.quantity += 1;
        } else {
            groups.set(ticket.eventId, {
                eventId: ticket.eventId,
                displayName: eventDisplayName(ticket),
                venueName: ticket.venueName,
                eventDate: ticket.eventDate,
                quantity: 1,
                hasCustomTitle: Boolean(ticket.eventTitle),
            });
        }
    }
    return Array.from(groups.values()).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}

export default function CustomerProfilePage() {
    const [profile, setProfile] = useState<CustomerResponse | null>(null);
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        setIsLoading(true);
        setError(null);
        try {
            const [profileResult, ticketsResult] = await Promise.all([getMyCustomerProfile(), getMyTickets()]);
            setProfile(profileResult);
            setTickets(ticketsResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load your account");
        } finally {
            setIsLoading(false);
        }
    }

    const ticketGroups = groupTickets(tickets);
    const fullName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : "";

    return (
        <div className="customer-profile-page">
            <h1>Your Account</h1>

            {error && <div className="customer-profile-error">{error}</div>}

            {isLoading ? (
                <p className="customer-profile-loading">Loading your account…</p>
            ) : (
                <>
                    <section className="profile-card">
                        <h2>Contact Info</h2>
                        <div className="contact-info-grid">
                            <div className="contact-field">
                                <span className="contact-label">Name</span>
                                <span className="contact-value">{fullName || "—"}</span>
                            </div>
                            <div className="contact-field">
                                <span className="contact-label">Email</span>
                                <span className="contact-value">{profile?.email ?? "—"}</span>
                            </div>
                        </div>
                    </section>

                    <section className="profile-card">
                        <h2>Ticket History</h2>
                        {ticketGroups.length === 0 ? (
                            <p className="tickets-empty">You haven't bought any tickets yet.</p>
                        ) : (
                            <ul className="ticket-list">
                                {ticketGroups.map((group) => (
                                    <li className="ticket-row" key={group.eventId}>
                                        <div className="ticket-row-main">
                                            <span className="ticket-date">{formatDate(group.eventDate)}</span>
                                            <span className="ticket-name">{group.displayName}</span>
                                            {group.hasCustomTitle && <span className="ticket-venue">{group.venueName}</span>}
                                        </div>
                                        <span className="ticket-quantity">{group.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
