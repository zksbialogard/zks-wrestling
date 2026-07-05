type Event = {
  id: string;
  title: string;
  event_date: string;
  location: string;
  registration_deadline: string;
};

export default function UpcomingEvents({
  events,
}: {
  events: Event[];
}) {
  return (
    <section className="w-full max-w-7xl px-6 py-20">

      <div className="mb-12 text-center">

        <h2 className="text-5xl font-black text-white">
          Najbliższe
          <span className="text-yellow-400"> zawody</span>
        </h2>

        <p className="mt-4 text-zinc-400 text-lg">
          Sprawdź, gdzie w najbliższym czasie startuje ZKS Białogard.
        </p>

      </div>

      {events.length === 0 ? (

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-12 text-center">

          <h3 className="text-2xl font-bold text-white">
            Brak zaplanowanych zawodów
          </h3>

          <p className="mt-3 text-zinc-500">
            Dodaj pierwsze zawody w panelu administratora.
          </p>

        </div>

      ) : (

        <div className="grid gap-8 lg:grid-cols-3">

          {events.map((event) => (

            <div
              key={event.id}
              className="
                group
                rounded-3xl
                border
                border-yellow-500/10
                bg-zinc-900
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-yellow-500
                hover:shadow-[0_0_40px_rgba(250,204,21,.12)]
              "
            >

              <div className="mb-6">

                <span className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-400">
                  Zapisy otwarte
                </span>

              </div>

              <h3 className="text-2xl font-bold text-white">
                {event.title}
              </h3>

              <div className="mt-6 space-y-3 text-zinc-300">

                <p>
                  📍 {event.location}
                </p>

                <p>
                  📅{" "}
                  {new Date(event.event_date).toLocaleDateString("pl-PL")}
                </p>

                <p className="text-yellow-400">

                  Rejestracja do

                  <br />

                  {new Date(
                    event.registration_deadline
                  ).toLocaleDateString("pl-PL")}

                </p>

              </div>

              <button
                className="
                  mt-8
                  w-full
                  rounded-2xl
                  bg-yellow-500
                  py-4
                  font-bold
                  text-black
                  transition-all
                  hover:scale-105
                "
              >
                Szczegóły
              </button>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}