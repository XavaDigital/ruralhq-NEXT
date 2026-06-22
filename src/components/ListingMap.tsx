"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export interface MapPoint {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

// Google map of the current results. Activates when
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; otherwise shows a placeholder so the
// app still builds/runs without a key.
export function ListingMap({ points }: { points: MapPoint[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-gray-100 text-center text-sm text-muted">
        <div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            className="mx-auto h-10 w-10 text-brand/50"
            aria-hidden
          >
            <path d="M12 21s7-7.75 7-13a7 7 0 1 0-14 0c0 5.25 7 13 7 13z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <p className="mt-2">
            Map — set{" "}
            <code className="text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
            enable
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={{ lat: -41.2, lng: 173.2 }} // centre of NZ
        defaultZoom={5}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="h-full min-h-[300px] w-full"
      >
        {points.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.title}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
