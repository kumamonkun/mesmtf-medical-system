import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    name: "MESMTF - Medical Expert System",
    short_name: "MESMTF",
    description: "Medical Expert System for Malaria and Typhoid Fever - Ministry of Health and Social Services",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["medical", "health", "productivity"],
    icons: [
      {
        src: "/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any"
      }
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Access the main dashboard",
        url: "/dashboard",
        icons: [
          {
            src: "/icon-96x96.png",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Diagnosis",
        short_name: "Diagnosis",
        description: "AI-powered medical diagnosis",
        url: "/diagnosis",
        icons: [
          {
            src: "/icon-96x96.png",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Patients",
        short_name: "Patients",
        description: "Patient management",
        url: "/patients",
        icons: [
          {
            src: "/icon-96x96.png",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Appointments",
        short_name: "Appointments",
        description: "Appointment scheduling",
        url: "/appointments",
        icons: [
          {
            src: "/icon-96x96.png",
            sizes: "96x96"
          }
        ]
      }
    ]
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
