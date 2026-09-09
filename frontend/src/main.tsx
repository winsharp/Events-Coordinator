import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import EventDetailPage from "./pages/EventDetailPage.tsx";
import artistPfp from "./assets/malcolm-todd.jpeg";
import banner from "./assets/event-banner.png";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*<App />*/}
      <EventDetailPage
          event={{
              id: 1,
              name: "Malcolm Todd: Do That Again Tour",
              category: "R&B",
              description:
                  "Malcolm Todd is a singer, songwriter and guitarist\n" +
                  "                            from Los Angeles. At just 18 years old, he released\n" +
                  "                            a critically-acclaimed EP dubbed Demos Before Prom\n" +
                  "                            that showcases his soulful vocals and production\n" +
                  "                            skills. Todd broke through with his 2024 debut\n" +
                  "                            project, Sweet Boy, followed by his 2025 self-titled\n" +
                  "                            debut album, which earned him widespread critical\n" +
                  "                            acclaim for his sharp songwriting, production and\n" +
                  "                            personal songwriting.",
              banner: banner,
              eventDate: "Wednesday, Oct 21, 2026",
              eventTime: "9:00 PM - 2:00 AM PDT",
              generalPrice: 25,
              vipPrice: 75,
              availableTickets: 142,
              artist: {
                  id: 1,
                  name: "Malcolm Todd",
                  profilePicture: artistPfp,
              },
              venue: {
                  id: 1,
                  name: "Fox Theater",
                  address: "1807 Telegraph Ave",
                  city: "Oakland",
                  state: "CA",
                  country: "94612, US",
              },
          }}
      />
  </StrictMode>,
)
